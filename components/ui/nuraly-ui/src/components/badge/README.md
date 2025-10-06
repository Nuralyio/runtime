# Badge Component

Small numerical value or status descriptor for UI elements. Badge normally appears in proximity to notifications or user avatars with eye-catching appeal, typically displaying unread messages count.

## Installation

```bash
npm install @nuralyui/badge
```

## Usage

### Basic Count Badge

```html
<nr-badge count="5">
  <button>Notifications</button>
</nr-badge>

<script>
  // Badge will show the number 5
</script>
```

### Overflow Count

```html
<nr-badge count="100" overflow-count="99">
  <button>Messages</button>
</nr-badge>

<script>
  // Will display "99+" when count exceeds 99
</script>
```

### Dot Badge

```html
<nr-badge dot>
  <nr-icon name="notification"></nr-icon>
</nr-badge>

<script>
  // Shows a simple dot indicator without count
</script>
```

### Show Zero

```html
<nr-badge count="0" show-zero>
  <button>Notifications</button>
</nr-badge>

<script>
  // Badge will display "0" instead of hiding
</script>
```

### Status Badge

```html
<nr-badge status="success" text="Success"></nr-badge>
<nr-badge status="error" text="Error"></nr-badge>
<nr-badge status="processing" text="Processing"></nr-badge>
<nr-badge status="warning" text="Warning"></nr-badge>
<nr-badge status="default" text="Default"></nr-badge>
```

### Custom Colors

```html
<!-- Preset colors -->
<nr-badge count="5" color="pink">
  <button>Pink</button>
</nr-badge>

<nr-badge count="5" color="red">
  <button>Red</button>
</nr-badge>

<nr-badge count="5" color="blue">
  <button>Blue</button>
</nr-badge>

<!-- Custom hex color -->
<nr-badge count="5" color="#f50">
  <button>Custom</button>
</nr-badge>

<!-- RGB color -->
<nr-badge count="5" color="rgb(45, 183, 245)">
  <button>RGB</button>
</nr-badge>
```

### Standalone Badge

```html
<!-- Badge without children -->
<nr-badge count="25"></nr-badge>
<nr-badge count="100" overflow-count="99"></nr-badge>
<nr-badge dot></nr-badge>
```

### Ribbon Badge

```html
<nr-badge ribbon="Recommended">
  <div class="card" style="width: 300px; padding: 20px; border: 1px solid #ddd;">
    <h3>Card Title</h3>
    <p>Card content with a ribbon badge</p>
  </div>
</nr-badge>

<!-- Ribbon with custom color -->
<nr-badge ribbon="New" color="green" ribbon-placement="start">
  <div class="card">Card content</div>
</nr-badge>
```

### Size Variants

```html
<nr-badge count="5" size="default">
  <button>Default Size</button>
</nr-badge>

<nr-badge count="5" size="small">
  <button>Small Size</button>
</nr-badge>
```

### Offset

```html
<script>
  // Set custom offset [x, y]
  const badge = document.querySelector('nr-badge');
  badge.offset = [10, -10];
</script>

<nr-badge count="5">
  <button>With Offset</button>
</nr-badge>
```

## React Usage

```jsx
import { NrBadge } from '@nuralyui/badge/react';
function App() {
  return (
    <>
      {/* Count badge */}
      <NrBadge count={5}>
        <button>Notifications</button>
      </NrBadge>
      {/* Dot badge */}
      <NrBadge dot>
        <span>Icon</span>
      </NrBadge>
      {/* Status badge */}
      <NrBadge status="success" text="Success" />
      {/* Ribbon badge */}
      <NrBadge ribbon="Recommended" color="blue">
        <div className="card">Card content</div>
      </NrBadge>
      {/* Custom color */}
      <NrBadge count={10} color="#f50">
        <button>Custom</button>
      </NrBadge>
    </>
  );
}
```

## API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `count` | `number` | `undefined` | Number to show in badge |
| `dot` | `boolean` | `false` | Whether to display a dot instead of count |
| `overflowCount` | `number` | `99` | Max count to show (shows count+ when exceeded) |
| `showZero` | `boolean` | `false` | Whether to show badge when count is zero |
| `offset` | `[number, number]` | `undefined` | Set offset of the badge dot [x, y] |
| `color` | `BadgeColor \| string` | `undefined` | Badge color (preset or custom hex/rgb) |
| `size` | `BadgeSize` | `'default'` | Badge size |
| `status` | `BadgeStatus` | `undefined` | Set Badge as a status dot |
| `text` | `string` | `undefined` | Status text to display |
| `badgeTitle` | `string` | `undefined` | Title to show on hover |
| `ribbon` | `string` | `undefined` | Ribbon text (enables ribbon mode) |
| `ribbonPlacement` | `RibbonPlacement` | `'end'` | Ribbon placement (start or end) |

### BadgeStatus Enum

```typescript
enum BadgeStatus {
  Success = 'success',
  Processing = 'processing',
  Default = 'default',
  Error = 'error',
  Warning = 'warning',
}
```

### BadgeSize Enum

```typescript
enum BadgeSize {
  Default = 'default',
  Small = 'small',
}
```

### BadgeColor Enum

```typescript
enum BadgeColor {
  Pink = 'pink',
  Red = 'red',
  Yellow = 'yellow',
  Orange = 'orange',
  Cyan = 'cyan',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
  Geekblue = 'geekblue',
  Magenta = 'magenta',
  Volcano = 'volcano',
  Gold = 'gold',
  Lime = 'lime',
}
```

### RibbonPlacement Enum

```typescript
enum RibbonPlacement {
  Start = 'start',
  End = 'end',
}
```

### Slots

| Slot | Description |
|------|-------------|
| default | Content to wrap with badge (avatar, icon, etc.) |

### CSS Custom Properties

| Property | Description | Default |
|----------|-------------|---------|
| `--nuraly-badge-text-font-size` | Font size of badge text | `12px` |
| `--nuraly-badge-text-font-weight` | Font weight of badge text | `normal` |
| `--nuraly-badge-indicator-height` | Height of badge indicator | `20px` |
| `--nuraly-badge-indicator-height-sm` | Height of small badge | `14px` |
| `--nuraly-badge-indicator-z-index` | Z-index of badge | `auto` |
| `--nuraly-badge-dot-size` | Size of dot badge | `6px` |
| `--nuraly-badge-status-size` | Size of status indicator | `6px` |

## Examples

### Notification Badge

```html
<nr-badge count="12">
  <nr-icon name="notification"></nr-icon>
</nr-badge>
```

### Avatar Badge

```html
<nr-badge dot>
  <img src="avatar.jpg" alt="User" style="width: 40px; height: 40px; border-radius: 50%;" />
</nr-badge>
```

### Menu Badge

```html
<nr-badge count="5" color="blue">
  <a href="/messages">Messages</a>
</nr-badge>
```

### Card with Ribbon

```html
<nr-badge ribbon="Hot" color="red">
  <div class="product-card">
    <h3>Product Name</h3>
    <p>$99.99</p>
  </div>
</nr-badge>
```

## Accessibility

- Uses appropriate ARIA labels for screen readers
- Supports keyboard navigation
- Color is not the only means of conveying information
- Proper contrast ratios for all color variants

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT © Nuraly, Laabidi Aymen
