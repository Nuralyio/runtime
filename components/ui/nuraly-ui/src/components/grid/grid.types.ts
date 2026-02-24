/**
 * Grid system types and constants
 */

export const EMPTY_STRING = '';

/**
 * Responsive breakpoints matching Ant Design
 */
export const enum GridBreakpoint {
  XS = 'xs',  // < 576px
  SM = 'sm',  // >= 576px
  MD = 'md',  // >= 768px
  LG = 'lg',  // >= 992px
  XL = 'xl',  // >= 1200px
  XXL = 'xxl' // >= 1600px
}

/**
 * Breakpoint pixel values
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
} as const;

/**
 * Horizontal alignment of flex items
 */
export const enum RowAlign {
  Top = 'top',
  Middle = 'middle',
  Bottom = 'bottom',
  Stretch = 'stretch'
}

/**
 * Horizontal arrangement of columns
 */
export const enum RowJustify {
  Start = 'start',
  End = 'end',
  Center = 'center',
  SpaceAround = 'space-around',
  SpaceBetween = 'space-between',
  SpaceEvenly = 'space-evenly'
}

/**
 * Gutter configuration - can be number, array, or object
 */
export type Gutter = number | [number, number] | Partial<Record<GridBreakpoint, number | [number, number]>>;

/**
 * Column span configuration for responsive breakpoints
 */
export interface ColSize {
  span?: number;
  offset?: number;
  order?: number;
  pull?: number;
  push?: number;
}

/**
 * Responsive column configuration
 */
export type ResponsiveCol = number | ColSize;

/**
 * Column configuration for all breakpoints
 */
export interface ColResponsive {
  xs?: ResponsiveCol;
  sm?: ResponsiveCol;
  md?: ResponsiveCol;
  lg?: ResponsiveCol;
  xl?: ResponsiveCol;
  xxl?: ResponsiveCol;
}

/**
 * Flex properties
 */
export type FlexType = number | 'none' | 'auto' | string;
