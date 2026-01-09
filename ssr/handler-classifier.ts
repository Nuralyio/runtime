/**
 * @fileoverview Handler Classification for SSR
 * @module Runtime/SSR/HandlerClassifier
 *
 * @description
 * Analyzes handler code using AST to determine SSR compatibility.
 * Classifications:
 * - ssr-safe: Can execute fully on server (read-only operations)
 * - ssr-partial: Has side effects that will be collected
 * - client-only: Should skip on server (async operations, complex logic)
 */

import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import {
  SSR_SIDE_EFFECT_APIS,
  SSR_CLIENT_ONLY_APIS,
} from './ssr-safe-apis';
import type { HandlerClassification, HandlerClassificationResult } from './types';

/**
 * Analyze handler code to determine SSR compatibility
 *
 * @param code - Handler code string to analyze
 * @returns Classification result with details
 *
 * @example
 * ```typescript
 * const result = classifyHandler("return GetVar('count') || 0");
 * // { classification: 'ssr-safe', sideEffectAPIs: [] }
 *
 * const result2 = classifyHandler("SetVar('count', 1)");
 * // { classification: 'ssr-partial', sideEffectAPIs: ['SetVar'] }
 *
 * const result3 = classifyHandler("await InvokeFunction('api')");
 * // { classification: 'client-only', sideEffectAPIs: ['InvokeFunction'], reason: '...' }
 * ```
 */
export function classifyHandler(code: string): HandlerClassificationResult {
  if (!code || code.trim() === '') {
    return { classification: 'ssr-safe', sideEffectAPIs: [] };
  }

  try {
    const wrappedCode = `(async function() { ${code} })`;
    const ast = acorn.parse(wrappedCode, {
      ecmaVersion: 'latest',
      sourceType: 'script',
    });

    const foundSideEffects: string[] = [];
    const foundClientOnly: string[] = [];
    let hasAsyncOperation = false;

    // Use walk.full to catch all node types including AwaitExpression
    walk.full(ast, (node: any) => {
      if (node.type === 'CallExpression') {
        const calleeName = getCalleeName(node.callee);
        if (calleeName) {
          if (SSR_CLIENT_ONLY_APIS.has(calleeName)) {
            foundClientOnly.push(calleeName);
          }
          if (SSR_SIDE_EFFECT_APIS.has(calleeName)) {
            foundSideEffects.push(calleeName);
          }
        }
      } else if (node.type === 'AwaitExpression') {
        hasAsyncOperation = true;
      }
    });

    // Handlers with async operations should be client-only
    if (hasAsyncOperation) {
      return {
        classification: 'client-only',
        sideEffectAPIs: foundSideEffects,
        reason: 'Contains async operations (await expression)',
      };
    }

    // Handlers with client-only APIs should be client-only
    if (foundClientOnly.length > 0) {
      return {
        classification: 'client-only',
        sideEffectAPIs: foundSideEffects,
        reason: `Contains client-only APIs: ${foundClientOnly.join(', ')}`,
      };
    }

    // Handlers with side effects can be partially executed
    if (foundSideEffects.length > 0) {
      return {
        classification: 'ssr-partial',
        sideEffectAPIs: [...new Set(foundSideEffects)], // Dedupe
      };
    }

    // Pure read-only handlers are SSR-safe
    return { classification: 'ssr-safe', sideEffectAPIs: [] };

  } catch (error) {
    // Parse error - let validator handle it, assume safe for classification
    return { classification: 'ssr-safe', sideEffectAPIs: [] };
  }
}

/**
 * Batch classify multiple handlers
 *
 * @param handlers - Map of handler name to code
 * @returns Map of handler name to classification result
 */
export function classifyHandlers(
  handlers: Record<string, string>
): Record<string, HandlerClassificationResult> {
  const results: Record<string, HandlerClassificationResult> = {};

  for (const [name, code] of Object.entries(handlers)) {
    results[name] = classifyHandler(code);
  }

  return results;
}

/**
 * Check if a handler can be executed during SSR
 * (either fully or with side-effect collection)
 *
 * @param code - Handler code to check
 * @returns true if handler can run during SSR
 */
export function canExecuteInSSR(code: string): boolean {
  const result = classifyHandler(code);
  return result.classification !== 'client-only';
}

/**
 * Check if a handler is fully SSR-safe (no side effects)
 *
 * @param code - Handler code to check
 * @returns true if handler has no side effects
 */
export function isFullySSRSafe(code: string): boolean {
  const result = classifyHandler(code);
  return result.classification === 'ssr-safe';
}

/**
 * Extract the name of a function being called from AST node
 */
function getCalleeName(callee: any): string | null {
  if (!callee) return null;

  // Direct function call: GetVar('name')
  if (callee.type === 'Identifier') {
    return callee.name;
  }

  // Method call: Var.get('name') or Nav.toPage('home')
  if (callee.type === 'MemberExpression') {
    // Get the method name
    if (callee.property && callee.property.type === 'Identifier') {
      // Check if it's a namespaced API call
      if (callee.object && callee.object.type === 'Identifier') {
        const namespace = callee.object.name;
        const method = callee.property.name;

        // Map namespaced methods to their equivalent flat APIs
        const namespacedMappings: Record<string, Record<string, string>> = {
          'Var': {
            'set': 'SetVar',
            'get': 'GetVar',
            'setContext': 'SetContextVar',
            'getContext': 'GetContextVar',
          },
          'Nav': {
            'toPage': 'NavigateToPage',
            'toUrl': 'NavigateToUrl',
            'toHash': 'NavigateToHash',
          },
          'UI': {
            'showToast': 'ShowToast',
            'showSuccess': 'ShowSuccessToast',
            'showError': 'ShowErrorToast',
            'openModal': 'OpenModal',
            'closeModal': 'CloseModal',
          },
          'Data': {
            'invoke': 'InvokeFunction',
          },
        };

        const mapping = namespacedMappings[namespace];
        if (mapping && mapping[method]) {
          return mapping[method];
        }
      }

      return callee.property.name;
    }
  }

  return null;
}

/**
 * Get a summary of handler classifications for a component
 *
 * @param component - Component with handlers to analyze
 * @returns Summary of classifications
 */
export function getComponentHandlerSummary(component: any): {
  total: number;
  ssrSafe: number;
  ssrPartial: number;
  clientOnly: number;
  handlers: Record<string, HandlerClassificationResult>;
} {
  const handlers: Record<string, HandlerClassificationResult> = {};
  let ssrSafe = 0;
  let ssrPartial = 0;
  let clientOnly = 0;

  // Classify input handlers
  if (component.input) {
    for (const [key, inputDef] of Object.entries(component.input as Record<string, any>)) {
      if (inputDef && inputDef.type === 'handler' && typeof inputDef.value === 'string') {
        const result = classifyHandler(inputDef.value);
        handlers[`input.${key}`] = result;

        switch (result.classification) {
          case 'ssr-safe': ssrSafe++; break;
          case 'ssr-partial': ssrPartial++; break;
          case 'client-only': clientOnly++; break;
        }
      }
    }
  }

  // Classify event handlers
  if (component.event) {
    for (const [key, code] of Object.entries(component.event as Record<string, any>)) {
      if (typeof code === 'string') {
        const result = classifyHandler(code);
        handlers[`event.${key}`] = result;

        switch (result.classification) {
          case 'ssr-safe': ssrSafe++; break;
          case 'ssr-partial': ssrPartial++; break;
          case 'client-only': clientOnly++; break;
        }
      }
    }
  }

  // Classify style handlers
  if (component.style) {
    for (const [key, styleDef] of Object.entries(component.style as Record<string, any>)) {
      if (styleDef && styleDef.type === 'handler' && typeof styleDef.value === 'string') {
        const result = classifyHandler(styleDef.value);
        handlers[`style.${key}`] = result;

        switch (result.classification) {
          case 'ssr-safe': ssrSafe++; break;
          case 'ssr-partial': ssrPartial++; break;
          case 'client-only': clientOnly++; break;
        }
      }
    }
  }

  return {
    total: ssrSafe + ssrPartial + clientOnly,
    ssrSafe,
    ssrPartial,
    clientOnly,
    handlers,
  };
}
