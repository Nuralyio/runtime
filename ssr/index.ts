/**
 * @fileoverview SSR Module Exports
 * @module Runtime/SSR
 *
 * @description
 * Server-side rendering support for the Nuraly runtime.
 * Provides request-scoped context, handler execution, and client hydration.
 *
 * @example Server-side usage (Astro)
 * ```typescript
 * import {
 *   createSSRContext,
 *   renderComponentsForSSR,
 *   createHydrationScript,
 * } from '@/features/runtime/ssr';
 *
 * const ctx = createSSRContext({
 *   components,
 *   applications,
 *   pageId,
 *   user: extractUserFromRequest(request),
 * });
 *
 * const ssrResult = await renderComponentsForSSR(ctx);
 * const hydrationScript = createHydrationScript(
 *   ssrResult.hydrationData,
 *   ssrResult.sideEffects
 * );
 * ```
 *
 * @example Client-side usage
 * ```typescript
 * import { hydrateFromSSR, isSSRRendered } from '@/features/runtime/ssr';
 *
 * if (isSSRRendered()) {
 *   const result = hydrateFromSSR({ debug: true });
 *   console.log(`Hydrated ${result.variablesRestored} variables`);
 * }
 * ```
 */

// Types
export type {
  SSRInitialData,
  SSRUser,
  SSRApplication,
  SSRSideEffect,
  SSRSideEffectType,
  SSRExecutionResult,
  SSRResult,
  SSRHydrationData,
  SSRHandlerOptions,
  HandlerClassification,
  HandlerClassificationResult,
  ComplexityResult,
} from './types';

// SSR Runtime Context
export { SSRRuntimeContext } from './SSRRuntimeContext';

// Context Factory
export {
  createSSRContext,
  createSSRContextFromRequest,
  createTestSSRContext,
  extractUserFromRequest,
  detectPlatform,
  type CreateSSRContextOptions,
} from './createSSRContext';

// Handler Execution
export {
  executeSSRHandler,
  executeSSRHandlers,
} from './SSRHandlerExecutor';

// Handler Classification
export {
  classifyHandler,
  classifyHandlers,
  canExecuteInSSR,
  isFullySSRSafe,
  getComponentHandlerSummary,
} from './handler-classifier';

// API Classification
export {
  SSR_SAFE_APIS,
  SSR_SIDE_EFFECT_APIS,
  SSR_CLIENT_ONLY_APIS,
  isSSRSafeAPI,
  isSSRSideEffectAPI,
  isClientOnlyAPI,
  getAllKnownAPIs,
} from './ssr-safe-apis';

// Complexity Analysis
export {
  analyzeComplexity,
  isComplexitySafeForSSR,
  getComplexityWarnings,
  analyzeForSSR,
  SSR_COMPLEXITY_LIMITS,
} from './complexity-analyzer';

// Renderer
export {
  computeComponentInputs,
  computeComponentStyles,
  renderComponentsForSSR,
  serializeHydrationData,
  createHydrationScript,
  getComponentSSRValues,
  getSSRErrors,
} from './renderer';

// Client Hydration
export {
  hydrateFromSSR,
  getSSRData,
  isSSRRendered,
  waitForHydration,
  getSSRDataAge,
  type HydrationOptions,
  type HydrationResult,
} from './hydrate';
