# @nuraly/themes

A comprehensive theme collection for the Nuraly Hybrid UI Library, providing consistent design system variables and styling across different design frameworks.

## Available Themes

- **Carbon** - Based on IBM Carbon Design System
- **Polaris** - Based on Shopify Polaris Design System  
- **Default** - Nuraly's own default theme

## Installation

```bash
npm install @nuraly/themes
```

## Usage

### CSS Import

Import individual themes directly:

```css
/* Import a specific theme */
@import '@nuraly/themes/carbon';
@import '@nuraly/themes/polaris';
@import '@nuraly/themes/default';
```

### JavaScript/TypeScript

```javascript
import { applyTheme, themes } from '@nuraly/themes';

// Apply a theme programmatically
applyTheme('carbon', 'light'); // or 'dark'
applyTheme('polaris', 'dark');

// Get current theme
const currentTheme = getCurrentTheme();

// Available themes
console.log(themes); // { carbon: 'carbon', polaris: 'polaris', default: 'default' }
```

### HTML Data Attributes

Themes are applied via `data-theme` attributes:

```html
<!-- Carbon light theme -->
<html data-theme="carbon-light">

<!-- Carbon dark theme -->
<html data-theme="carbon-dark">

<!-- Polaris light theme -->
<html data-theme="polaris-light">

<!-- Default theme -->
<html data-theme="default-light">
```

## Theme Structure

Each theme provides consistent CSS custom properties for:

### Typography
- Font families, weights, and sizes
- Line heights and letter spacing
- Responsive typography scales

### Colors
- Primary, secondary, success, warning, error palettes
- Background and surface colors
- Text and icon colors
- Border and divider colors
- Both light and dark variants

### Spacing
- Consistent spacing scale
- Component-specific spacing
- Layout margins and padding

### Elevation & Effects
- Box shadow levels
- Border radius values
- Opacity scales
- Transition timings

### Component Variables
- Button-specific variables
- Form control styling
- Navigation elements
- Card and surface styling

## Building from Source

If you need to customize or rebuild the themes:

```bash
# Install dependencies
npm install

# Build all themes
npm run build

# Build and watch for changes
npm run dev

# Clean build directory
npm run clean
```

## Theme Customization

Each theme is built from modular CSS files that can be customized:

```
themes/
├── carbon/
│   ├── theme.css          # Main variables
│   ├── index.css          # Component imports
│   └── button/
│       ├── index.css      # Button theme index
│       ├── light.css      # Light variant
│       └── dark.css       # Dark variant
├── polaris/
│   └── ...
└── default/
    └── ...
```

## Contributing

When adding new themes or modifying existing ones:

1. Follow the established CSS custom property naming convention
2. Ensure both light and dark variants are provided
3. Test across all supported components
4. Run the build process to generate bundled files
5. Update documentation and examples

## License

MIT License - see LICENSE file for details.