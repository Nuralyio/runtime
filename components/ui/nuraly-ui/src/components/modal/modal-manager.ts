/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Modal stack item interface
 */
export interface ModalStackItem {
  modal: any; // The modal element
  previousFocus: Element | null; // The element that had focus before this modal
  zIndex: number; // The z-index for this modal
  id: string; // Unique identifier
}

/**
 * Modal Manager - Singleton class to handle nested modals
 * Manages the modal stack, z-index allocation, and focus management
 */
class ModalManagerClass {
  private modalStack: ModalStackItem[] = [];
  private baseZIndex = 1000;
  private zIndexIncrement = 10;
  private bodyScrollDisabled = false;
  private originalBodyOverflow = '';

  /**
   * Opens a modal and adds it to the stack
   */
  openModal(modal: any): number {
    const id = this.generateModalId();
    const zIndex = this.baseZIndex + (this.modalStack.length * this.zIndexIncrement);
    
    // Store the currently focused element
    const previousFocus = document.activeElement;
    
    // Add to stack
    const stackItem: ModalStackItem = {
      modal,
      previousFocus,
      zIndex,
      id
    };
    
    this.modalStack.push(stackItem);
    
    // Disable body scroll for the first modal
    if (this.modalStack.length === 1) {
      this.disableBodyScroll();
    }
    
    // Update modal z-index
    this.updateModalZIndex(modal, zIndex);
    
    console.log(`Modal opened. Stack depth: ${this.modalStack.length}, Z-Index: ${zIndex}`);
    
    return zIndex;
  }

  /**
   * Closes a modal and removes it from the stack
   */
  closeModal(modal: any): void {
    const index = this.modalStack.findIndex(item => item.modal === modal);
    
    if (index === -1) {
      console.warn('Attempting to close a modal that is not in the stack');
      return;
    }
    
    const stackItem = this.modalStack[index];
    
    // If this is not the top modal, close all modals above it first
    if (index < this.modalStack.length - 1) {
      const modalsToClose = this.modalStack.slice(index + 1);
      modalsToClose.forEach(item => {
        if (item.modal && typeof item.modal.closeModal === 'function') {
          item.modal.closeModal();
        }
      });
    }
    
    // Remove from stack
    this.modalStack.splice(index);
    
    // Restore focus to the previous element
    if (stackItem.previousFocus instanceof HTMLElement) {
      // Use setTimeout to ensure the modal DOM changes are complete
      setTimeout(() => {
        if (stackItem.previousFocus instanceof HTMLElement) {
          stackItem.previousFocus.focus();
        }
      }, 100);
    }
    
    // If this was the last modal, restore body scroll
    if (this.modalStack.length === 0) {
      this.restoreBodyScroll();
    }
    
    console.log(`Modal closed. Stack depth: ${this.modalStack.length}`);
  }

  /**
   * Gets the current z-index for a modal
   */
  getModalZIndex(modal: any): number {
    const stackItem = this.modalStack.find(item => item.modal === modal);
    return stackItem ? stackItem.zIndex : this.baseZIndex;
  }

  /**
   * Checks if a modal is the top modal in the stack
   */
  isTopModal(modal: any): boolean {
    if (this.modalStack.length === 0) return false;
    return this.modalStack[this.modalStack.length - 1].modal === modal;
  }

  /**
   * Gets the number of open modals
   */
  getStackDepth(): number {
    return this.modalStack.length;
  }

  /**
   * Closes all modals
   */
  closeAllModals(): void {
    // Close from top to bottom to maintain proper order
    const modalsToClose = [...this.modalStack].reverse();
    modalsToClose.forEach(item => {
      if (item.modal && typeof item.modal.closeModal === 'function') {
        item.modal.closeModal();
      }
    });
  }

  /**
   * Gets all open modal IDs
   */
  getOpenModalIds(): string[] {
    return this.modalStack.map(item => item.id);
  }

  /**
   * Checks if any modals are open
   */
  hasOpenModals(): boolean {
    return this.modalStack.length > 0;
  }

  private generateModalId(): string {
    return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateModalZIndex(modal: any, zIndex: number): void {
    if (modal && modal.style) {
      modal.style.setProperty('--nuraly-z-modal-backdrop', zIndex.toString());
    }
  }

  private disableBodyScroll(): void {
    if (!this.bodyScrollDisabled) {
      this.originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      this.bodyScrollDisabled = true;
    }
  }

  private restoreBodyScroll(): void {
    if (this.bodyScrollDisabled) {
      document.body.style.overflow = this.originalBodyOverflow;
      this.bodyScrollDisabled = false;
    }
  }

  /**
   * Handle Escape key for nested modals - only close the top modal
   */
  handleEscapeKey(): boolean {
    if (this.modalStack.length === 0) return false;
    
    const topModal = this.modalStack[this.modalStack.length - 1].modal;
    if (topModal && typeof topModal.closeModal === 'function' && topModal.closable !== false) {
      topModal.closeModal();
      return true;
    }
    
    return false;
  }

  /**
   * Handle backdrop clicks - only close if it's the top modal
   */
  handleBackdropClick(modal: any): boolean {
    return this.isTopModal(modal);
  }
}

// Export singleton instance
export const ModalManager = new ModalManagerClass();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).ModalManager = ModalManager;
}