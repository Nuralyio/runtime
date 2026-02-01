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
  /** Collapsed state - transforms frame into a compact group node */
  collapsed?: boolean;
}
```

### 2.4.1 Collapsed Frame as Group Node

When a frame is collapsed, it transforms into a **compact group node** representation:

```
┌─────────────────────────────┐
│  ○  │ 📦 Authentication     │  ○ →
│  ○  │    (5 nodes)          │
└─────────────────────────────┘
      Input ports              Output port
      (aggregated)             (aggregated)
```

**Collapsed Group Node Features:**
- **Fixed dimensions**: Compact node size (~220x80px) instead of frame dimensions
- **Title**: Shows frame label as node title
- **Node preview row**: Shows icons of contained nodes (first 5-6 icons, "+N more" if overflow)
- **Aggregated ports**:
  - Input ports: One port for each external edge coming INTO any contained node
  - Output ports: One port for each external edge going OUT from any contained node
- **Icon**: Group/layers icon to indicate it's a collapsed frame
- **Double-click**: Expands the frame back to full size
- **Hover tooltip**: Shows full list of contained node names

**Visual representation:**
```
┌──────────────────────────────────────┐
│  ○  │ 📦 Authentication              │  ○ →
│  ○  │ [🔐][📧][⚡][🔀][📤] +2 more   │
└──────────────────────────────────────┘
       └── Node type icons preview ──┘
```

```typescript
interface CollapsedFrameState {
  /** Original frame dimensions (restored on expand) */
  expandedWidth: number;
  expandedHeight: number;
  /** Aggregated input connections from outside the frame */
  aggregatedInputs: AggregatedPort[];
  /** Aggregated output connections to outside the frame */
  aggregatedOutputs: AggregatedPort[];
}

interface AggregatedPort {
  /** Virtual port ID for the collapsed view */
  id: string;
  /** Original edge that this port represents */
  originalEdgeId: string;
  /** The actual node inside the frame that has the connection */
  internalNodeId: string;
  /** The actual port on the internal node */
  internalPortId: string;
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

  // Render as collapsed group node or expanded frame
  if (config.collapsed) {
    return this.renderCollapsedFrame(frame, isSelected);
  }

  return html`
    <div
      class=${classMap({
        'frame-node': true,
        'selected': isSelected,
      })}
      style=${styleMap({
        left: `${frame.position.x}px`,
        top: `${frame.position.y}px`,
        width: `${config.width}px`,
        height: `${config.height}px`,
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
      })}
      @mousedown=${(e: MouseEvent) => this.handleFrameMouseDown(e, frame)}
      @dblclick=${(e: MouseEvent) => this.toggleFrameCollapsed(e, frame)}
    >
      ${config.showLabel ? html`
        <div class="frame-label ${config.labelPosition} ${config.labelPlacement}">
          ${config.label}
        </div>
      ` : nothing}

      <!-- Resize handles (when selected) -->
      ${isSelected ? html`
        <div class="resize-handle resize-se" @mousedown=${(e: MouseEvent) => this.startFrameResize(e, frame, 'se')}></div>
        <div class="resize-handle resize-sw" @mousedown=${(e: MouseEvent) => this.startFrameResize(e, frame, 'sw')}></div>
        <div class="resize-handle resize-ne" @mousedown=${(e: MouseEvent) => this.startFrameResize(e, frame, 'ne')}></div>
        <div class="resize-handle resize-nw" @mousedown=${(e: MouseEvent) => this.startFrameResize(e, frame, 'nw')}></div>
      ` : nothing}
    </div>
  `;
}
```

#### 2.7.3 Collapsed Frame as Group Node Rendering

When collapsed, the frame renders as a compact node with aggregated ports:

```typescript
private renderCollapsedFrame(frame: WorkflowNode, isSelected: boolean) {
  const config = frame.configuration as FrameConfiguration;
  const containedNodes = this.getContainedNodes(frame);
  const aggregatedPorts = this.getAggregatedPorts(frame);

  // Get node icons for preview (show max 5, then "+N more")
  const maxPreviewIcons = 5;
  const previewNodes = containedNodes.slice(0, maxPreviewIcons);
  const overflowCount = containedNodes.length - maxPreviewIcons;

  return html`
    <div
      class=${classMap({
        'collapsed-frame-node': true,
        'selected': isSelected,
      })}
      style=${styleMap({
        left: `${frame.position.x}px`,
        top: `${frame.position.y}px`,
        '--node-color': config.borderColor || '#6366f1',
      })}
      @mousedown=${(e: MouseEvent) => this.handleFrameMouseDown(e, frame)}
      @dblclick=${(e: MouseEvent) => this.toggleFrameCollapsed(e, frame)}
      title=${this.getContainedNodesTitle(containedNodes)}
    >
      <!-- Aggregated input ports -->
      <div class="ports ports-left">
        ${aggregatedPorts.inputs.map(port => html`
          <div
            class="port port-input"
            data-port-id=${port.id}
            title=${port.label || 'Input'}
          ></div>
        `)}
      </div>

      <!-- Node body -->
      <div class="node-body">
        <div class="node-header">
          <nly-icon name="layers" size="16"></nly-icon>
          <span class="node-title">${config.label}</span>
        </div>

        <!-- Node icons preview row -->
        <div class="node-icons-preview">
          ${previewNodes.map(node => html`
            <div
              class="preview-icon"
              style="background-color: ${NODE_COLORS[node.type]}20"
              title=${node.name}
            >
              <nly-icon
                name=${NODE_ICONS[node.type]}
                size="14"
                style="color: ${NODE_COLORS[node.type]}"
              ></nly-icon>
            </div>
          `)}
          ${overflowCount > 0 ? html`
            <span class="overflow-count">+${overflowCount}</span>
          ` : nothing}
        </div>
      </div>

      <!-- Aggregated output ports -->
      <div class="ports ports-right">
        ${aggregatedPorts.outputs.map(port => html`
          <div
            class="port port-output"
            data-port-id=${port.id}
            title=${port.label || 'Output'}
          ></div>
        `)}
      </div>

      <!-- Expand indicator -->
      <div class="expand-hint" title="Double-click to expand">
        <nly-icon name="maximize-2" size="12"></nly-icon>
      </div>
    </div>
  `;
}

/**
 * Get contained nodes for a frame
 */
private getContainedNodes(frame: WorkflowNode): WorkflowNode[] {
  const containedIds = new Set(frame.containedNodeIds || []);
  return this.workflow.nodes.filter(n => containedIds.has(n.id));
}

/**
 * Generate tooltip showing all contained node names
 */
private getContainedNodesTitle(nodes: WorkflowNode[]): string {
  if (nodes.length === 0) return 'Empty group';
  return `Contains:\n${nodes.map(n => `• ${n.name}`).join('\n')}\n\nDouble-click to expand`;
}

/**
 * Calculate aggregated ports for a collapsed frame.
 * These represent external connections to/from contained nodes.
 */
private getAggregatedPorts(frame: WorkflowNode): { inputs: AggregatedPort[]; outputs: AggregatedPort[] } {
  const containedIds = new Set(frame.containedNodeIds || []);
  const inputs: AggregatedPort[] = [];
  const outputs: AggregatedPort[] = [];

  for (const edge of this.workflow.edges) {
    const sourceInside = containedIds.has(edge.sourceNodeId);
    const targetInside = containedIds.has(edge.targetNodeId);

    // Edge from outside INTO the frame = aggregated input
    if (!sourceInside && targetInside) {
      inputs.push({
        id: `agg-in-${edge.id}`,
        originalEdgeId: edge.id,
        internalNodeId: edge.targetNodeId,
        internalPortId: edge.targetPortId,
        label: this.getNodeName(edge.sourceNodeId),
      });
    }

    // Edge from inside OUT of the frame = aggregated output
    if (sourceInside && !targetInside) {
      outputs.push({
        id: `agg-out-${edge.id}`,
        originalEdgeId: edge.id,
        internalNodeId: edge.sourceNodeId,
        internalPortId: edge.sourcePortId,
        label: this.getNodeName(edge.targetNodeId),
      });
    }
  }

  return { inputs, outputs };
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

/* Collapsed frame as group node */
.collapsed-frame-node {
  position: absolute;
  display: flex;
  align-items: stretch;
  min-width: 220px;
  background: white;
  border: 2px solid var(--node-color, #6366f1);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: move;
  transition: box-shadow 0.2s, border-color 0.2s;
}

.collapsed-frame-node:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.collapsed-frame-node.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.collapsed-frame-node .node-body {
  flex: 1;
  padding: 8px 12px;
}

.collapsed-frame-node .node-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.collapsed-frame-node .node-title {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
}

/* Node icons preview row */
.collapsed-frame-node .node-icons-preview {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.collapsed-frame-node .preview-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  transition: transform 0.15s;
}

.collapsed-frame-node .preview-icon:hover {
  transform: scale(1.1);
}

.collapsed-frame-node .overflow-count {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
  padding-left: 4px;
}

/* Expand hint */
.collapsed-frame-node .expand-hint {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  color: #9ca3af;
  transition: opacity 0.2s;
}

.collapsed-frame-node:hover .expand-hint {
  opacity: 1;
}

/* Aggregated ports on collapsed frame */
.collapsed-frame-node .ports {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
}

.collapsed-frame-node .ports-left {
  padding-left: 4px;
}

.collapsed-frame-node .ports-right {
  padding-right: 4px;
}

.collapsed-frame-node .port {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: white;
  border: 2px solid var(--node-color, #6366f1);
  cursor: crosshair;
  transition: transform 0.15s, background-color 0.15s;
}

.collapsed-frame-node .port:hover {
  transform: scale(1.3);
  background: var(--node-color, #6366f1);
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

---

## 11. Technical Implementation Details

### 11.1 Complete Type Definitions

```typescript
// ==========================================
// FILE: workflow-canvas.types.ts (additions)
// ==========================================

// Add to WorkflowNodeType enum
export enum WorkflowNodeType {
  // ... existing types ...
  NOTE = 'NOTE',
  FRAME = 'FRAME',
}

// Note node configuration
export interface NoteConfiguration {
  content: string;
  backgroundColor: string;
  textColor: string;
  fontSize: 'small' | 'medium' | 'large';
  showBorder: boolean;
}

// Frame node configuration
export interface FrameConfiguration {
  label: string;
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  labelPosition: 'top-left' | 'top-center' | 'top-right';
  labelPlacement: 'inside' | 'outside';
  showLabel: boolean;
  collapsed: boolean;
  /** Stored dimensions when collapsed (for restore) */
  _expandedWidth?: number;
  _expandedHeight?: number;
}

// Extended WorkflowNode for frame support
export interface WorkflowNode {
  id: string;
  name: string;
  type: NodeType;
  position: Position;
  configuration: NodeConfiguration;
  ports: {
    inputs: NodePort[];
    configs?: NodePort[];
    outputs: NodePort[];
  };
  metadata?: NodeMetadata;
  status?: ExecutionStatus;
  selected?: boolean;
  error?: string;
  agentActivity?: AgentActivity;

  // Frame-specific properties
  /** For FRAME nodes: IDs of nodes visually contained within this frame */
  containedNodeIds?: string[];
  /** For regular nodes: ID of the frame that contains this node (if any) */
  parentFrameId?: string | null;
}

// Aggregated port for collapsed frames
export interface AggregatedPort {
  id: string;
  originalEdgeId: string;
  internalNodeId: string;
  internalPortId: string;
  label?: string;
  /** Direction relative to frame */
  direction: 'incoming' | 'outgoing';
}

// Frame resize state
export interface FrameResizeState {
  frameId: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startPosition: Position;
}

export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

// Color presets
export const NOTE_COLOR_PRESETS: ColorPreset[] = [
  { name: 'Yellow', bg: '#fef08a', text: '#713f12' },
  { name: 'Blue', bg: '#bfdbfe', text: '#1e3a5f' },
  { name: 'Green', bg: '#bbf7d0', text: '#14532d' },
  { name: 'Pink', bg: '#fbcfe8', text: '#831843' },
  { name: 'Orange', bg: '#fed7aa', text: '#7c2d12' },
  { name: 'Purple', bg: '#ddd6fe', text: '#4c1d95' },
  { name: 'Gray', bg: '#e5e7eb', text: '#374151' },
];

export const FRAME_COLOR_PRESETS: FrameColorPreset[] = [
  { name: 'Indigo', bg: 'rgba(99, 102, 241, 0.05)', border: 'rgba(99, 102, 241, 0.3)', solid: '#6366f1' },
  { name: 'Blue', bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.3)', solid: '#3b82f6' },
  { name: 'Green', bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.3)', solid: '#22c55e' },
  { name: 'Orange', bg: 'rgba(249, 115, 22, 0.05)', border: 'rgba(249, 115, 22, 0.3)', solid: '#f97316' },
  { name: 'Red', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.3)', solid: '#ef4444' },
  { name: 'Purple', bg: 'rgba(168, 85, 247, 0.05)', border: 'rgba(168, 85, 247, 0.3)', solid: '#a855f7' },
  { name: 'Gray', bg: 'rgba(107, 114, 128, 0.05)', border: 'rgba(107, 114, 128, 0.3)', solid: '#6b7280' },
];

interface ColorPreset {
  name: string;
  bg: string;
  text: string;
}

interface FrameColorPreset {
  name: string;
  bg: string;
  border: string;
  solid: string; // Used for collapsed node border
}
```

### 11.2 Frame Controller Implementation

```typescript
// ==========================================
// FILE: controllers/frame.controller.ts
// ==========================================

import { BaseCanvasController } from './base.controller.js';
import {
  WorkflowNode,
  Position,
  FrameConfiguration,
  FrameResizeState,
  ResizeHandle,
  AggregatedPort,
  WorkflowNodeType,
} from '../workflow-canvas.types.js';

export class FrameController extends BaseCanvasController {
  private resizeState: FrameResizeState | null = null;
  private readonly MIN_FRAME_WIDTH = 200;
  private readonly MIN_FRAME_HEIGHT = 150;
  private readonly CONTAINMENT_PADDING = 20;

  // ===== RESIZE OPERATIONS =====

  /**
   * Start resizing a frame from a specific handle
   */
  startResize(event: MouseEvent, frame: WorkflowNode, handle: ResizeHandle): void {
    event.stopPropagation();
    event.preventDefault();

    const config = frame.configuration as FrameConfiguration;

    this.resizeState = {
      frameId: frame.id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: config.width,
      startHeight: config.height,
      startPosition: { ...frame.position },
    };

    // Add global listeners
    document.addEventListener('mousemove', this.handleResizeDrag);
    document.addEventListener('mouseup', this.stopResize);
  }

  private handleResizeDrag = (event: MouseEvent): void => {
    if (!this.resizeState) return;

    const { handle, startX, startY, startWidth, startHeight, startPosition, frameId } = this.resizeState;
    const frame = this.host.workflow.nodes.find(n => n.id === frameId);
    if (!frame) return;

    const deltaX = (event.clientX - startX) / this.host.viewport.zoom;
    const deltaY = (event.clientY - startY) / this.host.viewport.zoom;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newX = startPosition.x;
    let newY = startPosition.y;

    // Calculate new dimensions based on handle
    switch (handle) {
      case 'se':
        newWidth = Math.max(this.MIN_FRAME_WIDTH, startWidth + deltaX);
        newHeight = Math.max(this.MIN_FRAME_HEIGHT, startHeight + deltaY);
        break;
      case 'sw':
        newWidth = Math.max(this.MIN_FRAME_WIDTH, startWidth - deltaX);
        newHeight = Math.max(this.MIN_FRAME_HEIGHT, startHeight + deltaY);
        newX = startPosition.x + (startWidth - newWidth);
        break;
      case 'ne':
        newWidth = Math.max(this.MIN_FRAME_WIDTH, startWidth + deltaX);
        newHeight = Math.max(this.MIN_FRAME_HEIGHT, startHeight - deltaY);
        newY = startPosition.y + (startHeight - newHeight);
        break;
      case 'nw':
        newWidth = Math.max(this.MIN_FRAME_WIDTH, startWidth - deltaX);
        newHeight = Math.max(this.MIN_FRAME_HEIGHT, startHeight - deltaY);
        newX = startPosition.x + (startWidth - newWidth);
        newY = startPosition.y + (startHeight - newHeight);
        break;
      case 'n':
        newHeight = Math.max(this.MIN_FRAME_HEIGHT, startHeight - deltaY);
        newY = startPosition.y + (startHeight - newHeight);
        break;
      case 's':
        newHeight = Math.max(this.MIN_FRAME_HEIGHT, startHeight + deltaY);
        break;
      case 'e':
        newWidth = Math.max(this.MIN_FRAME_WIDTH, startWidth + deltaX);
        break;
      case 'w':
        newWidth = Math.max(this.MIN_FRAME_WIDTH, startWidth - deltaX);
        newX = startPosition.x + (startWidth - newWidth);
        break;
    }

    // Snap to grid
    newX = this.snapToGrid(newX);
    newY = this.snapToGrid(newY);
    newWidth = this.snapToGrid(newWidth);
    newHeight = this.snapToGrid(newHeight);

    // Update frame
    frame.position = { x: newX, y: newY };
    (frame.configuration as FrameConfiguration).width = newWidth;
    (frame.configuration as FrameConfiguration).height = newHeight;

    this.host.requestUpdate();
  };

  stopResize = (): void => {
    if (!this.resizeState) return;

    const frame = this.host.workflow.nodes.find(n => n.id === this.resizeState!.frameId);
    if (frame) {
      // Update containment after resize
      this.updateFrameContainment(frame);

      // Record for undo
      this.host.undoController?.recordFrameResized(
        frame,
        this.resizeState.startWidth,
        this.resizeState.startHeight,
        this.resizeState.startPosition
      );
    }

    this.resizeState = null;
    document.removeEventListener('mousemove', this.handleResizeDrag);
    document.removeEventListener('mouseup', this.stopResize);

    this.host.dispatchWorkflowChanged();
  };

  // ===== CONTAINMENT DETECTION =====

  /**
   * Check if a node's bounds are within a frame's bounds
   */
  isNodeInFrame(node: WorkflowNode, frame: WorkflowNode): boolean {
    if (node.type === WorkflowNodeType.FRAME || node.type === WorkflowNodeType.NOTE) {
      return false; // Frames and notes cannot be contained
    }

    const config = frame.configuration as FrameConfiguration;
    const nodeWidth = 200; // Standard node width
    const nodeHeight = 80; // Standard node height

    const frameLeft = frame.position.x;
    const frameTop = frame.position.y;
    const frameRight = frameLeft + config.width;
    const frameBottom = frameTop + config.height;

    const nodeLeft = node.position.x;
    const nodeTop = node.position.y;
    const nodeRight = nodeLeft + nodeWidth;
    const nodeBottom = nodeTop + nodeHeight;

    // Node center must be inside frame
    const nodeCenterX = nodeLeft + nodeWidth / 2;
    const nodeCenterY = nodeTop + nodeHeight / 2;

    return (
      nodeCenterX >= frameLeft &&
      nodeCenterX <= frameRight &&
      nodeCenterY >= frameTop &&
      nodeCenterY <= frameBottom
    );
  }

  /**
   * Update frame's containedNodeIds based on current node positions
   */
  updateFrameContainment(frame: WorkflowNode): void {
    const containedIds: string[] = [];

    for (const node of this.host.workflow.nodes) {
      if (node.id === frame.id) continue;
      if (node.type === WorkflowNodeType.FRAME) continue;

      if (this.isNodeInFrame(node, frame)) {
        containedIds.push(node.id);
        node.parentFrameId = frame.id;
      } else if (node.parentFrameId === frame.id) {
        node.parentFrameId = null;
      }
    }

    frame.containedNodeIds = containedIds;
  }

  /**
   * Update all frames' containment after node move
   */
  updateAllFrameContainments(): void {
    const frames = this.host.workflow.nodes.filter(n => n.type === WorkflowNodeType.FRAME);
    for (const frame of frames) {
      this.updateFrameContainment(frame);
    }
  }

  /**
   * Get all nodes contained in a frame
   */
  getContainedNodes(frame: WorkflowNode): WorkflowNode[] {
    const ids = new Set(frame.containedNodeIds || []);
    return this.host.workflow.nodes.filter(n => ids.has(n.id));
  }

  // ===== MOVE WITH CONTENTS =====

  /**
   * Move a frame and all its contained nodes by delta
   */
  moveFrameWithContents(frame: WorkflowNode, deltaX: number, deltaY: number): void {
    // Move frame
    frame.position.x += deltaX;
    frame.position.y += deltaY;

    // Move contained nodes
    const containedNodes = this.getContainedNodes(frame);
    for (const node of containedNodes) {
      node.position.x += deltaX;
      node.position.y += deltaY;
    }
  }

  // ===== COLLAPSE / EXPAND =====

  /**
   * Toggle frame collapsed state
   */
  toggleCollapsed(frame: WorkflowNode): void {
    const config = frame.configuration as FrameConfiguration;

    if (config.collapsed) {
      // Expand: restore original dimensions
      config.width = config._expandedWidth || 400;
      config.height = config._expandedHeight || 300;
      config.collapsed = false;

      // Show contained nodes
      this.setContainedNodesVisibility(frame, true);
    } else {
      // Collapse: save dimensions and collapse
      config._expandedWidth = config.width;
      config._expandedHeight = config.height;
      config.collapsed = true;

      // Hide contained nodes
      this.setContainedNodesVisibility(frame, false);
    }

    this.host.requestUpdate();
    this.host.dispatchWorkflowChanged();
  }

  /**
   * Set visibility of nodes contained in a frame
   */
  private setContainedNodesVisibility(frame: WorkflowNode, visible: boolean): void {
    const containedNodes = this.getContainedNodes(frame);
    for (const node of containedNodes) {
      // Use a metadata flag for visibility
      node.metadata = node.metadata || {};
      (node.metadata as any)._hiddenByFrame = !visible;
    }

    // Also handle edges between contained nodes
    const containedIds = new Set(frame.containedNodeIds || []);
    for (const edge of this.host.workflow.edges) {
      const sourceInside = containedIds.has(edge.sourceNodeId);
      const targetInside = containedIds.has(edge.targetNodeId);

      // Internal edges (both nodes inside) should be hidden
      if (sourceInside && targetInside) {
        (edge as any)._hiddenByFrame = !visible;
      }
    }
  }

  // ===== AGGREGATED PORTS =====

  /**
   * Calculate aggregated ports for a collapsed frame
   */
  getAggregatedPorts(frame: WorkflowNode): { inputs: AggregatedPort[]; outputs: AggregatedPort[] } {
    const containedIds = new Set(frame.containedNodeIds || []);
    const inputs: AggregatedPort[] = [];
    const outputs: AggregatedPort[] = [];

    for (const edge of this.host.workflow.edges) {
      const sourceInside = containedIds.has(edge.sourceNodeId);
      const targetInside = containedIds.has(edge.targetNodeId);

      // External → Internal = Input
      if (!sourceInside && targetInside) {
        const sourceNode = this.host.workflow.nodes.find(n => n.id === edge.sourceNodeId);
        inputs.push({
          id: `agg-in-${edge.id}`,
          originalEdgeId: edge.id,
          internalNodeId: edge.targetNodeId,
          internalPortId: edge.targetPortId,
          label: sourceNode?.name || 'Input',
          direction: 'incoming',
        });
      }

      // Internal → External = Output
      if (sourceInside && !targetInside) {
        const targetNode = this.host.workflow.nodes.find(n => n.id === edge.targetNodeId);
        outputs.push({
          id: `agg-out-${edge.id}`,
          originalEdgeId: edge.id,
          internalNodeId: edge.sourceNodeId,
          internalPortId: edge.sourcePortId,
          label: targetNode?.name || 'Output',
          direction: 'outgoing',
        });
      }
    }

    return { inputs, outputs };
  }

  // ===== FIT TO CONTENTS =====

  /**
   * Auto-resize frame to fit its contained nodes with padding
   */
  fitToContents(frame: WorkflowNode, padding: number = 40): void {
    const containedNodes = this.getContainedNodes(frame);
    if (containedNodes.length === 0) return;

    const nodeWidth = 200;
    const nodeHeight = 80;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const node of containedNodes) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    }

    const config = frame.configuration as FrameConfiguration;
    frame.position = {
      x: minX - padding,
      y: minY - padding - (config.labelPlacement === 'outside' ? 24 : 0),
    };
    config.width = maxX - minX + padding * 2;
    config.height = maxY - minY + padding * 2 + (config.labelPlacement === 'outside' ? 24 : 0);

    this.host.requestUpdate();
    this.host.dispatchWorkflowChanged();
  }

  // ===== CREATE FRAME FROM SELECTION =====

  /**
   * Create a new frame around currently selected nodes
   */
  createFrameFromSelection(): WorkflowNode | null {
    const selectedNodes = this.host.workflow.nodes.filter(
      n => this.host.selectedNodeIds.has(n.id) &&
           n.type !== WorkflowNodeType.FRAME &&
           n.type !== WorkflowNodeType.NOTE
    );

    if (selectedNodes.length === 0) return null;

    const nodeWidth = 200;
    const nodeHeight = 80;
    const padding = 40;

    // Calculate bounds
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const node of selectedNodes) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    }

    // Create frame node
    const frame: WorkflowNode = {
      id: `frame-${Date.now()}`,
      name: 'Group',
      type: WorkflowNodeType.FRAME,
      position: {
        x: minX - padding,
        y: minY - padding - 24, // Account for outside label
      },
      configuration: {
        label: 'Group',
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2 + 24,
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        borderColor: 'rgba(99, 102, 241, 0.3)',
        labelPosition: 'top-left',
        labelPlacement: 'outside',
        showLabel: true,
        collapsed: false,
      },
      ports: { inputs: [], outputs: [] },
      containedNodeIds: selectedNodes.map(n => n.id),
    };

    // Update node parentFrameId
    for (const node of selectedNodes) {
      node.parentFrameId = frame.id;
    }

    // Add frame to workflow (at beginning so it renders behind)
    this.host.workflow.nodes.unshift(frame);

    this.host.requestUpdate();
    this.host.dispatchWorkflowChanged();

    return frame;
  }
}
```

### 11.3 Edge Rendering with Collapsed Frames

```typescript
// ==========================================
// FILE: templates/edges.template.ts (additions)
// ==========================================

/**
 * Render edges, handling collapsed frames
 */
export function renderEdges(
  edges: WorkflowEdge[],
  nodes: WorkflowNode[],
  viewport: CanvasViewport,
  selectedEdgeIds: Set<string>,
  frameController: FrameController
): TemplateResult {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const collapsedFrames = nodes.filter(
    n => n.type === WorkflowNodeType.FRAME &&
         (n.configuration as FrameConfiguration).collapsed
  );

  // Build set of nodes hidden by collapsed frames
  const hiddenNodeIds = new Set<string>();
  for (const frame of collapsedFrames) {
    for (const nodeId of frame.containedNodeIds || []) {
      hiddenNodeIds.add(nodeId);
    }
  }

  return svg`
    <g class="edges-layer">
      ${edges.map(edge => {
        // Skip hidden internal edges
        if ((edge as any)._hiddenByFrame) return nothing;

        const sourceNode = nodeMap.get(edge.sourceNodeId);
        const targetNode = nodeMap.get(edge.targetNodeId);
        if (!sourceNode || !targetNode) return nothing;

        const sourceHidden = hiddenNodeIds.has(edge.sourceNodeId);
        const targetHidden = hiddenNodeIds.has(edge.targetNodeId);

        // Both hidden = internal edge, skip
        if (sourceHidden && targetHidden) return nothing;

        // Determine actual source/target positions
        let sourcePos: Position;
        let targetPos: Position;

        if (sourceHidden) {
          // Source is inside collapsed frame, connect from frame's output port
          const frame = findContainingFrame(sourceNode, collapsedFrames);
          if (!frame) return nothing;
          sourcePos = getCollapsedFramePortPosition(frame, edge.id, 'output', frameController);
        } else {
          sourcePos = getPortPosition(sourceNode, edge.sourcePortId, 'output');
        }

        if (targetHidden) {
          // Target is inside collapsed frame, connect to frame's input port
          const frame = findContainingFrame(targetNode, collapsedFrames);
          if (!frame) return nothing;
          targetPos = getCollapsedFramePortPosition(frame, edge.id, 'input', frameController);
        } else {
          targetPos = getPortPosition(targetNode, edge.targetPortId, 'input');
        }

        return renderEdgePath(edge, sourcePos, targetPos, selectedEdgeIds.has(edge.id));
      })}
    </g>
  `;
}

function findContainingFrame(node: WorkflowNode, frames: WorkflowNode[]): WorkflowNode | undefined {
  return frames.find(f => f.containedNodeIds?.includes(node.id));
}

function getCollapsedFramePortPosition(
  frame: WorkflowNode,
  edgeId: string,
  type: 'input' | 'output',
  frameController: FrameController
): Position {
  const aggregated = frameController.getAggregatedPorts(frame);
  const ports = type === 'input' ? aggregated.inputs : aggregated.outputs;
  const portIndex = ports.findIndex(p => p.originalEdgeId === edgeId);

  const collapsedWidth = 220;
  const collapsedHeight = 80;
  const portSpacing = 16;
  const totalPorts = ports.length;
  const startY = (collapsedHeight - (totalPorts - 1) * portSpacing) / 2;

  return {
    x: frame.position.x + (type === 'input' ? 0 : collapsedWidth),
    y: frame.position.y + startY + portIndex * portSpacing,
  };
}
```

### 11.4 Undo/Redo Operations

```typescript
// ==========================================
// FILE: controllers/undo.controller.ts (additions)
// ==========================================

interface FrameResizedAction {
  type: 'frame-resized';
  frameId: string;
  prevWidth: number;
  prevHeight: number;
  prevPosition: Position;
  newWidth: number;
  newHeight: number;
  newPosition: Position;
}

interface FrameCollapsedAction {
  type: 'frame-collapsed';
  frameId: string;
  prevCollapsed: boolean;
  prevContainedVisibility: Map<string, boolean>;
}

interface NodesAddedToFrameAction {
  type: 'nodes-added-to-frame';
  frameId: string;
  nodeIds: string[];
  prevParentFrameIds: Map<string, string | null>;
}

// Add to UndoController class:

recordFrameResized(
  frame: WorkflowNode,
  prevWidth: number,
  prevHeight: number,
  prevPosition: Position
): void {
  const config = frame.configuration as FrameConfiguration;
  this.pushAction({
    type: 'frame-resized',
    frameId: frame.id,
    prevWidth,
    prevHeight,
    prevPosition,
    newWidth: config.width,
    newHeight: config.height,
    newPosition: { ...frame.position },
  });
}

recordFrameCollapsed(frame: WorkflowNode, prevCollapsed: boolean): void {
  const containedNodes = this.host.frameController?.getContainedNodes(frame) || [];
  const prevVisibility = new Map<string, boolean>();
  for (const node of containedNodes) {
    prevVisibility.set(node.id, !(node.metadata as any)?._hiddenByFrame);
  }

  this.pushAction({
    type: 'frame-collapsed',
    frameId: frame.id,
    prevCollapsed,
    prevContainedVisibility: prevVisibility,
  });
}

private undoFrameResized(action: FrameResizedAction): void {
  const frame = this.host.workflow.nodes.find(n => n.id === action.frameId);
  if (!frame) return;

  const config = frame.configuration as FrameConfiguration;
  config.width = action.prevWidth;
  config.height = action.prevHeight;
  frame.position = { ...action.prevPosition };

  this.host.frameController?.updateFrameContainment(frame);
}

private redoFrameResized(action: FrameResizedAction): void {
  const frame = this.host.workflow.nodes.find(n => n.id === action.frameId);
  if (!frame) return;

  const config = frame.configuration as FrameConfiguration;
  config.width = action.newWidth;
  config.height = action.newHeight;
  frame.position = { ...action.newPosition };

  this.host.frameController?.updateFrameContainment(frame);
}
```

### 11.5 Drag Controller Integration

```typescript
// ==========================================
// FILE: controllers/drag.controller.ts (modifications)
// ==========================================

// In handleDrag method, add frame-aware logic:

handleDrag(event: MouseEvent): void {
  if (!this.dragState) return;

  const deltaX = (event.clientX - this.dragState.startX) / this.host.viewport.zoom;
  const deltaY = (event.clientY - this.dragState.startY) / this.host.viewport.zoom;

  const snappedDeltaX = this.snapToGrid(deltaX);
  const snappedDeltaY = this.snapToGrid(deltaY);

  for (const nodeId of this.host.selectedNodeIds) {
    const node = this.host.workflow.nodes.find(n => n.id === nodeId);
    if (!node) continue;

    const startPos = this.dragState.startPositions.get(nodeId);
    if (!startPos) continue;

    // Check if this is a frame node
    if (node.type === WorkflowNodeType.FRAME) {
      // Move frame with all its contents
      const frameDeltaX = startPos.x + snappedDeltaX - node.position.x;
      const frameDeltaY = startPos.y + snappedDeltaY - node.position.y;

      this.host.frameController?.moveFrameWithContents(node, frameDeltaX, frameDeltaY);
    } else {
      // Regular node movement
      node.position = {
        x: startPos.x + snappedDeltaX,
        y: startPos.y + snappedDeltaY,
      };
    }
  }

  this.host.requestUpdate();
}

// In stopDrag method, update frame containments:

stopDrag(): void {
  if (!this.dragState) return;

  // Update all frame containments after drag
  this.host.frameController?.updateAllFrameContainments();

  // Record for undo
  // ... existing undo logic ...

  this.dragState = null;
  this.host.dispatchWorkflowChanged();
}
```

### 11.6 Workflow Serialization

```typescript
// ==========================================
// Serialization considerations
// ==========================================

/**
 * When saving/loading workflows, ensure:
 * 1. Frame nodes are serialized with containedNodeIds
 * 2. Regular nodes preserve parentFrameId reference
 * 3. Collapsed state and dimensions are preserved
 */

interface SerializedWorkflow {
  // ... existing fields ...
  nodes: SerializedNode[];
}

interface SerializedNode {
  // ... existing fields ...
  containedNodeIds?: string[];  // For FRAME nodes
  parentFrameId?: string | null; // For regular nodes
}

/**
 * On workflow load, validate and repair frame relationships:
 * - Remove invalid containedNodeIds (nodes that don't exist)
 * - Clear parentFrameId for nodes not in any frame's containedNodeIds
 * - Ensure no circular containment
 */
function validateFrameRelationships(workflow: Workflow): void {
  const nodeIds = new Set(workflow.nodes.map(n => n.id));
  const frames = workflow.nodes.filter(n => n.type === WorkflowNodeType.FRAME);

  for (const frame of frames) {
    // Filter out invalid containedNodeIds
    frame.containedNodeIds = (frame.containedNodeIds || []).filter(id => nodeIds.has(id));
  }

  // Build containment map
  const nodeToFrame = new Map<string, string>();
  for (const frame of frames) {
    for (const nodeId of frame.containedNodeIds || []) {
      nodeToFrame.set(nodeId, frame.id);
    }
  }

  // Update parentFrameId on nodes
  for (const node of workflow.nodes) {
    if (node.type === WorkflowNodeType.FRAME) continue;
    node.parentFrameId = nodeToFrame.get(node.id) || null;
  }
}
```

### 11.7 Performance Optimizations

```typescript
// ==========================================
// Performance considerations
// ==========================================

/**
 * 1. Memoize containment calculations
 */
class FrameController {
  private containmentCache = new Map<string, string[]>();
  private containmentCacheValid = false;

  invalidateContainmentCache(): void {
    this.containmentCacheValid = false;
    this.containmentCache.clear();
  }

  getContainedNodesOptimized(frame: WorkflowNode): WorkflowNode[] {
    if (!this.containmentCacheValid) {
      this.rebuildContainmentCache();
    }
    const ids = this.containmentCache.get(frame.id) || [];
    return ids.map(id => this.host.workflow.nodes.find(n => n.id === id)!).filter(Boolean);
  }

  private rebuildContainmentCache(): void {
    this.containmentCache.clear();
    const frames = this.host.workflow.nodes.filter(n => n.type === WorkflowNodeType.FRAME);
    for (const frame of frames) {
      this.containmentCache.set(frame.id, [...(frame.containedNodeIds || [])]);
    }
    this.containmentCacheValid = true;
  }
}

/**
 * 2. Debounce containment updates during drag
 */
private updateContainmentDebounced = debounce(() => {
  this.updateAllFrameContainments();
}, 100);

/**
 * 3. Use CSS containment for frame rendering
 */
.frame-node {
  contain: layout style;
}

.collapsed-frame-node {
  contain: layout style paint;
}

/**
 * 4. Virtualize hidden nodes in collapsed frames
 * - Don't render DOM for hidden nodes
 * - Only render edges that connect to/from frame
 */
private renderNodes() {
  return this.workflow.nodes
    .filter(node => !(node.metadata as any)?._hiddenByFrame)
    .map(node => this.renderNode(node));
}
```

### 11.8 Edge Cases and Validation

```typescript
// ==========================================
// Edge cases to handle
// ==========================================

/**
 * 1. Deleting a frame
 * - Option A: Keep contained nodes (default)
 * - Option B: Delete contained nodes (with confirmation)
 */
deleteFrame(frame: WorkflowNode, deleteContents: boolean = false): void {
  if (deleteContents) {
    // Delete all contained nodes and their edges
    const containedIds = new Set(frame.containedNodeIds || []);
    this.host.workflow.edges = this.host.workflow.edges.filter(
      e => !containedIds.has(e.sourceNodeId) && !containedIds.has(e.targetNodeId)
    );
    this.host.workflow.nodes = this.host.workflow.nodes.filter(
      n => n.id !== frame.id && !containedIds.has(n.id)
    );
  } else {
    // Only delete frame, clear parentFrameId on contained nodes
    for (const nodeId of frame.containedNodeIds || []) {
      const node = this.host.workflow.nodes.find(n => n.id === nodeId);
      if (node) node.parentFrameId = null;
    }
    this.host.workflow.nodes = this.host.workflow.nodes.filter(n => n.id !== frame.id);
  }
}

/**
 * 2. Copy/paste frame with contents
 */
pasteFrameWithContents(frame: WorkflowNode, offset: Position): WorkflowNode {
  const newFrame = deepClone(frame);
  newFrame.id = generateId();
  newFrame.position.x += offset.x;
  newFrame.position.y += offset.y;

  // Clone contained nodes
  const idMap = new Map<string, string>();
  const newContainedIds: string[] = [];

  for (const oldId of frame.containedNodeIds || []) {
    const oldNode = this.host.workflow.nodes.find(n => n.id === oldId);
    if (!oldNode) continue;

    const newNode = deepClone(oldNode);
    newNode.id = generateId();
    newNode.position.x += offset.x;
    newNode.position.y += offset.y;
    newNode.parentFrameId = newFrame.id;

    idMap.set(oldId, newNode.id);
    newContainedIds.push(newNode.id);
    this.host.workflow.nodes.push(newNode);
  }

  newFrame.containedNodeIds = newContainedIds;

  // Clone internal edges with new IDs
  for (const edge of this.host.workflow.edges) {
    const newSourceId = idMap.get(edge.sourceNodeId);
    const newTargetId = idMap.get(edge.targetNodeId);

    if (newSourceId && newTargetId) {
      // Internal edge - clone it
      const newEdge = deepClone(edge);
      newEdge.id = generateId();
      newEdge.sourceNodeId = newSourceId;
      newEdge.targetNodeId = newTargetId;
      this.host.workflow.edges.push(newEdge);
    }
  }

  this.host.workflow.nodes.push(newFrame);
  return newFrame;
}

/**
 * 3. Prevent invalid operations
 */
canContainNode(frame: WorkflowNode, node: WorkflowNode): boolean {
  // Cannot contain frames
  if (node.type === WorkflowNodeType.FRAME) return false;

  // Cannot contain itself
  if (node.id === frame.id) return false;

  // Cannot contain notes (optional - could allow)
  if (node.type === WorkflowNodeType.NOTE) return false;

  return true;
}

/**
 * 4. Handle frame overlap
 * - When a node is in bounds of multiple frames, use the smallest frame
 */
findContainingFrame(node: WorkflowNode): WorkflowNode | null {
  const frames = this.host.workflow.nodes.filter(n => n.type === WorkflowNodeType.FRAME);
  const containingFrames = frames.filter(f => this.isNodeInFrame(node, f));

  if (containingFrames.length === 0) return null;
  if (containingFrames.length === 1) return containingFrames[0];

  // Return smallest frame by area
  return containingFrames.reduce((smallest, frame) => {
    const config = frame.configuration as FrameConfiguration;
    const smallestConfig = smallest.configuration as FrameConfiguration;
    const area = config.width * config.height;
    const smallestArea = smallestConfig.width * smallestConfig.height;
    return area < smallestArea ? frame : smallest;
  });
}
```

---

## 12. Context Menu Integration

```typescript
// ==========================================
// Context menu options for frames
// ==========================================

const frameContextMenuItems = [
  {
    id: 'collapse',
    label: (frame: WorkflowNode) => {
      const config = frame.configuration as FrameConfiguration;
      return config.collapsed ? 'Expand' : 'Collapse';
    },
    icon: (frame: WorkflowNode) => {
      const config = frame.configuration as FrameConfiguration;
      return config.collapsed ? 'maximize-2' : 'minimize-2';
    },
    action: (frame: WorkflowNode) => this.frameController.toggleCollapsed(frame),
  },
  {
    id: 'fit-contents',
    label: 'Fit to Contents',
    icon: 'maximize',
    action: (frame: WorkflowNode) => this.frameController.fitToContents(frame),
    disabled: (frame: WorkflowNode) => (frame.containedNodeIds?.length || 0) === 0,
  },
  { type: 'separator' },
  {
    id: 'edit-label',
    label: 'Edit Label',
    icon: 'edit-2',
    action: (frame: WorkflowNode) => this.startInlineLabelEdit(frame),
  },
  {
    id: 'change-color',
    label: 'Change Color',
    icon: 'palette',
    submenu: FRAME_COLOR_PRESETS.map(preset => ({
      id: `color-${preset.name}`,
      label: preset.name,
      color: preset.solid,
      action: (frame: WorkflowNode) => this.setFrameColor(frame, preset),
    })),
  },
  { type: 'separator' },
  {
    id: 'delete-frame-only',
    label: 'Delete Frame Only',
    icon: 'trash-2',
    action: (frame: WorkflowNode) => this.frameController.deleteFrame(frame, false),
  },
  {
    id: 'delete-with-contents',
    label: 'Delete with Contents',
    icon: 'trash',
    variant: 'danger',
    action: (frame: WorkflowNode) => {
      if (confirm(`Delete frame and ${frame.containedNodeIds?.length || 0} contained nodes?`)) {
        this.frameController.deleteFrame(frame, true);
      }
    },
  },
];

// Canvas context menu addition
const canvasContextMenuItems = [
  // ... existing items ...
  { type: 'separator' },
  {
    id: 'create-frame',
    label: 'Create Frame from Selection',
    icon: 'square',
    disabled: () => this.selectedNodeIds.size === 0,
    action: () => this.frameController.createFrameFromSelection(),
  },
];
```
