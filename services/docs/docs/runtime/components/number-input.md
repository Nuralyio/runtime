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

## Inputs

### value
**Type:** `number`

Current numeric value.

```typescript
inputHandlers: {
  value: `return Vars.count || 0;`
}
```

### min / max
**Type:** `number`

Value constraints.

```typescript
input: {
  min: { type: "number", value: 0 },
  max: { type: "number", value: 100 }
}
```

### step
**Type:** `number`

Increment/decrement step value.

```typescript
input: {
  step: { type: "number", value: 5 }
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
      { required: true, message: "Quantity is required" },
      { min: 1, message: "Minimum quantity is 1" },
      { max: 100, message: "Maximum quantity is 100" }
    ]
  }
}
```

### readonly
**Type:** `boolean`

Make input read-only.

```typescript
input: {
  readonly: { type: "boolean", value: true }
}
```

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

**Example:**
```typescript
event: {
  onChange: `
    const value = parseFloat(EventData.value);
    Vars.quantity = value;

    // Update calculated total
    Vars.total = value * Vars.pricePerUnit;
  `
}
```

### onFocus
**Triggered:** When input receives focus

```typescript
event: {
  onFocus: `
    Vars.activeField = "quantity";
  `
}
```

### onBlur
**Triggered:** When input loses focus

```typescript
event: {
  onBlur: `
    Vars.activeField = null;

    // Validate on blur
    const value = parseFloat(EventData.event.target.value);
    if (isNaN(value)) {
      Vars.quantityError = "Please enter a valid number";
    }
  `
}
```

### onEnter
**Triggered:** When Enter key is pressed

```typescript
event: {
  onEnter: `
    // Submit on enter
    await UpdateQuantity(Vars.itemId, Vars.quantity);
  `
}
```

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

      // Update cart total
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
      Vars.product = {
        ...Vars.product,
        price: price
      };
    `,
    onBlur: `
      // Format to 2 decimal places
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

      // Calculate discounted price
      Vars.discountedPrice = Vars.originalPrice * (1 - percent / 100);
    `
  }
}
```

### Rating Input
```typescript
{
  component_type: "number-input",
  input: {
    min: { type: "number", value: 1 },
    max: { type: "number", value: 5 },
    step: { type: "number", value: 0.5 }
  },
  inputHandlers: {
    label: `return "Rating (1-5)";`,
    helper: `return "Enter a rating between 1 and 5 stars";`,
    value: `return Vars.userRating || 3;`
  },
  event: {
    onChange: `
      const rating = parseFloat(EventData.value);
      Vars.userRating = Math.min(5, Math.max(1, rating));
    `,
    onBlur: `
      // Round to nearest 0.5
      const rating = parseFloat(EventData.event.target.value);
      Vars.userRating = Math.round(rating * 2) / 2;
    `
  }
}
```

---

## See Also

- [TextInput Component](./text-input.md) - General text input
- [Slider Component](./slider.md) - Range slider
- [Form Component](./form.md) - Form container
