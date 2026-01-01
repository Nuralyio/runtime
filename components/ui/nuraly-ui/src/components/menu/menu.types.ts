/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

export const EMPTY_STRING = '';

/**
 * Menu size variants
 */
export const enum MenuSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

/**
 * Icon position in menu items
 */
export const enum IconPosition {
  Left = 'left',
  Right = 'right',
}

/**
 * Menu item configuration interface
 */
export interface IMenu {
  /** Display text for the menu item */
  text: string;
  /** URL link for navigation */
  link?: string;
  /** Menu configuration with icon and actions */
  menu?: { icon: string; actions: IAction[] };
  /** Status indicator with icon and label */
  status?: { icon: string; label: string };
  /** Icon name */
  icon?: string;
  /** Icon position (left or right) */
  iconPosition?: IconPosition | string;
  /** Whether the menu item is selected */
  selected?: boolean;
  /** Whether the menu item is disabled */
  disabled?: boolean;
  /** Whether the submenu is opened */
  opened?: boolean;
  /** Child menu items for nested menus */
  children?: IMenu[];
}

/**
 * Menu action configuration interface
 */
export interface IAction {
  /** Action label */
  label: string;
  /** Action value */
  value: string;
  /** Action icon */
  icon?: string;
}
