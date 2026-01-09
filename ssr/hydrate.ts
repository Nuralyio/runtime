/**
 * @fileoverview Client-Side Hydration
 * @module Runtime/SSR/Hydrate
 *
 * @description
 * Client-side script that hydrates the application from SSR data.
 * Restores variables, component values, and executes pending side effects.
 */

import type { SSRHydrationData, SSRSideEffect, SSRSideEffectType } from './types';

/**
 * SSR data structure embedded in the page
 */
interface SSRData {
  hydration: SSRHydrationData;
  sideEffects: SSRSideEffect[];
  timestamp: number;
}

/**
 * Hydration options
 */
export interface HydrationOptions {
  /** Execute side effects immediately (default: true) */
  executeSideEffects?: boolean;

  /** Log hydration debug info (default: false) */
  debug?: boolean;

  /** Custom side effect executor */
  sideEffectExecutor?: (effect: SSRSideEffect) => void;
}

/**
 * Hydration result
 */
export interface HydrationResult {
  success: boolean;
  variablesRestored: number;
  componentValuesRestored: number;
  sideEffectsExecuted: number;
  errors: string[];
  timing: {
    totalMs: number;
    variableRestoreMs: number;
    sideEffectMs: number;
  };
}

/**
 * Get SSR data from the page
 *
 * @returns SSR data or null if not found
 */
export function getSSRData(): SSRData | null {
  // Check window global (primary method)
  if (typeof window !== 'undefined' && (window as any).__SSR_DATA__) {
    return (window as any).__SSR_DATA__;
  }

  // Check for JSON script tag (fallback)
  if (typeof document !== 'undefined') {
    const scriptTag = document.getElementById('__SSR_HYDRATION_DATA__');
    if (scriptTag?.textContent) {
      try {
        return JSON.parse(scriptTag.textContent);
      } catch {
        console.error('Failed to parse SSR hydration data');
      }
    }
  }

  return null;
}

/**
 * Check if the page was SSR rendered
 */
export function isSSRRendered(): boolean {
  return getSSRData() !== null;
}

/**
 * Hydrate the application from SSR data
 *
 * @param options - Hydration options
 * @returns Hydration result
 *
 * @example
 * ```typescript
 * // In client bootstrap script
 * import { hydrateFromSSR } from '@/features/runtime/ssr/hydrate';
 *
 * const result = hydrateFromSSR({ debug: true });
 * console.log(`Hydrated ${result.variablesRestored} variables`);
 * ```
 */
export function hydrateFromSSR(options: HydrationOptions = {}): HydrationResult {
  const {
    executeSideEffects = true,
    debug = false,
    sideEffectExecutor,
  } = options;

  const startTime = performance.now();
  const errors: string[] = [];
  let variablesRestored = 0;
  let componentValuesRestored = 0;
  let sideEffectsExecuted = 0;
  let variableRestoreMs = 0;
  let sideEffectMs = 0;

  // Get SSR data
  const ssrData = getSSRData();
  if (!ssrData) {
    return {
      success: false,
      variablesRestored: 0,
      componentValuesRestored: 0,
      sideEffectsExecuted: 0,
      errors: ['No SSR data found'],
      timing: { totalMs: 0, variableRestoreMs: 0, sideEffectMs: 0 },
    };
  }

  if (debug) {
    console.log('[SSR Hydrate] Starting hydration from SSR data', ssrData);
  }

  // Restore variables
  const varStart = performance.now();
  try {
    variablesRestored = restoreVariables(ssrData.hydration.variables, debug);
  } catch (error) {
    errors.push(`Failed to restore variables: ${error}`);
  }
  variableRestoreMs = performance.now() - varStart;

  // Restore component values
  try {
    componentValuesRestored = restoreComponentValues(
      ssrData.hydration.componentValues,
      ssrData.hydration.componentInstances,
      debug
    );
  } catch (error) {
    errors.push(`Failed to restore component values: ${error}`);
  }

  // Execute side effects
  const sideEffectStart = performance.now();
  if (executeSideEffects && ssrData.sideEffects.length > 0) {
    try {
      const executor = sideEffectExecutor || defaultSideEffectExecutor;
      for (const effect of ssrData.sideEffects) {
        try {
          executor(effect);
          sideEffectsExecuted++;
        } catch (error) {
          errors.push(`Failed to execute side effect ${effect.type}: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`Side effect execution failed: ${error}`);
    }
  }
  sideEffectMs = performance.now() - sideEffectStart;

  const totalMs = performance.now() - startTime;

  // Mark hydration complete
  if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('ssr-hydration-complete', {
      detail: {
        variablesRestored,
        componentValuesRestored,
        sideEffectsExecuted,
        timing: { totalMs, variableRestoreMs, sideEffectMs },
      },
    }));
  }

  // Clean up SSR data
  if (typeof window !== 'undefined') {
    delete (window as any).__SSR_DATA__;
  }

  if (debug) {
    console.log('[SSR Hydrate] Hydration complete', {
      variablesRestored,
      componentValuesRestored,
      sideEffectsExecuted,
      totalMs,
    });
  }

  return {
    success: errors.length === 0,
    variablesRestored,
    componentValuesRestored,
    sideEffectsExecuted,
    errors,
    timing: { totalMs, variableRestoreMs, sideEffectMs },
  };
}

/**
 * Restore variables to client runtime context
 */
function restoreVariables(variables: Record<string, any>, debug: boolean): number {
  // Dynamically import to avoid SSR issues
  let count = 0;

  try {
    // Access the global ExecuteInstance
    const ExecuteInstance = (globalThis as any).__NURALY_EXECUTE_INSTANCE__;

    if (!ExecuteInstance) {
      if (debug) {
        console.warn('[SSR Hydrate] ExecuteInstance not available yet');
      }
      return 0;
    }

    for (const [key, value] of Object.entries(variables)) {
      try {
        ExecuteInstance.VarsProxy[key] = value;
        count++;
      } catch (error) {
        if (debug) {
          console.error(`[SSR Hydrate] Failed to restore variable ${key}:`, error);
        }
      }
    }
  } catch (error) {
    if (debug) {
      console.error('[SSR Hydrate] Failed to access ExecuteInstance:', error);
    }
  }

  return count;
}

/**
 * Restore component values to client runtime context
 */
function restoreComponentValues(
  componentValues: Record<string, Record<string, any>>,
  componentInstances: Record<string, Record<string, any>>,
  debug: boolean
): number {
  let count = 0;

  try {
    const ExecuteInstance = (globalThis as any).__NURALY_EXECUTE_INSTANCE__;

    if (!ExecuteInstance) {
      return 0;
    }

    // Restore component Instance values
    for (const [componentId, values] of Object.entries(componentInstances)) {
      const component = ExecuteInstance.getComponentByUUID?.(componentId);
      if (component?.Instance) {
        for (const [key, value] of Object.entries(values)) {
          try {
            component.Instance[key] = value;
            count++;
          } catch {
            // Ignore individual value restore errors
          }
        }
      }
    }
  } catch (error) {
    if (debug) {
      console.error('[SSR Hydrate] Failed to restore component values:', error);
    }
  }

  return count;
}

/**
 * Default side effect executor using global functions
 */
function defaultSideEffectExecutor(effect: SSRSideEffect): void {
  const ExecuteInstance = (globalThis as any).__NURALY_EXECUTE_INSTANCE__;

  // Map of side effect types to their executor functions
  const executors: Partial<Record<SSRSideEffectType, (...args: any[]) => void>> = {
    SetVar: (name: string, value: any) => {
      if (ExecuteInstance?.VarsProxy) {
        ExecuteInstance.VarsProxy[name] = value;
      }
    },

    // Navigation side effects - typically we don't replay these
    // as user might have already navigated
    NavigateToPage: () => {
      // Skip - don't auto-navigate
    },
    NavigateToUrl: () => {
      // Skip - don't auto-navigate
    },
    NavigateToHash: () => {
      // Skip - don't auto-navigate
    },

    // UI notifications - replay these
    ShowToast: (...args: any[]) => {
      const globalFns = (globalThis as any).__NURALY_GLOBAL_FUNCTIONS__;
      globalFns?.ShowToast?.(...args);
    },
    ShowSuccessToast: (...args: any[]) => {
      const globalFns = (globalThis as any).__NURALY_GLOBAL_FUNCTIONS__;
      globalFns?.ShowSuccessToast?.(...args);
    },
    ShowErrorToast: (...args: any[]) => {
      const globalFns = (globalThis as any).__NURALY_GLOBAL_FUNCTIONS__;
      globalFns?.ShowErrorToast?.(...args);
    },

    // Most mutations are skipped - they should be re-triggered by handlers
  };

  const executor = executors[effect.type];
  if (executor) {
    executor(...effect.args);
  }
}

/**
 * Wait for SSR hydration to complete
 *
 * @param timeoutMs - Maximum time to wait
 * @returns Promise that resolves when hydration is complete
 */
export function waitForHydration(timeoutMs: number = 5000): Promise<HydrationResult | null> {
  return new Promise((resolve) => {
    // Check if already hydrated
    if (!isSSRRendered()) {
      resolve(null);
      return;
    }

    const timeout = setTimeout(() => {
      document.removeEventListener('ssr-hydration-complete', handler);
      resolve(null);
    }, timeoutMs);

    const handler = (event: Event) => {
      clearTimeout(timeout);
      resolve((event as CustomEvent).detail);
    };

    document.addEventListener('ssr-hydration-complete', handler, { once: true });
  });
}

/**
 * Get the age of SSR data in milliseconds
 *
 * @returns Age in ms or null if no SSR data
 */
export function getSSRDataAge(): number | null {
  const ssrData = getSSRData();
  if (!ssrData?.timestamp) return null;
  return Date.now() - ssrData.timestamp;
}
