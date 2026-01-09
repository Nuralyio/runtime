/**
 * @fileoverview SSR Component Renderer
 * @module Runtime/SSR/Renderer
 *
 * @description
 * Renders components for SSR by pre-computing handler values and
 * preparing hydration data for the client.
 */

import type { ComponentElement } from '../redux/store/component/component.interface';
import type { SSRRuntimeContext } from './SSRRuntimeContext';
import type { SSRResult, SSRSideEffect, SSRHydrationData } from './types';
import { executeSSRHandler } from './SSRHandlerExecutor';
import { classifyHandler, canExecuteInSSR } from './handler-classifier';
import { setupRuntimeContext } from '../handlers/context-setup';

/**
 * Pre-compute all input handler values for a component
 *
 * @param context - SSR runtime context
 * @param component - Component to compute inputs for
 * @returns Resolved input values and collected side effects
 */
export function computeComponentInputs(
  context: SSRRuntimeContext,
  component: ComponentElement
): {
  resolvedInputs: Record<string, any>;
  sideEffects: SSRSideEffect[];
} {
  const resolvedInputs: Record<string, any> = {};
  const sideEffects: SSRSideEffect[] = [];

  if (!component.input) {
    return { resolvedInputs, sideEffects };
  }

  // Setup runtime context for this component
  setupRuntimeContext(context, component, {});

  for (const [key, inputDef] of Object.entries(component.input as Record<string, any>)) {
    if (!inputDef) continue;

    if (inputDef.type === 'static') {
      // Static values are used directly
      resolvedInputs[key] = inputDef.value;
    } else if (inputDef.type === 'handler' && typeof inputDef.value === 'string') {
      // Check if handler can run in SSR
      if (canExecuteInSSR(inputDef.value)) {
        const result = executeSSRHandler(
          context,
          component,
          inputDef.value,
          {},
          {},
          { handlerType: 'input' }
        );

        if (result.error) {
          // Use default value on error
          resolvedInputs[key] = inputDef.defaultValue ?? null;
          console.warn(`SSR handler error for ${component.name}.input.${key}:`, result.error);
        } else {
          resolvedInputs[key] = result.value;
        }

        sideEffects.push(...result.sideEffects);
      } else {
        // Client-only handler - use default value
        resolvedInputs[key] = inputDef.defaultValue ?? null;
      }
    } else {
      // Unknown type - pass through
      resolvedInputs[key] = inputDef.value ?? inputDef.defaultValue ?? null;
    }
  }

  return { resolvedInputs, sideEffects };
}

/**
 * Pre-compute all style handler values for a component
 *
 * @param context - SSR runtime context
 * @param component - Component to compute styles for
 * @returns Resolved style values and collected side effects
 */
export function computeComponentStyles(
  context: SSRRuntimeContext,
  component: ComponentElement
): {
  resolvedStyles: Record<string, any>;
  sideEffects: SSRSideEffect[];
} {
  const resolvedStyles: Record<string, any> = {};
  const sideEffects: SSRSideEffect[] = [];

  if (!component.style) {
    return { resolvedStyles, sideEffects };
  }

  // Setup runtime context for this component
  setupRuntimeContext(context, component, {});

  for (const [key, styleDef] of Object.entries(component.style as Record<string, any>)) {
    if (!styleDef) continue;

    if (typeof styleDef === 'string') {
      // Direct string value
      resolvedStyles[key] = styleDef;
    } else if (styleDef.type === 'static') {
      resolvedStyles[key] = styleDef.value;
    } else if (styleDef.type === 'handler' && typeof styleDef.value === 'string') {
      if (canExecuteInSSR(styleDef.value)) {
        const result = executeSSRHandler(
          context,
          component,
          styleDef.value,
          {},
          {},
          { handlerType: 'style' }
        );

        if (result.error) {
          resolvedStyles[key] = styleDef.defaultValue ?? null;
        } else {
          resolvedStyles[key] = result.value;
        }

        sideEffects.push(...result.sideEffects);
      } else {
        resolvedStyles[key] = styleDef.defaultValue ?? null;
      }
    } else {
      resolvedStyles[key] = styleDef.value ?? styleDef;
    }
  }

  return { resolvedStyles, sideEffects };
}

/**
 * Render all components for SSR, computing handler values
 *
 * @param context - SSR runtime context
 * @returns SSR result with hydration data and collected side effects
 */
export async function renderComponentsForSSR(
  context: SSRRuntimeContext
): Promise<SSRResult> {
  const startTime = performance.now();
  let handlerExecutionMs = 0;

  const allSideEffects: SSRSideEffect[] = [];
  const componentValues: Record<string, Record<string, any>> = {};
  const componentInstances: Record<string, Record<string, any>> = {};

  const components = context.getAllComponents();

  // Pre-compute all handler values
  const handlerStart = performance.now();

  for (const component of components) {
    // Compute input handlers
    const { resolvedInputs, sideEffects: inputSideEffects } = computeComponentInputs(
      context,
      component
    );
    componentValues[component.uuid] = resolvedInputs;
    allSideEffects.push(...inputSideEffects);

    // Compute style handlers
    const { resolvedStyles, sideEffects: styleSideEffects } = computeComponentStyles(
      context,
      component
    );
    // Merge styles into resolved values
    componentValues[component.uuid] = {
      ...componentValues[component.uuid],
      __styles__: resolvedStyles,
    };
    allSideEffects.push(...styleSideEffects);

    // Capture component Instance values
    if (component.uniqueUUID) {
      componentInstances[component.uniqueUUID] = context.getComponentValues()[component.uniqueUUID] || {};
    }
  }

  handlerExecutionMs = performance.now() - handlerStart;

  // Build hydration data
  const hydrationData: SSRHydrationData = {
    variables: context.getVariables(),
    componentValues,
    componentInstances,
  };

  const totalMs = performance.now() - startTime;

  return {
    html: '', // HTML rendering is handled by Lit SSR separately
    hydrationData,
    sideEffects: allSideEffects,
    timing: {
      totalMs,
      handlerExecutionMs,
      renderMs: totalMs - handlerExecutionMs,
    },
  };
}

/**
 * Serialize hydration data for embedding in HTML
 *
 * @param hydrationData - Data to serialize
 * @returns JSON string safe for HTML embedding
 */
export function serializeHydrationData(hydrationData: SSRHydrationData): string {
  // Escape special characters for safe HTML embedding
  return JSON.stringify(hydrationData)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Create the hydration script tag content
 *
 * @param hydrationData - Data to embed
 * @param sideEffects - Side effects to replay on client
 * @returns Script tag inner content
 */
export function createHydrationScript(
  hydrationData: SSRHydrationData,
  sideEffects: SSRSideEffect[]
): string {
  const data = {
    hydration: hydrationData,
    sideEffects,
    timestamp: Date.now(),
  };

  return `window.__SSR_DATA__ = ${serializeHydrationData(data as any)};`;
}

/**
 * Get pre-computed values for a specific component
 *
 * @param ssrResult - Result from renderComponentsForSSR
 * @param componentUuid - Component UUID to get values for
 * @returns Pre-computed input values or empty object
 */
export function getComponentSSRValues(
  ssrResult: SSRResult,
  componentUuid: string
): Record<string, any> {
  return ssrResult.hydrationData.componentValues[componentUuid] || {};
}

/**
 * Check if SSR rendering had any errors
 *
 * @param ssrResult - Result from renderComponentsForSSR
 * @returns Array of error side effects
 */
export function getSSRErrors(ssrResult: SSRResult): SSRSideEffect[] {
  return ssrResult.sideEffects.filter(
    effect => effect.type === 'ShowErrorToast' || effect.type === 'ShowWarningToast'
  );
}
