/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

// Base controller exports
export { BaseTabsController, type TabsHost, type TabsBaseController, type ErrorHandler } from './base.controller.js';

// Keyboard controller exports
export {
  TabsKeyboardController,
  type KeyboardController,
  type TabsKeyboardHost
} from './keyboard.controller.js';

// Drag and drop controller exports
export {
  TabsDragDropController,
  type DragDropController,
  type TabsDragDropHost
} from './dragdrop.controller.js';

// Editable controller exports
export {
  TabsEditableController,
  type EditableController,
  type TabsEditableHost
} from './editable.controller.js';

// Event controller exports
export {
  TabsEventController,
  type EventController,
  type TabsEventHost
} from './event.controller.js';

// Pop-out controller exports
export {
  TabsPopOutController,
  type TabsPopOutHost
} from './popout.controller.js';