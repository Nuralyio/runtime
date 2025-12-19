---
sidebar_position: 29
title: Select
description: A select dropdown component for choosing from a list of options
---

# Select

The **Select** component provides a dropdown interface for selecting one or multiple options from a predefined list. It supports search, validation, and multiple selection modes.

## Overview

Select provides a complete dropdown solution with:
- Single and multiple selection
- Searchable options
- Clearable selection
- Custom option rendering
- Validation support
- Block layout option

## Basic Usage

```typescript
{
  uuid: "my-select",
  name: "country_select",
  component_type: "select",
  input: {
    placeholder: { type: "string", value: "Select a country" },
    label: { type: "string", value: "Country" }
  },
  inputHandlers: {
    options: `
      return [
        { label: 'United States', value: 'us' },
        { label: 'United Kingdom', value: 'uk' },
        { label: 'Canada', value: 'ca' },
        { label: 'Australia', value: 'au' }
      ];
    `
  },
  event: {
    onChange: `
      Vars.selectedCountry = EventData.value;
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | string \| string[] | `''` | Selected value(s) |
| `options` | array | `[]` | Array of option objects |
| `placeholder` | string | `'Select an option'` | Placeholder text |
| `searchPlaceholder` | string | `'Search options...'` | Search input placeholder |
| `label` | string | `''` | Label text |
| `helper` | string | `''` | Helper text |
| `selectionMode` | string | `'single'` | Selection mode: 'single', 'multiple' |
| `searchable` | boolean | `false` | Enable search |
| `clearable` | boolean | `false` | Enable clear button |
| `required` | boolean | `false` | Mark as required |
| `block` | boolean | `false` | Full-width display |
| `disabled` | boolean | `false` | Disable select |
| `state` | string | `'default'` | State: 'default', 'disabled' |
| `size` | string | `'medium'` | Size: 'small', 'medium', 'large' |
| `type` | string | `'default'` | Visual type |

---

## Inputs

### value
**Type:** `string | string[]`

Selected value(s).

```typescript
input: {
  value: { type: "string", value: "option1" }
}

// Multiple selection
input: {
  value: { type: "array", value: ["option1", "option2"] }
}
```

### options
**Type:** `array`

Array of option objects with `label` and `value` properties.

```typescript
inputHandlers: {
  options: `
    return [
      { label: 'Option 1', value: 'opt1' },
      { label: 'Option 2', value: 'opt2' },
      { label: 'Option 3', value: 'opt3', disabled: true }
    ];
  `
}
```

### selectionMode
**Type:** `string`

Selection mode: `single` or `multiple`.

```typescript
input: {
  selectionMode: { type: "string", value: "multiple" }
}
```

### searchable
**Type:** `boolean`

Enable search filtering of options.

```typescript
input: {
  searchable: { type: "boolean", value: true }
}
```

### clearable
**Type:** `boolean`

Show clear button to remove selection.

```typescript
input: {
  clearable: { type: "boolean", value: true }
}
```

### block
**Type:** `boolean`

Make select full-width.

```typescript
input: {
  block: { type: "boolean", value: true }
}
```

---

## Events

### onChange
**Triggered:** When selection changes

**EventData:**
```typescript
{
  value: string | string[]  // Selected value(s)
}
```

**Example:**
```typescript
event: {
  onChange: `
    Vars.selectedOption = EventData.value;

    // Find full option data
    const option = Vars.options.find(o => o.value === EventData.value);
    Vars.selectedOptionLabel = option?.label;
  `
}
```

### onFocus
**Triggered:** When select receives focus

```typescript
event: {
  onFocus: `
    Vars.activeField = "select";
  `
}
```

### onBlur
**Triggered:** When select loses focus

```typescript
event: {
  onBlur: `
    Vars.activeField = null;
  `
}
```

### onDropdownOpen
**Triggered:** When dropdown opens

```typescript
event: {
  onDropdownOpen: `
    Vars.dropdownVisible = true;
  `
}
```

### onDropdownClose
**Triggered:** When dropdown closes

```typescript
event: {
  onDropdownClose: `
    Vars.dropdownVisible = false;
  `
}
```

### onValidation
**Triggered:** When validation occurs

**EventData:**
```typescript
{
  isValid: boolean   // Validation result
  message: string    // Validation message
}
```

**Example:**
```typescript
event: {
  onValidation: `
    Vars.selectValid = EventData.isValid;
    Vars.selectError = EventData.message;
  `
}
```

---

## Common Patterns

### Dependent Selects
```typescript
// Country select
{
  uuid: "country-select",
  component_type: "select",
  input: {
    label: { type: "string", value: "Country" }
  },
  inputHandlers: {
    options: `
      return [
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' }
      ];
    `
  },
  event: {
    onChange: `
      Vars.selectedCountry = EventData.value;
      Vars.selectedCity = null; // Reset city

      // Load cities for selected country
      Vars.cities = await LoadCities(EventData.value);
    `
  }
}

// City select (dependent)
{
  uuid: "city-select",
  component_type: "select",
  input: {
    label: { type: "string", value: "City" }
  },
  inputHandlers: {
    options: `return Vars.cities || [];`,
    disabled: `return !Vars.selectedCountry;`
  },
  event: {
    onChange: `
      Vars.selectedCity = EventData.value;
    `
  }
}
```

### Multi-Select Tags
```typescript
{
  component_type: "select",
  input: {
    selectionMode: { type: "string", value: "multiple" },
    searchable: { type: "boolean", value: true },
    placeholder: { type: "string", value: "Select tags" }
  },
  inputHandlers: {
    options: `
      return Vars.availableTags.map(tag => ({
        label: tag.name,
        value: tag.id
      }));
    `,
    value: `return Vars.selectedTags || [];`
  },
  event: {
    onChange: `
      Vars.selectedTags = EventData.value;
    `
  }
}
```

### Dynamic Options from API
```typescript
{
  component_type: "select",
  input: {
    searchable: { type: "boolean", value: true },
    placeholder: { type: "string", value: "Select user" }
  },
  inputHandlers: {
    options: `
      // Options loaded from API
      return (Vars.users || []).map(user => ({
        label: user.name,
        value: user.id,
        icon: 'user'
      }));
    `
  },
  event: {
    onChange: `
      Vars.selectedUserId = EventData.value;

      // Fetch user details
      const user = await GetUser(EventData.value);
      Vars.selectedUser = user;
    `
  }
}
```

### Form Select with Validation
```typescript
{
  component_type: "select",
  input: {
    required: { type: "boolean", value: true },
    label: { type: "string", value: "Category" },
    helper: { type: "string", value: "Select a category for your item" }
  },
  inputHandlers: {
    options: `return Vars.categories || [];`,
    state: `return Vars.categoryError ? 'error' : 'default';`
  },
  event: {
    onChange: `
      Vars.selectedCategory = EventData.value;
      Vars.categoryError = null;
    `,
    onValidation: `
      if (!EventData.isValid) {
        Vars.categoryError = EventData.message;
      }
    `
  }
}
```

---

## See Also

- [Dropdown Component](./dropdown.md) - Action menu
- [RadioButton Component](./radio-button.md) - Radio selection
- [Checkbox Component](./checkbox.md) - Checkbox selection
- [Form Component](./form.md) - Form container
