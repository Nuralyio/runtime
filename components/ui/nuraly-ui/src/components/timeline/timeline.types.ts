/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Timeline mode variants
 */
export const enum TimelineMode {
  Left = 'left',
  Right = 'right',
  Alternate = 'alternate',
}

/**
 * Timeline item color presets
 */
export const enum TimelineItemColor {
  Blue = 'blue',
  Red = 'red',
  Green = 'green',
  Gray = 'gray',
}

/**
 * Timeline item position (used in alternate mode)
 */
export const enum TimelineItemPosition {
  Left = 'left',
  Right = 'right',
}

/**
 * Timeline item interface
 */
export interface TimelineItem {
  /** Item content */
  children: string;
  
  /** Optional label (timestamp, date, etc.) */
  label?: string;
  
  /** Dot color (preset or custom hex/rgb) */
  color?: TimelineItemColor | string;
  
  /** Custom dot content (icon name or custom element) */
  dot?: string;
  
  /** Custom position in alternate mode */
  position?: TimelineItemPosition;
  
  /** Custom class name */
  className?: string;
}

/**
 * Timeline configuration interface
 */
export interface TimelineConfig {
  /** Timeline mode (left, right, alternate) */
  mode?: TimelineMode;
  
  /** Timeline items */
  items: TimelineItem[];
  
  /** Pending state content */
  pending?: string | boolean;
  
  /** Custom pending dot */
  pendingDot?: string;
  
  /** Reverse the timeline order */
  reverse?: boolean;
}
