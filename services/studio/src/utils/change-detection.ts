class EventDispatcher {
  private static instance: EventDispatcher;
  private events: { [key: string]: Function[] };
  private debounceTimers: { [key: string]: NodeJS.Timeout };

  // Private constructor to prevent direct instantiation
  private constructor() {
    this.events = {};
    this.debounceTimers = {};
  }

  // Static method to get the single instance
  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  // Subscribe to an event
  public on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  // Unsubscribe from an event
  public off(event: string, listener: Function): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  // Emit an event with debounce
  public emit(event: string, data?: any, debounceTime: number = 0): void {
    if (!this.events[event]) return;

    // Clear the previous debounce timer if exists
    if (this.debounceTimers[event]) {
      clearTimeout(this.debounceTimers[event]);
    }

    // Set a new debounce timer
    this.debounceTimers[event] = setTimeout(() => {
      this.events[event].forEach(listener => listener(data));
      delete this.debounceTimers[event]; // Cleanup after execution
    }, debounceTime);
  }
}

// Export the singleton instance
export const eventDispatcher = EventDispatcher.getInstance();