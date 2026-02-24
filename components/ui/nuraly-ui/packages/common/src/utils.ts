/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Shared utility functions for Nuraly UI components
 * 
 * @module @nuralyui/common/utils
 * 
 * @example
 * ```typescript
 * import { throttle, debounce, rafThrottle } from '@nuralyui/common/utils';
 * 
 * const handleResize = throttle(() => {
 *   console.log('Window resized');
 * }, 100);
 * ```
 */

// Export utility functions
export * from './shared/utils.js';

// Export render utilities
export * from './shared/render-utils.js';
