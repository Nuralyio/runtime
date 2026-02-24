import { BaseColorPickerController } from './base.controller.js';
import type { EventController, ColorChangeEventDetail } from '../interfaces/index.js';

/**
 * Event controller manages all event handling for the colorpicker component
 */
export class ColorPickerEventController extends BaseColorPickerController implements EventController {
  private _outsideClickHandler: ((event: Event) => void) | null = null;
  private _escapeHandler: ((event: KeyboardEvent) => void) | null = null;

  /**
   * Setup global event listeners
   */
  setupEventListeners(): void {
    this._outsideClickHandler = this.handleOutsideClick.bind(this);
    document.addEventListener('click', this._outsideClickHandler, true);

    this._escapeHandler = this.handleEscapeKey.bind(this);
    document.addEventListener('keydown', this._escapeHandler);
  }

  /**
   * Remove global event listeners
   */
  removeEventListeners(): void {
    if (this._outsideClickHandler) {
      document.removeEventListener('click', this._outsideClickHandler, true);
      this._outsideClickHandler = null;
    }

    if (this._escapeHandler) {
      document.removeEventListener('keydown', this._escapeHandler);
      this._escapeHandler = null;
    }
  }

  /**
   * Handle trigger click to toggle dropdown
   */
  handleTriggerClick(event: Event): void {
    event.stopPropagation();
    if (!this.host.disabled) {
      const dropdownController = (this.host as any).dropdownController;
      if (dropdownController) {
        dropdownController.toggle();
      }
    }
  }

  /**
   * Handle clicks outside the component
   */
  private handleOutsideClick(event: Event): void {
    const composedPath = event.composedPath();
    if (!composedPath.includes(this.host)) {
      const dropdownController = (this.host as any).dropdownController;
      if (dropdownController) {
        dropdownController.close();
      }
    }
  }

  /**
   * Handle escape key to close dropdown
   */
  private handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.host.show) {
      event.preventDefault();
      const dropdownController = (this.host as any).dropdownController;
      if (dropdownController) {
        dropdownController.close();
      }
    }
  }

  /**
   * Handle color change from picker or default colors
   */
  handleColorChange(newColor: string): void {
    if (this.isValidColor(newColor) && this.host.color !== newColor) {
      const previousColor = this.host.color;
      this.host.color = newColor;
      this.dispatchColorChangeEvent(newColor, previousColor);
      this.requestUpdate();
    }
  }

  /**
   * Handle input change from text input
   */
  handleInputChange(event: CustomEvent): void {
    const newColor = event.detail.value;
    if (newColor && newColor !== this.host.color) {
      this.handleColorChange(newColor);
    }
  }

  /**
   * Dispatch color change event
   */
  private dispatchColorChangeEvent(newColor: string, previousColor: string): void {
    const detail: ColorChangeEventDetail = {
      value: newColor,
      previousValue: previousColor,
      isValid: this.isValidColor(newColor),
      color: newColor,
    };

    // Dispatch nr-color-change event (primary event)
    this.dispatchEvent(
      new CustomEvent('nr-color-change', {
        bubbles: true,
        composed: true,
        detail,
      })
    );

    // Also dispatch hy-color-change for backwards compatibility
    this.dispatchEvent(
      new CustomEvent('hy-color-change', {
        bubbles: true,
        composed: true,
        detail,
      })
    );

    // Also dispatch the old event name for backwards compatibility
    this.dispatchEvent(
      new CustomEvent('color-changed', {
        bubbles: true,
        composed: true,
        detail: { value: newColor, color: newColor },
      })
    );
  }

  /**
   * Validate color format
   */
  isValidColor(color: string): boolean {
    try {
      return CSS.supports('color', color);
    } catch {
      return false;
    }
  }
}
