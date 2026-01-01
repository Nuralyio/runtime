/**
 * Container component types and constants
 */

export const EMPTY_STRING = '';

/**
 * Container layout type
 */
export const enum ContainerLayout {
  /** Full width container */
  Fluid = 'fluid',
  /** Centered with max-width (boxed) */
  Boxed = 'boxed',
  /** Fixed width */
  Fixed = 'fixed'
}

/**
 * Container direction
 */
export const enum ContainerDirection {
  Row = 'row',
  Column = 'column'
}

/**
 * Container size presets for boxed layout
 */
export const enum ContainerSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  ExtraLarge = 'xl',
  Full = 'full'
}

/**
 * Padding size presets
 */
export const enum ContainerPadding {
  None = 'none',
  Small = 'sm',
  Medium = 'md',
  Large = 'lg'
}

/**
 * Justify content alignment
 */
export const enum ContainerJustify {
  FlexStart = 'flex-start',
  FlexEnd = 'flex-end',
  Center = 'center',
  SpaceBetween = 'space-between',
  SpaceAround = 'space-around',
  SpaceEvenly = 'space-evenly'
}

/**
 * Align items alignment
 */
export const enum ContainerAlign {
  FlexStart = 'flex-start',
  FlexEnd = 'flex-end',
  Center = 'center',
  Baseline = 'baseline',
  Stretch = 'stretch'
}

/**
 * Gap configuration - can be string preset, number (px), or array [horizontal, vertical]
 */
export type Gap = 'small' | 'medium' | 'large' | number | string | [number | string, number | string];
