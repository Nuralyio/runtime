/**
 * @fileoverview Type-Safe State Handlers
 * @module Studio/Core/Handlers/StateHandlers
 *
 * @description
 * StateHandlers determine whether an input should be enabled or disabled
 * based on component state. Primary use case is disabling static inputs
 * when dynamic handlers (code icons) are active.
 *
 * @example
 * ```typescript
 * // OLD (string-based):
 * stateHandler: {
 *   ref: "inputHandler",
 *   params: ["placeholder"]
 * }
 *
 * // NEW (typed):
 * stateHandler: new InputStateHandler("placeholder")
 * ```
 */

import type {
  StateHandler,
  BooleanStateHandler,
  HandlerContext,
  InputValue,
} from './types';

/**
 * Default style property state handler.
 *
 * @description
 * Disables input when the property has an active styleHandler (code icon).
 * This is the most common state handler for style properties.
 *
 * @example
 * ```typescript
 * const handler = new DefaultStyleStateHandler('width');
 * const state = handler.execute(context); // 'enabled' | 'disabled'
 * ```
 */
export class DefaultStyleStateHandler implements StateHandler {
  readonly handlerType = 'state' as const;

  constructor(private readonly propertyName: string) {}

  execute(ctx: HandlerContext): 'enabled' | 'disabled' {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    return selectedComponent?.style_handlers?.[this.propertyName]
      ? 'disabled'
      : 'enabled';
  }
}

/**
 * Input property state handler.
 *
 * @description
 * Disables input when the property has an active handler (type === 'handler').
 * Used for component input properties rather than style properties.
 *
 * @example
 * ```typescript
 * const handler = new InputStateHandler('placeholder');
 * const state = handler.execute(context); // 'enabled' | 'disabled'
 * ```
 */
export class InputStateHandler implements StateHandler {
  readonly handlerType = 'state' as const;

  constructor(private readonly propertyName: string) {}

  execute(ctx: HandlerContext): 'enabled' | 'disabled' {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const inputValue = selectedComponent?.input?.[this.propertyName] as InputValue | undefined;

    const hasHandlerType = inputValue?.type === 'handler' && inputValue?.value;
    return hasHandlerType ? 'disabled' : 'enabled';
  }
}

/**
 * Icon picker disable state handler.
 *
 * @description
 * Returns boolean to disable icon picker when the icon property has a handler.
 * Specifically designed for IconPicker components which expect boolean disable state.
 *
 * @example
 * ```typescript
 * const handler = new IconPickerDisableHandler('icon');
 * const isDisabled = handler.execute(context); // true | false
 * ```
 */
export class IconPickerDisableHandler implements BooleanStateHandler {
  readonly handlerType = 'state' as const;

  constructor(private readonly propertyName: string) {}

  execute(ctx: HandlerContext): boolean {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const inputValue = selectedComponent?.input?.[this.propertyName] as InputValue | undefined;

    return !!(inputValue?.type === 'handler' && inputValue?.value);
  }
}

/**
 * Value handler state - disables if input value is a handler.
 *
 * @description
 * Special case handler for the 'value' property itself. Disables static value
 * input when the value is defined as a handler (dynamic computed value).
 *
 * @example
 * ```typescript
 * const handler = new ValueStateHandler();
 * const state = handler.execute(context); // 'enabled' | 'disabled'
 * ```
 */
export class ValueStateHandler implements StateHandler {
  readonly handlerType = 'state' as const;

  execute(ctx: HandlerContext): 'enabled' | 'disabled' {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const valueInput = selectedComponent?.input?.value as InputValue | undefined;

    return valueInput?.type === 'handler' && valueInput?.value
      ? 'disabled'
      : 'enabled';
  }
}

/**
 * Combined style and input handler state.
 *
 * @description
 * Disables input if either the style_handler OR the input handler is active.
 * Used for properties that could have handlers in either location.
 *
 * @example
 * ```typescript
 * const handler = new CombinedStateHandler('color');
 * ```
 */
export class CombinedStateHandler implements StateHandler {
  readonly handlerType = 'state' as const;

  constructor(private readonly propertyName: string) {}

  execute(ctx: HandlerContext): 'enabled' | 'disabled' {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);

    // Check style handlers
    if (selectedComponent?.style_handlers?.[this.propertyName]) {
      return 'disabled';
    }

    // Check input handlers
    const inputValue = selectedComponent?.input?.[this.propertyName] as InputValue | undefined;
    if (inputValue?.type === 'handler' && inputValue?.value) {
      return 'disabled';
    }

    return 'enabled';
  }
}

/**
 * Conditional state handler.
 *
 * @description
 * Enables/disables based on a custom condition function.
 * Use for complex state logic that doesn't fit standard patterns.
 *
 * @example
 * ```typescript
 * const handler = new ConditionalStateHandler((ctx) => {
 *   const comp = ctx.Utils.first(ctx.$selectedComponents);
 *   return comp?.type === 'container' && comp?.input?.layout?.value === 'flex';
 * });
 * ```
 */
export class ConditionalStateHandler implements StateHandler {
  readonly handlerType = 'state' as const;

  constructor(
    private readonly condition: (ctx: HandlerContext) => boolean,
    private readonly enableWhenTrue: boolean = true
  ) {}

  execute(ctx: HandlerContext): 'enabled' | 'disabled' {
    const result = this.condition(ctx);
    const isEnabled = this.enableWhenTrue ? result : !result;
    return isEnabled ? 'enabled' : 'disabled';
  }
}

/**
 * Always enabled state handler.
 *
 * @description
 * Always returns 'enabled'. Used as a default or placeholder.
 */
export class AlwaysEnabledHandler implements StateHandler {
  readonly handlerType = 'state' as const;

  execute(_ctx: HandlerContext): 'enabled' | 'disabled' {
    return 'enabled';
  }
}

/**
 * Always disabled state handler.
 *
 * @description
 * Always returns 'disabled'. Used for read-only display fields.
 */
export class AlwaysDisabledHandler implements StateHandler {
  readonly handlerType = 'state' as const;

  execute(_ctx: HandlerContext): 'enabled' | 'disabled' {
    return 'disabled';
  }
}

/**
 * Input helper text handler.
 *
 * @description
 * Returns helper text message when an input property has a handler applied.
 * Used to inform users why an input is disabled.
 *
 * Note: This is a ValueHandler that returns string, not a StateHandler,
 * but it's related to state so it's included here for convenience.
 */
export class InputHelperTextHandler {
  readonly handlerType = 'value' as const;

  constructor(private readonly propertyName: string) {}

  execute(ctx: HandlerContext): string {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const inputValue = selectedComponent?.input?.[this.propertyName] as InputValue | undefined;

    const hasHandlerType = inputValue?.type === 'handler' && inputValue?.value;
    return hasHandlerType ? 'Value driven by handler' : '';
  }
}
