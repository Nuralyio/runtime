/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TemplateResult } from 'lit';

/**
 * Toast type variants
 */
export const enum ToastType {
  Default = 'default',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

/**
 * Toast position on screen
 */
export const enum ToastPosition {
  TopRight = 'top-right',
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  BottomRight = 'bottom-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
}

/**
 * Toast animation types
 */
export const enum ToastAnimation {
  Fade = 'fade',
  Slide = 'slide',
  Bounce = 'bounce',
}

/**
 * Predefined duration values in milliseconds
 */
export const enum ToastDuration {
  Short = 3000,
  Medium = 5000,
  Long = 7000,
}

/**
 * Toast action button configuration
 */
export interface ToastButton {
  /** Button label text */
  label: string;
  
  /** Button click handler */
  onClick: (event: Event) => void;
  
  /** Button type/variant */
  type?: 'default' | 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
  
  /** Button size */
  size?: 'small' | 'medium' | 'large';
  
  /** Whether button is disabled */
  disabled?: boolean;
  
  /** Icon name for button */
  icon?: string;
}

/**
 * Individual toast configuration
 */
export interface ToastConfig {
  /** Toast message text */
  text?: string;
  
  /** Custom HTML content (overrides text) */
  content?: TemplateResult;
  
  /** Toast type/variant */
  type?: ToastType;
  
  /** Duration in milliseconds */
  duration?: number;
  
  /** Auto dismiss after duration (default: true) */
  autoDismiss?: boolean;
  
  /** Show close button */
  closable?: boolean;
  
  /** Icon name to display */
  icon?: string;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Action button configuration */
  button?: ToastButton;
  
  /** Callback when toast is closed */
  onClose?: () => void;
  
  /** Callback when toast is clicked */
  onClick?: () => void;
}

/**
 * Internal toast item with metadata
 */
export interface ToastItem extends ToastConfig {
  /** Unique identifier */
  id: string;
  
  /** Creation timestamp */
  timestamp: number;
  
  /** Whether toast is being removed */
  removing?: boolean;
}

/**
 * Toast container configuration
 */
export interface ToastContainerConfig {
  /** Position on screen */
  position?: ToastPosition;
  
  /** Maximum number of toasts to show */
  maxToasts?: number;
  
  /** Default duration */
  defaultDuration?: number;
  
  /** Animation type */
  animation?: ToastAnimation;
  
  /** Stack toasts or replace */
  stack?: boolean;
}

/**
 * Toast event detail
 */
export interface ToastEventDetail {
  toast: ToastItem;
  action: 'show' | 'close' | 'click';
}

export const EMPTY_STRING = '';
export const DEFAULT_TOAST_DURATION = ToastDuration.Medium;
export const DEFAULT_MAX_TOASTS = 5;
