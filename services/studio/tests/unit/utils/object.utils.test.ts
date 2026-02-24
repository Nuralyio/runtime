import { describe, it, expect } from 'vitest';
import { getNestedAttribute, hasOnlyEmptyObjects } from '@/shared/utils/object.utils';

describe('getNestedAttribute', () => {
  it('should get a simple property', () => {
    const obj = { name: 'John' };
    const result = getNestedAttribute(obj, 'name');
    expect(result).toBe('John');
  });

  it('should get a nested property', () => {
    const obj = { user: { name: 'John', age: 30 } };
    const result = getNestedAttribute(obj, 'user.name');
    expect(result).toBe('John');
  });

  it('should get deeply nested property', () => {
    const obj = {
      data: {
        user: {
          profile: {
            name: 'John',
          },
        },
      },
    };
    const result = getNestedAttribute(obj, 'data.user.profile.name');
    expect(result).toBe('John');
  });

  it('should return undefined for non-existent path', () => {
    const obj = { name: 'John' };
    const result = getNestedAttribute(obj, 'age');
    expect(result).toBeUndefined();
  });

  it('should return undefined for non-existent nested path', () => {
    const obj = { user: { name: 'John' } };
    const result = getNestedAttribute(obj, 'user.age');
    expect(result).toBeUndefined();
  });

  it('should return undefined when intermediate path does not exist', () => {
    const obj = { user: { name: 'John' } };
    const result = getNestedAttribute(obj, 'profile.age');
    expect(result).toBeUndefined();
  });

  it('should handle empty object', () => {
    const obj = {};
    const result = getNestedAttribute(obj, 'name');
    expect(result).toBeUndefined();
  });

  it('should handle null values in path', () => {
    const obj = { user: null };
    const result = getNestedAttribute(obj, 'user.name');
    expect(result).toBeUndefined();
  });

  it('should handle array indices', () => {
    const obj = { users: [{ name: 'John' }, { name: 'Jane' }] };
    const result = getNestedAttribute(obj, 'users.0.name');
    expect(result).toBe('John');
  });
});

describe('hasOnlyEmptyObjects', () => {
  it('should return true for empty object', () => {
    const result = hasOnlyEmptyObjects({});
    expect(result).toBe(true);
  });

  it('should return true for null', () => {
    const result = hasOnlyEmptyObjects(null);
    expect(result).toBe(true);
  });

  it('should return true for undefined', () => {
    const result = hasOnlyEmptyObjects(undefined);
    expect(result).toBe(true);
  });

  it('should return true for object with only empty objects', () => {
    const obj = {
      field1: {},
      field2: {},
      field3: {},
    };
    const result = hasOnlyEmptyObjects(obj);
    expect(result).toBe(true);
  });

  it('should return false for object with non-empty nested object', () => {
    const obj = {
      field1: {},
      field2: { value: 'something' },
    };
    const result = hasOnlyEmptyObjects(obj);
    expect(result).toBe(false);
  });

  it('should return false for object with primitive values', () => {
    const obj = {
      field1: 'string',
      field2: 123,
    };
    const result = hasOnlyEmptyObjects(obj);
    expect(result).toBe(false);
  });

  it('should return true for object with empty array', () => {
    const obj = {
      field1: [],
    };
    const result = hasOnlyEmptyObjects(obj);
    // Empty arrays have Object.keys([]).length === 0, so treated as "empty"
    expect(result).toBe(true);
  });

  it('should return false for object with non-empty array', () => {
    const obj = {
      field1: [1, 2, 3],
    };
    const result = hasOnlyEmptyObjects(obj);
    expect(result).toBe(false);
  });

  it('should return false for object with mixed values', () => {
    const obj = {
      field1: {},
      field2: 'value',
      field3: {},
    };
    const result = hasOnlyEmptyObjects(obj);
    expect(result).toBe(false);
  });
});
