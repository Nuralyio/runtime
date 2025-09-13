# Button Component (@nuralyui/button)

A versatile and customizable button component built with Lit and TypeScript. Supports multiple variants, sizes, icons, and loading states.

## Features

- 🎨 Multiple button variants (primary, secondary, danger, ghost, default)
- 📏 Different sizes (small, default, large)
- 🔄 Loading state with spinner
- 🖼️ Icon support with flexible positioning
- 🎯 Accessible by default
- 🌗 Dark/light theme support
- ⌨️ Full keyboard navigation
- 🚫 Disabled state handling

## Installation

```bash
npm install @nuralyui/button
# or
yarn add @nuralyui/button
# or
bun add @nuralyui/button
```

## Usage

### Basic Usage

```html
<script type="module">
  import '@nuralyui/button';
</script>

<nr-button>Click me</nr-button>
<nr-button type="primary">Primary Button</nr-button>
<nr-button type="secondary">Secondary Button</nr-button>
```

### React Integration

```jsx
import { NrButton } from '@nuralyui/button/react';

function App() {
  return (
    <div>
      <NrButton onClick={() => alert('Clicked!')}>
        Click me
      </NrButton>
      
      <NrButton type="primary" disabled>
        Disabled Button
      </NrButton>
      
      <NrButton type="danger" loading>
        Loading...
      </NrButton>
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <nr-button @click="handleClick">Click me</nr-button>
    <nr-button type="primary" :disabled="isDisabled">Primary</nr-button>
    <nr-button type="secondary" :loading="isLoading">Loading</nr-button>
  </div>
</template>

<script>
import '@nuralyui/button';

export default {
  data() {
    return {
      isDisabled: false,
      isLoading: false
    };
  },
  methods: {
    handleClick() {
      console.log('Button clicked!');
    }
  }
};
</script>
```

## API Reference

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `'default' \| 'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'default'` | Button variant style |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | Button size |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Whether the button shows loading state |
| `dashed` | `boolean` | `false` | Whether the button has dashed border |
| `icon` | `string[]` | `[]` | Array of icon names (1-2 icons) |
| `iconPosition` | `'left' \| 'right'` | `'left'` | Icon position relative to text |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `click` | `MouseEvent` | Fired when button is clicked (not when disabled) |

### Slots

| Slot | Description |
|------|-------------|
| `default` | Button content (text, HTML) |

## Examples

### Button Variants

```html
<!-- Default button -->
<nr-button>Default</nr-button>

<!-- Primary button -->
<nr-button type="primary">Primary</nr-button>

<!-- Secondary button -->
<nr-button type="secondary">Secondary</nr-button>

<!-- Danger button -->
<nr-button type="danger">Delete</nr-button>

<!-- Ghost button -->
<nr-button type="ghost">Ghost</nr-button>
```

### Button Sizes

```html
<nr-button size="small">Small</nr-button>
<nr-button size="default">Default</nr-button>
<nr-button size="large">Large</nr-button>
```

### Buttons with Icons

```html
<!-- Single icon on the left -->
<nr-button icon='["plus"]'>Add Item</nr-button>

<!-- Single icon on the right -->
<nr-button icon='["arrow-right"]' icon-position="right">Next</nr-button>

<!-- Icons on both sides -->
<nr-button icon='["arrow-left", "arrow-right"]'>Navigate</nr-button>
```

### Button States

```html
<!-- Disabled button -->
<nr-button disabled>Disabled</nr-button>

<!-- Loading button -->
<nr-button loading>Loading...</nr-button>

<!-- Dashed border button -->
<nr-button dashed>Dashed Border</nr-button>
```

### Interactive Example

```html
<script type="module">
  import '@nuralyui/button';
  
  const button = document.querySelector('#interactive-btn');
  button.addEventListener('click', () => {
    button.loading = true;
    button.textContent = 'Processing...';
    
    setTimeout(() => {
      button.loading = false;
      button.textContent = 'Success!';
      button.type = 'primary';
    }, 2000);
  });
</script>

<nr-button id="interactive-btn" type="secondary">
  Click me
</nr-button>
```

## Styling

### CSS Custom Properties

The button component supports extensive customization through CSS custom properties:

```css
nr-button {
  /* Colors */
  --nuraly-button-primary-bg: #4F46E5;
  --nuraly-button-primary-color: white;
  --nuraly-button-primary-border: #4F46E5;
  
  --nuraly-button-secondary-bg: transparent;
  --nuraly-button-secondary-color: #4F46E5;
  --nuraly-button-secondary-border: #4F46E5;
  
  --nuraly-button-danger-bg: #DC2626;
  --nuraly-button-danger-color: white;
  --nuraly-button-danger-border: #DC2626;
  
  /* Sizes */
  --nuraly-button-padding-small: 4px 8px;
  --nuraly-button-padding-default: 8px 16px;
  --nuraly-button-padding-large: 12px 24px;
  
  --nuraly-button-font-size-small: 12px;
  --nuraly-button-font-size-default: 14px;
  --nuraly-button-font-size-large: 16px;
  
  /* Border */
  --nuraly-button-border-radius: 6px;
  --nuraly-button-border-width: 1px;
  
  /* States */
  --nuraly-button-disabled-opacity: 0.5;
  --nuraly-button-hover-opacity: 0.9;
  
  /* Spacing */
  --nuraly-button-icon-gap: 8px;
}
```

### Dark Theme Support

```css
@media (prefers-color-scheme: dark) {
  nr-button {
    --nuraly-button-primary-bg: #6366F1;
    --nuraly-button-secondary-color: #A5B4FC;
    --nuraly-button-secondary-border: #A5B4FC;
  }
}

/* Manual dark theme */
[data-theme="dark"] nr-button {
  --nuraly-button-primary-bg: #6366F1;
  --nuraly-button-secondary-color: #A5B4FC;
  --nuraly-button-secondary-border: #A5B4FC;
}
```

### Custom Styling Example

```css
/* Custom button style */
.my-custom-button {
  --nuraly-button-primary-bg: linear-gradient(45deg, #FF6B6B, #4ECDC4);
  --nuraly-button-border-radius: 20px;
  --nuraly-button-padding-default: 12px 32px;
  --nuraly-button-font-size-default: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

```html
<nr-button type="primary" class="my-custom-button">
  Custom Style
</nr-button>
```

## Accessibility

The button component follows WCAG 2.1 guidelines:

- ✅ **Keyboard navigation**: Focusable with Tab, activated with Enter/Space
- ✅ **Screen reader support**: Proper semantic button element
- ✅ **Focus indicators**: Clear focus outline
- ✅ **Disabled state**: Properly communicated to assistive technology
- ✅ **Loading state**: Aria-busy attribute when loading
- ✅ **Color contrast**: Meets AA contrast requirements

### ARIA Attributes

The component automatically handles:
- `aria-disabled` when `disabled` is true
- `aria-busy` when `loading` is true
- `role="button"` (implicit with `<button>` element)

## Browser Support

- ✅ Chrome 88+
- ✅ Firefox 78+
- ✅ Safari 14+
- ✅ Edge 88+

## TypeScript

Full TypeScript support with exported types:

```typescript
import type { 
  ButtonType, 
  ButtonSize, 
  IconPosition 
} from '@nuralyui/button';

const buttonConfig = {
  type: 'primary' as ButtonType,
  size: 'large' as ButtonSize,
  iconPosition: 'right' as IconPosition
};
```

## Contributing

See our [Contributing Guide](../../CONTRIBUTING.md) for details on how to contribute to this component.

## License

This component is part of Nuraly UI and is licensed under the [BSD 3-Clause License](../../LICENSE).
