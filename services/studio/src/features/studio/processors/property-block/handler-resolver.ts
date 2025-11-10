/**
 * Handler Resolver
 * Resolves handler references to actual code
 */

export class HandlerResolver {
  /**
   * Resolve handler reference to actual code
   */
  static resolveHandler(
    handler: string | { ref: string; params?: any[] } | undefined,
    handlerLibrary: any
  ): string | undefined {
    if (!handler) return undefined;
    
    // If it's already a string, return as-is (backward compatibility)
    if (typeof handler === 'string') return handler;
    
    // Resolve reference
    const { ref, params = [] } = handler;
    const handlerFn = handlerLibrary[ref];
    
    if (!handlerFn) {
      console.warn(`Handler reference "${ref}" not found in library`);
      return undefined;
    }
    
    // If it's a function, call it with params
    if (typeof handlerFn === 'function') {
      return handlerFn(...params);
    }
    
    // Otherwise return the string directly
    return handlerFn;
  }
}
