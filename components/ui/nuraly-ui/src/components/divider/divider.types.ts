/**
 * Divider Component Types
 * Based on Ant Design Divider API
 */

/**
 * Direction type of the divider
 */
export const enum DividerType {
  Horizontal = 'horizontal',
  Vertical = 'vertical'
}

/**
 * Position of title inside horizontal divider
 */
export const enum DividerOrientation {
  Start = 'start',
  Center = 'center',
  End = 'end'
}

/**
 * Line style variant of the divider
 */
export const enum DividerVariant {
  Solid = 'solid',
  Dashed = 'dashed',
  Dotted = 'dotted'
}

/**
 * Size of the divider (only for horizontal)
 */
export const enum DividerSize {
  Small = 'small',
  Middle = 'middle',
  Large = 'large'
}

/**
 * Configuration interface for Divider component
 */
export interface DividerConfig {
  /** The direction type of divider */
  type?: DividerType;
  /** Whether line is dashed (deprecated, use variant instead) */
  dashed?: boolean;
  /** Line style variant */
  variant?: DividerVariant;
  /** Position of title inside divider */
  orientation?: DividerOrientation;
  /** Margin between title and closest border */
  orientationMargin?: string | number;
  /** Divider text show as plain style */
  plain?: boolean;
  /** Size of divider (only for horizontal) */
  size?: DividerSize;
}
