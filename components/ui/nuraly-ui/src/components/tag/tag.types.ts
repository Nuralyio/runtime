/**
 * @license
 * Copyright 2025 Nuraly
 * SPDX-License-Identifier: MIT
 */

/** Preset color names for Tag component */
export const enum TagPresetColor {
  Magenta = 'magenta',
  Red = 'red',
  Volcano = 'volcano',
  Orange = 'orange',
  Gold = 'gold',
  Lime = 'lime',
  Green = 'green',
  Cyan = 'cyan',
  Blue = 'blue',
  Geekblue = 'geekblue',
  Purple = 'purple',
}

/** Tag sizes */
export const enum TagSize {
  Default = 'default',
  Small = 'small',
}

export interface TagCheckedChangeDetail {
  checked: boolean;
}
