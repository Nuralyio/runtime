/**
 * Column filter types
 */
export const enum FilterType {
  Text = 'text',
  Select = 'select',
  Number = 'number',
  Date = 'date',
}

/**
 * Column filter configuration
 */
export interface ColumnFilter {
  type: FilterType;
  placeholder?: string;
  options?: Array<{ label: string; value: string | number }>;
}

/**
 * Active filter state for a column
 */
export interface ActiveColumnFilter {
  columnKey: string;
  value: string | number | null;
}

/**
 * Table header configuration
 */
export interface IHeader {
  name: string;
  key: string;
  filterable?: boolean;
  filterConfig?: ColumnFilter;
  fixed?: 'left' | 'right';
  width?: number | string;
  /**
   * Custom cell renderer function
   * When provided, this function will be called to render the cell content
   * instead of using the raw value from row[key]
   * @param value - The cell value from row[key]
   * @param row - The full row data
   * @param index - The row index
   * @returns Template result for the cell content (e.g., html`<nr-badge>...</nr-badge>`)
   */
  render?: CellContentRenderer;
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

/**
 * Expansion content render function
 * @param row - The row data
 * @param index - The row index
 * @returns Template result for the expanded content
 */
export type ExpansionContentRenderer = (row: any, index: number) => any;

/**
 * Cell content render function
 * @param value - The cell value from row[key]
 * @param row - The full row data
 * @param index - The row index
 * @returns Template result for the cell content
 */
export type CellContentRenderer = (value: any, row: any, index: number) => any;

export const EMPTY_STRING = '';
