import { vi } from 'vitest';

/**
 * Test utilities for common testing scenarios
 */

/**
 * Create a mock component with default properties
 */
export function createMockComponent(overrides: any = {}) {
  return {
    id: 'test-component-1',
    name: 'TestComponent',
    type: 'Container',
    properties: {},
    children: [],
    ...overrides,
  };
}

/**
 * Create a mock page with default structure
 */
export function createMockPage(overrides: any = {}) {
  return {
    id: 'test-page-1',
    name: 'TestPage',
    path: '/test',
    components: [],
    ...overrides,
  };
}

/**
 * Create a mock application
 */
export function createMockApplication(overrides: any = {}) {
  return {
    id: 'test-app-1',
    name: 'TestApp',
    pages: [],
    theme: {},
    ...overrides,
  };
}

/**
 * Create a mock runtime context
 */
export function createMockRuntimeContext() {
  return {
    components: new Map(),
    variables: {},
    globalContext: {},
    executeInstance: null,
    handlers: new Map(),
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}

/**
 * Wait for next tick
 */
export function nextTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Create a mock handler function
 */
export function createMockHandler(implementation?: (...args: any[]) => any) {
  return vi.fn(implementation || (() => {}));
}

/**
 * Create a spy on console methods
 */
export function spyOnConsole() {
  return {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  };
}

/**
 * Flush all pending promises
 */
export async function flushPromises() {
  await new Promise((resolve) => queueMicrotask(resolve));
}

/**
 * Create a mock event
 */
export function createMockEvent(type: string, options: any = {}) {
  return new Event(type, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

/**
 * Create a mock custom event with detail
 */
export function createMockCustomEvent(type: string, detail: any = {}, options: any = {}) {
  return new CustomEvent(type, {
    bubbles: true,
    cancelable: true,
    detail,
    ...options,
  });
}
