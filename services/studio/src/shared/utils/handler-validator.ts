/**
 * @fileoverview Handler Code Validator using AST Analysis
 * @module Shared/Utils/HandlerValidator
 *
 * @description
 * Provides AST-based validation for handler code to prevent malicious code execution,
 * prototype pollution, and unauthorized global access.
 *
 * Uses acorn parser to analyze JavaScript code structure and detect security violations
 * before code is saved or executed.
 */

import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import {
  isForbiddenGlobal,
  isForbiddenProperty,
  isAllowedGlobal,
  isForbiddenFunction,
  getErrorMessage,
} from './handler-security-rules';

/**
 * Validation error details
 */
export interface ValidationError {
  type: 'syntax' | 'forbidden_global' | 'forbidden_property' | 'forbidden_function' | 'unknown_global' | 'forbidden_pattern';
  message: string;
  line?: number;
  column?: number;
  code?: string;
  identifier?: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

/**
 * Context for tracking validation state
 */
interface ValidationContext {
  errors: ValidationError[];
  declaredVariables: Set<string>;
  scopeStack: Array<Set<string>>;
}

/**
 * Validates handler code using AST analysis
 *
 * @param code - The handler code string to validate
 * @returns Validation result with any errors found
 *
 * @example
 * ```typescript
 * const result = validateHandlerCode("return GetVar('count') || 0");
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export function validateHandlerCode(code: string): ValidationResult {
  if (!code || code.trim() === '') {
    return { valid: true, errors: [] };
  }

  const context: ValidationContext = {
    errors: [],
    declaredVariables: new Set(),
    scopeStack: [new Set()],
  };

  try {
    // Parse the code into an AST
    const ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      locations: true,
    });

    // Walk the AST and check for violations
    walkAST(ast, context);

  } catch (error: any) {
    // Syntax errors
    context.errors.push({
      type: 'syntax',
      message: getErrorMessage('syntaxError', error.message),
      line: error.loc?.line,
      column: error.loc?.column,
      code: extractErrorContext(code, error.loc?.line),
    });
  }

  return {
    valid: context.errors.length === 0,
    errors: context.errors,
  };
}

/**
 * Walks the AST and collects validation errors
 */
function walkAST(ast: any, context: ValidationContext): void {
  walk.simple(ast, {
    // Check identifier usage
    Identifier(node: any) {
      checkIdentifier(node, context);
    },

    // Check member expressions (e.g., obj.prop, obj['prop'])
    MemberExpression(node: any) {
      checkMemberExpression(node, context);
    },

    // Check function calls
    CallExpression(node: any) {
      checkCallExpression(node, context);
    },

    // Check new expressions (e.g., new Function())
    NewExpression(node: any) {
      checkNewExpression(node, context);
    },

    // Check dynamic imports
    ImportExpression(node: any) {
      context.errors.push({
        type: 'forbidden_pattern',
        message: "Dynamic 'import()' is not allowed in handlers.",
        line: node.loc?.start.line,
        column: node.loc?.start.column,
      });
    },

    // Track variable declarations to avoid false positives
    VariableDeclaration(node: any) {
      node.declarations.forEach((decl: any) => {
        if (decl.id.type === 'Identifier') {
          getCurrentScope(context).add(decl.id.name);
        }
      });
    },

    // Track function parameters
    FunctionDeclaration(node: any) {
      enterScope(context);
      if (node.id) {
        getCurrentScope(context).add(node.id.name);
      }
      node.params.forEach((param: any) => {
        if (param.type === 'Identifier') {
          getCurrentScope(context).add(param.name);
        }
      });
    },

    FunctionExpression(node: any) {
      enterScope(context);
      if (node.id) {
        getCurrentScope(context).add(node.id.name);
      }
      node.params.forEach((param: any) => {
        if (param.type === 'Identifier') {
          getCurrentScope(context).add(param.name);
        }
      });
    },

    ArrowFunctionExpression(node: any) {
      enterScope(context);
      node.params.forEach((param: any) => {
        if (param.type === 'Identifier') {
          getCurrentScope(context).add(param.name);
        }
      });
    },

    // Track block scope
    BlockStatement(node: any) {
      enterScope(context);
    },
  });
}

/**
 * Checks if an identifier is valid
 */
function checkIdentifier(node: any, context: ValidationContext): void {
  const name = node.name;

  // Skip if it's a declared variable or parameter in any scope
  if (isInAnyScope(name, context)) {
    return;
  }

  // Check if it's a forbidden global
  if (isForbiddenGlobal(name)) {
    context.errors.push({
      type: 'forbidden_global',
      message: getErrorMessage(name),
      line: node.loc?.start.line,
      column: node.loc?.start.column,
      identifier: name,
    });
    return;
  }

  // Check if it's an allowed global (runtime API)
  if (!isAllowedGlobal(name)) {
    // Allow standard JavaScript built-ins and literals
    const standardBuiltins = new Set([
      'undefined', 'null', 'true', 'false', 'NaN', 'Infinity',
      'Object', 'Array', 'String', 'Number', 'Boolean', 'Date',
      'Math', 'JSON', 'RegExp', 'Error', 'Promise',
      'Map', 'Set', 'WeakMap', 'WeakSet',
      'parseInt', 'parseFloat', 'isNaN', 'isFinite',
      'encodeURI', 'decodeURI', 'encodeURIComponent', 'decodeURIComponent',
    ]);

    if (!standardBuiltins.has(name)) {
      context.errors.push({
        type: 'unknown_global',
        message: getErrorMessage('unknownGlobal', name),
        line: node.loc?.start.line,
        column: node.loc?.start.column,
        identifier: name,
      });
    }
  }
}

/**
 * Checks member expressions for forbidden properties
 */
function checkMemberExpression(node: any, context: ValidationContext): void {
  // Check for forbidden property access (e.g., obj.__proto__, obj.prototype)
  if (node.property) {
    const propName = node.property.name || node.property.value;

    if (typeof propName === 'string' && isForbiddenProperty(propName)) {
      context.errors.push({
        type: 'forbidden_property',
        message: getErrorMessage(propName),
        line: node.loc?.start.line,
        column: node.loc?.start.column,
        identifier: propName,
      });
    }
  }

  // Check for computed property access with forbidden names
  if (node.computed && node.property.type === 'Literal') {
    const propValue = node.property.value;
    if (typeof propValue === 'string' && isForbiddenProperty(propValue)) {
      context.errors.push({
        type: 'forbidden_property',
        message: getErrorMessage(propValue),
        line: node.loc?.start.line,
        column: node.loc?.start.column,
        identifier: propValue,
      });
    }
  }
}

/**
 * Checks function calls for forbidden patterns
 */
function checkCallExpression(node: any, context: ValidationContext): void {
  const calleeName = getCalleeName(node.callee);

  if (!calleeName) return;

  // Check for eval() calls
  if (calleeName === 'eval') {
    context.errors.push({
      type: 'forbidden_function',
      message: getErrorMessage('eval'),
      line: node.loc?.start.line,
      column: node.loc?.start.column,
      identifier: 'eval',
    });
    return;
  }

  // Check for setTimeout/setInterval with string argument (acts as eval)
  if (calleeName === 'setTimeout' || calleeName === 'setInterval') {
    if (node.arguments.length > 0 && node.arguments[0].type === 'Literal') {
      context.errors.push({
        type: 'forbidden_function',
        message: getErrorMessage(`${calleeName}_string`),
        line: node.loc?.start.line,
        column: node.loc?.start.column,
        identifier: calleeName,
      });
    }
  }
}

/**
 * Checks new expressions for forbidden constructors
 */
function checkNewExpression(node: any, context: ValidationContext): void {
  const calleeName = getCalleeName(node.callee);

  if (calleeName === 'Function') {
    context.errors.push({
      type: 'forbidden_function',
      message: getErrorMessage('Function'),
      line: node.loc?.start.line,
      column: node.loc?.start.column,
      identifier: 'Function',
    });
  }
}

/**
 * Gets the name of a callee (function being called)
 */
function getCalleeName(callee: any): string | null {
  if (callee.type === 'Identifier') {
    return callee.name;
  }
  if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
    return callee.property.name;
  }
  return null;
}

/**
 * Scope management helpers
 */
function enterScope(context: ValidationContext): void {
  context.scopeStack.push(new Set());
}

function getCurrentScope(context: ValidationContext): Set<string> {
  return context.scopeStack[context.scopeStack.length - 1];
}

function isInAnyScope(name: string, context: ValidationContext): boolean {
  return context.scopeStack.some(scope => scope.has(name));
}

/**
 * Extracts code context around an error line
 */
function extractErrorContext(code: string, line?: number): string | undefined {
  if (!line) return undefined;

  const lines = code.split('\n');
  const errorLine = lines[line - 1];
  return errorLine?.trim();
}

/**
 * Validates all handlers in a component
 *
 * @param component - Component with handlers to validate
 * @returns Validation result for all handlers
 */
export function validateComponentHandlers(component: any): ValidationResult {
  const allErrors: ValidationError[] = [];

  // Validate event handlers
  if (component.event) {
    Object.entries(component.event).forEach(([eventName, code]) => {
      if (typeof code === 'string') {
        const result = validateHandlerCode(code);
        if (!result.valid) {
          result.errors.forEach(error => {
            allErrors.push({
              ...error,
              code: `event.${eventName}: ${error.code || code.split('\n')[0]}`,
            });
          });
        }
      }
    });
  }

  // Validate input handlers
  if (component.inputHandlers) {
    Object.entries(component.inputHandlers).forEach(([inputName, code]) => {
      if (typeof code === 'string') {
        const result = validateHandlerCode(code);
        if (!result.valid) {
          result.errors.forEach(error => {
            allErrors.push({
              ...error,
              code: `inputHandlers.${inputName}: ${error.code || code.split('\n')[0]}`,
            });
          });
        }
      }
    });
  }

  // Validate style handlers
  if (component.styleHandlers) {
    Object.entries(component.styleHandlers).forEach(([styleName, code]) => {
      if (typeof code === 'string') {
        const result = validateHandlerCode(code);
        if (!result.valid) {
          result.errors.forEach(error => {
            allErrors.push({
              ...error,
              code: `styleHandlers.${styleName}: ${error.code || code.split('\n')[0]}`,
            });
          });
        }
      }
    });
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}
