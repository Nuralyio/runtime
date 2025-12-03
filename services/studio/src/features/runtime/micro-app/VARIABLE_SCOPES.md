# Variable Scope System

The micro-app architecture implements a two-tier variable scope system that provides flexible state management across different levels of isolation and sharing.

## Overview

Variables in micro-apps can exist at two different scope levels:

| Scope | Storage Level | Sharing Behavior | Use Cases |
|-------|--------------|------------------|-----------|
| **LOCAL** | Per micro-app instance | Isolated - each instance has its own storage | Temporary UI state, form inputs, component-specific data |
| **GLOBAL** | Singleton across all apps | Shared across ALL instances regardless of app | Authentication status, theme, language settings |

## Scope Details

### 🔵 LOCAL Scope (Default)

**Storage:** Each micro-app instance has completely isolated variable storage.

**Syntax:**
```javascript
// Implicit - variables without prefix default to LOCAL
Vars.clickCount = 10

// Explicit
Vars['local.clickCount'] = 10
```

**Behavior:**
- Changes in Instance 1 do NOT affect Instance 2 or Instance 3
- Each instance maintains its own independent state
- Variables are cleared when the instance unmounts

**Example Use Cases:**
- Form field values
- Temporary loading states
- Component-specific UI flags
- Pagination state for a specific view

### 🟣 GLOBAL Scope

**Storage:** Singleton Map shared across ALL micro-apps in the `SharedVariableRegistry`.

**Syntax:**
```javascript
Vars['global.theme'] = 'dark'
Vars['global.universalCounter'] = 42
Vars['global.isAuthenticated'] = true
```

**Behavior:**
- Changes from ANY instance propagate to ALL instances
- Instance 1 sets → Instance 2 and Instance 3 automatically update
- Variables persist for the entire browser session
- Cross-application synchronization

**Example Use Cases:**
- User authentication state
- Application theme (dark/light mode)
- Language/locale settings
- Global notifications/alerts
- Feature flags

## Architecture

### Variable Resolution

When accessing a variable without a scope prefix (e.g., `Vars.myVar`), the system uses **scope resolution**:

```
1. Check LOCAL scope
   ↓ (if not found)
2. Check GLOBAL scope
   ↓ (if not found)
3. Return undefined
```

### Event System

Each scope emits different events when variables change:

**LOCAL scope change:**
```javascript
// Only emits to components within the same micro-app instance
eventDispatcher.emit(`${microAppId}:Vars:${varName}`, { value, oldValue })
```

**GLOBAL scope change:**
```javascript
// Emits a global event that ALL micro-app instances listen to
eventDispatcher.emit('global:variable:changed', { varName, value, oldValue })
```

### Reactivity

When a variable changes, the system:

1. **Updates the storage** (local Map or global Map)
2. **Emits change events** (scoped or global)
3. **Triggers component refreshes** via `component-input-refresh-request`
4. **Re-executes input handlers** that reference the variable
5. **Updates the UI** to reflect the new value

## Code Examples

### Example 1: Local Counter

```javascript
// Button onClick handler
Vars.clickCount = (Vars.clickCount || 0) + 1
console.log('Local clicks:', Vars.clickCount)

// Display label input handler
return Vars.clickCount ? `Clicked ${Vars.clickCount} times` : 'Not clicked'
```

**Result:** Each instance has its own isolated counter.

### Example 2: Global Theme

```javascript
// Settings page (any instance)
Vars['global.theme'] = 'dark'

// All components in ALL instances
const theme = Vars['global.theme'] || 'light'
return theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'
```

**Result:** Theme change propagates to all instances across all applications.

### Example 3: Publishing Local to Global

```javascript
// Start with local variable
Vars.userName = 'John Doe'

// Publish to global when needed
Runtime.publishToGlobal('userName')

// Now all instances can access it
console.log(Vars['global.userName']) // 'John Doe'
```

## Implementation Details

### VariableScopeManager

Each micro-app instance has a `VariableScopeManager` that manages:
- `localVars: Map<string, VariableDescriptor>` - Instance-specific
- `globalVars: Map<string, VariableDescriptor>` - Shared reference (singleton)

### SharedVariableRegistry (Singleton)

The registry maintains:
- `globalVars: Map<string, VariableDescriptor>` - One instance for entire app
- `activeMicroApps: Set<string>` - Tracking for cleanup

### Variable Descriptor

```typescript
interface VariableDescriptor {
  value: any                              // Current value
  scope: VariableScope                    // LOCAL | GLOBAL
  readonly?: boolean                      // Prevent modifications
  subscribers?: Set<(value: any) => void> // Change listeners
}
```

## Best Practices

### When to Use Each Scope

**Use LOCAL for:**
- ✅ Temporary UI state
- ✅ Form inputs before submission
- ✅ Component-specific flags
- ✅ Pagination/filtering for a single view

**Use GLOBAL for:**
- ✅ User authentication/session data
- ✅ Theme and appearance settings
- ✅ Language/locale preferences
- ✅ Cross-application notifications

### Performance Considerations

1. **GLOBAL variables trigger updates in ALL instances** - use sparingly for truly global state
2. **LOCAL variables are most performant** - isolated updates don't propagate
3. **Avoid storing large objects** - serialize/cache when needed

### Security Notes

The current implementation provides **scope isolation** but is **not a security boundary**:
- Micro-apps run in the same JavaScript context
- Code can access shared registries if determined
- For true security isolation, use iframes with sandbox attributes
- Validate and sanitize all data, especially from GLOBAL scope

## Testing

See `/src/pages/micro-app-scope-demo.astro` for a live demonstration of both scope levels.

## Related Files

- `src/features/micro-app/state/VariableScopeManager.ts` - Scope resolution logic
- `src/features/micro-app/state/SharedVariableRegistry.ts` - Global registry
- `src/features/micro-app/state/MicroAppRuntimeContext.ts` - VarsProxy implementation
- `src/features/micro-app/state/MicroAppStoreContext.ts` - Store integration
