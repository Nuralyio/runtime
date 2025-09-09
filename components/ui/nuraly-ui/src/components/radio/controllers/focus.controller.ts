/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { FocusController } from '../interfaces/focus-controller.interface.js';

/**
 * Controller that manages focus state and focus handling for radio groups
 * Implements proper focus management with accessibility compliance
 * 
 * Features:
 * - Tracks focused radio option index
 * - Manages focus state transitions
 * - Provides focus/blur methods for programmatic control
 * - Handles roving tabindex for accessibility
 * 
 * @example
 * ```typescript
 * const controller = new RadioFocusController(hostElement);
 * controller.setFocusedOption(1); // Focus second option
 * controller.focus(); // Programmatically focus the group
 * ```
 */
export class RadioFocusController implements FocusController {
  private host: any; // RadioElement host
  private _focusedIndex: number = -1;
  private _hasFocus: boolean = false;
  
  private boundFocusInHandler: (event: FocusEvent) => void;
  private boundFocusOutHandler: (event: FocusEvent) => void;

  /**
   * Creates a new RadioFocusController instance
   * Sets up event handlers for focus management
   * 
   * @param host - The host radio element
   */
  constructor(host: any) {
    this.host = host;
    this.boundFocusInHandler = this.handleFocusIn.bind(this);
    this.boundFocusOutHandler = this.handleFocusOut.bind(this);
    host.addController(this);
  }

  /**
   * Called when the host element is connected to the DOM
   * Sets up focus event listeners for the radio group
   */
  hostConnected() {
    (this.host as any).addEventListener('focusin', this.boundFocusInHandler);
    (this.host as any).addEventListener('focusout', this.boundFocusOutHandler);
  }

  /**
   * Called when the host element is disconnected from the DOM
   * Removes focus event listeners to prevent memory leaks
   */
  hostDisconnected() {
    (this.host as any).removeEventListener('focusin', this.boundFocusInHandler);
    (this.host as any).removeEventListener('focusout', this.boundFocusOutHandler);
  }

  /**
   * Gets the index of the currently focused radio option
   * 
   * @returns The focused option index, -1 if none focused
   * 
   * @example
   * ```typescript
   * const index = controller.focusedIndex;
   * console.log(`Option ${index} is focused`);
   * ```
   */
  get focusedIndex(): number {
    return this._focusedIndex;
  }

  /**
   * Checks if the radio group currently has focus
   * 
   * @returns True if any option in the group has focus, false otherwise
   * 
   * @example
   * ```typescript
   * if (controller.hasFocus) {
   *   console.log('Radio group is focused');
   * }
   * ```
   */
  get hasFocus(): boolean {
    return this._hasFocus;
  }

  /**
   * Sets the focused option by index
   * Updates internal state and triggers re-render if needed
   * 
   * @param index - The index of the option to focus
   * 
   * @example
   * ```typescript
   * controller.setFocusedOption(2); // Focus third option
   * ```
   */
  setFocusedOption(index: number): void {
    const oldIndex = this._focusedIndex;
    this._focusedIndex = index;
    
    if (oldIndex !== index) {
      this.host.requestUpdate();
    }
  }

  /**
   * Get the currently focused option index (method version for interface compliance)
   * @returns The focused option index or -1 if none focused
   */
  getFocusedIndex(): number {
    return this._focusedIndex;
  }

  clearFocus(): void {
    this._focusedIndex = -1;
    this._hasFocus = false;
    this.host.requestUpdate();
  }

  // Event handlers
  private handleFocusIn(event: FocusEvent): void {
    this._hasFocus = true;
    
    // Determine which option received focus
    const target = event.target as HTMLElement;
    
    if (target && target.matches('input[type="radio"], nr-button[role="radio"]')) {
      const inputs = (this.host as any).shadowRoot?.querySelectorAll('input[type="radio"], nr-button[role="radio"]');
      if (inputs) {
        const index = Array.from(inputs).indexOf(target);
        if (index !== -1) {
          this.setFocusedOption(index);
        }
      }
    }
    
    this.host.requestUpdate();
  }

  private handleFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;
    const host = this.host as any;
    
    // Check if focus is moving outside the radio group
    if (!relatedTarget || !host.contains(relatedTarget)) {
      this._hasFocus = false;
      this.host.requestUpdate();
    }
  }

  // Programmatic focus methods
  focus(): void {
    const options = this.host.options;
    const selectedValue = this.host.value;
    
    // Focus the selected option if one exists
    const selectedIndex = options.findIndex((option: any) => option.value === selectedValue);
    if (selectedIndex !== -1) {
      this.focusOptionAtIndex(selectedIndex);
      return;
    }
    
    // Otherwise focus the first non-disabled option
    const firstEnabledIndex = options.findIndex((option: any) => !option.disabled);
    if (firstEnabledIndex !== -1) {
      this.focusOptionAtIndex(firstEnabledIndex);
    }
  }

  blur(): void {
    const host = this.host as any;
    const shadowRoot = host.shadowRoot;
    
    if (!shadowRoot) return;

    // Find and blur any focused radio input or button
    const focusedElement = shadowRoot.querySelector('input[type="radio"]:focus, nr-button[role="radio"]:focus');
    if (focusedElement && typeof focusedElement.blur === 'function') {
      focusedElement.blur();
    }
  }

  private focusOptionAtIndex(index: number): void {
    const host = this.host as any;
    const shadowRoot = host.shadowRoot;
    
    if (!shadowRoot) return;

    // Update tab indices first
    this.updateTabIndices(index);

    // Focus the element at the specified index
    const radioInputs = shadowRoot.querySelectorAll('input[type="radio"]');
    if (radioInputs[index]) {
      radioInputs[index].focus();
      return;
    }

    const buttons = shadowRoot.querySelectorAll('nr-button[role="radio"]');
    if (buttons[index]) {
      buttons[index].focus();
      return;
    }
  }

  // Tab index management for proper keyboard navigation
  updateTabIndices(focusedIndex?: number): void {
    const host = this.host as any;
    const shadowRoot = host.shadowRoot;
    
    if (!shadowRoot) return;

    const options = this.host.options;
    const selectedValue = this.host.value;
    
    // Determine which option should be tabbable
    let tabbableIndex = focusedIndex;
    if (tabbableIndex === undefined) {
      // If no specific index, use selected option or first enabled option
      const selectedIndex = options.findIndex((option: any) => option.value === selectedValue);
      tabbableIndex = selectedIndex !== -1 ? selectedIndex : options.findIndex((option: any) => !option.disabled);
    }

    // Update radio inputs
    const radioInputs = shadowRoot.querySelectorAll('input[type="radio"]');
    radioInputs.forEach((input: HTMLInputElement, index: number) => {
      input.tabIndex = index === tabbableIndex ? 0 : -1;
    });

    // Update buttons (for button-style radio)
    const buttons = shadowRoot.querySelectorAll('nr-button[role="radio"]');
    buttons.forEach((button: any, index: number) => {
      button.tabIndex = index === tabbableIndex ? 0 : -1;
    });
  }

  // Method to be called after rendering to update tab indices
  hostUpdated(): void {
    this.updateTabIndices();
  }
}
