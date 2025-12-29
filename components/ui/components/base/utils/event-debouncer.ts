/**
 * @file event-debouncer.ts
 * @description Utility for debouncing and batching event processing
 */

type DebouncedCallback = () => void | Promise<void>;

/**
 * Debouncer utility for event processing
 * Prevents excessive re-processing of handlers when multiple events fire rapidly
 */
export class EventDebouncer {
  private timers = new Map<string, ReturnType<typeof setTimeout>>();
  private defaultDelay: number;

  constructor(defaultDelay = 16) {
    // Default to ~1 frame at 60fps
    this.defaultDelay = defaultDelay;
  }

  /**
   * Debounce a callback by key
   * If called multiple times with same key, only the last call executes
   */
  debounce(key: string, callback: DebouncedCallback, delay?: number): void {
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.timers.delete(key);
      callback();
    }, delay ?? this.defaultDelay);

    this.timers.set(key, timer);
  }

  /**
   * Cancel a pending debounced callback
   */
  cancel(key: string): void {
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
  }

  /**
   * Cancel all pending callbacks
   */
  cancelAll(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  /**
   * Check if a key has a pending callback
   */
  isPending(key: string): boolean {
    return this.timers.has(key);
  }

  /**
   * Get count of pending callbacks
   */
  get pendingCount(): number {
    return this.timers.size;
  }
}

/**
 * Batch processor for child refresh events
 * Collects child IDs and emits refresh events in batches to prevent event storms
 */
export class ChildRefreshBatcher {
  private pendingChildren = new Set<string>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  private emitter: (childId: string) => void;
  private delay: number;

  constructor(emitter: (childId: string) => void, delay = 32) {
    this.emitter = emitter;
    this.delay = delay;
  }

  /**
   * Queue a child for refresh
   */
  queueChild(childId: string): void {
    this.pendingChildren.add(childId);
    this.scheduleFlush();
  }

  /**
   * Queue multiple children for refresh
   */
  queueChildren(childIds: string[]): void {
    for (const id of childIds) {
      this.pendingChildren.add(id);
    }
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.timer) return;

    this.timer = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  /**
   * Immediately flush all pending children
   */
  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const children = Array.from(this.pendingChildren);
    this.pendingChildren.clear();

    // Use requestAnimationFrame for smoother updates
    requestAnimationFrame(() => {
      for (const childId of children) {
        this.emitter(childId);
      }
    });
  }

  /**
   * Cancel all pending refreshes
   */
  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.pendingChildren.clear();
  }

  /**
   * Get count of pending children
   */
  get pendingCount(): number {
    return this.pendingChildren.size;
  }
}

/**
 * Execution guard to prevent re-entrant handler execution
 */
export class ExecutionGuard {
  private executing = new Set<string>();
  private pending = new Map<string, () => any | Promise<any>>();

  /**
   * Try to acquire execution lock
   * Returns true if lock acquired, false if already executing
   */
  tryAcquire(key: string): boolean {
    if (this.executing.has(key)) {
      return false;
    }
    this.executing.add(key);
    return true;
  }

  /**
   * Release execution lock
   */
  release(key: string): void {
    this.executing.delete(key);
  }

  /**
   * Execute callback with guard
   * Prevents re-entrant execution of same key
   */
  async guard<T>(key: string, callback: () => T | Promise<T>): Promise<T | undefined> {
    if (!this.tryAcquire(key)) {
      return undefined;
    }

    try {
      return await callback();
    } finally {
      this.release(key);
    }
  }

  /**
   * Execute callback with guard, queuing the latest pending request
   * If a request comes in while executing, it queues the latest one
   * and executes it after the current one completes (with the newest value)
   *
   * @param key - Unique key for this execution
   * @param callback - The callback to execute
   * @param onResult - Optional callback called with each result (including pending executions)
   * @returns The result, or undefined if queued as pending
   */
  async guardWithPending<T>(
    key: string,
    callback: () => T | Promise<T>,
    onResult?: (result: T) => void
  ): Promise<T | undefined> {
    // If already executing, queue this as pending (replaces any previous pending)
    if (this.executing.has(key)) {
      this.pending.set(key, callback);
      return undefined;
    }

    this.executing.add(key);

    try {
      let result = await callback();
      onResult?.(result);

      // After execution, check if there's a pending request
      while (this.pending.has(key)) {
        const pendingCallback = this.pending.get(key)!;
        this.pending.delete(key);
        // Execute the pending callback to get the latest value
        result = await pendingCallback();
        onResult?.(result);
      }

      return result;
    } finally {
      this.executing.delete(key);
      // Clean up any pending on error
      this.pending.delete(key);
    }
  }

  /**
   * Check if key is currently executing
   */
  isExecuting(key: string): boolean {
    return this.executing.has(key);
  }

  /**
   * Check if key has a pending request
   */
  hasPending(key: string): boolean {
    return this.pending.has(key);
  }

  /**
   * Clear all locks
   */
  clear(): void {
    this.executing.clear();
    this.pending.clear();
  }
}
