/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Panel display modes
 */
export enum PanelMode {
  Panel = 'panel',
  Window = 'window',
  Minimized = 'minimized',
  Embedded = 'embedded' // Inline mode, can be maximized to window
}

/**
 * Panel sizes
 */
export enum PanelSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Custom = 'custom'
}

/**
 * Panel positions for panel mode
 */
export enum PanelPosition {
  Left = 'left',
  Right = 'right',
  Bottom = 'bottom',
  Top = 'top'
}

/**
 * Maximize position for embedded panels
 */
export enum MaximizePosition {
  Center = 'center',
  Left = 'left',
  Right = 'right',
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right'
}

/**
 * Panel events
 */
export interface PanelEvents {
  'panel-mode-change': CustomEvent<{ mode: PanelMode; previousMode: PanelMode }>;
  'panel-close': CustomEvent<void>;
  'panel-minimize': CustomEvent<void>;
  'panel-maximize': CustomEvent<void>;
  'panel-drag-start': CustomEvent<{ x: number; y: number }>;
  'panel-drag-end': CustomEvent<{ x: number; y: number }>;
  'panel-resize': CustomEvent<{ width: number; height: number }>;
}

/**
 * Panel configuration interface
 */
export interface PanelConfig {
  mode?: PanelMode;
  size?: PanelSize;
  position?: PanelPosition;
  draggable?: boolean;
  resizable?: boolean;
  collapsible?: boolean;
  minimizable?: boolean;
  closable?: boolean;
  title?: string;
  width?: string;
  height?: string;
}

/**
 * Panel header configuration
 */
export interface PanelHeader {
  title?: string;
  icon?: string;
  showActions?: boolean;
}

export const EMPTY_STRING = '';
