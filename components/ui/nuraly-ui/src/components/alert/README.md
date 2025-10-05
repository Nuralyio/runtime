# Alert Component

Alert component for displaying important messages with different severity levels, icons, and closable functionality. Similar to Ant Design's Alert component.

## Installation

```bash
npm install @nuralyui/alert
```

## Usage

### Basic Usage

```html
<nr-alert message="Success message" type="success"></nr-alert>
<nr-alert message="Info message" type="info"></nr-alert>
<nr-alert message="Warning message" type="warning"></nr-alert>
<nr-alert message="Error message" type="error"></nr-alert>
```

### With Icon

```html
<nr-alert 
  message="Success Tips" 
  type="success" 
  show-icon
></nr-alert>
```

### With Description

```html
<nr-alert 
  message="Success Text"
  description="Success Description Success Description Success Description"
  type="success"
  show-icon
></nr-alert>
```

### Closable

```html
<nr-alert 
  message="Success message that can be dismissed" 
  type="success" 
  closable
  show-icon
></nr-alert>
```

### Banner Mode

```html
<nr-alert 
  message="Warning: This is a warning notice about copywriting." 
  type="warning"
  banner
></nr-alert>
```

### With Custom Icon

```html
<nr-alert 
  message="Custom icon alert" 
  type="success" 
  show-icon
  icon="smile"
></nr-alert>
```

### With Action Buttons

```html
<nr-alert 
  message="Success Tips"
  description="Detailed description and advice about successful copywriting."
  type="success"
  show-icon
  closable
>
  <div slot="action">
    <nr-button size="small" type="primary">Accept</nr-button>
  </div>
</nr-alert>
```

### Custom Content

```html
<nr-alert type="success" show-icon closable>
  <div>
    <strong>Custom Content</strong>
    <p>You can put any HTML content here.</p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
    </ul>
  </div>
</nr-alert>
```

## React Usage

```tsx
import { NrAlert } from '@nuralyui/alert/react';

function App() {
  return (
    <>
      <NrAlert message="Success message" type="success" />
      <NrAlert 
        message="Success Tips"
        description="Detailed description"
        type="success"
        showIcon
        closable
        onNrAlertClose={(e) => console.log('Alert closed', e.detail)}
      />
    </>
  );
}
```

## Properties

| Property | Attribute | Type | Default | Description |
|----------|-----------|------|---------|-------------|
| `message` | `message` | `string` | `''` | Alert message text |
| `type` | `type` | `'success' \| 'info' \| 'warning' \| 'error'` | `'info'` | Alert type/variant |
| `description` | `description` | `string` | `''` | Optional description text |
| `closable` | `closable` | `boolean` | `false` | Whether the alert can be closed |
| `showIcon` | `show-icon` | `boolean` | `false` | Whether to show icon |
| `icon` | `icon` | `string` | `''` | Custom icon name |
| `banner` | `banner` | `boolean` | `false` | Banner mode - full width with no border radius |

## Methods

| Method | Description |
|--------|-------------|
| `close()` | Programmatically close the alert |

## Events

| Event | Description | Detail |
|-------|-------------|--------|
| `nr-alert-close` | Fired when alert is closed | `{ message: string, type: AlertType }` |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Custom content (overrides message/description) |
| `icon` | Custom icon slot |
| `action` | Custom action buttons or links |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--nuraly-color-success` | Success color |
| `--nuraly-color-success-light` | Success background color |
| `--nuraly-color-success-dark` | Success text color |
| `--nuraly-color-info` | Info color |
| `--nuraly-color-info-light` | Info background color |
| `--nuraly-color-info-dark` | Info text color |
| `--nuraly-color-warning` | Warning color |
| `--nuraly-color-warning-light` | Warning background color |
| `--nuraly-color-warning-dark` | Warning text color |
| `--nuraly-color-error` | Error color |
| `--nuraly-color-error-light` | Error background color |
| `--nuraly-color-error-dark` | Error text color |

## Examples

### Real-world Use Cases

#### Form Submission Success
```html
<nr-alert 
  message="Your changes have been saved successfully!"
  type="success"
  show-icon
  closable
></nr-alert>
```

#### System Notification
```html
<nr-alert 
  message="System Maintenance Scheduled"
  description="The system will be under maintenance from 2:00 AM to 4:00 AM on Sunday."
  type="info"
  show-icon
  banner
></nr-alert>
```

#### Security Warning
```html
<nr-alert 
  message="Unusual Login Activity Detected"
  description="We detected a login from a new device. If this wasn't you, please secure your account."
  type="warning"
  show-icon
  closable
>
  <div slot="action">
    <nr-button size="small" type="primary">Review Activity</nr-button>
  </div>
</nr-alert>
```

## Best Practices

### When to use Alert
- Display important information that requires user attention
- Show feedback about system status or user actions
- Communicate warnings, errors, or success messages
- Display banner notifications across the top of a page

### When NOT to use Alert
- For temporary feedback messages (use Toast instead)
- For critical actions that require user confirmation (use Modal instead)
- For inline form validation (use Input validation states instead)

## License

ISC

## Author

Labidi Aymen
