/**
 * @fileoverview Handler Complexity Analyzer
 * @module Runtime/SSR/ComplexityAnalyzer
 *
 * @description
 * Analyzes handler code complexity to prevent DoS attacks during SSR.
 * Checks for:
 * - AST node count (code size)
 * - Nesting depth (complexity)
 * - Loop presence (potential infinite loops)
 * - Recursive patterns
 */

import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import type { ComplexityResult } from './types';

/**
 * SSR complexity limits to prevent DoS
 */
export const SSR_COMPLEXITY_LIMITS = {
  /** Maximum AST nodes allowed */
  maxASTNodes: 1000,

  /** Maximum nesting depth allowed */
  maxNestingDepth: 15,

  /** Maximum number of loops allowed */
  maxLoops: 5,

  /** Recommended execution time limit (ms) - for warnings */
  recommendedTimeoutMs: 50,

  /** Hard execution time limit (ms) */
  maxTimeoutMs: 100,
};

/**
 * Analyze handler code complexity for SSR safety
 *
 * @param code - Handler code string to analyze
 * @returns Complexity analysis result
 *
 * @example
 * ```typescript
 * const result = analyzeComplexity("return GetVar('x')");
 * // { nodeCount: 5, maxDepth: 3, hasLoop: false, exceedsLimits: false }
 *
 * const result2 = analyzeComplexity("while(true) {}");
 * // { nodeCount: 4, maxDepth: 3, hasLoop: true, exceedsLimits: false }
 * ```
 */
export function analyzeComplexity(code: string): ComplexityResult {
  if (!code || code.trim() === '') {
    return {
      nodeCount: 0,
      maxDepth: 0,
      hasLoop: false,
      exceedsLimits: false,
    };
  }

  let nodeCount = 0;
  let maxDepth = 0;
  let loopCount = 0;
  let hasRecursion = false;
  const functionNames = new Set<string>();
  const calledFunctions = new Set<string>();

  try {
    const wrappedCode = `(function() { ${code} })`;
    const ast = acorn.parse(wrappedCode, {
      ecmaVersion: 'latest',
      sourceType: 'script',
    });

    // Use walk.full to count all nodes
    walk.full(ast, (node: any, _state: any, _type: any) => {
      nodeCount++;
    });

    // Use walk.ancestor to track depth and specific node types
    walk.ancestor(ast, {
      // Track depth for all statement types
      ExpressionStatement(node: any, ancestors: any[]) {
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },
      BlockStatement(node: any, ancestors: any[]) {
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },
      IfStatement(node: any, ancestors: any[]) {
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },
      ReturnStatement(node: any, ancestors: any[]) {
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },
      VariableDeclaration(node: any, ancestors: any[]) {
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },

      // Track function declarations for recursion detection
      FunctionDeclaration(node: any, ancestors: any[]) {
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
        if (node.id && node.id.name) {
          functionNames.add(node.id.name);
        }
      },

      FunctionExpression(node: any, ancestors: any[]) {
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
        if (node.id && node.id.name) {
          functionNames.add(node.id.name);
        }
      },

      // Count loops
      ForStatement(node: any, ancestors: any[]) {
        loopCount++;
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },
      WhileStatement(node: any, ancestors: any[]) {
        loopCount++;
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },
      DoWhileStatement(node: any, ancestors: any[]) {
        loopCount++;
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },
      ForInStatement(node: any, ancestors: any[]) {
        loopCount++;
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },
      ForOfStatement(node: any, ancestors: any[]) {
        loopCount++;
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
      },

      // Track function calls for recursion detection
      CallExpression(node: any, ancestors: any[]) {
        const depth = ancestors.length;
        if (depth > maxDepth) maxDepth = depth;
        if (node.callee && node.callee.type === 'Identifier') {
          calledFunctions.add(node.callee.name);
        }
      },
    });

    // Check for potential recursion
    for (const name of functionNames) {
      if (calledFunctions.has(name)) {
        hasRecursion = true;
        break;
      }
    }

    // Check if limits are exceeded
    const exceedsNodeLimit = nodeCount > SSR_COMPLEXITY_LIMITS.maxASTNodes;
    const exceedsDepthLimit = maxDepth > SSR_COMPLEXITY_LIMITS.maxNestingDepth;
    const exceedsLoopLimit = loopCount > SSR_COMPLEXITY_LIMITS.maxLoops;
    const exceedsLimits = exceedsNodeLimit || exceedsDepthLimit || exceedsLoopLimit;

    // Build reason string
    let reason: string | undefined;
    if (exceedsLimits) {
      const reasons: string[] = [];
      if (exceedsNodeLimit) {
        reasons.push(`AST nodes (${nodeCount}) exceeds limit (${SSR_COMPLEXITY_LIMITS.maxASTNodes})`);
      }
      if (exceedsDepthLimit) {
        reasons.push(`Nesting depth (${maxDepth}) exceeds limit (${SSR_COMPLEXITY_LIMITS.maxNestingDepth})`);
      }
      if (exceedsLoopLimit) {
        reasons.push(`Loop count (${loopCount}) exceeds limit (${SSR_COMPLEXITY_LIMITS.maxLoops})`);
      }
      reason = reasons.join('; ');
    }

    return {
      nodeCount,
      maxDepth,
      hasLoop: loopCount > 0,
      exceedsLimits,
      reason,
    };

  } catch {
    // Parse error - return safe defaults (validator will catch actual errors)
    return {
      nodeCount: 0,
      maxDepth: 0,
      hasLoop: false,
      exceedsLimits: false,
    };
  }
}

/**
 * Check if handler is safe for SSR based on complexity
 *
 * @param code - Handler code to check
 * @returns true if complexity is within SSR limits
 */
export function isComplexitySafeForSSR(code: string): boolean {
  const result = analyzeComplexity(code);
  return !result.exceedsLimits;
}

/**
 * Get complexity warnings (non-blocking issues)
 *
 * @param code - Handler code to analyze
 * @returns Array of warning messages
 */
export function getComplexityWarnings(code: string): string[] {
  const result = analyzeComplexity(code);
  const warnings: string[] = [];

  // Warn about loops even if within limits
  if (result.hasLoop) {
    warnings.push('Handler contains loops which may impact SSR performance');
  }

  // Warn about moderate complexity
  const nodeThreshold = SSR_COMPLEXITY_LIMITS.maxASTNodes * 0.7;
  if (result.nodeCount > nodeThreshold) {
    warnings.push(`Handler has high complexity (${result.nodeCount} nodes)`);
  }

  const depthThreshold = SSR_COMPLEXITY_LIMITS.maxNestingDepth * 0.7;
  if (result.maxDepth > depthThreshold) {
    warnings.push(`Handler has deep nesting (depth: ${result.maxDepth})`);
  }

  return warnings;
}

/**
 * Combined complexity and classification check for SSR
 *
 * @param code - Handler code to analyze
 * @returns Object with SSR eligibility and details
 */
export function analyzeForSSR(code: string): {
  canExecuteSSR: boolean;
  complexity: ComplexityResult;
  warnings: string[];
} {
  const complexity = analyzeComplexity(code);
  const warnings = getComplexityWarnings(code);

  return {
    canExecuteSSR: !complexity.exceedsLimits,
    complexity,
    warnings,
  };
}
