/**
 * Label component size variants
 */
export type LabelSize = 'small' | 'medium' | 'large';

/**
 * Label component variants
 */
export type LabelVariant = 'default' | 'secondary' | 'success' | 'warning' | 'error';

/**
 * Label component props interface
 */
export interface LabelProps {
  /**
   * The size of the label
   * @default 'medium'
   */
  size?: LabelSize;

  /**
   * The visual variant of the label
   * @default 'default'
   */
  variant?: LabelVariant;

  /**
   * Whether the label is required (shows asterisk)
   * @default false
   */
  required?: boolean;

  /**
   * Whether the label is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * The for attribute to associate with form elements
   */
  for?: string;

  /**
   * Custom CSS class
   */
  className?: string;
}