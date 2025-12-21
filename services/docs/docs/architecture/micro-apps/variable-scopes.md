---
sidebar_position: 1
title: Variable Scopes
description: Understanding the two-tier variable scope system in Nuraly micro-apps
---

# Variable Scope System

The Nuraly micro-app architecture implements a **two-tier variable scope system** that provides flexible state management across different levels of isolation and sharing.

## Overview

Variables in micro-apps can exist at two different scope levels:

| Scope | Storage Level | Sharing Behavior | Use Cases |
|-------|--------------|------------------|-----------|
| **LOCAL** | Per micro-app instance | Isolated - each instance has its own storage | Temporary UI state, form inputs, component-specific data |
| **GLOBAL** | Singleton across all apps | Shared across ALL instances regardless of app | Authentication status, theme, language settings |

---

## Architecture Overview

```mermaid
graph TB
    subgraph Browser["Browser Application"]
        subgraph Instance1["Micro-App Instance 1"]
            Store1["MicroAppStoreContext<br/>- Components Store<br/>- Pages Store<br/>- Runtime Values"]
            Runtime1["MicroAppRuntimeContext<br/>- VarsProxy<br/>- Component Registry"]
            Scope1["VariableScopeManager"]
            Local1[("Local Vars<br/>(Map)")]

            Store1 --> Scope1
            Runtime1 --> Scope1
            Scope1 --> Local1
        end

        subgraph Instance2["Micro-App Instance 2"]
            Store2["MicroAppStoreContext"]
            Runtime2["MicroAppRuntimeContext"]
            Scope2["VariableScopeManager"]
            Local2[("Local Vars<br/>(Map)")]

            Store2 --> Scope2
            Runtime2 --> Scope2
            Scope2 --> Local2
        end

        subgraph Instance3["Micro-App Instance 3"]
            Store3["MicroAppStoreContext"]
            Runtime3["MicroAppRuntimeContext"]
            Scope3["VariableScopeManager"]
            Local3[("Local Vars<br/>(Map)")]

            Store3 --> Scope3
            Runtime3 --> Scope3
            Scope3 --> Local3
        end

        Registry["SharedVariableRegistry<br/><<Singleton>>"]
        Global[("Global Vars<br/>(Shared Map)")]

        Registry --> Global

        Scope1 -.->|references| Global
        Scope2 -.->|references| Global
        Scope3 -.->|references| Global
    end

    classDef localScope fill:#F3E5F5,stroke:#9C27B0,stroke-width:2px
    classDef globalScope fill:#FFF3E0,stroke:#FF9800,stroke-width:2px
    classDef component fill:#E3F2FD,stroke:#2196F3,stroke-width:2px

    class Local1,Local2,Local3 localScope
    class Global,Registry globalScope
    class Store1,Store2,Store3,Runtime1,Runtime2,Runtime3,Scope1,Scope2,Scope3 component
```

:::info Key Points
- **LOCAL Scope**: Isolated per instance, cleared on unmount, default for all variables
- **GLOBAL Scope**: Shared across ALL instances, persists for session, triggers global events
- **Singleton Pattern**: One `SharedVariableRegistry` instance for entire application
:::

---

## Scope Resolution Flow

When you access a variable without an explicit scope prefix, the system automatically resolves it:

```mermaid
sequenceDiagram
    participant Handler as Handler Code
    participant Proxy as VarsProxy
    participant Manager as VariableScopeManager
    participant Local as Local Map
    participant Global as Global Map

    Handler->>Proxy: Vars.userName
    activate Proxy

    Proxy->>Manager: get("userName")
    activate Manager

    Manager->>Manager: parseVarName("userName")
    Note right of Manager: No scope prefix found

    Manager->>Local: has("userName")?
    activate Local
    Local-->>Manager: false
    deactivate Local

    Note over Manager: Not in LOCAL,<br/>check GLOBAL

    Manager->>Global: has("userName")?
    activate Global
    Global-->>Manager: true
    deactivate Global

    Manager->>Global: get("userName")
    activate Global
    Global-->>Manager: "John Doe"
    deactivate Global

    Manager-->>Proxy: "John Doe"
    deactivate Manager

    Proxy-->>Handler: "John Doe"
    deactivate Proxy
```

**Resolution Order**: `LOCAL` → `GLOBAL` → `undefined`

---

## Variable Access Patterns

### Setting LOCAL Variables

```javascript
// Implicit - defaults to LOCAL
$clickCount = 5
$tempData = { foo: 'bar' }

// Explicit
$local.formData = { name: '', email: '' }
```

### Setting GLOBAL Variables

```javascript
// Must use explicit prefix
$global.theme = 'dark'
$global.userName = 'John Doe'
$global.isAuthenticated = true
```

### Getting Variables

```javascript
// Auto-resolution (searches LOCAL → GLOBAL)
const userName = $userName

// Explicit scope access
const theme = $global.theme  // Only checks GLOBAL
const temp = $local.tempData  // Only checks LOCAL
```

---

## Complete Access Pattern Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Proxy as VarsProxy
    participant Manager as VariableScopeManager
    participant Local as Local Vars
    participant Global as Global Vars

    rect rgb(230, 240, 255)
        Note over Dev,Local: Setting LOCAL Variable (Implicit)
        Dev->>Proxy: Vars.clickCount = 5
        Proxy->>Manager: set("clickCount", 5, LOCAL)
        Manager->>Local: store("clickCount", 5)
        Local-->>Manager: stored
        Note right of Manager: Defaults to LOCAL scope
    end

    rect rgb(255, 240, 230)
        Note over Dev,Global: Setting GLOBAL Variable (Explicit)
        Dev->>Proxy: Vars['global.theme'] = 'dark'
        Proxy->>Manager: set("global.theme", "dark")
        Manager->>Manager: parseVarName()
        Note right of Manager: Detects "global." prefix
        Manager->>Global: store("theme", "dark")
        Global-->>Manager: stored
        Manager->>Manager: emit global event
        Note right of Manager: Notifies all instances
    end

    rect rgb(240, 255, 240)
        Note over Dev,Global: Getting Variable with Auto-Resolution
        Dev->>Proxy: value = Vars.someVar
        Proxy->>Manager: get("someVar")
        Manager->>Local: has("someVar")?
        Local-->>Manager: false
        Manager->>Global: has("someVar")?
        Global-->>Manager: true
        Manager->>Global: get("someVar")
        Global-->>Manager: value
        Manager-->>Proxy: value
        Proxy-->>Dev: value
    end
```

---

## Global Variable Event Propagation

When a GLOBAL variable changes, the event propagates to **all** micro-app instances:

```mermaid
sequenceDiagram
    participant Proxy1 as Instance 1<br/>VarsProxy
    participant Mgr1 as Instance 1<br/>ScopeManager
    participant Global as Global Vars<br/>(Shared Map)
    participant Events as Event Dispatcher
    participant Comp2 as Instance 2<br/>Components
    participant Comp3 as Instance 3<br/>Components

    rect rgb(255, 245, 230)
        Note over Proxy1: User clicks button in Instance 1
        Proxy1->>Mgr1: set("global.theme", "dark")
        Mgr1->>Global: store("theme", "dark")
        Global-->>Mgr1: stored
        Mgr1->>Events: emit('global:variable:changed')
        Note right of Events: Event data:<br/>{<br/>  varName: "global.theme",<br/>  value: "dark",<br/>  oldValue: "light"<br/>}
    end

    rect rgb(230, 245, 255)
        Note over Events,Comp3: Event Propagation
        Events->>Comp2: notify all listeners
        Comp2->>Comp2: refresh components
        Note right of Comp2: Re-execute input handlers
        Events->>Comp3: notify all listeners
        Comp3->>Comp3: refresh components
        Note right of Comp3: Re-execute input handlers
    end

    Note over Comp2,Comp3: All instances now display<br/>the new "dark" theme
```

---

## Variable Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Undefined

    Undefined --> Local : $myVar = value (no prefix)
    Undefined --> Global : $global.myVar = value

    Local --> Local : update value
    Local --> Global : publishToGlobal()
    Local --> Undefined : delete() or cleanup()

    Global --> Global : update value (propagates to all instances)
    Global --> Undefined : delete() or clearAll()

    note right of Local
        LOCAL Scope
        Isolated to instance
        Stored in local Map
        Cleared on unmount
    end note

    note right of Global
        GLOBAL Scope
        Shared across instances
        Stored in singleton Map
        Emits global events
        Persists until clearAll()
    end note
```

---

## Class Structure

```mermaid
classDiagram
    class SharedVariableRegistry {
        -static instance
        -globalVars: Map
        -activeMicroApps: Set
        +getInstance()$ SharedVariableRegistry
        +getGlobalVars() Map
        +createScopeManager(microAppId) VariableScopeManager
        +setGlobalVar(name, value) void
        +getGlobalVar(name) any
    }

    class VariableScopeManager {
        -localVars: Map
        -globalVars: Map
        -microAppId: string
        +get(varName) any
        +set(varName, value, scope?) void
        +has(varName) boolean
        +publishToGlobal(varName) void
        +cleanup() void
    }

    class MicroAppStoreContext {
        +microAppId: string
        +appUUID: string
        -variableScopeManager
        +getVariableScopeManager()
        +getComponents()
        +cleanup()
    }

    class MicroAppRuntimeContext {
        -storeContext
        +Vars: Record
        +VarsProxy: Proxy
        +getVar(name)
        +setVar(name, value, scope?)
        +publishToGlobal(varName)
    }

    SharedVariableRegistry "1" *-- "1" globalVars
    SharedVariableRegistry "1" ..> "*" VariableScopeManager : creates

    VariableScopeManager "1" *-- "1" localVars
    VariableScopeManager "1" ..> "1" globalVars : references

    MicroAppStoreContext "1" *-- "1" VariableScopeManager
    MicroAppRuntimeContext "1" --> "1" MicroAppStoreContext
```

---

## Runtime Deployment

This diagram shows how the system works in practice with real applications:

```mermaid
graph TB
    subgraph Browser["Browser Runtime"]
        subgraph MA1["Micro-App 1: Shopping Cart"]
            L1["Local Variables:<br/>- cartItems<br/>- selectedQty"]
            VP1["VarsProxy"]
            SM1["ScopeManager"]
            VP1 --> SM1
            SM1 --> L1
        end

        subgraph MA2["Micro-App 2: Product Catalog"]
            L2["Local Variables:<br/>- selectedProduct<br/>- filters"]
            VP2["VarsProxy"]
            SM2["ScopeManager"]
            VP2 --> SM2
            SM2 --> L2
        end

        subgraph MA3["Micro-App 3: User Profile"]
            L3["Local Variables:<br/>- editMode<br/>- formData"]
            VP3["VarsProxy"]
            SM3["ScopeManager"]
            VP3 --> SM3
            SM3 --> L3
        end

        GlobalStore[("Shared Global Store<br/><br/>- userName: 'John Doe'<br/>- theme: 'dark'<br/>- isAuthenticated: true<br/>- language: 'en'")]

        EventBus{{Event Bus}}

        SM1 -.->|read/write| GlobalStore
        SM2 -.->|read/write| GlobalStore
        SM3 -.->|read/write| GlobalStore

        SM1 -->|emit events| EventBus
        SM2 -->|emit events| EventBus
        SM3 -->|emit events| EventBus

        EventBus -.->|notify| MA1
        EventBus -.->|notify| MA2
        EventBus -.->|notify| MA3
    end

    classDef localStyle fill:#E3F2FD,stroke:#2196F3
    classDef globalStyle fill:#FFF3E0,stroke:#FF9800,stroke-width:3px
    classDef eventStyle fill:#F3E5F5,stroke:#9C27B0

    class L1,L2,L3 localStyle
    class GlobalStore globalStyle
    class EventBus eventStyle
```

---

## API Reference

### Publishing to Global Scope

You can promote a LOCAL variable to GLOBAL scope:

```javascript
// Start with local variable
$selectedProduct = { id: 123, name: 'Widget' }

// Publish to global scope
Runtime.publishToGlobal('selectedProduct')

// Now accessible globally
console.log($global.selectedProduct)
```

### Subscribing to Variable Changes

```javascript
// Subscribe to variable changes
const unsubscribe = Runtime.subscribeToVar('global.theme', (newTheme) => {
  console.log('Theme changed to:', newTheme)
  updateUITheme(newTheme)
})

// Cleanup when done
unsubscribe()
```

---

## Best Practices

:::tip Guidelines

1. **Use LOCAL by default** - Keep variables private unless needed elsewhere
2. **Use GLOBAL sparingly** - Only for truly global state (auth, theme, etc.)
3. **Explicit prefixes** - Use `$global.` prefix for clarity when setting globals
4. **Subscribe carefully** - Always unsubscribe to prevent memory leaks
5. **Avoid large objects** - GLOBAL variable changes trigger updates in ALL instances
6. ⚠️ **Not a security boundary** - All micro-apps run in same JavaScript context

:::

---

## Performance Considerations

- **GLOBAL variables trigger updates in ALL instances** - use judiciously
- **LOCAL variables are most performant** - updates don't propagate
- **Smart Caching** - Proxies cached using WeakMap for automatic garbage collection
- **Efficient Events** - Only affected components refresh on variable changes

---

## Common Patterns

### Pattern 1: Component-Specific State

```javascript
// Good - Uses LOCAL scope by default
$isLoading = true
$errorMessage = null
$formData = { name: '', email: '' }
```

### Pattern 2: Application-Wide State

```javascript
// Good - Explicit GLOBAL for shared state
$global.theme = 'dark'
$global.userName = currentUser.name
$global.isAuthenticated = true
```

### Pattern 3: Conditional Publishing

```javascript
// Start local, publish when needed
$draftArticle = { title: '', content: '' }

// User clicks "Share with team"
Runtime.publishToGlobal('draftArticle')
```

---

## Next Steps

- Learn about [Micro-App Architecture](./)
- Explore Component Communication (coming soon)
- See Handler Execution (coming soon)

---

## Related Resources

- [Variable Scope Manager Source](https://github.com/Nuralyio/stack/blob/main/services/studio/src/features/micro-app/state/VariableScopeManager.ts)
- [Shared Variable Registry Source](https://github.com/Nuralyio/stack/blob/main/services/studio/src/features/micro-app/state/SharedVariableRegistry.ts)
- [Runtime Context Source](https://github.com/Nuralyio/stack/blob/main/services/studio/src/features/micro-app/state/MicroAppRuntimeContext.ts)
