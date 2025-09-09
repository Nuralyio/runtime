export type RadioButtonOption = {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  state?: RadioButtonState;
  message?: string;
  htmlContent?: string; // Support for HTML content instead of plain label
};
export type RadioButtonState = 'error' | 'warning';
export enum RadioButtonDirection {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum RadioButtonPosition {
  Left = 'left',
  Right = 'right',
}

export enum RadioButtonType {
  Default = 'default',
  Button = 'button',
  Slot = 'slot',
}
