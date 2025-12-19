---
sidebar_position: 30
title: Dropdown
description: A dropdown menu component for displaying contextual actions
---

# Dropdown

The **Dropdown** component provides a floating menu that appears on trigger interaction. It's ideal for contextual actions, navigation menus, and option lists.

## Overview

Dropdown provides a complete menu solution with:
- Multiple trigger modes (click, hover, focus)
- Configurable placement
- Animation support
- Nested/cascading menus
- Custom trigger content
- Auto-close behavior

## Basic Usage

```typescript
{
  uuid: "my-dropdown",
  name: "actions_dropdown",
  component_type: "dropdown",
  input: {
    label: { type: "string", value: "Actions" }
  },
  inputHandlers: {
    options: `
      return [
        { label: 'Edit', value: 'edit', icon: 'edit' },
        { label: 'Duplicate', value: 'duplicate', icon: 'copy' },
        { label: 'Delete', value: 'delete', icon: 'trash' }
      ];
    `
  },
  event: {
    onItemClick: `
      const action = EventData.value;
      if (action === 'edit') {
        Vars.editMode = true;
      } else if (action === 'delete') {
        Vars.showDeleteConfirm = true;
      }
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | array | `[]` | Array of menu items |
| `label` | string | `''` | Trigger label (if no children) |
| `placeholder` | string | `''` | Placeholder text |
| `show` | boolean | `false` | Programmatically control open state |
| `trigger` | string | `'click'` | Trigger mode: 'click', 'hover', 'focus', 'manual' |
| `placement` | string | `'bottom'` | Menu placement |
| `animation` | string | `'fade'` | Animation: 'none', 'fade', 'slide', 'scale' |
| `arrow` | boolean | `false` | Show arrow pointing to trigger |
| `autoClose` | boolean | `true` | Close on item click |
| `closeOnOutsideClick` | boolean | `true` | Close on outside click |
| `closeOnEscape` | boolean | `true` | Close on Escape key |
| `offset` | number | `4` | Distance from trigger |
| `maxHeight` | string | `'300px'` | Maximum dropdown height |
| `minWidth` | string | `'auto'` | Minimum dropdown width |
| `state` | string | `'default'` | State: 'default', 'disabled' |
| `size` | string | `'medium'` | Size: 'small', 'medium', 'large' |

---

## Events

### onItemClick
**Triggered:** When a menu item is clicked

**EventData:**
```typescript
{
  value: any            // Item value
  item: object          // Full item object
  additionalData: any   // Custom item data
}
```

### onOpen / onClose
**Triggered:** When dropdown opens/closes

---

## Custom Trigger Content

The dropdown supports custom trigger content via child components:

```typescript
{
  uuid: "custom-dropdown",
  component_type: "dropdown",
  childrenIds: ["trigger-button"],
  inputHandlers: {
    options: `
      return [
        { label: 'Profile', value: 'profile', icon: 'user' },
        { label: 'Settings', value: 'settings', icon: 'settings' },
        { type: 'divider' },
        { label: 'Logout', value: 'logout', icon: 'log-out' }
      ];
    `
  }
}
```

---

## Common Patterns

### Context Menu
```typescript
{
  component_type: "dropdown",
  input: {
    trigger: { type: "string", value: "click" },
    placement: { type: "string", value: "bottom-start" }
  },
  inputHandlers: {
    options: `
      return [
        { label: 'Cut', value: 'cut', icon: 'scissors' },
        { label: 'Copy', value: 'copy', icon: 'copy' },
        { label: 'Paste', value: 'paste', icon: 'clipboard' },
        { type: 'divider' },
        { label: 'Delete', value: 'delete', icon: 'trash', danger: true }
      ];
    `
  },
  event: {
    onItemClick: `
      const action = EventData.value;
      switch (action) {
        case 'cut': await CutSelection(); break;
        case 'copy': await CopySelection(); break;
        case 'paste': await PasteFromClipboard(); break;
        case 'delete': await DeleteSelection(); break;
      }
    `
  }
}
```

### User Menu
```typescript
{
  component_type: "dropdown",
  input: {
    trigger: { type: "string", value: "click" },
    placement: { type: "string", value: "bottom-end" }
  },
  inputHandlers: {
    options: `
      return [
        { label: Vars.currentUser?.name || 'User', value: 'header', disabled: true },
        { type: 'divider' },
        { label: 'Profile', value: 'profile', icon: 'user' },
        { label: 'Settings', value: 'settings', icon: 'settings' },
        { type: 'divider' },
        { label: 'Logout', value: 'logout', icon: 'log-out', danger: true }
      ];
    `
  },
  event: {
    onItemClick: `
      if (EventData.value === 'logout') {
        await Logout();
        navigateTo('login');
      } else {
        navigateTo(EventData.value);
      }
    `
  }
}
```

---

## See Also

- [Select Component](./select.md) - Selection dropdown
- [Button Component](./button.md) - Action buttons
