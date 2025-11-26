/**
 * @fileoverview Unit Tests for Handler Validator
 * @module Shared/Utils/HandlerValidator/Tests
 */

import { describe, test, expect } from 'vitest';
import { validateHandlerCode, validateComponentHandlers } from '@shared/utils/handler-validator';

/**
 * Helper function to test invalid code patterns
 */
function testInvalidCode(description: string, code: string, expectedType?: string, expectedIdentifier?: string) {
  test(description, () => {
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    
    if (expectedType) {
      expect(result.errors.some(e => e.type === expectedType)).toBe(true);
    }
    if (expectedIdentifier) {
      expect(result.errors.some(e => e.identifier === expectedIdentifier)).toBe(true);
    }
  });
}

/**
 * Helper function to test valid code patterns
 */
function testValidCode(description: string, code: string) {
  test(description, () => {
    const result = validateHandlerCode(code);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
}

describe('Handler Validator - Malicious Code Detection', () => {
  testInvalidCode('blocks eval() calls', "eval('malicious code')", 'forbidden_function', 'eval');
  testInvalidCode('blocks Function constructor', "new Function('return 1')()", 'forbidden_function');
  testInvalidCode('blocks window object access', "window.location.href = 'evil.com'", undefined, 'window');
  testInvalidCode('blocks global object access', "global.process.exit()", undefined, 'global');
  testInvalidCode('blocks globalThis access', "globalThis.eval('code')", undefined, 'globalThis');
  testInvalidCode('blocks process object', "process.env.SECRET_KEY", undefined, 'process');
  testInvalidCode('blocks require() calls', "const fs = require('fs')", undefined, 'require');
  testInvalidCode('blocks __proto__ manipulation', "obj.__proto__ = {}", 'forbidden_property', '__proto__');
  testInvalidCode('blocks prototype manipulation', "Object.prototype.polluted = 'bad'", undefined, 'prototype');
  testInvalidCode('blocks constructor access', "obj.constructor.constructor('return this')()", undefined, 'constructor');
  testInvalidCode('blocks setTimeout with string', "setTimeout('alert(1)', 1000)", 'forbidden_function', 'setTimeout');
  testInvalidCode('blocks setInterval with string', "setInterval('console.log(1)', 1000)", 'forbidden_function');
  testInvalidCode('blocks dynamic import()', "import('malicious-module')", 'forbidden_pattern');
  testInvalidCode('blocks localStorage access', "localStorage.setItem('key', 'value')", undefined, 'localStorage');
  testInvalidCode('blocks sessionStorage access', "sessionStorage.getItem('key')", undefined, 'sessionStorage');
});

describe('Handler Validator - Valid Code Acceptance', () => {
  testValidCode('allows GetVar/SetVar', "const value = GetVar('count') || 0; SetVar('count', value + 1);");
  testValidCode('allows navigation functions', "NavigateToPage('Dashboard')");
  testValidCode('allows component updates', "updateInput(Current, 'text', 'static', 'Hello')");
  testValidCode('allows style updates', "updateStyle(Current, 'color', 'red')");
  testValidCode('allows InvokeFunction', "const result = await InvokeFunction('fetchData', { id: 123 })");
  testValidCode('allows Database access', "const users = await Database.query('users')");
  testValidCode('allows Event and EventData', "const clickX = Event.clientX; const value = EventData.value;");
  testValidCode('allows GetComponent', "const comp = GetComponent('componentId')");
  testValidCode('allows Utils', "const first = Utils.first(array)");
  testValidCode('allows console.log', "console.log('Debug message')");
  testValidCode('allows fetch calls', "const response = await fetch('https://api.example.com'); const data = await response.json();");
  testValidCode('allows variable declarations', `
    const count = GetVar('count') || 0;
    const newCount = count + 1;
    SetVar('count', newCount);
    return newCount;
  `);
  testValidCode('allows conditional logic', `
    const value = GetVar('value');
    if (value > 10) {
      NavigateToPage('Success');
    } else {
      updateInput(Current, 'text', 'static', 'Too low');
    }
  `);
  testValidCode('allows loops', `
    const items = GetVar('items') || [];
    for (let i = 0; i < items.length; i++) {
      console.log(items[i]);
    }
  `);
  testValidCode('allows arrow functions', `
    const items = GetVar('items') || [];
    const names = items.map(item => item.name);
    return names;
  `);

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

describe('Handler Validator - Component Handlers', () => {
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

  test('validates style handler-type properties', () => {
    const component = {
      style: {
        color: { type: 'handler', value: "globalThis.theme" },
        fontSize: '16px', // static value, should be ignored
      }
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toContain('style.color');
  });

  test('validates valid style handler-type properties', () => {
    const component = {
      style: {
        color: { type: 'handler', value: "return GetVar('theme') === 'dark' ? '#fff' : '#000'" },
        fontSize: { type: 'handler', value: "return GetVar('fontSize') || '16px'" },
      }
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('validates multiple handler types', () => {
    const component = {
      event: {
        onClick: "GetVar('count')",
      },
      inputHandlers: {
        label: "eval('bad')",
      },
      styleHandlers: {
        color: "return 'red'",
      }
    };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toContain('inputHandlers.label');
  });

  testValidCode('allows component with all valid handlers', `
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
  `);

  test('handles component without handlers', () => {
    const component = { name: 'TestComponent', style: { color: 'red' } };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(true);
  });

  test('handles null/undefined handlers', () => {
    const component = { event: null, inputHandlers: undefined, styleHandlers: {} };
    const result = validateComponentHandlers(component);
    expect(result.valid).toBe(true);
  });
});

describe('Handler Validator - Real-World Patterns', () => {
  testValidCode('validates click counter handler', `
    const count = GetVar('clickCount') || 0;
    SetVar('clickCount', count + 1);
    updateInput(Current, 'text', 'static', 'Clicked: ' + (count + 1));
  `);

  testValidCode('validates form submission handler', `
    const formData = {
      name: GetVar('userName'),
      email: GetVar('userEmail'),
    };
    await InvokeFunction('submitForm', formData);
    NavigateToPage('Success');
  `);

  testValidCode('validates theme toggle handler', `
    const currentTheme = GetVar('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    SetVar('theme', newTheme);
    updateStyle(Current, 'backgroundColor', newTheme === 'dark' ? '#000' : '#fff');
  `);

  testValidCode('validates component visibility handler', `
    const selectedComponent = Utils.first(Vars.selectedComponents);
    return Editor.getComponentStyle(selectedComponent, 'display') || 'block';
  `);

  testValidCode('validates data fetching handler', `
    const userId = GetVar('currentUserId');
    if (!userId) {
      NavigateToPage('Login');
      return;
    }
    const userData = await InvokeFunction('fetchUser', { id: userId });
    SetVar('currentUser', userData);
    updateInput(Current, 'userName', 'static', userData.name);
  `);
});
