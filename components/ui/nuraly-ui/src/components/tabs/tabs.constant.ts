/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 * 
 * @deprecated This file is deprecated. Please import types from './tabs.types.js' instead.
 * This file will be removed in the next major version.
 */

// Re-export from the new types file for backward compatibility
export {
  TabOrientation,
  TabsAlign,
  TabEditable,
  TabEvent,
  EMPTY_STRING,
  NOTHING_STRING,
  LABEL_ATTRIBUTES
} from './tabs.types.js';

/**
 * @deprecated Use TabEvent from tabs.types.js instead
 */
export const TabEvent_DEPRECATED = {
  removeTab: 'removeTab',
  tabEdited: 'tabEdited',
  tabTilteClick: 'tabTilteClick',
  tabOrderChange: 'tabOrderChange',
  addTab: 'addTab',
} as const;
