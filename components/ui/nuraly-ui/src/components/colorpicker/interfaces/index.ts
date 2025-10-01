import type { LitElement } from 'lit';

/**
 * Interface for the ColorPicker host component
 */
export interface ColorPickerHost extends LitElement {
  color: string;
  show: boolean;
  disabled: boolean;
  defaultColorSets: string[];
  size: string;
  
  setupEventListeners?: () => void;
  removeEventListeners?: () => void;
}

/**
 * Dropdown position information
 */
export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  placement: 'top' | 'bottom';
}

/**
 * Interface for dropdown controller
 */
export interface DropdownController {
  readonly isOpen: boolean;
  readonly position: DropdownPosition;
  
  open(): void;
  close(): void;
  toggle(): void;
  calculatePosition(): void;
}

/**
 * Interface for event controller
 */
export interface EventController {
  setupEventListeners(): void;
  removeEventListeners(): void;
  handleTriggerClick(event: Event): void;
  handleColorChange(newColor: string): void;
  handleInputChange(event: CustomEvent): void;
  isValidColor(color: string): boolean;
}

/**
 * Color change event detail
 */
export interface ColorChangeEventDetail {
  value: string;
  previousValue: string;
  isValid: boolean;
}

/**
 * Color click event detail (for default color sets)
 */
export interface ColorClickEventDetail {
  value: string;
}
