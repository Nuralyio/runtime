import { vi } from 'vitest';

/**
 * Mock runtime utilities for testing runtime-related functionality
 */

/**
 * Create a mock ExecuteInstance
 */
export function createMockExecuteInstance() {
  return {
    componentsMap: new Map(),
    componentsProxyMap: new WeakMap(),
    contextProxyMap: new WeakMap(),
    variablesProxyMap: new WeakMap(),
    componentProxyCache: new Map(),
    logService: {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      clear: vi.fn(),
    },
    eventBus: {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
    registerComponent: vi.fn(),
    unregisterComponent: vi.fn(),
    getComponent: vi.fn(),
    updateComponent: vi.fn(),
    getComponentProxy: vi.fn(),
    createProxy: vi.fn(),
  };
}

/**
 * Create a mock handler context
 */
export function createMockHandlerContext(overrides: any = {}) {
  return {
    GetVar: vi.fn(),
    SetVar: vi.fn(),
    DeleteVar: vi.fn(),
    GetComponent: vi.fn(),
    UpdateComponent: vi.fn(),
    DeleteComponent: vi.fn(),
    NavigateToPage: vi.fn(),
    NavigateTo: vi.fn(),
    ShowAlert: vi.fn(),
    ShowConfirm: vi.fn(),
    InvokeFunction: vi.fn(),
    UploadFile: vi.fn(),
    DownloadFile: vi.fn(),
    GetUserInfo: vi.fn(),
    GetAppInfo: vi.fn(),
    GetPageInfo: vi.fn(),
    Log: vi.fn(),
    Warn: vi.fn(),
    Error: vi.fn(),
    ...overrides,
  };
}

/**
 * Create a mock component registry
 */
export function createMockComponentRegistry() {
  const registry = new Map();

  return {
    registry,
    register: vi.fn((id: string, component: any) => {
      registry.set(id, component);
    }),
    unregister: vi.fn((id: string) => {
      registry.delete(id);
    }),
    get: vi.fn((id: string) => {
      return registry.get(id);
    }),
    getAll: vi.fn(() => {
      return Array.from(registry.values());
    }),
    clear: vi.fn(() => {
      registry.clear();
    }),
  };
}

/**
 * Create a mock function compiler
 */
export function createMockCompiler() {
  const cache = new Map();

  return {
    cache,
    compile: vi.fn((code: string, params: string[]) => {
      const cacheKey = `${code}-${params.join(',')}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      // Simple mock compiled function
      const compiled = new Function(...params, code);
      cache.set(cacheKey, compiled);
      return compiled;
    }),
    clearCache: vi.fn(() => {
      cache.clear();
    }),
    getCacheSize: vi.fn(() => {
      return cache.size;
    }),
  };
}

/**
 * Create a mock state store
 */
export function createMockStore(initialState: any = {}) {
  let state = { ...initialState };
  const subscribers = new Set<(state: any) => void>();

  return {
    get: vi.fn(() => state),
    set: vi.fn((newState: any) => {
      state = { ...state, ...newState };
      subscribers.forEach((subscriber) => subscriber(state));
    }),
    subscribe: vi.fn((callback: (state: any) => void) => {
      subscribers.add(callback);
      return () => subscribers.delete(callback);
    }),
    reset: vi.fn(() => {
      state = { ...initialState };
    }),
  };
}

/**
 * Mock runtime API functions
 */
export const mockRuntimeAPI = {
  // Variables
  GetVar: vi.fn((key: string) => undefined),
  SetVar: vi.fn((key: string, value: any) => {}),
  DeleteVar: vi.fn((key: string) => {}),

  // Components
  GetComponent: vi.fn((id: string) => undefined),
  UpdateComponent: vi.fn((id: string, properties: any) => {}),
  DeleteComponent: vi.fn((id: string) => {}),

  // Navigation
  NavigateToPage: vi.fn((pageName: string) => {}),
  NavigateTo: vi.fn((url: string) => {}),

  // UI
  ShowAlert: vi.fn((message: string) => {}),
  ShowConfirm: vi.fn((message: string) => Promise.resolve(true)),

  // Backend
  InvokeFunction: vi.fn((name: string, params: any) => Promise.resolve({})),

  // Files
  UploadFile: vi.fn(() => Promise.resolve({})),
  DownloadFile: vi.fn((url: string, filename: string) => {}),

  // Info
  GetUserInfo: vi.fn(() => ({})),
  GetAppInfo: vi.fn(() => ({})),
  GetPageInfo: vi.fn(() => ({})),

  // Logging
  Log: vi.fn((...args: any[]) => {}),
  Warn: vi.fn((...args: any[]) => {}),
  Error: vi.fn((...args: any[]) => {}),
};

/**
 * Reset all mock runtime API functions
 */
export function resetMockRuntimeAPI() {
  Object.values(mockRuntimeAPI).forEach((fn) => {
    if (typeof fn === 'function' && 'mockClear' in fn) {
      fn.mockClear();
    }
  });
}
