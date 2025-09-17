---
mode: agent
---

# NuralyUI Hybrid Component Library Architecture

## Project Structure

The UI components are in the root folder under `src/components/`. Documentation is handled through Storybook stories (`.stories.ts` files) located alongside each component.

### Component Architecture

Each component follows a consistent structure:
```
src/components/[component-name]/
├── [component-name].component.ts    # Main component logic
├── [component-name].style.ts        # Component styles
├── [component-name].types.ts        # TypeScript types and enums
├── [component-name].stories.ts      # Storybook stories (optional)
├── index.ts                         # Main export file
├── package.json                     # Component package definition
├── react.ts                         # React wrapper
├── README.md                        # Component documentation
├── controllers/                     # Component controllers (optional)
│   ├── index.ts
│   └── [controller].controller.ts
├── interfaces/                      # TypeScript interfaces (optional)
├── mixins/                         # Component-specific mixins (optional)
└── test/                           # Component tests (optional)
```

## Base Architecture

### Core Mixins System

All components extend `NuralyUIBaseMixin` which combines three essential mixins:

1. **ThemeAwareMixin** (`src/shared/theme-mixin.ts`)
   - Provides `currentTheme` property for theme detection
   - Supports multiple design systems (carbon, default)
   - Auto-detects `data-theme` attributes from DOM hierarchy
   - Falls back to system preference (prefers-color-scheme)
   - Supported themes:  `carbon-light`, `carbon-dark`, `default-light`, `default-dark`

2. **DependencyValidationMixin** (`src/shared/dependency-mixin.ts`)
   - Validates required component dependencies
   - Uses `requiredComponents` array property
   - Ensures dependent components are loaded before rendering

3. **EventHandlerMixin** (`src/shared/event-handler-mixin.ts`)
   - Provides enhanced event handling capabilities
   - Enables component communication and event management

### Component Base Class

```typescript
@customElement('nr-component')
export class NrComponentElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;
  override requiredComponents = ['nr-icon']; // Dependencies
  
  // Component properties with decorators
  @property({ type: String }) type = 'default';
  @property({ type: Boolean }) disabled = false;
  
  // Component logic
}
```

## Naming Conventions

### Variable Names
- **Properties**: camelCase (`buttonType`, `isDisabled`, `iconPosition`)
- **CSS Classes**: kebab-case with BEM (`button-primary`, `button--loading`)
- **Custom Elements**: `nr-` prefix (`nr-button`, `nr-card`, `nr-input`)
- **Types/Enums**: PascalCase (`ButtonType`, `IconPosition`)
- **Constants**: SCREAMING_SNAKE_CASE (`EMPTY_STRING`, `DEFAULT_SIZE`)

### Component Properties
- Use TypeScript decorators: `@property({ type: String })`
- Provide default values
- Use proper types from component.types.ts
- Follow lit-element property patterns

### File Naming
- **Components**: `[name].component.ts`
- **Styles**: `[name].style.ts`
- **Types**: `[name].types.ts`
- **Stories**: `[name].stories.ts`
- **Tests**: `[name].test.ts`

## Theme System

### Theme Structure
- **Location**: `src/shared/themes/`
- **Design Systems**: Carbon Design System, Default Design System
- **Variants**: Light and Dark for each system
- **CSS Variables**: All styling uses CSS custom properties

### Theme Files
```
src/shared/themes/
├── index.ts                 # Theme system exports
├── carbon.css              # Complete Carbon theme
├── default.css             # Complete Default theme
├── carbon/                 # Carbon theme components
│   ├── button/
│   │   ├── common.css      # Button common variables
│   │   ├── dark.css        # Button dark theme
│   │   ├── index.css       # Button theme entry point
│   │   └── light.css       # Button light theme
│   ├── checkbox/
│   │   ├── common.css      # Checkbox common variables
│   │   ├── dark.css        # Checkbox dark theme
│   │   ├── index.css       # Checkbox theme entry point
│   │   └── light.css       # Checkbox light theme
│   ├── datepicker/
│   │   ├── common.css      # Datepicker common variables
│   │   ├── dark.css        # Datepicker dark theme
│   │   ├── index.css       # Datepicker theme entry point
│   │   └── light.css       # Datepicker light theme
│   ├── icon/
│   │   ├── common.css      # Icon common variables
│   │   ├── dark.css        # Icon dark theme
│   │   ├── index.css       # Icon theme entry point
│   │   └── light.css       # Icon light theme
│   ├── input/
│   │   ├── common.css      # Input common variables
│   │   ├── dark.css        # Input dark theme
│   │   ├── index.css       # Input theme entry point
│   │   └── light.css       # Input light theme
│   └── index.css           # Carbon theme entry point
└── default/                # Default theme components
    └── [similar structure]  # Similar component structure as carbon
```
```

### CSS Variables Pattern
```css
/* Theme-aware styling */
:host {
  color: var(--nuraly-color-text);
  background-color: var(--nuraly-color-background);
  border-color: var(--nuraly-color-border);
}

/* Data attributes for theming */
[data-theme="carbon-dark"]{
  /* Carbon dark specific overrides */
}
```

## Controllers System

Components can use controllers for complex behaviors:

### Controller Types
- **RippleController**: Material Design ripple effects
- **KeyboardController**: Keyboard navigation and shortcuts
- **LinkController**: Link behavior for button components
- **BaseController**: Common controller functionality

### Controller Usage
```typescript
// In component
private rippleController = new ButtonRippleController(this);
private keyboardController = new ButtonKeyboardController(this);

// Controllers are automatically connected/disconnected with component lifecycle
```

## Component Types and Enums

### Type Definition Pattern
```typescript
// Button types example
export const enum ButtonType {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
  Danger = 'danger',
  Default = 'default'
}

export const enum ButtonSize {
  Small = 'small',
  Medium = 'medium', 
  Large = 'large'
}

// Enhanced configuration interfaces
export interface ButtonIconConfig {
  name: string;
  type?: 'solid' | 'regular';
  size?: string;
  color?: string;
  alt?: string;
}
```

## Styling Architecture

### Style Organization
- **Component Styles**: Individual `.style.ts` files
- **Shared Variables**: Theme CSS files
- **No Local Fallbacks**: Clean CSS variable usage
- **Theme Switching**: Automatic theme transition support

### Style Structure
```typescript
export const styles = css`
  :host {
    /* Host-level styles with CSS variables */
    color: var(--nuraly-color-text);
    background: var(--nuraly-color-background);
  }
  
  /* Component-specific styles */
  .component-part {
    /* Use theme variables consistently */
  }
`;
```

## Package Management

### Component Packages
- Each component has its own `package.json`
- Version format: `0.0.x` (increment patch for updates)
- Scoped packages: `@nuralyui/[component-name]`
- ES Module exports with proper export maps

### Package Structure
```json
{
  "name": "@nuralyui/button",
  "version": "0.0.14",
  "type": "module",
  "exports": {
    ".": { "import": "./index.js" },
    "./bundle": { "import": "./bundle.js" }
  }
}
```

## Development Guidelines

### Component Creation Checklist
1. Create component folder with proper structure
2. Extend `NuralyUIBaseMixin(LitElement)`
3. Define types in `.types.ts`
4. Create styles in `.style.ts` using CSS variables
5. Add React wrapper in `react.ts`
6. Update `package.json` version
7. Add to main exports if needed

### Documentation Guidelines
- Documentation is managed through Storybook stories (`.stories.ts` files)
- Each component should have corresponding stories for documentation and testing
- Stories serve as both documentation and interactive examples
- Read existing stories for style and format consistency
- **Important**: Do NOT add empty lines in React.js instructions
- Include comprehensive JSDoc comments in component files
- Provide usage examples in component documentation
- Document all public properties and methods

### Version Management
- **Critical**: Update component's `package.json` version before committing
- Follow semantic versioning for patches
- Coordinate with main package version when needed

### Best Practices
- Use TypeScript strict mode
- Follow accessibility guidelines (ARIA labels, keyboard navigation)
- Implement proper error handling and validation
- Use controllers for complex behaviors
- Test theme switching and system preference changes
- Validate component dependencies