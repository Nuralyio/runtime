/**
 * @file BaseElementV2.ts
 * @description Refactored base component class using controllers and mixins
 * Clean separation of concerns with improved maintainability
 */

import { html, LitElement, nothing, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { createRef, type Ref } from "lit/directives/ref.js";
import { v4 as uuidv4 } from "uuid";

// Controllers
import { InputHandlerController } from "./controllers/InputHandlerController";
import { StyleHandlerController } from "./controllers/StyleHandlerController";
import { EventController } from "./controllers/EventController";

// Mixins
import { EditorModeMixin, type EditorModeHost } from "./mixins/EditorModeMixin";

// Types and utilities
import type { ComponentElement } from "../../../../redux/store/component/component.interface";
import { ExecuteInstance } from "../../../../state/runtime-context";
import { getInitPlatform } from "../../../../state/editor";
import { setupHashScroll, scrollToTarget } from "./BaseElement/input-handler.helpers";

/**
 * Core BaseElement without editor-specific functionality
 * This class contains only essential rendering and data processing logic
 */
export class BaseElementCore extends LitElement {
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE PROPERTIES
  // ═══════════════════════════════════════════════════════════════════════════

  /** Component definition from the editor */
  @property({ type: Object }) component!: ComponentElement;

  /** Data item for list/loop rendering */
  @property({ type: Object, reflect: true }) item: any;

  /** Parent component reference */
  @property({ type: Object }) parentcomponent!: ComponentElement;

  /** View mode flag - disables editor features when true */
  @property({ type: Boolean }) isViewMode = false;

  // ═══════════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════════

  /** Computed values from input handlers */
  @state() inputHandlersValue: Record<string, any> = {};

  /** Computed values from style handlers */
  @state() stylesHandlersValue: Record<string, any> = {};

  /** Calculated component styles */
  @state() calculatedStyles: Record<string, any> = {};

  /** Component errors by input name */
  @state() errors: Record<string, any> = {};

  // ═══════════════════════════════════════════════════════════════════════════
  // REFS & IDENTIFIERS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Reference to the main rendered element */
  inputRef: Ref<HTMLElement> = createRef();

  /** Unique instance ID for this component instance */
  readonly uniqueUUID = uuidv4();

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROLLERS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Controller for processing input handlers */
  protected inputController: InputHandlerController;

  /** Controller for processing style handlers */
  protected styleController: StyleHandlerController;

  /** Controller for executing events */
  protected eventController: EventController;

  // ═══════════════════════════════════════════════════════════════════════════
  // CALLBACKS & EXTERNAL INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════════

  /** Registry for input value callbacks */
  callbacks: Record<string, (val: any) => void> = {};

  /** Execution instance for runtime context */
  ExecuteInstance = ExecuteInstance;

  /** Current platform (desktop/tablet/mobile) */
  currentPlatform: string;

  /** Component style definitions (legacy compatibility) */
  componentStyles: Record<string, any> = {};

  /** Hash change handler reference */
  private handleHash: () => void;

  // ═══════════════════════════════════════════════════════════════════════════
  // CONSTRUCTOR
  // ═══════════════════════════════════════════════════════════════════════════

  constructor() {
    super();

    // Initialize platform
    this.currentPlatform = ExecuteInstance.Vars.currentPlatform ?? getInitPlatform();

    // Initialize controllers
    this.inputController = new InputHandlerController(this as any);
    this.styleController = new StyleHandlerController(this as any);
    this.eventController = new EventController(this as any);

    // Setup hash scroll handler
    this.handleHash = () =>
      setupHashScroll(
        this.inputRef as Ref<HTMLInputElement>,
        this.id,
        () => scrollToTarget(this.inputRef as Ref<HTMLInputElement>)
      );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CALLBACK REGISTRATION (for child components to react to input changes)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Register a callback to be invoked when an input value changes
   * @param inputName - Name of the input to watch
   * @param callback - Function to call with new value
   */
  registerCallback(inputName: string, callback: (val: any) => void): void {
    this.callbacks[inputName] = callback;
  }

  /**
   * Unregister a previously registered callback
   * @param inputName - Name of the input callback to remove
   */
  unregisterCallback(inputName: string): void {
    delete this.callbacks[inputName];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  override connectedCallback(): void {
    super.connectedCallback();

    // Add component class for styling
    if (this.component?.uuid) {
      this.classList.add(`component-${this.component.uuid}`);
    }

    // Set component metadata
    if (this.component) {
      this.component.uniqueUUID = this.uniqueUUID;
      this.component.parent = this.parentcomponent;
    }
  }

  protected override firstUpdated(_changedProperties: PropertyValues): void {
    super.firstUpdated(_changedProperties);

    // Initial processing
    this.inputController.processInputs();
    this.styleController.processStyles();

    // Setup hash-based scrolling
    this.handleHash();
    window.addEventListener("hashchange", this.handleHash);
  }

  override disconnectedCallback(): void {
    // Remove hash change listener (fix memory leak from original)
    window.removeEventListener("hashchange", this.handleHash);

    super.disconnectedCallback();
  }

  protected override update(changedProperties: PropertyValues): void {
    super.update(changedProperties);

    if (changedProperties.has("component")) {
      const prev = changedProperties.get("component") as ComponentElement | undefined;
      const curr = this.component;

      // Re-run onInit if it changed
      if (prev?.event?.onInit !== curr?.event?.onInit) {
        this.eventController.executeOnInit();
      }

      // Update component metadata
      if (curr) {
        curr.uniqueUUID = this.uniqueUUID;
        curr.parent = this.parentcomponent;
      }

      // Re-process handlers
      this.inputController.processInputsDebounced();
      this.styleController.processStyles();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Execute a component event handler
   * @param eventName - Name of the event (onClick, onChange, etc.)
   * @param event - Optional DOM event that triggered this
   * @param data - Additional data to pass to the handler
   */
  executeEvent(eventName: string, event?: Event, data: Record<string, any> = {}): void {
    this.eventController.execute(eventName, event, data);
  }

  /**
   * Get computed styles for the component
   * Merges editor styles, handler values, and runtime styles
   */
  getStyles(): Record<string, any> {
    return this.styleController.getComputedStyles();
  }

  /**
   * Force reprocessing of input handlers
   */
  refreshInputs(): void {
    this.inputController.processInputs();
  }

  /**
   * Force reprocessing of style handlers
   */
  refreshStyles(): void {
    this.styleController.processStyles();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Whether component should be displayed based on display input
   */
  protected get shouldDisplay(): boolean {
    return this.inputHandlersValue?.display !== false;
  }

  /**
   * Render the component content - to be implemented by child classes
   */
  renderComponent(): unknown {
    return nothing;
  }

  /**
   * Render pseudo-state styles (hover, focus, active, disabled)
   */
  protected renderPseudoStateStyles() {
    const cssString = this.styleController.generatePseudoStateCSS();
    if (!cssString) return nothing;
    return html`<style>${cssString}</style>`;
  }

  protected override render() {
    if (!this.shouldDisplay) return nothing;

    // Update component styles for legacy compatibility
    this.componentStyles = this.calculatedStyles || {};
    const labelStyleHandlers = this.component?.styleHandlers
      ? Object.fromEntries(
          Object.entries(this.component.styleHandlers).filter(([_, value]) => value)
        )
      : {};
    this.componentStyles = { ...this.componentStyles, ...labelStyleHandlers };

    return html`
      ${this.renderPseudoStateStyles()}
      ${this.renderComponent()}
    `;
  }
}

/**
 * Full BaseElement with editor mode support via mixin
 * This is the default export for backward compatibility
 */
export class BaseElementBlock extends EditorModeMixin(BaseElementCore) {
  /**
   * Override render to include editor overlays
   */
  protected override render() {
    if (!this.shouldDisplay) return nothing;

    // Update component styles for legacy compatibility
    this.componentStyles = this.calculatedStyles || {};
    const labelStyleHandlers = this.component?.styleHandlers
      ? Object.fromEntries(
          Object.entries(this.component.styleHandlers).filter(([_, value]) => value)
        )
      : {};
    this.componentStyles = { ...this.componentStyles, ...labelStyleHandlers };

    return html`
      ${this.renderPseudoStateStyles()}
      ${this.renderEditorOverlay()}
      ${this.renderComponent()}
      ${this.renderAfterDragWrapper()}
    `;
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use selectComponent() instead
   */
  selectComponentAction(e: Event): void {
    this.selectComponent(e);
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use errorController.renderError() instead
   */
  renderError() {
    return this.renderEditorError();
  }

  /**
   * Legacy method for backward compatibility - process input handlers
   * @deprecated Controllers handle this automatically
   */
  traitInputsHandlers(): void {
    this.inputController.processInputs();
  }

  /**
   * Legacy method for backward compatibility - process style handlers
   * @deprecated Controllers handle this automatically
   */
  traitStylesHandlers(): void {
    this.styleController.processStyles();
  }

  /**
   * Legacy method for backward compatibility - generate pseudo state CSS
   * @deprecated Use styleController.generatePseudoStateCSS()
   */
  generatePseudoStateStyles(): string {
    return this.styleController.generatePseudoStateCSS();
  }
}

// Default export for backward compatibility
export default BaseElementBlock;
