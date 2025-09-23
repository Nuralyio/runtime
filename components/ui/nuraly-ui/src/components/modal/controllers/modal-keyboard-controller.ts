/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { ModalManager } from '../modal-manager.js';

/**
 * Interface for modal keyboard host element
 */
export interface ModalKeyboardHost extends ReactiveControllerHost {
  open: boolean;
  closable: boolean;
  closeModal(): void;
  dispatchEvent(event: Event): boolean;
}

/**
 * Controller for handling modal keyboard interactions
 */
export class ModalKeyboardController implements ReactiveController {
  private host: ModalKeyboardHost;

  constructor(host: ModalKeyboardHost) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  hostDisconnected() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    if (!this.host.open) return;

    switch (event.key) {
      case 'Escape':
        if (this.host.closable) {
          event.preventDefault();
          event.stopPropagation();
          
          // Use ModalManager to handle escape for nested modals
          const handled = ModalManager.handleEscapeKey();
          
          if (!handled) {
            // Fallback: dispatch escape event
            const escapeEvent = new CustomEvent('modal-escape', {
              bubbles: true,
              cancelable: true
            });
            
            const dispatched = this.host.dispatchEvent(escapeEvent);
            
            // Only close if event wasn't cancelled
            if (dispatched) {
              this.host.closeModal();
            }
          }
        }
        break;

      case 'Tab':
        // Only handle tab navigation if this is the top modal
        if (ModalManager.isTopModal(this.host)) {
          this.handleTabNavigation(event);
        }
        break;
    }
  };

  private handleTabNavigation(event: KeyboardEvent) {
    const modal = (this.host as any).shadowRoot?.querySelector('.modal') as HTMLElement;
    if (!modal) return;

    const focusableElements = this.getFocusableElements(modal);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab: moving backwards
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: moving forwards
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    const elements = Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
    
    // Filter out elements that are not visible
    return elements.filter(element => {
      return element.offsetWidth > 0 && 
             element.offsetHeight > 0 && 
             !element.hidden &&
             getComputedStyle(element).visibility !== 'hidden';
    });
  }

  /**
   * Focus the first focusable element in the modal
   */
  focusFirstElement() {
    const modal = (this.host as any).shadowRoot?.querySelector('.modal') as HTMLElement;
    if (!modal) return;

    const focusableElements = this.getFocusableElements(modal);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      // If no focusable elements, focus the modal itself
      modal.focus();
    }
  }

  /**
   * Focus the last focusable element in the modal
   */
  focusLastElement() {
    const modal = (this.host as any).shadowRoot?.querySelector('.modal') as HTMLElement;
    if (!modal) return;

    const focusableElements = this.getFocusableElements(modal);
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }
}