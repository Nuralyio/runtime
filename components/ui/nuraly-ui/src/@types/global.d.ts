/**
 * Global type declarations for external modules
 * These declarations prevent TypeScript from trying to compile
 * source files outside the nuraly-ui package boundary
 */

// Declare nanostores to satisfy imports in external redux files
declare module 'nanostores' {
  export function atom<T>(initialValue: T): {
    get(): T;
    set(value: T): void;
    subscribe(callback: (value: T) => void): () => void;
  };

  export function map<T>(initialValue: T): {
    get(): T;
    set(value: T): void;
    setKey(key: string, value: unknown): void;
    subscribe(callback: (value: T) => void): () => void;
  };
}

// Mocha TDD interface globals (used by @web/test-runner with ui:'tdd')
// `test` is already provided by @types/jest; only `suite` and `setup` are missing.
declare function suite(title: string, fn: () => void): void;
declare function setup(fn: () => void): void;

declare module '@nanostores/persistent' {
  export function persistentAtom<T>(
    key: string,
    initialValue: T,
    options?: { encode?: (value: T) => string; decode?: (value: string) => T }
  ): {
    get(): T;
    set(value: T): void;
    subscribe(callback: (value: T) => void): () => void;
  };
}
