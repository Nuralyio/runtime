# Design System Theme Usage

## Overview

The Nuraly UI library now supports design system themes through CSS variables. Instead of using `design-system` attributes on each component, you apply theme CSS files that set all the `--nuraly-*` variables to match your chosen design system.

## Theme Files

Three theme files are available in `/src/shared/themes/`:

- `default.css` - Default Nuraly theme
- `carbon.css` - IBM Carbon Design System theme  
- `polaris.css` - Shopify Polaris Design System theme

## Usage Methods

### Method 1: Import CSS File (Recommended)

Import the theme CSS file in your application entry point:

```html
<!-- In your HTML -->
<link rel="stylesheet" href="path/to/themes/carbon.css">
```

```typescript
// In your TypeScript/JavaScript entry point
import './shared/themes/carbon.css'; // For Carbon theme
// OR
import './shared/themes/polaris.css'; // For Polaris theme  
// OR
import './shared/themes/default.css'; // For default theme
```

### Method 2: Apply Theme to Specific Container

Add a theme class to a container element:

```html
<div class="carbon-theme">
  <!-- All components inside will use Carbon styling -->
  <nr-button type="primary">Carbon Button</nr-button>
  <nr-input label="Carbon Input"></nr-input>
</div>

<div class="polaris-theme">
  <!-- All components inside will use Polaris styling -->
  <nr-button type="primary">Polaris Button</nr-button>
  <nr-input label="Polaris Input"></nr-input>
</div>
```

### Method 3: JavaScript Theme Switching

Use the theme utilities for dynamic theme switching:

```typescript
import { applyGlobalTheme, createThemeSwitcher } from './shared/theme-utils.js';

// Apply theme globally
applyGlobalTheme('carbon');

// Create a theme switcher
const switchTheme = createThemeSwitcher(['carbon', 'polaris']);
const currentTheme = switchTheme(); // Switches to next theme
```

## Component Usage

Once a theme is applied, simply use components without design-system attributes:

```html
<!-- Old way (still works but not recommended) -->
<nr-button design-system="carbon" type="primary">Button</nr-button>

<!-- New way (recommended) -->
<nr-button type="primary">Button</nr-button>
```

The component will automatically read the CSS variables set by the theme.

## Key Benefits

1. **Clean HTML**: No need for `design-system` attributes on every component
2. **Global Theming**: Apply theme once, affects all components
3. **Dynamic Switching**: Easy to switch themes at runtime
4. **CSS-Only**: Can change themes with just CSS imports
5. **Scoped Theming**: Apply different themes to different sections

## Variable Categories

The themes define variables for:

- Typography (`--nuraly-font-family`, `--nuraly-font-weight-*`)
- Colors (`--nuraly-color-*`)
- Spacing (`--nuraly-spacing-*`) 
- Border radius (`--nuraly-border-radius-*`)
- Shadows (`--nuraly-shadow-*`)
- Focus styles (`--nuraly-focus-*`)
- Component sizes (`--nuraly-size-*`)

## Example: Carbon vs Polaris

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Choose one theme -->
  <link rel="stylesheet" href="themes/carbon.css">
  <!-- OR -->
  <!-- <link rel="stylesheet" href="themes/polaris.css"> -->
</head>
<body>
  <!-- Components automatically use theme variables -->
  <nr-button type="primary">Themed Button</nr-button>
  <nr-input label="Themed Input"></nr-input>
</body>
</html>
```

## Carbon Theme Characteristics

- Sharp, square corners (border-radius: 0)
- High contrast colors
- IBM Plex Sans font family
- Minimal shadows
- Strong focus indicators for accessibility

## Polaris Theme Characteristics  

- Rounded corners (border-radius: 0.25rem)
- Shopify green color palette
- System font stack
- Subtle shadows for depth
- Merchant-focused styling
