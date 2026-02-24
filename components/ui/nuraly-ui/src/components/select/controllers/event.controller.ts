import { SelectOption } from '../select.types.js';
import { EventController } from '../interfaces/index.js';
import { BaseSelectController } from './base.controller.js';

/**
 * Event controller manages all event handling for the select component
 */
export class SelectEventController extends BaseSelectController implements EventController {
  
  /**
   * Handles clicks on the select trigger element
   */
  handleTriggerClick = (event: Event): void => {
    if (this.host.disabled) return;
    event.preventDefault();
    event.stopPropagation(); // Prevent window click handler from interfering
    this.host.toggleDropdown();
  };

  /**
   * Handles clicks on individual options
   */
  handleOptionClick = (event: Event, option: SelectOption): void => {
    event.stopPropagation();
    if (option.disabled) return;
    
    // Use toggleOption for multi-select to allow deselecting
    if (this.host.multiple) {
      this.host.toggleOption(option);
    } else {
      this.host.selectOption(option);
      // Auto-close dropdown for single selection mode
      this.host.closeDropdown();
    }
  };

  /**
   * Handles removal of selected tags in multiple selection mode
   */
  handleTagRemove = (event: Event, option: SelectOption): void => {
    event.stopPropagation();
    this.host.unselectOption(option);
  };

  /**
   * Handles the clear all selections button
   */
  handleClearAll = (event: Event): void => {
    event.stopPropagation();
    this.host.clearSelection();
  };

  /**
   * Handles keyboard navigation and interactions
   */
  handleKeyDown = (event: KeyboardEvent): void => {
    // Delegate to keyboard controller
    const keyboardController = (this.host as any).keyboardController;
    if (keyboardController) {
      keyboardController.handleKeyDown(event);
    }
  };

  /**
   * Handles focus events
   */
  handleFocus = (): void => {
    // Delegate to focus controller
    const focusController = (this.host as any).focusController;
    if (focusController) {
      focusController.handleFocus();
    }
  };

  /**
   * Handles blur events
   */
  handleBlur = (): void => {
    // Delegate to focus controller
    const focusController = (this.host as any).focusController;
    if (focusController) {
      focusController.handleBlur();
    }
    // Dropdown closing is managed by window click handler for better UX
  };

  /**
   * Handles clicks outside the component to close dropdown
   * Uses composedPath() to properly detect clicks on slotted content
   */
  handleWindowClick = (event: Event): void => {
    const path = event.composedPath();
    // Check if click is inside the host element using composed path
    // This works correctly with shadow DOM and slotted content
    if (!path.includes(this.host as unknown as EventTarget)) {
      this.host.closeDropdown();
    }
  };

  /**
   * Sets up global event listeners (called when dropdown opens)
   */
  setupEventListeners(): void {
    window.addEventListener('click', this.handleWindowClick);
  }

  /**
   * Removes global event listeners (called on disconnect or dropdown close)
   */
  removeEventListeners(): void {
    window.removeEventListener('click', this.handleWindowClick);
  }

  /**
   * Cleanup when host disconnects
   */
  override hostDisconnected(): void {
    super.hostDisconnected();
    this.removeEventListeners();
  }
}
