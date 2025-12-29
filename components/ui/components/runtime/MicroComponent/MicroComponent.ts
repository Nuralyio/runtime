import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { v4 as uuidv4 } from "uuid";

import { renderComponent } from '../../../../../utils/render-util';
import type { ComponentElement } from '../../../../../redux/store/component/component.interface';
import { ExecuteInstance } from '../../../../../state/runtime-context';
import { MicroAppStoreContext } from '../../../../../micro-app/state/MicroAppStoreContext';
import { MicroAppRuntimeContext } from '../../../../../micro-app/state/MicroAppRuntimeContext';

/**
 * MicroComponent - A lightweight wrapper for rendering an array of components
 *
 * Similar to MicroApp but simpler - just accepts an array of ComponentElement
 * and renders them using the existing renderComponent logic.
 *
 * The first component in the array is treated as the root/main component.
 *
 * Supports optional isolated context for scoped variables.
 *
 * @example
 * // Simple usage (shared global vars)
 * <micro-component
 *   .components=${[
 *     { uuid: '1', component_type: 'vertical_container', root: true },
 *     { uuid: '2', component_type: 'text', input: { value: 'Hello' } }
 *   ]}
 *   .vars=${{ userName: 'John' }}
 * ></micro-component>
 *
 * @example
 * // With isolated context (scoped vars)
 * <micro-component
 *   .components=${[...]}
 *   useIsolatedContext
 *   .vars=${{ count: 0 }}
 * ></micro-component>
 */
@customElement("micro-component")
export class MicroComponent extends LitElement {
  static override styles = css`
    :host {
      display: block;
      height: 100%;
    }
  `;

  /**
   * Array of component definitions to render.
   * First component is treated as root/main.
   */
  @property({ type: Array }) components: ComponentElement[] = [];

  /**
   * View mode - true for preview, false for edit mode
   */
  @property({ type: Boolean }) isViewMode = true;

  /**
   * Enable isolated context for scoped variables.
   * When false, vars are set on global ExecuteInstance.
   * When true, vars are scoped to this instance only.
   */
  @property({ type: Boolean }) useIsolatedContext = false;

  /**
   * Initial variables to set.
   * Works for both global and isolated modes.
   */
  @property({ type: Object }) vars?: Record<string, any>;

  // Isolated context instances
  private microComponentId: string = '';
  private storeContext: MicroAppStoreContext | null = null;
  private runtimeContext: MicroAppRuntimeContext | null = null;

  override connectedCallback(): void {
    super.connectedCallback();

    if (this.useIsolatedContext) {
      this.initializeIsolatedContext();
    } else {
      this.initializeGlobalVars();
    }
  }

  override disconnectedCallback(): void {
    if (this.useIsolatedContext) {
      this.cleanupIsolatedContext();
    }
    super.disconnectedCallback();
  }

  /**
   * Set vars on global ExecuteInstance (non-isolated mode)
   */
  private initializeGlobalVars(): void {
    if (this.vars) {
      Object.entries(this.vars).forEach(([key, value]) => {
        ExecuteInstance.VarsProxy[key] = value;
      });
    }
  }

  /**
   * Initialize isolated context with scoped variables
   */
  private initializeIsolatedContext(): void {
    // Generate unique ID for this instance
    this.microComponentId = `micro-component_${uuidv4()}`;

    // Create store context with components (no pages needed)
    this.storeContext = new MicroAppStoreContext(
      this.microComponentId,
      this.microComponentId,
      this.components,
      [] // no pages
    );

    // Create runtime context
    this.runtimeContext = new MicroAppRuntimeContext(this.storeContext);

    // Set initial vars on isolated context
    if (this.vars) {
      Object.entries(this.vars).forEach(([key, value]) => {
        this.runtimeContext!.setVar(key, value);
      });
    }

    // Register components in runtime
    this.runtimeContext.registerComponents();
  }

  /**
   * Cleanup isolated context on disconnect
   */
  private cleanupIsolatedContext(): void {
    if (this.runtimeContext) {
      this.runtimeContext.cleanup();
      this.runtimeContext = null;
    }

    if (this.storeContext) {
      this.storeContext.cleanup();
      this.storeContext = null;
    }
  }

  override render() {
    if (!this.components?.length) return nothing;

    return html`
      <div style="height: 100%;">
        ${renderComponent(this.components, null, this.isViewMode)}
      </div>
    `;
  }
}
