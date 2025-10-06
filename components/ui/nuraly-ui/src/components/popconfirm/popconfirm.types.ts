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
