# NuralyUI TimePicker

A comprehensive time selection component with clock interface, multiple formats, and validation capabilities.

## Features

- **Multiple Formats**: 12-hour and 24-hour time formats
- **Visual Clock Interface**: Interactive clock face for intuitive time selection
- **Digital Input**: Direct time input with validation
- **Flexible Display**: Show/hide seconds, customizable intervals
- **Time Constraints**: Min/max time validation, disabled times
- **Accessibility**: Full keyboard navigation and screen reader support
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Light/dark theme with CSS custom properties
- **Size Variants**: Small, medium, and large sizes
- **Style Variants**: Default, outlined, and filled styles

## Installation

```bash
npm install @nuraly/timepicker
```

## Basic Usage

```html
<nr-timepicker label="Select Time"></nr-timepicker>
```

```javascript
import '@nuraly/timepicker';

// Listen for time changes
document.querySelector('nr-timepicker')
  .addEventListener('nr-time-change', (event) => {
    console.log('Selected time:', event.detail.value);
  });
```

## Examples

### 12-Hour Format with Seconds

```html
<nr-timepicker 
  format="12h"
  show-seconds
  label="Meeting Time"
  value="2:30:15 PM">
</nr-timepicker>
```

### Time Range Constraints

```html
<nr-timepicker 
  label="Business Hours"
  min-time="09:00"
  max-time="17:00"
  helper-text="Between 9 AM and 5 PM">
</nr-timepicker>
```

### Custom Intervals

```html
<nr-timepicker 
  label="Appointment Time"
  minute-interval="15"
  helper-text="15-minute intervals">
</nr-timepicker>
```

### Different Sizes

```html
<nr-timepicker size="small" label="Small"></nr-timepicker>
<nr-timepicker size="medium" label="Medium"></nr-timepicker>
<nr-timepicker size="large" label="Large"></nr-timepicker>
```

### Style Variants

```html
<nr-timepicker variant="default" label="Default"></nr-timepicker>
<nr-timepicker variant="outlined" label="Outlined"></nr-timepicker>
<nr-timepicker variant="filled" label="Filled"></nr-timepicker>
```

## API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string` | `''` | Current time value |
| `default-value` | `string` | `''` | Default time value |
| `format` | `'24h' \| '12h'` | `'24h'` | Time format |
| `show-seconds` | `boolean` | `false` | Show seconds in time |
| `show-clock` | `boolean` | `true` | Show visual clock interface |
| `minute-interval` | `number` | `1` | Minute selection interval |
| `second-interval` | `number` | `1` | Second selection interval |
| `min-time` | `string` | - | Minimum allowed time |
| `max-time` | `string` | - | Maximum allowed time |
| `disabled-times` | `string[]` | - | Array of disabled times |
| `enabled-times` | `string[]` | - | Array of enabled times |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Component size |
| `variant` | `'default' \| 'outlined' \| 'filled'` | `'default'` | Style variant |
| `state` | `'default' \| 'error' \| 'warning' \| 'success'` | `'default'` | Validation state |
| `placement` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Clock dropdown placement |
| `label` | `string` | `''` | Input label |
| `helper-text` | `string` | `''` | Helper text |
| `placeholder` | `string` | - | Input placeholder |
| `name` | `string` | `''` | Form field name |
| `required` | `boolean` | `false` | Required field |
| `disabled` | `boolean` | `false` | Disabled state |
| `readonly` | `boolean` | `false` | Read-only state |
| `clock-open` | `boolean` | `false` | Clock dropdown open state |
| `clock-mode` | `'hours' \| 'minutes' \| 'seconds'` | `'hours'` | Current clock mode |

### Methods

| Method | Description |
|--------|-------------|
| `openClock()` | Open the clock dropdown |
| `closeClock()` | Close the clock dropdown |
| `toggleClock()` | Toggle clock dropdown |
| `clear()` | Clear selected time |
| `setToNow()` | Set to current time |
| `setTime(time)` | Set time programmatically |
| `getCurrentTime()` | Get current time value |
| `validateTime(time)` | Validate time value |

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `nr-time-change` | `{ value, timeValue, formattedValue }` | Fired when time changes |
| `nr-clock-open` | - | Fired when clock opens |
| `nr-clock-close` | - | Fired when clock closes |
| `nr-focus` | - | Fired on focus |
| `nr-blur` | - | Fired on blur |
| `nr-validation` | `{ isValid, message }` | Fired on validation |

### CSS Custom Properties

```css
nr-timepicker {
  /* Colors */
  --timepicker-background-color: #ffffff;
  --timepicker-text-color: #1f2937;
  --timepicker-border-color: #d1d5db;
  --timepicker-focus-color: #3b82f6;
  --timepicker-error-color: #ef4444;
  
  /* Sizing */
  --timepicker-height: 40px;
  --timepicker-border-radius: 6px;
  --timepicker-font-size: 14px;
  
  /* Clock specific */
  --timepicker-clock-size: 280px;
  --timepicker-clock-background: #ffffff;
  --timepicker-clock-hand-color: #3b82f6;
}
```

### CSS Parts

| Part | Description |
|------|-------------|
| `time-picker` | Main container |
| `input` | Input field |
| `trigger` | Clock trigger button |
| `dropdown` | Clock dropdown |
| `clock` | Clock face |
| `clock-hand` | Clock hand |
| `time-input` | Digital time inputs |
| `label` | Input label |
| `helper-text` | Helper text |

### Slots

| Slot | Description |
|------|-------------|
| `label` | Label content |
| `helper-text` | Helper text content |
| `icon` | Custom trigger icon |

## Accessibility

The TimePicker component follows WAI-ARIA guidelines:

- Full keyboard navigation support
- Screen reader announcements
- Proper focus management
- ARIA labels and descriptions
- High contrast support

### Keyboard Navigation

- **Tab**: Navigate between elements
- **Enter/Space**: Open/close clock, select time
- **Arrow Keys**: Navigate clock face
- **Escape**: Close clock dropdown
- **Home/End**: Jump to first/last time values

## Styling

The component uses CSS custom properties for theming. You can override colors, sizes, and spacing:

```css
nr-timepicker {
  --timepicker-focus-color: #10b981;
  --timepicker-clock-size: 320px;
}
```

For dark theme support:

```css
[data-theme="dark"] nr-timepicker {
  --timepicker-background-color: #1f2937;
  --timepicker-text-color: #f9fafb;
  --timepicker-border-color: #374151;
}
```

## Browser Support

- Chrome 61+
- Firefox 63+
- Safari 11.1+
- Edge 79+

## License

MIT © Nuraly Team
