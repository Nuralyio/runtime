---
sidebar_position: 2
title: Core Concepts
description: Fundamental concepts for working with Nuraly components
---

# Core Concepts

This page explains the fundamental concepts you need to understand when working with Nuraly components.

## ComponentElement Interface

Every component in Nuraly is defined as a `ComponentElement` object with the following structure:

```typescript
interface ComponentElement {
  uuid: string                          // Unique identifier
  name: string                          // Component name
  component_type: ComponentType         // Type of component (TextInput, Button, etc.)
  
  // Dynamic properties
  input?: Record<string, any>           // Input handlers and static input
  inputHandlers?: Record<string, string> // Maps input name to handler code
  
  // Events
  event?: Record<string, string>        // Event handlers (onClick, onChange, etc.)
  
  // Styling
  style?: Record<string, string>        // Static styles
  styleHandlers?: Record<string, string> // Dynamic style handlers
  
  // Hierarchy
  childrenIds?: string[]                // IDs of child components
  children?: ComponentElement[]         // Resolved child components
  parent?: ComponentElement             // Parent component reference
  
  // Runtime
  uniqueUUID?: string                   // Unique runtime UUID
  Instance?: any                        // Component instance state (reactive proxy)
  application_id?: string               // Application owner
}
```

## Input Handlers vs Static Input

Components have two ways to define properties:

### Static Input

Fixed values that don't change at runtime:

```typescript
input: {
  placeholder: { type: "string", value: "Enter text" },
  required: { type: "boolean", value: true }
}
```

### Input Handlers

Dynamic values evaluated at runtime:

```typescript
inputHandlers: {
  value: `return $username || '';`,
  disabled: `return $isProcessing || $formSubmitted;`
}
```

**Evaluation Process:**
1. Component mounts in the UI
2. Input handlers are evaluated immediately
3. Results stored in `inputHandlersValue`
4. Component renders with these values
5. On dependency changes, handlers re-evaluate
6. Component updates automatically

### Priority

When both static input and inputHandlers exist for the same property, **inputHandlers take priority**:

```typescript
input: {
  value: { type: "string", value: "static" }
},
inputHandlers: {
  value: `return $dynamicValue || "static";` // ← This is used
}
```

## Events and EventData

Events trigger handler code in response to user interactions:

```typescript
event: {
  onChange: `
    console.log('Value changed to:', EventData.value);
    $lastValue = EventData.value;
  `,
  onFocus: `
    $isFocused = true;
  `,
  onBlur: `
    $isFocused = false;
  `
}
```

### EventData Structure

Each event provides `EventData` object containing event-specific information:

```typescript
// onChange event
EventData = {
  value: string      // New value
  oldValue: string   // Previous value
  event: Event       // Native browser event
}

// onClick event
EventData = {
  event: Event       // Native browser event
}
```

### Event Execution Context

Event handlers have access to:

```typescript
// Component context
Current.name                 // Component name
Current.uuid                 // Component UUID
Current.Instance             // Component runtime state
Current.Instance.myValue     // Custom property

// Variables
$myVar                   // Local variable (microapp instance)
$global.myVar         // Global variable (shared)

// Global functions
GetVar(key)                  // Get global variable
GetContextVar(path, appId)  // Get context variable

// Component methods
navigateTo(pageId)          // Navigate to page
UpdatePage(page, appId)     // Update page
```

## Style Handlers

Dynamic styling based on runtime conditions:

```typescript
styleHandlers: {
  width: `
    return $isCompact ? '200px' : '100%';
  `,
  backgroundColor: `
    if ($theme === 'dark') return '#333';
    if ($theme === 'light') return '#fff';
    return '#e0e0e0';
  `,
  color: `
    return $isError ? '#f44336' : '#000';
  `,
  display: `
    return $showField ? 'block' : 'none';
  `
}
```

**Evaluation:**
1. Style handlers are evaluated during component initialization
2. Results cached in `stylesHandlersValue`
3. CSS properties applied via `styleMap`
4. Re-evaluated when dependencies change
5. Supports all CSS properties (camelCase and kebab-case)

## Component Instance (Runtime Values)

Each component has a `Current.Instance` object for component-scoped state:

```typescript
// In event handler
Current.Instance.clickCount = (Current.Instance.clickCount || 0) + 1;
Current.Instance.isExpanded = !Current.Instance.isExpanded;
Current.Instance.selectedItems = [1, 2, 3];

// State persists with component throughout lifecycle
// Backed by the global $runtimeValues store
// Reactive - changes trigger component re-renders
```

Useful for:
- Tracking component-specific state
- Counters and toggles
- Selected items in lists
- Expanded/collapsed states

## Component Hierarchy

Components form a tree structure:

```typescript
// Parent component
{
  uuid: "container-1",
  name: "MainContainer",
  childrenIds: ["button-1", "button-2", "label-1"],
  children: [...]  // Resolved child components
}

// Accessing hierarchy
const container = ExecuteInstance.applications['app-id']['MainContainer'];

// Navigate children
container.children.forEach(child => {
  console.log(child.name);
});

// Access parent
const parent = container.parent;

// Navigate up the tree
let current = someComponent;
while (current.parent) {
  console.log(current.parent.name);
  current = current.parent;
}
```

## Handler Execution Context

All handlers (input, event, style) execute in a special context:

```typescript
// Available globals in handlers
ExecuteInstance          // Global runtime context
Vars                     // Variables object
Current                  // Current component
EventData                // Event data (events only)
GetVar                   // Function to get variables
GetContextVar            // Function to get context
Utils                    // Utility functions
```

## Microapp Isolation

In microapps, handlers run in an isolated context:

```typescript
// Local scope (isolated to microapp instance)
$localVar = value           // Isolated storage

// Global scope (shared across all instances)
$global.sharedVar = value // Shared storage

// Access to isolated stores
const app = ExecuteInstance.applications['app-id'];
const page = GetVar("currentPage");
```

**Scoped Event Emission:**
- Events trigger only within the microapp instance
- Global events use `global:variable:changed` pattern
- See [Variable Scopes](../architecture/micro-apps/variable-scopes.md) for details

## Error Handling

Errors in handlers are caught and logged:

```typescript
event: {
  onChange: `
    try {
      const parsed = JSON.parse(EventData.value);
      $parsedValue = parsed;
    } catch (error) {
      $parseError = error.message;
      console.error('Parse error:', error);
    }
  `
}
```

Errors display in:
- Browser console
- Editor console panel
- Component error state

## Performance Considerations

### Caching
- Input handlers are cached to avoid redundant evaluation
- Style handlers evaluated once per dependency change
- Event handlers compiled and reused

### Optimization Tips
1. Minimize computations in handlers
2. Use `$` variables for frequently accessed values
3. Avoid DOM manipulations in handlers
4. Cache expensive operations outside handlers
5. Use conditional logic to short-circuit evaluation

### Async Operations
Handlers support async/await:

```typescript
event: {
  onClick: `
    $loading = true;
    try {
      const result = await FetchData();
      $data = result;
    } finally {
      $loading = false;
    }
  `
}
```

## See Also

- [TextInput Component](./text-input.md) - Practical example
- [Variable Scopes](../architecture/micro-apps/variable-scopes.md) - Microapp isolation
- [RuntimeContext](../architecture/index.md) - Runtime execution engine
