/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './toast.style.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import {
  ToastType,
  ToastPosition,
  ToastAnimation,
  ToastConfig,
  ToastItem,
  ToastEventDetail,
  ToastButton,
  DEFAULT_TOAST_DURATION,
  DEFAULT_MAX_TOASTS,
  EMPTY_STRING
} from './toast.types.js';

// Import required components
import '../icon/icon.component.js';
import '../button/index.js';

/**
 * Toast notification component for displaying temporary messages.
 * 
 * Provides a flexible notification system with multiple types, positions, and animations.
 * Supports stacking multiple toasts, auto-dismiss (enabled by default), action buttons, and manual closing.
 * 
 * @example
 * ```html
 * <!-- Basic usage with auto-dismiss -->
 * <nr-toast position="top-right"></nr-toast>
 * 
 * <!-- Disable auto-dismiss to require manual closing -->
 * <nr-toast position="top-right" auto-dismiss="false"></nr-toast>
 * 
 * <!-- Programmatic usage -->
 * <script>
 *   const toast = document.querySelector('nr-toast');
 *   toast.show({ text: 'Success!', type: 'success' });
 *   toast.show({ text: 'Error occurred', type: 'error', duration: 7000 });
 *   
 *   // Disable auto-dismiss for specific toast
 *   toast.show({ text: 'Persistent message', autoDismiss: false });
 *   
 *   // Toast with action button
 *   toast.show({
 *     text: 'Item deleted',
 *     type: 'success',
 *     button: {
 *       label: 'Undo',
 *       onClick: () => console.log('Undo clicked'),
 *       type: 'primary'
 *     }
 *   });
 * </script>
 * ```
 * 
 * @fires nr-toast-show - Toast shown
 * @fires nr-toast-close - Toast closed
 * @fires nr-toast-click - Toast clicked
 * 
 * @cssproperty --nuraly-z-index-toast - Toast z-index
 * @cssproperty --nuraly-toast-default-background - Default toast background
 * @cssproperty --nuraly-toast-success-background - Success toast background
 * @cssproperty --nuraly-toast-error-background - Error toast background
 * @cssproperty --nuraly-toast-warning-background - Warning toast background
 * @cssproperty --nuraly-toast-info-background - Info toast background
 */
@customElement('nr-toast')
export class NrToastElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  override requiredComponents = ['nr-icon', 'nr-button'];

  /** Position of toast container on screen */
  @property({ type: String, reflect: true })
  position: ToastPosition = ToastPosition.TopRight;

  /** Maximum number of toasts to display */
  @property({ type: Number })
  maxToasts = DEFAULT_MAX_TOASTS;

  /** Default duration for toasts in milliseconds */
  @property({ type: Number })
  defaultDuration = DEFAULT_TOAST_DURATION;

  /** Animation type for toasts */
  @property({ type: String })
  animation: ToastAnimation = ToastAnimation.Fade;

  /** Whether to stack toasts or replace */
  @property({ type: Boolean })
  stack = true;

  /** Auto dismiss toasts after duration (default: true) */
  @property({ type: Boolean })
  autoDismiss = true;

  /** Internal state: active toasts */
  @state()
  private toasts: ToastItem[] = [];

  /** Timeout map for auto-dismiss */
  private timeouts = new Map<string, number>();

  /**
   * Show a new toast notification
   * @param config - Toast configuration
   * @returns Toast ID for manual control
   */
  show(config: string | ToastConfig): string {
    const toastConfig: ToastConfig = typeof config === 'string' 
      ? { text: config }
      : config;

    const toast: ToastItem = {
      id: this.generateId(),
      timestamp: Date.now(),
      text: toastConfig.text,
      type: toastConfig.type || ToastType.Default,
      duration: toastConfig.duration ?? this.defaultDuration,
      autoDismiss: toastConfig.autoDismiss ?? this.autoDismiss,
      closable: toastConfig.closable ?? true,
      icon: toastConfig.icon || this.getDefaultIcon(toastConfig.type),
      customClass: toastConfig.customClass,
      button: toastConfig.button,
      onClose: toastConfig.onClose,
      onClick: toastConfig.onClick,
    };

    // Handle max toasts
    if (!this.stack) {
      this.clearAll();
    } else if (this.toasts.length >= this.maxToasts) {
      this.removeToast(this.toasts[0].id);
    }

    // Add toast
    this.toasts = [...this.toasts, toast];

    // Emit show event
    this.emitToastEvent('nr-toast-show', toast, 'show');

    // Set auto-dismiss timeout
    if (toast.autoDismiss && toast.duration && toast.duration > 0) {
      const timeoutId = window.setTimeout(() => {
        this.removeToast(toast.id);
      }, toast.duration);
      this.timeouts.set(toast.id, timeoutId);
    }

    return toast.id;
  }

  /**
   * Show success toast
   */
  success(text: string, duration?: number): string {
    return this.show({ text, type: ToastType.Success, duration });
  }

  /**
   * Show error toast
   */
  error(text: string, duration?: number): string {
    return this.show({ text, type: ToastType.Error, duration });
  }

  /**
   * Show warning toast
   */
  warning(text: string, duration?: number): string {
    return this.show({ text, type: ToastType.Warning, duration });
  }

  /**
   * Show info toast
   */
  info(text: string, duration?: number): string {
    return this.show({ text, type: ToastType.Info, duration });
  }

  /**
   * Remove a specific toast
   */
  removeToast(id: string): void {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast) return;

    // Mark as removing for animation
    toast.removing = true;
    this.requestUpdate();

    // Clear timeout
    const timeoutId = this.timeouts.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.timeouts.delete(id);
    }

    // Remove after animation
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== id);
      
      // Emit close event
      this.emitToastEvent('nr-toast-close', toast, 'close');
      
      // Call onClose callback
      toast.onClose?.();
    }, 300); // Animation duration
  }

  /**
   * Clear all toasts
   */
  clearAll(): void {
    this.toasts.forEach(toast => {
      const timeoutId = this.timeouts.get(toast.id);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
    this.timeouts.clear();
    this.toasts = [];
  }

  /**
   * Handle toast click
   */
  private handleToastClick(toast: ToastItem): void {
    this.emitToastEvent('nr-toast-click', toast, 'click');
    toast.onClick?.();
  }

  /**
   * Handle close button click
   */
  private handleCloseClick(event: Event, toast: ToastItem): void {
    event.stopPropagation();
    this.removeToast(toast.id);
  }

  /**
   * Get default icon for toast type
   */
  private getDefaultIcon(type?: ToastType): string {
    switch (type) {
      case ToastType.Success:
        return 'check-circle';
      case ToastType.Error:
        return 'x-circle';
      case ToastType.Warning:
        return 'alert-triangle';
      case ToastType.Info:
        return 'info';
      default:
        return EMPTY_STRING;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get animation class
   */
  private getAnimationClass(toast: ToastItem): string {
    const isRemoving = toast.removing;
    const suffix = isRemoving ? 'out' : 'in';
    return `toast--${this.animation}-${suffix}`;
  }

  /**
   * Emit toast event
   */
  private emitToastEvent(eventName: string, toast: ToastItem, action: ToastEventDetail['action']): void {
    this.dispatchEvent(new CustomEvent<ToastEventDetail>(eventName, {
      detail: { toast, action },
      bubbles: true,
      composed: true
    }));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearAll();
  }

  override render() {
    return html`
      <div class="toast-container">
        ${repeat(
          this.toasts,
          toast => toast.id,
          toast => this.renderToast(toast)
        )}
      </div>
    `;
  }

  private renderToast(toast: ToastItem) {
    const classes = {
      'toast': true,
      [`toast--${toast.type}`]: true,
      [this.getAnimationClass(toast)]: true,
      [toast.customClass || EMPTY_STRING]: !!toast.customClass,
    };

    return html`
      <div
        class=${classMap(classes)}
        @click=${() => this.handleToastClick(toast)}
        role="alert"
        aria-live="polite"
      >
        ${toast.icon ? html`
          <div class="toast__icon">
            <nr-icon name=${toast.icon}></nr-icon>
          </div>
        ` : nothing}
        
        <div class="toast__content">
          <div class="toast__text">${toast.text}</div>
          ${toast.button ? this.renderButton(toast.button) : nothing}
        </div>
        
        ${toast.closable ? html`
          <button
            class="toast__close"
            @click=${(e: Event) => this.handleCloseClick(e, toast)}
            aria-label="Close notification"
            type="button"
          >
            <nr-icon name="x"></nr-icon>
          </button>
        ` : nothing}
      </div>
    `;
  }

  private renderButton(button: ToastButton) {
    const handleButtonClick = (e: Event) => {
      e.stopPropagation();
      button.onClick(e);
    };

    return html`
      <div class="toast__button">
        <nr-button
          type=${button.type || 'default'}
          size=${button.size || 'small'}
          ?disabled=${button.disabled || false}
          @click=${handleButtonClick}
        >
          ${button.icon ? html`<nr-icon slot="icon-left" name=${button.icon}></nr-icon>` : nothing}
          ${button.label}
        </nr-button>
      </div>
    `;
  }
}
