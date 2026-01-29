/**
 * @fileoverview Unit tests for Type-Safe State Handlers
 */

import { describe, it, expect, vi } from 'vitest';
import {
  DefaultStyleStateHandler,
  InputStateHandler,
  IconPickerDisableHandler,
  ValueStateHandler,
  CombinedStateHandler,
  ConditionalStateHandler,
  AlwaysEnabledHandler,
  AlwaysDisabledHandler,
  InputHelperTextHandler,
} from '../../../../src/features/studio/core/handlers/state-handlers';
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

describe('State Handlers', () => {
  describe('DefaultStyleStateHandler', () => {
    it('returns disabled when style handler exists', () => {
      const handler = new DefaultStyleStateHandler('width');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          style_handlers: { width: 'return "100px"' },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('disabled');
    });

    it('returns enabled when no style handler', () => {
      const handler = new DefaultStyleStateHandler('width');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          style_handlers: {},
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('enabled');
    });

    it('returns enabled when style_handlers is undefined', () => {
      const handler = new DefaultStyleStateHandler('width');
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });

      expect(handler.execute(ctx)).toBe('enabled');
    });

    it('has correct handlerType', () => {
      const handler = new DefaultStyleStateHandler('width');
      expect(handler.handlerType).toBe('state');
    });
  });

  describe('InputStateHandler', () => {
    it('returns disabled when input has handler type', () => {
      const handler = new InputStateHandler('placeholder');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {
            placeholder: { type: 'handler', value: 'return "dynamic"' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('disabled');
    });

    it('returns enabled when input has value type', () => {
      const handler = new InputStateHandler('placeholder');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {
            placeholder: { type: 'value', value: 'Enter text...' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('enabled');
    });

    it('returns enabled when handler value is empty', () => {
      const handler = new InputStateHandler('placeholder');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {
            placeholder: { type: 'handler', value: '' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('enabled');
    });

    it('returns enabled when input property is undefined', () => {
      const handler = new InputStateHandler('placeholder');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {},
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('enabled');
    });
  });

  describe('IconPickerDisableHandler', () => {
    it('returns true (disabled) when handler exists', () => {
      const handler = new IconPickerDisableHandler('icon');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {
            icon: { type: 'handler', value: 'return $dynamicIcon' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe(true);
    });

    it('returns false (enabled) when no handler', () => {
      const handler = new IconPickerDisableHandler('icon');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {
            icon: { type: 'value', value: 'star' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe(false);
    });
  });

  describe('ValueStateHandler', () => {
    it('returns disabled when value is a handler', () => {
      const handler = new ValueStateHandler();
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {
            value: { type: 'handler', value: 'return $computed' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('disabled');
    });

    it('returns enabled when value is not a handler', () => {
      const handler = new ValueStateHandler();
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {
            value: { type: 'string', value: 'static value' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('enabled');
    });
  });

  describe('CombinedStateHandler', () => {
    it('returns disabled when style handler exists', () => {
      const handler = new CombinedStateHandler('color');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          style_handlers: { color: 'return "red"' },
          input: {},
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('disabled');
    });

    it('returns disabled when input handler exists', () => {
      const handler = new CombinedStateHandler('color');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          style_handlers: {},
          input: {
            color: { type: 'handler', value: 'return "blue"' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('disabled');
    });

    it('returns enabled when neither handler exists', () => {
      const handler = new CombinedStateHandler('color');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          style_handlers: {},
          input: {
            color: { type: 'value', value: 'green' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('enabled');
    });
  });

  describe('ConditionalStateHandler', () => {
    it('returns enabled when condition is true and enableWhenTrue is true', () => {
      const handler = new ConditionalStateHandler(
        (ctx) => ctx.$selectedComponents.length > 0,
        true
      );
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });

      expect(handler.execute(ctx)).toBe('enabled');
    });

    it('returns disabled when condition is false and enableWhenTrue is true', () => {
      const handler = new ConditionalStateHandler(
        (ctx) => ctx.$selectedComponents.length > 0,
        true
      );
      const ctx = createMockContext({
        $selectedComponents: [],
      });

      expect(handler.execute(ctx)).toBe('disabled');
    });

    it('inverts logic when enableWhenTrue is false', () => {
      const handler = new ConditionalStateHandler(
        (ctx) => ctx.$selectedComponents.length > 0,
        false
      );
      const ctx = createMockContext({
        $selectedComponents: [{ uuid: '123' }] as any,
      });

      expect(handler.execute(ctx)).toBe('disabled');
    });
  });

  describe('AlwaysEnabledHandler', () => {
    it('always returns enabled', () => {
      const handler = new AlwaysEnabledHandler();
      expect(handler.execute(createMockContext())).toBe('enabled');
    });
  });

  describe('AlwaysDisabledHandler', () => {
    it('always returns disabled', () => {
      const handler = new AlwaysDisabledHandler();
      expect(handler.execute(createMockContext())).toBe('disabled');
    });
  });

  describe('InputHelperTextHandler', () => {
    it('returns helper text when handler is active', () => {
      const handler = new InputHelperTextHandler('label');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {
            label: { type: 'handler', value: 'return "dynamic"' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('Value driven by handler');
    });

    it('returns empty string when no handler', () => {
      const handler = new InputHelperTextHandler('label');
      const ctx = createMockContext({
        $selectedComponents: [{
          uuid: '123',
          input: {
            label: { type: 'value', value: 'static' },
          },
        }] as any,
      });

      expect(handler.execute(ctx)).toBe('');
    });
  });
});
