/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LinkController } from '../interfaces/index.js';
import { BaseButtonController } from './base.controller.js';
import { ButtonType } from '../button.types.js';

/**
 * Link controller manages link behavior for button components
 * Handles the distinction between button and anchor elements
 */
export class ButtonLinkController extends BaseButtonController implements LinkController {

  /**
   * Check if the button should render as a link
   */
  isLinkType(): boolean {
    return this.host.type === ButtonType.Link && !!this.host.href;
  }
  
  /**
   * Get the appropriate element tag based on button type
   */
  getElementTag(): string {
    return this.isLinkType() ? 'a' : 'button';
  }
  
  /**
   * Get link-specific attributes for anchor elements
   */
  getLinkAttributes(): Record<string, any> {
    try {
      const attributes: Record<string, any> = {};
      
      if (this.isLinkType()) {
        attributes.href = this.host.href;
        
        if (this.host.target) {
          attributes.target = this.host.target;
          
          // Add security attributes for external links
          if (this.host.target === '_blank') {
            attributes.rel = 'noopener noreferrer';
          }
        }
        
        attributes.role = 'link';
      } else {
        attributes.role = 'button';
      }
      
      return attributes;
    } catch (error) {
      this.handleError(error as Error, 'getLinkAttributes');
      return { role: 'button' };
    }
  }
  
  /**
   * Handle link navigation with proper event dispatching
   */
  handleLinkNavigation(event: Event): void {
    try {
      if (this.isLinkType()) {
        // Dispatch custom navigation event
        this.dispatchEvent(
          new CustomEvent('link-navigation', {
            detail: {
              href: this.host.href,
              target: this.host.target,
              timestamp: Date.now(),
              originalEvent: event
            },
            bubbles: true,
            composed: true,
          })
        );
      }
    } catch (error) {
      this.handleError(error as Error, 'handleLinkNavigation');
    }
  }
}
