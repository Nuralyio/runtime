/**
 * @fileoverview Property System - Public API
 * @module Studio/Core/Properties
 *
 * @description
 * TypeScript-based property system for defining component properties
 * with full type safety, replacing JSON configuration files.
 *
 * @example
 * ```typescript
 * import { text, boolean, radio, inputText } from '@/features/studio/core/properties';
 *
 * // Using factory functions
 * const labelProperty = text('label')
 *   .label('Label')
 *   .placeholder('Enter label')
 *   .autoInputHandlers()
 *   .withInputHandler()
 *   .translatable()
 *   .build();
 *
 * // Using shorthand helpers
 * const readonlyProperty = inputBoolean('readonly', 'readonly', 'Read Only')
 *   .build();
 * ```
 */

// Type exports
export type {
  PropertyType,
  HandlerSourceType,
  PropertyDefinition,
  ComponentDefinition,
  PropertyGroup,
} from './types';

// Builder exports
export {
  PropertyBuilder,
  // Factory functions
  text,
  textarea,
  number,
  boolean,
  radio,
  select,
  color,
  icon,
  event,
  date,
  // Shorthand helpers
  inputText,
  inputBoolean,
  inputRadio,
} from './builder';
