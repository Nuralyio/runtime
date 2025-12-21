---
sidebar_position: 25
title: Form
description: A form container component for managing form fields, validation, and submission
---

# Form

The **Form** component is a container that manages form fields, handles validation, and coordinates form submission. It provides cross-shadow-DOM field registration and comprehensive form state management.

## Overview

Form provides a complete form management solution with:
- Automatic field registration across Shadow DOM boundaries
- Built-in validation support
- Form submission handling
- Field value collection
- Reset functionality
- Validation state tracking

## Basic Usage

```typescript
{
  uuid: "my-form",
  name: "registration_form",
  component_type: "form",
  childrenIds: ["name-input", "email-input", "submit-button"],
  input: {
    validateOnBlur: { type: "boolean", value: true },
    preventInvalidSubmission: { type: "boolean", value: true }
  },
  event: {
    onSubmitSuccess: `
      console.log('Form submitted:', EventData.values);
      $formSubmitted = true;
    `,
    onSubmitError: `
      console.error('Form error:', EventData.error);
      $formError = EventData.error;
    `
  }
}
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `disabled` | boolean | `false` | Disable all form fields |
| `validateOnChange` | boolean | `false` | Validate fields on change |
| `validateOnBlur` | boolean | `true` | Validate fields on blur |
| `preventInvalidSubmission` | boolean | `true` | Prevent submission if invalid |
| `resetOnSuccess` | boolean | `false` | Reset form after successful submission |
| `action` | string | - | Form action URL |
| `method` | string | `'POST'` | HTTP method: 'GET', 'POST', etc. |

---

## Events

### onSubmitSuccess
**Triggered:** When form submits successfully

**EventData:**
```typescript
{
  formData: FormData   // Native FormData object
  values: object       // Field values as object
}
```

**Example:**
```typescript
event: {
  onSubmitSuccess: `
    const values = EventData.values;
    $submittedData = values;
    $formSubmitted = true;

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    if (response.ok) {
      $successMessage = 'Registration complete!';
    }
  `
}
```

### onSubmitError
**Triggered:** When form submission fails

**EventData:**
```typescript
{
  error: any  // Error details
}
```

### onValidationChange
**Triggered:** When form validation state changes

**EventData:**
```typescript
{
  validationResult: object  // Validation details
}
```

### onFieldChange
**Triggered:** When any field value changes

**EventData:**
```typescript
{
  field: object  // Changed field info
}
```

### onReset
**Triggered:** When form is reset

---

## Form Methods

The Form component exposes several methods:

- `getFieldsValue()` - Get all form field values
- `setFieldsValue(values)` - Set form field values programmatically
- `validate()` - Validate all form fields
- `submit(customData?)` - Submit the form programmatically
- `reset()` - Reset the form to initial state
- `getFormState()` - Get current form state summary

---

## Common Patterns

### Registration Form
```typescript
{
  uuid: "registration-form",
  component_type: "form",
  childrenIds: ["name-field", "email-field", "password-field", "submit-btn"],
  input: {
    validateOnBlur: { type: "boolean", value: true },
    preventInvalidSubmission: { type: "boolean", value: true }
  },
  event: {
    onSubmitSuccess: `
      const values = EventData.values;
      $isSubmitting = true;

      try {
        const response = await RegisterUser(values);
        $registrationSuccess = true;
        navigateTo('dashboard');
      } catch (error) {
        $registrationError = error.message;
      } finally {
        $isSubmitting = false;
      }
    `
  }
}
```

---

## See Also

- [TextInput Component](./text-input.md) - Text input field
- [Checkbox Component](./checkbox.md) - Checkbox input
- [Select Component](./select.md) - Dropdown selection
- [Button Component](./button.md) - Form submission
