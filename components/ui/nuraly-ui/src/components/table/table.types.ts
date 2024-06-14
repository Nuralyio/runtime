export interface IHeader {
  name: string;
  key: string;
}

export enum SelectionMode {
  Single = 'single',
  Multiple = 'multiple',
}

export enum Sizes {
  Small = 'small',
  Normal = 'normal',
  Large = 'large',
}

export enum SortOrder {
  Default = 'default',
  Ascending = 'ascending',
  Descending = 'descending',
}
export enum SortValue {
  Default = 0,
  Ascending = 1,
  Descending = -1,
}

export interface SortAttribute {
  index: number;
  order: SortOrder;
}
export const EMPTY_STRING = '';
