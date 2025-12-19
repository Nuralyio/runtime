---
sidebar_position: 31
title: Button
description: A versatile button component for triggering actions
---

# Button

The **Button** component is a versatile interactive element for triggering actions. It supports multiple types, sizes, icons, and states.

## Overview

Button provides a complete action trigger solution with:
- Multiple button types (primary, default, danger, text, link)
- Icon support (left, right, or both)
- Loading state
- Block layout
- Dashed border variant
- Link functionality

## Basic Usage

```typescript
{
  uuid: "my-button",
  name: "submit_button",
  component_type: "button",
  input: {
    label: { type: "string", value: "Submit" },
    type: { type: "string", value: "primary" }
  },
  event: {
    onClick: `
      Vars.formSubmitted = true;
      await SubmitForm();
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `label` | string | `'Button'` | Button text |
| `type` | string | `'default'` | Type: 'default', 'primary', 'danger', 'text', 'link' |
| `size` | string | `'medium'` | Size: 'small', 'medium', 'large' |
| `shape` | string | - | Shape: 'circle', 'round' |
| `state` | string | `'default'` | State: 'default', 'disabled' |
| `loading` | boolean | `false` | Show loading spinner |
| `block` | boolean | `false` | Full-width button |
| `dashed` | boolean | `false` | Dashed border style |
| `icon` | string | - | Icon name |
| `iconLeft` | string | - | Left icon |
| `iconRight` | string | - | Right icon |
| `iconPosition` | string | `'left'` | Icon position |
| `iconOnly` | boolean | `false` | Icon-only mode |
| `href` | string | - | Link URL |
| `target` | string | - | Link target (_blank, etc.) |
| `ripple` | boolean | `true` | Enable ripple effect |
| `ariaLabel` | string | - | Accessibility label |
| `htmlType` | string | - | HTML button type: 'button', 'submit', 'reset' |

---

## Inputs

### label
**Type:** `string`

Button text content.

```typescript
input: {
  label: { type: "string", value: "Click Me" }
}
```

### type
**Type:** `string`

Button type/variant: `default`, `primary`, `danger`, `text`, `link`.

```typescript
input: {
  type: { type: "string", value: "primary" }
}
```

### size
**Type:** `string`

Button size: `small`, `medium`, `large`.

```typescript
input: {
  size: { type: "string", value: "large" }
}
```

### shape
**Type:** `string`

Button shape: `circle`, `round`.

```typescript
input: {
  shape: { type: "string", value: "round" }
}
```

### loading
**Type:** `boolean`

Show loading spinner and disable button.

```typescript
input: {
  loading: { type: "boolean", value: true }
}

// Dynamic loading
inputHandlers: {
  loading: `return Vars.isSubmitting;`
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

### icon / iconLeft / iconRight
**Type:** `string`

Icon configuration.

```typescript
input: {
  icon: { type: "string", value: "plus" },
  iconPosition: { type: "string", value: "left" }
}

// Or separate icons
input: {
  iconLeft: { type: "string", value: "download" },
  iconRight: { type: "string", value: "arrow-right" }
}
```

### href / target
**Type:** `string`

Convert button to a link.

```typescript
input: {
  href: { type: "string", value: "https://example.com" },
  target: { type: "string", value: "_blank" }
}
```

### htmlType
**Type:** `string`

HTML button type for form integration.

```typescript
input: {
  htmlType: { type: "string", value: "submit" }
}
```

---

## Events

### onClick
**Triggered:** When button is clicked

**Example:**
```typescript
event: {
  onClick: `
    Vars.buttonClicked = true;
    await PerformAction();
  `
}
```

### onButtonClicked
**Triggered:** Alternative click event

```typescript
event: {
  onButtonClicked: `
    // Same as onClick
  `
}
```

### onLinkNavigation
**Triggered:** When link button navigates

```typescript
event: {
  onLinkNavigation: `
    // Track navigation
    Analytics.track('link_click', { url: Vars.href });
  `
}
```

---

## Common Patterns

### Form Submit Button
```typescript
{
  component_type: "button",
  input: {
    label: { type: "string", value: "Submit" },
    type: { type: "string", value: "primary" },
    htmlType: { type: "string", value: "submit" },
    block: { type: "boolean", value: true }
  },
  inputHandlers: {
    loading: `return Vars.isSubmitting;`,
    disabled: `return !Vars.formValid;`
  },
  event: {
    onClick: `
      Vars.isSubmitting = true;

      try {
        await SubmitForm(Vars.formData);
        Vars.submitSuccess = true;
      } catch (error) {
        Vars.submitError = error.message;
      } finally {
        Vars.isSubmitting = false;
      }
    `
  }
}
```

### Action Buttons Group
```typescript
// Save button
{
  component_type: "button",
  input: {
    label: { type: "string", value: "Save" },
    type: { type: "string", value: "primary" },
    icon: { type: "string", value: "save" }
  },
  event: {
    onClick: `await SaveChanges();`
  }
}

// Cancel button
{
  component_type: "button",
  input: {
    label: { type: "string", value: "Cancel" },
    type: { type: "string", value: "default" }
  },
  event: {
    onClick: `Vars.editMode = false;`
  }
}

// Delete button
{
  component_type: "button",
  input: {
    label: { type: "string", value: "Delete" },
    type: { type: "string", value: "danger" },
    icon: { type: "string", value: "trash" }
  },
  event: {
    onClick: `Vars.showDeleteConfirm = true;`
  }
}
```

### Icon Button with Tooltip
```typescript
{
  component_type: "button",
  input: {
    icon: { type: "string", value: "copy" },
    iconOnly: { type: "boolean", value: true },
    type: { type: "string", value: "text" },
    ariaLabel: { type: "string", value: "Copy to clipboard" }
  },
  event: {
    onClick: `
      await navigator.clipboard.writeText(Vars.textToCopy);
      Vars.copied = true;
      setTimeout(() => Vars.copied = false, 2000);
    `
  }
}
```

### Link Button
```typescript
{
  component_type: "button",
  input: {
    label: { type: "string", value: "View Documentation" },
    type: { type: "string", value: "link" },
    href: { type: "string", value: "https://docs.example.com" },
    target: { type: "string", value: "_blank" },
    iconRight: { type: "string", value: "external-link" }
  }
}
```

### Dynamic Button State
```typescript
{
  component_type: "button",
  inputHandlers: {
    label: `
      if (Vars.isFollowing) return 'Following';
      return 'Follow';
    `,
    type: `
      if (Vars.isFollowing) return 'default';
      return 'primary';
    `,
    icon: `
      if (Vars.isFollowing) return 'check';
      return 'plus';
    `
  },
  event: {
    onClick: `
      if (Vars.isFollowing) {
        await Unfollow(Vars.userId);
        Vars.isFollowing = false;
      } else {
        await Follow(Vars.userId);
        Vars.isFollowing = true;
      }
    `
  }
}
```

### Add New Button
```typescript
{
  component_type: "button",
  input: {
    label: { type: "string", value: "Add New" },
    type: { type: "string", value: "primary" },
    icon: { type: "string", value: "plus" },
    dashed: { type: "boolean", value: true },
    block: { type: "boolean", value: true }
  },
  event: {
    onClick: `
      Vars.showAddModal = true;
    `
  }
}
```

---

## See Also

- [IconButton Component](./icon-button.md) - Icon-only button
- [Dropdown Component](./dropdown.md) - Action menu
- [Form Component](./form.md) - Form container
