/**
 * @fileoverview Security Rules for Handler Code Validation
 * @module Shared/Utils/HandlerSecurityRules
 *
 * @description
 * Defines security rules and patterns for validating handler code to prevent
 * malicious code execution, prototype pollution, and unauthorized access.
 */

import { HANDLER_PARAMETERS } from '../handlers/compiler';

/**
 * Forbidden identifiers that should never be accessible in handler code
 */
export const FORBIDDEN_GLOBALS = new Set([
  'eval',
  'Function',
  'window',
  'global',
  'globalThis',
  'process',
  'require',
  '__dirname',
  '__filename',
  'module',
  'exports',
  'self',
  'top',
  'parent',
  'frames',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'XMLHttpRequest',
  'WebSocket',
  'Worker',
  'SharedWorker',
  'ServiceWorker',
  'import', // Dynamic imports
  'importScripts',
]);

/**
 * Forbidden member property names that could lead to prototype pollution
 */
export const FORBIDDEN_PROPERTIES = new Set([
  '__proto__',
  'prototype',
  'constructor',
]);

/**
 * Allowed global identifiers (runtime API parameters)
 * These are the only globals that handlers can access
 * Lazily initialized to avoid circular dependency
 */
let ALLOWED_GLOBALS_CACHE: Set<string> | null = null;

function getAllowedGlobals(): Set<string> {
  if (!ALLOWED_GLOBALS_CACHE) {
    // Use the same parameters as the compiler to ensure consistency
    ALLOWED_GLOBALS_CACHE = new Set(HANDLER_PARAMETERS);
  }
  return ALLOWED_GLOBALS_CACHE;
}

export function getAllowedGlobalsSet(): Set<string> {
  return getAllowedGlobals();
}

/**
 * Forbidden function calls that enable code execution
 */
export const FORBIDDEN_FUNCTIONS = new Set([
  'eval',
  'Function',
  'setTimeout',  // When used with string argument
  'setInterval', // When used with string argument
  'setImmediate',
]);

/**
 * Error messages for different violation types
 */
export const VALIDATION_ERROR_MESSAGES = {
  eval: "Use of 'eval()' is forbidden for security reasons. Use InvokeFunction() to execute server-side functions instead.",
  Function: "Dynamic function creation via 'Function()' constructor is not allowed. Define handler logic directly.",
  setTimeout_string: "Calling 'setTimeout()' with string argument is forbidden (acts as eval). Use a function instead.",
  setInterval_string: "Calling 'setInterval()' with string argument is forbidden (acts as eval). Use a function instead.",
  window: "Access to 'window' object is forbidden. Use provided runtime API instead.",
  global: "Access to 'global' object is forbidden. Use provided runtime API instead.",
  globalThis: "Access to 'globalThis' object is forbidden. Use provided runtime API instead.",
  process: "Access to 'process' object is forbidden in handlers.",
  require: "Use of 'require()' is not allowed. All dependencies must be provided through runtime API.",
  __proto__: "Prototype manipulation via '__proto__' is forbidden for security reasons.",
  prototype: "Direct prototype access is forbidden to prevent prototype pollution.",
  constructor: "Access to 'constructor' property is forbidden to prevent prototype pollution.",
  localStorage: "Direct localStorage access is forbidden. Use GetVar()/SetVar() for state management.",
  sessionStorage: "Direct sessionStorage access is forbidden. Use GetVar()/SetVar() for state management.",
  indexedDB: "Direct indexedDB access is forbidden. Use Database API provided in runtime context.",
  unknownGlobal: (name: string) => {
    const allowedGlobals = getAllowedGlobals();
    return `'${name}' is not available in handler context. Available globals: ${Array.from(allowedGlobals).slice(0, 10).join(', ')}... (${allowedGlobals.size} total)`;
  },
  syntaxError: (message: string) =>
    `Syntax error in handler code: ${message}`,
};

/**
 * Gets a user-friendly error message for a validation violation
 */
export function getErrorMessage(
  type: string,
  identifier?: string
): string {
  if (type === 'unknownGlobal' && identifier) {
    return VALIDATION_ERROR_MESSAGES.unknownGlobal(identifier);
  }

  if (type === 'syntaxError' && identifier) {
    return VALIDATION_ERROR_MESSAGES.syntaxError(identifier);
  }

  return VALIDATION_ERROR_MESSAGES[type] || `Security violation: ${type}`;
}

/**
 * Checks if an identifier is a forbidden global
 */
export function isForbiddenGlobal(name: string): boolean {
  return FORBIDDEN_GLOBALS.has(name);
}

/**
 * Checks if a property name is forbidden (prototype pollution)
 */
export function isForbiddenProperty(name: string): boolean {
  return FORBIDDEN_PROPERTIES.has(name);
}

/**
 * Checks if an identifier is an allowed global
 */
export function isAllowedGlobal(name: string): boolean {
  return getAllowedGlobals().has(name);
}

/**
 * Checks if a function call is forbidden
 */
export function isForbiddenFunction(name: string): boolean {
  return FORBIDDEN_FUNCTIONS.has(name);
}
