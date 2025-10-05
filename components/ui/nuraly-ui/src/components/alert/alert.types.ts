/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Alert type variants
 */
export const enum AlertType {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}

/**
 * Alert configuration interface
 */
export interface AlertConfig {
  /** Alert message text */
  message: string;
  
  /** Alert type/variant */
  type?: AlertType;
  
  /** Optional description text */
  description?: string;
  
  /** Whether the alert can be closed */
  closable?: boolean;
  
  /** Custom icon name */
  icon?: string;
  
  /** Whether to show icon */
  showIcon?: boolean;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Callback when alert is closed */
  onClose?: () => void;
  
  /** Banner mode - full width with no border radius */
  banner?: boolean;
}

/**
 * Alert event detail
 */
export interface AlertEventDetail {
  message: string;
  type: AlertType;
}

export const EMPTY_STRING = '';
