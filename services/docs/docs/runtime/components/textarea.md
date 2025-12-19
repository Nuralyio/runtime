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

## Live Demo

Try the interactive Nuraly micro-app demo below.

<iframe width="100%" height="200" src="//jsfiddle.net/nuraly/cp4jxkwv/19/embedded/result/" frameborder="0" loading="lazy" allowtransparency="true" allowfullscreen="true"></iframe>


<details>
<summary><strong>View Source Code</strong></summary>

```javascript
// Sample application data
const appId = "demo-app-001";

// Sample page data
const appPages = [
  {
    uuid: "page-001",
    application_id: appId,
    name: "Home",
    url: "/home",
    description: "Demo home page",
    is_default: true,
    style: {
      backgroundColor: "#f5f5f5",
    },
  },
];

// Sample component data
const appComponents = [
  // Root Container
  {
    uuid: "comp-001",
    name: "Main Container",
    component_type: "vertical-container-block",
    application_id: appId,
    pageId: "page-001",
    root: true,
    childrenIds: ["comp-002", "comp-003"],
    style: {
      display: "flex",
      flexDirection: "column",
      maxWidth: "800px",
      backgroundColor: "white",
      borderRadius: "12px",
    },
    parameters: {},
    styleHandlers: {},
    inputHandlers: {},
    input: {},
  },
  // Textarea Component
  {
    uuid: "comp-002",
    name: "Description Input",
    component_type: "textarea",
    application_id: appId,
    pageId: "page-001",
    root: false,
    input: {
      placeholder: { type: "string", value: "Enter your description here..." },
      label: { type: "string", value: "Description" },
      rows: { type: "number", value: 4 },
      showCount: { type: "boolean", value: true },
      maxLength: { type: "number", value: 500 }
    },
    event: {
      onChange: `
        Vars.textareaValue = EventData.value;
        Vars.charCount = EventData.characterCount;
      `
    },
  },
  // Character Count Display
  {
    uuid: "comp-003",
    name: "Character Display",
    component_type: "text_label",
    application_id: appId,
    pageId: "page-001",
    input: {
      value: {
        type: "handler",
        value: `
          return "Characters: " + (Vars.charCount ?? 0) + "/500";
        `,
      },
    },
  },
];
```

</details>

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

Use static `input` values for configuration and control runtime-driven behavior via events and styles using `Vars`.

### value
**Type:** `string`

The current value of the textarea.

**Static Example:**
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

### variant
**Type:** `string`

Visual variant style for the textarea.

```typescript
input: {
  variant: { type: "string", value: "outlined" }
}
```

### state
**Type:** `string`

Component state: `default`, `disabled`, `error`, `success`.

```typescript
input: {
  state: { type: "string", value: "error" }
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

### cols
**Type:** `number`

Number of visible text columns.

```typescript
input: {
  cols: { type: "number", value: 50 }
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

### minHeight / maxHeight
**Type:** `number`

Constraints on textarea height in pixels. Useful with `autoResize`.

```typescript
input: {
  autoResize: { type: "boolean", value: true },
  minHeight: { type: "number", value: 100 },
  maxHeight: { type: "number", value: 400 }
}
```

### disabled
**Type:** `boolean`

Whether textarea is disabled.

```typescript
input: {
  disabled: { type: "boolean", value: true }
}
```

To disable dynamically, use style or event logic with `Vars`.

### readonly
**Type:** `boolean`

Make textarea read-only (can select but not edit).

```typescript
input: {
  readonly: { type: "boolean", value: false }
}
```

### required
**Type:** `boolean`

Mark field as required for validation.

```typescript
input: {
  required: { type: "boolean", value: true }
}
```

### allowClear
**Type:** `boolean`

Show clear button to quickly empty the field.

```typescript
input: {
  allowClear: { type: "boolean", value: true }
}
```

### showCount
**Type:** `boolean`

Display character count. Most useful when combined with maxLength.

```typescript
input: {
  showCount: { type: "boolean", value: true },
  maxLength: { type: "number", value: 500 }
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

### name
**Type:** `string`

Form field name for form submission.

```typescript
input: {
  name: { type: "string", value: "description" }
}
```

### autocomplete
**Type:** `string`

HTML autocomplete attribute value.

```typescript
input: {
  autocomplete: { type: "string", value: "off" }
}
```

### Event/Style Execution Context

When events or style logic are evaluated, you have access to:

```typescript
// Access variables
Vars.description = "Some text"

// Access current component
Current.name       // Component name
Current.uuid       // Component ID

// Access microapp context (if in microapp)
// Local scope (default)
Vars.localVar = value

// Global scope (shared)
Vars['global.theme'] = 'dark'
```

### Microapp Runtime Isolation

In microapps, runtime evaluation is scoped:

- **Local variables** are isolated to the microapp instance
- **Global variables** are shared across all instances
- Events and styles have access to the microapp's isolated runtime only

---

## Events

Events in Textarea allow you to respond to user interactions. Each event receives `EventData` containing relevant information about the interaction.

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
    Vars.description = EventData.value;
    Vars.charCount = EventData.characterCount;

    // Validate
    if (EventData.value.length < 10) {
      Vars.descriptionError = "Please enter at least 10 characters";
    } else {
      Vars.descriptionError = "";
    }
  `
}
```

### onFocus
**Triggered:** When textarea receives focus

**EventData:**
```typescript
{
  event: Event  // Native event
}
```

**Example:**
```typescript
event: {
  onFocus: `
    Vars.activeField = "description";
    Vars.helpTextVisible = true;
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
    Vars.activeField = null;

    // Perform final validation
    const isValid = EventData.value.length >= 10;
    Vars.showValidation = true;
    Vars.descriptionValid = isValid;
  `
}
```

### onClear
**Triggered:** When clear button is clicked (if `allowClear` is true)

**EventData:**
```typescript
{
  event: Event  // Click event
}
```

**Example:**
```typescript
event: {
  onClear: `
    Vars.description = "";
    Vars.descriptionError = "";
    Vars.showValidation = false;
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
    Vars.textareaHeight = EventData.height;
    Vars.textareaWidth = EventData.width;

    // Save user preference
    Vars['global.preferredTextareaSize'] = {
      height: EventData.height,
      width: EventData.width
    };
  `
}
```

---

## Common Event Patterns

### Auto-Save Draft
```typescript
event: {
  onChange: `
    const content = EventData.value;
    Vars.draftContent = content;
    Vars.charCount = EventData.characterCount;

    // Auto-save after typing stops (debounced in practice)
    Vars.lastSaved = null;

    // Save draft
    await SaveDraft({
      content: content,
      timestamp: Date.now()
    });

    Vars.lastSaved = new Date().toLocaleTimeString();
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

    Vars.charRemaining = remaining;
    Vars.isNearLimit = remaining < 50;
    Vars.isAtLimit = remaining <= 0;

    if (remaining < 0) {
      Vars.warningMessage = "Character limit exceeded";
    } else if (remaining < 50) {
      Vars.warningMessage = remaining + " characters remaining";
    } else {
      Vars.warningMessage = "";
    }
  `
}
```

### Form Field Validation
```typescript
event: {
  onBlur: `
    const value = EventData.value.trim();

    if (!value) {
      Vars.descriptionError = "Description is required";
      Vars.descriptionValid = false;
    } else if (value.length < 20) {
      Vars.descriptionError = "Please provide more detail (min 20 characters)";
      Vars.descriptionValid = false;
    } else {
      Vars.descriptionError = "";
      Vars.descriptionValid = true;
    }

    // Update form validity
    Vars.formValid = Vars.nameValid && Vars.descriptionValid;
  `
}
```

### Markdown Preview
```typescript
event: {
  onChange: `
    const markdown = EventData.value;
    Vars.markdownSource = markdown;

    // Render preview (assuming a markdown renderer is available)
    Vars.previewContent = await RenderMarkdown(markdown);
  `
}
```

### EventData Structure Reference

All Textarea events provide EventData object:

```typescript
EventData = {
  value?: string           // New/current value
  characterCount?: number  // Character count (onChange only)
  height?: number          // New height (onResize only)
  width?: number           // New width (onResize only)
  event?: Event            // Native browser event
}
```

### Microapp Event Isolation

Events in microapps maintain isolation:

```typescript
// Local scope (microapp instance only)
Vars.description = EventData.value

// Global scope (shared across instances)
Vars['global.lastActivity'] = Date.now()

// Component-scoped state
Current.Instance.validationState = "pending"
```

When an event handler accesses `Vars`, it operates in the microapp's local scope by default. To access global variables, use the `global.` prefix.

### Async Event Handling

Event handlers support async operations:

```typescript
event: {
  onBlur: `
    const value = EventData.value;

    // Start validation
    Vars.validating = true;

    try {
      const result = await ValidateContent(value);
      Vars.contentScore = result.score;
      Vars.suggestions = result.suggestions;
    } catch (err) {
      Vars.validationError = "Validation failed";
    } finally {
      Vars.validating = false;
    }
  `
}
```

---

## Styling

Textarea supports dynamic styling through `styleHandlers`. Styles are organized in an object structure where regular CSS properties coexist with nested pseudo-state objects for `:hover`, `:focus`, `:active`, and `:disabled` states.

### Style Structure

```typescript
style: {
  // Base styles applied to component
  width: "100%",
  padding: "12px",
  borderRadius: "8px",
  fontFamily: "inherit",
  fontSize: "14px",
  lineHeight: "1.5",

  // Pseudo-state styles (nested objects)
  ":hover": {
    borderColor: "#2196F3",
    backgroundColor: "#fafafa"
  },
  ":focus": {
    outline: "2px solid #2196F3",
    boxShadow: "0 0 0 3px rgba(33, 150, 243, 0.1)"
  },
  ":disabled": {
    opacity: "0.5",
    backgroundColor: "#f0f0f0",
    cursor: "not-allowed"
  }
}
```

### Dynamic Styling with Vars

Control styles at runtime using `styleHandlers` and `Vars`:

```typescript
styleHandlers: {
  // Base properties
  width: `return Vars.isFullWidth ? '100%' : '400px';`,
  backgroundColor: `return Vars.theme === 'dark' ? '#1e1e1e' : '#fff';`,
  borderColor: `
    if (Vars.hasError) return '#f44336';
    if (Vars.isValid) return '#4caf50';
    return '#ccc';
  `,
  color: `return Vars.theme === 'dark' ? '#fff' : '#333';`,

  // Pseudo-state styles
  ":hover": `
    return {
      borderColor: Vars.theme === 'dark' ? '#666' : '#999',
      backgroundColor: Vars.theme === 'dark' ? '#2a2a2a' : '#f9f9f9'
    };
  `,

  ":focus": `
    return {
      boxShadow: \`0 0 0 3px rgba(\${Vars.accentColor}, 0.1)\`,
      borderColor: Vars.accentColor
    };
  `,

  ":disabled": `
    return {
      opacity: '0.6',
      cursor: 'not-allowed',
      backgroundColor: Vars.theme === 'dark' ? '#1a1a1a' : '#f5f5f5'
    };
  `
}
```

### Conditional Styling Based on Content

```typescript
styleHandlers: {
  minHeight: `
    // Expand for longer content
    const lineCount = (Vars.description || '').split('\\n').length;
    if (lineCount > 10) return '300px';
    if (lineCount > 5) return '200px';
    return '120px';
  `,
  borderColor: `
    // Visual feedback based on character count
    const charCount = (Vars.description || '').length;
    const maxChars = 500;

    if (charCount > maxChars) return '#f44336';  // Red: over limit
    if (charCount > maxChars * 0.9) return '#ff9800';  // Orange: near limit
    return '#ccc';  // Default
  `
}
```

---

## See Also

- [TextInput Component](./text-input.md) - Single-line text input
- [Core Concepts](./core-concepts.md) - Fundamental concepts
- [Variable Scopes](../architecture/micro-apps/variable-scopes.md) - Microapp isolation
