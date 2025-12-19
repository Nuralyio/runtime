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
      Vars.formSubmitted = true;
    `,
    onSubmitError: `
      console.error('Form error:', EventData.error);
      Vars.formError = EventData.error;
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

## Inputs

### disabled
**Type:** `boolean`

Disable all form fields.

```typescript
input: {
  disabled: { type: "boolean", value: false }
}
```

### validateOnChange
**Type:** `boolean`

Validate fields immediately when values change.

```typescript
input: {
  validateOnChange: { type: "boolean", value: true }
}
```

### validateOnBlur
**Type:** `boolean`

Validate fields when they lose focus.

```typescript
input: {
  validateOnBlur: { type: "boolean", value: true }
}
```

### preventInvalidSubmission
**Type:** `boolean`

Prevent form submission if validation fails.

```typescript
input: {
  preventInvalidSubmission: { type: "boolean", value: true }
}
```

### resetOnSuccess
**Type:** `boolean`

Automatically reset form after successful submission.

```typescript
input: {
  resetOnSuccess: { type: "boolean", value: true }
}
```

### action
**Type:** `string`

Form action URL for submission.

```typescript
input: {
  action: { type: "string", value: "/api/submit" }
}
```

### method
**Type:** `string`

HTTP method for form submission.

```typescript
input: {
  method: { type: "string", value: "POST" }
}
```

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
    Vars.submittedData = values;
    Vars.formSubmitted = true;

    // Send to API
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    if (response.ok) {
      Vars.successMessage = 'Registration complete!';
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

**Example:**
```typescript
event: {
  onSubmitError: `
    Vars.formError = EventData.error?.message || 'Submission failed';
    Vars.isSubmitting = false;
  `
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

**Example:**
```typescript
event: {
  onValidationChange: `
    const result = EventData.validationResult;
    Vars.formValid = result.isValid;
    Vars.errorCount = result.errorCount;
    Vars.errors = result.errors;
  `
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

**Example:**
```typescript
event: {
  onFieldChange: `
    const field = EventData.field;
    Vars.lastChangedField = field.name;

    // Track dirty state
    if (!Vars.dirtyFields) Vars.dirtyFields = [];
    if (!Vars.dirtyFields.includes(field.name)) {
      Vars.dirtyFields.push(field.name);
    }
  `
}
```

### onReset
**Triggered:** When form is reset

**Example:**
```typescript
event: {
  onReset: `
    Vars.formSubmitted = false;
    Vars.formError = null;
    Vars.dirtyFields = [];
  `
}
```

---

## Form Methods

The Form component exposes several methods accessible via component instance:

### getFieldsValue()
Get all form field values.

```typescript
// In event handler
const values = Current.Instance.getFieldsValue();
console.log(values);
```

### setFieldsValue(values)
Set form field values programmatically.

```typescript
// In event handler
Current.Instance.setFieldsValue({
  name: 'John Doe',
  email: 'john@example.com'
});
```

### validate()
Validate all form fields.

```typescript
// In event handler
const isValid = await Current.Instance.validate();
if (isValid) {
  // Proceed with submission
}
```

### submit(customData?)
Submit the form programmatically.

```typescript
// In event handler
await Current.Instance.submit({
  additionalData: 'value'
});
```

### reset()
Reset the form to initial state.

```typescript
// In event handler
Current.Instance.reset();
```

### getFormState()
Get current form state summary.

```typescript
// Returns:
{
  isValid: boolean,
  isSubmitting: boolean,
  hasErrors: boolean,
  errorCount: number,
  fieldCount: number
}
```

---

## Common Patterns

### Registration Form
```typescript
// Form container
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

      Vars.isSubmitting = true;
      try {
        const response = await RegisterUser(values);
        Vars.registrationSuccess = true;
        navigateTo('dashboard');
      } catch (error) {
        Vars.registrationError = error.message;
      } finally {
        Vars.isSubmitting = false;
      }
    `
  }
}
```

### Multi-Step Form
```typescript
{
  component_type: "form",
  input: {
    validateOnChange: { type: "boolean", value: true }
  },
  event: {
    onValidationChange: `
      const result = EventData.validationResult;

      // Enable next button only when current step is valid
      const currentStepFields = Vars.steps[Vars.currentStep].fields;
      const stepErrors = currentStepFields.filter(f =>
        result.errors?.some(e => e.field === f)
      );

      Vars.canProceed = stepErrors.length === 0;
    `,
    onFieldChange: `
      // Auto-save draft
      const values = Current.Instance.getFieldsValue();
      localStorage.setItem('formDraft', JSON.stringify(values));
    `
  }
}
```

### Form with Dynamic Fields
```typescript
{
  component_type: "form",
  event: {
    onFieldChange: `
      const field = EventData.field;

      // Show/hide dependent fields
      if (field.name === 'hasChildren') {
        Vars.showChildrenCount = field.value === true;
      }

      // Update calculated values
      if (field.name === 'quantity' || field.name === 'price') {
        const values = Current.Instance.getFieldsValue();
        Vars.total = (values.quantity || 0) * (values.price || 0);
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
