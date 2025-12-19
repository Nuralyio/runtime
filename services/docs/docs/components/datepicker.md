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

### onCalendarOpen / onCalendarClose
**Triggered:** When calendar opens/closes

```typescript
event: {
  onCalendarOpen: `Vars.calendarVisible = true;`,
  onCalendarClose: `Vars.calendarVisible = false;`
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

---

## Common Patterns

### Date Range Booking
```typescript
{
  component_type: "datepicker",
  input: {
    label: { type: "string", value: "Select booking dates" },
    range: { type: "boolean", value: true }
  },
  inputHandlers: {
    minDate: `return new Date().toISOString().split('T')[0];`
  },
  event: {
    onRangeChange: `
      Vars.checkIn = EventData.startDate;
      Vars.checkOut = EventData.endDate;

      const start = new Date(EventData.startDate);
      const end = new Date(EventData.endDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      Vars.totalNights = nights;
      Vars.totalPrice = nights * Vars.pricePerNight;
    `
  }
}
```

---

## See Also

- [TextInput Component](./text-input.md) - Text input
- [Form Component](./form.md) - Form container
