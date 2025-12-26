/**
 * @file InputHandlerController.ts
 * @description Controller for processing component input handlers
 * Handles dynamic input resolution, caching, and debouncing
 */

import type { ReactiveController } from "lit";
import { Subscription } from "rxjs";
import { eventDispatcher } from "../../../../../utils/change-detection";
import { executeHandler } from "../../../../../handlers/handler-executor";
import Editor from "../../../../../state/editor";
import EditorInstance from "../../../../../state/editor";
import { RuntimeHelpers } from "../../../../../utils/runtime-helpers";
import { getNestedAttribute } from "../../../../../utils/object.utils";
import { isServer } from "../../../../../utils/envirement";
import { addlogDebug } from "../../../../../redux/actions/debug/store";
import type { InputHandlerHost, Disposable } from "../types/base-element.types";
import { EventDebouncer, ExecutionGuard, ChildRefreshBatcher } from "../utils/event-debouncer";

/**
 * Controller responsible for processing input handlers
 * Extracts input processing logic from BaseElement for better separation of concerns
 */
export class InputHandlerController implements ReactiveController, Disposable {
  private host: InputHandlerHost;
  private subscription = new Subscription();
  private debouncer = new EventDebouncer(16);
  private executionGuard = new ExecutionGuard();
  private childRefreshBatcher: ChildRefreshBatcher;
  private isConnected = false;

  constructor(host: InputHandlerHost) {
    this.host = host;
    host.addController(this);

    // Set up child refresh batcher
    this.childRefreshBatcher = new ChildRefreshBatcher((childId) => {
      eventDispatcher.emit(`component:request:refresh:${childId}`);
    });
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
   */
  private setupEventListeners(): void {
    const { component, uniqueUUID } = this.host;

    // Guard: component must be defined before setting up listeners
    if (!component?.uuid) {
      return;
    }

    // Platform change - reprocess all inputs
    this.subscription.add(
      eventDispatcher.on("Vars:currentPlatform", () => {
        this.processInputsDebounced();
      })
    );

    // Component-specific input refresh request
    this.subscription.add(
      eventDispatcher.on(
        `component-input-refresh-request:${component.uuid}`,
        () => {
          this.processInputsDebounced();
        }
      )
    );

    // Value set events
    this.subscription.add(
      eventDispatcher.on(`component:value:set:${uniqueUUID}`, () => {
        this.processInputsDebounced();
        this.queueChildRefresh();
      })
    );

    // Component request refresh
    this.subscription.add(
      eventDispatcher.on(`component:request:refresh:${component.uuid}`, () => {
        this.processInputsDebounced();
        this.queueChildRefresh();
      })
    );

    // Property changed event
    this.subscription.add(
      eventDispatcher.on(
        `component-property-changed:${String(component.name)}`,
        () => {
          this.processInputsDebounced();
          this.queueChildRefresh();
        }
      )
    );

    // Component updated event
    this.subscription.add(
      eventDispatcher.on(`component-updated:${String(component.uuid)}`, () => {
        this.debouncer.debounce("component-updated", () => {
          this.processInputs();
        }, 0); // Use setTimeout(0) to defer to next tick
      })
    );

    // Editing mode change - re-run onInit
    this.subscription.add(
      eventDispatcher.on("Vars:currentEditingMode", () => {
        this.executeOnInit();
      })
    );
  }

  /**
   * Queue child refresh with batching to prevent event storms
   */
  private queueChildRefresh(): void {
    const childIds = this.host.component.childrenIds;
    if (childIds?.length) {
      this.childRefreshBatcher.queueChildren(childIds);
    }
  }

  /**
   * Execute onInit handler if present
   */
  private executeOnInit(): void {
    const code = getNestedAttribute(this.host.component, "event.onInit");
    if (code) {
      executeHandler(this.host.component, code, {}, { ...this.host.item });
    }
  }

  /**
   * Process inputs with debouncing
   */
  processInputsDebounced(): void {
    this.debouncer.debounce("process-inputs", () => {
      this.processInputs();
    });
  }

  /**
   * Process all component inputs
   */
  async processInputs(): Promise<void> {
    if (isServer || !this.isConnected) return;

    // Reset errors for this processing cycle
    this.host.errors = {};

    const inputs = Editor.getComponentBreakpointInputs(this.host.component);
    if (!inputs) return;

    // Process all inputs in parallel
    await Promise.all(
      Object.keys(inputs).map((name) =>
        this.processInput(inputs[name], name)
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

    // Trigger re-render
    this.host.requestUpdate();
  }

  /**
   * Process a single input handler
   */
  private async processInput(input: any, inputName: string): Promise<void> {
    if (!input) return;

    const { component, item, inputHandlersValue, callbacks, errors, uniqueUUID } =
      this.host;
    const handlerKey = `${component.uuid || component.name}:${inputName}`;

    // Use execution guard to prevent re-entrant execution
    const result = await this.executionGuard.guard(handlerKey, async () => {
      return this.executeInputHandler(input, inputName);
    });

    if (result === undefined) {
      // Handler was already executing, skip
      return;
    }

    // Update state if value changed
    if (inputHandlersValue[inputName] !== result.value) {
      inputHandlersValue[inputName] = result.value;

      // Update properties proxy
      const proxy =
        (this.host.ExecuteInstance.PropertiesProxy[component.name] ??= {});
      proxy[inputName] = result.value;

      // Call registered callback
      callbacks[inputName]?.(result.value);
    }

    // Track errors
    if (result.error) {
      errors[inputName] = { error: result.error.message };
    }
  }

  /**
   * Execute input handler and return result
   */
  private async executeInputHandler(
    input: any,
    inputName: string
  ): Promise<{ value: any; error?: { message: string } }> {
    const { component, item, uniqueUUID } = this.host;

    // Execute handler if input type is "handler"
    if (input.type === "handler") {
      try {
        const code = input.value;
        if (code) {
          const fn = executeHandler(
            { ...component, uniqueUUID },
            code,
            undefined,
            { ...item }
          );
          const result = RuntimeHelpers.isPromise(fn) ? await fn : fn;
          return { value: result };
        }
        return { value: undefined };
      } catch (error: any) {
        this.logHandlerError(inputName, input.value, error, "input");
        return { value: undefined, error: { message: error.message } };
      }
    }

    // Static value
    return { value: input.value };
  }

  /**
   * Log handler execution error to console
   */
  private logHandlerError(
    inputName: string,
    code: string,
    error: Error,
    source: "inputHandlers" | "input"
  ): void {
    try {
      const { component } = this.host;
      EditorInstance.Console.log(
        `<i style="cursor:pointer" data-uuid="${component.uuid}" data-application_uuid="${component.application_id}"><b>${component.name}</b></i> > ${source} > ${inputName} | component uuid > ${component.uuid}`
      );
      EditorInstance.Console.log(this.formatCodeWithError(code, error));
    } catch (logError) {
      console.error("Error logging handler error:", logError);
    }
  }

  /**
   * Format code with error highlighting
   */
  private formatCodeWithError(code: string, error: Error): string {
    // Simplified error formatting - can be expanded
    const lines = code?.split("\n") || [];
    let result = "Code:\n";
    lines.forEach((line, i) => {
      result += `${(i + 1).toString().padStart(3, " ")}| ${line}\n`;
    });
    result += `\nError: ${error.name}: ${error.message}`;
    return result;
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.subscription.unsubscribe();
    this.subscription = new Subscription();
    this.debouncer.cancelAll();
    this.executionGuard.clear();
    this.childRefreshBatcher.cancel();
  }
}
