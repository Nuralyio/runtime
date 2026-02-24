/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseCollapseController, CollapseControllerHost } from './base.controller.js';

/**
 * Keyboard navigation controller for collapse component
 * Handles keyboard accessibility
 */
export class CollapseKeyboardController extends BaseCollapseController {
  private currentFocusIndex = -1;

  constructor(host: CollapseControllerHost) {
    super(host);
  }

  override hostConnected(): void {
    super.hostConnected();
    this.addKeyboardListeners();
  }

  override hostDisconnected(): void {
    super.hostDisconnected();
    this.removeKeyboardListeners();
  }

  /**
   * Add keyboard event listeners
   */
  private addKeyboardListeners(): void {
    const hostElement = this.host as unknown as HTMLElement;
    hostElement.addEventListener('keydown', this.handleKeyDown);
    hostElement.addEventListener('focus', this.handleFocus, true);
  }

  /**
   * Remove keyboard event listeners
   */
  private removeKeyboardListeners(): void {
    const hostElement = this.host as unknown as HTMLElement;
    hostElement.removeEventListener('keydown', this.handleKeyDown);
    hostElement.removeEventListener('focus', this.handleFocus, true);
  }

  /**
   * Handle keydown events
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement;
    const headerElement = target.closest('.collapse-header');
    
    if (!headerElement) return;

    const sectionIndex = this.getSectionIndex(headerElement);
    if (sectionIndex === -1) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleSection(sectionIndex);
        break;
      
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextSection(sectionIndex);
        break;
      
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousSection(sectionIndex);
        break;
      
      case 'Home':
        event.preventDefault();
        this.focusFirstSection();
        break;
      
      case 'End':
        event.preventDefault();
        this.focusLastSection();
        break;
    }
  };

  /**
   * Handle focus events
   */
  private handleFocus = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    const headerElement = target.closest('.collapse-header');
    
    if (headerElement) {
      const sectionIndex = this.getSectionIndex(headerElement);
      this.currentFocusIndex = sectionIndex;
    }
  };

  /**
   * Toggle section
   */
  private toggleSection(index: number): void {
    const section = this.getSection(index);
    if (section && section.collapsible !== false && !section.disabled) {
      // Dispatch toggle event - the main component will handle the actual toggle
      const hostElement = this.host as unknown as HTMLElement;
      hostElement.dispatchEvent(new CustomEvent('section-toggle-requested', {
        detail: { index },
        bubbles: false
      }));
    }
  }

  /**
   * Focus next section
   */
  private focusNextSection(currentIndex: number): void {
    const nextIndex = this.findNextFocusableSection(currentIndex);
    if (nextIndex !== -1) {
      this.focusSection(nextIndex);
    }
  }

  /**
   * Focus previous section
   */
  private focusPreviousSection(currentIndex: number): void {
    const prevIndex = this.findPreviousFocusableSection(currentIndex);
    if (prevIndex !== -1) {
      this.focusSection(prevIndex);
    }
  }

  /**
   * Focus first section
   */
  private focusFirstSection(): void {
    const firstIndex = this.findNextFocusableSection(-1);
    if (firstIndex !== -1) {
      this.focusSection(firstIndex);
    }
  }

  /**
   * Focus last section
   */
  private focusLastSection(): void {
    const lastIndex = this.findPreviousFocusableSection(this.host.sections.length);
    if (lastIndex !== -1) {
      this.focusSection(lastIndex);
    }
  }

  /**
   * Focus specific section
   */
  private focusSection(index: number): void {
    const hostElement = this.host as unknown as HTMLElement;
    const headerElement = hostElement.shadowRoot?.querySelector(
      `.collapse-header[data-section-index="${index}"]`
    ) as HTMLElement;
    
    if (headerElement) {
      headerElement.focus();
      this.currentFocusIndex = index;
    }
  }

  /**
   * Find next focusable section
   */
  private findNextFocusableSection(currentIndex: number): number {
    for (let i = currentIndex + 1; i < this.host.sections.length; i++) {
      const section = this.host.sections[i];
      if (section.collapsible !== false && !section.disabled) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Find previous focusable section
   */
  private findPreviousFocusableSection(currentIndex: number): number {
    for (let i = currentIndex - 1; i >= 0; i--) {
      const section = this.host.sections[i];
      if (section.collapsible !== false && !section.disabled) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Get section index from header element
   */
  private getSectionIndex(headerElement: Element): number {
    const indexAttr = headerElement.getAttribute('data-section-index');
    return indexAttr ? parseInt(indexAttr, 10) : -1;
  }

  /**
   * Get current focus index
   */
  getCurrentFocusIndex(): number {
    return this.currentFocusIndex;
  }
}