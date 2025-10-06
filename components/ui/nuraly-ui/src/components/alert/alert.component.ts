/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styles } from './alert.style.js';
import { NuralyUIBaseMixin } from '../../shared/base-mixin.js';
import {
  AlertType,
  AlertEventDetail,
  EMPTY_STRING
} from './alert.types.js';

// Import required components
import '../icon/icon.component.js';

/**
 * Alert component for displaying important messages.
 * 
 /**
 * Provides a flexible alert/banner system with multiple types.
 * The alert component is used to display important messages, warnings, and notifications
 * Supports different severity levels, optional icons, descriptions, and closable functionality.
 * 
 * @example
 * ```html
 * <!-- Basic alert -->
 * <nr-alert message="Success message" type="success"></nr-alert>
 * 
 * <!-- Alert with description -->
 * <nr-alert 
 *   message="Warning title" 
 *   description="This is a detailed warning description"
 *   type="warning"
 *   show-icon
 * ></nr-alert>
 * 
 * <!-- Closable alert -->
 * <nr-alert 
 *   message="Dismissible message" 
 *   type="info"
 *   closable
 *   show-icon
 * ></nr-alert>
 * 
 * <!-- Banner mode -->
 * <nr-alert 
 *   message="Banner alert" 
 *   type="error"
 *   banner
 *   show-icon
 * ></nr-alert>
 * ```
 * 
 * @fires nr-alert-close - Fired when alert is closed
 * 
 * @slot - Default slot for custom content (overrides message/description)
 * @slot icon - Custom icon slot
 * @slot action - Custom action buttons or links
 * 
 * @cssproperty --nuraly-color-success - Success color
 * @cssproperty --nuraly-color-info - Info color
 * @cssproperty --nuraly-color-warning - Warning color
 * @cssproperty --nuraly-color-error - Error color
 */
@customElement('nr-alert')
export class NrAlertElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  override requiredComponents = ['nr-icon'];

  /** Alert message text */
  @property({ type: String })
  message = EMPTY_STRING;

  /** Alert type/variant */
  @property({ type: String, reflect: true })
  type: AlertType = AlertType.Info;

  /** Optional description text */
  @property({ type: String })
  description = EMPTY_STRING;

  /** Whether the alert can be closed */
  @property({ type: Boolean })
  closable = false;

  /** Whether to show icon */
  @property({ type: Boolean, attribute: 'show-icon' })
  showIcon = false;

  /** Custom icon name */
  @property({ type: String })
  icon = EMPTY_STRING;

  /** Banner mode - full width with no border radius */
  @property({ type: Boolean })
  banner = false;

  /** Internal state: whether alert is visible */
  @state()
  private visible = true;

  /** Internal state: whether alert is closing */
  @state()
  private closing = false;

  /**
   * Close the alert
   */
  close(): void {
    if (!this.visible || this.closing) return;

    this.closing = true;
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
      this.visible = false;
      this.closing = false;
      
      // Emit close event
      this.dispatchEvent(new CustomEvent<AlertEventDetail>('nr-alert-close', {
        detail: { message: this.message, type: this.type },
        bubbles: true,
        composed: true
      }));
    }, 300); // Match animation duration
  }

  /**
   * Handle close button click
   */
  private handleCloseClick(event: Event): void {
    event.stopPropagation();
    this.close();
  }

  /**
   * Get default icon for alert type
   */
  private getDefaultIcon(): string {
    if (this.icon) return this.icon;
    
    switch (this.type) {
      case AlertType.Success:
        return 'check-circle';
      case AlertType.Info:
        return 'info';
      case AlertType.Warning:
        return 'alert-triangle';
      case AlertType.Error:
        return 'x-circle';
      default:
        return EMPTY_STRING;
    }
  }

  /**
   * Check if alert has description
   */
  private hasDescription(): boolean {
    return !!this.description;
  }

  override render() {
    if (!this.visible) {
      return nothing;
    }

    const classes = {
      'alert': true,
      [`alert--${this.type}`]: true,
      'alert--with-description': this.hasDescription(),
      'alert--banner': this.banner,
      'alert--closing': this.closing,
    };

    return html`
      <div class=${classMap(classes)} role="alert">
        ${this.showIcon ? html`
          <div class="alert__icon">
            <slot name="icon">
              <nr-icon 
                name=${this.getDefaultIcon()} 
                size=${this.hasDescription() ? 'large' : 'small'}
              ></nr-icon>
            </slot>
          </div>
        ` : nothing}
        
        <div class="alert__content">
          ${this.message ? html`
            <div class="alert__message">${this.message}</div>
          ` : nothing}
          
          ${this.description ? html`
            <div class="alert__description">${this.description}</div>
          ` : nothing}
          
          <slot></slot>
          
          <slot name="action"></slot>
        </div>
        
        ${this.closable ? html`
          <button
            class="alert__close"
            @click=${this.handleCloseClick}
            aria-label="Close alert"
            type="button"
          >
            <nr-icon name="x" size="small"></nr-icon>
          </button>
        ` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-alert': NrAlertElement;
  }
}
