// Main index file - exports all handlers by category

// Typography handlers
export {
  fontSizeValueHandler,
  fontSizeEventHandler,
  lineHeightValueHandler,
  lineHeightEventHandler,
  letterSpacingValueHandler,
  letterSpacingEventHandler
} from './typography-handlers.ts';

// Spacing handlers
export {
  marginValueHandler,
  marginEventHandler,
  paddingValueHandler,
  paddingEventHandler,
  gapValueHandler,
  gapEventHandler,
  createSpacingHandler
} from './spacing-handlers.ts';

// Border handlers
export {
  borderRadiusValueHandler,
  borderRadiusEventHandler,
  borderWidthValueHandler,
  borderWidthEventHandler,
  createBorderHandler
} from './border-handlers.ts';

// Dimension handlers
export {
  widthValueHandler,
  widthEventHandler,
  heightValueHandler,
  heightEventHandler,
  createDimensionHandler
} from './dimension-handlers.ts';

// Position handlers
export {
  positionValueHandler,
  positionEventHandler,
  zIndexValueHandler,
  zIndexEventHandler,
  createPositionHandler
} from './position-handlers.ts';

// Legacy exports for backward compatibility
import { createSpacingHandler } from './spacing-handlers.ts';

export const marginPaddingValueHandler = (property: string) => createSpacingHandler(property).valueHandler;
export const marginPaddingEventHandler = (property: string) => createSpacingHandler(property).eventHandler;
