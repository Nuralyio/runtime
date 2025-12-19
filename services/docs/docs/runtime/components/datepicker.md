---
sidebar_position: 23
title: DatePicker
description: A date picker component for selecting dates and date ranges with locale support
---

# DatePicker

The **DatePicker** component provides an intuitive calendar interface for selecting dates or date ranges. It supports multiple formats, locales, and validation.

## Overview

DatePicker provides a complete date selection solution with:
- Single date and date range selection
- Multiple date formats
- Locale support
- Min/max date constraints
- Calendar open/close events
- Built-in validation

## Basic Usage

```typescript
{
  uuid: "my-datepicker",
  name: "birth_date",
  component_type: "datepicker",
  input: {
    label: { type: "string", value: "Date of Birth" },
    placeholder: { type: "string", value: "Select date" },
    format: { type: "string", value: "DD/MM/YYYY" }
  },
  event: {
    onDateChange: `
      Vars.selectedDate = EventData.value;
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | string | `''` | Current date value |
| `label` | string | `''` | Label text |
| `placeholder` | string | `''` | Placeholder text |
| `helper` | string | `''` | Helper text below input |
| `format` | string | `'DD/MM/YYYY'` | Date display format |
| `locale` | string | `'en'` | Locale for date formatting |
| `size` | string | `'medium'` | Size: 'small', 'medium', 'large' |
| `variant` | string | `'default'` | Variant: 'default', 'outlined', 'filled' |
| `state` | string | `'default'` | State: 'default', 'error', 'warning', 'success' |
| `placement` | string | `'auto'` | Calendar placement: 'auto', 'bottom', 'top' |
| `disabled` | boolean | `false` | Disable the datepicker |
| `required` | boolean | `false` | Mark as required |
| `range` | boolean | `false` | Enable date range selection |
| `minDate` | string | - | Minimum selectable date |
| `maxDate` | string | - | Maximum selectable date |

---

## Inputs

### value
**Type:** `string`

The current selected date value.

```typescript
input: {
  value: { type: "string", value: "2024-01-15" }
}
```

### format
**Type:** `string`

Date display format using moment.js tokens.

```typescript
input: {
  format: { type: "string", value: "YYYY-MM-DD" }
}

// Common formats:
// "DD/MM/YYYY" - 15/01/2024
// "MM/DD/YYYY" - 01/15/2024
// "YYYY-MM-DD" - 2024-01-15
// "DD MMMM YYYY" - 15 January 2024
```

### locale
**Type:** `string`

Locale for date formatting and calendar display.

```typescript
input: {
  locale: { type: "string", value: "fr" }
}
```

### range
**Type:** `boolean`

Enable date range selection mode.

```typescript
input: {
  range: { type: "boolean", value: true }
}
```

### minDate / maxDate
**Type:** `string`

Constraints on selectable dates.

```typescript
input: {
  minDate: { type: "string", value: "2024-01-01" },
  maxDate: { type: "string", value: "2024-12-31" }
}
```

### state
**Type:** `string`

Visual state: `default`, `error`, `warning`, `success`.

```typescript
input: {
  state: { type: "string", value: "error" }
}
```

---

## Events

### onDateChange
**Triggered:** When a date is selected

**EventData:**
```typescript
{
  value: string  // Selected date value
}
```

**Example:**
```typescript
event: {
  onDateChange: `
    Vars.selectedDate = EventData.value;

    // Calculate age if birth date
    const birthDate = new Date(EventData.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    Vars.userAge = age;
  `
}
```

### onRangeChange
**Triggered:** When a date range is selected (range mode)

**EventData:**
```typescript
{
  startDate: string  // Start date
  endDate: string    // End date
  value: string      // Combined value
}
```

**Example:**
```typescript
event: {
  onRangeChange: `
    Vars.startDate = EventData.startDate;
    Vars.endDate = EventData.endDate;

    // Calculate duration
    const start = new Date(EventData.startDate);
    const end = new Date(EventData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    Vars.durationDays = days;
  `
}
```

### onCalendarOpen
**Triggered:** When calendar opens

```typescript
event: {
  onCalendarOpen: `
    Vars.calendarVisible = true;
  `
}
```

### onCalendarClose
**Triggered:** When calendar closes

```typescript
event: {
  onCalendarClose: `
    Vars.calendarVisible = false;
  `
}
```

### onFocus
**Triggered:** When input receives focus

```typescript
event: {
  onFocus: `
    Vars.activeField = "datepicker";
  `
}
```

### onBlur
**Triggered:** When input loses focus

```typescript
event: {
  onBlur: `
    Vars.activeField = null;
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
    Vars.dateValid = EventData.isValid;
    Vars.dateError = EventData.message;
  `
}
```

---

## Common Patterns

### Date Range Booking
```typescript
{
  component_type: "datepicker",
  input: {
    label: { type: "string", value: "Select booking dates" },
    range: { type: "boolean", value: true },
    minDate: {
      type: "handler",
      value: `return new Date().toISOString().split('T')[0];`
    }
  },
  event: {
    onRangeChange: `
      Vars.checkIn = EventData.startDate;
      Vars.checkOut = EventData.endDate;

      // Calculate nights
      const start = new Date(EventData.startDate);
      const end = new Date(EventData.endDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      Vars.totalNights = nights;
      Vars.totalPrice = nights * Vars.pricePerNight;
    `
  }
}
```

### Age Validation
```typescript
{
  component_type: "datepicker",
  input: {
    label: { type: "string", value: "Date of Birth" },
    maxDate: {
      type: "handler",
      value: `
        const date = new Date();
        date.setFullYear(date.getFullYear() - 18);
        return date.toISOString().split('T')[0];
      `
    }
  },
  event: {
    onDateChange: `
      const birthDate = new Date(EventData.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      Vars.userAge = age;
      Vars.isAdult = age >= 18;
    `
  }
}
```

---

## See Also

- [TextInput Component](./text-input.md) - Text input
- [Form Component](./form.md) - Form container
- [Core Concepts](./core-concepts.md) - Fundamental concepts
