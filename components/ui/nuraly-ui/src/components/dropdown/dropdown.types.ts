import { TemplateResult } from 'lit';

/**
 * Dropdown placement options
 */
export const enum DropdownPlacement {
  Bottom = 'bottom',
  Top = 'top',
  BottomStart = 'bottom-start',
  BottomEnd = 'bottom-end',
  TopStart = 'top-start',
  TopEnd = 'top-end',
  Auto = 'auto'
}

/**
 * Dropdown trigger events
 */
export const enum DropdownTrigger {
  Click = 'click',
  Hover = 'hover',
  Focus = 'focus',
  Manual = 'manual'
}

/**
 * Dropdown size variants
 */
export const enum DropdownSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

/**
 * Dropdown animation types
 */
export const enum DropdownAnimation {
  None = 'none',
  Fade = 'fade',
  Slide = 'slide',
  Scale = 'scale'
}

/**
 * Dropdown item configuration
 */
export interface DropdownItem {
  id: string;
  label: string;
  value?: any;
  icon?: string;
  disabled?: boolean;
  divider?: boolean;
  options?: DropdownItem[]; // Cascading submenu items (use either this OR customContent)
  customContent?: string | TemplateResult; // Custom HTML string or Lit template for interactive submenu
  additionalData?: any;
}

/**
 * Dropdown position information
 */
export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  height?: number;
  placement: DropdownPlacement;
}

/**
 * Dropdown configuration
 */
export interface DropdownConfig {
  placement?: DropdownPlacement;
  trigger?: DropdownTrigger;
  size?: DropdownSize;
  animation?: DropdownAnimation;
  disabled?: boolean;
  arrow?: boolean;
  autoClose?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  offset?: number;
  delay?: number;
  maxHeight?: string;
  minWidth?: string;
  items?: DropdownItem[];
}

// Legacy interfaces for backward compatibility - will be deprecated
export interface IOption extends DropdownItem {
  label: string;
  value?: string;
  disabled?: boolean;
  icon?: string;
  children?: IOption[];
  additionalData?: any;
}

export const enum TriggerMode {
  Click = 'click',
  Hover = 'hover',
}

export const enum DropDownDirection {
  Right = 'right',
  Left = 'left',
}
