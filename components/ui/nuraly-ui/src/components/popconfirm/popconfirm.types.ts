/**
 * Popconfirm placement options
 * Inherited from dropdown placement options
 */
export const enum PopconfirmPlacement {
  Top = 'top',
  TopStart = 'top-start',
  TopEnd = 'top-end',
  Bottom = 'bottom',
  BottomStart = 'bottom-start',
  BottomEnd = 'bottom-end',
  Left = 'left',
  LeftStart = 'left-start',
  LeftEnd = 'left-end',
  Right = 'right',
  RightStart = 'right-start',
  RightEnd = 'right-end',
}

/**
 * Popconfirm trigger mode
 */
export const enum PopconfirmTrigger {
  Click = 'click',
  Hover = 'hover',
  Focus = 'focus',
}

/**
 * Popconfirm button type
 */
export const enum PopconfirmButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
  Default = 'default',
}

/**
 * Predefined icons for popconfirm
 */
export const enum PopconfirmIcon {
  Warning = 'exclamation-circle',
  Question = 'question-circle',
  Info = 'info-circle',
  Error = 'close-circle',
  Success = 'check-circle',
}

/**
 * Popconfirm configuration
 */
export interface PopconfirmConfig {
  title: string;
  description?: string;
  okText?: string;
  cancelText?: string;
  okType?: PopconfirmButtonType;
  showCancel?: boolean;
  icon?: string;
  iconColor?: string;
  placement?: PopconfirmPlacement;
  trigger?: PopconfirmTrigger;
  disabled?: boolean;
  arrow?: boolean;
}

/**
 * Configuration for programmatic popconfirm at cursor position
 */
export interface PopconfirmShowConfig {
  /** Title of the confirmation box */
  title: string;
  /** Description of the confirmation box (optional) */
  description?: string;
  /** Text of the OK button */
  okText?: string;
  /** Text of the Cancel button */
  cancelText?: string;
  /** Button type of the OK button */
  okType?: PopconfirmButtonType;
  /** Show cancel button */
  showCancel?: boolean;
  /** Icon name */
  icon?: string;
  /** Custom icon color */
  iconColor?: string;
  /** Callback when confirmed */
  onConfirm?: () => void | Promise<void>;
  /** Callback when cancelled */
  onCancel?: () => void;
}

/**
 * Position for cursor-based popconfirm
 */
export interface PopconfirmPosition {
  x: number;
  y: number;
}

/**
 * Active popconfirm item
 */
export interface PopconfirmItem {
  id: string;
  config: PopconfirmShowConfig;
  position: PopconfirmPosition;
  loading?: boolean;
}
