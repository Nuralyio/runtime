# Nuraly Runtime System

The Runtime System is the core execution engine that powers the Nuraly visual web application builder. It manages component lifecycle, state, event handling, and dynamic code execution for both the studio editor and application preview environments.

## 📚 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Concepts](#core-concepts)
- [Directory Structure](#directory-structure)
- [Key Components](#key-components)
- [Handler Execution Flow](#handler-execution-flow)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Development Guide](#development-guide)
- [Performance Considerations](#performance-considerations)

## Overview

The Runtime System provides:

- **Handler Execution**: Compiles and executes JavaScript code strings from component properties
- **State Management**: Reactive state system with proxy-based change detection
- **Component Lifecycle**: Manages component registration, hierarchy, and relationships
- **Runtime API**: Rich API for components to interact with applications, pages, navigation, storage, and more
- **Editor Integration**: Connects studio editor with runtime execution environment

### Key Features

✅ **Dynamic Code Execution** - Execute JavaScript handlers with full runtime context  
✅ **Reactive State** - Automatic change detection and component updates  
✅ **Function Caching** - Compiled handler functions are cached for performance  
✅ **Hierarchy Management** - Automatic parent-child component relationships  
✅ **Platform-Aware** - Responsive design with breakpoint support  
✅ **Type-Safe API** - Well-defined interfaces for all runtime operations  

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Component Layer                       │
│            (Lit-based Web Components)                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  Runtime System                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Handlers   │  │    State     │  │  Runtime API │  │
│  │              │  │              │  │              │  │
│  │ • Compiler   │  │ • Context    │  │ • Variables  │  │
│  │ • Executor   │  │ • Editor     │  │ • Components │  │
│  │ • Context    │  │ • Proxies    │  │ • Navigation │  │
│  │   Setup      │  │              │  │ • Pages      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                  Store Layer                             │
│     (Nanostores - Global State Management)               │
└─────────────────────────────────────────────────────────┘
```

## Core Concepts

### 1. **Handlers**

Handlers are JavaScript code strings stored in component properties that are executed at runtime. They can be attached to:

- **Input Properties**: `input.text = { type: "handler", value: "GetVar('title')" }`
- **Style Properties**: `style.backgroundColor = { type: "handler", value: "GetVar('theme').primaryColor" }`
- **Event Properties**: `event.onClick = "NavigateToPage('dashboard')"`

### 2. **Runtime Context**

The Runtime Context (`ExecuteInstance`) is a singleton that maintains:

- **Component Registry**: All loaded components indexed by application ID
- **Context Variables**: Scoped variables (global and per-application)
- **Reactive Proxies**: Proxy objects that track property access and mutations
- **Event System**: Component change notifications and lifecycle events

### 3. **Execution Flow**

```
Component Property Access
         │
         ▼
   Is it a handler? ────No───▶ Return static value
         │
        Yes
         │
         ▼
  Compile Handler Function (with caching)
         │
         ▼
  Setup Runtime Context (component, event data, item)
         │
         ▼
  Extract Runtime Context (Apps, Vars, Current, etc.)
         │
         ▼
  Create Global Functions (GetVar, SetVar, NavigateToPage, etc.)
         │
         ▼
  Execute Compiled Function with all parameters
         │
         ▼
  Return Result & Trigger Side Effects
```

## Directory Structure

```
runtime/
├── index.ts                    # Main entry point, exports public API
├── README.md                   # This file
│
├── handlers/                   # Handler execution system
│   ├── index.ts               # Handler module exports
│   ├── compiler.ts            # Function compilation & caching
│   ├── handler-executor.ts    # Main handler execution orchestrator
│   ├── context-setup.ts       # Runtime context initialization
│   │
│   └── runtime-api/           # Global functions for handlers
│       ├── index.ts           # API aggregator
│       ├── variables.ts       # Variable management (GetVar, SetVar)
│       ├── components.ts      # Component operations (GetComponent, AddComponent)
│       ├── component-properties.ts  # Property updates (updateStyle, updateInput)
│       ├── pages.ts           # Page operations (AddPage, UpdatePage)
│       ├── applications.ts    # Application operations
│       ├── navigation.ts      # Navigation (NavigateToPage, NavigateToUrl)
│       ├── storage.ts         # File storage (UploadFile, BrowseFiles)
│       ├── functions.ts       # Backend function invocation
│       └── editor.ts          # Editor operations
│
└── state/                     # Runtime state management
    ├── index.ts              # State module exports
    ├── runtime-context.ts    # Core RuntimeContext singleton
    └── editor.ts             # Editor state & platform management
```

## Key Components

### RuntimeContext (ExecuteInstance)

The central state manager. Key responsibilities:

- **Component Registration**: Loads and indexes components from stores
- **Hierarchy Building**: Establishes parent-child relationships
- **Proxy Creation**: Creates reactive proxies for `Properties`, `Vars`, and component values
- **Change Tracking**: Monitors property access and emits change events
- **Values Management**: Manages component instance values with `attachValuesProperty`

```typescript
import { ExecuteInstance } from '@features/runtime';

// Access global variables
ExecuteInstance.VarsProxy.username = 'John Doe';
const theme = ExecuteInstance.GetVar('theme');

// Access component registry
const app = ExecuteInstance.Apps['MyApp'];
const component = ExecuteInstance.applications['app-id']['ButtonComponent'];
```

### Handler Compiler

Compiles JavaScript code strings into executable functions with caching.

**Features:**
- Function compilation with `new Function()`
- Automatic caching by code string
- Consistent parameter order (see `HANDLER_PARAMETERS`)
- Cache management utilities

```typescript
import { compileHandlerFunction } from '@features/runtime/handlers';

const fn = compileHandlerFunction("return GetVar('username')");
const result = fn(...allParameters);
```

### Handler Executor

Orchestrates handler execution with full runtime context.

**Process:**
1. Setup runtime context (component, event, item)
2. Extract runtime state (Apps, Vars, Current, etc.)
3. Create global functions (GetVar, NavigateToPage, etc.)
4. Compile handler code
5. Execute with all parameters
6. Return result

```typescript
import { executeHandler } from '@features/runtime';

const result = executeHandler(
  component,
  "GetVar('username')",
  { event: clickEvent },
  itemData
);
```

### Editor

Manages editor-specific state and platform detection.

**Features:**
- Platform detection (mobile, tablet, desktop)
- Breakpoint-aware style retrieval
- Component selection tracking
- Editor mode management
- Custom console for logging

```typescript
import Editor from '@features/runtime/state/editor';

Editor.setEditorMode(true);
const platform = Editor.getCurrentPlatform();
const styles = Editor.getComponentStyles(component);
```

## Handler Execution Flow

### Detailed Execution Process

```typescript
// 1. Handler is triggered (e.g., onClick event)
component.event.onClick = "SetVar('count', GetVar('count') + 1)";

// 2. executeHandler is called
executeHandler(component, component.event.onClick, { event: clickEvent });

// 3. Setup runtime context
setupRuntimeContext(component, EventData);
  // - Sets ExecuteInstance.Current = component
  // - Attaches values property
  // - Creates style proxy
  // - Sets event data

// 4. Extract runtime context
const runtimeContext = extractRuntimeContext();
  // - context, applications, Apps, Values, Current, etc.

// 5. Create global functions
const globalFunctions = createGlobalHandlerFunctions(runtimeContext);
  // - GetVar, SetVar, GetComponent, NavigateToPage, etc.

// 6. Compile handler
const compiledFunction = compileHandlerFunction(code);
  // - Creates Function with HANDLER_PARAMETERS
  // - Caches for reuse

// 7. Execute with all parameters (in exact order)
return compiledFunction(
  Database,
  eventDispatcher,
  PropertiesProxy,
  Editor,
  Event,
  Item,
  Current,
  currentPlatform,
  Values,
  Apps,
  Vars,
  SetVar,
  GetContextVar,
  UpdateApplication,
  GetVar,
  // ... all other parameters
);
```

## API Reference

### Variable Functions

Available in handler code:

#### `GetVar(symbol: string): any`
Gets a global variable value.

```javascript
const username = GetVar('username');
const theme = GetVar('theme');
```

#### `SetVar(symbol: string, value: any): void`
Sets a global variable value.

```javascript
SetVar('username', 'John Doe');
SetVar('theme', { primaryColor: '#3b82f6' });
```

#### `GetContextVar(symbol: string, customContextId: string | null, component: any): any`
Gets a context-scoped variable (application-specific).

```javascript
const appData = GetContextVar('appData', null, Current);
```

#### `SetContextVar(symbol: string, value: any, component: any): void`
Sets a context-scoped variable.

```javascript
SetContextVar('currentPage', 'dashboard', Current);
```

### Component Functions

#### `GetComponent(componentUuid: string, application_id: string): ComponentElement`
Retrieves a component by UUID.

```javascript
const button = GetComponent('comp-123-456', 'app-id');
button.style.backgroundColor = '#3b82f6';
```

#### `GetComponents(componentIds: string[]): ComponentElement[]`
Retrieves multiple components by their IDs.

```javascript
const buttons = GetComponents(['comp-1', 'comp-2', 'comp-3']);
buttons.forEach(btn => btn.style.opacity = '0.8');
```

#### `AddComponent({ application_id, pageId, componentType, additionalData }): void`
Adds a new component to a page.

```javascript
AddComponent({
  application_id: 'app-id',
  pageId: 'page-id',
  componentType: 'Button',
  additionalData: { input: { text: 'Click Me' } }
});
```

#### `DeleteComponentAction(component: ComponentElement): void`
Deletes a component with user confirmation.

```javascript
DeleteComponentAction(Current);
```

#### `CopyComponentToClipboard(component: ComponentElement): void`
Copies component to clipboard for pasting.

```javascript
CopyComponentToClipboard(Current);
```

#### `PasteComponentFromClipboard(): void`
Pastes component from clipboard.

```javascript
PasteComponentFromClipboard();
```

### Component Property Functions

#### `updateName(component: ComponentElement, componentName: string): void`
Updates component name.

```javascript
updateName(Current, 'PrimaryButton');
```

#### `updateInput(component: ComponentElement, inputName: string, handlerType: string, handlerValue: any): void`
Updates component input property.

```javascript
updateInput(Current, 'text', 'static', 'Hello World');
updateInput(Current, 'label', 'handler', "GetVar('username')");
```

#### `updateStyle(component: ComponentElement, symbol: string, value: any): void`
Updates component style property (supports pseudo-states).

```javascript
updateStyle(Current, 'backgroundColor', '#3b82f6');
updateStyle(Current, 'fontSize', '16px');
```

#### `updateEvent(component: ComponentElement, symbol: string, value: any): void`
Updates component event handler.

```javascript
updateEvent(Current, 'onClick', "NavigateToPage('dashboard')");
```

### Page Functions

#### `AddPage(page: any): Promise<any>`
Creates a new page.

```javascript
const newPage = await AddPage({
  name: 'Dashboard',
  application_id: 'app-id',
  route: '/dashboard'
});
```

#### `UpdatePage(page: any): Promise<any>`
Updates an existing page.

```javascript
await UpdatePage({
  uuid: 'page-id',
  name: 'Updated Dashboard',
  route: '/dashboard-v2'
});
```

#### `deletePage(page: PageElement): void`
Deletes a page with confirmation.

```javascript
deletePage(currentPage);
```

### Navigation Functions

#### `NavigateToUrl(url: string): void`
Navigates to external or internal URL.

```javascript
NavigateToUrl('https://example.com');
NavigateToUrl('/dashboard');
```

#### `NavigateToHash(hash: string): void`
Navigates to hash anchor and scrolls to element.

```javascript
NavigateToHash('#section-about');
```

#### `NavigateToPage(pageName: string): void`
Navigates to a page by name within the current application.

```javascript
NavigateToPage('Dashboard');
NavigateToPage('Profile');
```

### Storage Functions

#### `UploadFile(files: File | File[], folderPath: string): Promise<any>`
Uploads file(s) to storage.

```javascript
const fileInput = document.querySelector('input[type="file"]');
const result = await UploadFile(fileInput.files[0], 'images');

// Multiple files
const results = await UploadFile([...fileInput.files], 'documents');
```

#### `BrowseFiles(folderPath: string, options: { continuation?: string, limit?: number }): Promise<any>`
Lists files in a folder with pagination.

```javascript
const result = await BrowseFiles('images', { limit: 50 });
console.log(result.files);

// Load next page
if (result.continuation) {
  const nextPage = await BrowseFiles('images', { 
    continuation: result.continuation 
  });
}
```

### Function Invocation

#### `InvokeFunction(name: string, payload: any): Promise<any>`
Invokes a backend studio function.

```javascript
const result = await InvokeFunction('getUserData', { userId: 123 });
console.log(result);
```

### Application Functions

#### `UpdateApplication(application: any): void`
Updates application properties.

```javascript
UpdateApplication({
  uuid: 'app-id',
  name: 'Updated App Name',
  description: 'New description'
});
```

### Editor Functions

#### `openEditorTab(tab: any): void`
Opens a tab in the editor.

```javascript
openEditorTab({ type: 'component', componentId: 'comp-123' });
```

#### `setCurrentEditorTab(tab: any): void`
Sets the current active editor tab.

```javascript
setCurrentEditorTab({ type: 'styles' });
```

#### `TraitCompoentFromSchema(text: string): void`
Creates components from JSON schema text.

```javascript
TraitCompoentFromSchema(JSON.stringify({
  component_type: 'Container',
  children: [{ component_type: 'Text', input: { text: 'Hello' } }]
}));
```

## Usage Examples

### Example 1: Counter Component

```javascript
// Handler: Initialize counter
SetVar('count', 0);

// Handler: Increment on click
SetVar('count', GetVar('count') + 1);

// Handler: Display count
return `Count: ${GetVar('count')}`;
```

### Example 2: Theme Switcher

```javascript
// Handler: Toggle theme
const currentTheme = GetVar('theme') || 'light';
const newTheme = currentTheme === 'light' ? 'dark' : 'light';
SetVar('theme', newTheme);

// Update all components
Components.forEach(component => {
  if (component.component_type === 'Container') {
    updateStyle(component, 'backgroundColor', 
      newTheme === 'dark' ? '#1a1a1a' : '#ffffff'
    );
  }
});
```

### Example 3: Dynamic Form Submission

```javascript
// Handler: Form submit
const formData = {
  username: GetVar('form_username'),
  email: GetVar('form_email'),
  message: GetVar('form_message')
};

const result = await InvokeFunction('submitContactForm', formData);

if (result.success) {
  SetVar('form_submitted', true);
  NavigateToPage('ThankYou');
} else {
  SetVar('form_error', result.error);
}
```

### Example 4: File Upload with Preview

```javascript
// Handler: File upload
const fileInput = Event.target;
const file = fileInput.files[0];

if (file) {
  // Show loading
  updateInput(Current, 'loading', 'static', true);
  
  try {
    const result = await UploadFile(file, 'user-uploads');
    
    // Store file URL
    SetVar('uploaded_file_url', result.url);
    
    // Update preview component
    const previewImage = GetComponent('preview-img-id', Current.application_id);
    updateInput(previewImage, 'src', 'static', result.url);
    
    updateInput(Current, 'loading', 'static', false);
  } catch (error) {
    console.error('Upload failed:', error);
    updateInput(Current, 'error', 'static', error.message);
  }
}
```

### Example 5: Conditional Component Visibility

```javascript
// Handler: Check user authentication
const isLoggedIn = GetVar('user_authenticated');

if (isLoggedIn) {
  // Show user dashboard components
  const dashboardContainer = GetComponent('dashboard-id', Current.application_id);
  updateStyle(dashboardContainer, 'display', 'flex');
  
  // Hide login form
  const loginForm = GetComponent('login-form-id', Current.application_id);
  updateStyle(loginForm, 'display', 'none');
} else {
  // Redirect to login
  NavigateToPage('Login');
}
```

## Development Guide

### Adding New Runtime API Functions

1. **Choose the appropriate API module** in `handlers/runtime-api/`
2. **Define your function** with clear JSDoc comments
3. **Add to the module's export** in its `create*Functions()` function
4. **Update `HANDLER_PARAMETERS`** in `compiler.ts` if needed
5. **Pass the function** in `handler-executor.ts`
6. **Document in README** with examples

Example:

```typescript
// In handlers/runtime-api/variables.ts
export function createVariableFunctions(runtimeContext: any) {
  return {
    /**
     * Clears all global variables
     */
    ClearAllVars: (): void => {
      // Implementation
    },
  };
}

// In handlers/compiler.ts - add to HANDLER_PARAMETERS
export const HANDLER_PARAMETERS = [
  // ... existing parameters
  "ClearAllVars",
] as const;

// In handlers/handler-executor.ts - pass in execution
return compiledFunction(
  // ... existing parameters
  globalFunctions.ClearAllVars
);
```

### Debugging Runtime Issues

Enable debug mode in `runtime-context.ts`:

```typescript
const DEBUG = true; // Set to true for verbose logging
```

This logs:
- Property access and mutations
- Proxy set/get operations
- Component hierarchy registration
- Handler execution context

### Testing Handlers

```typescript
import { executeHandler } from '@features/runtime';

// Mock component
const mockComponent = {
  uuid: 'test-comp',
  application_id: 'test-app',
  component_type: 'Button',
  input: {},
  style: {},
  event: {}
};

// Test handler execution
const result = executeHandler(
  mockComponent,
  "return GetVar('test') || 'default'",
  {},
  {}
);

console.log(result); // 'default'
```

### Performance Optimization

**Handler Caching**
- Compiled functions are automatically cached by code string
- Cache persists for application lifetime
- Clear cache with `clearHandlerCache()` if needed

**Proxy Caching**
- Style proxies cached in `WeakMap` to avoid recreation
- Values proxies cached per component
- Automatic garbage collection when components unmount

**Component Registration**
- Registration happens on store updates (debounced)
- Hierarchy built once per registration cycle
- Parent-child relationships cached

## Performance Considerations

### Best Practices

✅ **DO:**
- Use handlers for dynamic values only
- Keep handler code concise
- Cache computed values in variables
- Use context variables for app-specific state
- Batch style updates when possible

❌ **DON'T:**
- Use handlers for static values
- Create infinite loops (e.g., handler that triggers itself)
- Store large objects in variables
- Perform heavy computations in frequently-called handlers
- Mutate component properties directly without update functions

### Memory Management

- **Proxy Caching**: Uses WeakMap for automatic garbage collection
- **Event Listeners**: Automatically cleaned up on component unmount
- **Function Cache**: Cleared when necessary with `clearHandlerCache()`
- **Component Values**: Stored in centralized `$runtimeValues` store

### Performance Metrics

Monitor these in production:
- Handler execution time (should be < 10ms for most handlers)
- Cache hit rate (should be > 90%)
- Component registration time (should be < 100ms)
- Memory usage (should be stable, no leaks)

## Contributing

When contributing to the runtime system:

1. **Maintain backward compatibility** - existing handlers must continue to work
2. **Add comprehensive tests** - test new API functions thoroughly
3. **Update documentation** - keep README and JSDoc comments current
4. **Follow naming conventions** - PascalCase for functions in handler context
5. **Optimize for performance** - use caching, avoid unnecessary work

## License

This module is part of the Nuraly project. See the root LICENSE file for details.

---

**Questions?** Check the main project documentation or open an issue on GitHub.
