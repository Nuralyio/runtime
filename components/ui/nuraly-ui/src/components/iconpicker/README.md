# nr-icon-picker

Advanced icon picker component for Nuraly UI with search, virtual scrolling, and accessibility features.

## Features

- 🔍 **Search filtering** - Fast icon search with debouncing
- ⚡ **Virtual scrolling** - Smooth performance with 1500+ icons
- ♿ **Accessible** - Full keyboard navigation and ARIA support
- 🎨 **Customizable** - CSS custom properties for theming
- 📦 **Dropdown integration** - Uses `nr-dropdown` for positioning
- 🎯 **Lucide icons** - Built-in support for 1500+ beautiful Lucide icons

## Installation

```bash
npm install @nuralyui/iconpicker
```

## Basic Usage

```html
<nr-icon-picker></nr-icon-picker>
```

## With Value

```html
<nr-icon-picker value="heart"></nr-icon-picker>
```

## Configuration

```html
<nr-icon-picker
  value="star"
  size="large"
  placement="top"
  show-search
  show-clear
  @nr-icon-picker-change="${handleChange}">
</nr-icon-picker>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `string` | `''` | Selected icon name |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Component size |
| `placement` | `string` | `'auto'` | Dropdown placement |
| `trigger` | `'click' \| 'hover' \| 'manual'` | `'manual'` | Dropdown trigger |
| `disabled` | `boolean` | `false` | Disable component |
| `readonly` | `boolean` | `false` | Read-only mode |
| `placeholder` | `string` | `'Select icon'` | Placeholder text |
| `show-search` | `boolean` | `true` | Show search input |
| `show-clear` | `boolean` | `true` | Show clear button |
| `max-visible` | `number` | `500` | Max icons to render |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `nr-icon-picker-change` | `{value, icon}` | Icon selection changed |
| `nr-icon-picker-open` | `{}` | Dropdown opened |
| `nr-icon-picker-close` | `{}` | Dropdown closed |
| `nr-icon-picker-search` | `{query}` | Search query changed |
| `nr-icon-picker-clear` | `{}` | Selection cleared |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--icon-picker-dropdown-width` | `320px` | Dropdown width |
| `--icon-picker-icon-size` | `24px` | Icon size |
| `--icon-picker-selected-bg` | Theme color | Selected background |
| `--icon-picker-selected-border` | Theme color | Selected border |

## Examples

### Custom Styling

```html
<nr-icon-picker
  style="
    --icon-picker-dropdown-width: 400px;
    --icon-picker-icon-size: 32px;
    --icon-picker-selected-bg: #ff6b6b;
  ">
</nr-icon-picker>
```

### With Event Handlers

```javascript
const picker = document.querySelector('nr-icon-picker');

picker.addEventListener('nr-icon-picker-change', (e) => {
  console.log('Selected:', e.detail.value);
  console.log('Icon data:', e.detail.icon);
});
```

## License

MIT © Nuraly, Laabidi Aymen
