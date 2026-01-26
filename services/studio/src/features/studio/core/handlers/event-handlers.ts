/**
 * @fileoverview Type-Safe Event Handlers
 * @module Studio/Core/Handlers/EventHandlers
 *
 * @description
 * EventHandlers respond to user actions (onChange, onClick, etc.) and
 * update component properties accordingly. They replace the string-based
 * handlers in handler-library.ts with typed TypeScript classes.
 *
 * @example
 * ```typescript
 * // OLD (string-based):
 * eventHandlers: {
 *   valueChange: {
 *     ref: "updateInput",
 *     params: ["label", "string"]
 *   }
 * }
 *
 * // NEW (typed):
 * eventHandlers: {
 *   valueChange: new UpdateInputHandler("label", "string")
 * }
 * ```
 */

import type { EventHandler, HandlerContext } from './types';

/**
 * Value type for updateInput function.
 */
export type InputValueType = 'string' | 'number' | 'boolean' | 'array' | 'object' | 'handler' | 'value';

/**
 * Update component name handler.
 *
 * @description
 * Updates the component's display name. Used with text inputs
 * that edit the component name property.
 *
 * @example
 * ```typescript
 * const handler = new UpdateNameHandler();
 * // On value change: component.name = EventData.value
 * ```
 */
export class UpdateNameHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  execute(ctx: HandlerContext): void {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (selectedComponent) {
      ctx.updateName(selectedComponent, ctx.EventData.value as string);
    }
  }
}

/**
 * Update component input property handler.
 *
 * @description
 * Updates a component's input property with type specification.
 * Input properties are the data values that configure component behavior.
 *
 * @example
 * ```typescript
 * const handler = new UpdateInputHandler('placeholder', 'string');
 * // On value change: component.input.placeholder = { type: 'string', value: EventData.value }
 * ```
 */
export class UpdateInputHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(
    private readonly propertyName: string,
    private readonly valueType: InputValueType = 'string'
  ) {}

  execute(ctx: HandlerContext): void {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (selectedComponent) {
      ctx.updateInput(selectedComponent, this.propertyName, this.valueType, ctx.EventData.value);
    }
  }
}

/**
 * Update component input handler (dynamic code).
 *
 * @description
 * Updates an input property to be a handler, which contains JavaScript code
 * that computes input values dynamically at runtime. Used by the code icon
 * functionality.
 *
 * @example
 * ```typescript
 * const handler = new UpdateInputAsHandlerHandler('icon');
 * // On code change: component.input.icon = { type: 'handler', value: EventData.value }
 * ```
 */
export class UpdateInputAsHandlerHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(private readonly propertyName: string) {}

  execute(ctx: HandlerContext): void {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (selectedComponent) {
      ctx.updateInput(selectedComponent, this.propertyName, 'handler', ctx.EventData.value);
    }
  }
}

/**
 * Update component style property handler.
 *
 * @description
 * Updates a component's CSS style property. This is the most common event
 * handler for style-related inputs.
 *
 * @example
 * ```typescript
 * const handler = new UpdateStyleHandler('backgroundColor');
 * // On color change: component.style.backgroundColor = EventData.value
 * ```
 */
export class UpdateStyleHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(private readonly propertyName: string) {}

  execute(ctx: HandlerContext): void {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (!selectedComponent) return;
    ctx.updateStyle(selectedComponent, this.propertyName, ctx.EventData.value as string);
  }
}

/**
 * Update style property with automatic unit addition.
 *
 * @description
 * Updates a style property and automatically appends a unit (px, rem, %, etc.)
 * if needed. Intelligently handles values that already have units and special
 * keywords like 'auto'.
 *
 * @example
 * ```typescript
 * const handler = new UpdateStyleWithUnitHandler('width', 'px');
 * // User enters "100" → Becomes "100px"
 * // User enters "50rem" → Stays "50rem"
 * // User enters "auto" → Stays "auto"
 * ```
 */
export class UpdateStyleWithUnitHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(
    private readonly propertyName: string,
    private readonly unit: string = 'px'
  ) {}

  execute(ctx: HandlerContext): void {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (!selectedComponent) return;

    let value = ctx.EventData.value as string;

    // Add unit if value is not empty and not 'auto'
    if (value && value !== 'auto' && value !== '') {
      // Check if value already has a unit
      if (!/[a-z%]$/i.test(value)) {
        value = value + this.unit;
      }
    }

    ctx.updateStyle(selectedComponent, this.propertyName, value);
  }
}

/**
 * Update style handler (code icon).
 *
 * @description
 * Updates a style property's handler code. Used when the user edits
 * the code in the style handler editor (code icon).
 *
 * @example
 * ```typescript
 * const handler = new UpdateStyleHandlerHandler('color');
 * // On code change: component.style_handlers.color = EventData.value
 * ```
 */
export class UpdateStyleHandlerHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(private readonly propertyName: string) {}

  execute(ctx: HandlerContext): void {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (selectedComponent) {
      ctx.updateStyleHandler(selectedComponent, this.propertyName, ctx.EventData.value as string);
    }
  }
}

/**
 * Update input handler with type parameter.
 *
 * @description
 * Updates an input property's handler code with an explicit type.
 * Used when the handler type needs to be specified.
 *
 * @example
 * ```typescript
 * const handler = new UpdateInputHandlerWithTypeHandler('label', 'handler');
 * ```
 */
export class UpdateInputHandlerWithTypeHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(
    private readonly propertyName: string,
    private readonly handlerValueType: string = 'handler'
  ) {}

  execute(ctx: HandlerContext): void {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (selectedComponent) {
      ctx.updateInputHandler(
        selectedComponent,
        this.propertyName,
        ctx.EventData.value as string,
        this.handlerValueType
      );
    }
  }
}

/**
 * Composite event handler - runs multiple handlers in sequence.
 *
 * @description
 * Executes multiple event handlers when a single event occurs.
 * Useful for complex updates that affect multiple properties.
 *
 * @example
 * ```typescript
 * const handler = new CompositeEventHandler([
 *   new UpdateInputHandler('width', 'string'),
 *   new UpdateInputHandler('height', 'string')
 * ]);
 * ```
 */
export class CompositeEventHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(private readonly handlers: EventHandler[]) {}

  execute(ctx: HandlerContext): void {
    for (const handler of this.handlers) {
      handler.execute(ctx);
    }
  }
}

/**
 * Conditional event handler - only executes if condition is met.
 *
 * @description
 * Wraps another handler and only executes it if the condition returns true.
 *
 * @example
 * ```typescript
 * const handler = new ConditionalEventHandler(
 *   new UpdateStyleHandler('display'),
 *   (ctx) => ctx.EventData.value !== ''
 * );
 * ```
 */
export class ConditionalEventHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(
    private readonly handler: EventHandler,
    private readonly condition: (ctx: HandlerContext) => boolean
  ) {}

  execute(ctx: HandlerContext): void {
    if (this.condition(ctx)) {
      this.handler.execute(ctx);
    }
  }
}

/**
 * Custom event handler - executes a custom function.
 *
 * @description
 * For complex event handling that doesn't fit standard patterns.
 * Use sparingly - prefer specific handler classes when possible.
 *
 * @example
 * ```typescript
 * const handler = new CustomEventHandler((ctx) => {
 *   const comp = ctx.Utils.first(ctx.$selectedComponents);
 *   if (comp && ctx.EventData.value) {
 *     ctx.updateInput(comp, 'customProp', 'string', ctx.EventData.value);
 *     ctx.updateStyle(comp, 'color', 'blue');
 *   }
 * });
 * ```
 */
export class CustomEventHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(private readonly handler: (ctx: HandlerContext) => void) {}

  execute(ctx: HandlerContext): void {
    this.handler(ctx);
  }
}

/**
 * No-op event handler.
 *
 * @description
 * Does nothing. Used as a placeholder or to explicitly indicate
 * that no action should be taken.
 */
export class NoOpEventHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  execute(_ctx: HandlerContext): void {
    // Intentionally empty
  }
}

/**
 * Transform and update handler.
 *
 * @description
 * Transforms the event value before updating. Useful for value normalization,
 * validation, or conversion.
 *
 * @example
 * ```typescript
 * const handler = new TransformUpdateHandler(
 *   'fontSize',
 *   (value) => parseInt(value, 10) || 16,
 *   'number'
 * );
 * ```
 */
export class TransformUpdateInputHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(
    private readonly propertyName: string,
    private readonly transform: (value: unknown) => unknown,
    private readonly valueType: InputValueType = 'string'
  ) {}

  execute(ctx: HandlerContext): void {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (selectedComponent) {
      const transformedValue = this.transform(ctx.EventData.value);
      ctx.updateInput(selectedComponent, this.propertyName, this.valueType, transformedValue);
    }
  }
}

/**
 * Update boolean input with checkbox normalization.
 *
 * @description
 * Handles checkbox events which may return 'check'/'', true/false, or other formats.
 * Normalizes to boolean before updating.
 *
 * @example
 * ```typescript
 * const handler = new UpdateBooleanInputHandler('required');
 * ```
 */
export class UpdateBooleanInputHandler implements EventHandler {
  readonly handlerType = 'event' as const;

  constructor(private readonly propertyName: string) {}

  execute(ctx: HandlerContext): void {
    const selectedComponent = ctx.Utils.first(ctx.$selectedComponents);
    if (!selectedComponent) return;

    const rawValue = ctx.EventData.value;
    // Normalize to boolean
    const boolValue = rawValue === true ||
                      rawValue === 'true' ||
                      rawValue === 'check' ||
                      rawValue === 1;

    ctx.updateInput(selectedComponent, this.propertyName, 'boolean', boolValue);
  }
}
