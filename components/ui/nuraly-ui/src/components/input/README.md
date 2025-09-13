# Input Component (@nuralyui/input)

A flexible and feature-rich input component built with Lit and TypeScript. Supports various input types, validation states, sizes, and additional features like copy functionality.

## Features

- 📝 Multiple input types (text, password, number)
- 📏 Different sizes (small, medium, large)
- ⚠️ Validation states (default, error, warning)
- 🔒 Built-in password visibility toggle
- 🔢 Number input with step controls
- 📋 Copy to clipboard functionality
- ♿ Fully accessible with ARIA support
- 🌗 Dark/light theme support
- ⌨️ Complete keyboard navigation

## Installation

```bash
npm install @nuralyui/input
# or
yarn add @nuralyui/input
# or
bun add @nuralyui/input
```

## Usage

### Basic Usage

```html
<script type="module">
  import '@nuralyui/input';
</script>

<nr-input placeholder="Enter your name"></nr-input>
<nr-input type="password" placeholder="Enter password"></nr-input>
<nr-input type="number" placeholder="Enter number" min="0" max="100"></nr-input>
```

### React Integration

```jsx
import { NrInput } from '@nuralyui/input/react';

function App() {
  const [value, setValue] = useState('');

  return (
    <div>
      <NrInput
        placeholder="Enter your name"
        value={value}
        onInput={(e) => setValue(e.target.value)}
      />
      
      <NrInput
        type="password"
        placeholder="Password"
        state="error"
        onNrInput={(e) => console.log(e.detail.value)}
      />
      
      <NrInput
        type="number"
        min="0"
        max="100"
        step="1"
        withCopy
      />
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <nr-input
      v-model="inputValue"
      placeholder="Enter text"
      @nr-input="handleInput"
    />
    
    <nr-input
      type="password"
      placeholder="Password"
      :state="validationState"
      @nr-input="handleValueChange"
    />
  </div>
</template>

<script>
import '@nuralyui/input';

export default {
  data() {
    return {
      inputValue: '',
      validationState: 'default'
    };
  },
  methods: {
    handleInput(event) {
      console.log('Input value:', event.target.value);
    },
    handleValueChange(event) {
      console.log('Value changed:', event.detail.value);
    }
  }
};
</script>
```

## API Reference

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `'text' \| 'password' \| 'number'` | `'text'` | Input type |
| `value` | `string` | `''` | Input value |
| `placeholder` | `string` | `''` | Placeholder text |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Input size |
| `state` | `'default' \| 'error' \| 'warning'` | `'default'` | Validation state |
| `disabled` | `boolean` | `false` | Whether input is disabled |
| `withCopy` | `boolean` | `false` | Show copy to clipboard button |
| `autocomplete` | `string` | `'off'` | Autocomplete attribute |
| `min` | `string` | - | Minimum value (number type) |
| `max` | `string` | - | Maximum value (number type) |
| `step` | `string` | - | Step value (number type) |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `nr-input` | `{ value: string, target: HTMLInputElement, originalEvent?: Event, action?: string }` | Main input change event |
| `nr-focus` | `{ target: EventTarget, value: string }` | Input gains focus |
| `nr-enter` | `{ target: EventTarget, value: string, originalEvent: KeyboardEvent }` | Enter key pressed |
| `nr-copy-success` | `{ value: string }` | Copy to clipboard succeeded |
| `nr-copy-error` | `{ error: Error }` | Copy to clipboard failed |

### Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `focus()` | - | Programmatically focus the input |
| `blur()` | - | Remove focus from the input |
| `select()` | - | Select all text in the input |

## Examples

### Input Types

```html
<!-- Text input -->
<nr-input type="text" placeholder="Enter text"></nr-input>

<!-- Password input with visibility toggle -->
<nr-input type="password" placeholder="Enter password"></nr-input>

<!-- Number input with controls -->
<nr-input 
  type="number" 
  min="0" 
  max="100" 
  step="5" 
  placeholder="Enter number">
</nr-input>
```

### Input Sizes

```html
<nr-input size="small" placeholder="Small input"></nr-input>
<nr-input size="medium" placeholder="Medium input"></nr-input>
<nr-input size="large" placeholder="Large input"></nr-input>
```

### Validation States

```html
<!-- Default state -->
<nr-input placeholder="Default state"></nr-input>

<!-- Error state -->
<nr-input state="error" placeholder="Error state" value="Invalid input"></nr-input>

<!-- Warning state -->
<nr-input state="warning" placeholder="Warning state" value="Check this"></nr-input>
```

### Advanced Features

```html
<!-- Input with copy functionality -->
<nr-input 
  value="https://example.com/api/token" 
  with-copy
  placeholder="API Token">
</nr-input>

<!-- Disabled input -->
<nr-input disabled value="Cannot edit this" placeholder="Disabled"></nr-input>

<!-- Input with autocomplete -->
<nr-input 
  autocomplete="email" 
  placeholder="Enter email"
  type="text">
</nr-input>
```

### Form Integration

```html
<form id="user-form">
  <div class="form-group">
    <label for="username">Username:</label>
    <nr-input 
      id="username"
      placeholder="Enter username"
      required>
    </nr-input>
  </div>

  <div class="form-group">
    <label for="password">Password:</label>
    <nr-input 
      id="password"
      type="password"
      placeholder="Enter password"
      required>
    </nr-input>
  </div>

  <div class="form-group">
    <label for="age">Age:</label>
    <nr-input 
      id="age"
      type="number"
      min="18"
      max="120"
      placeholder="Enter age">
    </nr-input>
  </div>
</form>

<script>
  document.getElementById('user-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    console.log(Object.fromEntries(formData));
  });
</script>
```

### Real-time Validation

```html
<script type="module">
  import '@nuralyui/input';
  
  const emailInput = document.querySelector('#email-input');
  
  emailInput.addEventListener('input', (e) => {
    const email = e.target.value;
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    if (email && !isValid) {
      emailInput.state = 'error';
    } else if (email && isValid) {
      emailInput.state = 'default';
    } else {
      emailInput.state = 'default';
    }
  });
</script>

<nr-input 
  id="email-input"
  type="text"
  placeholder="Enter email address">
</nr-input>
```

## Styling

### CSS Custom Properties

```css
nr-input {
  /* Colors */
  --nuraly-input-bg: #ffffff;
  --nuraly-input-border: #d1d5db;
  --nuraly-input-border-focus: #4f46e5;
  --nuraly-input-color: #111827;
  --nuraly-input-placeholder: #6b7280;
  
  /* Error state */
  --nuraly-input-border-error: #dc2626;
  --nuraly-input-bg-error: #fef2f2;
  
  /* Warning state */
  --nuraly-input-border-warning: #d97706;
  --nuraly-input-bg-warning: #fffbeb;
  
  /* Sizes */
  --nuraly-input-padding-small: 6px 8px;
  --nuraly-input-padding-medium: 8px 12px;
  --nuraly-input-padding-large: 12px 16px;
  
  --nuraly-input-font-size-small: 12px;
  --nuraly-input-font-size-medium: 14px;
  --nuraly-input-font-size-large: 16px;
  
  /* Border */
  --nuraly-input-border-radius: 6px;
  --nuraly-input-border-width: 1px;
  
  /* Focus */
  --nuraly-input-focus-ring: 0 0 0 3px rgba(79, 70, 229, 0.1);
  
  /* Disabled */
  --nuraly-input-disabled-bg: #f9fafb;
  --nuraly-input-disabled-color: #6b7280;
}
```

### Dark Theme Support

```css
@media (prefers-color-scheme: dark) {
  nr-input {
    --nuraly-input-bg: #1f2937;
    --nuraly-input-border: #374151;
    --nuraly-input-border-focus: #6366f1;
    --nuraly-input-color: #f9fafb;
    --nuraly-input-placeholder: #9ca3af;
    
    --nuraly-input-disabled-bg: #111827;
    --nuraly-input-disabled-color: #6b7280;
  }
}
```

### Custom Styling Example

```css
/* Custom input style */
.my-custom-input {
  --nuraly-input-border-radius: 12px;
  --nuraly-input-border-focus: #8b5cf6;
  --nuraly-input-focus-ring: 0 0 0 3px rgba(139, 92, 246, 0.1);
  --nuraly-input-padding-medium: 12px 16px;
}

.my-custom-input:focus-within {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}
```

## Accessibility

The input component follows WCAG 2.1 guidelines:

- ✅ **Keyboard navigation**: Full keyboard support
- ✅ **Screen reader support**: Proper semantic elements and labels
- ✅ **Focus management**: Clear focus indicators
- ✅ **State communication**: Validation states communicated to AT
- ✅ **Label association**: Works with `<label>` elements
- ✅ **Required field indication**: Supports `required` attribute

### ARIA Attributes

The component automatically handles:
- `aria-invalid` when in error state
- `aria-describedby` for associated help text
- `aria-disabled` when disabled
- Proper `role` and `type` attributes

### Usage with Labels

```html
<!-- Explicit labeling -->
<label for="username">Username:</label>
<nr-input id="username" placeholder="Enter username"></nr-input>

<!-- Wrapped labeling -->
<label>
  Email Address:
  <nr-input type="text" placeholder="Enter email"></nr-input>
</label>
```

## Browser Support

- ✅ Chrome 88+
- ✅ Firefox 78+
- ✅ Safari 14+
- ✅ Edge 88+

## TypeScript

Full TypeScript support with exported types:

```typescript
import type { 
  InputType, 
  InputSize, 
  InputState 
} from '@nuralyui/input';

const inputConfig = {
  type: 'text' as InputType,
  size: 'medium' as InputSize,
  state: 'default' as InputState
};
```

## Contributing

See our [Contributing Guide](../../CONTRIBUTING.md) for details on how to contribute to this component.

## License

This component is part of Nuraly UI and is licensed under the [BSD 3-Clause License](../../LICENSE).
