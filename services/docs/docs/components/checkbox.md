---
sidebar_position: 22
title: Checkbox
description: A checkbox component for binary choices with indeterminate state support
---

# Checkbox

The **Checkbox** component provides a binary selection input for users to toggle options on or off. It supports checked, unchecked, and indeterminate states with customizable labels.

## Overview

Checkbox provides a complete selection solution with:
- Checked, unchecked, and indeterminate states
- Customizable label
- Multiple sizes
- Keyboard accessibility
- Focus and blur handling
- Mouse interaction events

## Basic Usage

```typescript
{
  uuid: "my-checkbox",
  name: "terms_checkbox",
  component_type: "checkbox",
  input: {
    value: { type: "boolean", value: false },
    label: { type: "string", value: "I agree to the terms and conditions" }
  },
  event: {
    onChange: `
      $termsAccepted = EventData.checked;
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | boolean \| "indeterminate" | `false` | Checked state: true, false, or "indeterminate" |
| `label` | string | `''` | Label text displayed next to checkbox |
| `disabled` | boolean | `false` | Disable checkbox interaction |
| `size` | string | `'medium'` | Checkbox size: 'small', 'medium', 'large' |
| `name` | string | `''` | Form field name |
| `autoFocus` | boolean | `false` | Auto-focus on mount |
| `id` | string | `''` | Element ID |
| `title` | string | `''` | Tooltip title |
| `tabIndex` | number | `0` | Tab index for keyboard navigation |

---

## Inputs

### value
**Type:** `boolean | "indeterminate"`

The checked state of the checkbox.

```typescript
input: {
  value: { type: "boolean", value: true }
}

// Indeterminate state (for parent checkboxes)
input: {
  value: { type: "string", value: "indeterminate" }
}
```

### label
**Type:** `string`

Label text displayed next to the checkbox.

```typescript
input: {
  label: { type: "string", value: "Enable notifications" }
}
```

### size
**Type:** `string`

Checkbox size: `small`, `medium`, `large`.

```typescript
input: {
  size: { type: "string", value: "large" }
}
```

---

## Events

### onChange
**Triggered:** When checkbox state changes

**EventData:**
```typescript
{
  checked: boolean  // New checked state
}
```

**Example:**
```typescript
event: {
  onChange: `
    $isChecked = EventData.checked;

    if (EventData.checked) {
      $selectedItems.push(Current.name);
    } else {
      $selectedItems = $selectedItems.filter(i => i !== Current.name);
    }
  `
}
```

### onFocus
**Triggered:** When checkbox receives focus

```typescript
event: {
  onFocus: `
    $activeField = "checkbox";
  `
}
```

### onBlur
**Triggered:** When checkbox loses focus

```typescript
event: {
  onBlur: `
    $activeField = null;
  `
}
```

### onKeydown
**Triggered:** When a key is pressed while focused

```typescript
event: {
  onKeydown: `
    if (EventData.event.key === 'Enter') {
      // Handle enter key
    }
  `
}
```

### onMouseEnter / onMouseLeave
**Triggered:** When mouse enters/leaves the checkbox area

```typescript
event: {
  onMouseEnter: `$isHovering = true;`,
  onMouseLeave: `$isHovering = false;`
}
```

---

## Common Patterns

### Select All / Indeterminate
```typescript
{
  component_type: "checkbox",
  input: {
    label: { type: "string", value: "Select All" }
  },
  inputHandlers: {
    value: `
      const selected = $selectedItems?.length || 0;
      const total = $allItems?.length || 0;

      if (selected === 0) return false;
      if (selected === total) return true;
      return "indeterminate";
    `
  },
  event: {
    onChange: `
      if (EventData.checked) {
        $selectedItems = [...$allItems];
      } else {
        $selectedItems = [];
      }
    `
  }
}
```

### Terms Agreement
```typescript
{
  component_type: "checkbox",
  input: {
    label: { type: "string", value: "I agree to the Terms of Service" },
    required: { type: "boolean", value: true }
  },
  event: {
    onChange: `
      $termsAccepted = EventData.checked;
      $canSubmit = EventData.checked && $formValid;
    `
  }
}
```

---

## See Also

- [RadioButton Component](./radio-button.md) - Single selection from options
- [Select Component](./select.md) - Dropdown selection
- [Form Component](./form.md) - Form container
