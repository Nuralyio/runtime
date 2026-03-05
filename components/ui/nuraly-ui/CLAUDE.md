# NuralyUI — Component Library

## What is this

NuralyUI is a framework-agnostic web component library built with Lit and TypeScript. It provides 47+ components used by the Nuraly Studio frontend. Components are published to npm under `@nuralyui/*` and mirrored to the public repo `Nuralyio/NuralyUI`.

## Architecture

```
nuraly-ui/
├── packages/
│   ├── common/          @nuralyui/common  — mixins, controllers, themes, utils
│   ├── forms/           @nuralyui/forms   — form input component bundle
│   ├── layout/          @nuralyui/layout  — layout component bundle
│   └── themes/          @nuralyui/themes  — CSS theme files
├── src/
│   ├── components/      47+ individual components
│   └── @types/          global type declarations
├── .storybook/          Storybook 8.6 config (web-components-vite)
├── rollup.config.js     per-component bundling
└── tsconfig.json        TypeScript 5.7, ES2015 target
```

## Component Pattern

Every component follows this structure:

```
src/components/{name}/
├── {name}.component.ts    # Lit web component (@customElement)
├── {name}.style.ts        # CSS-in-JS styles (tagged template)
├── {name}.types.ts        # TypeScript interfaces & enums
├── {name}.stories.ts      # Storybook stories
├── index.ts               # Public exports
├── package.json           # NPM package descriptor
├── react.ts               # React wrapper (@lit-labs/react)
└── README.md              # Component docs
```

### Component Class Pattern

```typescript
@customElement('nr-{name}')
export class Nr{Name}Element extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  @property({ type: String, reflect: true })
  variant: Variant = Variant.Default;

  private someController = new SomeController(this);

  override render() {
    return html`...`;
  }
}
```

- **Tag prefix**: `nr-` (e.g., `nr-button`, `nr-input`)
- **Class naming**: `Nr{PascalName}Element` (e.g., `NrButtonElement`)
- **Base mixin**: Always extend `NuralyUIBaseMixin(LitElement)` — combines theme awareness, dependency validation, and event handling
- **Properties**: Use `@property()` with `reflect: true` for attribute-reflected props
- **Styles**: Import from `{name}.style.ts`, assign to `static override styles`
- **Controllers**: Use Lit reactive controllers for reusable behavior

### React Wrapper Pattern

```typescript
// react.ts
import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrButtonElement } from './button.component.js';

export const NrButton = createComponent({
  tagName: 'nr-button',
  elementClass: NrButtonElement,
  react: React,
  events: { click: 'click' },
});
```

### Storybook Story Pattern

```typescript
const meta: Meta = {
  title: 'Category/ComponentName',
  component: 'nr-component',
  tags: ['autodocs'],
  argTypes: { /* controls */ },
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { /* defaults */ },
  render: (args) => html`<nr-component ...>${args.text}</nr-component>`,
};
```

**Story categories**: General, Data Entry, Data Display, Feedback, Navigation

## Shared Infrastructure (packages/common)

### Mixins

| Mixin | Purpose |
|-------|---------|
| `NuralyUIBaseMixin` | Primary mixin — combines all base mixins below |
| `ThemeAwareMixin` | Detects `data-theme` attribute, watches for changes |
| `DependencyValidationMixin` | Validates required sibling component dependencies |
| `EventHandlerMixin` | Common event dispatching utilities |

### Controllers

| Controller | Purpose |
|-----------|---------|
| `ThemeController` | Observes theme changes via MutationObserver |
| `DropdownController` | Shared dropdown positioning and visibility |
| `BaseValidationController` | Shared form validation logic |

### Theming

- **6 theme variants**: `default-light`, `default-dark`, `carbon-light`, `carbon-dark`, `editor-light`, `editor-dark`
- **Implementation**: CSS custom properties (`var(--nuraly-color-button-primary)`)
- **Detection**: `getCurrentTheme()` walks up DOM for `data-theme` attribute
- **Switching**: `applyTheme(variant)` / `toggleThemeVariant()`
- **Theme CSS files**: built by `packages/themes` → `default.css`, `carbon.css`, `editor.css`
- Components reference theme variables in their `.style.ts` files

## Components (47 total)

### General
button, icon, divider, label, tag, badge, image, video

### Data Entry (Forms)
input, textarea, checkbox, radio, radio-group, select, slider-input, datepicker, timepicker, colorpicker, file-upload, form, iconpicker

### Data Display
table, carousel, collapse, skeleton, timeline, canvas

### Feedback
alert, modal, popconfirm, toast, tooltips

### Navigation
breadcrumb, dropdown, menu, tabs

### Layout
card, container, flex, grid, layout, panel

### Specialized
chatbot, code-editor, console, document, db-connection-select, kv-secret-select

## Build System

### Build Pipeline

```bash
npm run build
# 1. common:compile  → tsc packages/common
# 2. tsc             → compile all src/ to dist/
# 3. roll            → rollup per-component bundles
# 4. packages:build  → build common, themes, forms, layout packages
```

### Rollup

- Auto-discovers components from `dist/src/components/`
- Generates `bundle.js` per component (ESM, minified, gzipped)
- Externalizes: `lit`, `@nuralyui/common`, `socket.io-client`, `monaco-editor`
- Plugins: node-resolve, terser (ecma 2017), gzip

### Key Scripts

| Script | Purpose |
|--------|---------|
| `npm run build` | Full build (compile + bundle + packages) |
| `npm run build:watch` | Watch mode TypeScript compilation |
| `npm run storybook` | Build + launch Storybook on port 6006 |
| `npm run build-storybook` | Build static Storybook |
| `npm run lint` | Run lit-analyzer + ESLint |
| `npm run test` | Run tests (production mode) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run format` | Prettier formatting |

## NPM Publishing

- **Organization**: `@nuralyui`
- **Packages published**: `@nuralyui/common`, `@nuralyui/forms`, `@nuralyui/layout`, `@nuralyui/themes`, plus individual `@nuralyui/{component}` packages
- **prepublishOnly** hook runs build automatically
- **Exports**: ESM (.js) + TypeScript declarations (.d.ts)
- **React**: Each bundle exports `./react` entry with all React wrappers

## Development

### Prerequisites
- Node.js (see `.nvmrc`)
- This library lives inside the Studio service monorepo but has its own npm workspace

### Running Locally
```bash
npm install           # install deps (run inside container)
npm run storybook     # builds + launches Storybook at :6006
npm run build:watch   # watch mode for TypeScript changes
```

### Creating a New Component

1. Create directory `src/components/{name}/`
2. Create files following the component pattern above
3. Tag name: `nr-{name}`, class: `Nr{PascalName}Element`
4. Extend `NuralyUIBaseMixin(LitElement)`
5. Use CSS custom properties from the theme system
6. Add `react.ts` wrapper with `createComponent()`
7. Write Storybook story with autodocs tag
8. Add to the appropriate bundle package (forms/layout) if applicable

### Styling Rules

- Use CSS custom properties (`var(--nuraly-*)`) for theming
- Support both light and dark theme variants
- Use BEM naming for internal CSS classes
- Components must be responsive
- No hard-coded colors — always reference theme variables

### Testing

- Framework: `@open-wc/testing` with Web Test Runner
- Accessibility: WCAG 2.1 AA compliance required
- Test files go in component's `test/` subdirectory

## Don't

- Don't hard-code colors — use theme CSS custom properties
- Don't skip the `NuralyUIBaseMixin` — all components need theme awareness
- Don't forget the `react.ts` wrapper when adding a component
- Don't use `this.style` — use `static override styles` with tagged templates
- Don't add dependencies without externalizing them in `rollup.config.js`
- Don't modify theme CSS directly — edit theme source in `packages/themes`
- Don't run npm commands on the host — use Docker containers
