/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Shared mixins for Nuraly UI components
 * 
 * @module @nuralyui/common/mixins
 * 
 * @example
 * ```typescript
 * import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
 * 
 * class MyComponent extends NuralyUIBaseMixin(LitElement) {
 *   // Your component code
 * }
 * ```
 */

// Export all mixins
export { NuralyUIBaseMixin, BaseMixin, type NuralyUIBaseElement } from './shared/base-mixin.js';
export { ThemeAwareMixin, type ThemeAware } from './shared/theme-mixin.js';
export { DependencyValidationMixin, type DependencyAware } from './shared/dependency-mixin.js';
export { EventHandlerMixin, type EventHandlerCapable } from './shared/event-handler-mixin.js';

// Also export validation types
export * from './shared/validation.types.js';

// Export validation types
export * from './shared/validation.types.js';
