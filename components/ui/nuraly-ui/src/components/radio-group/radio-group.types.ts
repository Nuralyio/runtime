export type RadioButtonOption = {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  state?: RadioButtonState;
  message?: string;
  htmlContent?: string; // Support for HTML content instead of plain label
  className?: string; // Custom CSS class for the option
  style?: string; // Inline styles for the option
  title?: string; // Tooltip text
  id?: string; // Custom ID for the option
  autoWidth?: boolean; // Override global auto-width setting for this specific option
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

export enum RadioButtonSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
}

export enum RadioButtonVariant {
  Default = 'default',
  Solid = 'solid',
}
