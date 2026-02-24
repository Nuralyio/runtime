# Grid System

A flexible and responsive grid layout system inspired by Ant Design, consisting of Row and Col components built with Web Components and Lit.

## Components

### Nr-Row
Container component that creates a flex row layout.

### Nr-Col
Column component that works within a Row to create responsive layouts.

## Features

- **24-column grid system** - Standard grid with 24 columns for flexible layouts
- **Responsive breakpoints** - xs, sm, md, lg, xl, xxl (matching Ant Design)
- **Flexible gutters** - Support for horizontal and vertical spacing
- **Alignment options** - Vertical and horizontal alignment control
- **Order control** - Change visual order of columns
- **Offset support** - Add spacing before columns
- **Push/Pull** - Position columns relatively
- **Flex layout** - Support for flex auto, none, and custom values
- **Theme-aware** - Integrates with NuralyUI theme system

## Basic Usage

### HTML
```html
<!-- Basic two-column layout -->
<nr-row>
  <nr-col span="12">Column 1</nr-col>
  <nr-col span="12">Column 2</nr-col>
</nr-row>

<!-- Three columns with gutter -->
<nr-row gutter="16">
  <nr-col span="8">Column 1</nr-col>
  <nr-col span="8">Column 2</nr-col>
  <nr-col span="8">Column 3</nr-col>
</nr-row>

<!-- Responsive columns -->
<nr-row>
  <nr-col xs="24" sm="12" md="8" lg="6">Responsive</nr-col>
  <nr-col xs="24" sm="12" md="8" lg="6">Responsive</nr-col>
  <nr-col xs="24" sm="12" md="8" lg="6">Responsive</nr-col>
  <nr-col xs="24" sm="12" md="8" lg="6">Responsive</nr-col>
</nr-row>
```

### React
```jsx
import { NrRow, NrCol } from '@nuralyui/grid/react';

function MyComponent() {
  return (
    <NrRow gutter={16}>
      <NrCol span={12}>Column 1</NrCol>
      <NrCol span={12}>Column 2</NrCol>
    </NrRow>
  );
}
```

## Row API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `gutter` | `number \| [number, number] \| object` | `0` | Grid spacing. Can be a number, [horizontal, vertical] array, or responsive object |
| `align` | `'top' \| 'middle' \| 'bottom' \| 'stretch'` | - | Vertical alignment of columns |
| `justify` | `'start' \| 'end' \| 'center' \| 'space-around' \| 'space-between' \| 'space-evenly'` | - | Horizontal alignment of columns |
| `wrap` | `boolean` | `true` | Whether to wrap columns |

### Examples

```html
<!-- Gutter as number -->
<nr-row gutter="16">...</nr-row>

<!-- Gutter with horizontal and vertical -->
<nr-row .gutter=${[16, 24]}>...</nr-row>

<!-- Responsive gutter -->
<nr-row .gutter=${{ xs: 8, sm: 16, md: 24, lg: 32 }}>...</nr-row>

<!-- Alignment -->
<nr-row align="middle" justify="center">...</nr-row>
```

## Col API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `span` | `number` | - | Number of columns (1-24) |
| `offset` | `number` | `0` | Number of columns to offset |
| `order` | `number` | - | Order of the column |
| `pull` | `number` | `0` | Number of columns to pull from right |
| `push` | `number` | `0` | Number of columns to push from left |
| `flex` | `number \| 'auto' \| 'none' \| string` | - | Flex layout style |
| `xs` | `number \| object` | - | <576px responsive configuration |
| `sm` | `number \| object` | - | ≥576px responsive configuration |
| `md` | `number \| object` | - | ≥768px responsive configuration |
| `lg` | `number \| object` | - | ≥992px responsive configuration |
| `xl` | `number \| object` | - | ≥1200px responsive configuration |
| `xxl` | `number \| object` | - | ≥1600px responsive configuration |

### Examples

```html
<!-- Basic span -->
<nr-col span="12">Half width</nr-col>

<!-- With offset -->
<nr-col span="12" offset="6">Offset by 6 columns</nr-col>

<!-- Responsive (simple) -->
<nr-col xs="24" sm="12" md="8" lg="6">Responsive</nr-col>

<!-- Responsive (advanced) -->
<nr-col .md=${{ span: 8, offset: 2 }} .lg=${{ span: 6, offset: 3 }}>
  Advanced responsive
</nr-col>

<!-- Order -->
<nr-col span="6" order="4">Last</nr-col>
<nr-col span="6" order="1">First</nr-col>

<!-- Flex -->
<nr-col flex="auto">Auto flex</nr-col>
<nr-col flex="1">Flex 1</nr-col>
<nr-col flex="100px">Fixed 100px</nr-col>
```

## Responsive Breakpoints

The grid system uses the following breakpoints:

| Breakpoint | Value | Device |
|------------|-------|--------|
| `xs` | <576px | Extra small (phones) |
| `sm` | ≥576px | Small (tablets) |
| `md` | ≥768px | Medium (small laptops) |
| `lg` | ≥992px | Large (desktops) |
| `xl` | ≥1200px | Extra large (large desktops) |
| `xxl` | ≥1600px | Extra extra large (ultra-wide) |

## Advanced Examples

### Complex Responsive Layout
```html
<nr-row .gutter=${{ xs: 8, sm: 16, md: 24 }}>
  <nr-col xs="24" md="12" lg="8">
    <div>Content 1</div>
  </nr-col>
  <nr-col xs="24" md="12" lg="8">
    <div>Content 2</div>
  </nr-col>
  <nr-col xs="24" md="24" lg="8">
    <div>Content 3</div>
  </nr-col>
</nr-row>
```

### Column Order
```html
<nr-row>
  <nr-col span="6" order="4">1 (order-4)</nr-col>
  <nr-col span="6" order="3">2 (order-3)</nr-col>
  <nr-col span="6" order="2">3 (order-2)</nr-col>
  <nr-col span="6" order="1">4 (order-1)</nr-col>
</nr-row>
```

### Flex Layout
```html
<nr-row>
  <nr-col flex="100px">100px</nr-col>
  <nr-col flex="auto">Auto (fills remaining)</nr-col>
</nr-row>
```

## Browser Support

Works in all modern browsers that support:
- Web Components
- ES6 Modules
- CSS Flexbox
- ResizeObserver

## License

MIT
