---
sidebar_position: 1
title: Micro-Apps
description: Understanding the micro-app architecture in Nuraly
---

# Micro-App Architecture

Nuraly's micro-app architecture provides a powerful, isolated runtime environment for building and running independent application components within a larger application.

## What are Micro-Apps?

Micro-apps are **self-contained, isolated applications** that can be embedded and run independently within a parent application. Each micro-app has:

- ✅ **Its own component tree** - Independent hierarchy of UI components
- ✅ **Isolated runtime context** - Sandboxed execution environment
- ✅ **Independent state management** - Local and global variable scopes
- ✅ **Event system** - Scoped event dispatching and handling
- ✅ **Page management** - Internal navigation and routing

## Key Features

### Complete Isolation

Each micro-app instance runs in complete isolation:

```javascript
// Instance 1 - Shopping Cart
Vars.cartItems = [...]  // Isolated to this instance

// Instance 2 - Product Catalog
Vars.cartItems = [...]  // Different variable, different instance
```

### Flexible State Sharing

Choose between isolated and shared state as needed:

```javascript
// LOCAL - Isolated to instance
Vars.tempData = { ... }

// GLOBAL - Shared across all instances
Vars['global.theme'] = 'dark'
```

### Sandboxed Execution

Handler code runs in a controlled environment with access to specific APIs:

```javascript
// Safe - Access to provided runtime APIs
Vars.count++
Current.Instance.data = newValue
navigateTo(pageId)

// Blocked - No access to global window or unsafe APIs
```

## Architecture Components

### 1. MicroAppStoreContext

Manages isolated data stores for each micro-app instance.

**Features:**
- Isolated component and page stores
- Runtime value management
- Automatic API data loading
- Store subscription handling

### 2. MicroAppRuntimeContext

Provides the runtime execution environment.

**Features:**
- Component registry
- Reactive variable proxies
- Event dispatching
- Scoped execution context

### 3. VariableScopeManager

Implements the two-tier variable scope system.

**Features:**
- LOCAL scope (per instance)
- GLOBAL scope (shared)
- Auto-resolution
- Change subscriptions

### 4. SharedVariableRegistry

Singleton managing global variables across all instances.

**Features:**
- Global variable storage
- Instance tracking
- Cross-instance synchronization
- Cleanup management

## Usage Example

```html
<!-- Basic micro-app usage -->
<micro-app
  uuid="shopping-cart-123"
  useIsolatedContext="true"
/>
```

```javascript
// Within the micro-app handler
Vars.cartTotal = calculateTotal()
Vars['global.userName'] = getCurrentUser()

// Navigate to checkout
navigateTo('checkout-page')

// Access components
Current.Instance.isLoading = false
```

## Documentation

<div className="row">
  <div className="col col--12">
    <div className="card">
      <div className="card__header">
        <h3>📊 Variable Scopes</h3>
      </div>
      <div className="card__body">
        <p>
          Deep dive into the two-tier variable scope system, understanding LOCAL and GLOBAL scopes,
          auto-resolution, event propagation, and best practices.
        </p>
      </div>
      <div className="card__footer">
        <a href="./variable-scopes" className="button button--primary button--block">
          Learn About Variable Scopes →
        </a>
      </div>
    </div>
  </div>
</div>

## Benefits

### 🎯 Isolation

Each instance maintains its own state without interfering with others, enabling independent development and testing.

### 🔄 Reusability

Micro-apps can be instantiated multiple times, each with independent state and behavior.

### 🔌 Composability

Combine multiple micro-apps to build complex applications from simple, focused components.

### ⚡ Performance

Efficient change detection and updates only affect relevant instances and components.

### 🛡️ Security

Sandboxed execution prevents access to unsafe APIs and isolates potential issues.

## Common Use Cases

### Multi-Instance Applications

Run the same micro-app multiple times with different data:

```html
<!-- Product list with filters -->
<micro-app uuid="product-list-1" />

<!-- Product list with different category -->
<micro-app uuid="product-list-2" />
```

### Shared State Scenarios

Multiple micro-apps sharing global state like user auth:

```javascript
// User Profile micro-app
Vars['global.currentUser'] = loggedInUser

// Shopping Cart micro-app (different instance)
const user = Vars['global.currentUser']  // Accesses same value
```

### Component Communication

Micro-apps communicating via global variables:

```javascript
// File Browser micro-app
Vars['global.selectedFile'] = '/src/App.tsx'

// Code Editor micro-app
const file = Vars['global.selectedFile']  // Auto-updates when changed
```

## Best Practices

:::tip Guidelines

1. ✅ **Use LOCAL for instance-specific state** - Keep temporary data isolated
2. ✅ **Use GLOBAL for truly shared state** - Auth, theme, user preferences
3. ✅ **Explicit scope prefixes** - `global.` makes sharing intentions clear
4. ✅ **Clean up subscriptions** - Prevent memory leaks
5. ⚠️ **Avoid large global objects** - Changes trigger updates in all instances

:::

## Performance Considerations

- **LOCAL variables are most efficient** - Updates stay isolated
- **GLOBAL changes trigger cross-instance updates** - Use sparingly
- **Smart caching** - Proxies use WeakMap for automatic cleanup
- **Event batching** - Multiple changes batched into single update

## Next Steps

- **Start with [Variable Scopes](./variable-scopes.md)** - Understand the core state management system
- Learn about messaging between micro-apps (coming soon)
- Explore handler execution and security (coming soon)

## Related Resources

- [Micro-App Source Code](https://github.com/Nuralyio/stack/tree/main/services/studio/src/features/micro-app)
- [Variable Scope Architecture](./variable-scopes.md)
- [Component System](#) (coming soon)
