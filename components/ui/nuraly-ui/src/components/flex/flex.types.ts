/**
 * Flex component types and constants
 */

export const EMPTY_STRING = '';

/**
 * Flex direction
 */
export const enum FlexDirection {
  Row = 'row',
  RowReverse = 'row-reverse',
  Column = 'column',
  ColumnReverse = 'column-reverse'
}

/**
 * Flex wrap behavior
 */
export const enum FlexWrap {
  NoWrap = 'nowrap',
  Wrap = 'wrap',
  WrapReverse = 'wrap-reverse'
}

/**
 * Justify content alignment
 */
export const enum FlexJustify {
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
export const enum FlexAlign {
  FlexStart = 'flex-start',
  FlexEnd = 'flex-end',
  Center = 'center',
  Baseline = 'baseline',
  Stretch = 'stretch'
}

/**
 * Gap size presets
 */
export const enum FlexGap {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

/**
 * Gap configuration - can be string preset, number (px), or array [horizontal, vertical]
 */
export type Gap = FlexGap | number | string | [number | string, number | string];

/**
 * Flex item configuration
 */
export interface FlexItemConfig {
  flex?: string | number;
  order?: number;
  alignSelf?: FlexAlign | 'auto';
}
