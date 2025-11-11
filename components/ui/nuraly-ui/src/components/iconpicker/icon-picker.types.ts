/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

export const enum IconPickerSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large'
}

export const enum IconPickerPlacement {
  Auto = 'auto',
  Top = 'top',
  Bottom = 'bottom',
  TopStart = 'top-start',
  TopEnd = 'top-end',
  BottomStart = 'bottom-start',
  BottomEnd = 'bottom-end',
  Left = 'left',
  Right = 'right'
}

export const enum IconPickerTrigger {
  Click = 'click',
  Hover = 'hover',
  Manual = 'manual'
}

export const enum IconType {
  Solid = 'solid',
  Regular = 'regular',
  Brands = 'brands'
}

export interface IconPickerIcon {
  name: string;
  type: IconType;
  keywords?: string[];
  category?: string;
  iconName?: string;
}

export interface IconPickerSearchOptions {
  caseSensitive?: boolean;
  matchMode?: 'contains' | 'startsWith' | 'exact';
  categories?: string[];
}

export interface IconPickerChangeEvent {
  value: string;
  icon: IconPickerIcon | null;
}

export const EMPTY_STRING = '';
