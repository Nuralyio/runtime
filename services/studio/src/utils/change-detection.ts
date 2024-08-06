class EventDispatcher {
    events: {};
    constructor() {
        this.events = {};
    }

    // Subscribe to an event
    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    // Unsubscribe from an event
    off(event, listener) {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    // Emit an event
    emit(event, data?) {
        if (!this.events[event]) return;

        this.events[event].forEach(listener => listener(data));
    }
}


export const eventDispatcher = new EventDispatcher();