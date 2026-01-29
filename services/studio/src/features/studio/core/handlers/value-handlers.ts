/**
 * @fileoverview Type-Safe Value Handlers
 * @module Studio/Core/Handlers/ValueHandlers
 *
 * @description
 * ValueHandlers are responsible for extracting component properties and
 * formatting them for display in Studio inputs. They replace the string-based
 * handlers in handler-library.ts with typed TypeScript classes.
 *
 * @example
 * ```typescript
 * // OLD (string-based):
 * valueHandler: {
 *   ref: "componentInput",
 *   params: ["label"]
 * }
 *
 * // NEW (typed):
 * valueHandler: new ComponentInputHandler("label")
 * ```
 */

import type {
  ValueHandler,
  HandlerContext,
  RadioOption,
  RadioValueTuple,
  SelectOption,
  InputValue,
} from './types';

/**
 * Gets the component name.
 *
 * @description
 * Returns the name of the first selected component.
 * Used for component name editor inputs.
 */
export class ComponentNameHandler implements ValueHandler<string> {
  readonly handlerType = 'value' as const;
  readonly ref = 'componentName';

  execute(ctx: HandlerContext): string {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    return selectedComponent?.name || '';
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'componentName', params: [] };
  }
}

/**
 * Gets a component input property value.
 *
 * @description
 * Retrieves an input property from the selected component, handling both
 * direct values and handler-type values. When the value is a handler,
 * returns the default value since the handler code isn't displayable.
 *
 * @example
 * ```typescript
 * const handler = new ComponentInputHandler('label', 'Default Label');
 * const value = handler.execute(context); // Returns component.input.label.value
 * ```
 */
export class ComponentInputHandler<T = string> implements ValueHandler<T> {
  readonly handlerType = 'value' as const;
  readonly ref = 'componentInput';

  constructor(
    private readonly propertyName: string,
    private readonly defaultValue?: T
  ) {}

  execute(ctx: HandlerContext): T {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, this.propertyName);

    // If type is handler, return the default (the value is code, not displayable)
    if (input?.type === 'handler' && input?.value) {
      return (this.defaultValue ?? '') as T;
    }

    return (input?.value ?? this.defaultValue ?? '') as T;
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'componentInput', params: [this.propertyName] };
  }
}

/**
 * Gets a component input handler code value.
 *
 * @description
 * Returns the handler code string when an input property is set to type 'handler'.
 * Used by code editor inputs to display/edit the handler code.
 *
 * @example
 * ```typescript
 * const handler = new ComponentInputHandlerValue('icon');
 * const code = handler.execute(context); // Returns handler code or ''
 * ```
 */
export class ComponentInputHandlerValue implements ValueHandler<string> {
  readonly handlerType = 'value' as const;
  readonly ref = 'componentInputHandler';

  constructor(
    private readonly propertyName: string,
    private readonly defaultValue: string = ''
  ) {}

  execute(ctx: HandlerContext): string {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, this.propertyName);

    return input?.type === 'handler' ? (input.value as string || this.defaultValue) : this.defaultValue;
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'componentInputHandler', params: [this.propertyName] };
  }
}

/**
 * Gets a component input property for radio button display.
 *
 * @description
 * Returns options, current value, and radio type for radio button inputs.
 * Handles handler-type values by returning the default value.
 *
 * @example
 * ```typescript
 * const handler = new ComponentInputRadioHandler('size', [
 *   { label: 'Small', value: 'small' },
 *   { label: 'Medium', value: 'medium' },
 *   { label: 'Large', value: 'large' }
 * ], 'medium');
 * ```
 */
export class ComponentInputRadioHandler implements ValueHandler<RadioValueTuple> {
  readonly handlerType = 'value' as const;
  readonly ref = 'componentInputRadio';

  constructor(
    private readonly propertyName: string,
    private readonly options: RadioOption[],
    private readonly defaultValue: string = ''
  ) {}

  execute(ctx: HandlerContext): RadioValueTuple {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, this.propertyName);

    // Only use the value if type is "value", otherwise use default (e.g., for handlers)
    const currentValue = input?.type === 'value'
      ? (input.value as string || this.defaultValue)
      : this.defaultValue;

    return [this.options, currentValue, 'button'];
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'componentInputRadio', params: [this.propertyName, this.options, this.defaultValue] };
  }
}

/**
 * Gets a component style property value.
 *
 * @description
 * Retrieves a CSS style property from the selected component.
 * Used for style-related inputs (width, color, fontSize, etc.).
 *
 * @example
 * ```typescript
 * const handler = new ComponentStyleHandler('width', 'auto');
 * const width = handler.execute(context); // Returns component.style.width
 * ```
 */
export class ComponentStyleHandler implements ValueHandler<string> {
  readonly handlerType = 'value' as const;
  readonly ref = 'componentStyle';

  constructor(
    private readonly propertyName: string,
    private readonly defaultValue: string = ''
  ) {}

  execute(ctx: HandlerContext): string {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    return ctx.Editor.getComponentStyle(selectedComponent, this.propertyName) || this.defaultValue;
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'componentStyle', params: [this.propertyName] };
  }
}

/**
 * Gets a component style property for select input display.
 *
 * @description
 * Returns options and current value for select dropdown inputs.
 *
 * @example
 * ```typescript
 * const handler = new ComponentStyleSelectHandler('display', [
 *   { label: 'Flex', value: 'flex' },
 *   { label: 'Block', value: 'block' }
 * ], 'flex');
 * ```
 */
export class ComponentStyleSelectHandler implements ValueHandler<[SelectOption[], string[]]> {
  readonly handlerType = 'value' as const;
  readonly ref = 'componentStyleSelect';

  constructor(
    private readonly propertyName: string,
    private readonly options: SelectOption[],
    private readonly defaultValue: string = ''
  ) {}

  execute(ctx: HandlerContext): [SelectOption[], string[]] {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const currentValue = ctx.Editor.getComponentStyle(selectedComponent, this.propertyName) || this.defaultValue;
    return [this.options, [currentValue]];
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'componentStyleSelect', params: [this.propertyName, this.options, this.defaultValue] };
  }
}

/**
 * Gets a component input property for select input display.
 *
 * @description
 * Returns current value for select inputs from component input properties.
 */
export class ComponentInputSelectHandler implements ValueHandler<string> {
  readonly handlerType = 'value' as const;
  readonly ref = 'componentInputSelect';

  constructor(
    private readonly propertyName: string,
    private readonly defaultValue: string = ''
  ) {}

  execute(ctx: HandlerContext): string {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, this.propertyName);

    // Only use the value if type is "value", otherwise use default
    return input?.type === 'value'
      ? (input.value as string || this.defaultValue)
      : this.defaultValue;
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'componentInputSelect', params: [this.propertyName] };
  }
}

/**
 * Gets a style value with handler state support.
 *
 * @description
 * Retrieves style value considering the component's current state.
 * Uses getComponentStyleForState for state-aware style values.
 */
export class StyleHandlerValue implements ValueHandler<string> {
  readonly handlerType = 'value' as const;
  readonly ref = 'styleHandlerValue';

  constructor(
    private readonly propertyName: string,
    private readonly defaultValue: string = ''
  ) {}

  execute(ctx: HandlerContext): string {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    return ctx.Editor.getComponentStyleForState(selectedComponent, this.propertyName) || this.defaultValue;
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'styleHandlerValue', params: [this.propertyName] };
  }
}

/**
 * Gets display toggle value for show/hide inputs.
 *
 * @description
 * Returns options and current value for display toggle (eye/eye-slash icons).
 * Handles disabled state when display has a handler.
 */
export class DisplayToggleHandler implements ValueHandler<RadioValueTuple> {
  readonly handlerType = 'value' as const;
  readonly ref = 'displayToggle';

  execute(ctx: HandlerContext): RadioValueTuple {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    let currentDisplay: boolean | string = '';
    let isDisabled = false;

    const displayInput = selectedComponent?.input?.display as InputValue | undefined;
    if (displayInput?.type === 'handler' && displayInput?.value) {
      isDisabled = true;
    } else {
      const input = ctx.Editor.getComponentBreakpointInput(selectedComponent, 'display');
      currentDisplay = input?.value as boolean | string;
    }

    const options: RadioOption[] = [
      { icon: 'eye', value: 'true', disabled: isDisabled },
      { icon: 'eye-slash', value: 'false', disabled: isDisabled },
    ];

    return [options, String(currentDisplay), 'button'];
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'displayToggle', params: [] };
  }
}

/**
 * Gets radio button value with custom options.
 *
 * @description
 * Returns options and current value for style-based radio buttons.
 *
 * @example
 * ```typescript
 * const handler = new RadioWithOptionsHandler('textAlign', [
 *   { icon: 'align-left', value: 'left' },
 *   { icon: 'align-center', value: 'center' },
 *   { icon: 'align-right', value: 'right' }
 * ], 'left');
 * ```
 */
export class RadioWithOptionsHandler implements ValueHandler<RadioValueTuple> {
  readonly handlerType = 'value' as const;
  readonly ref = 'radioWithOptions';

  constructor(
    private readonly propertyName: string,
    private readonly options: RadioOption[],
    private readonly defaultValue: string = ''
  ) {}

  execute(ctx: HandlerContext): RadioValueTuple {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    const currentValue = ctx.Editor.getComponentStyle(selectedComponent, this.propertyName) || this.defaultValue;
    return [this.options, currentValue, 'button'];
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'radioWithOptions', params: [this.propertyName, this.options, this.defaultValue] };
  }
}

/**
 * Gets handler property value for code editor (parameter name + code).
 *
 * @description
 * Returns a tuple of [propertyName, handlerCode] for code editor inputs.
 * Used by the code icon/handler editor to display and edit handler code.
 *
 * @example
 * ```typescript
 * const handler = new HandlerValueGetter('label', 'input');
 * const [propName, code] = handler.execute(context);
 * ```
 */
export class HandlerValueGetter implements ValueHandler<[string, string]> {
  readonly handlerType = 'value' as const;
  readonly ref = 'handlerValueGetter';

  constructor(
    private readonly propertyName: string,
    private readonly sourceType: 'input' | 'style' = 'input'
  ) {}

  execute(ctx: HandlerContext): [string, string] {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (!selectedComponent) return [this.propertyName, ''];

    let handlerValue = '';

    if (this.sourceType === 'style') {
      handlerValue = selectedComponent?.style_handlers?.[this.propertyName] || '';
      if (!handlerValue) {
        const styleValue = selectedComponent?.style?.[this.propertyName];
        if (typeof styleValue === 'object' && styleValue?.type === 'handler') {
          handlerValue = styleValue.value || '';
        }
      }
    } else {
      handlerValue = selectedComponent?.inputHandlers?.[this.propertyName] || '';
      if (!handlerValue) {
        const inputValue = selectedComponent?.input?.[this.propertyName];
        if (typeof inputValue === 'object' && inputValue?.type === 'handler') {
          handlerValue = inputValue.value || '';
        }
      }
    }

    return [this.propertyName, handlerValue];
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'handlerValueGetter', params: [this.propertyName, this.sourceType] };
  }
}

/**
 * Gets component ID value.
 *
 * @description
 * Returns the unique identifier of the selected component.
 */
export class ComponentIdHandler implements ValueHandler<string> {
  readonly handlerType = 'value' as const;
  readonly ref = 'componentId';

  execute(ctx: HandlerContext): string {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    return selectedComponent?.uuid || '';
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'componentId', params: [] };
  }
}

/**
 * Gets component hash value.
 *
 * @description
 * Returns the hash of the selected component (for reference/debugging).
 */
export class ComponentHashHandler implements ValueHandler<string> {
  readonly handlerType = 'value' as const;
  readonly ref = 'componentHash';

  execute(ctx: HandlerContext): string {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    return selectedComponent?.hash || selectedComponent?.uuid || '';
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'componentHash', params: [] };
  }
}

/**
 * Static value handler - always returns the same value.
 *
 * @description
 * Used for properties that need a handler interface but return a constant.
 *
 * @example
 * ```typescript
 * const handler = new StaticValueHandler('auto');
 * ```
 */
export class StaticValueHandler<T> implements ValueHandler<T> {
  readonly handlerType = 'value' as const;
  readonly ref = 'staticValue';

  constructor(private readonly value: T) {}

  execute(_ctx: HandlerContext): T {
    return this.value;
  }

  serialize(): { ref: string; params: any[] } {
    return { ref: 'staticValue', params: [this.value] };
  }
}

/**
 * Computed value handler - executes a custom function.
 *
 * @description
 * For complex value computations that don't fit standard patterns.
 * Use sparingly - prefer specific handler classes when possible.
 *
 * @example
 * ```typescript
 * const handler = new ComputedValueHandler((ctx) => {
 *   const comp = ctx.Utils.first(ctx.$selectedComponents);
 *   return comp?.customProperty?.nested?.value || 'default';
 * });
 * ```
 */
export class ComputedValueHandler<T> implements ValueHandler<T> {
  readonly handlerType = 'value' as const;
  readonly ref = 'computed';

  private readonly code: string;

  constructor(private readonly compute: (ctx: HandlerContext) => T, code?: string) {
    // Store the function body as code for serialization
    this.code = code || compute.toString();
  }

  execute(ctx: HandlerContext): T {
    return this.compute(ctx);
  }

  serialize(): string {
    // Return the function body as inline code
    return this.code;
  }
}
