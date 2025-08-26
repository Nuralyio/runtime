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

<hy-button>Click me</hy-button>
<hy-button type="primary">Primary Button</hy-button>
<hy-button type="secondary">Secondary Button</hy-button>
```

### React Integration

```jsx
import { HyButton } from '@nuralyui/button/react';

function App() {
  return (
    <div>
      <HyButton onClick={() => alert('Clicked!')}>
        Click me
      </HyButton>
      
      <HyButton type="primary" disabled>
        Disabled Button
      </HyButton>
      
      <HyButton type="danger" loading>
        Loading...
      </HyButton>
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <hy-button @click="handleClick">Click me</hy-button>
    <hy-button type="primary" :disabled="isDisabled">Primary</hy-button>
    <hy-button type="secondary" :loading="isLoading">Loading</hy-button>
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
<hy-button>Default</hy-button>

<!-- Primary button -->
<hy-button type="primary">Primary</hy-button>

<!-- Secondary button -->
<hy-button type="secondary">Secondary</hy-button>

<!-- Danger button -->
<hy-button type="danger">Delete</hy-button>

<!-- Ghost button -->
<hy-button type="ghost">Ghost</hy-button>
```

### Button Sizes

```html
<hy-button size="small">Small</hy-button>
<hy-button size="default">Default</hy-button>
<hy-button size="large">Large</hy-button>
```

### Buttons with Icons

```html
<!-- Single icon on the left -->
<hy-button icon='["plus"]'>Add Item</hy-button>

<!-- Single icon on the right -->
<hy-button icon='["arrow-right"]' icon-position="right">Next</hy-button>

<!-- Icons on both sides -->
<hy-button icon='["arrow-left", "arrow-right"]'>Navigate</hy-button>
```

### Button States

```html
<!-- Disabled button -->
<hy-button disabled>Disabled</hy-button>

<!-- Loading button -->
<hy-button loading>Loading...</hy-button>

<!-- Dashed border button -->
<hy-button dashed>Dashed Border</hy-button>
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

<hy-button id="interactive-btn" type="secondary">
  Click me
</hy-button>
```

## Styling

### CSS Custom Properties

The button component supports extensive customization through CSS custom properties:

```css
hy-button {
  /* Colors */
  --hy-button-primary-bg: #4F46E5;
  --hy-button-primary-color: white;
  --hy-button-primary-border: #4F46E5;
  
  --hy-button-secondary-bg: transparent;
  --hy-button-secondary-color: #4F46E5;
  --hy-button-secondary-border: #4F46E5;
  
  --hy-button-danger-bg: #DC2626;
  --hy-button-danger-color: white;
  --hy-button-danger-border: #DC2626;
  
  /* Sizes */
  --hy-button-padding-small: 4px 8px;
  --hy-button-padding-default: 8px 16px;
  --hy-button-padding-large: 12px 24px;
  
  --hy-button-font-size-small: 12px;
  --hy-button-font-size-default: 14px;
  --hy-button-font-size-large: 16px;
  
  /* Border */
  --hy-button-border-radius: 6px;
  --hy-button-border-width: 1px;
  
  /* States */
  --hy-button-disabled-opacity: 0.5;
  --hy-button-hover-opacity: 0.9;
  
  /* Spacing */
  --hy-button-icon-gap: 8px;
}
```

### Dark Theme Support

```css
@media (prefers-color-scheme: dark) {
  hy-button {
    --hy-button-primary-bg: #6366F1;
    --hy-button-secondary-color: #A5B4FC;
    --hy-button-secondary-border: #A5B4FC;
  }
}

/* Manual dark theme */
[data-theme="dark"] hy-button {
  --hy-button-primary-bg: #6366F1;
  --hy-button-secondary-color: #A5B4FC;
  --hy-button-secondary-border: #A5B4FC;
}
```

### Custom Styling Example

```css
/* Custom button style */
.my-custom-button {
  --hy-button-primary-bg: linear-gradient(45deg, #FF6B6B, #4ECDC4);
  --hy-button-border-radius: 20px;
  --hy-button-padding-default: 12px 32px;
  --hy-button-font-size-default: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

```html
<hy-button type="primary" class="my-custom-button">
  Custom Style
</hy-button>
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
