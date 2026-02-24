/**
 * @fileoverview Unit tests for Type-Safe Value Handlers
 */

import { describe, it, expect, vi } from 'vitest';
import {
  ComponentNameHandler,
  ComponentInputHandler,
  ComponentInputHandlerValue,
  ComponentInputRadioHandler,
  ComponentStyleHandler,
  ComponentStyleSelectHandler,
  ComponentInputSelectHandler,
  DisplayToggleHandler,
  RadioWithOptionsHandler,
  HandlerValueGetter,
  ComponentIdHandler,
  StaticValueHandler,
  ComputedValueHandler,
} from '../../../../src/features/studio/core/handlers/value-handlers';
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

describe('Value Handlers', () => {
  describe('ComponentNameHandler', () => {
    it('returns component name when component is selected', () => {
      const handler = new ComponentNameHandler();
      const ctx = createMockContext({
        $selectedComponents: [{ name: 'My Button', uuid: '123' }] as any,
      });

      expect(handler.execute(ctx)).toBe('My Button');
    });

    it('returns empty string when no component selected', () => {
      const handler = new ComponentNameHandler();
      const ctx = createMockContext();

      expect(handler.execute(ctx)).toBe('');
    });

    it('has correct handlerType', () => {
      const handler = new ComponentNameHandler();
      expect(handler.handlerType).toBe('value');
    });
  });

  describe('ComponentInputHandler', () => {
    it('returns input value when type is value', () => {
      const handler = new ComponentInputHandler('label');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentBreakpointInput as any).mockReturnValue({
        type: 'value',
        value: 'Hello World',
      });

      expect(handler.execute(ctx)).toBe('Hello World');
    });

    it('returns default when type is handler', () => {
      const handler = new ComponentInputHandler('label', 'Default');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentBreakpointInput as any).mockReturnValue({
        type: 'handler',
        value: 'return "computed"',
      });

      expect(handler.execute(ctx)).toBe('Default');
    });

    it('returns default when input is undefined', () => {
      const handler = new ComponentInputHandler('label', 'Default');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentBreakpointInput as any).mockReturnValue(undefined);

      expect(handler.execute(ctx)).toBe('Default');
    });

    it('returns empty string when no default provided', () => {
      const handler = new ComponentInputHandler('label');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentBreakpointInput as any).mockReturnValue(undefined);

      expect(handler.execute(ctx)).toBe('');
    });
  });

  describe('ComponentInputHandlerValue', () => {
    it('returns handler code when type is handler', () => {
      const handler = new ComponentInputHandlerValue('icon');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentBreakpointInput as any).mockReturnValue({
        type: 'handler',
        value: 'return $icon',
      });

      expect(handler.execute(ctx)).toBe('return $icon');
    });

    it('returns default when type is not handler', () => {
      const handler = new ComponentInputHandlerValue('icon', 'default-code');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentBreakpointInput as any).mockReturnValue({
        type: 'value',
        value: 'star',
      });

      expect(handler.execute(ctx)).toBe('default-code');
    });
  });

  describe('ComponentInputRadioHandler', () => {
    const options = [
      { label: 'Small', value: 'small' },
      { label: 'Medium', value: 'medium' },
      { label: 'Large', value: 'large' },
    ];

    it('returns options with current value', () => {
      const handler = new ComponentInputRadioHandler('size', options, 'medium');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentBreakpointInput as any).mockReturnValue({
        type: 'value',
        value: 'large',
      });

      const result = handler.execute(ctx);
      expect(result).toEqual([options, 'large', 'button']);
    });

    it('returns default when type is handler', () => {
      const handler = new ComponentInputRadioHandler('size', options, 'medium');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentBreakpointInput as any).mockReturnValue({
        type: 'handler',
        value: 'return "small"',
      });

      const result = handler.execute(ctx);
      expect(result).toEqual([options, 'medium', 'button']);
    });
  });

  describe('ComponentStyleHandler', () => {
    it('returns style value', () => {
      const handler = new ComponentStyleHandler('width');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentStyle as any).mockReturnValue('100px');

      expect(handler.execute(ctx)).toBe('100px');
    });

    it('returns default when style is undefined', () => {
      const handler = new ComponentStyleHandler('width', 'auto');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentStyle as any).mockReturnValue(undefined);

      expect(handler.execute(ctx)).toBe('auto');
    });
  });

  describe('ComponentStyleSelectHandler', () => {
    const options = [
      { label: 'Flex', value: 'flex' },
      { label: 'Block', value: 'block' },
    ];

    it('returns options with current value as array', () => {
      const handler = new ComponentStyleSelectHandler('display', options, 'flex');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });
      (ctx.Editor.getComponentStyle as any).mockReturnValue('block');

      const result = handler.execute(ctx);
      expect(result).toEqual([options, ['block']]);
    });
  });

  describe('HandlerValueGetter', () => {
    it('returns property name and handler code for input handlers', () => {
      const handler = new HandlerValueGetter('label', 'input');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          inputHandlers: { label: 'return "dynamic"' },
        }] as any,
      });

      const result = handler.execute(ctx);
      expect(result).toEqual(['label', 'return "dynamic"']);
    });

    it('returns property name and handler code for style handlers', () => {
      const handler = new HandlerValueGetter('color', 'style');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          style_handlers: { color: 'return "#ff0000"' },
        }] as any,
      });

      const result = handler.execute(ctx);
      expect(result).toEqual(['color', 'return "#ff0000"']);
    });

    it('returns empty string when no handler exists', () => {
      const handler = new HandlerValueGetter('label', 'input');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });

      const result = handler.execute(ctx);
      expect(result).toEqual(['label', '']);
    });
  });

  describe('ComponentIdHandler', () => {
    it('returns component uuid', () => {
      const handler = new ComponentIdHandler();
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: 'comp-123' }] as any,
      });

      expect(handler.execute(ctx)).toBe('comp-123');
    });
  });

  describe('StaticValueHandler', () => {
    it('always returns the static value', () => {
      const handler = new StaticValueHandler('constant');
      const ctx = createMockContext();

      expect(handler.execute(ctx)).toBe('constant');
    });

    it('works with any type', () => {
      const numberHandler = new StaticValueHandler(42);
      const objectHandler = new StaticValueHandler({ key: 'value' });

      expect(numberHandler.execute(createMockContext())).toBe(42);
      expect(objectHandler.execute(createMockContext())).toEqual({ key: 'value' });
    });
  });

  describe('ComputedValueHandler', () => {
    it('executes custom computation', () => {
      const handler = new ComputedValueHandler((ctx) => {
        const comp = ctx.Utils.first(ctx.$selectedComponents);
        return comp?.name?.toUpperCase() || 'NONE';
      });
      const ctx = createMockContext({
        $selectedComponents: [{ name: 'button' }] as any,
      });

      expect(handler.execute(ctx)).toBe('BUTTON');
    });
  });
});
