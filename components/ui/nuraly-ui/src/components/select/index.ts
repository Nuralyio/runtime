/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Select Component Module
 * 
 * Advanced select component with multiple selection modes, validation, 
 * keyboard navigation, and accessibility features.
 */

// === Main Component ===
export * from './select.component.js';

// === Types and Interfaces ===
export * from './select.types.js';

// === Constants ===
export * from './select.constant.js';

// === Controllers (Advanced Usage) ===
export * from './controllers/index.js';

// === Controller Interfaces (Type-Only Exports) ===
export type { 
  SelectHost,
  SelectBaseController,
  SelectionController,
  KeyboardController,
  DropdownController,
  FocusController,
  ValidationController,
  ErrorHandler
} from './interfaces/index.js';
