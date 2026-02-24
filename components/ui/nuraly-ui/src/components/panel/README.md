# Panel Component

A versatile panel component that can transform between docked panel and floating window modes. Perfect for tool palettes, settings panels, chat windows, and any UI that needs flexible positioning.

## Features

- **Dual Mode**: Transform between panel (docked) and window (floating) modes
- **Draggable**: Drag windows around the screen (window mode only)
- **Resizable**: Resize panels dynamically with drag handles
- **Collapsible**: Collapse/expand panel content
- **Minimizable**: Minimize to compact view
- **Multiple Positions**: Dock to left, right, top, or bottom (panel mode)
- **Size Presets**: Small, medium, large, or custom dimensions
- **Theme Support**: Light and dark mode compatible
- **Customizable**: Header, footer, and body slots

## Installation

```bash
npm install @nuralyui/panel
```

## Basic Usage

```html
<!-- Docked panel -->
<nr-panel
  title="Settings"
  icon="settings"
  mode="panel"
  position="right"
  size="medium">
  <p>Panel content here</p>
</nr-panel>

<!-- Floating window -->
<nr-panel
  title="Tool Window"
  mode="window"
  draggable
  resizable
  size="medium">
  <p>Window content here</p>
</nr-panel>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'panel' \| 'window' \| 'minimized'` | `'panel'` | Panel display mode |
| `size` | `'small' \| 'medium' \| 'large' \| 'custom'` | `'medium'` | Panel size preset |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Panel position (panel mode only) |
| `draggable` | `boolean` | `true` | Whether the panel can be dragged (window mode only) |
| `resizable` | `boolean` | `false` | Whether the panel is resizable |
| `collapsible` | `boolean` | `false` | Whether the panel content can be collapsed |
| `minimizable` | `boolean` | `true` | Whether the panel can be minimized |
| `closable` | `boolean` | `true` | Whether the panel can be closed |
| `title` | `string` | `''` | Panel title |
| `icon` | `string` | `''` | Header icon name |
| `width` | `string` | `''` | Custom width (CSS value) |
| `height` | `string` | `''` | Custom height (CSS value) |
| `open` | `boolean` | `true` | Whether the panel is visible |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `panel-mode-change` | `{ mode, previousMode }` | Fired when panel mode changes |
| `panel-close` | `void` | Fired when panel is closed |
| `panel-minimize` | `void` | Fired when panel is minimized |
| `panel-maximize` | `void` | Fired when panel is maximized/restored |
| `panel-drag-start` | `{ x, y }` | Fired when panel drag starts |
| `panel-drag-end` | `{ x, y }` | Fired when panel drag ends |
| `panel-resize` | `{ width, height }` | Fired when panel is resized |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Panel body content |
| `header` | Custom header content (replaces title) |
| `footer` | Custom footer content |

## Methods

| Method | Description |
|--------|-------------|
| `transformToWindow()` | Transform panel to window mode |
| `transformToPanel()` | Transform panel to panel mode |
| `minimize()` | Minimize panel |
| `maximize()` | Maximize/restore panel |
| `close()` | Close panel |
| `toggleCollapse()` | Toggle collapsed state |

## Examples

### Chat Panel

```html
<nr-panel
  title="Team Chat"
  icon="message-circle"
  mode="panel"
  position="right"
  size="small">
  <div class="chat-messages">
    <!-- Chat messages -->
  </div>
  <div slot="footer">
    <input type="text" placeholder="Type a message...">
  </div>
</nr-panel>
```

### Draggable Tool Window

```html
<nr-panel
  title="Color Picker"
  icon="droplet"
  mode="window"
  draggable
  resizable
  size="small">
  <div class="color-palette">
    <!-- Color picker UI -->
  </div>
</nr-panel>
```

### Settings Panel with Footer

```html
<nr-panel
  title="Preferences"
  icon="settings"
  mode="panel"
  position="left"
  collapsible
  size="medium">
  <div class="settings-form">
    <!-- Settings controls -->
  </div>
  <div slot="footer">
    <button>Cancel</button>
    <button>Save</button>
  </div>
</nr-panel>
```

### Console Output Panel

```html
<nr-panel
  title="Console"
  icon="terminal"
  mode="panel"
  position="bottom"
  collapsible
  size="medium">
  <div class="console-output">
    <!-- Console output -->
  </div>
</nr-panel>
```

## Styling

The component uses CSS custom properties for styling:

```css
nr-panel {
  --nuraly-panel-background: #ffffff;
  --nuraly-panel-border-color: #e0e0e0;
  --nuraly-panel-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  --nuraly-panel-header-background: #f5f5f5;
  --nuraly-panel-header-text-color: #1a1a1a;
  --nuraly-panel-padding: 1rem;
  --nuraly-panel-header-padding: 0.75rem 1rem;
  --nuraly-panel-font-family: Inter, sans-serif;
  --nuraly-panel-header-font-size: 1.125rem;
  --nuraly-panel-header-font-weight: 600;
  --nuraly-panel-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Use Cases

1. **Tool Windows**: Draggable floating windows for tools and utilities
2. **Settings Panels**: Docked panels for application settings
3. **Chat Interfaces**: Side panels for team communication
4. **Property Inspectors**: Panels showing object properties
5. **Notification Centers**: Panels for displaying notifications
6. **Command Palettes**: Quick access tool panels
7. **Documentation Viewers**: Side-by-side documentation panels
8. **Console/Terminal Output**: Bottom-docked panels for logs

## Best Practices

1. Use **panel mode** for primary navigation or persistent tools
2. Use **window mode** for secondary, non-blocking interfaces
3. Enable **draggable** for windows that users might want to reposition
4. Enable **resizable** when content might vary in size
5. Use **minimize** for temporary panel hiding without losing state
6. Provide clear **titles** for better accessibility
7. Use appropriate **position** for the panel's purpose (e.g., chat on right, console on bottom)
8. Consider **collapsible** for panels with secondary information

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT © Nuraly, Laabidi Aymen
