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
   * Check if key is currently executing
   */
  isExecuting(key: string): boolean {
    return this.executing.has(key);
  }

  /**
   * Clear all locks
   */
  clear(): void {
    this.executing.clear();
  }
}
