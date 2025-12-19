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
    type: { type: "string", value: "danger" }
  },
  event: {
    click: `
      Vars.showDeleteConfirmation = true;
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

## Inputs

### value (type)
**Type:** `string`

Button type/variant: `default`, `primary`, `danger`, `text`, `link`.

```typescript
input: {
  value: { type: "string", value: "primary" }
}
```

### state
**Type:** `string`

Button state. Set to `disabled` to disable the button.

```typescript
input: {
  state: { type: "string", value: "disabled" }
}
```

### loading
**Type:** `boolean`

Show loading spinner.

```typescript
input: {
  loading: { type: "boolean", value: true }
}
```

### block
**Type:** `boolean`

Make button full-width.

```typescript
input: {
  block: { type: "boolean", value: true }
}
```

### dashed
**Type:** `boolean`

Apply dashed border style.

```typescript
input: {
  dashed: { type: "boolean", value: true }
}
```

---

## Events

### click
**Triggered:** When button is clicked

**Example:**
```typescript
event: {
  click: `
    Vars.actionTriggered = true;
    await PerformAction();
  `
}
```

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

## Common Patterns

### Toolbar Actions
```typescript
// Edit button
{
  component_type: "icon-button",
  parameters: { icon: "edit" },
  input: { value: { type: "string", value: "text" } },
  event: {
    click: `Vars.editMode = true;`
  }
}

// Delete button
{
  component_type: "icon-button",
  parameters: { icon: "trash" },
  input: { value: { type: "string", value: "danger" } },
  event: {
    click: `Vars.showDeleteModal = true;`
  }
}

// Copy button
{
  component_type: "icon-button",
  parameters: { icon: "copy" },
  event: {
    click: `
      await navigator.clipboard.writeText(Vars.textToCopy);
      Vars.copied = true;
      setTimeout(() => Vars.copied = false, 2000);
    `
  }
}
```

### Loading State
```typescript
{
  component_type: "icon-button",
  parameters: { icon: "refresh" },
  inputHandlers: {
    loading: `return Vars.isRefreshing;`
  },
  event: {
    click: `
      Vars.isRefreshing = true;
      await RefreshData();
      Vars.isRefreshing = false;
    `
  }
}
```

---

## See Also

- [Button Component](./button.md) - Full button with text
- [Dropdown Component](./dropdown.md) - Dropdown menu
