/**
 * @fileoverview Unit Tests for Handler Validator
 * @module Shared/Utils/HandlerValidator/Tests
 */

import { describe, test, expect } from 'vitest';
import { validateHandlerCode, validateComponentHandlers } from '@shared/utils/handler-validator';

describe('Handler Validator - Malicious Code Detection', () => {
  test('blocks eval() calls', () => {
    const code = "eval('malicious code')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe('forbidden_function');
    expect(result.errors[0].message).toContain('eval');
  });

  test('blocks Function constructor', () => {
    const code = "new Function('return 1')()";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe('forbidden_function');
  });

  test('blocks window object access', () => {
    const code = "window.location.href = 'evil.com'";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'window')).toBe(true);
  });

  test('blocks global object access', () => {
    const code = "global.process.exit()";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'global')).toBe(true);
  });

  test('blocks globalThis access', () => {
    const code = "globalThis.eval('code')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'globalThis')).toBe(true);
  });

  test('blocks process object', () => {
    const code = "process.env.SECRET_KEY";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'process')).toBe(true);
  });

  test('blocks require() calls', () => {
    const code = "const fs = require('fs')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'require')).toBe(true);
  });

  test('blocks __proto__ manipulation', () => {
    const code = "obj.__proto__ = {}";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe('forbidden_property');
    expect(result.errors[0].identifier).toBe('__proto__');
  });

  test('blocks prototype manipulation', () => {
    const code = "Object.prototype.polluted = 'bad'";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'prototype')).toBe(true);
  });

  test('blocks constructor access', () => {
    const code = "obj.constructor.constructor('return this')()";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'constructor')).toBe(true);
  });

  test('blocks setTimeout with string', () => {
    const code = "setTimeout('alert(1)', 1000)";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe('forbidden_function');
    expect(result.errors[0].identifier).toBe('setTimeout');
  });

  test('blocks setInterval with string', () => {
    const code = "setInterval('console.log(1)', 1000)";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe('forbidden_function');
  });

  test('blocks dynamic import()', () => {
    const code = "import('malicious-module')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.type === 'forbidden_pattern')).toBe(true);
  });

  test('blocks localStorage access', () => {
    const code = "localStorage.setItem('key', 'value')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'localStorage')).toBe(true);
  });

  test('blocks sessionStorage access', () => {
    const code = "sessionStorage.getItem('key')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'sessionStorage')).toBe(true);
  });

  test('blocks fetch calls', () => {
    const code = "fetch('https://api.example.com')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.identifier === 'fetch')).toBe(true);
  });
});

describe('Handler Validator - Valid Code Acceptance', () => {
  test('allows GetVar/SetVar', () => {
    const code = "const value = GetVar('count') || 0; SetVar('count', value + 1);";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows navigation functions', () => {
    const code = "NavigateToPage('Dashboard')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows component updates', () => {
    const code = "updateInput(Current, 'text', 'static', 'Hello')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows style updates', () => {
    const code = "updateStyle(Current, 'color', 'red')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows InvokeFunction', () => {
    const code = "const result = await InvokeFunction('fetchData', { id: 123 })";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows Database access', () => {
    const code = "const users = await Database.query('users')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows Event and EventData', () => {
    const code = "const clickX = Event.clientX; const value = EventData.value;";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows GetComponent', () => {
    const code = "const comp = GetComponent('componentId')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows Utils', () => {
    const code = "const first = Utils.first(array)";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows console.log', () => {
    const code = "console.log('Debug message')";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows variable declarations', () => {
    const code = `
      const count = GetVar('count') || 0;
      const newCount = count + 1;
      SetVar('count', newCount);
      return newCount;
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows conditional logic', () => {
    const code = `
      const value = GetVar('value');
      if (value > 10) {
        NavigateToPage('Success');
      } else {
        updateInput(Current, 'text', 'static', 'Too low');
      }
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows loops', () => {
    const code = `
      const items = GetVar('items') || [];
      for (let i = 0; i < items.length; i++) {
        console.log(items[i]);
      }
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows arrow functions', () => {
    const code = `
      const items = GetVar('items') || [];
      const names = items.map(item => item.name);
      return names;
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows standard JavaScript built-ins', () => {
    const code = `
      const date = new Date();
      const str = JSON.stringify({ date });
      const num = parseInt('123');
      const result = Math.max(1, 2, 3);
      return result;
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows setTimeout with function', () => {
    const code = "setTimeout(() => { console.log('delayed'); }, 1000)";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows UpdateApplication', () => {
    const code = "UpdateApplication({ theme: 'dark' })";
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Handler Validator - Edge Cases', () => {
  test('handles empty code', () => {
    const result = validateHandlerCode('');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('handles whitespace-only code', () => {
    const result = validateHandlerCode('   \n  \t  ');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('handles syntax errors gracefully', () => {
    const code = "const x = ;"; // Invalid syntax
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].type).toBe('syntax');
  });

  test('allows variable shadowing', () => {
    const code = `
      const window = 'safe string';
      console.log(window); // Should be allowed as it's a local variable
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('allows function parameters with forbidden names', () => {
    const code = `
      const process = (data) => {
        return data.toUpperCase();
      };
      process('hello');
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('detects multiple violations', () => {
    const code = `
      eval('bad code');
      window.location = 'evil.com';
      obj.__proto__ = {};
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  test('provides line numbers for errors', () => {
    const code = `
      const x = 1;
      eval('bad');
      const y = 2;
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors[0].line).toBeDefined();
    expect(result.errors[0].column).toBeDefined();
  });
});

describe('Handler Validator - Component Validation', () => {
  test('validates event handlers', () => {
    const component = {
      event: {
        onClick: "eval('bad')",
      }
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toContain('event.onClick');
  });

  test('validates input handlers', () => {
    const component = {
      inputHandlers: {
        label: "window.alert('bad')",
      }
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toContain('inputHandlers.label');
  });

  test('validates style handlers', () => {
    const component = {
      styleHandlers: {
        color: "globalThis.theme",
      }
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toContain('styleHandlers.color');
  });

  test('validates multiple handler types', () => {
    const component = {
      event: {
        onClick: "GetVar('count')", // valid
      },
      inputHandlers: {
        label: "eval('bad')", // invalid
      },
      styleHandlers: {
        color: "return 'red'", // valid
      }
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toContain('inputHandlers.label');
  });

  test('validates component with all valid handlers', () => {
    const component = {
      event: {
        onClick: "SetVar('clicked', true)",
        onChange: "updateInput(Current, 'value', 'static', EventData.value)",
      },
      inputHandlers: {
        label: "return GetVar('labelText') || 'Default'",
        placeholder: "return 'Enter ' + GetVar('fieldType')",
      },
      styleHandlers: {
        color: "return Vars.theme === 'dark' ? '#fff' : '#000'",
        fontSize: "return GetVar('fontSize') || '16px'",
      }
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('handles component without handlers', () => {
    const component = {
      name: 'TestComponent',
      style: { color: 'red' },
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('handles null/undefined handlers', () => {
    const component = {
      event: null,
      inputHandlers: undefined,
      styleHandlers: {},
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('Handler Validator - Real-World Patterns', () => {
  test('validates click counter handler', () => {
    const code = `
      const count = GetVar('clickCount') || 0;
      SetVar('clickCount', count + 1);
      updateInput(Current, 'text', 'static', 'Clicked: ' + (count + 1));
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
  });

  test('validates form submission handler', () => {
    const code = `
      const formData = {
        name: GetVar('userName'),
        email: GetVar('userEmail'),
      };
      await InvokeFunction('submitForm', formData);
      NavigateToPage('Success');
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
  });

  test('validates theme toggle handler', () => {
    const code = `
      const currentTheme = GetVar('theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      SetVar('theme', newTheme);
      updateStyle(Current, 'backgroundColor', newTheme === 'dark' ? '#000' : '#fff');
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
  });

  test('validates component visibility handler', () => {
    const code = `
      const selectedComponent = Utils.first(Vars.selectedComponents);
      return Editor.getComponentStyle(selectedComponent, 'display') || 'block';
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
  });

  test('validates data fetching handler', () => {
    const code = `
      const userId = GetVar('currentUserId');
      if (!userId) {
        NavigateToPage('Login');
        return;
      }
      const userData = await InvokeFunction('fetchUser', { id: userId });
      SetVar('currentUser', userData);
      updateInput(Current, 'userName', 'static', userData.name);
    `;
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
  });
});
