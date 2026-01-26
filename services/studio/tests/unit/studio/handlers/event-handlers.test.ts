/**
 * @fileoverview Unit tests for Type-Safe Event Handlers
 */

import { describe, it, expect, vi } from 'vitest';
import {
  UpdateNameHandler,
  UpdateInputHandler,
  UpdateInputAsHandlerHandler,
  UpdateStyleHandler,
  UpdateStyleWithUnitHandler,
  UpdateStyleHandlerHandler,
  CompositeEventHandler,
  ConditionalEventHandler,
  CustomEventHandler,
  NoOpEventHandler,
  TransformUpdateInputHandler,
  UpdateBooleanInputHandler,
} from '../../../../src/features/studio/core/handlers/event-handlers';
import type { HandlerContext } from '../../../../src/features/studio/core/handlers/types';

// Mock context factory
function createMockContext(overrides: Partial<HandlerContext> = {}): HandlerContext {
  return {
    $selectedComponents: [],
    $currentPage: 'page-1',
    $currentEditingApplication: {
      uuid: 'app-1',
      name: 'Test App',
    },
    EventData: { value: undefined },
    Utils: {
      first: <T>(arr: T[] | undefined) => arr?.[0],
    },
    Editor: {
      getComponentBreakpointInput: vi.fn(),
      getComponentStyle: vi.fn(),
      getComponentStyleForState: vi.fn(),
    },
    updateInput: vi.fn(),
    updateStyle: vi.fn(),
    updateName: vi.fn(),
    updateStyleHandler: vi.fn(),
    updateInputHandler: vi.fn(),
    ...overrides,
  };
}

describe('Event Handlers', () => {
  describe('UpdateNameHandler', () => {
    it('updates component name', () => {
      const handler = new UpdateNameHandler();
      const component = { uuid: '123', name: 'Old Name' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 'New Name' },
      });

      handler.execute(ctx);

      expect(ctx.updateName).toHaveBeenCalledWith(component, 'New Name');
    });

    it('does nothing when no component selected', () => {
      const handler = new UpdateNameHandler();
      const ctx = createMockContext({
        $selectedComponents: [],
        EventData: { value: 'New Name' },
      });

      handler.execute(ctx);

      expect(ctx.updateName).not.toHaveBeenCalled();
    });

    it('has correct handlerType', () => {
      const handler = new UpdateNameHandler();
      expect(handler.handlerType).toBe('event');
    });
  });

  describe('UpdateInputHandler', () => {
    it('updates input with string type', () => {
      const handler = new UpdateInputHandler('label', 'string');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 'Hello' },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(component, 'label', 'string', 'Hello');
    });

    it('updates input with number type', () => {
      const handler = new UpdateInputHandler('maxLength', 'number');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 100 },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(component, 'maxLength', 'number', 100);
    });

    it('defaults to string type', () => {
      const handler = new UpdateInputHandler('label');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 'Test' },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(component, 'label', 'string', 'Test');
    });
  });

  describe('UpdateInputAsHandlerHandler', () => {
    it('updates input as handler type', () => {
      const handler = new UpdateInputAsHandlerHandler('icon');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 'return $dynamicIcon' },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(
        component,
        'icon',
        'handler',
        'return $dynamicIcon'
      );
    });
  });

  describe('UpdateStyleHandler', () => {
    it('updates style property', () => {
      const handler = new UpdateStyleHandler('backgroundColor');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '#ff0000' },
      });

      handler.execute(ctx);

      expect(ctx.updateStyle).toHaveBeenCalledWith(component, 'backgroundColor', '#ff0000');
    });

    it('does nothing when no component selected', () => {
      const handler = new UpdateStyleHandler('backgroundColor');
      const ctx = createMockContext({
        $selectedComponents: [],
        EventData: { value: '#ff0000' },
      });

      handler.execute(ctx);

      expect(ctx.updateStyle).not.toHaveBeenCalled();
    });
  });

  describe('UpdateStyleWithUnitHandler', () => {
    it('adds unit to numeric value', () => {
      const handler = new UpdateStyleWithUnitHandler('width', 'px');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '100' },
      });

      handler.execute(ctx);

      expect(ctx.updateStyle).toHaveBeenCalledWith(component, 'width', '100px');
    });

    it('preserves existing unit', () => {
      const handler = new UpdateStyleWithUnitHandler('width', 'px');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '50rem' },
      });

      handler.execute(ctx);

      expect(ctx.updateStyle).toHaveBeenCalledWith(component, 'width', '50rem');
    });

    it('preserves auto keyword', () => {
      const handler = new UpdateStyleWithUnitHandler('width', 'px');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 'auto' },
      });

      handler.execute(ctx);

      expect(ctx.updateStyle).toHaveBeenCalledWith(component, 'width', 'auto');
    });

    it('handles empty value', () => {
      const handler = new UpdateStyleWithUnitHandler('width', 'px');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '' },
      });

      handler.execute(ctx);

      expect(ctx.updateStyle).toHaveBeenCalledWith(component, 'width', '');
    });

    it('handles percentage unit', () => {
      const handler = new UpdateStyleWithUnitHandler('width', '%');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '50' },
      });

      handler.execute(ctx);

      expect(ctx.updateStyle).toHaveBeenCalledWith(component, 'width', '50%');
    });

    it('defaults to px unit', () => {
      const handler = new UpdateStyleWithUnitHandler('width');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '100' },
      });

      handler.execute(ctx);

      expect(ctx.updateStyle).toHaveBeenCalledWith(component, 'width', '100px');
    });
  });

  describe('UpdateStyleHandlerHandler', () => {
    it('updates style handler', () => {
      const handler = new UpdateStyleHandlerHandler('color');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 'return $themeColor' },
      });

      handler.execute(ctx);

      expect(ctx.updateStyleHandler).toHaveBeenCalledWith(
        component,
        'color',
        'return $themeColor'
      );
    });
  });

  describe('CompositeEventHandler', () => {
    it('executes multiple handlers in sequence', () => {
      const handler1 = new UpdateInputHandler('width', 'string');
      const handler2 = new UpdateInputHandler('height', 'string');
      const composite = new CompositeEventHandler([handler1, handler2]);

      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '100' },
      });

      composite.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledTimes(2);
      expect(ctx.updateInput).toHaveBeenNthCalledWith(1, component, 'width', 'string', '100');
      expect(ctx.updateInput).toHaveBeenNthCalledWith(2, component, 'height', 'string', '100');
    });
  });

  describe('ConditionalEventHandler', () => {
    it('executes handler when condition is true', () => {
      const innerHandler = new UpdateStyleHandler('color');
      const conditional = new ConditionalEventHandler(
        innerHandler,
        (ctx) => ctx.EventData.value !== ''
      );

      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 'red' },
      });

      conditional.execute(ctx);

      expect(ctx.updateStyle).toHaveBeenCalledWith(component, 'color', 'red');
    });

    it('does not execute when condition is false', () => {
      const innerHandler = new UpdateStyleHandler('color');
      const conditional = new ConditionalEventHandler(
        innerHandler,
        (ctx) => ctx.EventData.value !== ''
      );

      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '' },
      });

      conditional.execute(ctx);

      expect(ctx.updateStyle).not.toHaveBeenCalled();
    });
  });

  describe('CustomEventHandler', () => {
    it('executes custom function', () => {
      const customFn = vi.fn();
      const handler = new CustomEventHandler(customFn);
      const ctx = createMockContext();

      handler.execute(ctx);

      expect(customFn).toHaveBeenCalledWith(ctx);
    });
  });

  describe('NoOpEventHandler', () => {
    it('does nothing', () => {
      const handler = new NoOpEventHandler();
      const ctx = createMockContext();

      // Should not throw
      expect(() => handler.execute(ctx)).not.toThrow();
    });
  });

  describe('TransformUpdateInputHandler', () => {
    it('transforms value before updating', () => {
      const handler = new TransformUpdateInputHandler(
        'count',
        (value) => parseInt(value as string, 10) || 0,
        'number'
      );

      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '42abc' },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(component, 'count', 'number', 42);
    });
  });

  describe('UpdateBooleanInputHandler', () => {
    it('normalizes true value', () => {
      const handler = new UpdateBooleanInputHandler('required');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: true },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(component, 'required', 'boolean', true);
    });

    it('normalizes "check" to true', () => {
      const handler = new UpdateBooleanInputHandler('required');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 'check' },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(component, 'required', 'boolean', true);
    });

    it('normalizes "true" string to true', () => {
      const handler = new UpdateBooleanInputHandler('required');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: 'true' },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(component, 'required', 'boolean', true);
    });

    it('normalizes false value', () => {
      const handler = new UpdateBooleanInputHandler('required');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: false },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(component, 'required', 'boolean', false);
    });

    it('normalizes empty string to false', () => {
      const handler = new UpdateBooleanInputHandler('required');
      const component = { uuid: '123' };
      const ctx = createMockContext({
        $selectedComponents: [component] as any,
        EventData: { value: '' },
      });

      handler.execute(ctx);

      expect(ctx.updateInput).toHaveBeenCalledWith(component, 'required', 'boolean', false);
    });
  });
});
