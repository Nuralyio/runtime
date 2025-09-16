# Textarea Component

A versatile textarea component with validation, resize options, and interactive features for the Hybrid UI Library.

## Features

- 📝 **Multi-line Text Input**: Support for multiple lines of text input
- ✅ **Validation**: Built-in validation system with custom rules
- 📏 **Resize Options**: Configurable resize behavior (none, vertical, horizontal, both)
- 🎨 **Multiple Variants**: Outlined, filled, borderless, and underlined styles
- 📱 **Responsive Design**: Works seamlessly across different screen sizes
- ♿ **Accessibility**: Full keyboard navigation and screen reader support
- 🌙 **Theme Support**: Light and dark theme compatibility
- 🔄 **Auto-resize**: Automatic height adjustment based on content
- 📊 **Character Counter**: Built-in character counting with limits
- 🧹 **Clear Button**: Optional clear functionality

## Installation

```bash
npm install @nuralyui/textarea
```

## Basic Usage

### HTML

```html
<nr-textarea placeholder="Enter your message"></nr-textarea>
```

### React

```tsx
import { NrTextarea } from '@nuralyui/textarea/react';

function MyComponent() {
  return (
    <NrTextarea
      placeholder="Enter your message"
      rows={4}
      maxLength={500}
      showCount
    />
  );
}
```

## Examples

### Basic Textarea

```html
<nr-textarea
  placeholder="Enter your thoughts..."
  rows="4"
></nr-textarea>
```

### With Character Count

```html
<nr-textarea
  placeholder="Tweet your thoughts"
  max-length="280"
  show-count
  rows="3"
></nr-textarea>
```

### Auto-resize Textarea

```html
<nr-textarea
  placeholder="Start typing..."
  auto-resize
  min-height="80"
  max-height="300"
></nr-textarea>
```

### With Validation

```html
<nr-textarea
  id="feedback-textarea"
  placeholder="Your feedback..."
  required
  validate-on-change
  has-feedback
></nr-textarea>

<script>
  const textarea = document.getElementById('feedback-textarea');
  textarea.rules = [
    {
      validator: (value) => value.length >= 10,
      message: 'Please provide at least 10 characters',
      level: 'error'
    },
    {
      validator: (value) => value.length <= 500,
      message: 'Message is too long',
      level: 'error'
    }
  ];
</script>
```

### Different Variants

```html
<!-- Outlined (default) -->
<nr-textarea variant="outlined" placeholder="Outlined textarea"></nr-textarea>

<!-- Filled -->
<nr-textarea variant="filled" placeholder="Filled textarea"></nr-textarea>

<!-- Underlined -->
<nr-textarea variant="underlined" placeholder="Underlined textarea"></nr-textarea>

<!-- Borderless -->
<nr-textarea variant="borderless" placeholder="Borderless textarea"></nr-textarea>
```

### Different Sizes

```html
<nr-textarea size="small" placeholder="Small textarea"></nr-textarea>
<nr-textarea size="medium" placeholder="Medium textarea"></nr-textarea>
<nr-textarea size="large" placeholder="Large textarea"></nr-textarea>
```

### Resize Options

```html
<!-- Vertical resize only -->
<nr-textarea resize="vertical" placeholder="Vertical resize"></nr-textarea>

<!-- Horizontal resize only -->
<nr-textarea resize="horizontal" placeholder="Horizontal resize"></nr-textarea>

<!-- Both directions -->
<nr-textarea resize="both" placeholder="Both directions"></nr-textarea>

<!-- No resize -->
<nr-textarea resize="none" placeholder="Fixed size"></nr-textarea>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string` | `""` | The textarea value |
| `placeholder` | `string` | `""` | Placeholder text |
| `disabled` | `boolean` | `false` | Disables the textarea |
| `readonly` | `boolean` | `false` | Makes the textarea read-only |
| `required` | `boolean` | `false` | Marks the textarea as required |
| `rows` | `number` | `3` | Number of visible text lines |
| `cols` | `number` | `50` | Number of visible character columns |
| `resize` | `string` | `"vertical"` | Resize behavior: `none`, `vertical`, `horizontal`, `both` |
| `size` | `string` | `"medium"` | Size variant: `small`, `medium`, `large` |
| `variant` | `string` | `"underlined"` | Visual variant: `outlined`, `filled`, `borderless`, `underlined` |
| `state` | `string` | `"default"` | Visual state: `default`, `error`, `warning`, `success` |
| `maxLength` | `number` | - | Maximum character limit |
| `allowClear` | `boolean` | `false` | Shows clear button |
| `showCount` | `boolean` | `false` | Shows character counter |
| `autoResize` | `boolean` | `false` | Auto-resize based on content |
| `minHeight` | `number` | - | Minimum height for auto-resize (px) |
| `maxHeight` | `number` | - | Maximum height for auto-resize (px) |
| `validateOnChange` | `boolean` | `true` | Validate on value change |
| `validateOnBlur` | `boolean` | `true` | Validate on blur |
| `hasFeedback` | `boolean` | `false` | Show validation status icon |
| `rules` | `ValidationRule[]` | `[]` | Array of validation rules |

## Events

| Event | Description | Detail |
|-------|-------------|--------|
| `nr-textarea-change` | Fired when the value changes | `{ value, length, exceedsMaxLength, validation }` |
| `nr-focus` | Fired when the textarea gains focus | `{ focused: true, originalEvent }` |
| `nr-blur` | Fired when the textarea loses focus | `{ focused: false, originalEvent }` |
| `nr-clear` | Fired when the clear button is clicked | `{ value }` |
| `nr-resize` | Fired when the textarea is resized | `{ width, height, direction }` |

## Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `focus()` | Focus the textarea | `options?: { preventScroll?, cursor?, select? }` |
| `blur()` | Blur the textarea | - |
| `validate()` | Trigger validation manually | Returns `Promise<ValidationResult>` |
| `clearValidation()` | Clear validation state | - |
| `getValidationResult()` | Get current validation result | Returns `ValidationResult \| undefined` |

## Slots

| Slot | Description |
|------|-------------|
| `label` | Content for the textarea label |
| `helper-text` | Helper text below the textarea |
| `addon-before` | Content before the textarea |
| `addon-after` | Content after the textarea |

## CSS Custom Properties

The textarea component supports extensive customization through CSS custom properties:

### Colors
```css
--nuraly-color-textarea-background
--nuraly-color-textarea-text
--nuraly-color-textarea-placeholder
--nuraly-color-textarea-border
--nuraly-color-textarea-border-hover
--nuraly-color-textarea-border-focus
--nuraly-color-textarea-label
--nuraly-color-textarea-icon
--nuraly-color-textarea-error-icon
--nuraly-color-textarea-warning-icon
--nuraly-color-textarea-success-icon
```

### Sizing
```css
--nuraly-size-textarea-icon
--nuraly-border-width-textarea
--nuraly-border-radius-textarea
--nuraly-font-size-textarea-small
--nuraly-font-size-textarea-medium
--nuraly-font-size-textarea-large
--nuraly-spacing-textarea-padding
--nuraly-spacing-textarea-gap
```

### Typography
```css
--nuraly-font-family-textarea
--nuraly-line-height-textarea
```

## Validation

The textarea component includes a powerful validation system:

```typescript
interface ValidationRule {
  validator: (value: string) => boolean | Promise<boolean>;
  message: string;
  level?: 'error' | 'warning';
  blocking?: boolean;
}
```

### Example Validation Rules

```javascript
const textarea = document.querySelector('nr-textarea');
textarea.rules = [
  // Required field
  {
    validator: (value) => value.trim().length > 0,
    message: 'This field is required',
    level: 'error',
    blocking: true
  },
  // Minimum length
  {
    validator: (value) => value.length >= 10,
    message: 'Please provide at least 10 characters',
    level: 'error'
  },
  // Maximum length warning
  {
    validator: (value) => value.length <= 500,
    message: 'Consider keeping your message concise',
    level: 'warning',
    blocking: false
  },
  // Custom async validation
  {
    validator: async (value) => {
      const response = await fetch('/api/validate-content', {
        method: 'POST',
        body: JSON.stringify({ content: value })
      });
      return response.ok;
    },
    message: 'Content validation failed',
    level: 'error'
  }
];
```

## Accessibility

The textarea component is built with accessibility in mind:

- ✅ Full keyboard navigation support
- ✅ Screen reader compatibility
- ✅ ARIA attributes for states and properties
- ✅ Focus management
- ✅ High contrast mode support
- ✅ Reduced motion respect

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+

## License

MIT