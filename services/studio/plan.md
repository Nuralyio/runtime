# Plan: Editor IFrame Preview

## Overview
Implement iframe-based preview using a **separate preview route**. The editor shows the iframe when Preview mode is active. Communication uses `postMessage` API for cross-origin iframe messaging.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│ TopBar:  [Edit] [Preview]                                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  EDIT MODE:                    PREVIEW MODE:                   │
│  ┌─────┬──────────┬──────┐    ┌────────────────────────────┐  │
│  │Left │ Editor   │Right │    │                            │  │
│  │Panel│ Canvas   │Panel │    │  IFrame (full width)       │  │
│  │     │          │      │    │  /app/preview/[uuid]/[url] │  │
│  │     │          │      │    │                            │  │
│  └─────┴──────────┴──────┘    └────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Create Preview Route
**File**: `src/pages/app/preview/[uuid]/[...urls].astro`

- Lightweight route that renders only the page content
- No TopBar, LeftPanel, RightPanel
- Uses `PageContent isViewMode="true"` like the view route
- Sets up postMessage listener for component updates from editor
- Sends `COMPONENT_SELECTED` message on element click

### Step 2: Create PreviewIFramePanel Component
**File**: `src/features/studio/panels/preview-panel/PreviewIFramePanel.ts`

```typescript
@customElement('preview-iframe-panel')
export class PreviewIFramePanel extends LitElement {
  @property() applicationId: string;
  @property() pageUrl: string;

  private iframeRef: HTMLIFrameElement;

  // Creates iframe pointing to /app/preview/[uuid]/[pageUrl]
  // Subscribes to component store changes
  // Sends updates to iframe via postMessage
  // Listens for COMPONENT_SELECTED from iframe
}
```

### Step 3: Update TopBar Preview Button
**File**: `src/features/studio/params/editor-micro-apps/top-bar.ts`

- Keep existing Edit/Preview toggle
- When Preview clicked: hide LeftPanel, RightPanel, show PreviewIFramePanel
- When Edit clicked: show normal editor layout

### Step 4: Modify EditorInteractivePanel
**File**: `src/features/studio/panels/main-panel/EditorInteractivePanel.ts`

- When `ViewMode.Preview`: render `<preview-iframe-panel>` instead of edit canvas
- When `ViewMode.Edit`: render normal editor

### Step 5: Implement Click-to-Select
**In preview route**:
- Attach click listeners to rendered components
- On click, send postMessage to parent: `{ type: 'COMPONENT_SELECTED', uuid: '...' }`

**In editor (PreviewIFramePanel)**:
- Listen for messages from iframe
- On `COMPONENT_SELECTED`, update `Vars.selectedComponent`

### Step 6: Implement Real-time Sync
**Editor → Preview**:
- Subscribe to component store
- On change, postMessage to iframe: `{ type: 'COMPONENTS_UPDATE', data: [...] }`

**Preview**:
- Listen for `COMPONENTS_UPDATE`
- Update local component state and re-render

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/app/preview/[uuid]/[...urls].astro` | **Create** | Lightweight preview route |
| `src/features/studio/panels/preview-panel/PreviewIFramePanel.ts` | **Create** | IFrame wrapper component |
| `src/features/studio/panels/main-panel/EditorInteractivePanel.ts` | Modify | Render iframe in preview mode |
| `src/features/studio/params/editor-micro-apps/top-bar.ts` | Modify | Keep existing toggle, wire to iframe |

## postMessage Communication

```typescript
// Message types
interface PreviewMessage {
  type: 'COMPONENTS_UPDATE' | 'COMPONENT_SELECTED' | 'STYLE_UPDATE';
  payload: any;
}

// Editor → Preview (component updates)
iframe.contentWindow.postMessage({
  type: 'COMPONENTS_UPDATE',
  payload: components
}, '*');

// Preview → Editor (click to select)
window.parent.postMessage({
  type: 'COMPONENT_SELECTED',
  payload: { uuid: componentUuid }
}, '*');
```

## Benefits
1. **Clean separation**: Preview route is independent, lightweight
2. **True isolation**: CSS/JS don't leak between editor and preview
3. **Same rendering**: Uses same `PageContent` component as view route
4. **Click-to-select**: Seamless workflow between preview and edit
5. **No split complexity**: Simple Edit/Preview toggle
