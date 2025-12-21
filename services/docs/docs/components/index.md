---
sidebar_position: 1
title: Components
description: Complete reference for all Nuraly components
---

# Components Reference

Welcome to the Nuraly Components Reference. Here you'll find comprehensive documentation for all available components, including their input handlers, events, and usage patterns.

## What are Components?

Components are the building blocks of Nuraly applications. Each component is a reusable UI element with:

- **Input Handlers** - Dynamic properties that can be evaluated at runtime
- **Events** - User interactions that trigger handler code
- **Styles** - Visual styling with dynamic style handlers
- **Instance Values** - Component-scoped state management

## Component Types

### Input Components

Components designed for user input:

- **[TextInput](./text-input.md)** - Text field for capturing user text
- Button - Clickable button for triggering actions
- Select - Dropdown selection component
- Checkbox - Boolean toggle component
- DatePicker - Date selection component
- Slider - Range slider component
- Textarea - Multi-line text input
- ColorPicker - Color selection component
- And more...

### Display Components

Components for displaying information:

- TextLabel - Text display component
- Icon - Icon display component
- Badge - Small badge with count/text
- Image - Image display component
- Video - Video player component
- And more...

### Layout Components

Components for organizing content:

- Container - Vertical layout container
- Card - Card layout component
- And more...

### Navigation Components

Components for navigation:

- Link - Hyperlink component
- Menu - Navigation menu
- And more...

### Advanced Components

Special-purpose components:

- MicroApp - Embed isolated microapp
- Table - Data table component
- Collection - Repeating collection component
- And more...

## Core Concepts

### Input Handlers vs Static Input

Every component property can be either static or dynamic:

**Static Input:**
```typescript
input: {
  value: { type: "string", value: "Hello" }
}
```

**Dynamic Input (Handler):**
```typescript
input: {
  value: {
    type: "handler",
    value: `return $username || 'Guest';`
  }
}
```

Handlers are evaluated in real-time based on runtime variables and context, allowing components to be fully dynamic and responsive.

### Event System

Events allow components to respond to user interactions:

```typescript
event: {
  onChange: `
    $username = EventData.value;
    $formDirty = true;
  `
}
```

Each event provides `EventData` containing relevant information about the interaction. Handlers can access global variables, current component context, and trigger other operations.

### Style Handlers

Components can have dynamic styles through `styleHandlers`:

```typescript
styleHandlers: {
  width: `return Vars.isCompact ? '200px' : '100%';`,
  backgroundColor: `return Vars.isDarkMode ? '#333' : '#fff';`
}
```

### Instance Values

Components maintain instance-specific state through `Current.Instance`:

```typescript
// In event handler
Current.Instance.clickCount = (Current.Instance.clickCount || 0) + 1;

// Persists with the component throughout its lifecycle
```

## Microapp Integration

All components work seamlessly in microapps with variable scoping:

```typescript
// Local scope (isolated to microapp instance)
$username = 'John'

// Global scope (shared across all instances)
$global.theme = 'dark'
```

See [Variable Scopes](../architecture/micro-apps/variable-scopes.md) for detailed information.

## Quick Start Example

Here's a simple form example using TextInput:

```typescript
{
  uuid: "login-form",
  name: "LoginForm",
  component_type: ComponentType.Container,
  childrenIds: ["email-input", "password-input", "submit-button"],
  
  // Child: Email Input
  {
    uuid: "email-input",
    name: "EmailInput",
    component_type: ComponentType.TextInput,
    input: {
      type: { type: "string", value: "email" },
      placeholder: { type: "string", value: "Enter email" },
      required: { type: "boolean", value: true }
    },
    event: {
      onChange: `
        $email = EventData.value;
        $formValid = ValidateForm();
      `
    }
  },
  
  // Child: Password Input
  {
    uuid: "password-input",
    name: "PasswordInput",
    component_type: ComponentType.TextInput,
    input: {
      type: { type: "string", value: "password" },
      placeholder: { type: "string", value: "Enter password" },
      required: { type: "boolean", value: true }
    },
    event: {
      onChange: `
        $password = EventData.value;
        $formValid = ValidateForm();
      `
    }
  },
  
  // Child: Submit Button
  {
    uuid: "submit-button",
    name: "SubmitButton",
    component_type: ComponentType.Button,
    input: {
      label: { type: "string", value: "Login" },
      disabled: {
        type: "handler",
        value: `return !$formValid || $isLoading;`
      }
    },
    event: {
      onClick: `
        $isLoading = true;
        const result = await Login($email, $password);
        $isLoading = false;
        $loginSuccess = result.success;
      `
    }
  }
}
```

## Documentation Structure

Each component has dedicated pages:

- **Component Overview** - Basic usage and examples
- **Input Handlers** - Complete reference for all dynamic properties
- **Events** - Complete reference for all interaction handlers

Example: [TextInput](./text-input.md), [TextInput Inputs](./text-input-inputs.md), [TextInput Events](./text-input-events.md)

## See Also

- [Core Concepts](./core-concepts.md)
- [RuntimeContext](../architecture/index.md)
- [Variable Scopes](../architecture/micro-apps/variable-scopes.md)
