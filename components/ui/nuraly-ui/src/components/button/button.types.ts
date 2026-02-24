export const enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
  Ghost = 'ghost',
  Default = 'default',
}

export const enum ButtonSize {
  Small = 'small', // 32px
  Medium = 'medium', // 40px (default)
  Large = 'large', // 48px
}

export const enum ButtonShape {
  Default = 'default',
  Circle = 'circle',
  Round = 'round',
}

export const enum IconPosition {
  Left = 'left',
  Right = 'right',
}

/**
 * Enhanced icon configuration for buttons
 */
export interface ButtonIconConfig {
  /** Icon name (required) */
  name: string;
  /** Icon type - solid or regular */
  type?: 'solid' | 'regular';
  /** Icon size override */
  size?: string;
  /** Icon color override */
  color?: string;
  /** Alternative text for accessibility */
  alt?: string;
  /** Custom attributes to pass to icon */
  attributes?: Record<string, string>;
}

/**
 * Union type for icon input - supports both simple string and enhanced config
 */
export type ButtonIcon = string | ButtonIconConfig;

/**
 * Array of icons (supports 1-2 icons)
 */
export type ButtonIcons = ButtonIcon[];

/**
 * Alternative icon configuration using positioned properties
 */
export interface ButtonIconsConfig {
  /** Left icon configuration */
  left?: ButtonIcon;
  /** Right icon configuration */
  right?: ButtonIcon;
}

export const EMPTY_STRING = '';
