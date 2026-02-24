# Timeline Component

Vertical display timeline for showing a series of events in chronological order. When a series of information needs to be ordered by time (ascending or descending).

## Installation

```bash
npm install @nuralyui/timeline
```

## Usage

### Basic Timeline

```html
<nr-timeline></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'Create a services site', label: '2015-09-01' },
    { children: 'Solve initial network problems', label: '2015-09-01' },
    { children: 'Technical testing', label: '2015-09-01' },
    { children: 'Network problems being solved', label: '2015-09-01' }
  ];
</script>
```

### With Custom Colors

```html
<nr-timeline></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'Create a services site', color: 'green' },
    { children: 'Solve initial network problems', color: 'blue' },
    { children: 'Technical testing', color: 'red' },
    { children: 'Network problems being solved', color: 'gray' }
  ];
</script>
```

### With Custom Icons

```html
<nr-timeline></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'Create a services site', dot: 'clock-circle' },
    { children: 'Solve initial network problems', dot: 'check-circle' },
    { children: 'Technical testing', dot: 'close-circle' }
  ];
</script>
```

### Alternate Mode

```html
<nr-timeline mode="alternate"></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'Create a services site', label: '2015-09-01' },
    { children: 'Solve initial network problems', label: '2015-09-01' },
    { children: 'Technical testing', label: '2015-09-01' }
  ];
</script>
```

### Right Mode

```html
<nr-timeline mode="right"></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'Create a services site', label: '2015-09-01' },
    { children: 'Solve initial network problems', label: '2015-09-01' }
  ];
</script>
```

### With Pending State

```html
<nr-timeline pending="Recording..."></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'Create a services site', label: '2015-09-01' },
    { children: 'Solve initial network problems', label: '2015-09-01' },
    { children: 'Technical testing', label: '2015-09-01' }
  ];
</script>
```

### With Custom Pending Dot

```html
<nr-timeline pending="Loading..." pending-dot="loading"></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'Step 1 completed' },
    { children: 'Step 2 completed' },
    { children: 'Step 3 in progress' }
  ];
</script>
```

### Reverse Order

```html
<nr-timeline reverse></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'First event', label: '2015-09-01' },
    { children: 'Second event', label: '2015-09-02' },
    { children: 'Third event', label: '2015-09-03' }
  ];
</script>
```

### Custom Position in Alternate Mode

```html
<nr-timeline mode="alternate"></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'Left side', position: 'left' },
    { children: 'Right side', position: 'right' },
    { children: 'Left side again', position: 'left' }
  ];
</script>
```

## React Usage

```jsx
import { NrTimeline } from '@nuralyui/timeline/react';
function App() {
  const items = [
    { children: 'Create a services site', label: '2015-09-01' },
    { children: 'Solve initial network problems', label: '2015-09-01' },
    { children: 'Technical testing', label: '2015-09-01' }
  ];
  return (
    <>
      {/* Basic timeline */}
      <NrTimeline items={items} />
      {/* Alternate mode */}
      <NrTimeline mode="alternate" items={items} />
      {/* With pending */}
      <NrTimeline items={items} pending="Recording..." />
      {/* Reverse */}
      <NrTimeline items={items} reverse />
    </>
  );
}
```

## API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `items` | `TimelineItem[]` | `[]` | Array of timeline items |
| `mode` | `TimelineMode` | `'left'` | Timeline display mode (left, right, alternate) |
| `pending` | `string` | `undefined` | Pending state content |
| `pendingDot` | `string` | `undefined` | Custom pending dot icon name |
| `reverse` | `boolean` | `false` | Reverse timeline order |

### TimelineItem Interface

```typescript
interface TimelineItem {
  children: string;              // Item content
  label?: string;                // Optional label (timestamp, date, etc.)
  color?: TimelineItemColor | string;  // Dot color (preset or custom)
  dot?: string;                  // Custom dot icon name
  position?: TimelineItemPosition;  // Custom position in alternate mode
  className?: string;            // Custom class name
}
```

### TimelineMode Enum

```typescript
enum TimelineMode {
  Left = 'left',
  Right = 'right',
  Alternate = 'alternate',
}
```

### TimelineItemColor Enum

```typescript
enum TimelineItemColor {
  Blue = 'blue',
  Red = 'red',
  Green = 'green',
  Gray = 'gray',
}
```

### TimelineItemPosition Enum

```typescript
enum TimelineItemPosition {
  Left = 'left',
  Right = 'right',
}
```

### CSS Custom Properties

| Property | Description | Default |
|----------|-------------|---------|
| `--nuraly-timeline-item-padding-bottom` | Bottom padding of timeline item | `20px` |
| `--nuraly-timeline-tail-width` | Width of connecting line | `2px` |
| `--nuraly-timeline-tail-color` | Color of connecting line | `rgba(5, 5, 5, 0.06)` |
| `--nuraly-timeline-dot-bg` | Background color of dot | `#ffffff` |
| `--nuraly-timeline-dot-border-width` | Border width of dot | `2px` |

## Examples

### Project Timeline

```html
<nr-timeline></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { 
      children: 'Project kickoff meeting', 
      label: '2024-01-01',
      color: 'green'
    },
    { 
      children: 'Requirements gathering completed', 
      label: '2024-01-15',
      color: 'green'
    },
    { 
      children: 'Development phase started', 
      label: '2024-02-01',
      color: 'blue'
    },
    { 
      children: 'Testing in progress', 
      label: '2024-03-01',
      color: 'blue',
      dot: 'clock-circle'
    }
  ];
  timeline.pending = 'Launch scheduled';
</script>
```

### Status Timeline

```html
<nr-timeline></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { children: 'Order placed', color: 'green', dot: 'check-circle' },
    { children: 'Order confirmed', color: 'green', dot: 'check-circle' },
    { children: 'In transit', color: 'blue', dot: 'clock-circle' },
    { children: 'Out for delivery', color: 'gray' }
  ];
</script>
```

### Conversation History

```html
<nr-timeline mode="alternate"></nr-timeline>

<script>
  const timeline = document.querySelector('nr-timeline');
  timeline.items = [
    { 
      children: 'User sent message', 
      label: '09:00 AM',
      position: 'left'
    },
    { 
      children: 'Support replied', 
      label: '09:05 AM',
      position: 'right'
    },
    { 
      children: 'User responded', 
      label: '09:10 AM',
      position: 'left'
    },
    { 
      children: 'Issue resolved', 
      label: '09:15 AM',
      position: 'right',
      color: 'green'
    }
  ];
</script>
```

## Accessibility

- Semantic HTML structure with proper list elements
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
