---
sidebar_position: 32
title: RadioButton
description: A radio button group component for single selection from multiple options
---

# RadioButton

The **RadioButton** component provides a group of mutually exclusive options where only one can be selected at a time. It supports both traditional radio buttons and button-style variants.

## Overview

RadioButton provides a complete single-selection solution with:
- Traditional radio and button variants
- Horizontal and vertical layouts
- Label position control
- Auto-width for button variants
- Helper text support
- Disabled state

## Basic Usage

```typescript
{
  uuid: "my-radio",
  name: "payment_method",
  component_type: "radio-button",
  inputHandlers: {
    value: `
      return {
        options: [
          { label: 'Credit Card', value: 'credit' },
          { label: 'PayPal', value: 'paypal' },
          { label: 'Bank Transfer', value: 'bank' }
        ],
        currentValue: Vars.paymentMethod || 'credit',
        type: 'default'
      };
    `
  },
  event: {
    onChange: `
      Vars.paymentMethod = EventData.value;
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | object | - | Object with options, currentValue, and type |
| `direction` | string | `'vertical'` | Layout: 'vertical', 'horizontal' |
| `position` | string | `'left'` | Label position: 'left', 'right' |
| `size` | string | `'medium'` | Size: 'small', 'medium', 'large' |
| `state` | string | `'default'` | State: 'default', 'disabled' |
| `required` | boolean | `false` | Mark as required |
| `name` | string | `'radioGroup'` | Form field name |
| `autoWidth` | boolean | `false` | Auto-width for button type |
| `helper` | string | `''` | Helper text |

---

## Inputs

### value
**Type:** `object`

Object containing options array, current value, and display type.

```typescript
inputHandlers: {
  value: `
    return {
      options: [
        { label: 'Option A', value: 'a' },
        { label: 'Option B', value: 'b' },
        { label: 'Option C', value: 'c', disabled: true }
      ],
      currentValue: Vars.selectedOption || 'a',
      type: 'default'  // or 'button'
    };
  `
}
```

### direction
**Type:** `string`

Layout direction: `vertical` or `horizontal`.

```typescript
input: {
  direction: { type: "string", value: "horizontal" }
}
```

### position
**Type:** `string`

Label position relative to radio: `left` or `right`.

```typescript
input: {
  position: { type: "string", value: "right" }
}
```

### size
**Type:** `string`

Radio button size: `small`, `medium`, `large`.

```typescript
input: {
  size: { type: "string", value: "large" }
}
```

### autoWidth
**Type:** `boolean`

Auto-width for button-style variant.

```typescript
input: {
  autoWidth: { type: "boolean", value: true }
}
```

### helper
**Type:** `string`

Helper text displayed below the radio group.

```typescript
input: {
  helper: { type: "string", value: "Select your preferred option" }
}
```

---

## Events

### onChange
**Triggered:** When selection changes

**EventData:**
```typescript
{
  value: any        // Selected value
  option: object    // Selected option object
  oldValue: any     // Previous value
}
```

**Example:**
```typescript
event: {
  onChange: `
    Vars.selectedOption = EventData.value;
    Vars.selectedLabel = EventData.option.label;

    // Handle selection change
    if (EventData.value === 'other') {
      Vars.showOtherInput = true;
    } else {
      Vars.showOtherInput = false;
    }
  `
}
```

---

## Common Patterns

### Payment Method Selection
```typescript
{
  component_type: "radio-button",
  input: {
    direction: { type: "string", value: "vertical" }
  },
  inputHandlers: {
    value: `
      return {
        options: [
          { label: 'Credit Card', value: 'credit', icon: 'credit-card' },
          { label: 'PayPal', value: 'paypal', icon: 'paypal' },
          { label: 'Apple Pay', value: 'apple', icon: 'apple' },
          { label: 'Bank Transfer', value: 'bank', icon: 'building' }
        ],
        currentValue: Vars.paymentMethod || 'credit',
        type: 'default'
      };
    `
  },
  event: {
    onChange: `
      Vars.paymentMethod = EventData.value;

      // Show additional fields based on selection
      Vars.showCardForm = EventData.value === 'credit';
      Vars.showBankForm = EventData.value === 'bank';
    `
  }
}
```

### Button-Style Tabs
```typescript
{
  component_type: "radio-button",
  input: {
    direction: { type: "string", value: "horizontal" }
  },
  inputHandlers: {
    value: `
      return {
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Yearly', value: 'yearly' }
        ],
        currentValue: Vars.timeframe || 'monthly',
        type: 'button'
      };
    `
  },
  event: {
    onChange: `
      Vars.timeframe = EventData.value;

      // Reload data for new timeframe
      Vars.chartData = await LoadChartData(EventData.value);
    `
  }
}
```

### Size Selection
```typescript
{
  component_type: "radio-button",
  input: {
    direction: { type: "string", value: "horizontal" },
    autoWidth: { type: "boolean", value: true }
  },
  inputHandlers: {
    value: `
      const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
      const availableSizes = Vars.product?.availableSizes || sizes;

      return {
        options: sizes.map(size => ({
          label: size,
          value: size,
          disabled: !availableSizes.includes(size)
        })),
        currentValue: Vars.selectedSize || 'M',
        type: 'button'
      };
    `
  },
  event: {
    onChange: `
      Vars.selectedSize = EventData.value;

      // Check stock for selected size
      const stock = await CheckStock(Vars.product.id, EventData.value);
      Vars.inStock = stock > 0;
      Vars.stockCount = stock;
    `
  }
}
```

### Gender Selection
```typescript
{
  component_type: "radio-button",
  input: {
    direction: { type: "string", value: "horizontal" },
    required: { type: "boolean", value: true },
    helper: { type: "string", value: "Required for personalization" }
  },
  inputHandlers: {
    value: `
      return {
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
          { label: 'Prefer not to say', value: 'unspecified' }
        ],
        currentValue: Vars.gender || '',
        type: 'default'
      };
    `
  },
  event: {
    onChange: `
      Vars.gender = EventData.value;
    `
  }
}
```

### Yes/No Question
```typescript
{
  component_type: "radio-button",
  input: {
    direction: { type: "string", value: "horizontal" }
  },
  inputHandlers: {
    value: `
      return {
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false }
        ],
        currentValue: Vars.hasAccount,
        type: 'button'
      };
    `
  },
  event: {
    onChange: `
      Vars.hasAccount = EventData.value;

      if (EventData.value) {
        Vars.showLoginForm = true;
        Vars.showRegistrationForm = false;
      } else {
        Vars.showLoginForm = false;
        Vars.showRegistrationForm = true;
      }
    `
  }
}
```

---

## See Also

- [Checkbox Component](./checkbox.md) - Multi-selection
- [Select Component](./select.md) - Dropdown selection
- [Form Component](./form.md) - Form container
