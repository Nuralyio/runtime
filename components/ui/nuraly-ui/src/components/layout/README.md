# Layout Components

A complete set of layout components for building page structures. Includes Layout wrapper, Header, Footer, Sider (sidebar), and Content components.

## Installation

```bash
npm install @nuralyui/layout
```

## Components

### Layout
The main layout wrapper that can contain Header, Sider, Content, Footer, or nested Layout components.

### Header
Top layout component with default styling and 64px height.

### Footer
Bottom layout component with default styling.

### Sider
Sidebar component with collapsible functionality, responsive breakpoints, and theme support.

### Content
Main content area component.

## Basic Usage

```html
<nr-layout>
  <nr-header>Header</nr-header>
  <nr-content>Content</nr-content>
  <nr-footer>Footer</nr-footer>
</nr-layout>
```

## Layout with Sidebar

```html
<nr-layout has-sider>
  <nr-sider>Sidebar</nr-sider>
  <nr-layout>
    <nr-header>Header</nr-header>
    <nr-content>Content</nr-content>
    <nr-footer>Footer</nr-footer>
  </nr-layout>
</nr-layout>
```

## React Usage

```jsx
import { NrLayout, NrHeader, NrFooter, NrSider, NrContent } from '@nuralyui/layout/react';

function App() {
  return (
    <NrLayout hasSider>
      <NrSider collapsible>Sidebar</NrSider>
      <NrLayout>
        <NrHeader>Header</NrHeader>
        <NrContent>Content</NrContent>
        <NrFooter>Footer</NrFooter>
      </NrLayout>
    </NrLayout>
  );
}
```

## Layout API

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `hasSider` | `boolean` | `false` | Whether the layout contains a Sider (auto-detected) |

## Header API

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `height` | `string` | `'64px'` | Height of the header |

## Footer API

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `padding` | `string` | `'24px 50px'` | Padding of the footer |

## Sider API

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `breakpoint` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'xxl'` | - | Breakpoint for responsive collapsing |
| `collapsed` | `boolean` | `false` | Current collapsed state (controlled) |
| `collapsedWidth` | `number` | `80` | Width when collapsed (px). Set to 0 for special trigger |
| `collapsible` | `boolean` | `false` | Whether the sider can be collapsed |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state (uncontrolled) |
| `reverseArrow` | `boolean` | `false` | Reverse arrow direction (for right-side sider) |
| `theme` | `'light' \| 'dark'` | `'dark'` | Sider theme |
| `trigger` | `'default' \| null` | `'default'` | Trigger element. Set to null to hide |
| `width` | `number \| string` | `200` | Sider width when expanded |
| `zeroWidthTriggerStyle` | `string` | `''` | Custom styles for zero-width trigger |

### Sider Events

| Event | Detail | Description |
|-------|--------|-------------|
| `collapse` | `{ collapsed: boolean, type: 'clickTrigger' \| 'responsive' }` | Fired when collapsed state changes |
| `breakpoint` | `{ broken: boolean }` | Fired when breakpoint is triggered |

### Breakpoint Values

- `xs`: 480px
- `sm`: 576px
- `md`: 768px
- `lg`: 992px
- `xl`: 1200px
- `xxl`: 1600px

## Examples

### Responsive Sidebar

```html
<nr-layout has-sider>
  <nr-sider 
    collapsible 
    breakpoint="lg"
    collapsed-width="0"
  >
    Navigation Menu
  </nr-sider>
  <nr-content>Main Content</nr-content>
</nr-layout>
```

### Custom Trigger

```html
<nr-sider collapsible trigger="null">
  <div slot="trigger">
    <button>Toggle</button>
  </div>
  Sidebar Content
</nr-sider>
```

### Light Theme Sidebar

```html
<nr-sider theme="light" collapsible>
  Navigation
</nr-sider>
```

### Header-Sidebar Layout

```html
<nr-layout>
  <nr-header>
    <div>Logo</div>
    <nav>Top Navigation</nav>
  </nr-header>
  <nr-layout has-sider>
    <nr-sider collapsible>Side Menu</nr-sider>
    <nr-content>Content</nr-content>
  </nr-layout>
</nr-layout>
```

## CSS Custom Properties

The layout components use the shared NuralyUI theme system. Theme variables are defined in `src/shared/themes/`.

### Available Theme Variables

**General:**
- `--nuraly-color-background`: Background color for layout and content
- `--nuraly-color-text`: Text color
- `--nuraly-color-border`: Border color
- `--nuraly-spacing-06`: Spacing unit (24px default)

**Header:**
- `--nuraly-color-secondary-dark`: Header background (default: #161616)
- `--nuraly-color-text-on-color`: Header text color (default: white)

**Sider:**
- `--nuraly-color-secondary-dark`: Dark theme background (default: #161616)
- `--nuraly-color-secondary`: Trigger background (default: #393939)
- `--nuraly-color-background`: Light theme background (default: white)
- `--nuraly-color-text-on-color`: Dark theme text color
- `--nuraly-border-width-1`: Border width (default: 1px)

**Typography:**
- `--nuraly-font-size-02`: Base font size (default: 14px)

To customize the layout appearance, override these theme variables at the root level or use one of the provided themes (carbon-light, carbon-dark, default-light, default-dark).

## Browser Support

Modern browsers with Web Components support (Chrome, Firefox, Safari, Edge).
