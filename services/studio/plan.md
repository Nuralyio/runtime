# Plan: Editor IFrame Preview

## Overview
Move the editor canvas inside an iframe. The iframe route renders the page with full editing capabilities. Edit/Preview mode switching is handled internally via `Vars.currentEditingMode`, not through URL parameters.

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│ TopBar:  [Edit] [Preview]                                      │
├─────────┬──────────────────────────────────────┬───────────────┤
│         │                                      │               │
│  Left   │         IFRAME                       │    Right      │
│  Panel  │  /app/preview/[uuid]/[url]           │    Panel      │
│         │                                      │               │
│         │  - Renders PageContent               │               │
│         │  - Edit mode: selection, drag-drop   │               │
│         │  - Preview mode: view only           │               │
│         │  - Mode controlled via postMessage   │               │
│         │                                      │               │
└─────────┴──────────────────────────────────────┴───────────────┘
```

## Key Points
1. **Single route** - `/app/preview/[uuid]/[...urls].astro`
2. **No mode in URL** - Always loads with edit capabilities
3. **Mode via postMessage** - Parent sends edit/preview mode changes
4. **Panels outside iframe** - LeftPanel, RightPanel, TopBar stay in parent

## Implementation Steps

### Step 1: Create Preview Route
**File**: `src/pages/app/preview/[uuid]/[...urls].astro`

- Renders `PageContent` component (same as current editor)
- Loads page and component data
- Sets up postMessage listeners for:
  - Mode changes (edit/preview)
  - Component updates
  - Selection changes
- Sends messages for:
  - Component clicked (for selection)
  - Component changes (for saving)

### Step 2: Create PreviewIFramePanel Component
**File**: `src/features/studio/panels/preview-panel/PreviewIFramePanel.ts`

- Hosts the iframe
- Sends postMessage for:
  - Mode changes when TopBar toggle clicked
  - Component data updates
- Receives postMessage for:
  - Component selection (updates Vars.selectedComponent)

### Step 3: Replace Editor Canvas with IFrame
**File**: `src/features/studio/panels/main-panel/EditorInteractivePanel.ts`

- Replace current canvas rendering with `<preview-iframe-panel>`
- The iframe handles all rendering

### Step 4: Wire TopBar to IFrame
- When Edit/Preview clicked, send postMessage to iframe
- Iframe updates `Vars.currentEditingMode` internally

## postMessage Communication

```typescript
// Parent → IFrame
{ type: 'SET_MODE', payload: 'edit' | 'preview' }
{ type: 'UPDATE_COMPONENTS', payload: components[] }
{ type: 'SELECT_COMPONENT', payload: { uuid: string } }

// IFrame → Parent
{ type: 'COMPONENT_CLICKED', payload: { uuid: string } }
{ type: 'COMPONENT_UPDATED', payload: component }
{ type: 'READY' }  // iframe loaded and ready
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/app/preview/[uuid]/[...urls].astro` | **Create** | IFrame route with edit capabilities |
| `src/features/studio/panels/preview-panel/PreviewIFramePanel.ts` | **Create** | IFrame wrapper component |
| `src/features/studio/panels/main-panel/EditorInteractivePanel.ts` | **Modify** | Use PreviewIFramePanel |

## Benefits
1. **True isolation** - Editor canvas runs in separate context
2. **Same experience** - Full editing inside iframe
3. **Clean architecture** - Panels communicate via postMessage
4. **No URL complexity** - Single route, mode handled internally
