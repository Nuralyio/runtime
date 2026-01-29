/**
 * @fileoverview Type-Safe Handler System - Core Types
 * @module Studio/Core/Handlers/Types
 *
 * @description
 * Core type definitions for the type-safe handler system that replaces
 * string-based JavaScript handlers with typed TypeScript classes.
 *
 * This system provides:
 * - Compile-time type checking for all handlers
 * - IDE autocomplete and refactoring support
 * - Debuggable stack traces (no eval/string code)
 * - Clear separation of handler categories
 */

import type { Component } from '@/types';

/**
 * Runtime context available to all handlers during execution.
 *
 * @description
 * This context is provided by the Studio runtime and contains all the
 * utilities and state needed for handlers to operate.
 */
export interface HandlerContext {
  /** Currently selected components in the editor */
  $selectedComponents: Component[];

  /** Current page UUID */
  $currentPage: string;

  /** Application being edited */
  $currentEditingApplication: {
    uuid: string;
    name: string;
    i18n?: {
      enabled: boolean;
      supportedLocales?: string[];
    };
  } | null;

  /** Event data from user interaction (only for EventHandlers) */
  EventData: {
    value: unknown;
    event?: Event;
    [key: string]: unknown;
  };

  /** Utility functions */
  Utils: {
    first: <T>(arr: T[] | undefined) => T | undefined;
    [key: string]: unknown;
  };

  /** Editor API functions */
  Editor: {
    getComponentBreakpointInput: (component: Component | undefined, propertyName: string) => InputValue | undefined;
    getComponentStyle: (component: Component | undefined, propertyName: string) => string | undefined;
    getComponentStyleForState: (component: Component | undefined, propertyName: string) => string | undefined;
    [key: string]: unknown;
  };

  /** Update functions (only for EventHandlers) */
  updateInput: (component: Component, propertyName: string, valueType: string, value: unknown) => void;
  updateStyle: (component: Component, propertyName: string, value: string) => void;
  updateName: (component: Component, name: string) => void;
  updateStyleHandler: (component: Component, propertyName: string, handler: string) => void;
  updateInputHandler: (component: Component, propertyName: string, handler: string, type: string) => void;
}

/**
 * Input value structure from component data.
 */
export interface InputValue {
  type: 'string' | 'number' | 'boolean' | 'handler' | 'array' | 'object' | 'value';
  value: unknown;
}

/**
 * Radio option structure for radio button inputs.
 */
export interface RadioOption {
  label?: string;
  value: string;
  icon?: string;
  disabled?: boolean;
}

/**
 * Select option structure for dropdown inputs.
 */
export interface SelectOption {
  label: string;
  value: string;
}

/**
 * Base interface for all handlers.
 *
 * @description
 * All handler types implement this interface which requires:
 * - A type discriminator for runtime type checking
 * - An execute method that performs the handler logic
 */
export interface Handler<TResult = unknown> {
  /** Handler category for runtime type checking */
  readonly handlerType: 'value' | 'state' | 'event';

  /**
   * Execute the handler with the given context.
   *
   * @param context - Runtime context with utilities and state
   * @returns The handler result
   */
  execute(context: HandlerContext): TResult;
}

/**
 * Value Handler - Retrieves values to display in inputs.
 *
 * @description
 * ValueHandlers are responsible for extracting component properties and
 * formatting them for display in Studio inputs. They run when inputs need
 * to show current values.
 *
 * @template T - The type of value returned
 *
 * @example
 * ```typescript
 * const handler = new ComponentInputHandler('label');
 * const value = handler.execute(context); // Returns string
 * ```
 */
export interface ValueHandler<T = unknown> extends Handler<T> {
  readonly handlerType: 'value';
}

/**
 * State Handler - Controls input enabled/disabled state.
 *
 * @description
 * StateHandlers determine whether an input should be enabled or disabled
 * based on component state. Primary use case is disabling static inputs
 * when dynamic handlers (code icons) are active.
 *
 * @example
 * ```typescript
 * const handler = new InputStateHandler('placeholder');
 * const state = handler.execute(context); // Returns 'enabled' | 'disabled'
 * ```
 */
export interface StateHandler extends Handler<'enabled' | 'disabled'> {
  readonly handlerType: 'state';
}

/**
 * Boolean State Handler - Returns boolean instead of string.
 *
 * @description
 * Some components (like IconPicker) expect boolean disable state
 * instead of 'enabled'/'disabled' strings.
 */
export interface BooleanStateHandler extends Handler<boolean> {
  readonly handlerType: 'state';
}

/**
 * Event Handler - Handles user interactions.
 *
 * @description
 * EventHandlers respond to user actions (onChange, onClick, etc.) and
 * update component properties accordingly.
 *
 * @example
 * ```typescript
 * const handler = new UpdateInputHandler('label', 'string');
 * handler.execute(context); // Updates component, returns void
 * ```
 */
export interface EventHandler extends Handler<void> {
  readonly handlerType: 'event';
}

/**
 * Helper Text Handler - Returns helper text for inputs.
 *
 * @description
 * Returns helper text to display below inputs, typically used to
 * inform users why an input is disabled.
 */
export interface HelperTextHandler extends Handler<string> {
  readonly handlerType: 'value';
}

/**
 * Radio Value Handler - Returns structured radio button data.
 *
 * @description
 * Returns the options, current value, and type for radio button inputs.
 */
export interface RadioValueHandler extends ValueHandler<RadioValueResult> {
  readonly handlerType: 'value';
}

/**
 * Result structure for radio button value handlers.
 */
export interface RadioValueResult {
  options: RadioOption[];
  currentValue: string;
  type: 'button' | 'default';
}

/**
 * Alternative tuple format for radio handlers (legacy compatibility).
 */
export type RadioValueTuple = [RadioOption[], string, 'button' | 'default'];

/**
 * Select Value Handler - Returns structured select data.
 */
export interface SelectValueResult {
  options: SelectOption[];
  currentValue: string | string[];
}

/**
 * Type guard to check if a handler is a ValueHandler.
 */
export function isValueHandler(handler: Handler): handler is ValueHandler {
  return handler.handlerType === 'value';
}

/**
 * Type guard to check if a handler is a StateHandler.
 */
export function isStateHandler(handler: Handler): handler is StateHandler {
  return handler.handlerType === 'state';
}

/**
 * Type guard to check if a handler is an EventHandler.
 */
export function isEventHandler(handler: Handler): handler is EventHandler {
  return handler.handlerType === 'event';
}

/**
 * Property definition with typed handlers (replaces JSON config).
 */
export interface TypedPropertyConfig {
  /** Unique property identifier */
  name: string;

  /** Display label */
  label: string;

  /** Input type */
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'radio' | 'select' | 'color' | 'icon' | 'event' | 'date';

  /** Component input property name (if different from name) */
  inputProperty?: string;

  /** Default value */
  default?: unknown;

  /** Input width */
  width?: string;

  /** Placeholder text */
  placeholder?: string;

  /** Options for radio/select inputs */
  options?: SelectOption[];

  /** CSS unit for number inputs */
  unit?: string;

  /** Min value for number inputs */
  min?: number;

  /** Max value for number inputs */
  max?: number;

  /** Step value for number inputs */
  step?: number;

  /** Date format for date inputs */
  format?: string;

  /** Whether property has handler support (code icon) */
  hasHandler?: boolean;

  /** Handler type (style or input) */
  handlerType?: 'style' | 'input';

  /** Property name in handlers object */
  handlerProperty?: string;

  /** Whether property supports i18n */
  translatable?: boolean;

  /** Show auto checkbox */
  autoCheckbox?: boolean;

  // Typed handlers (replaces string-based handlers)
  /** Handler to get current value */
  valueHandler: ValueHandler;

  /** Handler to get enabled/disabled state */
  stateHandler?: StateHandler | BooleanStateHandler;

  /** Handler to get helper text */
  helperHandler?: HelperTextHandler;

  /** Event handlers map */
  eventHandlers: Record<string, EventHandler>;

  /** Handler value getter (for code icon) */
  handlerValueGetter?: ValueHandler<[string, string]>;

  /** Handler update function (for code icon) */
  handlerEventUpdate?: EventHandler;
}
