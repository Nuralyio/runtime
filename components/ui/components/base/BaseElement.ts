/**
 * @file BaseElement.ts
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
import { EditorModeMixin } from "./mixins/EditorModeMixin";

// Types and utilities
import type { ComponentElement } from "../../../../redux/store/component/component.interface";
import { ExecuteInstance } from "../../../../state/runtime-context";
import { getInitPlatform } from "../../../../state/editor";
import { setupHashScroll, scrollToTarget } from "./BaseElement/input-handler.helpers";
import { getCurrentUser } from "../../../../handlers/runtime-api/user";

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
  @state() resolvedInputs: Record<string, any> = {};

  /** Computed values from style handlers */
  @state() stylesHandlersValue: Record<string, any> = {};

  /** Calculated component styles */
  @state() calculatedStyles: Record<string, any> = {};

  /** Component errors by input name */
  @state() errors: Record<string, any> = {};

  /** Runtime styles from store */
  @state() runtimeStyles: Record<string, any> = {};

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

  /** Component style definitions */
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

    // Connect controllers for coordinated updates
    this.inputController.setStyleController(this.styleController);

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
      // Add data attribute for iframe preview selection
      this.dataset.componentUuid = this.component.uuid;
    }

    // Set component metadata
    if (this.component) {
      this.component.uniqueUUID = this.uniqueUUID;
      this.component.parent = this.parentcomponent;
      this.syncToAppsRegistry();
    }
  }

  /**
   * Syncs the component's uniqueUUID to the Apps registry and attaches Instance.
   * This is needed because the Apps registry is populated before DOM elements are created,
   * so uniqueUUID isn't available at that time.
   */
  private syncToAppsRegistry(): void {
    if (!this.component?.name || !this.uniqueUUID) return;

    // Attach Instance to this.component (the one used by traitInputHandler)
    this.ExecuteInstance.attachValuesProperty(this.component);

    // Also sync to the Apps registry for cross-component access (e.g., text_label_8136.value = "aa")
    const Apps = this.ExecuteInstance.Apps;
    for (const appName in Apps) {
      const appComponents = Apps[appName];
      if (appComponents?.[this.component.name]) {
        const registeredComponent = appComponents[this.component.name];
        // Only update if it's the same component (by uuid)
        if (registeredComponent.uuid === this.component.uuid) {
          registeredComponent.uniqueUUID = this.uniqueUUID;
          // Share the same Instance proxy between both component references
          registeredComponent.Instance = this.component.Instance;
        }
        break;
      }
    }
  }

  protected override async firstUpdated(_changedProperties: PropertyValues): Promise<void> {
    super.firstUpdated(_changedProperties);

    // Initial processing - await to ensure inputs are ready before first render completes
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
      const curr = this.component;

      // Update component metadata
      if (curr) {
        curr.uniqueUUID = this.uniqueUUID;
        curr.parent = this.parentcomponent;
        // Update data attribute for iframe preview selection
        if (curr.uuid) {
          this.dataset.componentUuid = curr.uuid;
        }
      }

      // Re-process handlers
      this.inputController.processInputs();
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
    // Execute the handler code if defined
    this.eventController.execute(eventName, event, data);

    // Also dispatch a DOM CustomEvent so native panels can listen
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail: data
    }));
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
  async refreshInputs(): Promise<void> {
    await this.inputController.processInputs();
  }

  /**
   * Force reprocessing of style handlers
   */
  async refreshStyles(): Promise<void> {
    await this.styleController.processStyles();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERING
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Whether component should be displayed based on display input and access roles
   */
  protected get shouldDisplay(): boolean {
    // Check display input first
    if (this.resolvedInputs?.display === false) {
      return false;
    }

    // Check access roles (skip in editor mode)
    if (!this.isViewMode) {
      return true; // Always show in editor mode
    }

    const accessRolesRaw = this.resolvedInputs?.access?.roles;
    // Normalize to array - handle both string and array formats
    const accessRoles = accessRolesRaw
      ? (Array.isArray(accessRolesRaw) ? accessRolesRaw : [accessRolesRaw])
      : null;

    if (accessRoles && accessRoles.length > 0) {
      const user = getCurrentUser();
      // Get Keycloak global roles
      const keycloakRoles = user?.roles || [];
      // Get app-specific membership role (owner, admin, editor, viewer)
      // This is set by the SSR layer when loading the app
      const appRole = (user as any)?.appRole;

      // Combine all roles for checking
      const allUserRoles = [...keycloakRoles];
      if (appRole) {
        allUserRoles.push(appRole);
      }

      // Check if user has any of the allowed roles
      const hasAccess = accessRoles.some((role: string) => allUserRoles.includes(role));
      if (!hasAccess) {
        return false;
      }
    }

    return true;
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

    // Update component styles
    this.componentStyles = this.calculatedStyles || {};
    const labelStyleHandlers = this.component?.style_handlers
      ? Object.fromEntries(
          Object.entries(this.component.style_handlers).filter(([_, value]) => value)
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
 * This is the default export and main class for all UI components
 */
export class BaseElementBlock extends EditorModeMixin(BaseElementCore) {
  /**
   * Override render to include editor overlays
   */
  protected override render() {
    if (!this.shouldDisplay) return nothing;

    // Update component styles
    this.componentStyles = this.calculatedStyles || {};
    const labelStyleHandlers = this.component?.style_handlers
      ? Object.fromEntries(
          Object.entries(this.component.style_handlers).filter(([_, value]) => value)
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
}

// Default export
export default BaseElementBlock;
