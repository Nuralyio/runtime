## Context

NuralyUI has 47 components using Shadow DOM + 1684 CSS custom properties. This makes it nearly impossible for an LLM to generate style overrides because:
1. Shadow DOM blocks external CSS from reaching component internals
2. An LLM would need to know the exact variable name from 1684 options
3. Variable indirection hides actual applied values

**Goal**: Make component styling dead-simple so an LLM can write plain CSS overrides like:
```css
nr-button[type="primary"] button { background: red; border-radius: 8px; }
```

**How**:
- **Light DOM** — no shadow barrier, external CSS reaches internals
- **CSS `@layer`** — component defaults in a base layer, overrides always win
- **Direct CSS values** — no variable indirection, plain readable CSS

---

## Architecture

### Layer structure
```css
@layer nuraly.base, nuraly.components;

/* Component defaults — lowest priority */
@layer nuraly.components {
  nr-button { display: inline-block; }
  nr-button button { background: #0f62fe; color: #fff; height: 2.5rem; ... }
}

/* LLM or user overrides — no @layer = automatic highest priority */
nr-button button { background: red; }
```

CSS outside any `@layer` always beats layered CSS — so LLM-generated overrides just work without knowing about layers at all.

### Dark mode
Keep a small set of CSS vars (~10) only for light/dark switching. Everything else is direct values.

```css
:root {
  --nr-text: #161616;
  --nr-bg: #ffffff;
  --nr-primary: #0f62fe;
  --nr-danger: #da1e28;
  --nr-success: #198038;
  --nr-border: #e0e0e0;
  --nr-surface: #ffffff;
}
[data-theme="dark"] {
  --nr-text: #f4f4f4;
  --nr-bg: #161616;
  --nr-primary: #78a9ff;
  --nr-danger: #ff8389;
  --nr-success: #42be65;
  --nr-border: #393939;
  --nr-surface: #262626;
}
```

Components reference these ~10 vars only for properties that truly flip between themes (text color, background, border). Everything else is a direct value.

---

## Phase 1: Light DOM Infrastructure

### 1.1 Base mixin — switch to Light DOM

**File**: `src/shared/base-mixin.ts`

```typescript
export const NuralyUIBaseMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class LightDomBase extends superClass {
    createRenderRoot() { return this; }
  }
  return DependencyValidationMixin(ThemeAwareMixin(EventHandlerMixin(LightDomBase)));
};
```

### 1.2 Style injection — inject CSS into document once per tag

**File**: `src/shared/style-injector.ts` (new)

```typescript
const injected = new Set<string>();

export function injectStyles(tag: string, cssText: string) {
  if (injected.has(tag)) return;
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssText);
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  injected.add(tag);
}
```

Hook into base mixin `connectedCallback` — reads `static styles`, converts to string, injects.

### 1.3 Theme mixin cleanup

**File**: `src/shared/theme-mixin.ts`

- `this.closest('[data-theme]')` works in Light DOM — keep as-is
- Remove `createThemeStyles()` helper (uses `:host`)

---

## Phase 2: Minimal Theme Tokens

### 2.1 New tokens file

**File**: `src/shared/themes/tokens.css` (new, ~30 lines)

Only vars needed for dark/light switching:
```css
:root {
  --nr-text: #161616;
  --nr-text-secondary: #525252;
  --nr-text-on-color: #ffffff;
  --nr-bg: #ffffff;
  --nr-bg-hover: #f4f4f4;
  --nr-primary: #0f62fe;
  --nr-danger: #da1e28;
  --nr-success: #198038;
  --nr-warning: #f1c21b;
  --nr-border: #e0e0e0;
  --nr-surface: #ffffff;
  --nr-disabled: #c6c6c6;
  --nr-focus: #0f62fe;
}
[data-theme="dark"] { /* dark overrides */ }
```

### 2.2 Delete old theme files

Replace `packages/themes/dist/carbon.css` (1684 vars), `default.css`, `editor.css` with the single minimal tokens file.

---

## Phase 3: CSS Transformation (47 style files)

### Selector rules

| Before (Shadow DOM) | After (Light DOM @layer) |
|---|---|
| `:host { ... }` | `nr-{name} { ... }` |
| `:host([attr="x"]) el` | `nr-{name}[attr="x"] el` |
| `var(--nuraly-color-button-primary)` | `#0f62fe` (direct) |
| `var(--nuraly-color-text)` | `var(--nr-text)` (only for theme-flipping props) |

### Example: label.style.ts

**Before** (70 lines):
```typescript
export default css`
  :host { display: inline-block; }
  :host([size="small"]) label { font-size: var(--nuraly-label-small-font-size); }
  :host([variant="error"]) label { color: var(--nuraly-label-error-color); }
  :host([disabled]) label { color: var(--nuraly-label-disabled-color); cursor: not-allowed; }
`;
```

**After** (~40 lines):
```typescript
export const styles = css`
  @layer nuraly.components {
    nr-label { display: inline-block; }
    nr-label label {
      font-family: 'IBM Plex Sans', sans-serif;
      font-size: 0.875rem;
      color: var(--nr-text);
      cursor: pointer;
    }
    nr-label[size="small"] label { font-size: 0.75rem; }
    nr-label[size="large"] label { font-size: 1rem; }
    nr-label[variant="error"] label { color: #da1e28; }
    nr-label[variant="success"] label { color: #198038; }
    nr-label[disabled] label { color: var(--nr-disabled); cursor: not-allowed; opacity: 0.6; }
  }
`;
```

An LLM can now override: `nr-label label { font-size: 1.5rem; color: blue; }` — done.

### Example: button.style.ts

**Before** (537 lines with 64 variable references):
```typescript
:host([type="primary"]) button {
  background-color: var(--nuraly-color-button-primary);
  color: var(--nuraly-color-button-primary-text, var(--nuraly-color-text-on-color));
  &:hover { background-color: var(--nuraly-color-button-primary-hover); }
}
```

**After** (~150 lines, direct values):
```typescript
@layer nuraly.components {
  nr-button button {
    display: inline-flex; align-items: center;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    height: 2.5rem;
    padding: 0.5rem 1rem;
    border: 1px solid transparent;
    border-radius: 0;
    cursor: pointer;
    transition: all 110ms ease;
    color: var(--nr-text);
    background: var(--nr-bg);
  }
  nr-button[type="primary"] button {
    background: var(--nr-primary);
    color: var(--nr-text-on-color);
  }
  nr-button[type="primary"] button:hover:not(:disabled) { background: #0353e9; }
  nr-button[type="primary"] button:active:not(:disabled) { background: #002d9c; }
  nr-button[type="danger"] button { background: var(--nr-danger); color: var(--nr-text-on-color); }
  nr-button[type="danger"] button:hover:not(:disabled) { background: #ba1b23; }
  nr-button[size="small"] button { height: 2rem; padding: 0.375rem 0.75rem; font-size: 0.75rem; }
  nr-button[size="large"] button { height: 3rem; padding: 0.5rem 1.5rem; font-size: 1rem; }
  nr-button[shape="round"] button { border-radius: 9999px; }
  nr-button[shape="circle"] button { border-radius: 50%; width: 2.5rem; padding: 0; }
  nr-button:disabled button { background: var(--nr-disabled); color: #8d8d8d; cursor: not-allowed; }
}
```

---

## Phase 4: Component File Updates (47 files)

Each `*.component.ts`:
1. Keep `static styles` — base mixin now injects it to document via `adoptedStyleSheets`
2. Remove manual `data-theme` attribute setting where present
3. `<slot>` works in Light DOM — no changes needed

---

## Phase 5: Test & Infrastructure Updates

### Tests
- `el.shadowRoot!.querySelector(...)` → `el.querySelector(...)`
- Global find-replace across test files

### React wrappers
- `@lit-labs/react` `createComponent()` works with Light DOM — no change

### Build
- `rollup.config.js` — optionally extract CSS to standalone `.css` files per component
- Theme build script — regenerate from minimal tokens

---

## Migration Order

| Wave | Components | Count |
|---|---|---|
| 1 (validate) | label, divider, badge, tag, icon, image, video, skeleton | 8 |
| 2 (interactive) | button, input, textarea, checkbox, radio, radio-group, alert, tooltip, breadcrumb, slider-input | 10 |
| 3 (complex) | select, datepicker, timepicker, colorpicker, file-upload, form, iconpicker, modal, popconfirm, toast, dropdown, menu, tabs, table, carousel, collapse, timeline, card | 18 |
| 4 (layout+special) | container, flex, grid, layout, panel, chatbot, code-editor, console, document, db-connection-select, kv-secret-select | 11 |

---

## Critical Files

| File | Change |
|---|---|
| `src/shared/base-mixin.ts` | `createRenderRoot() { return this; }` |
| `src/shared/style-injector.ts` | New — adoptedStyleSheets injection |
| `src/shared/theme-mixin.ts` | Remove `:host` helpers |
| `src/shared/themes/tokens.css` | New — ~15 CSS vars for dark/light only |
| `src/components/*/*.style.ts` | 47 files — `:host` → tag, vars → direct values, wrap in `@layer` |
| Old theme files (`carbon.css`, `default.css`, `editor.css`) | Delete/replace |

## Verification

- [ ] Migrate Wave 1 components (label, divider, badge)
- [ ] Open Storybook — verify rendering, theme switching
- [ ] Write a plain CSS override outside any `@layer` — confirm it wins
- [ ] Test dark mode toggle
- [ ] Run test suite (after `shadowRoot` query updates)
- [ ] Test in Studio runtime
