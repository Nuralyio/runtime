/**
 * @fileoverview Type-Safe Handler System - Public API
 * @module Studio/Core/Handlers
 *
 * @description
 * This module provides a complete type-safe handler system that replaces
 * the string-based JavaScript handlers with typed TypeScript classes.
 *
 * ## Migration Guide
 *
 * ### Value Handlers
 * ```typescript
 * // OLD (string-based):
 * valueHandler: { ref: "componentInput", params: ["label"] }
 *
 * // NEW (typed):
 * valueHandler: new ComponentInputHandler("label")
 * ```
 *
 * ### State Handlers
 * ```typescript
 * // OLD (string-based):
 * stateHandler: { ref: "inputHandler", params: ["placeholder"] }
 *
 * // NEW (typed):
 * stateHandler: new InputStateHandler("placeholder")
 * ```
 *
 * ### Event Handlers
 * ```typescript
 * // OLD (string-based):
 * eventHandlers: {
 *   valueChange: { ref: "updateInput", params: ["label", "string"] }
 * }
 *
 * // NEW (typed):
 * eventHandlers: {
 *   valueChange: new UpdateInputHandler("label", "string")
 * }
 * ```
 *
 * ## Handler Categories
 *
 * - **Value Handlers**: Retrieve values to display in inputs
 * - **State Handlers**: Control input enabled/disabled state
 * - **Event Handlers**: Handle user interactions and update component data
 *
 * @example Complete Property Definition
 * ```typescript
 * import {
 *   ComponentInputHandler,
 *   InputStateHandler,
 *   UpdateInputHandler,
 * } from '@/features/studio/core/handlers';
 *
 * const labelProperty: TypedPropertyConfig = {
 *   name: 'label',
 *   label: 'Label',
 *   type: 'text',
 *   inputProperty: 'label',
 *   hasHandler: true,
 *   handlerType: 'input',
 *   handlerProperty: 'label',
 *   translatable: true,
 *   valueHandler: new ComponentInputHandler('label'),
 *   stateHandler: new InputStateHandler('label'),
 *   eventHandlers: {
 *     valueChange: new UpdateInputHandler('label', 'string'),
 *   },
 * };
 * ```
 */

// ============================================================================
// Type Exports
// ============================================================================

export type {
  // Core interfaces
  Handler,
  HandlerContext,
  ValueHandler,
  StateHandler,
  BooleanStateHandler,
  EventHandler,
  HelperTextHandler,
  RadioValueHandler,

  // Data types
  InputValue,
  RadioOption,
  SelectOption,
  RadioValueResult,
  RadioValueTuple,
  SelectValueResult,

  // Property config
  TypedPropertyConfig,
} from './types';

export {
  // Type guards
  isValueHandler,
  isStateHandler,
  isEventHandler,
} from './types';

// ============================================================================
// Value Handler Exports
// ============================================================================

export {
  // Component property handlers
  ComponentNameHandler,
  ComponentInputHandler,
  ComponentInputHandlerValue,
  ComponentInputRadioHandler,
  ComponentStyleHandler,
  ComponentStyleSelectHandler,
  ComponentInputSelectHandler,
  StyleHandlerValue,

  // Special value handlers
  DisplayToggleHandler,
  RadioWithOptionsHandler,
  HandlerValueGetter,
  ComponentIdHandler,
  ComponentHashHandler,

  // Utility handlers
  StaticValueHandler,
  ComputedValueHandler,
} from './value-handlers';

// ============================================================================
// State Handler Exports
// ============================================================================

export {
  // Property state handlers
  DefaultStyleStateHandler,
  InputStateHandler,
  IconPickerDisableHandler,
  ValueStateHandler,
  CombinedStateHandler,

  // Utility state handlers
  ConditionalStateHandler,
  AlwaysEnabledHandler,
  AlwaysDisabledHandler,

  // Helper text (related to state)
  InputHelperTextHandler,
} from './state-handlers';

// ============================================================================
// Event Handler Exports
// ============================================================================

export {
  // Input value type
  type InputValueType,

  // Component update handlers
  UpdateNameHandler,
  UpdateInputHandler,
  UpdateInputAsHandlerHandler,
  UpdateStyleHandler,
  UpdateStyleWithUnitHandler,
  UpdateStyleHandlerHandler,
  UpdateInputHandlerWithTypeHandler,
  UpdateBooleanInputHandler,

  // Utility handlers
  CompositeEventHandler,
  ConditionalEventHandler,
  CustomEventHandler,
  NoOpEventHandler,
  TransformUpdateInputHandler,
} from './event-handlers';

// ============================================================================
// Custom Handler Exports (reusable patterns)
// ============================================================================

export {
  createDisabledAwareRadioHandler,
  createIconRadioHandler,
  // Pre-defined option sets
  typeRadioOptions,
  sizeRadioOptions,
  statusRadioOptions,
  stateRadioOptions,
  inputVariantOptions,
  textareaVariantOptions,
  resizeRadioOptions,
  buttonTypeOptions,
  buttonShapeOptions,
  iconPositionOptions,
} from './custom-handlers';

// ============================================================================
// Factory Functions (for convenience)
// ============================================================================

import {
  ComponentInputHandler,
  ComponentStyleHandler,
  RadioWithOptionsHandler,
} from './value-handlers';
import {
  InputStateHandler,
  DefaultStyleStateHandler,
} from './state-handlers';
import {
  UpdateInputHandler,
  UpdateStyleHandler,
  UpdateStyleWithUnitHandler,
} from './event-handlers';
import type { RadioOption, SelectOption } from './types';

/**
 * Factory functions for creating common handler patterns.
 *
 * @description
 * These factories provide a concise API for creating handlers with
 * common configurations. They reduce boilerplate and improve readability.
 *
 * @example
 * ```typescript
 * import { handlers } from '@/features/studio/core/handlers';
 *
 * const property = {
 *   valueHandler: handlers.input('label'),
 *   stateHandler: handlers.inputState('label'),
 *   eventHandlers: {
 *     valueChange: handlers.updateInput('label'),
 *   },
 * };
 * ```
 */
export const handlers = {
  // Value handlers
  /** Get component input property value */
  input: <T = string>(propertyName: string, defaultValue?: T) =>
    new ComponentInputHandler<T>(propertyName, defaultValue),

  /** Get component style property value */
  style: (propertyName: string, defaultValue?: string) =>
    new ComponentStyleHandler(propertyName, defaultValue),

  /** Get radio options with current value */
  radio: (propertyName: string, options: RadioOption[], defaultValue?: string) =>
    new RadioWithOptionsHandler(propertyName, options, defaultValue),

  // State handlers
  /** Input property state (disabled when handler active) */
  inputState: (propertyName: string) =>
    new InputStateHandler(propertyName),

  /** Style property state (disabled when handler active) */
  styleState: (propertyName: string) =>
    new DefaultStyleStateHandler(propertyName),

  // Event handlers
  /** Update component input property */
  updateInput: (propertyName: string, valueType: 'string' | 'number' | 'boolean' = 'string') =>
    new UpdateInputHandler(propertyName, valueType),

  /** Update component style property */
  updateStyle: (propertyName: string) =>
    new UpdateStyleHandler(propertyName),

  /** Update style with automatic unit */
  updateStyleWithUnit: (propertyName: string, unit: string = 'px') =>
    new UpdateStyleWithUnitHandler(propertyName, unit),
};

// ============================================================================
// Legacy Compatibility Layer
// ============================================================================

/**
 * Maps old string-based handler references to new typed handlers.
 *
 * @description
 * This registry enables gradual migration by allowing the old ref/params
 * syntax to work with the new handler classes during the transition period.
 *
 * @example
 * ```typescript
 * // Old config format still works:
 * const handler = legacyHandlerRegistry.value.componentInput('label', 'default');
 *
 * // Equivalent to:
 * const handler = new ComponentInputHandler('label', 'default');
 * ```
 *
 * @deprecated Use typed handler classes directly. This registry exists only
 * for backward compatibility during migration.
 */
export const legacyHandlerRegistry = {
  value: {
    componentName: () => new (require('./value-handlers').ComponentNameHandler)(),
    componentInput: (propertyName: string, defaultValue?: unknown) =>
      new ComponentInputHandler(propertyName, defaultValue),
    componentInputHandler: (propertyName: string, defaultValue?: string) =>
      new (require('./value-handlers').ComponentInputHandlerValue)(propertyName, defaultValue),
    componentInputRadio: (propertyName: string, options: RadioOption[], defaultValue?: string) =>
      new (require('./value-handlers').ComponentInputRadioHandler)(propertyName, options, defaultValue),
    componentStyle: (propertyName: string, defaultValue?: string) =>
      new ComponentStyleHandler(propertyName, defaultValue),
    componentStyleSelect: (propertyName: string, options: SelectOption[], defaultValue?: string) =>
      new (require('./value-handlers').ComponentStyleSelectHandler)(propertyName, options, defaultValue),
    componentInputSelect: (propertyName: string, defaultValue?: string) =>
      new (require('./value-handlers').ComponentInputSelectHandler)(propertyName, defaultValue),
    styleHandler: (propertyName: string, defaultValue?: string) =>
      new (require('./value-handlers').StyleHandlerValue)(propertyName, defaultValue),
    displayToggle: () => new (require('./value-handlers').DisplayToggleHandler)(),
    radioWithOptions: (propertyName: string, options: RadioOption[], defaultValue?: string) =>
      new RadioWithOptionsHandler(propertyName, options, defaultValue),
  },

  state: {
    defaultStyle: (propertyName: string) => new DefaultStyleStateHandler(propertyName),
    inputHandler: (propertyName: string) => new InputStateHandler(propertyName),
    iconPickerDisable: (propertyName: string) =>
      new (require('./state-handlers').IconPickerDisableHandler)(propertyName),
    valueHandler: () => new (require('./state-handlers').ValueStateHandler)(),
    inputHelperText: (propertyName: string) =>
      new (require('./state-handlers').InputHelperTextHandler)(propertyName),
  },

  event: {
    updateName: () => new (require('./event-handlers').UpdateNameHandler)(),
    updateInput: (propertyName: string, valueType?: string) =>
      new UpdateInputHandler(propertyName, valueType as any),
    updateInputHandler: (propertyName: string) =>
      new (require('./event-handlers').UpdateInputAsHandlerHandler)(propertyName),
    updateStyle: (propertyName: string) => new UpdateStyleHandler(propertyName),
    updateStyleWithUnit: (propertyName: string, unit?: string) =>
      new UpdateStyleWithUnitHandler(propertyName, unit),
  },
};
