import { ReactiveControllerHost } from 'lit';
import { DropdownItem, DropdownPlacement, DropdownTrigger, DropdownAnimation, DropdownSize } from '../dropdown.types.js';

/**
 * Base dropdown controller interface
 */
export interface DropdownBaseController {
  host: DropdownHost;
}

/**
 * Dropdown host interface - represents the dropdown component
 */
export interface DropdownHost extends ReactiveControllerHost {
  // Core properties
  open: boolean;
  disabled: boolean;
  placement: DropdownPlacement;
  trigger: DropdownTrigger;
  size: DropdownSize;
  animation: DropdownAnimation;
  
  // Behavior properties
  arrow: boolean;
  autoClose: boolean;
  closeOnOutsideClick: boolean;
  closeOnEscape: boolean;
  
  // Positioning properties
  offset: number;
  delay: number;
  maxHeight: string;
  minWidth: string;
  
  // Content properties
  items?: DropdownItem[];
  
  // DOM elements
  shadowRoot: ShadowRoot | null;
  
  // Methods that can be called by controller
  requestUpdate(): void;
}

/**
 * Error handler interface
 */
export interface ErrorHandler {
  handleError(error: Error, context: string): void;
}

/**
 * Dropdown positioning information
 */
export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  placement: 'bottom' | 'top' | 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

/**
 * Available space calculation for dropdown positioning
 */
export interface DropdownSpace {
  above: number;
  below: number;
  left: number;
  right: number;
}

/**
 * Dropdown controller specific interface
 */
export interface DropdownController extends DropdownBaseController {
  isOpen: boolean;
  position: DropdownPosition;
  open(): void;
  close(): void;
  toggle(): void;
  calculatePosition?(): void; // Made optional since CSS handles basic positioning
}

/**
 * Event data interfaces
 */
export interface DropdownOpenEventDetail {
  dropdown: DropdownHost;
}

export interface DropdownCloseEventDetail {
  dropdown: DropdownHost;
}

export interface DropdownItemClickEventDetail {
  item: DropdownItem;
  dropdown: DropdownHost;
}