/**
 * @file style-cache.ts
 * @description Utility for caching generated CSS strings to avoid regeneration on every render
 */

/**
 * LRU Cache for CSS strings with automatic cleanup
 */
export class StyleCache {
  private cache = new Map<string, string>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  /**
   * Get cached CSS string or generate and cache it
   */
  getOrGenerate(key: string, generator: () => string): string {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key)!;
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }

    const value = generator();
    this.set(key, value);
    return value;
  }

  /**
   * Set a cached value
   */
  set(key: string, value: string): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get value from cache
   */
  get(key: string): string | undefined {
    return this.cache.get(key);
  }

  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Get current cache size
   */
  get size(): number {
    return this.cache.size;
  }
}

/**
 * Global style cache instance for pseudo-state CSS
 */
export const pseudoStyleCache = new StyleCache(200);

/**
 * Generate a cache key from component styles
 */
export function generateStyleCacheKey(componentUuid: string, styles: Record<string, any>): string {
  return `${componentUuid}:${JSON.stringify(styles)}`;
}
