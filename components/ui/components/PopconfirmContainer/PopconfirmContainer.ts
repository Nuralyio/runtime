import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

// Import the popconfirm manager component
import '../../nuraly-ui/src/components/popconfirm/popconfirm-manager.component';
import { NrPopconfirmManagerElement } from '../../nuraly-ui/src/components/popconfirm/popconfirm-manager.component';
import type { PopconfirmShowConfig, PopconfirmPosition } from '../../nuraly-ui/src/components/popconfirm/popconfirm.types';

// Singleton instance tracker
let popconfirmContainerInstance: PopconfirmContainer | null = null;

/**
 * Global popconfirm container component (Singleton)
 * Automatically manages all popconfirm dialogs using the nr-popconfirm-manager component
 *
 * This component is self-initializing and should not be manually added to pages.
 * The MicroApp component will automatically create an instance when needed.
 */
@customElement('popconfirm-container')
export class PopconfirmContainer extends LitElement {
  private managerElement: NrPopconfirmManagerElement | null = null;

  /**
   * Gets or creates the singleton instance
   * Call this to ensure popconfirm container exists in the DOM
   */
  static getInstance(): PopconfirmContainer {
    if (!popconfirmContainerInstance) {
      popconfirmContainerInstance = new PopconfirmContainer();
      document.body.appendChild(popconfirmContainerInstance);
    }
    return popconfirmContainerInstance;
  }

  /**
   * Checks if container instance exists
   */
  static hasInstance(): boolean {
    return popconfirmContainerInstance !== null;
  }

  /**
   * Static method to show a popconfirm
   */
  static show(config: PopconfirmShowConfig, position: PopconfirmPosition): string | null {
    return PopconfirmContainer.getInstance().showPopconfirm(config, position);
  }

  /**
   * Static method to confirm (returns promise)
   */
  static async confirm(config: PopconfirmShowConfig, position: PopconfirmPosition): Promise<boolean> {
    return PopconfirmContainer.getInstance().confirmPopconfirm(config, position);
  }

  /**
   * Static method to close a specific popconfirm
   */
  static close(id: string): void {
    PopconfirmContainer.getInstance().closePopconfirm(id);
  }

  /**
   * Static method to close all popconfirms
   */
  static closeAll(): void {
    PopconfirmContainer.getInstance().closeAllPopconfirms();
  }

  override connectedCallback() {
    super.connectedCallback();

    // Singleton enforcement: Only one instance allowed
    if (popconfirmContainerInstance && popconfirmContainerInstance !== this) {
      console.warn('PopconfirmContainer singleton already exists. Removing duplicate instance.');
      this.remove();
      return;
    }

    popconfirmContainerInstance = this;
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // Only clear singleton if this was the active instance
    if (popconfirmContainerInstance === this) {
      popconfirmContainerInstance = null;
    }
  }

  override firstUpdated(): void {
    // Get reference to the nr-popconfirm-manager element after first render
    this.managerElement = this.shadowRoot?.querySelector('nr-popconfirm-manager') ?? null;
  }

  /**
   * Show a popconfirm at the specified position
   */
  showPopconfirm(config: PopconfirmShowConfig, position: PopconfirmPosition): string | null {
    if (!this.managerElement) {
      this.managerElement = this.shadowRoot?.querySelector('nr-popconfirm-manager') ?? null;
    }

    if (!this.managerElement) {
      console.warn('[PopconfirmContainer] Manager element not found in shadow DOM');
      return null;
    }

    console.log('[PopconfirmContainer] Calling show() with:', { config, position });
    const result = this.managerElement.show(config, position);
    console.log('[PopconfirmContainer] show() returned:', result);
    return result;
  }

  /**
   * Show a confirmation and return a promise
   */
  async confirmPopconfirm(config: PopconfirmShowConfig, position: PopconfirmPosition): Promise<boolean> {
    if (!this.managerElement) {
      this.managerElement = this.shadowRoot?.querySelector('nr-popconfirm-manager') ?? null;
    }

    if (!this.managerElement) {
      return false;
    }

    return new Promise((resolve) => {
      this.managerElement!.show(
        {
          ...config,
          onConfirm: async () => {
            await config.onConfirm?.();
            resolve(true);
          },
          onCancel: () => {
            config.onCancel?.();
            resolve(false);
          },
        },
        position
      );
    });
  }

  /**
   * Close a specific popconfirm by ID
   */
  closePopconfirm(id: string): void {
    this.managerElement?.close(id);
  }

  /**
   * Close all popconfirms
   */
  closeAllPopconfirms(): void {
    this.managerElement?.closeAll();
  }

  override render() {
    return html`
      <nr-popconfirm-manager></nr-popconfirm-manager>
    `;
  }

  static override styles = css`
    :host {
      --nuraly-z-index-popconfirm: 10001;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'popconfirm-container': PopconfirmContainer;
  }
}
