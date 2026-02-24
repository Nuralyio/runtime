/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Throttles a function call to limit execution frequency
 * Useful for performance optimization of frequently called functions
 * 
 * @param func - Function to throttle  
 * @param limit - Milliseconds to limit between calls
 * @returns Throttled function that will execute at most once per limit period
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle((event) => {
 *   console.log('Scroll event:', event);
 * }, 16); // 60fps limit
 * 
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T, 
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Debounces a function call to delay execution until after a period of inactivity
 * Useful for search inputs, resize handlers, etc.
 * 
 * @param func - Function to debounce
 * @param delay - Milliseconds to wait after last call
 * @returns Debounced function that will execute after delay period of inactivity
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300); // Wait 300ms after user stops typing
 * 
 * input.addEventListener('input', (e) => debouncedSearch(e.target.value));
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * RAF (RequestAnimationFrame) throttle for smooth animations
 * Ensures function is called at most once per animation frame
 * 
 * @param func - Function to throttle to animation frames
 * @returns Function that will execute at most once per animation frame
 * 
 * @example
 * ```typescript
 * const rafThrottledUpdate = rafThrottle(() => {
 *   // Expensive DOM updates
 *   updateUI();
 * });
 * 
 * element.addEventListener('mousemove', rafThrottledUpdate);
 * ```
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | undefined;
  return function(this: any, ...args: Parameters<T>) {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      func.apply(this, args);
      rafId = undefined;
    });
  };
}
