/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Theme utilities and definitions for Nuraly UI components
 * 
 * @module @nuralyui/common/themes
 * 
 * @example
 * ```typescript
 * import { getCurrentTheme, type ThemeVariant } from '@nuralyui/common/themes';
 * 
 * const theme = getCurrentTheme(element);
 * console.log('Current theme:', theme);
 * ```
 * 
 * @note CSS theme files are in the @nuralyui/themes package
 */

// Export theme utilities (types and functions only, no CSS)
export * from './shared/themes.js';
