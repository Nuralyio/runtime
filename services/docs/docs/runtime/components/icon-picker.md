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
      Vars.selectedIcon = EventData.value;
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

## Inputs

### value
**Type:** `string`

Currently selected icon name.

```typescript
input: {
  value: { type: "string", value: "settings" }
}
```

### placeholder
**Type:** `string`

Placeholder text when no icon is selected.

```typescript
input: {
  placeholder: { type: "string", value: "Choose an icon" }
}
```

### showSearch
**Type:** `boolean`

Enable search functionality in the picker.

```typescript
input: {
  showSearch: { type: "boolean", value: true }
}
```

### showClear
**Type:** `boolean`

Show clear button to remove selection.

```typescript
input: {
  showClear: { type: "boolean", value: true }
}
```

### maxVisible
**Type:** `number`

Maximum number of icons to display.

```typescript
input: {
  maxVisible: { type: "number", value: 100 }
}
```

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

**Example:**
```typescript
event: {
  onChange: `
    Vars.menuIcon = EventData.value;
    Vars.iconDetails = EventData.icon;
  `
}
```

### onOpen
**Triggered:** When picker opens

```typescript
event: {
  onOpen: `
    Vars.pickerOpen = true;
  `
}
```

### onClose
**Triggered:** When picker closes

```typescript
event: {
  onClose: `
    Vars.pickerOpen = false;
  `
}
```

### onSearch
**Triggered:** When searching icons

**EventData:**
```typescript
{
  query: string  // Search query
}
```

**Example:**
```typescript
event: {
  onSearch: `
    Vars.searchQuery = EventData.query;
  `
}
```

### onClear
**Triggered:** When selection is cleared

```typescript
event: {
  onClear: `
    Vars.menuIcon = null;
  `
}
```

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
    value: `return Vars.currentMenuItem?.icon || '';`
  },
  event: {
    onChange: `
      Vars.currentMenuItem = {
        ...Vars.currentMenuItem,
        icon: EventData.value
      };
    `
  }
}
```

### Category Icon Assignment
```typescript
{
  component_type: "icon-picker",
  input: {
    showSearch: { type: "boolean", value: true }
  },
  event: {
    onChange: `
      const categoryId = Vars.selectedCategory;
      await UpdateCategory(categoryId, { icon: EventData.value });

      // Update local state
      Vars.categories = Vars.categories.map(c =>
        c.id === categoryId ? { ...c, icon: EventData.value } : c
      );
    `
  }
}
```

---

## See Also

- [Button Component](./button.md) - Button with icons
- [Select Component](./select.md) - Dropdown selection
