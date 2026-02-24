/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

// Default configuration
export const DEFAULT_PLACEHOLDER = 'Select icon';
export const DEFAULT_SEARCH_PLACEHOLDER = 'Search icons...';
export const DEFAULT_EMPTY_MESSAGE = 'No icons found';
export const DEFAULT_GRID_SIZE = '32px';
export const DEFAULT_MAX_VISIBLE_ICONS = 500;
export const DEFAULT_DROPDOWN_WIDTH = '320px';
export const DEFAULT_DROPDOWN_MAX_HEIGHT = '380px';

// Icon categories
export const ICON_CATEGORIES = [
  'all',
  'arrow',
  'communication',
  'file',
  'interface',
  'media',
  'social',
  'text',
  'utility',
  'business',
  'design',
  'shapes'
] as const;

// Search debounce delay
export const SEARCH_DEBOUNCE_DELAY = 300;
