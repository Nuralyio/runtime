---
sidebar_position: 27
title: IconPicker
description: An icon picker component for selecting icons from a searchable library
---

# IconPicker

The **IconPicker** component provides a searchable dropdown interface for selecting icons from an icon library.

## Overview

IconPicker provides a complete icon selection solution with:
- Searchable icon library
- Clear selection option
- Configurable placement
- Disabled and readonly states
- Icon preview

## Basic Usage

```typescript
{
  uuid: "my-icon-picker",
  name: "menu_icon",
  component_type: "icon-picker",
  input: {
    value: { type: "string", value: "home" },
    placeholder: { type: "string", value: "Select an icon" }
  },
  event: {
    onChange: `
      $selectedIcon = EventData.value;
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | string | `''` | Currently selected icon name |
| `placeholder` | string | `'Select icon'` | Placeholder text |
| `size` | string | `'small'` | Size: 'small', 'medium', 'large' |
| `placement` | string | `'auto'` | Dropdown placement |
| `trigger` | string | `'manual'` | Trigger mode |
| `disabled` | boolean | `false` | Disable the picker |
| `readonly` | boolean | `false` | Make read-only |
| `showSearch` | boolean | `true` | Show search input |
| `showClear` | boolean | `true` | Show clear button |
| `maxVisible` | number | `500` | Maximum visible icons |

---

## Events

### onChange
**Triggered:** When an icon is selected

**EventData:**
```typescript
{
  value: string  // Selected icon name
  icon: object   // Icon details
}
```

### onOpen / onClose
**Triggered:** When picker opens/closes

### onSearch
**Triggered:** When searching icons

**EventData:**
```typescript
{
  query: string  // Search query
}
```

### onClear
**Triggered:** When selection is cleared

---

## Common Patterns

### Menu Item Icon Selection
```typescript
{
  component_type: "icon-picker",
  input: {
    placeholder: { type: "string", value: "Select menu icon" }
  },
  inputHandlers: {
    value: `return $currentMenuItem?.icon || '';`
  },
  event: {
    onChange: `
      $currentMenuItem = {
        ...$currentMenuItem,
        icon: EventData.value
      };
    `
  }
}
```

---

## See Also

- [Button Component](./button.md) - Button with icons
- [Select Component](./select.md) - Dropdown selection
