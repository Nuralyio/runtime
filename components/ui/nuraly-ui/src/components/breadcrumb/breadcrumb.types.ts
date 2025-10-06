/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Breadcrumb separator types
 */
export const enum BreadcrumbSeparator {
  Slash = '/',
  Arrow = '>',
  Chevron = '›',
  Dash = '-',
  Dot = '•',
}

/**
 * Breadcrumb item interface
 */
export interface BreadcrumbItem {
  /** Item title/label */
  title: string;
  /** Target URL or path */
  href?: string;
  /** Click handler for item */
  onClick?: (e: MouseEvent) => void;
  /** Icon name to display before title */
  icon?: string;
  /** Icon type (solid or regular) */
  iconType?: 'solid' | 'regular';
  /** Custom class name for the item */
  className?: string;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Dropdown menu items for this breadcrumb item */
  menu?: BreadcrumbMenuItem[];
}

/**
 * Breadcrumb menu item interface for dropdown menus
 */
export interface BreadcrumbMenuItem {
  /** Menu item label */
  label: string;
  /** Menu item URL */
  href?: string;
  /** Click handler */
  onClick?: (e: MouseEvent) => void;
  /** Icon for menu item */
  icon?: string;
  /** Whether menu item is disabled */
  disabled?: boolean;
}

/**
 * Custom separator configuration
 */
export interface BreadcrumbSeparatorConfig {
  /** Custom separator text or icon name */
  separator: string;
  /** Whether the separator is an icon */
  isIcon?: boolean;
  /** Icon type if separator is an icon */
  iconType?: 'solid' | 'regular';
}
