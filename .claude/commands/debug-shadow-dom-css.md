# Debug Shadow DOM CSS Issues

Guide for diagnosing CSS layout bugs in Lit/Web Component apps served by Astro (or any SSR framework).

## Key Rule: External Styles Beat :host

External (document-level) CSS on a custom element tag **always overrides** the component's `:host` styles, regardless of specificity. This is per the CSS spec.

```css
/* Astro page (WINS) */
my-component { display: block; }

/* Component shadow DOM (LOSES) */
:host { display: flex; flex-direction: column; }
```

This means `display: block` silently kills `flex-direction: column`, and every flex child (`flex: 1`, `min-height: 0`) becomes inert.

## Debugging Checklist

### 1. Check ALL Astro pages that render the component

This project uses per-route Astro pages (`dashboard.astro`, `dashboard/workflows.astro`, `dashboard/kv.astro`, etc.). Each page has its own `<style>` block that styles the custom element. A fix in one page does NOT fix the others.

```bash
# Find all Astro pages that use a component
rg '<dashboard-layout' src/pages/ --files-with-matches

# Check what styles they set on the element
rg 'dashboard-layout\s*\{' src/pages/ -A 1
```

### 2. Verify the full height chain

For scrolling to work, every element from `<html>` to the scroll container must have a constrained height. If any element gets `height: auto`, the chain breaks.

```
html          -> height: 100%
body          -> height: 100%; overflow: hidden
custom-el     -> display: flex; flex-direction: column; height: 100%  (Astro page)
  :host       -> display: flex; flex-direction: column; height: 100vh (shadow DOM)
  .content    -> flex: 1; min-height: 0; overflow: hidden
    child-el  -> flex: 1; height: 100%; min-height: 0
      .scroller -> flex: 1; overflow-y: auto  <-- scrolls here
```

### 3. Common failure modes

| Symptom | Likely Cause |
|---------|-------------|
| No scrolling anywhere | Height chain broken at root (check Astro page `display: block` on custom element) |
| Content clipped by ~40px | `box-sizing: content-box` on parent with padding; child `height: 100%` resolves to content-box value |
| Scroll works on one route but not others | Different Astro pages have different styles for the same element |
| `flex: 1` ignored | Parent is `display: block` (flex properties only work in flex/grid context) |
| `min-height: 0` has no effect | Element is not a flex/grid item |

### 4. Shadow DOM boundary gotchas

- `height: 100%` on `:host` resolves against the element's **external** sizing context (parent layout), not internal
- CSS custom properties (`--var`) inherit through shadow DOM boundaries; regular properties do not
- Flex-calculated sizes ARE spec-definite, but some browsers don't propagate them as definite through shadow DOM `:host` boundaries in all cases
- When both `flex: 1` (from parent's `> *` rule) and `height: 100%` (from `:host`) apply, `flex-basis` takes priority in flex layout

### 5. Fix pattern

For Astro pages rendering Lit components, ensure the page-level style **matches** the component's intended display mode:

```css
/* Astro page */
dashboard-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
```

Then the `:host` rule in the component reinforces (not conflicts with) this:

```css
:host {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
```

### 6. Grep for the problem across all pages

```bash
# Find any page setting display: block on a dashboard component
rg 'dashboard-\w+\s*\{[^}]*display:\s*block' src/pages/

# Verify all pages use flex
rg 'dashboard-layout\s*\{' src/pages/ -A 1
```

## Lesson Learned

When a CSS layout bug "can't be fixed" despite correct flex/overflow on components, always check the Astro page styles first. The external style on the custom element tag is the highest-priority source for `:host`-equivalent properties.
