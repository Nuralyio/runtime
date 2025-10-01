/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

// Export all collapse controllers
export { BaseCollapseController } from './base.controller.js';
export { CollapseAnimationController } from './animation.controller.js';
export { CollapseKeyboardController } from './keyboard.controller.js';
export { CollapseAccordionController } from './accordion.controller.js';

// Export controller host interfaces
export type { CollapseControllerHost } from './base.controller.js';
export type { CollapseAccordionHost } from './accordion.controller.js';