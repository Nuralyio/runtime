# Datepicker Component

A comprehensive date picker component with support for single date selection, date ranges, and multiple calendar modes.

## Features

- **Single Date Selection**: Choose individual dates
- **Date Range Selection**: Select date ranges with intuitive UI
- **Multiple Calendar Modes**: Days, months, and years view
- **Keyboard Navigation**: Full keyboard accessibility
- **Theme Support**: Dark/light theme integration
- **Validation**: Date validation and constraints
- **Localization**: Support for multiple locales
- **Custom Formatting**: Flexible date display formats

## Basic Usage

```html
<hy-datepicker 
  label="Select Date"
  field-format="DD/MM/YYYY">
</hy-datepicker>
```

## Range Picker

```html
<hy-datepicker 
  range
  label="Select Date Range">
</hy-datepicker>
```

## API

### Properties

- `value` - Current selected date/dates
- `range` - Enable range selection
- `disabled` - Disable the component
- `size` - Component size (small, medium, large)
- `field-format` - Date display format
- `min-date` - Minimum selectable date
- `max-date` - Maximum selectable date
- `locale` - Locale for date formatting

### Events

- `nr-date-change` - Fired when a date is selected
- `nr-range-change` - Fired when a date range is selected
- `nr-calendar-open` - Fired when calendar opens
- `nr-calendar-close` - Fired when calendar closes

### CSS Custom Properties

The component supports extensive theming through CSS custom properties. See the style variables file for the complete list of customizable properties.

## Examples

See the demo folder for comprehensive examples of different configurations and use cases.