/**
 * @file InputHandlerController.ts
 * @description Controller for processing component input handlers
 * Matches original BaseElement behavior without debouncing
 *
 * Enhanced with i18n support:
 * - Subscribes to locale changes
 * - Applies translations after input resolution
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
import { $locale } from "../../../../../state/locale.store";
import { resolveTranslation } from "../../../../../utils/i18n";

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

  /** Unsubscribe function for locale store subscription */
  private localeUnsubscribe: (() => void) | null = null;

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
    this.setupLocaleSubscription();
  }

  hostDisconnected(): void {
    this.isConnected = false;
    this.dispose();
  }

  /**
   * Subscribe to locale changes for i18n support
   * Re-processes all inputs when locale changes to apply translations
   */
  private setupLocaleSubscription(): void {
    // Subscribe to Nanostore locale changes
    this.localeUnsubscribe = $locale.subscribe(() => {
      if (this.isConnected) {
        this.processInputs();
      }
    });
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
        component.children_ids?.forEach((childId) => {
          eventDispatcher.emit(`component:request:refresh:${childId}`);
        });
      })
    );

    // Component request refresh (from original connectedCallback)
    this.subscription.add(
      eventDispatcher.on(`component:request:refresh:${component.uuid}`, () => {
        this.processInputs();
        component.children_ids?.forEach((childId) => {
          eventDispatcher.emit(`component:request:refresh:${childId}`);
        });
      })
    );

    // Property changed event (from original connectedCallback)
    this.subscription.add(
      eventDispatcher.on(`component-property-changed:${String(component.name)}`, () => {
        this.processInputs();
        this.styleController?.processStyles();
        component.children_ids?.forEach((childId) => {
          eventDispatcher.emit(`component:request:refresh:${childId}`);
        });
      })
    );

    // Component updated event (from original connectedCallback)
    // Use SYNC processing for immediate UI updates without lag
    this.subscription.add(
      eventDispatcher.on(`component-updated:${String(component.uuid)}`, () => {
        // Use synchronous processing for immediate feedback
        // This skips async handler execution for performance
        this.processInputsSync();
        this.styleController?.processStylesSync();
      })
    );

    // Selection change - reprocess inputs for components that depend on $selectedComponents
    this.subscription.add(
      eventDispatcher.on("Vars:selectedComponents", () => {
        this.processInputs();
      })
    );

    // Component deleted - reprocess inputs for components that depend on component list (e.g., menu)
    this.subscription.add(
      eventDispatcher.on("component:deleted", () => {
        this.processInputs();
      })
    );

    // Component refresh - reprocess inputs when components are added or structure changes
    this.subscription.add(
      eventDispatcher.on("component:refresh", () => {
        this.processInputs();
      })
    );

    // Preview locale change - reprocess inputs to apply translations for new locale
    this.subscription.add(
      eventDispatcher.on("Vars:previewLocale", () => {
        this.processInputs();
      })
    );
  }

  /**
   * Process all component inputs SYNCHRONOUSLY
   * Only processes static values - skips handler execution for performance
   * Used for rapid updates (e.g., typing in property panel)
   */
  processInputsSync(): void {
    if (isServer || !this.isConnected) return;

    const inputs = Editor.getComponentBreakpointInputs(this.host.component);

    // Process only static inputs synchronously (skip handlers)
    if (inputs) {
      for (const name of Object.keys(inputs)) {
        const input = inputs[name];
        if (!input) continue;

        // Skip handler types - they require async execution
        if (input.type === "handler") continue;

        // Check Instance value first
        const instanceValue = this.host.component?.Instance?.[name];
        if (instanceValue !== undefined) {
          if (this.host.resolvedInputs[name] !== instanceValue) {
            this.host.resolvedInputs[name] = instanceValue;
          }
          continue;
        }

        // Check inputHandlers - skip if present (requires async)
        if (this.host.component?.inputHandlers?.[name]) continue;

        // Process static value synchronously
        const { value } = input;
        if (this.host.resolvedInputs[name] !== value) {
          this.host.resolvedInputs[name] = value;
        }
      }
    }

    // Apply Instance values directly
    const instance = this.host.component?.Instance;
    if (instance) {
      for (const key of Object.keys(instance)) {
        const value = instance[key];
        if (value !== undefined && this.host.resolvedInputs[key] !== value) {
          this.host.resolvedInputs[key] = value;
        }
      }
    }

    // Apply translations
    this.applyTranslations();

    // Trigger re-render
    this.host.requestUpdate();
  }

  /**
   * Process all component inputs
   * Matches original traitInputsHandlers behavior exactly
   * Enhanced with i18n translation support
   */
  async processInputs(): Promise<void> {
    if (isServer || !this.isConnected) return;

    // Reset errors
    this.host.errors = {};

    const inputs = Editor.getComponentBreakpointInputs(this.host.component);

    // Process all defined inputs in parallel - same as original
    if (inputs) {
      await Promise.all(
        Object.keys(inputs).map((name) =>
          traitInputHandler(this.host, inputs[name], name)
        )
      );
    }

    // Apply Instance values directly to resolvedInputs
    // This handles runtime values set via Component.value even when no input is defined
    const instance = this.host.component?.Instance;
    if (instance) {
      // Get all Instance keys and apply them to resolvedInputs
      const instanceKeys = Object.keys(instance);
      for (const key of instanceKeys) {
        const value = instance[key];
        if (value !== undefined && this.host.resolvedInputs[key] !== value) {
          this.host.resolvedInputs[key] = value;
        }
      }
    }

    // Apply translations to resolved inputs (i18n support)
    this.applyTranslations();

    // Trigger re-render since resolvedInputs is mutated, not replaced
    // Lit's @state() only detects reference changes, so we need explicit update
    this.host.requestUpdate();

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
   * Apply translations to resolved inputs based on current locale
   * Called after input resolution in processInputs()
   *
   * For each property in component.translations:
   * - Gets the original resolved value
   * - Resolves the translated value based on current locale
   * - Updates resolvedInputs with translated value
   */
  private applyTranslations(): void {
    const translations = this.host.component?.translations;

    // Skip if no translations defined
    if (!translations || Object.keys(translations).length === 0) {
      return;
    }

    // Apply translation to each property that has translations
    for (const propertyName of Object.keys(translations)) {
      const original = this.host.resolvedInputs[propertyName];

      // Only translate if we have a resolved value
      if (original !== undefined) {
        const translated = resolveTranslation(
          original,
          translations[propertyName]
        );

        // Update resolved input with translated value
        this.host.resolvedInputs[propertyName] = translated;
      }
    }
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.subscription.unsubscribe();
    this.subscription = new Subscription();

    // Clean up locale subscription
    if (this.localeUnsubscribe) {
      this.localeUnsubscribe();
      this.localeUnsubscribe = null;
    }
  }
}
