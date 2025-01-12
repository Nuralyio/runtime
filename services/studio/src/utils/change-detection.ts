class EventDispatcher {
  private static instance: EventDispatcher;
  private events: { [key: string]: Function[] };

  // Private constructor to prevent direct instantiation
  private constructor() {
    this.events = {};
    console.log('constructor')
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
  //console.log('onevent::on', event);
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

  // Emit an event
  public emit(event: string, data?: any): void {
    //console.log('event::', event, data);
    //console.log('event::',this.events,event);

    if (!this.events[event]) return;

    this.events[event].forEach(listener => listener(data));
  }
}

// Export the singleton instance
export const eventDispatcher = EventDispatcher.getInstance();