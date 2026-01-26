/**
 * @fileoverview Unit tests for Property Builder API
 */

import { describe, it, expect } from 'vitest';
import {
  PropertyBuilder,
  text,
  number,
  boolean,
  radio,
  inputText,
  inputBoolean,
  inputRadio,
} from '../../../../src/features/studio/core/properties/builder';
import {
  ComponentInputHandler,
  StaticValueHandler,
} from '../../../../src/features/studio/core/handlers/value-handlers';
import {
  InputStateHandler,
} from '../../../../src/features/studio/core/handlers/state-handlers';
import {
  UpdateInputHandler,
} from '../../../../src/features/studio/core/handlers/event-handlers';

describe('PropertyBuilder', () => {
  describe('basic configuration', () => {
    it('creates a property with required fields', () => {
      const prop = text('test_prop')
        .label('Test Property')
        .valueHandler(new StaticValueHandler('default'))
        .build();

      expect(prop.name).toBe('test_prop');
      expect(prop.label).toBe('Test Property');
      expect(prop.type).toBe('text');
    });

    it('auto-generates label from name if not provided', () => {
      const prop = text('textinput_myProperty')
        .valueHandler(new StaticValueHandler(''))
        .build();

      expect(prop.label).toBe('My Property');
    });

    it('throws error if name is missing', () => {
      expect(() => {
        new PropertyBuilder('', 'text').build();
      }).toThrow();
    });

    it('throws error if valueHandler is missing', () => {
      expect(() => {
        text('test').label('Test').build();
      }).toThrow('requires a valueHandler');
    });
  });

  describe('optional configuration', () => {
    it('sets inputProperty', () => {
      const prop = text('display_name')
        .label('Label')
        .inputProperty('label')
        .valueHandler(new StaticValueHandler(''))
        .build();

      expect(prop.inputProperty).toBe('label');
    });

    it('sets default value', () => {
      const prop = text('test')
        .label('Test')
        .default('default value')
        .valueHandler(new StaticValueHandler(''))
        .build();

      expect(prop.default).toBe('default value');
    });

    it('sets width', () => {
      const prop = text('test')
        .label('Test')
        .width('200px')
        .valueHandler(new StaticValueHandler(''))
        .build();

      expect(prop.width).toBe('200px');
    });

    it('sets placeholder', () => {
      const prop = text('test')
        .label('Test')
        .placeholder('Enter text...')
        .valueHandler(new StaticValueHandler(''))
        .build();

      expect(prop.placeholder).toBe('Enter text...');
    });

    it('sets options for radio/select', () => {
      const options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ];
      const prop = radio('test')
        .label('Test')
        .options(options)
        .valueHandler(new StaticValueHandler('a'))
        .build();

      expect(prop.options).toEqual(options);
    });

    it('sets number constraints', () => {
      const prop = number('test')
        .label('Test')
        .min(0)
        .max(100)
        .step(5)
        .unit('px')
        .valueHandler(new StaticValueHandler(50))
        .build();

      expect(prop.min).toBe(0);
      expect(prop.max).toBe(100);
      expect(prop.step).toBe(5);
      expect(prop.unit).toBe('px');
    });

    it('sets translatable flag', () => {
      const prop = text('test')
        .label('Test')
        .translatable()
        .valueHandler(new StaticValueHandler(''))
        .build();

      expect(prop.translatable).toBe(true);
    });

    it('sets autoCheckbox flag', () => {
      const prop = number('test')
        .label('Test')
        .autoCheckbox()
        .valueHandler(new StaticValueHandler(0))
        .build();

      expect(prop.autoCheckbox).toBe(true);
    });
  });

  describe('handler configuration', () => {
    it('sets custom valueHandler', () => {
      const handler = new ComponentInputHandler('label');
      const prop = text('test')
        .label('Test')
        .valueHandler(handler)
        .build();

      expect(prop.valueHandler).toBe(handler);
    });

    it('sets custom stateHandler', () => {
      const handler = new InputStateHandler('label');
      const prop = text('test')
        .label('Test')
        .valueHandler(new StaticValueHandler(''))
        .stateHandler(handler)
        .build();

      expect(prop.stateHandler).toBe(handler);
    });

    it('sets event handlers with on()', () => {
      const handler = new UpdateInputHandler('label', 'string');
      const prop = text('test')
        .label('Test')
        .valueHandler(new StaticValueHandler(''))
        .on('valueChange', handler)
        .build();

      expect(prop.eventHandlers.valueChange).toBe(handler);
    });

    it('sets valueChange handler with onValueChange()', () => {
      const handler = new UpdateInputHandler('label', 'string');
      const prop = text('test')
        .label('Test')
        .valueHandler(new StaticValueHandler(''))
        .onValueChange(handler)
        .build();

      expect(prop.eventHandlers.valueChange).toBe(handler);
    });

    it('sets onChange handler', () => {
      const handler = new UpdateInputHandler('label', 'string');
      const prop = text('test')
        .label('Test')
        .valueHandler(new StaticValueHandler(''))
        .onChange(handler)
        .build();

      expect(prop.eventHandlers.onChange).toBe(handler);
    });
  });

  describe('code handler support', () => {
    it('enables handler support with withHandler()', () => {
      const prop = text('test')
        .label('Test')
        .inputProperty('label')
        .valueHandler(new StaticValueHandler(''))
        .withHandler('input', 'label')
        .build();

      expect(prop.hasHandler).toBe(true);
      expect(prop.handlerType).toBe('input');
      expect(prop.handlerProperty).toBe('label');
    });

    it('enables input handler with withInputHandler()', () => {
      const prop = text('test')
        .label('Test')
        .inputProperty('myProp')
        .valueHandler(new StaticValueHandler(''))
        .withInputHandler()
        .build();

      expect(prop.hasHandler).toBe(true);
      expect(prop.handlerType).toBe('input');
      expect(prop.handlerProperty).toBe('myProp');
    });

    it('enables style handler with withStyleHandler()', () => {
      const prop = text('test')
        .label('Test')
        .valueHandler(new StaticValueHandler(''))
        .withStyleHandler('color')
        .build();

      expect(prop.hasHandler).toBe(true);
      expect(prop.handlerType).toBe('style');
      expect(prop.handlerProperty).toBe('color');
    });
  });

  describe('auto-configuration', () => {
    it('autoInputHandlers sets up standard input handlers', () => {
      const prop = text('test')
        .label('Test')
        .inputProperty('myProp')
        .autoInputHandlers('string')
        .build();

      expect(prop.valueHandler).toBeInstanceOf(ComponentInputHandler);
      expect(prop.stateHandler).toBeInstanceOf(InputStateHandler);
      expect(prop.eventHandlers.valueChange).toBeInstanceOf(UpdateInputHandler);
    });

    it('autoRadioHandlers sets up radio handlers', () => {
      const options = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ];
      const prop = radio('test')
        .label('Test')
        .inputProperty('myProp')
        .autoRadioHandlers(options, 'a')
        .build();

      expect(prop.options).toEqual(options);
      expect(prop.stateHandler).toBeInstanceOf(InputStateHandler);
      expect(prop.eventHandlers.onChange).toBeInstanceOf(UpdateInputHandler);
    });

    it('autoBooleanHandlers sets up boolean handlers', () => {
      const prop = boolean('test')
        .label('Test')
        .inputProperty('myProp')
        .autoBooleanHandlers()
        .valueHandler(new StaticValueHandler(false))
        .build();

      expect(prop.stateHandler).toBeInstanceOf(InputStateHandler);
      expect(prop.eventHandlers.changed).toBeDefined();
    });
  });
});

describe('Factory Functions', () => {
  it('text() creates text property builder', () => {
    const builder = text('test');
    const prop = builder
      .label('Test')
      .valueHandler(new StaticValueHandler(''))
      .build();

    expect(prop.type).toBe('text');
  });

  it('number() creates number property builder', () => {
    const builder = number('test');
    const prop = builder
      .label('Test')
      .valueHandler(new StaticValueHandler(0))
      .build();

    expect(prop.type).toBe('number');
  });

  it('boolean() creates boolean property builder', () => {
    const builder = boolean('test');
    const prop = builder
      .label('Test')
      .valueHandler(new StaticValueHandler(false))
      .build();

    expect(prop.type).toBe('boolean');
  });

  it('radio() creates radio property builder', () => {
    const builder = radio('test');
    const prop = builder
      .label('Test')
      .valueHandler(new StaticValueHandler('a'))
      .build();

    expect(prop.type).toBe('radio');
  });
});

describe('Shorthand Helpers', () => {
  it('inputText creates configured text property', () => {
    const prop = inputText('textinput_label', 'label', 'Label')
      .placeholder('Enter label')
      .build();

    expect(prop.name).toBe('textinput_label');
    expect(prop.label).toBe('Label');
    expect(prop.inputProperty).toBe('label');
    expect(prop.width).toBe('180px');
    expect(prop.placeholder).toBe('Enter label');
    expect(prop.hasHandler).toBe(true);
    expect(prop.handlerType).toBe('input');
  });

  it('inputBoolean creates configured boolean property', () => {
    const prop = inputBoolean('test_readonly', 'readonly', 'Read Only')
      .build();

    expect(prop.name).toBe('test_readonly');
    expect(prop.label).toBe('Read Only');
    expect(prop.inputProperty).toBe('readonly');
    expect(prop.type).toBe('boolean');
    expect(prop.default).toBe(false);
    expect(prop.hasHandler).toBe(true);
  });

  it('inputRadio creates configured radio property', () => {
    const options = [
      { label: 'Small', value: 'small' },
      { label: 'Large', value: 'large' },
    ];
    const prop = inputRadio('test_size', 'size', 'Size', options, 'small')
      .build();

    expect(prop.name).toBe('test_size');
    expect(prop.label).toBe('Size');
    expect(prop.type).toBe('radio');
    expect(prop.options).toEqual(options);
    expect(prop.default).toBe('small');
  });
});
