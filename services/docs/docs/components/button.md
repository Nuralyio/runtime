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
      $formSubmitted = true;
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

## Events

### onClick
**Triggered:** When button is clicked

```typescript
event: {
  onClick: `
    $buttonClicked = true;
    await PerformAction();
  `
}
```

### onButtonClicked
**Triggered:** Alternative click event

### onLinkNavigation
**Triggered:** When link button navigates

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
    loading: `return $isSubmitting;`,
    disabled: `return !$formValid;`
  },
  event: {
    onClick: `
      $isSubmitting = true;
      try {
        await SubmitForm($formData);
        $submitSuccess = true;
      } catch (error) {
        $submitError = error.message;
      } finally {
        $isSubmitting = false;
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
  event: { onClick: `await SaveChanges();` }
}

// Cancel button
{
  component_type: "button",
  input: {
    label: { type: "string", value: "Cancel" },
    type: { type: "string", value: "default" }
  },
  event: { onClick: `$editMode = false;` }
}

// Delete button
{
  component_type: "button",
  input: {
    label: { type: "string", value: "Delete" },
    type: { type: "string", value: "danger" },
    icon: { type: "string", value: "trash" }
  },
  event: { onClick: `$showDeleteConfirm = true;` }
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

---

## See Also

- [IconButton Component](./icon-button.md) - Icon-only button
- [Dropdown Component](./dropdown.md) - Action menu
- [Form Component](./form.md) - Form container
