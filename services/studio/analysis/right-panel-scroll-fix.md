# Right Panel Scroll Fix Analysis

## Problem

The Style tab (and all other tabs: Properties, Handlers, Access) in the right control panel had content that overflowed but could not be scrolled. The bottom of each tab's content was clipped and unreachable.

---

## Why It Didn't Work Before

Three interrelated CSS issues broke the scroll chain from the layout root down to the scrollable tab content.

### Issue 1: Broken Height Chain in RightPanel.ts (Root Cause)

The `RightPanel` component renders its template inside Shadow DOM:

```html
<aside class="sidebar">
  <div class="my-4 w-full text-center">...</div>
  <div class="my flex-grow w-full h-full" style="width:100%">
    <control-panel class="w-full h-full"></control-panel>
  </div>
</aside>
```

The wrapper div around `<control-panel>` relied on Tailwind utility classes (`flex-grow`, `h-full`) to size itself. However, **Tailwind classes do not penetrate Shadow DOM**. The component's `static styles` only defined rules for `:host` and `aside` — no styles existed for the inner divs.

Without `flex-grow`, the wrapper div was a flex item with `flex-grow: 0` (default), meaning it sized to its content rather than filling the remaining space. This made the wrapper div's height `auto` — an indefinite height. Every child below it that used `height: 100%` resolved against this indefinite value, effectively collapsing the height constraint chain.

**Result:** No element in the chain had a constrained height, so `overflow: auto` never activated.

### Issue 2: `display: block` on `.panel--mode-embedded` (panel.style.ts)

The `.panel` base class correctly used `display: flex; flex-direction: column`, which allowed:
- `.panel-header` to take fixed space via `flex-shrink: 0`
- `.panel-body` to take remaining space via `flex: 1`

But `.panel--mode-embedded` overrode this with `display: block`, switching to block layout. In block layout:
- `flex: 1` on `.panel-body` was ignored
- `height: 100%` on `.panel-body` resolved to the **full** parent height (including the header's space)
- The panel body was taller than available space by the header height (~36px)
- `.panel { overflow: hidden }` clipped the bottom of the body

### Issue 3: `height: 100%` at Multiple Levels (panel.style.ts + StudioControlPanel.ts)

Even with flex restored, `height: 100%` was used at multiple levels:

| Location | Property | Problem |
|---|---|---|
| `.panel-body` (panel.style.ts) | `height: 100%` | Resolved to full container height, not remaining space after header |
| `nr-panel::part(body)` (StudioControlPanel.ts) | `height: 100%` | Same issue — percentage of full container |
| `.panel-content` (StudioControlPanel.ts) | `height: 100%` | Resolved against parent's full height, not flex-computed remaining space |

In a flex column container, `height: 100%` on a child resolves against the container's explicit height, **not** the flex-computed remaining space. So each child was oversized by the amount of space its siblings occupied.

### The Old Workaround (Why It Partially Worked Before)

The old code had a viewport-based workaround:

```css
.panel--mode-embedded .panel-body {
  max-height: calc(100vh - var(--nuraly-panel-body-offset, 150px));
  overflow-y: auto;
}
```

This capped the body height at `100vh - 150px` regardless of the broken flex chain. The `150px` was a rough estimate of header/chrome height. This made scrolling work approximately, but:
- The `150px` offset was a magic number — incorrect for different viewport sizes or layout configurations
- It didn't account for the actual header height
- It allowed the body to be taller than its actual container in some cases

---

## Why It Works Now

Three coordinated changes restore a proper flex-based height chain from the layout root to the scrollable content.

### Fix 1: RightPanel.ts — Establish Height Constraint at the Top

```css
aside > :last-child {
  flex: 1;
  min-height: 0;
}
```

The wrapper div is now a proper flex item that takes the remaining space after the first child (an empty branding div). `min-height: 0` allows it to shrink below its content size, which is critical for enabling overflow on descendants.

This gives the wrapper div a **definite height** from the flex algorithm, so `height: 100%` on `<control-panel>` inside it resolves correctly.

### Fix 2: panel.style.ts — Restore Flex Layout in Embedded Mode

**Removed `display: block`** from `.panel--mode-embedded`:
```css
/* Before */
.panel--mode-embedded {
  display: block;  /* Broke flex layout */
}

/* After */
.panel--mode-embedded {
  /* Inherits display: flex; flex-direction: column from .panel */
}
```

**Removed the `max-height` workaround**:
```css
/* Removed entirely */
.panel--mode-embedded .panel-body {
  max-height: calc(100vh - var(--nuraly-panel-body-offset, 150px));
  overflow-y: auto;
}
```

**Changed `.panel-body`** from `height: 100%` to `min-height: 0`:
```css
/* Before */
.panel-body {
  flex: 1;
  height: 100%;   /* Resolved to full parent height */
  overflow: auto;
}

/* After */
.panel-body {
  flex: 1;
  min-height: 0;  /* Allows shrinking below content size */
  overflow: auto;
}
```

### Fix 3: StudioControlPanel.ts — Use Flex Instead of Percentages

**Removed `height: 100%`** from `nr-panel::part(body)`:
```css
/* Before */
nr-panel::part(body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* After */
nr-panel::part(body) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**Changed `.panel-content`** from `height: 100%` to `flex: 1`:
```css
/* Before */
.panel-content {
  height: 100%;    /* Percentage of wrong container */
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* After */
.panel-content {
  flex: 1;         /* Takes remaining space from flex parent */
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

**Removed dead `.tab-content` rule** — these divs render inside `nr-tabs` Shadow DOM, unreachable by StudioControlPanel styles.

---

## The Complete Height Chain (After Fix)

Every level uses `flex: 1; min-height: 0` instead of `height: 100%`, so each container gets exactly the remaining space after its siblings:

```
right-panel :host
  height: 100% (from layout parent)

  aside
    display: flex; flex-direction: column; height: 100%

    wrapper div (aside > :last-child)           <-- FIX 1
      flex: 1; min-height: 0
      = remaining space after first child

      control-panel :host
        height: 100% (resolves against wrapper div's definite flex height)

        studio-control-panel :host
          height: 100%; overflow: hidden

          nr-panel
            height: 100%

            .panel.panel--mode-embedded         <-- FIX 2
              display: flex; flex-direction: column (inherited from .panel)
              height: 100% !important

              .panel-header
                flex-shrink: 0 (~36px)

              .panel-body [part="body"]          <-- FIX 2 + 3
                flex: 1; min-height: 0 (from panel.style.ts)
                display: flex; flex-direction: column (from ::part(body))
                = remaining space after header

                .panel-content (slotted)         <-- FIX 3
                  flex: 1; min-height: 0
                  display: flex; flex-direction: column
                  = fills panel-body

                  nr-tabs
                    flex: 1; min-height: 0
                    display: flex; flex-direction: column

                    .tabs-container.horizontal-align
                      flex: 1; min-height: 0; flex-direction: column

                      .tab-labels
                        flex-shrink: 0 (fixed height)

                      .tab-content [part="tab-content"]
                        flex: 1; min-height: 0; overflow: auto
                        = SCROLLS HERE
```

### Why `min-height: 0` Is Critical

By default, flex items have `min-height: auto`, which prevents them from shrinking below their content size. When content is taller than the available space, the flex item grows to fit — pushing overflow outside the container instead of triggering scrolling.

`min-height: 0` overrides this, allowing flex items to shrink below their content size. Combined with `overflow: auto` (or `overflow: hidden` on intermediate containers), this enables the browser to create a scrollable region at the correct level.

---

## Files Changed

| File | Changes |
|---|---|
| `services/studio/src/features/studio/panels/layout/RightPanel.ts` | Added `aside > :last-child { flex: 1; min-height: 0 }` |
| `services/studio/src/features/runtime/components/ui/nuraly-ui/src/components/panel/panel.style.ts` | Removed `display: block` from embedded mode, removed `max-height` workaround, changed `height: 100%` to `min-height: 0` on `.panel-body` |
| `services/studio/src/features/studio/panels/control-panel/StudioControlPanel.ts` | Removed `height: 100%` from `::part(body)`, changed `height: 100%` to `flex: 1` on `.panel-content`, removed dead `.tab-content` rule |
