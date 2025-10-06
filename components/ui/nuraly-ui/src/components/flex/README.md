# Flex

A flexible box layout component for creating responsive flex layouts with ease.

## Features

- **Flex Direction** - Row, column, and reverse variants
- **Alignment Control** - Justify and align items positioning
- **Gap Support** - Preset sizes (small, medium, large) or custom values
- **Wrap Control** - Control flex wrapping behavior
- **Inline Flex** - Support for inline-flex display
- **Theme-aware** - Integrates with NuralyUI theme system
- **Responsive Gaps** - Support for [horizontal, vertical] gap arrays

## Basic Usage

### HTML
```html
<!-- Basic flex container -->
<nr-flex>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</nr-flex>

<!-- Centered content -->
<nr-flex justify="center" align="center">
  <div>Centered</div>
</nr-flex>

<!-- Column layout with gap -->
<nr-flex vertical gap="medium">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</nr-flex>

<!-- Custom gap -->
<nr-flex gap="16">
  <div>Item 1</div>
  <div>Item 2</div>
</nr-flex>
```

### React
```jsx
import { NrFlex } from '@nuralyui/flex/react';

function MyComponent() {
  return (
    <NrFlex gap="medium" justify="space-between">
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
    </NrFlex>
  );
}
```

## API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `direction` | `'row' \| 'row-reverse' \| 'column' \| 'column-reverse'` | `'row'` | Flex direction |
| `vertical` | `boolean` | `false` | Shorthand for flex-direction: column |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior |
| `justify` | `'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly'` | - | Justify content alignment |
| `align` | `'flex-start' \| 'flex-end' \| 'center' \| 'baseline' \| 'stretch'` | - | Align items alignment |
| `gap` | `'small' \| 'medium' \| 'large' \| number \| string \| [number, number]` | `0` | Gap between flex items |
| `inline` | `boolean` | `false` | Use inline-flex display |
| `flex` | `string` | - | Custom flex CSS value |

### Gap Values

**Presets:**
- `small` - 8px (--nuraly-spacing-2)
- `medium` - 16px (--nuraly-spacing-3)
- `large` - 24px (--nuraly-spacing-4)

**Custom:**
- Number: Converted to pixels (e.g., `16` → `16px`)
- String: Used as-is (e.g., `"1rem"`, `"var(--my-gap)"`)
- Array: `[horizontal, vertical]` (e.g., `[16, 24]`)

## Examples

### Basic Layouts

```html
<!-- Horizontal layout -->
<nr-flex gap="medium">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</nr-flex>

<!-- Vertical layout -->
<nr-flex vertical gap="medium">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</nr-flex>
```

### Alignment

```html
<!-- Center everything -->
<nr-flex justify="center" align="center" style="height: 200px;">
  <div>Centered Content</div>
</nr-flex>

<!-- Space between -->
<nr-flex justify="space-between">
  <div>Left</div>
  <div>Right</div>
</nr-flex>

<!-- Align to end -->
<nr-flex justify="flex-end" align="flex-end" style="height: 100px;">
  <div>Bottom Right</div>
</nr-flex>
```

### Wrapping

```html
<!-- Wrap items -->
<nr-flex wrap="wrap" gap="small">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
  <div>Item 5</div>
</nr-flex>
```

### Custom Gaps

```html
<!-- Number gap (pixels) -->
<nr-flex gap="20">
  <div>Item 1</div>
  <div>Item 2</div>
</nr-flex>

<!-- CSS value -->
<nr-flex gap="1rem">
  <div>Item 1</div>
  <div>Item 2</div>
</nr-flex>

<!-- Different horizontal and vertical gaps -->
<nr-flex wrap="wrap" .gap=${[16, 24]}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</nr-flex>
```

### Inline Flex

```html
<nr-flex inline gap="small">
  <span>Inline</span>
  <span>Items</span>
</nr-flex>
```

### Direction Control

```html
<!-- Row reverse -->
<nr-flex direction="row-reverse" gap="medium">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</nr-flex>

<!-- Column reverse -->
<nr-flex direction="column-reverse" gap="medium">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</nr-flex>
```

### Complex Layouts

```html
<!-- Navbar-like layout -->
<nr-flex justify="space-between" align="center" gap="medium">
  <div>Logo</div>
  <nr-flex gap="medium">
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nr-flex>
  <button>Login</button>
</nr-flex>

<!-- Card layout -->
<nr-flex vertical gap="medium">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
  <nr-flex justify="flex-end" gap="small">
    <button>Cancel</button>
    <button>OK</button>
  </nr-flex>
</nr-flex>
```

## CSS Custom Properties

The component uses the following CSS custom properties from the theme:

- `--nuraly-color-text` - Text color
- `--nuraly-spacing-2` - Small gap (8px)
- `--nuraly-spacing-3` - Medium gap (16px)
- `--nuraly-spacing-4` - Large gap (24px)

## Browser Support

Works in all modern browsers that support:
- Web Components
- ES6 Modules
- CSS Flexbox
- CSS Gap property

## License

MIT
