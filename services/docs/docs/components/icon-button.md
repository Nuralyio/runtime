---
sidebar_position: 26
title: IconButton
description: A button component displaying only an icon without text
---

# IconButton

The **IconButton** component is a button that displays only an icon, useful for toolbar actions, navigation, and compact UI elements.

## Overview

IconButton provides a compact button solution with:
- Icon-only display
- Multiple button types
- Loading state
- Block and dashed variants
- Customizable icon position

## Basic Usage

```typescript
{
  uuid: "my-icon-button",
  name: "delete_button",
  component_type: "icon-button",
  parameters: {
    icon: "trash"
  },
  input: {
    value: { type: "string", value: "danger" }
  },
  event: {
    click: `
      $showDeleteConfirmation = true;
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | string | `'default'` | Button type |
| `state` | string | `'default'` | State: 'default', 'disabled' |
| `loading` | boolean | `false` | Show loading spinner |
| `block` | boolean | `false` | Full-width button |
| `dashed` | boolean | `false` | Dashed border style |
| `iconPosition` | string | `'left'` | Icon position |
| `size` | string | `'medium'` | Size: 'small', 'medium', 'large' |

---

## Parameters

### icon
Set via `parameters` object.

```typescript
parameters: {
  icon: "settings"
}
```

Common icon names: `trash`, `edit`, `copy`, `settings`, `plus`, `minus`, `close`, `check`, `search`, `download`, `upload`.

---

## Events

### click
**Triggered:** When button is clicked

```typescript
event: {
  click: `
    $actionTriggered = true;
    await PerformAction();
  `
}
```

---

## Common Patterns

### Toolbar Actions
```typescript
// Edit button
{
  component_type: "icon-button",
  parameters: { icon: "edit" },
  input: { value: { type: "string", value: "text" } },
  event: { click: `$editMode = true;` }
}

// Delete button
{
  component_type: "icon-button",
  parameters: { icon: "trash" },
  input: { value: { type: "string", value: "danger" } },
  event: { click: `$showDeleteModal = true;` }
}
```

---

## See Also

- [Button Component](./button.md) - Full button with text
- [Dropdown Component](./dropdown.md) - Dropdown menu
