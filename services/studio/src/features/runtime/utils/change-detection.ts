import { Subject, Observable, Subscription } from 'rxjs';
import { share } from 'rxjs/operators';
import { setupChangeDetection } from '../components/ui/components/base/BaseElement/base-change-detection';
class EventDispatcher {
  private static instance: EventDispatcher;
  private subjects: { [key: string]: Subject<any> } = {};
  private subscriptions: { [key: string]: Map<Function, Subscription> } = {};

  private globalEventSubject = new Subject<{ eventName: string; data: any }>();
  public readonly allEvents$: Observable<{ eventName: string; data: any }>;

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

  public emit(event: string, data?: any): void {
    this.getSubject(event).next(data);
    this.globalEventSubject.next({ eventName: event, data });
  }
}

export const eventDispatcher = EventDispatcher.getInstance();
setupChangeDetection();
