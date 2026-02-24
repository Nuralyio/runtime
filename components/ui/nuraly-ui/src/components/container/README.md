# @nuralyui/container

Container layout component for NuralyUI library. Provides flexible container layouts with support for fluid, boxed, and fixed width configurations.

## Installation

```bash
npm install @nuralyui/container
```

## Usage

### Basic Container

```html
<nr-container>
  <div>Content goes here</div>
</nr-container>
```

### Boxed Layout (Centered with Max-Width)

```html
<nr-container layout="boxed" size="lg">
  <div>Centered content with max-width of 1024px</div>
</nr-container>
```

### Column Layout with Gap

```html
<nr-container direction="column" gap="16">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</nr-container>
```

### Centered Content

```html
<nr-container justify="center" align="center" min-height="300px">
  <div>Centered both vertically and horizontally</div>
</nr-container>
```

### Row Layout with Alignment

```html
<nr-container direction="row" justify="space-between" align="center">
  <div>Left</div>
  <div>Center</div>
  <div>Right</div>
</nr-container>
```

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `layout` | `'fluid' \| 'boxed' \| 'fixed'` | `'fluid'` | Layout type |
| `direction` | `'row' \| 'column'` | `'column'` | Flex direction |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'lg'` | Size preset for boxed/fixed layouts |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `''` | Padding preset |
| `justify` | `'flex-start' \| 'flex-end' \| 'center' \| 'space-between' \| 'space-around' \| 'space-evenly'` | `''` | Justify content |
| `align` | `'flex-start' \| 'flex-end' \| 'center' \| 'baseline' \| 'stretch'` | `''` | Align items |
| `gap` | `number \| 'small' \| 'medium' \| 'large' \| string` | `0` | Gap between items |
| `wrap` | `boolean` | `false` | Enable flex wrap |
| `width` | `string` | `''` | Custom width (overrides size) |
| `height` | `string` | `''` | Custom height |
| `min-height` | `string` | `''` | Custom min-height |

## Size Presets

| Size | Max Width |
|------|-----------|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `full` | 100% |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--nuraly-container-background` | `transparent` | Container background |
| `--nuraly-container-sm` | `640px` | Small container max-width |
| `--nuraly-container-md` | `768px` | Medium container max-width |
| `--nuraly-container-lg` | `1024px` | Large container max-width |
| `--nuraly-container-xl` | `1280px` | Extra large container max-width |

## License

MIT
