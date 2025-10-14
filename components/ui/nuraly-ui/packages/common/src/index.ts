/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @nuralyui/common
 * 
 * Common UI components package for Nuraly UI Library.
 * Contains basic building blocks used across the component library.
 * 
 * Included components:
 * - Icon: Scalable vector icons
 * - Badge: Numerical indicators and status badges
 * - Divider: Content separators
 * - Label: Enhanced text labels
 * 
 * @example
 * ```typescript
 * // Import all common components
 * import '@nuralyui/common';
 * 
 * // Or import specific components
 * import '@nuralyui/common/icon';
 * import '@nuralyui/common/badge';
 * ```
 */

// Note: Component exports are handled by the build script
// which copies from dist/components after the main build
// This file is for shared utilities only

// Export shared utilities
export * from './mixins.js';
export * from './controllers.js';
export * from './themes.js';
export * from './utils.js';
