import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import '@nuralyui/toast';
import { $toasts, type Toast } from '../../../../redux/store/toast';
import { hideToast } from '../../../../../../services/toast';

// Singleton instance tracker
let toastContainerInstance: ToastContainer | null = null;

/**
 * Global toast container component (Singleton)
 * Automatically manages all toast notifications using the nr-toast component
 *
 * This component is self-initializing and should not be manually added to pages.
 * The MicroApp component will automatically create an instance when needed.
 */
@customElement('toast-container')
export class ToastContainer extends LitElement {
  private toastElement: any = null;
  private unsubscribe?: () => void;
  private shownToastIds = new Set<string>();

  /**
   * Gets or creates the singleton instance
   * Call this to ensure toast container exists in the DOM
   */
  static getInstance(): ToastContainer {
    if (!toastContainerInstance) {
      toastContainerInstance = new ToastContainer();
      document.body.appendChild(toastContainerInstance);
    }
    return toastContainerInstance;
  }

  /**
   * Checks if container instance exists
   */
  static hasInstance(): boolean {
    return toastContainerInstance !== null;
  }

  connectedCallback() {
    super.connectedCallback();

    // Singleton enforcement: Only one instance allowed
    if (toastContainerInstance && toastContainerInstance !== this) {
      console.warn('ToastContainer singleton already exists. Removing duplicate instance.');
      this.remove();
      return;
    }

    toastContainerInstance = this;

    // Subscribe to global toast store
    this.unsubscribe = $toasts.subscribe((state) => {
      this.processToastUpdates(state.toasts);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // Only clear singleton if this was the active instance
    if (toastContainerInstance === this) {
      toastContainerInstance = null;
    }

    this.unsubscribe?.();
  }

  private processToastUpdates(toasts: Toast[]): void {
    // Get the nr-toast element
    if (!this.toastElement && this.shadowRoot) {
      this.toastElement = this.shadowRoot.querySelector('nr-toast');
    }

    if (!this.toastElement) {
      return;
    }

    // Show only new toasts that haven't been shown yet
    toasts.forEach((toast) => {
      if (!this.shownToastIds.has(toast.id)) {
        this.shownToastIds.add(toast.id);
        this.toastElement.show({
          text: toast.message,
          type: toast.type || 'info',
          duration: toast.duration,
          autoDismiss: toast.duration ? toast.duration > 0 : true,
          closable: toast.closable !== false,
          onClose: () => {
            hideToast(toast.id);
            this.shownToastIds.delete(toast.id);
          }
        });
      }
    });
  }

  override firstUpdated(): void {
    // Get reference to the nr-toast element after first render
    this.toastElement = this.shadowRoot?.querySelector('nr-toast');
  }

  render() {
    return html`
      <nr-toast 
        position="top-right"
        stack
        max-toasts="5"
      ></nr-toast>
    `;
  }

  static styles = css`
    :host {
      --nuraly-z-index-toast: 10000;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'toast-container': ToastContainer;
  }
}
