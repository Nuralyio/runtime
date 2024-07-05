export type RadioButtonOption = {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  state?: RadioButtonState;
  message?: string;
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
}
