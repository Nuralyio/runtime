export const enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary', // Carbon Ghost equivalent
  Danger = 'danger',
  DangerTertiary = 'danger-tertiary', // Danger outline
  Ghost = 'ghost', // Alias for tertiary for backward compatibility
  Default = 'default',
  Text = 'text',
  Link = 'link',
}

export const enum ButtonSize {
  Small = 'sm', // 32px - Carbon small
  Medium = 'md', // 40px - Carbon medium  
  Large = 'lg', // 48px - Carbon large (default)
  XLarge = 'xl', // 64px - Carbon extra large
  Default = 'lg', // Default to large following Carbon
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

export const EMPTY_STRING = '';

// Carbon Design System button variants
export const CARBON_BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary', 
  TERTIARY: 'tertiary',
  DANGER: 'danger',
  DANGER_TERTIARY: 'danger-tertiary',
  GHOST: 'ghost'
} as const;

// Carbon Design System button sizes
export const CARBON_BUTTON_SIZES = {
  SMALL: 'sm',
  MEDIUM: 'md', 
  LARGE: 'lg',
  XLARGE: 'xl'
} as const;
