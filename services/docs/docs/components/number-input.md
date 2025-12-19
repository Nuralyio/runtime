---
sidebar_position: 34
title: NumberInput
description: A numeric input component for entering numbers with validation
---

# NumberInput

The **NumberInput** component provides a specialized input for numeric values with built-in validation, min/max constraints, and step controls.

## Overview

NumberInput provides a complete numeric input solution with:
- Number type enforcement
- Min/max/step constraints
- Built-in validation
- Label and helper text
- Various sizes and states
- Focus and blur handling

## Basic Usage

```typescript
{
  uuid: "my-number-input",
  name: "quantity_input",
  component_type: "number-input",
  input: {
    placeholder: { type: "string", value: "Enter quantity" },
    min: { type: "number", value: 1 },
    max: { type: "number", value: 100 }
  },
  inputHandlers: {
    label: `return "Quantity";`,
    value: `return Vars.quantity || 1;`
  },
  event: {
    onChange: `
      Vars.quantity = parseInt(EventData.value);
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | number | - | Current numeric value |
| `placeholder` | string | `'Number input'` | Placeholder text |
| `label` | string | `''` | Label text |
| `helper` | string | `''` | Helper text |
| `size` | string | `'medium'` | Size: 'small', 'medium', 'large' |
| `variant` | string | - | Visual variant |
| `status` | string | - | Validation status |
| `state` | string | `'default'` | State: 'default', 'disabled' |
| `readonly` | boolean | `false` | Read-only mode |
| `required` | boolean | `false` | Mark as required |
| `min` | number | `0` | Minimum value |
| `max` | number | - | Maximum value |
| `step` | number | - | Step increment |
| `name` | string | - | Form field name |
| `rules` | array | `[]` | Validation rules |
| `validateOnChange` | boolean | `true` | Validate on change |
| `validateOnBlur` | boolean | `true` | Validate on blur |
| `hasFeedback` | boolean | `false` | Show validation feedback |

---

## Events

### onChange
**Triggered:** When value changes

**EventData:**
```typescript
{
  value: string     // New value (as string)
  oldValue: string  // Previous value
}
```

### onFocus / onBlur
**Triggered:** When input receives/loses focus

### onEnter
**Triggered:** When Enter key is pressed

---

## Common Patterns

### Quantity Selector
```typescript
{
  component_type: "number-input",
  input: {
    min: { type: "number", value: 1 },
    max: { type: "number", value: 99 },
    step: { type: "number", value: 1 }
  },
  inputHandlers: {
    label: `return "Quantity";`,
    value: `return Vars.cartItem?.quantity || 1;`
  },
  event: {
    onChange: `
      const qty = parseInt(EventData.value);
      Vars.cartItem = {
        ...Vars.cartItem,
        quantity: qty
      };

      Vars.cartTotal = Vars.cart.reduce((sum, item) =>
        sum + (item.price * item.quantity), 0
      );
    `
  }
}
```

### Price Input
```typescript
{
  component_type: "number-input",
  input: {
    min: { type: "number", value: 0 },
    step: { type: "number", value: 0.01 },
    placeholder: { type: "string", value: "0.00" }
  },
  inputHandlers: {
    label: `return "Price ($)";`,
    value: `return Vars.product?.price || 0;`
  },
  event: {
    onChange: `
      const price = parseFloat(EventData.value);
      Vars.product = { ...Vars.product, price: price };
    `,
    onBlur: `
      const price = parseFloat(EventData.event.target.value);
      Vars.product.price = Math.round(price * 100) / 100;
    `
  }
}
```

### Age Input with Validation
```typescript
{
  component_type: "number-input",
  input: {
    min: { type: "number", value: 0 },
    max: { type: "number", value: 120 },
    required: { type: "boolean", value: true },
    rules: {
      type: "array",
      value: [
        { required: true, message: "Age is required" },
        { min: 18, message: "Must be at least 18 years old" }
      ]
    }
  },
  inputHandlers: {
    label: `return "Age";`,
    helper: `return "You must be 18 or older";`,
    value: `return Vars.userAge || '';`
  },
  event: {
    onChange: `
      const age = parseInt(EventData.value);
      Vars.userAge = age;
      Vars.isAdult = age >= 18;
    `
  }
}
```

### Percentage Input
```typescript
{
  component_type: "number-input",
  input: {
    min: { type: "number", value: 0 },
    max: { type: "number", value: 100 },
    step: { type: "number", value: 1 }
  },
  inputHandlers: {
    label: `return "Discount (%)";`,
    value: `return Vars.discountPercent || 0;`
  },
  event: {
    onChange: `
      const percent = parseFloat(EventData.value);
      Vars.discountPercent = Math.min(100, Math.max(0, percent));
      Vars.discountedPrice = Vars.originalPrice * (1 - percent / 100);
    `
  }
}
```

---

## See Also

- [TextInput Component](./text-input.md) - General text input
- [Slider Component](./slider.md) - Range slider
- [Form Component](./form.md) - Form container
