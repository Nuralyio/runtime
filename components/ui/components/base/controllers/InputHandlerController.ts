/**
 * @file InputHandlerController.ts
 * @description Controller for processing component input handlers
 * Matches original BaseElement behavior without debouncing
 */

import type { ReactiveController } from "lit";
import { Subscription } from "rxjs";
import { eventDispatcher } from "../../../../../utils/change-detection";
import Editor from "../../../../../state/editor";
import { isServer } from "../../../../../utils/envirement";
import { addlogDebug } from "../../../../../redux/actions/debug/store";
import type { InputHandlerHost, Disposable } from "../types/base-element.types";
import { traitInputHandler } from "../BaseElement/input-handler.helpers";
import type { StyleHandlerController } from "./StyleHandlerController";

/**
 * Controller responsible for processing input handlers
 * Matches original BaseElement.traitInputsHandlers behavior
 */
export class InputHandlerController implements ReactiveController, Disposable {
  private host: InputHandlerHost;
  private subscription = new Subscription();
  private isConnected = false;

  /** Reference to style controller for coordinated updates */
  styleController: StyleHandlerController | null = null;

  constructor(host: InputHandlerHost) {
    this.host = host;
    host.addController(this);
  }

  /** Set style controller reference */
  setStyleController(controller: StyleHandlerController): void {
    this.styleController = controller;
  }

  hostConnected(): void {
    this.isConnected = true;
    this.setupEventListeners();
  }

  hostDisconnected(): void {
    this.isConnected = false;
    this.dispose();
  }

  /**
   * Set up all event listeners for input refresh triggers
   * Matches original BaseElement subscriptions
   */
  private setupEventListeners(): void {
    const { component, uniqueUUID } = this.host;

    if (!component?.uuid) {
      return;
    }

    // Platform change - reprocess all inputs (from original firstUpdated)
    this.subscription.add(
      eventDispatcher.on("Vars:currentPlatform", () => {
        this.processInputs();
        this.styleController?.processStyles();
      })
    );

    // Component-specific input refresh request (from original firstUpdated)
    this.subscription.add(
      eventDispatcher.on(`component-input-refresh-request:${component.uuid}`, () => {
        this.processInputs();
        this.styleController?.processStyles();
      })
    );

    // Value set events (from original connectedCallback)
    this.subscription.add(
      eventDispatcher.on(`component:value:set:${uniqueUUID}`, () => {
        this.processInputs();
        component.childrenIds?.forEach((childId) => {
          eventDispatcher.emit(`component:request:refresh:${childId}`);
        });
      })
    );

    // Component request refresh (from original connectedCallback)
    this.subscription.add(
      eventDispatcher.on(`component:request:refresh:${component.uuid}`, () => {
        this.processInputs();
        component.childrenIds?.forEach((childId) => {
          eventDispatcher.emit(`component:request:refresh:${childId}`);
        });
      })
    );

    // Property changed event (from original connectedCallback)
    this.subscription.add(
      eventDispatcher.on(`component-property-changed:${String(component.name)}`, () => {
        this.processInputs();
        this.styleController?.processStyles();
        component.childrenIds?.forEach((childId) => {
          eventDispatcher.emit(`component:request:refresh:${childId}`);
        });
      })
    );

    // Component updated event (from original connectedCallback)
    this.subscription.add(
      eventDispatcher.on(`component-updated:${String(component.uuid)}`, () => {
        setTimeout(() => {
          this.processInputs();
          this.styleController?.processStyles();
        }, 0);
      })
    );
  }

  /**
   * Process all component inputs
   * Matches original traitInputsHandlers behavior exactly
   */
  async processInputs(): Promise<void> {
    if (isServer || !this.isConnected) return;

    // Reset errors
    this.host.errors = {};

    const inputs = Editor.getComponentBreakpointInputs(this.host.component);
    if (!inputs) return;

    // Process all inputs in parallel - same as original
    await Promise.all(
      Object.keys(inputs).map((name) =>
        traitInputHandler(this.host, inputs[name], name)
      )
    );

    // Log debug info
    addlogDebug({
      errors: {
        component: {
          ...this.host.component,
          errors: { ...this.host.errors },
        },
      },
    });
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
  }
}
