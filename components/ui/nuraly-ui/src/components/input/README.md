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

<hy-input placeholder="Enter your name"></hy-input>
<hy-input type="password" placeholder="Enter password"></hy-input>
<hy-input type="number" placeholder="Enter number" min="0" max="100"></hy-input>
```

### React Integration

```jsx
import { HyInput } from '@nuralyui/input/react';

function App() {
  const [value, setValue] = useState('');

  return (
    <div>
      <HyInput
        placeholder="Enter your name"
        value={value}
        onInput={(e) => setValue(e.target.value)}
      />
      
      <HyInput
        type="password"
        placeholder="Password"
        state="error"
        onValueChange={(e) => console.log(e.detail.value)}
      />
      
      <HyInput
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
    <hy-input
      v-model="inputValue"
      placeholder="Enter text"
      @input="handleInput"
    />
    
    <hy-input
      type="password"
      placeholder="Password"
      :state="validationState"
      @value-change="handleValueChange"
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
| `input` | `Event` | Fired on every input change |
| `change` | `Event` | Fired when input loses focus after value change |
| `valueChange` | `{ value: string, target: HTMLInputElement }` | Custom event with input details |
| `focus` | `FocusEvent` | Fired when input gains focus |
| `blur` | `FocusEvent` | Fired when input loses focus |

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
<hy-input type="text" placeholder="Enter text"></hy-input>

<!-- Password input with visibility toggle -->
<hy-input type="password" placeholder="Enter password"></hy-input>

<!-- Number input with controls -->
<hy-input 
  type="number" 
  min="0" 
  max="100" 
  step="5" 
  placeholder="Enter number">
</hy-input>
```

### Input Sizes

```html
<hy-input size="small" placeholder="Small input"></hy-input>
<hy-input size="medium" placeholder="Medium input"></hy-input>
<hy-input size="large" placeholder="Large input"></hy-input>
```

### Validation States

```html
<!-- Default state -->
<hy-input placeholder="Default state"></hy-input>

<!-- Error state -->
<hy-input state="error" placeholder="Error state" value="Invalid input"></hy-input>

<!-- Warning state -->
<hy-input state="warning" placeholder="Warning state" value="Check this"></hy-input>
```

### Advanced Features

```html
<!-- Input with copy functionality -->
<hy-input 
  value="https://example.com/api/token" 
  with-copy
  placeholder="API Token">
</hy-input>

<!-- Disabled input -->
<hy-input disabled value="Cannot edit this" placeholder="Disabled"></hy-input>

<!-- Input with autocomplete -->
<hy-input 
  autocomplete="email" 
  placeholder="Enter email"
  type="text">
</hy-input>
```

### Form Integration

```html
<form id="user-form">
  <div class="form-group">
    <label for="username">Username:</label>
    <hy-input 
      id="username"
      placeholder="Enter username"
      required>
    </hy-input>
  </div>

  <div class="form-group">
    <label for="password">Password:</label>
    <hy-input 
      id="password"
      type="password"
      placeholder="Enter password"
      required>
    </hy-input>
  </div>

  <div class="form-group">
    <label for="age">Age:</label>
    <hy-input 
      id="age"
      type="number"
      min="18"
      max="120"
      placeholder="Enter age">
    </hy-input>
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

<hy-input 
  id="email-input"
  type="text"
  placeholder="Enter email address">
</hy-input>
```

## Styling

### CSS Custom Properties

```css
hy-input {
  /* Colors */
  --hy-input-bg: #ffffff;
  --hy-input-border: #d1d5db;
  --hy-input-border-focus: #4f46e5;
  --hy-input-color: #111827;
  --hy-input-placeholder: #6b7280;
  
  /* Error state */
  --hy-input-border-error: #dc2626;
  --hy-input-bg-error: #fef2f2;
  
  /* Warning state */
  --hy-input-border-warning: #d97706;
  --hy-input-bg-warning: #fffbeb;
  
  /* Sizes */
  --hy-input-padding-small: 6px 8px;
  --hy-input-padding-medium: 8px 12px;
  --hy-input-padding-large: 12px 16px;
  
  --hy-input-font-size-small: 12px;
  --hy-input-font-size-medium: 14px;
  --hy-input-font-size-large: 16px;
  
  /* Border */
  --hy-input-border-radius: 6px;
  --hy-input-border-width: 1px;
  
  /* Focus */
  --hy-input-focus-ring: 0 0 0 3px rgba(79, 70, 229, 0.1);
  
  /* Disabled */
  --hy-input-disabled-bg: #f9fafb;
  --hy-input-disabled-color: #6b7280;
}
```

### Dark Theme Support

```css
@media (prefers-color-scheme: dark) {
  hy-input {
    --hy-input-bg: #1f2937;
    --hy-input-border: #374151;
    --hy-input-border-focus: #6366f1;
    --hy-input-color: #f9fafb;
    --hy-input-placeholder: #9ca3af;
    
    --hy-input-disabled-bg: #111827;
    --hy-input-disabled-color: #6b7280;
  }
}
```

### Custom Styling Example

```css
/* Custom input style */
.my-custom-input {
  --hy-input-border-radius: 12px;
  --hy-input-border-focus: #8b5cf6;
  --hy-input-focus-ring: 0 0 0 3px rgba(139, 92, 246, 0.1);
  --hy-input-padding-medium: 12px 16px;
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
<hy-input id="username" placeholder="Enter username"></hy-input>

<!-- Wrapped labeling -->
<label>
  Email Address:
  <hy-input type="text" placeholder="Enter email"></hy-input>
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
