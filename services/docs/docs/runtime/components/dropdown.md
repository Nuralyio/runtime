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
| `delay` | number | `50` | Hover delay (ms) |
| `maxHeight` | string | `'300px'` | Maximum dropdown height |
| `minWidth` | string | `'auto'` | Minimum dropdown width |
| `state` | string | `'default'` | State: 'default', 'disabled' |
| `size` | string | `'medium'` | Size: 'small', 'medium', 'large' |

---

## Inputs

### options
**Type:** `array`

Array of menu item objects.

```typescript
inputHandlers: {
  options: `
    return [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2', icon: 'star' },
      { label: 'Disabled', value: 'opt3', disabled: true },
      { type: 'divider' },
      { label: 'Danger', value: 'delete', danger: true }
    ];
  `
}
```

### trigger
**Type:** `string`

How the dropdown is triggered: `click`, `hover`, `focus`, `manual`.

```typescript
input: {
  trigger: { type: "string", value: "hover" }
}
```

### placement
**Type:** `string`

Menu placement relative to trigger: `bottom`, `top`, `bottom-start`, `bottom-end`, `top-start`, `top-end`, `auto`.

```typescript
input: {
  placement: { type: "string", value: "bottom-end" }
}
```

### animation
**Type:** `string`

Open/close animation: `none`, `fade`, `slide`, `scale`.

```typescript
input: {
  animation: { type: "string", value: "scale" }
}
```

### arrow
**Type:** `boolean`

Show arrow pointing to trigger element.

```typescript
input: {
  arrow: { type: "boolean", value: true }
}
```

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

**Example:**
```typescript
event: {
  onItemClick: `
    const { value, item } = EventData;

    switch (value) {
      case 'edit':
        Vars.editMode = true;
        break;
      case 'duplicate':
        await DuplicateItem(Vars.currentItemId);
        break;
      case 'delete':
        Vars.showDeleteConfirm = true;
        break;
    }
  `
}
```

### onOpen
**Triggered:** When dropdown opens

```typescript
event: {
  onOpen: `
    Vars.dropdownOpen = true;
  `
}
```

### onClose
**Triggered:** When dropdown closes

```typescript
event: {
  onClose: `
    Vars.dropdownOpen = false;
  `
}
```

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

// Child button as trigger
{
  uuid: "trigger-button",
  component_type: "button",
  input: {
    label: { type: "string", value: "User Menu" },
    icon: { type: "string", value: "user" }
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
        { label: 'Cut', value: 'cut', icon: 'scissors', shortcut: 'Ctrl+X' },
        { label: 'Copy', value: 'copy', icon: 'copy', shortcut: 'Ctrl+C' },
        { label: 'Paste', value: 'paste', icon: 'clipboard', shortcut: 'Ctrl+V' },
        { type: 'divider' },
        { label: 'Delete', value: 'delete', icon: 'trash', danger: true }
      ];
    `
  },
  event: {
    onItemClick: `
      const action = EventData.value;

      switch (action) {
        case 'cut':
          await CutSelection();
          break;
        case 'copy':
          await CopySelection();
          break;
        case 'paste':
          await PasteFromClipboard();
          break;
        case 'delete':
          await DeleteSelection();
          break;
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
      const user = Vars.currentUser;
      return [
        { label: user?.name || 'User', value: 'header', disabled: true },
        { type: 'divider' },
        { label: 'Profile', value: 'profile', icon: 'user' },
        { label: 'Settings', value: 'settings', icon: 'settings' },
        { label: 'Billing', value: 'billing', icon: 'credit-card' },
        { type: 'divider' },
        { label: 'Logout', value: 'logout', icon: 'log-out', danger: true }
      ];
    `
  },
  event: {
    onItemClick: `
      const action = EventData.value;

      if (action === 'logout') {
        await Logout();
        navigateTo('login');
      } else {
        navigateTo(action);
      }
    `
  }
}
```

### Action Menu for Table Row
```typescript
{
  component_type: "dropdown",
  input: {
    trigger: { type: "string", value: "click" }
  },
  inputHandlers: {
    options: `
      const item = Vars.currentRowItem;
      const options = [
        { label: 'View', value: 'view', icon: 'eye' },
        { label: 'Edit', value: 'edit', icon: 'edit' }
      ];

      if (item?.status === 'draft') {
        options.push({ label: 'Publish', value: 'publish', icon: 'globe' });
      }

      options.push({ type: 'divider' });
      options.push({ label: 'Delete', value: 'delete', icon: 'trash', danger: true });

      return options;
    `
  },
  event: {
    onItemClick: `
      const item = Vars.currentRowItem;
      const action = EventData.value;

      switch (action) {
        case 'view':
          navigateTo('item-detail', { id: item.id });
          break;
        case 'edit':
          Vars.editingItem = item;
          Vars.showEditModal = true;
          break;
        case 'publish':
          await PublishItem(item.id);
          break;
        case 'delete':
          Vars.itemToDelete = item;
          Vars.showDeleteConfirm = true;
          break;
      }
    `
  }
}
```

---

## See Also

- [Select Component](./select.md) - Selection dropdown
- [Button Component](./button.md) - Action buttons
- [IconButton Component](./icon-button.md) - Icon-only buttons
