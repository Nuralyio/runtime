---
sidebar_position: 21
title: Textarea
description: A multi-line text input component for capturing larger text content with auto-resize and character counting
---

# Textarea

The **Textarea** component is a multi-line text input field designed for capturing larger amounts of text from users. It supports auto-resize, character counting, validation, and rich event handling.

## Overview

Textarea provides a complete multi-line input solution with:
- Auto-resize capability
- Character counting with maxLength
- Resizable dimensions (vertical, horizontal, both, none)
- Built-in validation
- Clear functionality
- Placeholder and helper text
- Disabled and readonly states
- Comprehensive event system

## Basic Usage

```typescript
{
  uuid: "my-textarea",
  name: "description_input",
  component_type: "textarea",
  input: {
    value: { type: "string", value: "" },
    placeholder: { type: "string", value: "Enter description..." },
    label: { type: "string", value: "Description" },
    rows: { type: "number", value: 4 }
  },
  event: {
    onChange: `
      console.log('Textarea value:', EventData.value);
      console.log('Character count:', EventData.characterCount);
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | string | `''` | Current textarea value |
| `placeholder` | string | `''` | Placeholder text when empty |
| `label` | string | `''` | Label text displayed above textarea |
| `helperText` | string | `''` | Helper text displayed below textarea |
| `size` | string | `'medium'` | Textarea size: 'small', 'medium', 'large' |
| `variant` | string | `''` | Visual variant style |
| `state` | string | `'default'` | State: 'default', 'disabled', 'error', 'success' |
| `resize` | string | `'vertical'` | Resize behavior: 'vertical', 'horizontal', 'both', 'none' |
| `rows` | number | `4` | Number of visible text rows |
| `cols` | number | - | Number of visible text columns |
| `maxLength` | number | - | Maximum character length |
| `minHeight` | number | - | Minimum height in pixels |
| `maxHeight` | number | - | Maximum height in pixels |
| `disabled` | boolean | `false` | Disable textarea interaction |
| `readonly` | boolean | `false` | Make textarea read-only |
| `required` | boolean | `false` | Mark as required |
| `allowClear` | boolean | `false` | Show clear button |
| `showCount` | boolean | `false` | Display character count |
| `autoResize` | boolean | `false` | Auto-resize based on content |

---

## Inputs

### value
**Type:** `string`

The current value of the textarea.

```typescript
input: {
  value: { type: "string", value: "Initial text content" }
}
```

### placeholder
**Type:** `string`

Placeholder text displayed when textarea is empty.

```typescript
input: {
  placeholder: { type: "string", value: "Enter your message here..." }
}
```

### label
**Type:** `string`

Label text displayed above the textarea.

```typescript
input: {
  label: { type: "string", value: "Message" }
}
```

### helperText
**Type:** `string`

Helper text displayed below the textarea. Also accepts `helper` as an alias.

```typescript
input: {
  helperText: { type: "string", value: "Maximum 500 characters" }
}
```

### size
**Type:** `string`

Textarea size: `small`, `medium`, `large`.

```typescript
input: {
  size: { type: "string", value: "large" }
}
```

### resize
**Type:** `string`

Controls resize behavior. Options: `vertical`, `horizontal`, `both`, `none`.

```typescript
input: {
  resize: { type: "string", value: "both" }
}
```

### rows
**Type:** `number`

Number of visible text rows. Default is 4.

```typescript
input: {
  rows: { type: "number", value: 6 }
}
```

### maxLength
**Type:** `number`

Maximum character length. When set with `showCount`, displays a character counter.

```typescript
input: {
  maxLength: { type: "number", value: 500 },
  showCount: { type: "boolean", value: true }
}
```

### autoResize
**Type:** `boolean`

Automatically resize textarea height based on content.

```typescript
input: {
  autoResize: { type: "boolean", value: true },
  minHeight: { type: "number", value: 100 },
  maxHeight: { type: "number", value: 300 }
}
```

### Validation Handlers
**Type:** `boolean`

Control when validation occurs.

```typescript
input: {
  validateOnChange: { type: "boolean", value: true },
  validateOnBlur: { type: "boolean", value: true },
  hasFeedback: { type: "boolean", value: true }
}
```

### rules
**Type:** `array`

Validation rules.

```typescript
input: {
  rules: {
    type: "array",
    value: [
      { required: true, message: "Description is required" },
      { min: 10, message: "Minimum 10 characters" },
      { max: 500, message: "Maximum 500 characters" }
    ]
  }
}
```

---

## Events

### onChange
**Triggered:** When textarea value changes

**EventData:**
```typescript
{
  value: string           // New value
  characterCount: number  // Current character count
}
```

**Example:**
```typescript
event: {
  onChange: `
    $description = EventData.value;
    $charCount = EventData.characterCount;

    // Validate
    if (EventData.value.length < 10) {
      $descriptionError = "Please enter at least 10 characters";
    } else {
      $descriptionError = "";
    }
  `
}
```

### onFocus
**Triggered:** When textarea receives focus

```typescript
event: {
  onFocus: `
    $activeField = "description";
    $helpTextVisible = true;
  `
}
```

### onBlur
**Triggered:** When textarea loses focus

**EventData:**
```typescript
{
  value: string  // Final value
}
```

**Example:**
```typescript
event: {
  onBlur: `
    $activeField = null;

    // Perform final validation
    const isValid = EventData.value.length >= 10;
    $showValidation = true;
    $descriptionValid = isValid;
  `
}
```

### onClear
**Triggered:** When clear button is clicked (if `allowClear` is true)

```typescript
event: {
  onClear: `
    $description = "";
    $descriptionError = "";
    $showValidation = false;
  `
}
```

### onResize
**Triggered:** When textarea is manually resized by the user

**EventData:**
```typescript
{
  height: number  // New height in pixels
  width: number   // New width in pixels
}
```

**Example:**
```typescript
event: {
  onResize: `
    $textareaHeight = EventData.height;
    $textareaWidth = EventData.width;
  `
}
```

---

## Common Patterns

### Auto-Save Draft
```typescript
event: {
  onChange: `
    const content = EventData.value;
    $draftContent = content;
    $charCount = EventData.characterCount;

    // Save draft
    await SaveDraft({
      content: content,
      timestamp: Date.now()
    });

    $lastSaved = new Date().toLocaleTimeString();
  `
}
```

### Character Limit with Warning
```typescript
event: {
  onChange: `
    const maxChars = 500;
    const content = EventData.value;
    const remaining = maxChars - content.length;

    $charRemaining = remaining;
    $isNearLimit = remaining < 50;
    $isAtLimit = remaining <= 0;

    if (remaining < 0) {
      $warningMessage = "Character limit exceeded";
    } else if (remaining < 50) {
      $warningMessage = remaining + " characters remaining";
    } else {
      $warningMessage = "";
    }
  `
}
```

---

## See Also

- [TextInput Component](./text-input.md) - Single-line text input
- [Core Concepts](./core-concepts.md) - Fundamental concepts
