/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement } from 'lit';
import { ButtonType } from '../button.types.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Interface for components that support link behavior
 */
export interface LinkCapable {
  /**
   * Button type that determines if it should render as link
   */
  type: ButtonType;
  
  /**
   * URL for link buttons
   */
  href: string;
  
  /**
   * Target attribute for link buttons
   */
  target: string;
  
  /**
   * Get the appropriate element tag (button or a)
   */
  getElementTag(): string;
  
  /**
   * Get link-specific attributes
   */
  getLinkAttributes(): Record<string, any>;
  
  /**
   * Check if component should render as a link
   */
  isLinkType(): boolean;
}

/**
 * Mixin that provides link behavior for button components
 * Handles the distinction between button and anchor elements
 * 
 * @param superClass - The base class to extend
 * @returns Enhanced class with link capabilities
 * 
 * @example
 * ```typescript
 * export class MyButton extends LinkMixin(LitElement) {
 *   @property({ type: String }) type = ButtonType.Default;
 *   @property({ type: String }) href = '';
 *   @property({ type: String }) target = '';
 *   
 *   render() {
 *     const tag = this.getElementTag();
 *     const attrs = this.getLinkAttributes();
 *     
 *     return html`
 *       <${tag} ...${attrs}>
 *         <slot></slot>
 *       </${tag}>
 *     `;
 *   }
 * }
 * ```
 */
export const LinkMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class LinkMixinClass extends superClass implements LinkCapable {
    
    declare type: ButtonType;
    declare href: string;
    declare target: string;
    
    /**
     * Check if the button should render as a link
     */
    isLinkType(): boolean {
      return this.type === ButtonType.Link && !!this.href;
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
      const attributes: Record<string, any> = {};
      
      if (this.isLinkType()) {
        attributes.href = this.href;
        
        if (this.target) {
          attributes.target = this.target;
          
          // Add security attributes for external links
          if (this.target === '_blank') {
            attributes.rel = 'noopener noreferrer';
          }
        }
        
        attributes.role = 'link';
      } else {
        attributes.role = 'button';
      }
      
      return attributes;
    }
    
    /**
     * Handle link navigation with proper event dispatching
     */
    handleLinkNavigation(event: Event): void {
      if (this.isLinkType()) {
        // Dispatch custom navigation event if EventHandling mixin is available
        if (typeof (this as any).dispatchCustomEvent === 'function') {
          (this as any).dispatchCustomEvent('link-navigation', {
            href: this.href,
            target: this.target,
            timestamp: Date.now(),
            originalEvent: event
          });
        }
      }
    }
  }

  return LinkMixinClass as Constructor<LinkCapable> & T;
};
