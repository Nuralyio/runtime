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
 * This package exposes shared utilities only (mixins, controllers, themes, utils).
 * Components should be imported from their own packages (e.g., @nuralyui/button).
 *
 * @example
 * ```typescript
 * import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
 * import { ThemeController } from '@nuralyui/common/controllers';
 * ```
 */

// This file exports shared utilities only.

// Export shared utilities
export * from './mixins.js';
export * from './controllers.js';
export * from './themes.js';
export * from './utils.js';
