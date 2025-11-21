# Self-Contained Micro-App Architecture

## Overview

This module provides a complete self-contained architecture for micro-apps with isolated stores, runtime contexts, and component management. Each micro-app instance runs independently without interfering with global state or other micro-app instances.

## Key Features

✅ **Complete Isolation** - Each micro-app has its own stores and runtime context
✅ **Layered Variable Scope** - Local, App, and Global variable scopes
✅ **Message Bus** - Structured communication between micro-apps
✅ **Scoped Events** - Isolated event system per micro-app
✅ **Page Management** - Independent page navigation
✅ **Sandboxed Handlers** - Secure handler execution environment
✅ **Automatic Cleanup** - Proper resource disposal on unmount

## Architecture

```
┌─────────────────────────────────────────┐
│        Parent Application               │
│  ┌───────────────────────────────────┐  │
│  │ Global Stores & RuntimeContext    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─────────────────────────────────────┤
│  │ MicroApp Instance #1                │
│  │  ├─ MicroAppStoreContext            │
│  │  ├─ MicroAppRuntimeContext          │
│  │  ├─ MicroAppPageManager             │
│  │  ├─ MicroAppHandlerExecutor         │
│  │  └─ VariableScopeManager            │
│  └─────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┤
│  │ MicroApp Instance #2                │
│  │  [Same isolated structure]          │
│  └─────────────────────────────────────┘
└─────────────────────────────────────────┘
         │
         ├─ SharedVariableRegistry (singleton)
         │   ├─ Global Variables
         │   └─ App-Level Variables
         │
         └─ MicroAppMessageBus (singleton)
             └─ Cross-App Communication
```

## Core Components

### 1. MicroAppStoreContext

Manages isolated stores for each micro-app instance.

**Features:**
- Isolated `$components`, `$pages`, `$context` stores
- Runtime values and styles per component
- Automatic API loading of components/pages
- Store subscriptions management

**Usage:**
```typescript
import { MicroAppStoreContext } from '@features/micro-app'

const storeContext = new MicroAppStoreContext(microAppId, appUUID)
await storeContext.loadApplication()

const components = storeContext.getComponents()
const pages = storeContext.getPages()
```

### 2. MicroAppRuntimeContext

Provides isolated runtime execution environment.

**Features:**
- Component registry (by app ID and name)
- Reactive proxies (VarsProxy, PropertiesProxy)
- Component hierarchy management
- Instance properties with reactive updates
- Scoped event emissions

**Usage:**
```typescript
import { MicroAppRuntimeContext } from '@features/micro-app'

const runtimeContext = new MicroAppRuntimeContext(storeContext)
runtimeContext.registerComponents()

// Access components
const button = runtimeContext.getComponent('MyButton')

// Variables with auto-resolution (local → app → global)
runtimeContext.VarsProxy.myVar = 'value'
const value = runtimeContext.getVar('myVar')
```

### 3. VariableScopeManager

Implements 3-tier variable scope system.

**Scopes:**
- **LOCAL** - Isolated to single micro-app instance
- **APP** - Shared between micro-apps in same parent app
- **GLOBAL** - Shared across all apps and micro-apps

**Usage:**
```typescript
import { VariableScope } from '@features/micro-app'

// Set with explicit scope
Vars['local.tempData'] = { foo: 'bar' }
Vars['app.selectedFile'] = '/src/App.tsx'
Vars['global.userName'] = 'John Doe'

// Auto-resolution (searches local → app → global)
const userName = Vars.userName

// Publish local variable to higher scope
ExecuteInstance.publishToApp('tempData')
ExecuteInstance.publishToGlobal('userName')

// Subscribe to variable changes
const unsubscribe = runtimeContext.subscribeToVar('app.selectedFile', (value) => {
  console.log('Selected file changed:', value)
})
```

### 4. MicroAppMessageBus

Singleton message bus for cross-micro-app communication.

**Features:**
- Direct messaging to specific micro-app
- Broadcasting to all micro-apps
- Message type filtering
- Message history tracking

**Usage:**
```typescript
import { MicroAppMessageBus, MessageTypes } from '@features/micro-app'

const messageBus = MicroAppMessageBus.getInstance()

// Send message
messageBus.send({
  from: microAppId,
  to: targetMicroAppId, // Optional, broadcast if omitted
  type: MessageTypes.FILE_SELECTED,
  payload: { path: '/src/App.tsx' }
})

// Subscribe to messages
const unsubscribe = messageBus.subscribe(microAppId, (message) => {
  if (message.type === MessageTypes.FILE_SELECTED) {
    console.log('File selected:', message.payload.path)
  }
})

// Subscribe to specific message type
const unsub = messageBus.subscribeToType(microAppId, MessageTypes.FILE_SELECTED, (message) => {
  // Handle file selection
})
```

### 5. MicroAppPageManager

Manages pages and navigation within a micro-app.

**Features:**
- Page loading and caching
- Navigation with history
- Page-scoped events
- Back/forward navigation

**Usage:**
```typescript
import { MicroAppPageManager } from '@features/micro-app'

const pageManager = new MicroAppPageManager(storeContext)
await pageManager.loadPages()

// Navigate
pageManager.navigateTo(pageId)
pageManager.navigateToByName('HomePage')

// Navigation controls
pageManager.goBack()
pageManager.goToNextPage()
pageManager.goToPreviousPage()

// Get current page
const currentPage = pageManager.getCurrentPage()
const allPages = pageManager.getAllPages()
```

### 6. MicroAppHandlerExecutor

Sandboxed execution environment for handlers.

**Features:**
- Isolated execution context
- Prevents access to global stores
- Security validation
- Scoped globals (ExecuteInstance, Vars, etc.)

**Usage:**
```typescript
import { MicroAppHandlerExecutor } from '@features/micro-app'

const executor = new MicroAppHandlerExecutor(runtimeContext)

// Execute handler code
const result = executor.executeHandler(
  'Current.Instance.count++',
  component,
  event
)

// Execute expression
const value = executor.executeExpression(
  'Vars.userName + " - " + Current.name',
  component
)

// Validate handler code
const validation = executor.validateHandlerCode(handlerCode)
if (validation.valid) {
  executor.executeHandler(handlerCode, component)
} else {
  console.error('Validation errors:', validation.errors)
}
```

## Using the MicroApp Component

The `<micro-app>` component has been updated to support isolated context mode.

### Basic Usage

```html
<!-- With isolated context (default) -->
<micro-app
  uuid="app-uuid-123"
  useIsolatedContext="true">
</micro-app>

<!-- Legacy mode (uses global stores) -->
<micro-app
  uuid="app-uuid-123"
  useIsolatedContext="false">
</micro-app>
```

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `uuid` | string | required | Application UUID to load |
| `page_uuid` | string | optional | Specific page to display |
| `componentToRenderUUID` | string | optional | Specific component to render |
| `mode` | ViewMode | Preview | Edit or Preview mode |
| `prod` | boolean | true | Production mode flag |
| `useIsolatedContext` | boolean | true | Use isolated context (new architecture) |
| `appComponents` | ComponentElement[] | optional | Pre-loaded components (avoids loading step) |
| `appPages` | PageElement[] | optional | Pre-loaded pages (avoids loading step) |

### Loading Priority

The micro-app supports three loading strategies (in priority order):

1. **Direct (Highest Priority)** - Use `appComponents` and `appPages` properties
2. **Cache** - Check global store for pre-loaded components (e.g., studio-entrypoint.ts)
3. **API (Fallback)** - Fetch from `/api/components/application/{uuid}` and `/api/pages/application/{uuid}`

### Usage with Pre-loaded Data

```typescript
// Load data first
const components = await fetchComponents(appUUID)
const pages = await fetchPages(appUUID)

// Pass directly to micro-app - no additional loading needed!
<micro-app
  uuid={appUUID}
  .appComponents={components}
  .appPages={pages}
  useIsolatedContext="true">
</micro-app>
```

**Benefits:**
- ✅ Zero loading time - data is immediately available
- ✅ Custom data - pass modified/filtered components
- ✅ Full control - manage loading state in parent component
- ✅ Efficient - no redundant API calls

### Accessing Micro-App Context

From within handler code in an isolated micro-app:

```javascript
// Access variables (with scope resolution)
Vars.myLocalVar = 'value'
const sharedVar = Vars['app.sharedData']
const globalVar = Vars['global.userName']

// Publish to higher scopes
ExecuteInstance.publishToApp('myLocalVar')
ExecuteInstance.publishToGlobal('myData')

// Access components
const button = ExecuteInstance.applications['app-id']['ButtonComponent']
button.Instance.clickCount++

// Navigate pages
navigateTo(pageId)
navigateToPage('HomePage')

// Send messages
sendMessage({
  type: 'DATA_UPDATED',
  payload: { data: newData }
})
```

## Variable Scope Examples

### Example 1: Local Scope (Default)

```javascript
// In Files micro-app
Vars.currentFile = '/src/App.tsx'  // Local scope
Vars.selectedFiles = [...]          // Local scope

// NOT accessible in Functions micro-app
```

### Example 2: App Scope (Shared)

```javascript
// In Files micro-app
Vars.currentFile = '/src/App.tsx'
ExecuteInstance.publishToApp('currentFile')

// In Functions micro-app - now accessible
const file = Vars['app.currentFile']  // or Vars.currentFile (auto-resolves)
console.log('Editing file:', file)
```

### Example 3: Global Scope

```javascript
// In any micro-app
Vars['global.userName'] = 'John Doe'
Vars['global.theme'] = 'dark'
Vars['global.isAuthenticated'] = true

// Accessible in ALL apps and micro-apps
const userName = Vars['global.userName']
// or
const userName = Vars.userName  // Auto-resolves to global
```

### Example 4: Explicit Scope Access

```javascript
// Explicitly access specific scopes
const localValue = Vars['local.tempData']
const appValue = Vars['app.selectedFile']
const globalValue = Vars['global.userName']

// Auto-resolution priority: local → app → global
const value = Vars.someVar
// Searches local first, then app, then global
```

## Message Bus Examples

### Example 1: File Selection Communication

```javascript
// In Files micro-app
messageBus.send({
  from: this.microAppId,
  type: MessageTypes.FILE_SELECTED,
  payload: {
    path: '/src/App.tsx',
    content: fileContent
  }
})

// In Functions micro-app
messageBus.subscribeToType(this.microAppId, MessageTypes.FILE_SELECTED, (message) => {
  loadFunctionsFromFile(message.payload.path)
})
```

### Example 2: Broadcast Updates

```javascript
// Broadcast to all micro-apps
messageBus.send({
  from: this.microAppId,
  type: MessageTypes.DATA_UPDATED,
  payload: { entityType: 'user', entityId: '123' }
})

// All micro-apps receive this
messageBus.subscribe(this.microAppId, (message) => {
  if (message.type === MessageTypes.DATA_UPDATED) {
    refreshData()
  }
})
```

### Example 3: Direct Messaging

```javascript
// Send to specific micro-app
messageBus.send({
  from: 'microapp-files-001',
  to: 'microapp-functions-002',
  type: 'REFRESH_FUNCTIONS',
  payload: { fileChanged: true }
})
```

## Best Practices

### 1. Variable Scope Guidelines

- **Use LOCAL by default** - Keep variables private unless needed elsewhere
- **Use APP scope** for cross-micro-app communication within same parent
- **Use GLOBAL scope** sparingly - Only for truly global state (auth, theme, etc.)
- **Explicit scope prefixes** - Use `app.` and `global.` prefixes for clarity

### 2. Message Bus Guidelines

- **Use predefined MessageTypes** - Ensures consistency
- **Include sender ID** - Always set `from` field
- **Structured payloads** - Use consistent payload structure
- **Unsubscribe on unmount** - Prevent memory leaks

### 3. Handler Security

- **Validate handler code** - Use `validateHandlerCode()` before execution
- **Avoid accessing global stores** - Use provided sandbox globals
- **Use scoped methods** - Use `ExecuteInstance`, `Vars`, etc. from sandbox

### 4. Component Lifecycle

- **Initialize in connectedCallback** - Set up contexts early
- **Cleanup in disconnectedCallback** - Always cleanup resources
- **Subscribe management** - Track and unsubscribe properly

## Migration Guide

### From Global Stores to Isolated Context

**Before (Global):**
```javascript
import { $components, $pages } from '@shared/redux/store'
import { ExecuteInstance } from '@features/runtime'

const components = $components.get()['app-id']
ExecuteInstance.VarsProxy.myVar = 'value'
```

**After (Isolated):**
```javascript
// Within micro-app context
const components = this.storeContext.getComponents()
this.runtimeContext.VarsProxy.myVar = 'value'

// Or in handler code (automatic)
Vars.myVar = 'value'  // Uses isolated context
```

### Enabling Isolated Context

Simply set the `useIsolatedContext` property to `true`:

```html
<micro-app uuid="app-123" useIsolatedContext="true"></micro-app>
```

The component will handle the rest automatically.

## Debugging

### Debug Information

```typescript
// Store context info
console.log(storeContext.getDebugInfo())

// Runtime context info
console.log(runtimeContext.getDebugInfo())

// Variable scope info
console.log(scopeManager.getDebugInfo())

// Message bus info
console.log(messageBus.getDebugInfo())

// Page manager info
console.log(pageManager.getDebugInfo())
```

### Shared Registry Info

```typescript
import { SharedVariableRegistry } from '@features/micro-app'

const registry = SharedVariableRegistry.getInstance()
console.log(registry.getDebugInfo())

// Export/import global vars (for persistence)
const globalVars = registry.exportGlobalVars()
localStorage.setItem('globalVars', JSON.stringify(globalVars))

// Later...
const saved = JSON.parse(localStorage.getItem('globalVars'))
registry.importGlobalVars(saved)
```

## Performance Considerations

- **Lazy Loading** - Components and pages loaded on demand
- **Smart Caching** - Proxies cached to avoid recreation
- **Efficient Subscriptions** - Store updates trigger only affected micro-apps
- **Weak References** - Proxy caches use WeakMap for automatic garbage collection
- **Message History** - Limited to last 100 messages by default

## Security Features

- **Sandboxed Execution** - Handlers cannot access dangerous globals
- **Protected Variables** - Certain global variables are read-only
- **Code Validation** - Handler code validated before execution
- **Isolated Stores** - No cross-contamination between micro-apps

## Future Enhancements

- [ ] Persistent storage for app-level variables
- [ ] Micro-app lifecycle hooks (onMount, onUnmount, onUpdate)
- [ ] Enhanced debugging tools and DevTools integration
- [ ] Performance monitoring and metrics
- [ ] Lazy component loading within micro-apps
- [ ] Hot module replacement for micro-apps

## API Reference

See individual class documentation:
- [MicroAppStoreContext](./state/MicroAppStoreContext.ts)
- [MicroAppRuntimeContext](./state/MicroAppRuntimeContext.ts)
- [VariableScopeManager](./state/VariableScopeManager.ts)
- [SharedVariableRegistry](./state/SharedVariableRegistry.ts)
- [MicroAppMessageBus](./messaging/MicroAppMessageBus.ts)
- [MicroAppPageManager](./state/MicroAppPageManager.ts)
- [MicroAppHandlerExecutor](./execution/MicroAppHandlerExecutor.ts)

## Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.
