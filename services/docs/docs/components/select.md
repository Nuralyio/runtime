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

### onFocus / onBlur
**Triggered:** When select receives/loses focus

### onDropdownOpen / onDropdownClose
**Triggered:** When dropdown opens/closes

### onValidation
**Triggered:** When validation occurs

**EventData:**
```typescript
{
  isValid: boolean
  message: string
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
  input: { label: { type: "string", value: "Country" } },
  inputHandlers: {
    options: `return [{ label: 'USA', value: 'us' }, { label: 'Canada', value: 'ca' }];`
  },
  event: {
    onChange: `
      Vars.selectedCountry = EventData.value;
      Vars.selectedCity = null;
      Vars.cities = await LoadCities(EventData.value);
    `
  }
}

// City select (dependent)
{
  uuid: "city-select",
  component_type: "select",
  input: { label: { type: "string", value: "City" } },
  inputHandlers: {
    options: `return Vars.cities || [];`,
    disabled: `return !Vars.selectedCountry;`
  },
  event: {
    onChange: `Vars.selectedCity = EventData.value;`
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
    options: `return Vars.availableTags.map(tag => ({ label: tag.name, value: tag.id }));`,
    value: `return Vars.selectedTags || [];`
  },
  event: {
    onChange: `Vars.selectedTags = EventData.value;`
  }
}
```

---

## See Also

- [Dropdown Component](./dropdown.md) - Action menu
- [RadioButton Component](./radio-button.md) - Radio selection
- [Checkbox Component](./checkbox.md) - Checkbox selection
