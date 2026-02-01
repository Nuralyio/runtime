# Architecture Plan: Note Node and Frame (Group Rectangle)

## Overview

This document outlines the architecture for two new canvas features:
1. **Note Node** - A simple annotation node for adding text notes/comments to the canvas
2. **Frame Node** - A resizable rectangle container that can visually group/encapsulate other nodes with a label

---

## 1. Note Node Architecture

### 1.1 Purpose
A lightweight, sticky-note style node for adding annotations, comments, and documentation directly on the canvas without affecting workflow execution.

### 1.2 Type Definition

```typescript
// Add to WorkflowNodeType enum in workflow-canvas.types.ts
export enum WorkflowNodeType {
  // ... existing types ...
  NOTE = 'NOTE',
}
```

### 1.3 Configuration Interface

```typescript
// Add to NodeConfiguration interface
interface NoteConfiguration {
  /** The text content of the note */
  content: string;
  /** Background color (hex or named color) */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Font size: 'small' | 'medium' | 'large' */
  fontSize?: 'small' | 'medium' | 'large';
  /** Whether to show a border */
  showBorder?: boolean;
}
```

### 1.4 Node Characteristics
- **No ports** - Note nodes don't participate in workflow execution
- **No execution status** - They are purely visual annotations
- **Resizable** - Allow width/height adjustment (optional, phase 2)
- **Markdown support** - Render basic markdown in the note content (optional, phase 2)

### 1.5 Template Definition

```typescript
// Add to NODE_TEMPLATES array
{
  type: WorkflowNodeType.NOTE,
  name: 'Note',
  description: 'Add annotations and comments to your workflow',
  icon: 'sticky-note',
  color: '#fef08a', // Yellow sticky note color
  category: 'annotation',
  defaultConfig: {
    content: 'Add your note here...',
    backgroundColor: '#fef08a',
    textColor: '#713f12',
    fontSize: 'medium',
    showBorder: false,
  },
  defaultPorts: {
    inputs: [],
    outputs: [],
  },
  // No outputSchema - notes don't produce data
}
```

### 1.6 Category Definition

```typescript
// Add new 'annotation' category to NODE_CATEGORIES
{
  id: 'annotation',
  name: 'Annotations',
  icon: 'message-square',
  nodeTypes: [
    WorkflowNodeType.NOTE,
    WorkflowNodeType.FRAME, // Added later
  ],
  canvasType: CanvasType.WORKFLOW,
}
```

### 1.7 Rendering Approach

In `workflow-node.component.ts`, add a special rendering path for NOTE nodes:

```typescript
private isNoteNode(): boolean {
  return this.node.type === WorkflowNodeType.NOTE;
}

private renderNoteNode() {
  const config = this.node.configuration as NoteConfiguration;
  return html`
    <div class="note-node" style=${styleMap({
      backgroundColor: config.backgroundColor || '#fef08a',
      color: config.textColor || '#713f12',
    })}>
      <div class="note-content" style=${styleMap({
        fontSize: this.getNoteFontSize(config.fontSize),
      })}>
        ${config.content}
      </div>
    </div>
  `;
}
```

### 1.8 Styling

```css
/* Add to workflow-node.style.ts */
.note-node {
  min-width: 150px;
  min-height: 80px;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
  cursor: default;
}

.note-node .note-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
}

/* Font size variants */
.note-node.font-small { font-size: 12px; }
.note-node.font-medium { font-size: 14px; }
.note-node.font-large { font-size: 16px; }
```

### 1.9 Color Presets

```typescript
export const NOTE_COLOR_PRESETS = [
  { name: 'Yellow', bg: '#fef08a', text: '#713f12' },
  { name: 'Blue', bg: '#bfdbfe', text: '#1e3a5f' },
  { name: 'Green', bg: '#bbf7d0', text: '#14532d' },
  { name: 'Pink', bg: '#fbcfe8', text: '#831843' },
  { name: 'Orange', bg: '#fed7aa', text: '#7c2d12' },
  { name: 'Purple', bg: '#ddd6fe', text: '#4c1d95' },
  { name: 'Gray', bg: '#e5e7eb', text: '#374151' },
];
```

---

## 2. Frame Node Architecture (Group Rectangle)

### 2.1 Purpose
A resizable rectangular container that visually groups related nodes together with an optional label. Frames help organize complex workflows and improve readability.

### 2.2 Key Design Decisions

**Option A: Frame as a Special Node Type (Recommended)**
- Frames are stored as nodes in the workflow
- Have special rendering that appears behind other nodes (z-index management)
- Can be selected, moved, and deleted like other nodes
- Store contained node IDs for group operations

**Option B: Frame as Separate Entity**
- Frames stored in a separate `frames` array in Workflow
- Requires new interfaces and separate management

**Recommendation: Option A** - Treating frames as a special node type is more consistent with the existing architecture and easier to implement.

### 2.3 Type Definition

```typescript
// Add to WorkflowNodeType enum
export enum WorkflowNodeType {
  // ... existing types ...
  NOTE = 'NOTE',
  FRAME = 'FRAME',
}
```

### 2.4 Configuration Interface

```typescript
interface FrameConfiguration {
  /** Frame label/title */
  label: string;
  /** Frame width in pixels */
  width: number;
  /** Frame height in pixels */
  height: number;
  /** Background color with opacity */
  backgroundColor?: string;
  /** Border color */
  borderColor?: string;
  /** Label position: 'top-left' | 'top-center' | 'top-right' */
  labelPosition?: 'top-left' | 'top-center' | 'top-right';
  /** Whether the label is inside or outside the frame */
  labelPlacement?: 'inside' | 'outside';
  /** Show/hide the label */
  showLabel?: boolean;
  /** Collapsed state - hide contents and show only label */
  collapsed?: boolean;
}
```

### 2.5 Extended WorkflowNode Interface

For frames, we need to track which nodes are "inside" the frame:

```typescript
// Extend WorkflowNode interface
export interface WorkflowNode {
  // ... existing properties ...

  /** For FRAME nodes: IDs of nodes contained within this frame */
  containedNodeIds?: string[];

  /** For regular nodes: ID of the frame containing this node (if any) */
  parentFrameId?: string;
}
```

### 2.6 Template Definition

```typescript
{
  type: WorkflowNodeType.FRAME,
  name: 'Frame',
  description: 'Group related nodes together with a labeled container',
  icon: 'square',
  color: '#6366f1', // Indigo
  category: 'annotation',
  defaultConfig: {
    label: 'Group',
    width: 400,
    height: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    labelPosition: 'top-left',
    labelPlacement: 'outside',
    showLabel: true,
    collapsed: false,
  },
  defaultPorts: {
    inputs: [],
    outputs: [],
  },
}
```

### 2.7 Rendering Architecture

#### 2.7.1 Z-Index Management

Frames must render **behind** regular nodes. This requires a rendering order strategy:

```typescript
// In workflow-canvas.component.ts renderNodes method
private renderNodes() {
  const { frames, regularNodes } = this.categorizeNodes();

  return html`
    <!-- Render frames first (background layer) -->
    ${frames.map(frame => this.renderFrameNode(frame))}

    <!-- Render regular nodes on top -->
    ${regularNodes.map(node => this.renderNode(node))}
  `;
}

private categorizeNodes() {
  const frames: WorkflowNode[] = [];
  const regularNodes: WorkflowNode[] = [];

  for (const node of this.workflow.nodes) {
    if (node.type === WorkflowNodeType.FRAME) {
      frames.push(node);
    } else {
      regularNodes.push(node);
    }
  }

  return { frames, regularNodes };
}
```

#### 2.7.2 Frame Component Rendering

```typescript
private renderFrameNode(frame: WorkflowNode) {
  const config = frame.configuration as FrameConfiguration;
  const isSelected = this.selectedNodeIds.has(frame.id);

  return html`
    <div
      class=${classMap({
        'frame-node': true,
        'selected': isSelected,
        'collapsed': config.collapsed,
      })}
      style=${styleMap({
        left: `${frame.position.x}px`,
        top: `${frame.position.y}px`,
        width: `${config.width}px`,
        height: config.collapsed ? 'auto' : `${config.height}px`,
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
      })}
      @mousedown=${(e: MouseEvent) => this.handleFrameMouseDown(e, frame)}
    >
      ${config.showLabel ? html`
        <div class="frame-label ${config.labelPosition} ${config.labelPlacement}">
          ${config.label}
        </div>
      ` : nothing}

      <!-- Resize handles (when selected) -->
      ${isSelected && !config.collapsed ? html`
        <div class="resize-handle resize-se" @mousedown=${(e: MouseEvent) => this.startFrameResize(e, frame, 'se')}></div>
        <div class="resize-handle resize-sw" @mousedown=${(e: MouseEvent) => this.startFrameResize(e, frame, 'sw')}></div>
        <div class="resize-handle resize-ne" @mousedown=${(e: MouseEvent) => this.startFrameResize(e, frame, 'ne')}></div>
        <div class="resize-handle resize-nw" @mousedown=${(e: MouseEvent) => this.startFrameResize(e, frame, 'nw')}></div>
      ` : nothing}
    </div>
  `;
}
```

### 2.8 Frame Controller

Create a new controller for frame-specific operations:

```typescript
// src/components/canvas/controllers/frame.controller.ts

export class FrameController extends BaseCanvasController {

  /** Start resizing a frame */
  startResize(event: MouseEvent, frame: WorkflowNode, handle: ResizeHandle): void;

  /** Handle frame resize drag */
  handleResize(event: MouseEvent): void;

  /** Stop frame resize */
  stopResize(): void;

  /** Check if a point is inside a frame */
  isPointInFrame(x: number, y: number, frame: WorkflowNode): boolean;

  /** Get all nodes contained within a frame's bounds */
  getNodesInFrame(frame: WorkflowNode): WorkflowNode[];

  /** Update frame's containedNodeIds based on current positions */
  updateFrameContents(frame: WorkflowNode): void;

  /** Move all contained nodes when frame is moved */
  moveFrameWithContents(frame: WorkflowNode, deltaX: number, deltaY: number): void;

  /** Auto-resize frame to fit contents with padding */
  fitFrameToContents(frame: WorkflowNode, padding?: number): void;

  /** Collapse/expand a frame */
  toggleFrameCollapsed(frame: WorkflowNode): void;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';
```

### 2.9 Styling

```css
/* Add to workflow-canvas.style.ts or new frame.style.ts */

.frame-node {
  position: absolute;
  border: 2px dashed var(--frame-border-color, rgba(99, 102, 241, 0.3));
  border-radius: 8px;
  pointer-events: all;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.frame-node:hover {
  border-color: rgba(99, 102, 241, 0.5);
}

.frame-node.selected {
  border-color: #3b82f6;
  border-style: solid;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.frame-node.collapsed {
  min-height: 40px;
  background: rgba(99, 102, 241, 0.1) !important;
}

/* Frame label */
.frame-label {
  position: absolute;
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  white-space: nowrap;
  user-select: none;
}

.frame-label.outside {
  top: -12px;
  transform: translateY(-100%);
}

.frame-label.inside {
  top: 8px;
}

.frame-label.top-left { left: 12px; }
.frame-label.top-center { left: 50%; transform: translateX(-50%); }
.frame-label.top-right { right: 12px; }

/* Resize handles */
.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border: 2px solid white;
  border-radius: 2px;
}

.resize-se { bottom: -5px; right: -5px; cursor: se-resize; }
.resize-sw { bottom: -5px; left: -5px; cursor: sw-resize; }
.resize-ne { top: -5px; right: -5px; cursor: ne-resize; }
.resize-nw { top: -5px; left: -5px; cursor: nw-resize; }
```

### 2.10 Frame Color Presets

```typescript
export const FRAME_COLOR_PRESETS = [
  { name: 'Indigo', bg: 'rgba(99, 102, 241, 0.05)', border: 'rgba(99, 102, 241, 0.3)' },
  { name: 'Blue', bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.3)' },
  { name: 'Green', bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.3)' },
  { name: 'Orange', bg: 'rgba(249, 115, 22, 0.05)', border: 'rgba(249, 115, 22, 0.3)' },
  { name: 'Red', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.3)' },
  { name: 'Purple', bg: 'rgba(168, 85, 247, 0.05)', border: 'rgba(168, 85, 247, 0.3)' },
  { name: 'Gray', bg: 'rgba(107, 114, 128, 0.05)', border: 'rgba(107, 114, 128, 0.3)' },
];
```

---

## 3. Interaction Behaviors

### 3.1 Note Node Interactions
| Action | Behavior |
|--------|----------|
| Single click | Select note |
| Double click | Open inline editor / config panel |
| Drag | Move note |
| Delete | Remove note from canvas |
| Copy/Paste | Duplicate note |

### 3.2 Frame Node Interactions
| Action | Behavior |
|--------|----------|
| Single click on frame border/label | Select frame only |
| Single click inside frame (on empty area) | Select frame only |
| Double click on label | Edit label inline |
| Double click on frame body | Open config panel |
| Drag frame border/label | Move frame with all contained nodes |
| Drag resize handle | Resize frame |
| Delete frame | Remove frame only (keep contained nodes) OR remove frame + contents (with confirm) |
| Shift + Delete | Remove frame and all contained nodes |

### 3.3 Node-Frame Interactions
| Action | Behavior |
|--------|----------|
| Drag node into frame | Auto-assign node to frame's containedNodeIds |
| Drag node out of frame | Remove node from frame's containedNodeIds |
| Move frame | All contained nodes move with it |
| Delete contained node | Remove from frame's containedNodeIds |

---

## 4. Configuration Panel Fields

### 4.1 Note Configuration Fields

```typescript
// Add to config panel field mapping
[WorkflowNodeType.NOTE]: [
  {
    key: 'content',
    label: 'Content',
    type: 'textarea',
    rows: 6,
    placeholder: 'Add your note here...',
  },
  {
    key: 'backgroundColor',
    label: 'Background Color',
    type: 'color-preset',
    presets: NOTE_COLOR_PRESETS,
  },
  {
    key: 'fontSize',
    label: 'Font Size',
    type: 'select',
    options: [
      { value: 'small', label: 'Small' },
      { value: 'medium', label: 'Medium' },
      { value: 'large', label: 'Large' },
    ],
  },
]
```

### 4.2 Frame Configuration Fields

```typescript
[WorkflowNodeType.FRAME]: [
  {
    key: 'label',
    label: 'Label',
    type: 'text',
    placeholder: 'Group name',
  },
  {
    key: 'showLabel',
    label: 'Show Label',
    type: 'checkbox',
  },
  {
    key: 'labelPosition',
    label: 'Label Position',
    type: 'select',
    options: [
      { value: 'top-left', label: 'Top Left' },
      { value: 'top-center', label: 'Top Center' },
      { value: 'top-right', label: 'Top Right' },
    ],
  },
  {
    key: 'backgroundColor',
    label: 'Background Color',
    type: 'color-preset',
    presets: FRAME_COLOR_PRESETS,
  },
  {
    key: 'collapsed',
    label: 'Collapsed',
    type: 'checkbox',
  },
]
```

---

## 5. Workflow Execution Considerations

### 5.1 Note Nodes
- **Skipped during execution** - Notes are purely visual
- No input/output data flow
- No status updates during execution

### 5.2 Frame Nodes
- **Skipped during execution** - Frames are organizational only
- Contained nodes execute based on their edge connections, not frame membership
- Frame collapse/expand doesn't affect execution

### 5.3 Execution Filter

```typescript
// In workflow executor, filter out annotation nodes
const executableNodes = workflow.nodes.filter(
  node => node.type !== WorkflowNodeType.NOTE &&
          node.type !== WorkflowNodeType.FRAME
);
```

---

## 6. Implementation Phases

### Phase 1: Core Implementation
1. Add NOTE and FRAME to WorkflowNodeType enum
2. Add type definitions and configurations
3. Add NODE_TEMPLATES entries
4. Add 'annotation' category to NODE_CATEGORIES
5. Implement basic note rendering in workflow-node.component.ts
6. Implement basic frame rendering with z-index management
7. Add color constants and presets

### Phase 2: Frame Interactions
1. Create FrameController
2. Implement frame resize functionality
3. Implement node containment detection
4. Implement "move frame with contents" behavior
5. Implement frame collapse/expand

### Phase 3: Configuration & Polish
1. Add config panel fields for note and frame
2. Implement inline label editing for frames
3. Add context menu options (collapse, fit to contents, etc.)
4. Add keyboard shortcuts (Shift+N for note, Shift+F for frame)
5. Undo/redo support for frame operations

### Phase 4: Advanced Features (Optional)
1. Markdown rendering in notes
2. Note resize capability
3. Nested frames support
4. Frame templates/presets
5. Auto-group selected nodes into frame

---

## 7. File Changes Summary

| File | Changes |
|------|---------|
| `workflow-canvas.types.ts` | Add NOTE, FRAME to enum; add configurations; add templates; add category |
| `workflow-node.component.ts` | Add note node rendering logic |
| `workflow-node.style.ts` | Add note node styles |
| `workflow-canvas.component.ts` | Add frame rendering; z-index management; frame interactions |
| `workflow-canvas.style.ts` | Add frame styles |
| `controllers/frame.controller.ts` | New file for frame operations |
| `controllers/drag.controller.ts` | Update to handle frame drag with contents |
| `controllers/index.ts` | Export FrameController |
| `templates/config-panel/` | Add note and frame configuration fields |
| `templates/palette.template.ts` | Ensure annotation category renders correctly |

---

## 8. API/Events

### New Events

```typescript
// Add to CanvasEvents interface
'frame-resized': { frame: WorkflowNode; width: number; height: number };
'frame-collapsed': { frame: WorkflowNode; collapsed: boolean };
'node-added-to-frame': { nodeId: string; frameId: string };
'node-removed-from-frame': { nodeId: string; frameId: string };
```

---

## 9. Testing Considerations

1. **Note Node Tests**
   - Create, select, move, delete note
   - Edit note content via config panel
   - Color preset changes
   - Copy/paste note

2. **Frame Node Tests**
   - Create, select, move, delete frame
   - Resize frame via handles
   - Nodes correctly detected as "inside" frame
   - Moving frame moves contained nodes
   - Collapse/expand functionality
   - Label editing

3. **Integration Tests**
   - Notes and frames don't affect workflow execution
   - Undo/redo for all frame operations
   - Copy/paste frame with contents

---

## 10. Summary

This architecture provides:
- **Note Node**: Simple sticky-note annotations with customizable colors and font sizes
- **Frame Node**: Resizable container rectangles that visually group nodes with labels

Both are implemented as special node types that are skipped during execution, maintaining consistency with the existing architecture while providing powerful organizational tools for complex workflows.
