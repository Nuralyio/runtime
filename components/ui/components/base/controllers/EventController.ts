/**
 * @file EventController.ts
 * @description Controller for handling component event execution
 * Manages event dispatching and handler execution
 */

import type { ReactiveController } from "lit";
import { getNestedAttribute } from "../../../../../utils/object.utils";
import { executeHandler } from "../../../../../state/runtime-context";
import type { EventHandlerHost, Disposable, EventExecutionOptions } from "../types/base-element.types";

/**
 * Controller responsible for component event handling
 * Extracts event execution logic from BaseElement for better separation of concerns
 */
export class EventController implements ReactiveController, Disposable {
  private host: EventHandlerHost;
  private isConnected = false;

  constructor(host: EventHandlerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.isConnected = true;
    this.executeOnInit();
  }

  hostDisconnected(): void {
    this.isConnected = false;
  }

  /**
   * Execute the onInit event handler if present
   */
  executeOnInit(): void {
    const code = getNestedAttribute(this.host.component, "event.onInit");
    if (code) {
      try {
        executeHandler(
          this.host.component,
          code,
          {},
          { ...this.host.item }
        );
      } catch (error) {
        console.error("Error executing onInit handler:", error);
      }
    }
  }

  /**
   * Execute a component event handler
   */
  execute(eventName: string, event?: Event, data: Record<string, any> = {}): void {
    if (!this.isConnected) return;

    const { component, item, uniqueUUID } = this.host;
    const code = component.event?.[eventName];

    if (!code) return;

    try {
      const eventData = {
        ...data,
        event,
      };

      executeHandler(
        { ...component, uniqueUUID },
        getNestedAttribute(component, `event.${eventName}`),
        eventData,
        item
      );
    } catch (error) {
      console.error(`Error executing event "${eventName}":`, error);
    }
  }

  /**
   * Execute multiple events in sequence
   */
  executeMultiple(events: EventExecutionOptions[]): void {
    for (const { eventName, event, data } of events) {
      this.execute(eventName, event, data);
    }
  }

  /**
   * Check if component has a specific event handler
   */
  hasEventHandler(eventName: string): boolean {
    return !!this.host.component.event?.[eventName];
  }

  /**
   * Get list of all event handler names
   */
  getEventHandlerNames(): string[] {
    const events = this.host.component.event;
    if (!events) return [];
    return Object.keys(events).filter((key) => !!events[key]);
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.isConnected = false;
  }
}
