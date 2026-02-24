/**
 * @fileoverview Performance Utilities
 * @module Shared/Utils/Performance
 *
 * @description
 * Professional utilities for optimizing performance in event-heavy applications.
 * Provides debounce, throttle, and RAF-based scheduling for efficient handler execution.
 *
 * **Key Features:**
 * - Debouncing: Delay execution until activity stops
 * - Throttling: Limit execution frequency
 * - RAF scheduling: Schedule DOM updates efficiently
 * - Proper cleanup: All utilities support cancellation
 * - TypeScript: Full type safety with generics
 *
 * @example Debounce
 * ```typescript
 * const search = debounce((query: string) => {
 *   console.log('Searching for:', query);
 * }, 300);
 *
 * search('a');
 * search('ab');
 * search('abc'); // Only this fires after 300ms
 *
 * // Cleanup
 * search.cancel();
 * ```
 *
 * @example Throttle
 * ```typescript
 * const onScroll = throttle(() => {
 *   console.log('Scroll position:', window.scrollY);
 * }, 100);
 *
 * window.addEventListener('scroll', onScroll);
 *
 * // Cleanup
 * window.removeEventListener('scroll', onScroll);
 * onScroll.cancel();
 * ```
 */

export type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
  pending: () => boolean;
};

export type ThrottledFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
};

/**
 * Creates a debounced function that delays execution until after `delay` milliseconds
 * have elapsed since the last time it was invoked.
 *
 * @description
 * Perfect for scenarios where you want to wait for user activity to stop before
 * executing an expensive operation (e.g., search-as-you-type, window resize).
 *
 * **How it works:**
 * - First call: Starts a timer
 * - Subsequent calls: Resets the timer
 * - Execution: Only when the timer completes without interruption
 *
 * **Use Cases:**
 * - Search input handlers
 * - Window resize handlers
 * - Form validation
 * - Auto-save functionality
 *
 * @param fn - The function to debounce
 * @param delay - Milliseconds to wait before execution
 * @param options - Configuration options
 * @param options.leading - Execute on the leading edge (default: false)
 * @param options.trailing - Execute on the trailing edge (default: true)
 * @param options.maxWait - Maximum time to wait before forced execution
 * @returns Debounced function with cancel, flush, and pending methods
 *
 * @example Basic Usage
 * ```typescript
 * const saveData = debounce((data: any) => {
 *   console.log('Saving:', data);
 * }, 500);
 *
 * saveData({ name: 'John' });
 * saveData({ name: 'Jane' }); // Previous call cancelled
 * // Only 'Jane' is saved after 500ms
 * ```
 *
 * @example Leading Edge
 * ```typescript
 * const onClick = debounce(() => {
 *   console.log('Button clicked');
 * }, 1000, { leading: true, trailing: false });
 *
 * onClick(); // Executes immediately
 * onClick(); // Ignored (within 1000ms)
 * onClick(); // Ignored (within 1000ms)
 * // After 1000ms, next click will execute immediately again
 * ```
 *
 * @example Max Wait
 * ```typescript
 * const update = debounce((value: string) => {
 *   console.log('Update:', value);
 * }, 500, { maxWait: 2000 });
 *
 * // Even if called continuously, will execute at least every 2 seconds
 * ```
 *
 * @example Cleanup
 * ```typescript
 * const handler = debounce(() => console.log('Hello'), 1000);
 *
 * handler(); // Scheduled
 * handler.cancel(); // Cancelled - will never execute
 *
 * handler(); // Scheduled again
 * handler.flush(); // Execute immediately
 *
 * if (handler.pending()) {
 *   console.log('Execution pending');
 * }
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number;
  } = {}
): DebouncedFunction<T> {
  const { leading = false, trailing = true, maxWait } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let maxWaitTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T> | undefined;

  const invokeFunc = (time: number) => {
    const args = lastArgs!;
    const thisArg = lastThis;

    lastArgs = null;
    lastThis = null;
    lastInvokeTime = time;
    result = fn.apply(thisArg, args);
    return result;
  };

  const startTimer = (pendingFunc: () => void, wait: number) => {
    return setTimeout(pendingFunc, wait);
  };

  const cancelTimer = (id: ReturnType<typeof setTimeout>) => {
    clearTimeout(id);
  };

  const leadingEdge = (time: number) => {
    lastInvokeTime = time;
    timeoutId = startTimer(timerExpired, delay);
    return leading ? invokeFunc(time) : result;
  };

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = delay - timeSinceLastCall;

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting;
  };

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime!;
    const timeSinceLastInvoke = time - lastInvokeTime;

    return (
      lastCallTime === null ||
      timeSinceLastCall >= delay ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    );
  };

  const timerExpired = () => {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return trailingEdge(time);
    }
    timeoutId = startTimer(timerExpired, remainingWait(time));
  };

  const trailingEdge = (time: number) => {
    timeoutId = null;
    if (maxWaitTimeoutId) {
      cancelTimer(maxWaitTimeoutId);
      maxWaitTimeoutId = null;
    }

    if (trailing && lastArgs) {
      return invokeFunc(time);
    }
    lastArgs = null;
    lastThis = null;
    return result;
  };

  const cancel = () => {
    if (timeoutId !== null) {
      cancelTimer(timeoutId);
      timeoutId = null;
    }
    if (maxWaitTimeoutId !== null) {
      cancelTimer(maxWaitTimeoutId);
      maxWaitTimeoutId = null;
    }
    lastInvokeTime = 0;
    lastArgs = null;
    lastCallTime = null;
    lastThis = null;
  };

  const flush = () => {
    if (timeoutId === null && maxWaitTimeoutId === null) {
      return result;
    }
    const time = Date.now();
    return trailingEdge(time);
  };

  const pending = () => {
    return timeoutId !== null || maxWaitTimeoutId !== null;
  };

  const debounced = function (this: any, ...args: Parameters<T>) {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);

    lastArgs = args;
    lastThis = this;
    lastCallTime = time;

    if (isInvoking) {
      if (timeoutId === null) {
        return leadingEdge(lastCallTime);
      }
      if (maxWait !== undefined) {
        timeoutId = startTimer(timerExpired, delay);
        return invokeFunc(lastCallTime);
      }
    }
    if (timeoutId === null) {
      timeoutId = startTimer(timerExpired, delay);
    }
    if (maxWait !== undefined && maxWaitTimeoutId === null) {
      maxWaitTimeoutId = startTimer(() => {
        const time = Date.now();
        invokeFunc(time);
      }, maxWait);
    }
    return result;
  } as DebouncedFunction<T>;

  debounced.cancel = cancel;
  debounced.flush = flush;
  debounced.pending = pending;

  return debounced;
}

/**
 * Creates a throttled function that only executes at most once per `limit` milliseconds.
 *
 * @description
 * Perfect for scenarios where you want to limit how often an expensive operation
 * runs (e.g., scroll handlers, mouse move handlers, resize handlers).
 *
 * **How it works:**
 * - First call: Executes immediately (if leading=true)
 * - Subsequent calls within limit: Ignored or queued
 * - After limit: Next call executes
 *
 * **Use Cases:**
 * - Scroll event handlers
 * - Mouse move/hover handlers
 * - Real-time validation
 * - Rate limiting API calls
 *
 * @param fn - The function to throttle
 * @param limit - Minimum milliseconds between executions
 * @param options - Configuration options
 * @param options.leading - Execute on the leading edge (default: true)
 * @param options.trailing - Execute on the trailing edge (default: true)
 * @returns Throttled function with cancel and flush methods
 *
 * @example Basic Usage
 * ```typescript
 * const logScroll = throttle(() => {
 *   console.log('Scroll Y:', window.scrollY);
 * }, 200);
 *
 * window.addEventListener('scroll', logScroll);
 * // Logs at most once every 200ms, no matter how fast you scroll
 * ```
 *
 * @example Leading/Trailing Control
 * ```typescript
 * // Only leading edge (immediate execution, ignore subsequent)
 * const onClick = throttle(() => {
 *   console.log('Clicked');
 * }, 1000, { leading: true, trailing: false });
 *
 * // Only trailing edge (execute after activity stops)
 * const onInput = throttle((e) => {
 *   console.log('Input:', e.target.value);
 * }, 500, { leading: false, trailing: true });
 * ```
 *
 * @example Hover Handler Optimization
 * ```typescript
 * const onHover = throttle((element: HTMLElement) => {
 *   // Expensive DOM update
 *   updateHoverState(element);
 * }, 50);
 *
 * elements.forEach(el => {
 *   el.addEventListener('mouseenter', () => onHover(el));
 * });
 * ```
 *
 * @example Cleanup
 * ```typescript
 * const handler = throttle(() => console.log('Throttled'), 1000);
 *
 * window.addEventListener('resize', handler);
 *
 * // On component unmount
 * window.removeEventListener('resize', handler);
 * handler.cancel(); // Cancel any pending trailing execution
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
): ThrottledFunction<T> {
  const { leading = true, trailing = true } = options;

  return debounce(fn, limit, {
    leading,
    trailing,
    maxWait: limit,
  }) as ThrottledFunction<T>;
}

/**
 * Schedules a callback to run on the next animation frame.
 * Useful for batching DOM updates and avoiding layout thrashing.
 *
 * @description
 * Uses requestAnimationFrame for optimal performance. Automatically
 * debounces multiple calls within the same frame.
 *
 * **Use Cases:**
 * - DOM measurements and updates
 * - Scroll position updates
 * - Visual state changes
 * - Animation updates
 *
 * @param callback - Function to execute on next frame
 * @returns Cancellation function
 *
 * @example Basic Usage
 * ```typescript
 * const cancel = scheduleRAF(() => {
 *   // Expensive DOM update
 *   element.style.transform = `translateX(${x}px)`;
 * });
 *
 * // Cancel if needed (e.g., component unmounted)
 * cancel();
 * ```
 *
 * @example Batching Multiple Updates
 * ```typescript
 * let rafId: number | null = null;
 * const updates: Array<() => void> = [];
 *
 * function scheduleUpdate(update: () => void) {
 *   updates.push(update);
 *
 *   if (rafId === null) {
 *     rafId = requestAnimationFrame(() => {
 *       updates.forEach(fn => fn());
 *       updates.length = 0;
 *       rafId = null;
 *     });
 *   }
 * }
 *
 * // All these updates execute in a single frame
 * scheduleUpdate(() => el1.style.left = '10px');
 * scheduleUpdate(() => el2.style.top = '20px');
 * scheduleUpdate(() => el3.style.width = '100px');
 * ```
 */
export function scheduleRAF(callback: () => void): () => void {
  const rafId = requestAnimationFrame(callback);
  return () => cancelAnimationFrame(rafId);
}

/**
 * Creates a debounced RAF scheduler that batches updates into animation frames.
 * Combines debouncing with RAF for optimal DOM update performance.
 *
 * @param callback - Function to execute
 * @param delay - Minimum delay between RAF schedules (default: 16ms ~= 60fps)
 * @returns Debounced RAF function with cancel method
 *
 * @example
 * ```typescript
 * const updateLayout = debouncedRAF(() => {
 *   // Expensive layout recalculation
 *   recalculateLayout();
 * }, 50);
 *
 * window.addEventListener('resize', updateLayout);
 *
 * // Cleanup
 * window.removeEventListener('resize', updateLayout);
 * updateLayout.cancel();
 * ```
 */
export function debouncedRAF(
  callback: () => void,
  delay: number = 16
): DebouncedFunction<() => void> {
  let rafId: number | null = null;

  const wrappedCallback = () => {
    rafId = null;
    callback();
  };

  const debounced = debounce(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(wrappedCallback);
  }, delay);

  const originalCancel = debounced.cancel;
  debounced.cancel = () => {
    originalCancel();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  return debounced;
}

/**
 * Creates an AbortController that automatically aborts after a timeout.
 * Useful for implementing request timeouts and cleanup.
 *
 * @param timeoutMs - Milliseconds before auto-abort
 * @returns AbortController instance
 *
 * @example Fetch with Timeout
 * ```typescript
 * const controller = createAbortController(5000);
 *
 * try {
 *   const response = await fetch('/api/data', {
 *     signal: controller.signal
 *   });
 *   const data = await response.json();
 * } catch (error) {
 *   if (error.name === 'AbortError') {
 *     console.log('Request timed out');
 *   }
 * }
 * ```
 *
 * @example Component Lifecycle
 * ```typescript
 * class MyComponent extends LitElement {
 *   private controller?: AbortController;
 *
 *   async connectedCallback() {
 *     super.connectedCallback();
 *     this.controller = createAbortController(10000);
 *
 *     try {
 *       const data = await fetchData(this.controller.signal);
 *       this.data = data;
 *     } catch (error) {
 *       // Handle abort
 *     }
 *   }
 *
 *   disconnectedCallback() {
 *     super.disconnectedCallback();
 *     this.controller?.abort(); // Cancel in-flight requests
 *   }
 * }
 * ```
 */
export function createAbortController(timeoutMs?: number): AbortController {
  const controller = new AbortController();

  if (timeoutMs !== undefined && timeoutMs > 0) {
    setTimeout(() => controller.abort(), timeoutMs);
  }

  return controller;
}

/**
 * Batches multiple function calls into a single execution using RAF.
 * Perfect for optimizing multiple state updates that affect the DOM.
 *
 * @returns Object with schedule and cancel methods
 *
 * @example
 * ```typescript
 * const batcher = createRAFBatcher();
 *
 * // These all execute in a single frame
 * batcher.schedule(() => console.log('Update 1'));
 * batcher.schedule(() => console.log('Update 2'));
 * batcher.schedule(() => console.log('Update 3'));
 *
 * // Cancel all pending updates
 * batcher.cancel();
 * ```
 */
export function createRAFBatcher() {
  let rafId: number | null = null;
  const callbacks: Array<() => void> = [];

  const flush = () => {
    const callbacksToExecute = callbacks.slice();
    callbacks.length = 0;
    rafId = null;

    callbacksToExecute.forEach(cb => {
      try {
        cb();
      } catch (error) {
        console.error('Error in RAF batch callback:', error);
      }
    });
  };

  return {
    schedule: (callback: () => void) => {
      callbacks.push(callback);

      if (rafId === null) {
        rafId = requestAnimationFrame(flush);
      }
    },
    cancel: () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      callbacks.length = 0;
    },
  };
}
