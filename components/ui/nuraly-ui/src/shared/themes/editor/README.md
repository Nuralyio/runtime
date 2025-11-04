# Editor Theme

A professional, -inspired editor theme for Nuraly UI Library. This theme features dark panel aesthetics, modern design elements, and excellent readability - perfect for visual editors, admin panels, and professional tools.

## Features

- 🎨 **Dark Panel Aesthetic**: Professional dark panels with light content areas
- 🎯 **Modern Blue Accents**: Clean #4a90e2 primary color for actions and highlights
- 📐 **Professional Typography**: System fonts optimized for readability
- 🌓 **Light & Dark Modes**: Full support for both light and dark themes
- ✨ **Subtle Effects**: Modern shadows, smooth transitions, and refined borders
- 🔧 **Editor-Optimized**: Designed for visual editors and development tools

## Color Palette

### Primary Colors
- **Primary**: `#4a90e2` - Modern blue for primary actions
- **Secondary**: `#6c757d` - Neutral gray for secondary elements
- **Success**: `#28a745` - Green for success states
- **Warning**: `#ffc107` - Amber for warnings
- **Danger**: `#dc3545` - Red for errors and destructive actions
- **Info**: `#17a2b8` - Cyan for informational messages

### Background Colors
- **Main Canvas**: `#f8f9fa` (light mode) / `#1e1e1e` (dark mode)
- **Side Panels**: `#2b2d30` - Dark editor panels
- **Toolbar**: `#35373a` - Toolbar background
- **Hover**: `#3a3d40` - Interactive element hover state

### Text Colors
- **Primary Text**: `#333333` (light) / `#e8e8e8` (dark)
- **Panel Text**: `#e8e8e8` - Text on dark panels
- **Secondary Text**: `#606060` (light) / `#abb2bf` (dark)
- **Muted Text**: `#6c757d` - Less prominent text

## Usage

### Import the Theme

```html
<!-- In your HTML -->
<link rel="stylesheet" href="path/to/themes/editor.css">
```

```javascript
// In your JavaScript/TypeScript
import '@nuralyui/themes/editor.css';
```

```css
/* In your CSS */
@import '@nuralyui/themes/editor.css';
```

### Apply Theme Modes

```html
<!-- Light mode (default or explicit) -->
<div data-theme="editor-light">
  <nr-button type="primary">Click Me</nr-button>
  <nr-input placeholder="Enter text"></nr-input>
</div>

<!-- Dark mode -->
<div data-theme="editor-dark">
  <nr-button type="primary">Click Me</nr-button>
  <nr-input placeholder="Enter text"></nr-input>
</div>

<!-- Dark theme card -->
<div data-theme="editor-dark">
  <nr-card header="Dark Card">
    <p>Content in dark theme</p>
  </nr-card>
</div>
```

### Editor Layout Example

```html
<div class="editor-layout">
  <!-- Left panel -->
  <aside class="editor-panel">
    <div class="editor-toolbar">
      <nr-button size="small" type="text">File</nr-button>
      <nr-button size="small" type="text">Edit</nr-button>
    </div>
    <nav>
      <nr-menu>
        <nr-menu-item icon="folder">Project</nr-menu-item>
        <nr-menu-item icon="settings">Settings</nr-menu-item>
      </nr-menu>
    </nav>
  </aside>
  
  <!-- Main canvas -->
  <main class="editor-canvas">
    <nr-card>
      <h2>Content Area</h2>
      <p>Your main content goes here</p>
    </nr-card>
  </main>
  
  <!-- Right panel -->
  <aside class="editor-panel">
    <div class="editor-toolbar">
      <span>Properties</span>
    </div>
    <div>
      <nr-input label="Width" value="100%"></nr-input>
      <nr-select label="Display" value="block"></nr-select>
    </div>
  </aside>
</div>

<style>
  .editor-layout {
    display: flex;
    height: 100vh;
    gap: 0;
  }
  
  .editor-panel {
    width: 260px;
    background: var(--nuraly-color-background-panel);
    color: var(--nuraly-color-text-panel);
    border-right: 1px solid var(--nuraly-color-border-panel);
  }
  
  .editor-canvas {
    flex: 1;
    background: var(--nuraly-color-background);
    padding: 24px;
    overflow: auto;
  }
</style>
```

## Component Support

The editor theme includes optimized styles for:

- ✅ **Button** - All variants (primary, secondary, success, danger, warning, text)
- ✅ **Input** - Text inputs with focus states and validation
- ✅ **Select** - Dropdown selects with styled options
- ✅ **Modal** - Dialogs and modals with backdrop
- ✅ **Card** - Content cards with headers and footers
- ✅ **Tabs** - Tab navigation with active indicators
- ✅ **Dropdown** - Dropdown menus with hover states

## Customization

### Override CSS Variables

```css
:root {
  /* Change primary color */
  --nuraly-color-primary: #0066cc;
  
  /* Adjust panel background */
  --nuraly-color-background-panel: #1a1c1e;
  
  /* Customize border radius */
  --nuraly-border-radius-md: 6px;
  
  /* Modify shadows */
  --nuraly-shadow-panel: 2px 0 12px rgba(0, 0, 0, 0.2);
}
```

### Create Custom Panel Styles

```css
.custom-editor-panel {
  background: var(--nuraly-color-background-panel);
  color: var(--nuraly-color-text-panel);
  border: 1px solid var(--nuraly-color-border-panel);
  border-radius: var(--nuraly-border-radius-lg);
  padding: var(--nuraly-spacing-lg);
  box-shadow: var(--nuraly-shadow-panel);
}
```

## Design Inspiration

This theme is inspired by professional code editors and visual builders like:
- 
- Visual Studio Code
- Chrome DevTools
- Webflow Editor
- Figma

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## License

Part of the Nuraly UI Library. See main library license for details.
