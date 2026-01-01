/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { popconfirmManagerStyles } from './popconfirm-manager.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import {
  PopconfirmIcon,
  PopconfirmShowConfig,
  PopconfirmPosition,
  PopconfirmItem,
} from './popconfirm.types.js';

// Import required components
import '../icon/icon.component.js';
import '../button/button.component.js';
import '../label/label.component.js';

/**
 * # PopconfirmManager Component
 *
 * A container component that manages popconfirm instances displayed at cursor position.
 * Similar to toast notifications but for confirmation dialogs.
 *
 * ## Features
 * - Show popconfirm at cursor/mouse position
 * - Programmatic API for creating confirmations
 * - Async confirmation support with loading state
 * - Auto-dismiss on outside click or escape
 * - Customizable appearance and callbacks
 *
 * ## Usage
 * ```html
 * <!-- Add once to your app -->
 * <nr-popconfirm-manager></nr-popconfirm-manager>
 *
 * <!-- Programmatic usage -->
 * <script>
 *   const manager = document.querySelector('nr-popconfirm-manager');
 *
 *   // Show at cursor position (from click event)
 *   element.addEventListener('click', (e) => {
 *     manager.show({
 *       title: 'Delete item?',
 *       description: 'This action cannot be undone.',
 *       okType: 'danger',
 *       onConfirm: () => {
 *         console.log('Deleted!');
 *       }
 *     }, { x: e.clientX, y: e.clientY });
 *   });
 *
 *   // Or use the static confirm helper
 *   const confirmed = await NrPopconfirmManager.confirm({
 *     title: 'Are you sure?',
 *   }, { x: event.clientX, y: event.clientY });
 * </script>
 * ```
 *
 * @element nr-popconfirm-manager
 * @fires nr-popconfirm-confirm - Fired when user confirms
 * @fires nr-popconfirm-cancel - Fired when user cancels
 */
@customElement('nr-popconfirm-manager')
export class NrPopconfirmManagerElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = popconfirmManagerStyles;

  override requiredComponents = ['nr-icon', 'nr-button', 'nr-label'];

  /** Active popconfirm items */
  @state() private items: PopconfirmItem[] = [];

  /** Bound event handlers */
  private _boundHandleOutsideClick: ((e: Event) => void) | null = null;
  private _boundHandleKeydown: ((e: KeyboardEvent) => void) | null = null;

  /** Timestamp when popconfirm was shown (to prevent immediate close from same click) */
  private _showTimestamp: number = 0;

  /** Static instance for global access */
  private static _instance: NrPopconfirmManagerElement | null = null;

  override connectedCallback(): void {
    super.connectedCallback();
    NrPopconfirmManagerElement._instance = this;

    this._boundHandleOutsideClick = this.handleOutsideClick.bind(this);
    this._boundHandleKeydown = this.handleKeydown.bind(this);
    document.addEventListener('click', this._boundHandleOutsideClick, true);
    document.addEventListener('keydown', this._boundHandleKeydown);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    NrPopconfirmManagerElement._instance = null;

    if (this._boundHandleOutsideClick) {
      document.removeEventListener('click', this._boundHandleOutsideClick, true);
    }
    if (this._boundHandleKeydown) {
      document.removeEventListener('keydown', this._boundHandleKeydown);
    }
  }

  /**
   * Get the global instance
   */
  static getInstance(): NrPopconfirmManagerElement | null {
    return NrPopconfirmManagerElement._instance;
  }

  /**
   * Static helper to show a confirmation dialog
   * Returns a promise that resolves to true if confirmed, false if cancelled
   */
  static async confirm(
    config: PopconfirmShowConfig,
    position: PopconfirmPosition
  ): Promise<boolean> {
    const instance = NrPopconfirmManagerElement.getInstance();
    if (!instance) {
      console.warn('NrPopconfirmManager: No instance found. Add <nr-popconfirm-manager> to your app.');
      return false;
    }

    return new Promise((resolve) => {
      instance.show(
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
   * Show a popconfirm at the specified position
   */
  show(config: PopconfirmShowConfig, position: PopconfirmPosition): string {
    const id = this.generateId();

    // Adjust position to keep popconfirm within viewport
    const adjustedPosition = this.adjustPosition(position);

    const item: PopconfirmItem = {
      id,
      config,
      position: adjustedPosition,
      loading: false,
    };

    // Record timestamp to prevent immediate close from same click event
    this._showTimestamp = Date.now();

    // Only allow one popconfirm at a time
    this.items = [item];

    console.log('[nr-popconfirm-manager] show() called, items:', this.items);
    this.requestUpdate();

    return id;
  }

  /**
   * Close a specific popconfirm
   */
  close(id: string): void {
    this.items = this.items.filter(item => item.id !== id);
  }

  /**
   * Close all popconfirms
   */
  closeAll(): void {
    this.items = [];
  }

  /**
   * Handle confirm button click
   */
  private async handleConfirm(item: PopconfirmItem, e: Event): Promise<void> {
    e.stopPropagation();

    const confirmEvent = new CustomEvent('nr-popconfirm-confirm', {
      bubbles: true,
      composed: true,
      detail: { id: item.id, config: item.config },
    });
    this.dispatchEvent(confirmEvent);

    // Handle async onConfirm
    if (item.config.onConfirm) {
      const result = item.config.onConfirm();
      if (result && typeof (result as Promise<void>).then === 'function') {
        // Show loading state
        item.loading = true;
        this.requestUpdate();

        try {
          await result;
        } catch (error) {
          console.error('Popconfirm confirmation failed:', error);
        } finally {
          item.loading = false;
        }
      }
    }

    this.close(item.id);
  }

  /**
   * Handle cancel button click
   */
  private handleCancel(item: PopconfirmItem, e: Event): void {
    e.stopPropagation();

    const cancelEvent = new CustomEvent('nr-popconfirm-cancel', {
      bubbles: true,
      composed: true,
      detail: { id: item.id, config: item.config },
    });
    this.dispatchEvent(cancelEvent);

    item.config.onCancel?.();
    this.close(item.id);
  }

  /**
   * Handle clicks outside the popconfirm
   */
  private handleOutsideClick(e: Event): void {
    if (this.items.length === 0) return;

    // Prevent immediate close from the same click event that opened the popconfirm
    // Allow at least 100ms before responding to outside clicks
    if (Date.now() - this._showTimestamp < 100) {
      return;
    }

    const path = e.composedPath();
    const popconfirmContainer = this.shadowRoot?.querySelector('.popconfirm-manager__item');

    if (popconfirmContainer && !path.includes(popconfirmContainer)) {
      // Cancel all open popconfirms
      this.items.forEach(item => {
        item.config.onCancel?.();
      });
      this.closeAll();
    }
  }

  /**
   * Handle escape key
   */
  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.items.length > 0) {
      this.items.forEach(item => {
        item.config.onCancel?.();
      });
      this.closeAll();
    }
  }

  /**
   * Adjust position to keep popconfirm within viewport
   */
  private adjustPosition(position: PopconfirmPosition): PopconfirmPosition {
    const padding = 16;
    const estimatedWidth = 280;
    const estimatedHeight = 120;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + estimatedWidth > viewportWidth - padding) {
      x = viewportWidth - estimatedWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }

    // Adjust vertical position
    if (y + estimatedHeight > viewportHeight - padding) {
      y = position.y - estimatedHeight - 8; // Show above cursor
    }
    if (y < padding) {
      y = padding;
    }

    return { x, y };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `popconfirm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get icon color based on icon type
   */
  private getIconClass(icon?: string): string {
    const iconColorMap: Record<string, string> = {
      [PopconfirmIcon.Warning]: 'warning',
      [PopconfirmIcon.Question]: 'question',
      [PopconfirmIcon.Info]: 'info',
      [PopconfirmIcon.Error]: 'error',
      [PopconfirmIcon.Success]: 'success',
    };

    return iconColorMap[icon || ''] || 'warning';
  }

  /**
   * Render a single popconfirm item
   */
  private renderItem(item: PopconfirmItem) {
    const { config, position } = item;
    const icon = config.icon || PopconfirmIcon.Warning;
    const iconClass = config.iconColor ? 'custom' : this.getIconClass(icon);
    const showCancel = config.showCancel !== false;

    const positionStyles = {
      left: `${position.x}px`,
      top: `${position.y}px`,
    };

    const iconStyles = config.iconColor ? { color: config.iconColor } : {};

    return html`
      <div
        class="popconfirm-manager__item"
        style=${styleMap(positionStyles)}
        @click=${(e: Event) => e.stopPropagation()}
      >
        <div class="popconfirm-manager__content">
          <div class="popconfirm-manager__message">
            <div
              class="popconfirm-manager__icon popconfirm-manager__icon--${iconClass}"
              style=${styleMap(iconStyles)}
            >
              <nr-icon name=${icon}></nr-icon>
            </div>
            <div class="popconfirm-manager__text">
              ${config.title ? html`<nr-label class="popconfirm-manager__title" size="medium">${config.title}</nr-label>` : nothing}
              ${config.description ? html`<nr-label class="popconfirm-manager__description" size="small" variant="secondary">${config.description}</nr-label>` : nothing}
            </div>
          </div>
          <div class="popconfirm-manager__buttons">
            ${showCancel
              ? html`
                  <nr-button
                    size="small"
                    @click=${(e: Event) => this.handleCancel(item, e)}
                  >
                    ${config.cancelText || 'Cancel'}
                  </nr-button>
                `
              : nothing}
            <nr-button
              size="small"
              type=${config.okType === 'danger' ? 'danger' : config.okType === 'primary' ? 'primary' : 'default'}
              ?loading=${item.loading}
              ?disabled=${item.loading}
              @click=${(e: Event) => this.handleConfirm(item, e)}
            >
              ${config.okText || 'OK'}
            </nr-button>
          </div>
        </div>
      </div>
    `;
  }

  override render() {
    if (this.items.length === 0) {
      return nothing;
    }

    return html`
      <div class="popconfirm-manager">
        ${this.items.map(item => this.renderItem(item))}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-popconfirm-manager': NrPopconfirmManagerElement;
  }
}
