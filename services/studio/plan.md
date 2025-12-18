# Plan: Editor IFrame Preview (SPA-based)

## Overview
Implement iframe-based preview using the **same SPA** with a `?mode=preview` query parameter. Communication between editor and preview iframe uses the existing `MicroAppMessageBus`.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│ TopBar:  [Edit] [Split] [Preview]                              │
├────────────────────┬───────────────────────────────────────────┤
│                    │                                           │
│  Edit Canvas       │    IFrame (same SPA)                      │
│  (Editor Mode)     │    /app/studio/[uuid]/[page]?mode=preview │
│                    │                                           │
│  - Full editor UI  │    - No TopBar, LeftPanel, RightPanel     │
│  - Selection       │    - Only page content rendered           │
│  - Drag & drop     │    - Click sends COMPONENT_SELECTED       │
│                    │                                           │
└────────────────────┴───────────────────────────────────────────┘
```

## Communication via MicroAppMessageBus

The existing `MicroAppMessageBus` (singleton) will be used for iframe ↔ editor communication:

### Message Types (already defined):
- `COMPONENT_SELECTED` - When user clicks element in preview
- `DATA_UPDATED` - When component data changes
- `STATE_CHANGED` - When state changes

### New Message Types to Add:
- `PREVIEW_COMPONENTS_UPDATE` - Editor sends updated components to preview
- `PREVIEW_STYLE_UPDATE` - Editor sends style changes to preview

## Implementation Steps

### Step 1: Detect Preview Mode in Studio Page
**File**: `src/pages/app/studio/[uuid]/[...urls].astro`

- Check for `?mode=preview` query parameter
- If preview mode:
  - Skip rendering TopBar, LeftPanel, RightPanel
  - Render only the page content (TabsPanel/EditorInteractivePanel in view mode)
  - Initialize preview message listeners

### Step 2: Create PreviewIFramePanel Component
**File**: `src/features/studio/panels/preview-panel/PreviewIFramePanel.ts`

```typescript
@customElement('preview-iframe-panel')
export class PreviewIFramePanel extends LitElement {
  @property() applicationId: string;
  @property() pageUrl: string;

  // IFrame pointing to same SPA with ?mode=preview
  // Subscribe to component store changes
  // Send updates to iframe via MicroAppMessageBus
}
```

### Step 3: Add Preview Mode to EditorInteractivePanel
**File**: `src/features/studio/panels/main-panel/EditorInteractivePanel.ts`

- Add `ViewMode.Split` support
- When split mode: render edit canvas (50%) + PreviewIFramePanel (50%)
- When preview mode: render only PreviewIFramePanel (100%)

### Step 4: Update TopBar with View Mode Selector
**File**: `src/features/studio/params/editor-micro-apps/top-bar.ts`

- Replace current Edit/Preview toggle with 3-way selector:
  - **Edit**: Current editor (no iframe)
  - **Split**: Editor + iframe side by side
  - **Preview**: Full iframe only

### Step 5: Implement Click-to-Select in Preview
**File**: `src/features/studio/studio-bootstrap.ts` (or preview-specific bootstrap)

- In preview mode, attach click listeners to components
- On click, send `COMPONENT_SELECTED` message via MicroAppMessageBus
- Editor receives message and selects the component

### Step 6: Implement Real-time Sync
- Editor subscribes to component store changes
- On change, send `PREVIEW_COMPONENTS_UPDATE` to iframe via postMessage
- Preview iframe receives and re-renders components

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/app/studio/[uuid]/[...urls].astro` | Modify | Detect `?mode=preview`, conditional render |
| `src/features/studio/panels/preview-panel/PreviewIFramePanel.ts` | Create | IFrame wrapper component |
| `src/features/studio/panels/main-panel/EditorInteractivePanel.ts` | Modify | Add split view layout |
| `src/features/studio/params/editor-micro-apps/top-bar.ts` | Modify | Add 3-way view mode selector |
| `src/features/runtime/micro-app/messaging/MicroAppMessageBus.ts` | Modify | Add preview message types |
| `src/features/studio/studio-bootstrap.ts` | Modify | Preview mode initialization |

## IFrame Communication Flow

```
┌─────────────────┐                      ┌─────────────────┐
│     EDITOR      │                      │  IFRAME PREVIEW │
│                 │                      │                 │
│  Component      │  postMessage         │  Receives       │
│  Store Change   │ ──────────────────►  │  & Re-renders   │
│                 │  PREVIEW_UPDATE      │                 │
│                 │                      │                 │
│  Select         │  postMessage         │  Click on       │
│  Component   ◄──│ ──────────────────── │  Element        │
│                 │  COMPONENT_SELECTED  │                 │
└─────────────────┘                      └─────────────────┘
```

## Benefits
1. **Same codebase**: No duplicate rendering logic
2. **True isolation**: Preview runs in separate browsing context
3. **Real experience**: Components behave exactly as in production
4. **Event bus reuse**: Leverages existing MicroAppMessageBus
5. **Click-to-select**: Seamless workflow between preview and edit
