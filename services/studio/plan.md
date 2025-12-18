# Plan: Editor IFrame Preview Implementation

## Overview
Implement a real iframe-based preview system for the editor that allows users to see their page/app in an isolated environment, providing a true preview experience with actual component behavior.

## Current Architecture
The editor uses a three-panel layout:
- **LeftPanel** (300px): Pages, Functions, Files navigation
- **TabsPanel/EditorInteractivePanel**: Main editing area
- **RightPanel** (350px): Control panel & properties

There's an existing Edit/Preview mode toggle that hides panels, but it doesn't use an iframe - it just renders in the same context with editing controls disabled.

## Proposed Implementation

### Phase 1: Create Preview IFrame Infrastructure

#### Step 1: Create a dedicated preview page route
Create a new Astro page that renders only the page content without editor UI:
- **File**: `src/pages/app/preview/[uuid]/[...urls].astro`
- Purpose: Lightweight page that only renders the component tree
- Will receive page data and render in isolation

#### Step 2: Create PreviewIFramePanel Component
- **File**: `src/features/studio/panels/preview-panel/PreviewIFramePanel.ts`
- A Lit component that hosts an iframe pointing to the preview route
- Handles communication with the preview via postMessage API
- Syncs component state changes to the preview in real-time

### Phase 2: Integrate with Editor Layout

#### Step 3: Update EditorInteractivePanel to support split view
- **File**: `src/features/studio/panels/main-panel/EditorInteractivePanel.ts`
- Add a new view mode: `Split` (Edit + Preview side by side)
- When in split mode, render both the edit canvas and PreviewIFramePanel

#### Step 4: Update TopBar with new preview modes
- **File**: `src/features/studio/params/editor-micro-apps/top-bar.ts`
- Add buttons/dropdown for:
  - **Edit**: Current editing mode
  - **Split**: Side-by-side edit + iframe preview
  - **Preview**: Full iframe preview

### Phase 3: Real-time Sync

#### Step 5: Implement preview message bus
- Create messaging utilities for bi-directional communication
- Editor → Preview: Component data updates, style changes
- Preview → Editor: Click events for component selection

### Implementation Files

```
src/
├── pages/
│   └── app/
│       └── preview/
│           └── [uuid]/
│               └── [...urls].astro      ← NEW: Lightweight preview page
├── features/
│   └── studio/
│       └── panels/
│           ├── preview-panel/
│           │   ├── PreviewIFramePanel.ts ← NEW: IFrame wrapper component
│           │   └── preview-sync.ts       ← NEW: Sync utilities
│           └── main-panel/
│               └── EditorInteractivePanel.ts ← MODIFY: Add split view support
```

## Detailed Implementation Steps

### 1. Create Preview Page Route (`src/pages/app/preview/[uuid]/[...urls].astro`)
- Minimal Astro page with runtime bootstrap only (no studio features)
- Receives application UUID and page URL from route params
- Loads page data from API
- Renders using existing `renderComponent()` utility
- Sets up postMessage listener for updates

### 2. Create PreviewIFramePanel Component
```typescript
// Key features:
- Create iframe pointing to /app/preview/[uuid]/[pageUrl]
- Set up postMessage communication
- Subscribe to component store changes
- Send updates to iframe when components change
- Handle responsive resize
- Provide device size presets (mobile, tablet, desktop)
```

### 3. Update ViewMode enum
Add new modes to the existing ViewMode:
- `ViewMode.Edit` (existing)
- `ViewMode.Preview` (existing, modify to use iframe)
- `ViewMode.Split` (new)

### 4. Modify EditorInteractivePanel
- When `ViewMode.Split`:
  - Render edit canvas at 50% width
  - Render PreviewIFramePanel at 50% width
  - Add resizable divider between them
- When `ViewMode.Preview`:
  - Render only PreviewIFramePanel at 100% width

### 5. Update TopBar buttons
- Change existing Edit/Preview buttons to a dropdown or segmented control
- Options: Edit | Split | Preview
- Update Vars.currentEditingMode accordingly

### 6. Implement Real-time Sync
```typescript
// Editor side - send updates
componentStore.subscribe(components => {
  iframe.contentWindow.postMessage({
    type: 'UPDATE_COMPONENTS',
    data: components
  }, '*');
});

// Preview side - receive updates
window.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_COMPONENTS') {
    updateComponents(event.data.data);
  }
});
```

## Benefits of IFrame Approach
1. **True isolation**: CSS and JS don't leak between editor and preview
2. **Accurate rendering**: Components render exactly as they would in production
3. **Device simulation**: Easy to resize iframe for responsive testing
4. **Performance**: Preview updates independently of editor
5. **Security**: Sandboxed execution environment

## Questions to Clarify
1. Should the split view be resizable (drag divider)?
2. Should we add device preset buttons (iPhone, iPad, Desktop)?
3. Should clicking elements in preview select them in editor?
4. Should we implement hot-reload or manual refresh?
