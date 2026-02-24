/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Badge status types for status indicators
 */
export const enum BadgeStatus {
  Success = 'success',
  Processing = 'processing',
  Default = 'default',
  Error = 'error',
  Warning = 'warning',
}

/**
 * Badge size variants
 */
export const enum BadgeSize {
  Default = 'default',
  Small = 'small',
}

/**
 * Badge color presets
 */
export const enum BadgeColor {
  Pink = 'pink',
  Red = 'red',
  Yellow = 'yellow',
  Orange = 'orange',
  Cyan = 'cyan',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
  Geekblue = 'geekblue',
  Magenta = 'magenta',
  Volcano = 'volcano',
  Gold = 'gold',
  Lime = 'lime',
}

/**
 * Ribbon placement options
 */
export const enum RibbonPlacement {
  Start = 'start',
  End = 'end',
}

/**
 * Badge configuration interface
 */
export interface BadgeConfig {
  /** Number to show in badge */
  count?: number | string;
  
  /** Whether to display a dot instead of count */
  dot?: boolean;
  
  /** Max count to show (shows count+ when exceeded) */
  overflowCount?: number;
  
  /** Whether to show badge when count is zero */
  showZero?: boolean;
  
  /** Set offset of the badge dot [x, y] */
  offset?: [number, number];
  
  /** Badge color (preset or custom hex/rgb) */
  color?: BadgeColor | string;
  
  /** Badge size */
  size?: BadgeSize;
  
  /** Set Badge as a status dot */
  status?: BadgeStatus;
  
  /** Status text to display */
  text?: string;
  
  /** Title to show on hover */
  title?: string;
}

/**
 * Ribbon badge configuration
 */
export interface RibbonConfig {
  /** Content inside the ribbon */
  text: string;
  
  /** Ribbon color (preset or custom) */
  color?: BadgeColor | string;
  
  /** Placement of the ribbon */
  placement?: RibbonPlacement;
}
