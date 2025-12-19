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

---

## Common Patterns

### Payment Method Selection
```typescript
{
  component_type: "radio-button",
  input: { direction: { type: "string", value: "vertical" } },
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
  input: { direction: { type: "string", value: "horizontal" } },
  inputHandlers: {
    value: `
      return {
        options: [
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' }
        ],
        currentValue: Vars.timeframe || 'monthly',
        type: 'button'
      };
    `
  },
  event: {
    onChange: `
      Vars.timeframe = EventData.value;
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
      const sizes = ['XS', 'S', 'M', 'L', 'XL'];
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
      const stock = await CheckStock(Vars.product.id, EventData.value);
      Vars.inStock = stock > 0;
    `
  }
}
```

---

## See Also

- [Checkbox Component](./checkbox.md) - Multi-selection
- [Select Component](./select.md) - Dropdown selection
- [Form Component](./form.md) - Form container
