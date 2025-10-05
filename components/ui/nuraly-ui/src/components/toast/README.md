# Toast Component (@nuralyui/toast)

A versatile and customizable toast notification component built with Lit and TypeScript. Supports multiple types, positions, animations, and stacking.

## Features

- 🎨 Multiple toast types (success, error, warning, info, default)
- 📍 Flexible positioning (6 positions: top/bottom x left/center/right)
- ✨ Multiple animation styles (fade, slide, bounce)
- 📚 Toast stacking with max limit control
- ⏱️ Auto-dismiss with configurable duration
- ❌ Manual close with close button
- 🎯 Accessible by default
- 🌗 Dark/light theme support
- 🔧 Programmatic API
- 🎭 Custom icons and styling

## Installation

```bash
npm install @nuralyui/toast
# or
yarn add @nuralyui/toast
# or
bun add @nuralyui/toast
```

## Usage

### Basic Usage

```html
<script type="module">
  import '@nuralyui/toast';
</script>

<!-- Add toast container to your page -->
<nr-toast id="toast-container"></nr-toast>

<script>
  const toast = document.getElementById('toast-container');
  
  // Show basic toast
  toast.show('Hello World!');
  
  // Show success toast
  toast.success('Operation completed successfully!');
  
  // Show error toast
  toast.error('An error occurred!');
  
  // Show warning toast
  toast.warning('Please be careful!');
  
  // Show info toast
  toast.info('Here is some information');
</script>
```

### Advanced Usage

```html
<nr-toast 
  position="top-right"
  max-toasts="5"
  default-duration="5000"
  animation="slide"
  stack
></nr-toast>

<script>
  const toast = document.querySelector('nr-toast');
  
  // Show toast with custom configuration
  toast.show({
    text: 'Custom toast notification',
    type: 'success',
    duration: 7000,
    closable: true,
    icon: 'check-circle',
    customClass: 'my-custom-toast',
    onClose: () => console.log('Toast closed'),
    onClick: () => console.log('Toast clicked')
  });
  
  // Get toast ID for manual control
  const toastId = toast.show('Persistent toast');
  
  // Remove specific toast
  setTimeout(() => {
    toast.removeToast(toastId);
  }, 3000);
  
  // Clear all toasts
  toast.clearAll();
</script>
```

### React Integration

```jsx
import { NrToast } from '@nuralyui/toast/react';
import { useRef } from 'react';

function App() {
  const toastRef = useRef(null);
  
  const showToast = () => {
    toastRef.current?.show('Hello from React!');
  };
  
  const showSuccess = () => {
    toastRef.current?.success('Success message!');
  };
  
  return (
    <div>
      <button onClick={showToast}>Show Toast</button>
      <button onClick={showSuccess}>Show Success</button>
      
      <NrToast 
        ref={toastRef}
        position="top-right"
        maxToasts={5}
        onNrToastShow={(e) => console.log('Toast shown:', e.detail)}
        onNrToastClose={(e) => console.log('Toast closed:', e.detail)}
      />
    </div>
  );
}
```

### Vue Integration

```vue
<template>
  <div>
    <button @click="showToast">Show Toast</button>
    <button @click="showSuccess">Show Success</button>
    
    <nr-toast 
      ref="toast"
      position="top-right"
      :max-toasts="5"
      @nr-toast-show="handleToastShow"
      @nr-toast-close="handleToastClose"
    ></nr-toast>
  </div>
</template>

<script>
import '@nuralyui/toast';

export default {
  methods: {
    showToast() {
      this.$refs.toast.show('Hello from Vue!');
    },
    showSuccess() {
      this.$refs.toast.success('Success message!');
    },
    handleToastShow(event) {
      console.log('Toast shown:', event.detail);
    },
    handleToastClose(event) {
      console.log('Toast closed:', event.detail);
    }
  }
};
</script>
```

## API Reference

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `position` | `'top-right' \| 'top-left' \| 'top-center' \| 'bottom-right' \| 'bottom-left' \| 'bottom-center'` | `'top-right'` | Position of toast container on screen |
| `maxToasts` | `number` | `5` | Maximum number of toasts to display |
| `defaultDuration` | `number` | `5000` | Default duration in milliseconds |
| `animation` | `'fade' \| 'slide' \| 'bounce'` | `'fade'` | Animation style for toasts |
| `stack` | `boolean` | `true` | Whether to stack toasts or replace |
| `autoDismiss` | `boolean` | `true` | Auto dismiss toasts after duration |

### Methods

#### `show(config: string | ToastConfig): string`

Show a toast notification.

**Parameters:**
- `config`: String message or configuration object

**Returns:** Toast ID for manual control

**Configuration Object:**
```typescript
{
  text?: string;             // Toast message (text or content required)
  content?: TemplateResult;  // Custom HTML content (overrides text)
  type?: ToastType;          // Toast type variant
  duration?: number;         // Duration in milliseconds
  autoDismiss?: boolean;     // Auto dismiss after duration (default: true)
  closable?: boolean;        // Show close button
  icon?: string;             // Icon name
  customClass?: string;      // Custom CSS class
  button?: ToastButton;      // Action button configuration
  onClose?: () => void;      // Close callback
  onClick?: () => void;      // Click callback
}
```

#### `success(text: string, duration?: number): string`

Show a success toast.

#### `error(text: string, duration?: number): string`

Show an error toast.

#### `warning(text: string, duration?: number): string`

Show a warning toast.

#### `info(text: string, duration?: number): string`

Show an info toast.

#### `removeToast(id: string): void`

Remove a specific toast by ID.

#### `clearAll(): void`

Clear all active toasts.

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `nr-toast-show` | `{ toast: ToastItem, action: 'show' }` | Fired when a toast is shown |
| `nr-toast-close` | `{ toast: ToastItem, action: 'close' }` | Fired when a toast is closed |
| `nr-toast-click` | `{ toast: ToastItem, action: 'click' }` | Fired when a toast is clicked |

### CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--nuraly-z-index-toast` | `9999` | Toast z-index |
| `--nuraly-toast-default-background` | Theme-based | Default toast background |
| `--nuraly-toast-success-background` | Theme-based | Success toast background |
| `--nuraly-toast-error-background` | Theme-based | Error toast background |
| `--nuraly-toast-warning-background` | Theme-based | Warning toast background |
| `--nuraly-toast-info-background` | Theme-based | Info toast background |

## Toast Types

### `ToastType`

```typescript
enum ToastType {
  Default = 'default',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info'
}
```

### `ToastPosition`

```typescript
enum ToastPosition {
  TopRight = 'top-right',
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  BottomRight = 'bottom-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center'
}
```

### `ToastAnimation`

```typescript
enum ToastAnimation {
  Fade = 'fade',
  Slide = 'slide',
  Bounce = 'bounce'
}
```

## Examples

### Different Positions

```javascript
// Top positions
toast.show({ text: 'Top right', position: 'top-right' });
toast.show({ text: 'Top left', position: 'top-left' });
toast.show({ text: 'Top center', position: 'top-center' });

// Bottom positions
toast.show({ text: 'Bottom right', position: 'bottom-right' });
toast.show({ text: 'Bottom left', position: 'bottom-left' });
toast.show({ text: 'Bottom center', position: 'bottom-center' });
```

### Different Types

```javascript
toast.show({ text: 'Default message', type: 'default' });
toast.success('Operation successful!');
toast.error('Error occurred!');
toast.warning('Warning message!');
toast.info('Information message!');
```

### Custom Durations

```javascript
// Short duration
toast.show({ text: 'Quick message', duration: 3000 });

// Long duration
toast.show({ text: 'Important message', duration: 10000 });

// Persistent (no auto-dismiss) - Option 1: Set autoDismiss to false
toast.show({ text: 'Manual close only', autoDismiss: false });

// Persistent (no auto-dismiss) - Option 2: Set duration to 0
toast.show({ text: 'Manual close only', duration: 0 });
```

### Disable Auto-Dismiss

```javascript
// Disable auto-dismiss for all toasts in container
const toast = document.querySelector('nr-toast');
toast.autoDismiss = false;

// Or set via HTML attribute
<nr-toast auto-dismiss="false"></nr-toast>

// Disable auto-dismiss for a specific toast
toast.show({ 
  text: 'This toast requires manual closing',
  autoDismiss: false 
});

// Re-enable auto-dismiss for specific toast even if container has it disabled
toast.show({ 
  text: 'This toast will auto-dismiss',
  autoDismiss: true,
  duration: 5000
});
```

### With Callbacks

```javascript
toast.show({
  text: 'Click me or I will close',
  duration: 5000,
  onClick: () => {
    console.log('Toast clicked!');
    // Perform action
  },
  onClose: () => {
    console.log('Toast closed!');
    // Cleanup or analytics
  }
});
```

### Custom Icons

```javascript
toast.show({
  text: 'Custom icon toast',
  type: 'success',
  icon: 'thumbs-up'
});
```

### Custom HTML Content

For advanced use cases like GDPR consent banners, privacy notices, or complex layouts, you can provide custom HTML content:

```javascript
import { html } from 'lit';

// GDPR Cookie Consent Example
toast.show({
  content: html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <div>
        <h4 style="margin: 0 0 0.5rem 0;">🍪 Cookie Consent</h4>
        <p style="margin: 0; font-size: 0.875rem;">
          We use cookies to enhance your browsing experience.
        </p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <nr-button 
          size="small" 
          type="primary"
          @click=${() => {
            console.log('Accepted');
            toast.clearAll();
          }}
        >
          Accept All
        </nr-button>
        <nr-button 
          size="small" 
          type="secondary"
          @click=${() => {
            console.log('Declined');
            toast.clearAll();
          }}
        >
          Decline
        </nr-button>
      </div>
    </div>
  `,
  type: 'info',
  autoDismiss: false,
  closable: true,
  icon: '', // Remove default icon
});

// Privacy Notice Example
toast.show({
  content: html`
    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
      <div style="display: flex; align-items: start; gap: 0.5rem;">
        <nr-icon name="shield-check"></nr-icon>
        <div>
          <h4 style="margin: 0 0 0.25rem 0;">Privacy Policy Updated</h4>
          <p style="margin: 0; font-size: 0.813rem;">
            We've updated our privacy policy to give you more control.
          </p>
        </div>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <nr-button size="small" type="primary">Review Policy</nr-button>
        <nr-button size="small" type="ghost" @click=${() => toast.clearAll()}>
          Got it
        </nr-button>
      </div>
    </div>
  `,
  autoDismiss: false,
  icon: '',
});

// Marketing Consent with Checkboxes
toast.show({
  content: html`
    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
      <h4 style="margin: 0;">📧 Stay Updated</h4>
      <p style="margin: 0; font-size: 0.875rem;">
        Get the latest updates and exclusive offers.
      </p>
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <label style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" id="email-consent" checked />
          <span>Email newsletters</span>
        </label>
        <label style="display: flex; align-items: center; gap: 0.5rem;">
          <input type="checkbox" id="sms-consent" />
          <span>SMS notifications</span>
        </label>
      </div>
      <nr-button 
        size="small" 
        type="primary"
        @click=${() => {
          const emailConsent = document.getElementById('email-consent').checked;
          const smsConsent = document.getElementById('sms-consent').checked;
          console.log('Preferences:', { email: emailConsent, sms: smsConsent });
          toast.clearAll();
        }}
      >
        Save Preferences
      </nr-button>
    </div>
  `,
  autoDismiss: false,
  icon: '',
});
```

**Note:** When using `content`, the `text` property is ignored. The custom content receives full control over the toast's content area.

## Accessibility

The toast component is built with accessibility in mind:

- Uses `role="alert"` for screen reader announcements
- Uses `aria-live="polite"` for non-intrusive notifications
- Close buttons have proper `aria-label` attributes
- Keyboard navigation support for close buttons
- Focus management for interactive elements

## Theming

The toast component automatically adapts to your theme using CSS custom properties. It supports both light and dark themes through the NuralyUI theme system.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Dependencies

- `@nuralyui/icon` - Icon component (peer dependency)
- Lit - Web components framework
- TypeScript - Type definitions

## License

ISC

## Author

Labidi Aymen

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.
