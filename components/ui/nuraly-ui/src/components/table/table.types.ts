/**
 * Table header configuration
 */
export interface IHeader {
  name: string;
  key: string;
}

/**
 * Selection mode for table rows
 */
export const enum SelectionMode {
  Single = 'single',
  Multiple = 'multiple',
}

/**
 * Table size variants
 */
export const enum Sizes {
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
}

/**
 * Sort order states
 */
export const enum SortOrder {
  Default = 'default',
  Ascending = 'ascending',
  Descending = 'descending',
}

/**
 * Sort direction values
 */
export const enum SortValue {
  Default = 0,
  Ascending = 1,
  Descending = -1,
}

/**
 * Sort attribute configuration
 */
export interface SortAttribute {
  index: number;
  order: SortOrder;
}

export const EMPTY_STRING = '';
