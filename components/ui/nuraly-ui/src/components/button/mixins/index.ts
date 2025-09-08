/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

// Export all button-specific mixins
export { RippleMixin, type RippleCapable } from './ripple-mixin.js';
export { KeyboardMixin, type KeyboardCapable } from './keyboard-mixin.js';
export { LinkMixin, type LinkCapable } from './link-mixin.js';

// Import types for combined interface
import type { RippleCapable } from './ripple-mixin.js';
import type { KeyboardCapable } from './keyboard-mixin.js';
import type { LinkCapable } from './link-mixin.js';

// Combined interface for button components using all mixins
export interface ButtonMixinCapable extends RippleCapable, KeyboardCapable, LinkCapable {}
