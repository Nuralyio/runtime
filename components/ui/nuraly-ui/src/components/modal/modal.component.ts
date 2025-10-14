/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, LitElement, nothing, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  ModalSize,
  ModalPosition,
  ModalAnimation,
  ModalBackdrop,
  EMPTY_STRING
} from './modal.types.js';
import { styles } from './modal.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import { ModalManager } from './modal-manager.js';


// Import controllers
import {
  ModalDragController,
  ModalDragHost,
  ModalKeyboardController,
  ModalKeyboardHost
} from './controllers/index.js';

/**
 * Versatile modal component with multiple sizes, animations, and enhanced functionality.
 * 
 * @example
 * ```html
 * <!-- Simple usage -->
 * <nr-modal open title="My Modal">
 *   <p>Modal content goes here</p>
 * </nr-modal>
 * 
 * <!-- With custom configuration -->
 * <nr-modal 
 *   open
 *   size="large"
 *   position="top"
 *   animation="zoom"
 *   backdrop="static"
 *   draggable>
 *   <div slot="header">
 *     <nr-icon name="info"></nr-icon>
 *     <span>Custom Header</span>
 *   </div>
 *   <p>Modal content</p>
 *   <div slot="footer">
 *     <nr-button type="secondary">Cancel</nr-button>
 *     <nr-button type="primary">OK</nr-button>
 *   </div>
 * </nr-modal>
 * ```
 * 
 * @fires modal-open - Modal opened
 * @fires modal-close - Modal closed
 * @fires modal-before-close - Before modal closes (cancelable)
 * @fires modal-after-open - After modal opens
 * @fires modal-escape - Escape key pressed
 * 
 * @slot default - Modal body content
 * @slot header - Custom header content
 * @slot footer - Custom footer content
 */
@customElement('nr-modal')
export class NrModalElement extends NuralyUIBaseMixin(LitElement) 
  implements ModalDragHost, ModalKeyboardHost {
  static override styles = styles;

  /** Whether the modal is open */
  @property({ type: Boolean, reflect: true })
  open = false;

  /** Modal size (small, medium, large, xl) */
  @property({ type: String })
  size: ModalSize = ModalSize.Medium;

  /** Modal position (center, top, bottom) */
  @property({ type: String })
  position: ModalPosition = ModalPosition.Center;

  /** Animation type */
  @property({ type: String })
  animation: ModalAnimation = ModalAnimation.Fade;

  /** Backdrop behavior */
  @property({ type: String })
  backdrop: ModalBackdrop = ModalBackdrop.Closable;

  /** Whether the modal can be closed */
  @property({ type: Boolean })
  closable = true;

  /** Whether the modal can be dragged */
  @property({ type: Boolean })
  modalDraggable = false;

  /** Whether the modal is resizable */
  @property({ type: Boolean })
  resizable = false;

  /** Whether the modal is fullscreen */
  @property({ type: Boolean })
  fullscreen = false;

  /** Modal title */
  @property({ type: String })
  modalTitle = EMPTY_STRING;

  /** Show close button in header */
  @property({ type: Boolean, attribute: 'show-close-button' })
  showCloseButton = true;

  /** Header icon */
  @property({ type: String })
  headerIcon = EMPTY_STRING;

  /** Z-index for the modal */
  @property({ type: Number })
  zIndex = 1000;

  /** Custom width */
  @property({ type: String })
  width = EMPTY_STRING;

  /** Custom height */
  @property({ type: String })
  height = EMPTY_STRING;

  /** Dragging state */
  @state()
  isDragging = false;

  /** Current X offset for dragging */
  @property({ type: Number })
  offsetX = 0;

  /** Current Y offset for dragging */
  @property({ type: Number })
  offsetY = 0;

  /** Animation state */
  @state()
  private animationState: 'closed' | 'opening' | 'open' | 'closing' = 'closed';

  /** Previous focus element */
  private previousActiveElement: Element | null = null;

  override requiredComponents = ['nr-icon', 'nr-button'];

  // Controllers
  private dragController = new ModalDragController(this);
  private keyboardController = new ModalKeyboardController(this);

  override connectedCallback() {
    super.connectedCallback();
    this.validateDependencies();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    // Restore focus when modal is destroyed
    if (this.previousActiveElement instanceof HTMLElement) {
      this.previousActiveElement.focus();
    }
  }

  override willUpdate(changedProperties: PropertyValues) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('open')) {
      if (this.open) {
        this.handleOpen();
      } else {
        this.handleClose();
      }
    }
  }

  private handleOpen() {
    // Register with modal manager and get z-index
    const assignedZIndex = ModalManager.openModal(this);
    this.zIndex = assignedZIndex;
    
    // Set animation state to opening
    this.animationState = 'opening';
    
    // Dispatch before open event
    this.dispatchEvent(new CustomEvent('modal-open', {
      bubbles: true,
      detail: { modal: this, stackDepth: ModalManager.getStackDepth() }
    }));

    // Wait for DOM update, then start JavaScript animation
    this.updateComplete.then(() => {
      this.startOpenAnimation();
    });
  }

  private startOpenAnimation() {
    const modalElement = this.shadowRoot?.querySelector('.modal') as HTMLElement;
    const backdropElement = this.shadowRoot?.querySelector('.modal-backdrop') as HTMLElement;
    
    if (!modalElement || !backdropElement) return;

    // Get animation keyframes based on animation type
    const { modalKeyframes} = this.getAnimationKeyframes();
    
    // Start animations
    const modalAnimation = modalElement.animate(modalKeyframes, {
      duration: 300,
      easing: 'ease',
      fill: 'forwards'
    });


    // When animation completes
    modalAnimation.addEventListener('finish', () => {
      this.animationState = 'open';
      
      // Only focus if this is the top modal
      if (ModalManager.isTopModal(this)) {
        this.keyboardController.focusFirstElement();
      }
      
      // Dispatch after open event
      this.dispatchEvent(new CustomEvent('modal-after-open', {
        bubbles: true,
        detail: { modal: this, stackDepth: ModalManager.getStackDepth() }
      }));
    });
  }

  private getAnimationKeyframes() {
    const backdropKeyframes = [
      { opacity: 0 },
      { opacity: 1 }
    ];

    let modalKeyframes;
    switch (this.animation) {
      case 'fade':
        modalKeyframes = [
          { opacity: 0, transform: 'scale(0.9)' },
          { opacity: 1, transform: 'scale(1)' }
        ];
        break;
      case 'zoom':
        modalKeyframes = [
          { opacity: 0, transform: 'scale(0.7)' },
          { opacity: 1, transform: 'scale(1)' }
        ];
        break;
      case 'slide-up':
        modalKeyframes = [
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ];
        break;
      case 'slide-down':
        modalKeyframes = [
          { opacity: 0, transform: 'translateY(-20px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ];
        break;
      default:
        modalKeyframes = [
          { opacity: 0, transform: 'scale(0.9)' },
          { opacity: 1, transform: 'scale(1)' }
        ];
    }

    return { modalKeyframes, backdropKeyframes };
  }

  private handleClose() {
    this.animationState = 'closing';
    
    // Unregister from modal manager
    ModalManager.closeModal(this);
    
    // Reset drag position
    this.dragController.resetPosition();
    
    // Wait for animation to complete
    setTimeout(() => {
      this.animationState = 'closed';
    }, 300);
  }

  /**
   * Opens the modal
   */
  openModal() {
    this.open = true;
  }

  /**
   * Closes the modal
   */
  closeModal() {
    if (!this.closable) return;

    // Dispatch before close event (cancelable)
    const beforeCloseEvent = new CustomEvent('modal-before-close', {
      bubbles: true,
      cancelable: true,
      detail: { 
        modal: this,
        cancel: () => beforeCloseEvent.preventDefault()
      }
    });

    const dispatched = this.dispatchEvent(beforeCloseEvent);
    
    // Only close if event wasn't cancelled
    if (dispatched) {
      this.open = false;
      
      // Dispatch close event
      this.dispatchEvent(new CustomEvent('modal-close', {
        bubbles: true,
        detail: { modal: this }
      }));
    }
  }

  private handleBackdropClick = (event: MouseEvent) => {
    // Only allow backdrop close if this is the top modal and backdrop is closable
    if (this.backdrop === ModalBackdrop.Closable && 
        event.target === event.currentTarget && 
        ModalManager.handleBackdropClick(this)) {
      this.closeModal();
    }
  };

  private getBackdropClasses() {
    return {
      'modal-backdrop': true,
      'modal-backdrop--hidden': !this.open,
      [`modal-backdrop--position-${this.position}`]: true
    };
  }

  private getModalClasses() {
    return {
      'modal': true,
      [`modal--size-${this.size}`]: !this.fullscreen,
      'modal--fullscreen': this.fullscreen,
      [`modal--animation-${this.animation}`]: this.animationState === 'opening' || this.animationState === 'open',
      'modal--dragging': this.isDragging,
      'modal--resizable': this.resizable
    };
  }

  private getModalStyles() {
    const styles: any = {};
    
    if (this.zIndex) {
      styles['--nuraly-z-modal-backdrop'] = this.zIndex.toString();
    }
    
    if (this.width) {
      styles.width = this.width;
    }
    
    if (this.height) {
      styles.height = this.height;
    }
    
    return styles;
  }

  private renderHeader() {
    const hasCustomHeader = this.querySelector('[slot="header"]');
    const hasTitle = this.modalTitle || this.headerIcon;
    
    if (!hasCustomHeader && !hasTitle && !this.showCloseButton) {
      return nothing;
    }

    return html`
      <div class="modal-header ${this.modalDraggable ? 'modal-header--draggable' : ''}">
        ${hasCustomHeader ? html`
          <div class="modal-header-content">
            <slot name="header"></slot>
          </div>
        ` : hasTitle ? html`
          <div class="modal-header-content">
            ${this.headerIcon ? html`
              <nr-icon class="modal-header-icon" name="${this.headerIcon}"></nr-icon>
            ` : nothing}
            ${this.modalTitle ? html`
              <h2 class="modal-title">${this.modalTitle}</h2>
            ` : nothing}
          </div>
        ` : nothing}
        
        ${this.showCloseButton ? html`
          <button 
            class="modal-close-button"
            @click=${this.closeModal}
            aria-label="Close modal"
            type="button">
            <nr-icon class="modal-close-icon" name="close"></nr-icon>
          </button>
        ` : nothing}
      </div>
    `;
  }

  private renderFooter() {
    const hasCustomFooter = this.querySelector('[slot="footer"]');
    
    if (!hasCustomFooter) {
      return nothing;
    }

    return html`
      <div class="modal-footer">
        <slot name="footer"></slot>
      </div>
    `;
  }

   override updated() {
        this.updateDataTheme();
    }

   private updateDataTheme() {
        if (!this.closest('[data-theme]')) {
            this.setAttribute('data-theme', this.currentTheme);
        }
    }

  override render() {
    if (!this.open && this.animationState === 'closed') {
      return nothing;
    }

    return html`
      <div 
        class=${classMap(this.getBackdropClasses())}
        @click=${this.handleBackdropClick}
        style=${styleMap(this.getModalStyles())}>
        
        <div 
          class=${classMap(this.getModalClasses())}
          role="dialog"
          aria-modal="true"
          aria-labelledby=${this.modalTitle ? 'modal-title' : nothing}
          tabindex="-1">
          
          ${this.renderHeader()}
          
          <div class="modal-body">
            <slot></slot>
          </div>
          
          ${this.renderFooter()}
          
          ${this.resizable ? html`
            <div class="resize-handle"></div>
          ` : nothing}
        </div>
      </div>
    `;
  }
}
