/**
 * @fileoverview Property Builder API
 * @module Studio/Core/Properties/Builder
 *
 * @description
 * Fluent builder API for creating property definitions. Provides a clean,
 * chainable interface for defining component properties with full type safety.
 *
 * @example
 * ```typescript
 * import { text, boolean, radio } from './builder';
 *
 * const labelProperty = text('label')
 *   .label('Label')
 *   .placeholder('Enter label')
 *   .translatable()
 *   .withInputHandler()
 *   .build();
 * ```
 */

import type {
  PropertyDefinition,
  PropertyType,
  HandlerSourceType,
} from './types';
import type {
  ValueHandler,
  StateHandler,
  BooleanStateHandler,
  EventHandler,
  RadioOption,
  SelectOption,
} from '../handlers/types';
import {
  ComponentInputHandler,
  ComponentStyleHandler,
  ComponentInputRadioHandler,
  HandlerValueGetter,
  ComputedValueHandler,
  StaticValueHandler,
} from '../handlers/value-handlers';
import {
  InputStateHandler,
  DefaultStyleStateHandler,
} from '../handlers/state-handlers';
import {
  UpdateInputHandler,
  UpdateStyleHandler,
  UpdateStyleWithUnitHandler,
  UpdateInputAsHandlerHandler,
  UpdateBooleanInputHandler,
} from '../handlers/event-handlers';

/**
 * Fluent builder for creating PropertyDefinition objects.
 *
 * @template T - The value type for this property
 */
export class PropertyBuilder<T = unknown> {
  private definition: Partial<PropertyDefinition<T>> = {};

  constructor(name: string, type: PropertyType) {
    this.definition.name = name;
    this.definition.type = type;
    this.definition.eventHandlers = {};
  }

  /** Set display label */
  label(label: string): this {
    this.definition.label = label;
    return this;
  }

  /** Set component input property name (if different from name) */
  inputProperty(prop: string): this {
    this.definition.inputProperty = prop;
    return this;
  }

  /** Set default value */
  default(value: T): this {
    this.definition.default = value;
    return this;
  }

  /** Set input width */
  width(width: string): this {
    this.definition.width = width;
    return this;
  }

  /** Set placeholder text */
  placeholder(placeholder: string): this {
    this.definition.placeholder = placeholder;
    return this;
  }

  /** Set helper text */
  helperText(text: string): this {
    this.definition.helperText = text;
    return this;
  }

  /** Set options for radio/select */
  options(options: SelectOption[] | RadioOption[]): this {
    this.definition.options = options;
    return this;
  }

  /** Set CSS unit for number inputs */
  unit(unit: string): this {
    this.definition.unit = unit;
    return this;
  }

  /** Set min value for number inputs */
  min(min: number): this {
    this.definition.min = min;
    return this;
  }

  /** Set max value for number inputs */
  max(max: number): this {
    this.definition.max = max;
    return this;
  }

  /** Set step value for number inputs */
  step(step: number): this {
    this.definition.step = step;
    return this;
  }

  /** Set date format */
  format(format: string): this {
    this.definition.format = format;
    return this;
  }

  /** Enable i18n translation support */
  translatable(): this {
    this.definition.translatable = true;
    return this;
  }

  /** Enable auto checkbox */
  autoCheckbox(): this {
    this.definition.autoCheckbox = true;
    return this;
  }

  // === Handler Configuration ===

  /** Set custom value handler */
  valueHandler(handler: ValueHandler<T>): this {
    this.definition.valueHandler = handler;
    return this;
  }

  /** Set custom state handler */
  stateHandler(handler: StateHandler | BooleanStateHandler): this {
    this.definition.stateHandler = handler;
    return this;
  }

  /** Set custom helper text handler */
  helperHandler(handler: ValueHandler<string>): this {
    this.definition.helperHandler = handler;
    return this;
  }

  /** Add event handler */
  on(eventName: string, handler: EventHandler): this {
    this.definition.eventHandlers![eventName] = handler;
    return this;
  }

  /** Add valueChange event handler */
  onValueChange(handler: EventHandler): this {
    return this.on('valueChange', handler);
  }

  /** Add onChange event handler */
  onChange(handler: EventHandler): this {
    return this.on('onChange', handler);
  }

  /** Add changed event handler */
  onChanged(handler: EventHandler): this {
    return this.on('changed', handler);
  }

  // === Code Handler Support ===

  /** Set handler type (input or style) */
  handlerType(type: HandlerSourceType): this {
    this.definition.hasHandler = true;
    this.definition.handlerType = type;
    return this;
  }

  /** Set handler property name */
  handlerProperty(property: string): this {
    this.definition.handlerProperty = property;
    return this;
  }

  /** Enable code handler support with configuration */
  withHandler(type: HandlerSourceType = 'input', property?: string): this {
    this.definition.hasHandler = true;
    this.definition.handlerType = type;
    this.definition.handlerProperty = property || this.definition.inputProperty || this.definition.name;
    return this;
  }

  /** Enable input handler support (shorthand) */
  withInputHandler(property?: string): this {
    return this.withHandler('input', property);
  }

  /** Enable style handler support (shorthand) */
  withStyleHandler(property?: string): this {
    return this.withHandler('style', property);
  }

  /** Set handler value getter */
  handlerValueGetter(handler: ValueHandler<[string, string]>): this {
    this.definition.handlerValueGetter = handler;
    return this;
  }

  /** Set handler event update */
  handlerEventUpdate(handler: EventHandler): this {
    this.definition.handlerEventUpdate = handler;
    return this;
  }

  // === Auto-Configuration ===

  /**
   * Auto-configure standard input property handlers.
   *
   * Sets up:
   * - valueHandler: ComponentInputHandler
   * - stateHandler: InputStateHandler
   * - eventHandlers.valueChange: UpdateInputHandler
   */
  autoInputHandlers(valueType: 'string' | 'number' | 'boolean' = 'string'): this {
    const prop = this.definition.inputProperty || this.definition.name!;

    this.definition.valueHandler = new ComponentInputHandler(prop, this.definition.default) as ValueHandler<T>;
    this.definition.stateHandler = new InputStateHandler(prop);
    this.definition.eventHandlers!.valueChange = new UpdateInputHandler(prop, valueType);

    return this;
  }

  /**
   * Auto-configure standard style property handlers.
   *
   * Sets up:
   * - valueHandler: ComponentStyleHandler
   * - stateHandler: DefaultStyleStateHandler
   * - eventHandlers.valueChange: UpdateStyleHandler or UpdateStyleWithUnitHandler
   */
  autoStyleHandlers(unit?: string): this {
    const prop = this.definition.inputProperty || this.definition.name!;

    this.definition.valueHandler = new ComponentStyleHandler(prop, this.definition.default as string) as ValueHandler<T>;
    this.definition.stateHandler = new DefaultStyleStateHandler(prop);

    if (unit) {
      this.definition.eventHandlers!.valueChange = new UpdateStyleWithUnitHandler(prop, unit);
    } else {
      this.definition.eventHandlers!.valueChange = new UpdateStyleHandler(prop);
    }

    return this;
  }

  /**
   * Auto-configure for radio input with options.
   */
  autoRadioHandlers(options: RadioOption[], defaultValue: string = ''): this {
    const prop = this.definition.inputProperty || this.definition.name!;

    this.definition.options = options;
    this.definition.valueHandler = new ComponentInputRadioHandler(prop, options, defaultValue) as unknown as ValueHandler<T>;
    this.definition.stateHandler = new InputStateHandler(prop);
    this.definition.eventHandlers!.onChange = new UpdateInputHandler(prop, 'string');

    return this;
  }

  /**
   * Auto-configure for boolean input (checkbox/toggle).
   */
  autoBooleanHandlers(): this {
    const prop = this.definition.inputProperty || this.definition.name!;

    this.definition.stateHandler = new InputStateHandler(prop);
    this.definition.eventHandlers!.changed = new UpdateBooleanInputHandler(prop);

    return this;
  }

  /**
   * Build the final PropertyDefinition.
   *
   * @throws Error if required fields are missing
   */
  build(): PropertyDefinition<T> {
    // Validate required fields
    if (!this.definition.name) {
      throw new Error('Property name is required');
    }
    if (!this.definition.label) {
      // Auto-generate label from name
      this.definition.label = this.definition.name
        .replace(/^[a-z]+_/, '') // Remove prefix like "textinput_"
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, (s) => s.toUpperCase());
    }

    // Provide default valueHandler based on property type if not specified
    if (!this.definition.valueHandler) {
      const inputProp = this.definition.inputProperty || this.definition.name;
      const defaultValue = this.definition.default;

      switch (this.definition.type) {
        case 'radio':
        case 'select':
          this.definition.valueHandler = new ComponentInputRadioHandler(
            inputProp,
            this.definition.options || [],
            defaultValue ?? '',
            'default'
          ) as unknown as ValueHandler<T>;
          break;
        case 'text':
        case 'textarea':
        case 'color':
        case 'icon':
        case 'event':
        case 'date':
          this.definition.valueHandler = new ComponentInputHandler(inputProp, defaultValue ?? '') as unknown as ValueHandler<T>;
          break;
        case 'number':
          this.definition.valueHandler = new ComponentInputHandler(inputProp, defaultValue ?? 0) as unknown as ValueHandler<T>;
          break;
        case 'boolean':
          this.definition.valueHandler = new ComponentInputHandler(inputProp, defaultValue ?? false) as unknown as ValueHandler<T>;
          break;
        default:
          throw new Error(`Property "${this.definition.name}" requires a valueHandler`);
      }
    }

    return this.definition as PropertyDefinition<T>;
  }
}

// === Factory Functions ===

/**
 * Create a text property builder.
 */
export function text(name: string): PropertyBuilder<string> {
  return new PropertyBuilder<string>(name, 'text');
}

/**
 * Create a textarea property builder.
 */
export function textarea(name: string): PropertyBuilder<string> {
  return new PropertyBuilder<string>(name, 'textarea');
}

/**
 * Create a number property builder.
 */
export function number(name: string): PropertyBuilder<number> {
  return new PropertyBuilder<number>(name, 'number');
}

/**
 * Create a boolean property builder.
 */
export function boolean(name: string): PropertyBuilder<boolean> {
  return new PropertyBuilder<boolean>(name, 'boolean');
}

/**
 * Create a radio property builder.
 */
export function radio(name: string): PropertyBuilder<string> {
  return new PropertyBuilder<string>(name, 'radio');
}

/**
 * Create a select property builder.
 */
export function select(name: string): PropertyBuilder<string> {
  return new PropertyBuilder<string>(name, 'select');
}

/**
 * Create a color property builder.
 */
export function color(name: string): PropertyBuilder<string> {
  return new PropertyBuilder<string>(name, 'color');
}

/**
 * Create an icon property builder.
 */
export function icon(name: string): PropertyBuilder<string> {
  return new PropertyBuilder<string>(name, 'icon');
}

/**
 * Create an event property builder (for code editor).
 */
export function event(name: string): PropertyBuilder<string> {
  return new PropertyBuilder<string>(name, 'event');
}

/**
 * Create a date property builder.
 */
export function date(name: string): PropertyBuilder<string> {
  return new PropertyBuilder<string>(name, 'date');
}

// === Shorthand Helpers ===

/**
 * Create a standard text input property with all handlers configured.
 *
 * @example
 * ```typescript
 * const label = inputText('textinput_label', 'label', 'Label')
 *   .placeholder('Enter label')
 *   .translatable()
 *   .build();
 * ```
 */
export function inputText(name: string, inputProp: string, label: string): PropertyBuilder<string> {
  return text(name)
    .label(label)
    .inputProperty(inputProp)
    .width('180px')
    .autoInputHandlers('string')
    .withInputHandler(inputProp);
}

/**
 * Create a standard boolean property with all handlers configured.
 */
export function inputBoolean(name: string, inputProp: string, label: string): PropertyBuilder<boolean> {
  return boolean(name)
    .label(label)
    .inputProperty(inputProp)
    .width('180px')
    .default(false)
    .valueHandler(new ComponentInputHandler(inputProp, false) as unknown as ValueHandler<boolean>)
    .autoBooleanHandlers()
    .withInputHandler(inputProp);
}

/**
 * Create a standard radio property with all handlers configured.
 */
export function inputRadio(
  name: string,
  inputProp: string,
  label: string,
  options: RadioOption[],
  defaultValue: string
): PropertyBuilder<string> {
  return radio(name)
    .label(label)
    .inputProperty(inputProp)
    .width('180px')
    .default(defaultValue)
    .autoRadioHandlers(options, defaultValue)
    .withInputHandler(inputProp);
}
