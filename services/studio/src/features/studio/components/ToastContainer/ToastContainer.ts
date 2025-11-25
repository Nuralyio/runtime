import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@nuralyui/toast';
import { $toasts, type Toast } from '../../../../shared/redux/store/toast';
import { hideToast } from '../../../../services/toast';

// Singleton instance tracker
let toastContainerInstance: ToastContainer | null = null;

/**
 * Global toast container component (Singleton)
 * Automatically manages all toast notifications
 *
 * This component is self-initializing and should not be manually added to pages.
 * The MicroApp component will automatically create an instance when needed.
 */
@customElement('toast-container')
export class ToastContainer extends LitElement {
  @state() private toasts: Toast[] = [];
  private unsubscribe?: () => void;

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
      this.toasts = state.toasts;
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

  private handleClose(id: string) {
    hideToast(id);
  }

  render() {
    if (this.toasts.length === 0) {
      return html``;
    }

    return html`
      <div class="toast-wrapper">
        ${this.toasts.map(toast => html`
          <nr-toast
            key=${toast.id}
            .message=${toast.message}
            .type=${toast.type || 'info'}
            .closable=${toast.closable !== false}
            @close=${() => this.handleClose(toast.id)}
          ></nr-toast>
        `)}
      </div>
    `;
  }

  static styles = css`
    :host {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      max-width: 400px;
    }

    .toast-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    nr-toast {
      pointer-events: auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'toast-container': ToastContainer;
  }
}
