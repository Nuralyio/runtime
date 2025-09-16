# Slider Input Component

An interactive slider component for selecting numeric values within a specified range. Built with Lit and supports comprehensive theming.

## Features

- **Range Selection**: Configure min, max, step, and initial values
- **Theme Support**: Works with both Carbon and Default design systems  
- **Size Variants**: Small, medium, and large sizes
- **State Variants**: Error, warning, and success states
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive**: Adapts to container width
- **Custom Styling**: Override CSS custom properties for customization

## Usage

### Basic Usage

```html
<hy-slider-input value="50" min="0" max="100" step="1"></hy-slider-input>
```

### With Custom Range

```html
<hy-slider-input value="25" min="10" max="50" step="5"></hy-slider-input>
```

### Size Variants

```html
<hy-slider-input value="30" size="small"></hy-slider-input>
<hy-slider-input value="50"></hy-slider-input>
<hy-slider-input value="70" size="large"></hy-slider-input>
```

### State Variants

```html
<hy-slider-input value="50" success></hy-slider-input>
<hy-slider-input value="75" warning></hy-slider-input>
<hy-slider-input value="90" error></hy-slider-input>
```

### Disabled State

```html
<hy-slider-input value="40" disabled></hy-slider-input>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | number | 0 | Current value of the slider |
| `min` | number | 0 | Minimum value |
| `max` | number | 100 | Maximum value |
| `step` | number | 1 | Step increment |
| `disabled` | boolean | false | Disable the slider |
| `size` | string | 'medium' | Size variant: 'small', 'medium', 'large' |

## Attributes

| Attribute | Description |
|-----------|-------------|
| `error` | Apply error state styling |
| `warning` | Apply warning state styling |
| `success` | Apply success state styling |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | - | Fired when the slider value changes |
| `changed` | `{ value: number }` | Custom event with value details |

## CSS Custom Properties

The component uses CSS custom properties for theming. You can override these for custom styling:

### Track Styling
- `--nuraly-slider-input-local-track-color`: Track background color
- `--nuraly-slider-input-local-track-filled-color`: Filled track color
- `--nuraly-slider-input-local-track-height`: Track height

### Thumb Styling
- `--nuraly-slider-input-local-thumb-color`: Thumb background color
- `--nuraly-slider-input-local-thumb-border-color`: Thumb border color
- `--nuraly-slider-input-local-thumb-diameter`: Thumb size
- `--nuraly-slider-input-local-thumb-border-radius`: Thumb border radius

### State Colors
- `--nuraly-slider-input-local-primary-color`: Primary color
- `--nuraly-slider-input-local-error-color`: Error state color
- `--nuraly-slider-input-local-warning-color`: Warning state color
- `--nuraly-slider-input-local-success-color`: Success state color

## Examples

### Custom Styling

```css
.custom-slider {
  --nuraly-slider-input-local-track-filled-color: linear-gradient(90deg, #ff6b6b, #48dbfb);
  --nuraly-slider-input-local-thumb-color: #ffffff;
  --nuraly-slider-input-local-track-height: 8px;
  --nuraly-slider-input-local-thumb-diameter: 20px;
}
```

```html
<hy-slider-input value="70" class="custom-slider"></hy-slider-input>
```

### Event Handling

```javascript
const slider = document.querySelector('hy-slider-input');

slider.addEventListener('change', (e) => {
  console.log('Slider value changed:', e.target.value);
});

slider.addEventListener('changed', (e) => {
  console.log('Slider value detail:', e.detail.value);
});
```

## Accessibility

- Full keyboard navigation with arrow keys
- Screen reader support with proper ARIA labels
- Focus management and visual indicators
- Supports both mouse and touch interactions

## Browser Support

- Chrome/Edge 79+
- Firefox 72+
- Safari 13+

## Dependencies

- Lit 3.0+
- TypeScript 4.0+