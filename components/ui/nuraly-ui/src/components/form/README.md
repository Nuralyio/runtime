# NuralyUI Form Component

A comprehensive form component that coordinates validation and submission across form fields without performing validation itself.

## Architecture Overview

The Form component follows the **coordination pattern** where:

- ✅ **Individual components handle their own validation** (input, select, radio, etc.)
- ✅ **Form coordinates validation results** across all fields
- ✅ **Form manages submission flow** and state
- ✅ **Form provides unified events** and data collection

## Why Validation Happens in Each Input

### Benefits of Component-Level Validation

1. **Encapsulation**: Each component manages its own validation logic
2. **Reusability**: Components work independently of any form
3. **HTML5 Integration**: Components implement native validation APIs
4. **Real-time Feedback**: Immediate validation on user interaction
5. **Consistency**: Standardized validation behavior across all components

### Form's Role

The form component:
- **Coordinates** existing component validations
- **Collects** validation results from all fields
- **Manages** form-level state and submission
- **Provides** unified events and data access
- **Prevents** submission if validation fails

## Usage Examples

### Basic Form with Validation

```html
<nr-form @nr-form-submit-success="${handleSuccess}">
  <nr-input name="username" required placeholder="Username"></nr-input>
  <nr-input name="email" type="email" required placeholder="Email"></nr-input>
  <nr-input name="password" type="password" required minlength="8"></nr-input>
  <nr-button type="submit">Submit</nr-button>
</nr-form>
```

### Advanced Configuration

```html
<nr-form 
  validate-on-change
  validate-on-blur
  prevent-invalid-submission
  reset-on-success
  @nr-form-validation-changed="${handleValidationChange}"
  @nr-form-submit-error="${handleError}"
>
  <nr-input name="name" required></nr-input>
  <nr-select name="country" required>
    <nr-option value="us">United States</nr-option>
    <nr-option value="ca">Canada</nr-option>
  </nr-select>
  <nr-radio name="plan" value="basic" required>Basic</nr-radio>
  <nr-radio name="plan" value="premium">Premium</nr-radio>
  <nr-button type="submit">Submit</nr-button>
</nr-form>
```

### Programmatic Usage

```typescript
const form = document.querySelector('nr-form');

// Validate programmatically
const isValid = await form.validate();

// Submit with custom data
await form.submit({ timestamp: Date.now() });

// Get form data
const data = form.getFormData();

// Get invalid fields
const invalidFields = form.getInvalidFields();

// Reset form
form.reset();
```

## Events

| Event | Description | Detail |
|-------|-------------|---------|
| `nr-form-validation-changed` | Validation state changes | `{ validationResult }` |
| `nr-form-field-changed` | Individual field changes | `{ field }` |
| `nr-form-submit-attempt` | Form submission attempted | `{ validationResult }` |
| `nr-form-submit-success` | Form submitted successfully | `{ formData }` |
| `nr-form-submit-error` | Form submission failed | `{ error }` |
| `nr-form-reset` | Form was reset | `{}` |

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `validateOnChange` | `boolean` | `true` | Enable real-time validation |
| `validateOnBlur` | `boolean` | `true` | Validate on field blur |
| `preventInvalidSubmission` | `boolean` | `true` | Prevent submission if invalid |
| `resetOnSuccess` | `boolean` | `false` | Reset after successful submission |
| `action` | `string` | `undefined` | Form action URL |
| `method` | `'GET' \| 'POST'` | `'POST'` | Form method |
| `disabled` | `boolean` | `false` | Disable entire form |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `validate()` | `Promise<boolean>` | Validate all form fields |
| `submit(customData?)` | `Promise<void>` | Submit form programmatically |
| `reset()` | `void` | Reset form to initial state |
| `getFormData()` | `FormSubmissionData` | Get current form data |
| `getInvalidFields()` | `FormField[]` | Get fields with validation errors |

## Integration with Existing Components

The form automatically detects and coordinates with:

- `nr-input` - Text inputs with validation
- `nr-select` - Select dropdowns with validation  
- `nr-radio` - Radio button groups with validation
- `nr-checkbox` - Checkboxes with validation
- `nr-textarea` - Text areas with validation
- `nr-timepicker` - Time pickers with validation
- `nr-datepicker` - Date pickers with validation

Each component maintains its own validation logic while the form coordinates the results.

## Best Practices

1. **Always add `name` attributes** to form fields
2. **Use component-level validation** for field-specific rules
3. **Use form-level events** for submission handling
4. **Implement proper error handling** for submission failures
5. **Consider UX** when configuring validation timing

## Architecture Compliance

This form component follows the established NuralyUI architecture:

- Uses **controllers** for complex logic management
- Implements **event-driven** communication
- Follows **HTML5 form standards**
- Maintains **component encapsulation**
- Provides **consistent API** patterns
