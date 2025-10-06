# Popconfirm Component

A pop-up confirmation dialog triggered by user interaction. Provides a simple and compact way to ask for user confirmation before performing an action.

## Installation

```bash
npm install @nuralyui/popconfirm
```

## Usage

### Basic Popconfirm

```html
<nr-popconfirm
  title="Are you sure delete this task?"
  ok-text="Yes"
  cancel-text="No">
  <button slot="trigger">Delete</button>
</nr-popconfirm>

<script>
  const popconfirm = document.querySelector('nr-popconfirm');
  popconfirm.addEventListener('nr-confirm', () => {
    console.log('Confirmed!');
  });
  popconfirm.addEventListener('nr-cancel', () => {
    console.log('Cancelled!');
  });
</script>
```

### With Description

```html
<nr-popconfirm
  title="Delete the task"
  description="Are you sure you want to delete this task? This action cannot be undone."
  ok-type="danger"
  ok-text="Delete"
  cancel-text="Cancel">
  <button slot="trigger">Delete Task</button>
</nr-popconfirm>
```

### Custom Icon

```html
<nr-popconfirm
  title="Change status?"
  icon="question-circle"
  icon-color="#1890ff"
  ok-text="Yes"
  cancel-text="No">
  <button slot="trigger">Change Status</button>
</nr-popconfirm>
```

### Different Placements

```html
<!-- Top placement -->
<nr-popconfirm
  title="Are you sure?"
  placement="top">
  <button slot="trigger">Top</button>
</nr-popconfirm>

<!-- Bottom placement -->
<nr-popconfirm
  title="Are you sure?"
  placement="bottom">
  <button slot="trigger">Bottom</button>
</nr-popconfirm>

<!-- Left placement -->
<nr-popconfirm
  title="Are you sure?"
  placement="left">
  <button slot="trigger">Left</button>
</nr-popconfirm>

<!-- Right placement -->
<nr-popconfirm
  title="Are you sure?"
  placement="right">
  <button slot="trigger">Right</button>
</nr-popconfirm>
```

### Without Cancel Button

```html
<nr-popconfirm
  title="Click to proceed"
  show-cancel="false"
  ok-text="Proceed">
  <button slot="trigger">Proceed</button>
</nr-popconfirm>
```

### Async Confirmation

```html
<nr-popconfirm
  title="Submit form?"
  description="This will save your changes."
  ok-text="Submit">
  <button slot="trigger">Submit Form</button>
</nr-popconfirm>

<script>
  const popconfirm = document.querySelector('nr-popconfirm');
  popconfirm.addEventListener('nr-confirm', async (e) => {
    // The OK button will show loading state
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Form submitted!');
  });
</script>
```

### Different Button Types

```html
<!-- Primary OK button (default) -->
<nr-popconfirm
  title="Continue?"
  ok-type="primary">
  <button slot="trigger">Primary</button>
</nr-popconfirm>

<!-- Danger OK button -->
<nr-popconfirm
  title="Delete item?"
  ok-type="danger">
  <button slot="trigger">Danger</button>
</nr-popconfirm>

<!-- Secondary OK button -->
<nr-popconfirm
  title="Update settings?"
  ok-type="secondary">
  <button slot="trigger">Secondary</button>
</nr-popconfirm>
```

### Hover Trigger

```html
<nr-popconfirm
  title="Hover to see this"
  trigger="hover">
  <span slot="trigger">Hover me</span>
</nr-popconfirm>
```

### Conditional Trigger

```html
<nr-popconfirm
  id="conditional-popconfirm"
  title="Delete the task">
  <button slot="trigger">Delete a task</button>
</nr-popconfirm>

<label>
  <input type="checkbox" id="condition-checkbox" />
  Whether directly execute
</label>

<script>
  const popconfirm = document.getElementById('conditional-popconfirm');
  const checkbox = document.getElementById('condition-checkbox');
  
  popconfirm.addEventListener('nr-confirm', () => {
    if (checkbox.checked) {
      console.log('Executed directly');
    } else {
      console.log('Confirmation required');
    }
  });
  
  // Disable popconfirm when checkbox is checked
  checkbox.addEventListener('change', (e) => {
    popconfirm.disabled = e.target.checked;
  });
</script>
```

## React Usage

```jsx
import { NrPopconfirm } from '@nuralyui/popconfirm/react';

function App() {
  const handleConfirm = () => {
    console.log('Confirmed!');
  };

  const handleCancel = () => {
    console.log('Cancelled!');
  };

  const handleAsyncConfirm = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Async operation completed!');
  };

  return (
    <>
      {/* Basic popconfirm */}
      <NrPopconfirm
        title="Are you sure delete this task?"
        okText="Yes"
        cancelText="No"
        onConfirm={handleConfirm}
        onCancel={handleCancel}>
        <button slot="trigger">Delete</button>
      </NrPopconfirm>

      {/* With description */}
      <NrPopconfirm
        title="Delete the task"
        description="This action cannot be undone."
        okType="danger"
        onConfirm={handleConfirm}>
        <button slot="trigger">Delete</button>
      </NrPopconfirm>

      {/* Async confirmation */}
      <NrPopconfirm
        title="Submit form?"
        onConfirm={handleAsyncConfirm}>
        <button slot="trigger">Submit</button>
      </NrPopconfirm>

      {/* Custom icon */}
      <NrPopconfirm
        title="Important action"
        icon="info-circle"
        iconColor="#1890ff">
        <button slot="trigger">Info</button>
      </NrPopconfirm>
    </>
  );
}
```

## API

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `string` | `''` | Title of the confirmation box |
| `description` | `string` | `''` | Description of the confirmation box |
| `okText` | `string` | `'OK'` | Text of the OK button |
| `cancelText` | `string` | `'Cancel'` | Text of the Cancel button |
| `okType` | `PopconfirmButtonType` | `'primary'` | Button type of the OK button |
| `showCancel` | `boolean` | `true` | Show cancel button |
| `icon` | `string` | `'exclamation-circle'` | Icon name for the confirmation box |
| `iconColor` | `string` | `''` | Custom icon color |
| `placement` | `PopconfirmPlacement` | `'top'` | Placement of the popconfirm |
| `trigger` | `PopconfirmTrigger` | `'click'` | Trigger mode |
| `disabled` | `boolean` | `false` | Whether the popconfirm is disabled |
| `arrow` | `boolean` | `true` | Whether to show arrow |
| `open` | `boolean` | `false` | Whether the popconfirm is open |

### PopconfirmPlacement Enum

```typescript
enum PopconfirmPlacement {
  Top = 'top',
  TopStart = 'top-start',
  TopEnd = 'top-end',
  Bottom = 'bottom',
  BottomStart = 'bottom-start',
  BottomEnd = 'bottom-end',
  Left = 'left',
  LeftStart = 'left-start',
  LeftEnd = 'left-end',
  Right = 'right',
  RightStart = 'right-start',
  RightEnd = 'right-end',
}
```

### PopconfirmTrigger Enum

```typescript
enum PopconfirmTrigger {
  Click = 'click',
  Hover = 'hover',
  Focus = 'focus',
}
```

### PopconfirmButtonType Enum

```typescript
enum PopconfirmButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
  Default = 'default',
}
```

### PopconfirmIcon Enum

```typescript
enum PopconfirmIcon {
  Warning = 'exclamation-circle',
  Question = 'question-circle',
  Info = 'info-circle',
  Error = 'close-circle',
  Success = 'check-circle',
}
```

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `nr-confirm` | `{ originalEvent: Event }` | Fired when user confirms the action |
| `nr-cancel` | `{ originalEvent: Event }` | Fired when user cancels the action |
| `nr-open-change` | `{ open: boolean }` | Fired when popconfirm visibility changes |

### CSS Custom Properties

| Property | Description | Default |
|----------|-------------|---------|
| `--nuraly-popconfirm-icon-color` | Custom icon color | `var(--nuraly-color-text)` |

### Slots

| Slot | Description |
|------|-------------|
| `trigger` | Element that triggers the popconfirm |

## Examples

### Delete Confirmation

```html
<nr-popconfirm
  title="Delete this item?"
  description="This action cannot be undone."
  ok-type="danger"
  ok-text="Delete"
  cancel-text="Cancel">
  <button slot="trigger" style="background: #ff4d4f; color: white;">
    Delete Item
  </button>
</nr-popconfirm>
```

### Save Confirmation

```html
<nr-popconfirm
  title="Save changes?"
  description="Your changes will be saved to the server."
  icon="check-circle"
  icon-color="#52c41a"
  ok-text="Save"
  cancel-text="Don't Save">
  <button slot="trigger">Save</button>
</nr-popconfirm>
```

### Logout Confirmation

```html
<nr-popconfirm
  title="Logout?"
  description="You will be logged out of your account."
  icon="question-circle"
  placement="bottom"
  ok-text="Logout"
  cancel-text="Stay">
  <button slot="trigger">Logout</button>
</nr-popconfirm>
```

## Accessibility

- Keyboard navigation support (Enter to confirm, Escape to cancel)
- ARIA labels for screen readers
- Focus management
- Proper color contrast ratios

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT © Nuraly, Laabidi Aymen
