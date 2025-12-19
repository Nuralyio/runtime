import { Subject, Observable, Subscription } from 'rxjs';
import { share } from 'rxjs/operators';

/**
 * Pending event for batched emission
 */
interface PendingEvent {
  event: string;
  data: any;
}

class EventDispatcher {
  private static instance: EventDispatcher;
  private subjects: { [key: string]: Subject<any> } = {};
  private subscriptions: { [key: string]: Map<Function, Subscription> } = {};

  private globalEventSubject = new Subject<{ eventName: string; data: any }>();
  public readonly allEvents$: Observable<{ eventName: string; data: any }>;

  // Batching state
  private pendingEvents: Map<string, PendingEvent> = new Map();
  private batchScheduled: boolean = false;
  private batchingEnabled: boolean = true;

  // Events that should always be batched (high-frequency property changes)
  private batchableEventPatterns: RegExp[] = [
    /^component-property-changed:/,
    /^microapp:.*:component-property-changed:/,
    /^Vars:/,
    /^microapp:.*:Vars:/,
    /^component:value:set:/,
    /^microapp:.*:component-instance-changed:/
  ];

  private constructor() {
    this.allEvents$ = this.globalEventSubject.asObservable().pipe(share());
  }

  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  private getSubject(event: string): Subject<any> {
    if (!this.subjects[event]) {
      this.subjects[event] = new Subject<any>();
    }
    return this.subjects[event];
  }

  public on(event: string, listener: Function): Subscription {
    if (!this.subscriptions[event]) {
      this.subscriptions[event] = new Map<Function, Subscription>();
    }
    const subscription = this.getSubject(event).subscribe((data) => listener(data));
    this.subscriptions[event].set(listener, subscription);
    return subscription;
  }

  public onAny(listener: (eventName: string, data: any) => void): Subscription {
    return this.allEvents$.subscribe(({ eventName, data }) => listener(eventName, data));
  }

  public off(event: string, listener: Function): void {
    if (!this.subscriptions[event]) return;
    const subscription = this.subscriptions[event].get(listener);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions[event].delete(listener);
    }
  }

  /**
   * Check if an event should be batched based on patterns
   */
  private shouldBatch(event: string): boolean {
    if (!this.batchingEnabled) return false;
    return this.batchableEventPatterns.some(pattern => pattern.test(event));
  }

  /**
   * Flush all pending batched events
   */
  private flushBatch(): void {
    this.batchScheduled = false;

    // Process all pending events
    const events = Array.from(this.pendingEvents.values());
    this.pendingEvents.clear();

    // Emit all batched events
    for (const { event, data } of events) {
      this.emitImmediate(event, data);
    }
  }

  /**
   * Emit an event immediately without batching
   */
  private emitImmediate(event: string, data?: any): void {
    this.getSubject(event).next(data);
    this.globalEventSubject.next({ eventName: event, data });
  }

  /**
   * Emit an event, with automatic batching for high-frequency events.
   *
   * For events matching batchable patterns (property changes, variable updates),
   * multiple rapid emissions are coalesced into a single microtask.
   *
   * This prevents UI jank when many properties are updated in quick succession.
   *
   * @param event - Event name
   * @param data - Event data
   */
  public emit(event: string, data?: any): void {
    // Check if this event should be batched
    if (this.shouldBatch(event)) {
      // Store/overwrite pending event (last value wins for same event)
      this.pendingEvents.set(event, { event, data });

      // Schedule batch flush if not already scheduled
      if (!this.batchScheduled) {
        this.batchScheduled = true;
        queueMicrotask(() => this.flushBatch());
      }
    } else {
      // Emit immediately for non-batchable events
      this.emitImmediate(event, data);
    }
  }

  /**
   * Force immediate emission, bypassing batching.
   * Use this when you need synchronous event delivery.
   *
   * @param event - Event name
   * @param data - Event data
   */
  public emitSync(event: string, data?: any): void {
    this.emitImmediate(event, data);
  }

  /**
   * Enable or disable batching globally.
   * Useful for debugging or when synchronous updates are required.
   *
   * @param enabled - Whether batching should be enabled
   */
  public setBatchingEnabled(enabled: boolean): void {
    this.batchingEnabled = enabled;
  }

  /**
   * Check if batching is currently enabled
   */
  public isBatchingEnabled(): boolean {
    return this.batchingEnabled;
  }

  /**
   * Manually flush any pending batched events.
   * Useful when you need to force updates before an operation.
   */
  public flushPendingEvents(): void {
    if (this.pendingEvents.size > 0) {
      this.flushBatch();
    }
  }
}

export const eventDispatcher = EventDispatcher.getInstance();
