/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  NodeType,
  Position,
  CanvasViewport,
  CanvasMode,
  createNodeFromTemplate,
  NODE_TEMPLATES,
  NODE_CATEGORIES,
  WorkflowNodeType,
  AgentNodeType,
  NodeConfiguration,
} from './workflow-canvas.types.js';
import { styles } from './workflow-canvas.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import './workflow-node.component.js';
import '../icon/icon.component.js';
import '../input/input.component.js';

interface ConnectionState {
  sourceNodeId: string;
  sourcePortId: string;
  sourceIsInput: boolean;
  mouseX: number;
  mouseY: number;
}

interface DragState {
  nodeId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Workflow canvas component for visual workflow editing
 *
 * @element workflow-canvas
 * @fires workflow-changed - When workflow is modified
 * @fires node-selected - When a node is selected
 * @fires node-configured - When a node configuration is requested
 */
@customElement('workflow-canvas')
export class WorkflowCanvasElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  @property({ type: Object })
  workflow: Workflow = {
    id: '',
    name: 'New Workflow',
    nodes: [],
    edges: [],
  };

  @property({ type: Boolean })
  readonly = false;

  @property({ type: Boolean })
  showMinimap = true;

  @property({ type: Boolean })
  showToolbar = true;

  @property({ type: Boolean })
  showPalette = false;

  @state()
  private viewport: CanvasViewport = { zoom: 1, panX: 0, panY: 0 };

  @state()
  private mode: CanvasMode = CanvasMode.SELECT;

  @state()
  private selectedNodeIds: Set<string> = new Set();

  @state()
  private selectedEdgeIds: Set<string> = new Set();

  @state()
  private connectionState: ConnectionState | null = null;

  @state()
  private dragState: DragState | null = null;

  @state()
  private contextMenu: { x: number; y: number; type: 'canvas' | 'node' | 'edge'; target?: string } | null = null;

  @state()
  private isPanning = false;

  @state()
  private panStart = { x: 0, y: 0 };

  @state()
  private expandedCategories: Set<string> = new Set(['control', 'action', 'agent']);

  @state()
  private configuredNode: WorkflowNode | null = null;

  @query('.canvas-wrapper')
  private canvasWrapper!: HTMLElement;

  @query('.canvas-viewport')
  private canvasViewport!: HTMLElement;

  @query('.config-panel')
  private configPanel!: HTMLElement;

  override async connectedCallback() {
    super.connectedCallback();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('mouseup', this.handleGlobalMouseUp);
    window.addEventListener('mousemove', this.handleGlobalMouseMove);
    // Capture wheel at window level to prevent browser navigation
    window.addEventListener('wheel', this.handleGridWheel, { passive: false, capture: true });
    await this.updateComplete;
    this.updateTransform();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('mouseup', this.handleGlobalMouseUp);
    window.removeEventListener('mousemove', this.handleGlobalMouseMove);
    window.removeEventListener('wheel', this.handleGridWheel, { capture: true });
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    // Don't handle key events if focus is in an input field
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.selectedNodeIds.size > 0 || this.selectedEdgeIds.size > 0) {
        e.preventDefault();
        this.deleteSelected();
      }
    }
    if (e.key === 'Escape') {
      this.connectionState = null;
      this.contextMenu = null;
      this.configuredNode = null;
      this.clearSelection();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      this.selectAll();
    }

    // Arrow key navigation between nodes
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      this.navigateToNode(e.key as 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight');
    }

    // Enter key to open config panel for selected node
    if (e.key === 'Enter' && this.selectedNodeIds.size === 1) {
      const nodeId = Array.from(this.selectedNodeIds)[0];
      const node = this.workflow.nodes.find(n => n.id === nodeId);
      if (node) {
        this.configuredNode = node;
      }
    }
  };

  private navigateToNode(direction: 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight') {
    if (this.workflow.nodes.length === 0) return;

    // Get current selected node or use center of viewport
    let currentPosition: Position;
    if (this.selectedNodeIds.size > 0) {
      const selectedId = Array.from(this.selectedNodeIds)[0];
      const selectedNode = this.workflow.nodes.find(n => n.id === selectedId);
      if (selectedNode) {
        currentPosition = selectedNode.position;
      } else {
        currentPosition = { x: 0, y: 0 };
      }
    } else {
      // No node selected, start from center of viewport
      currentPosition = {
        x: (-this.viewport.panX + 400) / this.viewport.zoom,
        y: (-this.viewport.panY + 300) / this.viewport.zoom,
      };
    }

    // Find the nearest node in the specified direction
    let bestNode: WorkflowNode | null = null;
    let bestScore = Infinity;

    for (const node of this.workflow.nodes) {
      if (this.selectedNodeIds.has(node.id)) continue;

      const dx = node.position.x - currentPosition.x;
      const dy = node.position.y - currentPosition.y;

      // Check if node is in the correct direction
      let isInDirection = false;
      let primaryDist = 0;
      let secondaryDist = 0;

      switch (direction) {
        case 'ArrowUp':
          isInDirection = dy < -10;
          primaryDist = Math.abs(dy);
          secondaryDist = Math.abs(dx);
          break;
        case 'ArrowDown':
          isInDirection = dy > 10;
          primaryDist = Math.abs(dy);
          secondaryDist = Math.abs(dx);
          break;
        case 'ArrowLeft':
          isInDirection = dx < -10;
          primaryDist = Math.abs(dx);
          secondaryDist = Math.abs(dy);
          break;
        case 'ArrowRight':
          isInDirection = dx > 10;
          primaryDist = Math.abs(dx);
          secondaryDist = Math.abs(dy);
          break;
      }

      if (isInDirection) {
        // Score: prioritize primary direction, penalize secondary axis deviation
        const score = primaryDist + secondaryDist * 2;
        if (score < bestScore) {
          bestScore = score;
          bestNode = node;
        }
      }
    }

    // If no node found in direction, try to find the closest node overall
    if (!bestNode && this.selectedNodeIds.size === 0) {
      for (const node of this.workflow.nodes) {
        const dx = node.position.x - currentPosition.x;
        const dy = node.position.y - currentPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestScore) {
          bestScore = dist;
          bestNode = node;
        }
      }
    }

    if (bestNode) {
      this.clearSelection();
      this.selectedNodeIds.add(bestNode.id);
      this.selectedNodeIds = new Set(this.selectedNodeIds);

      // Update config panel if it's open
      if (this.configuredNode) {
        this.configuredNode = bestNode;
      }

      this.dispatchNodeSelected(bestNode);
    }
  }

  private handleGlobalMouseUp = () => {
    this.dragState = null;
    this.isPanning = false;
    if (this.connectionState) {
      this.connectionState = null;
    }
  };

  private handleGlobalMouseMove = (e: MouseEvent) => {
    if (this.dragState) {
      this.handleNodeDrag(e);
    }
    if (this.isPanning) {
      this.handlePan(e);
    }
    if (this.connectionState) {
      this.updateConnectionLine(e);
    }
  };

  private handleCanvasMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isCanvasBackground = target.classList.contains('canvas-grid') || target.classList.contains('canvas-wrapper');

    if (e.button === 1) {
      // Middle click for panning
      e.preventDefault();
      this.isPanning = true;
      this.panStart = { x: e.clientX - this.viewport.panX, y: e.clientY - this.viewport.panY };
    } else if (e.button === 0 && isCanvasBackground) {
      // Left click on empty canvas - start panning (like n8n)
      e.preventDefault();
      this.isPanning = true;
      this.panStart = { x: e.clientX - this.viewport.panX, y: e.clientY - this.viewport.panY };
      this.clearSelection();
    }
  };

  private handleCanvasContextMenu = (e: MouseEvent) => {
    e.preventDefault();

    // Check if a node is selected - if so, show node context menu
    const menuType = this.selectedNodeIds.size > 0 ? 'node' : 'canvas';

    this.contextMenu = {
      x: e.clientX,
      y: e.clientY,
      type: menuType,
    };
  };

  private handleGridWheel = (e: WheelEvent) => {
    const target = e.target as HTMLElement;

    // Check if event is within our canvas (using shadow DOM)
    const path = e.composedPath();
    const isInCanvas = path.some(el => el === this.canvasWrapper || el === this);
    if (!isInCanvas) return;

    // Skip if inside scrollable panels
    if (target.closest('.node-palette') || target.closest('.config-panel')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const { deltaX, deltaY, ctrlKey, metaKey } = e;

    if (ctrlKey || metaKey) {
      // Zoom
      const zoom = Math.max(0.25, Math.min(2, this.viewport.zoom * (1 - deltaY * 0.01)));
      const rect = this.canvasWrapper.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const scale = zoom / this.viewport.zoom;
      this.viewport.zoom = zoom;
      this.viewport.panX = mx - (mx - this.viewport.panX) * scale;
      this.viewport.panY = my - (my - this.viewport.panY) * scale;
    } else {
      // Pan
      this.viewport.panX -= deltaX;
      this.viewport.panY -= deltaY;
    }

    this.updateTransform();
  };

  private updateTransform() {
    if (this.canvasViewport) {
      this.canvasViewport.style.transform =
        `translate(${this.viewport.panX}px, ${this.viewport.panY}px) scale(${this.viewport.zoom})`;
    }
    // Update config panel position to follow the node
    this.updateConfigPanelPosition();
  }

  private updateConfigPanelPosition() {
    if (this.configPanel && this.configuredNode) {
      const nodeWidth = 180;
      const panelOffset = 20;
      const panelX = (this.configuredNode.position.x + nodeWidth + panelOffset) * this.viewport.zoom + this.viewport.panX;
      const panelY = this.configuredNode.position.y * this.viewport.zoom + this.viewport.panY;
      this.configPanel.style.left = `${panelX}px`;
      this.configPanel.style.top = `${panelY}px`;
    }
  }

  private handlePan(e: MouseEvent) {
    this.viewport.panX = e.clientX - this.panStart.x;
    this.viewport.panY = e.clientY - this.panStart.y;
    this.updateTransform();
  }

  private handleNodeMouseDown(e: CustomEvent) {
    const { node, event } = e.detail;

    if (!event.shiftKey) {
      if (!this.selectedNodeIds.has(node.id)) {
        this.clearSelection();
      }
    }

    this.selectedNodeIds.add(node.id);
    this.selectedNodeIds = new Set(this.selectedNodeIds);

    // Update config panel if it's open
    if (this.configuredNode) {
      this.configuredNode = node;
    }

    // Start dragging
    const rect = this.canvasWrapper.getBoundingClientRect();
    this.dragState = {
      nodeId: node.id,
      startX: node.position.x,
      startY: node.position.y,
      offsetX: (event.clientX - rect.left - this.viewport.panX) / this.viewport.zoom - node.position.x,
      offsetY: (event.clientY - rect.top - this.viewport.panY) / this.viewport.zoom - node.position.y,
    };

    this.dispatchNodeSelected(node);
  }

  private handleNodeDrag(e: MouseEvent) {
    if (!this.dragState) return;

    const rect = this.canvasWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.viewport.panX) / this.viewport.zoom - this.dragState.offsetX;
    const y = (e.clientY - rect.top - this.viewport.panY) / this.viewport.zoom - this.dragState.offsetY;

    // Snap to grid
    const snappedX = Math.round(x / 20) * 20;
    const snappedY = Math.round(y / 20) * 20;

    // Move all selected nodes
    const deltaX = snappedX - this.dragState.startX;
    const deltaY = snappedY - this.dragState.startY;

    this.workflow = {
      ...this.workflow,
      nodes: this.workflow.nodes.map(node => {
        if (this.selectedNodeIds.has(node.id)) {
          if (node.id === this.dragState!.nodeId) {
            return { ...node, position: { x: snappedX, y: snappedY } };
          }
          return {
            ...node,
            position: {
              x: node.position.x + deltaX,
              y: node.position.y + deltaY,
            },
          };
        }
        return node;
      }),
    };

    this.dragState = { ...this.dragState, startX: snappedX, startY: snappedY };

    // Update config panel position if the configured node is being dragged
    if (this.configuredNode && this.selectedNodeIds.has(this.configuredNode.id)) {
      const updatedNode = this.workflow.nodes.find(n => n.id === this.configuredNode!.id);
      if (updatedNode) {
        this.configuredNode = updatedNode;
        this.updateConfigPanelPosition();
      }
    }
  }

  private handleNodeDblClick(e: CustomEvent) {
    const { node } = e.detail;
    // Open configuration panel
    this.configuredNode = node;
    this.dispatchEvent(new CustomEvent('node-configured', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  private handlePortMouseDown(e: CustomEvent) {
    const { node, port, isInput, event } = e.detail;
    const rect = this.canvasWrapper.getBoundingClientRect();

    this.connectionState = {
      sourceNodeId: node.id,
      sourcePortId: port.id,
      sourceIsInput: isInput,
      mouseX: (event.clientX - rect.left - this.viewport.panX) / this.viewport.zoom,
      mouseY: (event.clientY - rect.top - this.viewport.panY) / this.viewport.zoom,
    };
  }

  private handlePortMouseUp(e: CustomEvent) {
    if (!this.connectionState) return;

    const { node, port, isInput } = e.detail;

    // Can't connect input to input or output to output
    if (this.connectionState.sourceIsInput === isInput) {
      this.connectionState = null;
      return;
    }

    // Can't connect to same node
    if (this.connectionState.sourceNodeId === node.id) {
      this.connectionState = null;
      return;
    }

    // Create edge
    const sourceNodeId = this.connectionState.sourceIsInput ? node.id : this.connectionState.sourceNodeId;
    const sourcePortId = this.connectionState.sourceIsInput ? port.id : this.connectionState.sourcePortId;
    const targetNodeId = this.connectionState.sourceIsInput ? this.connectionState.sourceNodeId : node.id;
    const targetPortId = this.connectionState.sourceIsInput ? this.connectionState.sourcePortId : port.id;

    // Check if edge already exists
    const edgeExists = this.workflow.edges.some(
      edge => edge.sourceNodeId === sourceNodeId &&
              edge.sourcePortId === sourcePortId &&
              edge.targetNodeId === targetNodeId &&
              edge.targetPortId === targetPortId
    );

    if (!edgeExists) {
      const newEdge: WorkflowEdge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sourceNodeId,
        sourcePortId,
        targetNodeId,
        targetPortId,
      };

      this.workflow = {
        ...this.workflow,
        edges: [...this.workflow.edges, newEdge],
      };

      this.dispatchWorkflowChanged();
    }

    this.connectionState = null;
  }

  private updateConnectionLine(e: MouseEvent) {
    if (!this.connectionState) return;

    const rect = this.canvasWrapper.getBoundingClientRect();
    this.connectionState = {
      ...this.connectionState,
      mouseX: (e.clientX - rect.left - this.viewport.panX) / this.viewport.zoom,
      mouseY: (e.clientY - rect.top - this.viewport.panY) / this.viewport.zoom,
    };
  }

  private handleEdgeClick(e: MouseEvent, edge: WorkflowEdge) {
    e.stopPropagation();
    if (!e.shiftKey) {
      this.clearSelection();
    }
    this.selectedEdgeIds.add(edge.id);
    this.selectedEdgeIds = new Set(this.selectedEdgeIds);
  }

  private clearSelection() {
    this.selectedNodeIds = new Set();
    this.selectedEdgeIds = new Set();
    this.contextMenu = null;
  }

  private selectAll() {
    this.selectedNodeIds = new Set(this.workflow.nodes.map(n => n.id));
    this.selectedEdgeIds = new Set(this.workflow.edges.map(e => e.id));
  }

  private deleteSelected() {
    if (this.readonly) return;

    const nodeIdsToDelete = this.selectedNodeIds;
    const edgeIdsToDelete = this.selectedEdgeIds;

    this.workflow = {
      ...this.workflow,
      nodes: this.workflow.nodes.filter(n => !nodeIdsToDelete.has(n.id)),
      edges: this.workflow.edges.filter(e =>
        !edgeIdsToDelete.has(e.id) &&
        !nodeIdsToDelete.has(e.sourceNodeId) &&
        !nodeIdsToDelete.has(e.targetNodeId)
      ),
    };

    this.clearSelection();
    this.dispatchWorkflowChanged();
  }

  private openConfigForSelected() {
    if (this.selectedNodeIds.size === 0) return;
    const nodeId = Array.from(this.selectedNodeIds)[0];
    const node = this.workflow.nodes.find(n => n.id === nodeId);
    if (node) {
      this.configuredNode = node;
    }
  }

  private duplicateSelected() {
    if (this.readonly || this.selectedNodeIds.size === 0) return;

    const nodesToDuplicate = this.workflow.nodes.filter(n => this.selectedNodeIds.has(n.id));
    const newNodes: WorkflowNode[] = [];
    const idMapping = new Map<string, string>();

    for (const node of nodesToDuplicate) {
      const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      idMapping.set(node.id, newId);
      newNodes.push({
        ...node,
        id: newId,
        name: `${node.name} (copy)`,
        position: {
          x: node.position.x + 40,
          y: node.position.y + 40,
        },
        ports: {
          inputs: node.ports.inputs.map(p => ({ ...p })),
          outputs: node.ports.outputs.map(p => ({ ...p })),
        },
      });
    }

    this.workflow = {
      ...this.workflow,
      nodes: [...this.workflow.nodes, ...newNodes],
    };

    // Select the new nodes
    this.clearSelection();
    for (const node of newNodes) {
      this.selectedNodeIds.add(node.id);
    }
    this.selectedNodeIds = new Set(this.selectedNodeIds);
    this.dispatchWorkflowChanged();
  }

  private addNode(type: NodeType, position?: Position) {
    if (this.readonly) return;

    const pos = position || {
      x: (-this.viewport.panX + 400) / this.viewport.zoom,
      y: (-this.viewport.panY + 200) / this.viewport.zoom,
    };

    const newNode = createNodeFromTemplate(type, pos);
    if (newNode) {
      this.workflow = {
        ...this.workflow,
        nodes: [...this.workflow.nodes, newNode],
      };
      this.dispatchWorkflowChanged();
    }
  }

  private handlePaletteItemDrag(e: DragEvent, type: NodeType) {
    e.dataTransfer?.setData('application/workflow-node-type', type);
  }

  private handleCanvasDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer?.getData('application/workflow-node-type') as NodeType;
    if (!type) return;

    const rect = this.canvasWrapper.getBoundingClientRect();
    const x = (e.clientX - rect.left - this.viewport.panX) / this.viewport.zoom;
    const y = (e.clientY - rect.top - this.viewport.panY) / this.viewport.zoom;

    this.addNode(type, { x: Math.round(x / 20) * 20, y: Math.round(y / 20) * 20 });
  };

  private handleCanvasDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  };

  private zoomIn() {
    this.setZoom(Math.min(2, this.viewport.zoom * 1.2));
  }

  private zoomOut() {
    this.setZoom(Math.max(0.25, this.viewport.zoom / 1.2));
  }

  private resetView() {
    this.viewport = { zoom: 1, panX: 0, panY: 0 };
    this.updateTransform();
    this.dispatchViewportChanged();
  }

  private setZoom(zoom: number) {
    const rect = this.canvasWrapper.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newPanX = centerX - (centerX - this.viewport.panX) * (zoom / this.viewport.zoom);
    const newPanY = centerY - (centerY - this.viewport.panY) * (zoom / this.viewport.zoom);

    this.viewport = { zoom, panX: newPanX, panY: newPanY };
    this.updateTransform();
    this.dispatchViewportChanged();
  }

  private togglePalette() {
    this.showPalette = !this.showPalette;
  }

  private toggleCategory(categoryId: string) {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
    }
    this.expandedCategories = new Set(this.expandedCategories);
  }

  private dispatchWorkflowChanged() {
    this.dispatchEvent(new CustomEvent('workflow-changed', {
      detail: { workflow: this.workflow },
      bubbles: true,
      composed: true,
    }));
  }

  private dispatchViewportChanged() {
    this.dispatchEvent(new CustomEvent('viewport-changed', {
      detail: { viewport: this.viewport },
      bubbles: true,
      composed: true,
    }));
  }

  private dispatchNodeSelected(node: WorkflowNode) {
    this.dispatchEvent(new CustomEvent('node-selected', {
      detail: { node },
      bubbles: true,
      composed: true,
    }));
  }

  private getPortPosition(node: WorkflowNode, portId: string, isInput: boolean): Position {
    const portIndex = isInput
      ? node.ports.inputs.findIndex(p => p.id === portId)
      : node.ports.outputs.findIndex(p => p.id === portId);

    const totalPorts = isInput ? node.ports.inputs.length : node.ports.outputs.length;

    const headerHeight = 40;
    const bodyHeight = 40;
    const portSpacing = bodyHeight / (totalPorts + 1);
    const topOffset = headerHeight + portSpacing * (portIndex + 1);

    const nodeWidth = 180;

    return {
      x: node.position.x + (isInput ? 0 : nodeWidth),
      y: node.position.y + topOffset,
    };
  }

  private renderEdge(edge: WorkflowEdge) {
    const sourceNode = this.workflow.nodes.find(n => n.id === edge.sourceNodeId);
    const targetNode = this.workflow.nodes.find(n => n.id === edge.targetNodeId);

    if (!sourceNode || !targetNode) return nothing;

    const start = this.getPortPosition(sourceNode, edge.sourcePortId, false);
    const end = this.getPortPosition(targetNode, edge.targetPortId, true);

    // Calculate bezier curve control points
    const dx = end.x - start.x;
    const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);

    const path = `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;

    const isSelected = this.selectedEdgeIds.has(edge.id);

    // Calculate arrow position and rotation
    const arrowSize = 8;
    const t = 0.95;
    const arrowX = Math.pow(1-t, 3) * start.x + 3 * Math.pow(1-t, 2) * t * (start.x + controlOffset) + 3 * (1-t) * Math.pow(t, 2) * (end.x - controlOffset) + Math.pow(t, 3) * end.x;
    const arrowY = Math.pow(1-t, 3) * start.y + 3 * Math.pow(1-t, 2) * t * start.y + 3 * (1-t) * Math.pow(t, 2) * end.y + Math.pow(t, 3) * end.y;

    // Calculate tangent at t for arrow rotation
    const dt = 0.01;
    const t2 = t + dt;
    const nextX = Math.pow(1-t2, 3) * start.x + 3 * Math.pow(1-t2, 2) * t2 * (start.x + controlOffset) + 3 * (1-t2) * Math.pow(t2, 2) * (end.x - controlOffset) + Math.pow(t2, 3) * end.x;
    const nextY = Math.pow(1-t2, 3) * start.y + 3 * Math.pow(1-t2, 2) * t2 * start.y + 3 * (1-t2) * Math.pow(t2, 2) * end.y + Math.pow(t2, 3) * end.y;
    const angle = Math.atan2(nextY - arrowY, nextX - arrowX) * 180 / Math.PI;

    return html`
      <g>
        <path
          class="edge-path ${classMap({ selected: isSelected, animated: edge.animated || false })}"
          d=${path}
          @click=${(e: MouseEvent) => this.handleEdgeClick(e, edge)}
        />
        <polygon
          class="edge-arrow"
          points="${arrowX},${arrowY} ${arrowX - arrowSize},${arrowY - arrowSize/2} ${arrowX - arrowSize},${arrowY + arrowSize/2}"
          transform="rotate(${angle}, ${arrowX}, ${arrowY})"
        />
        ${edge.label ? html`
          <text
            class="edge-label"
            x=${(start.x + end.x) / 2}
            y=${(start.y + end.y) / 2 - 8}
            text-anchor="middle"
          >${edge.label}</text>
        ` : nothing}
      </g>
    `;
  }

  private renderConnectionLine() {
    if (!this.connectionState) return nothing;

    const sourceNode = this.workflow.nodes.find(n => n.id === this.connectionState!.sourceNodeId);
    if (!sourceNode) return nothing;

    const start = this.getPortPosition(
      sourceNode,
      this.connectionState.sourcePortId,
      this.connectionState.sourceIsInput
    );

    const end = { x: this.connectionState.mouseX, y: this.connectionState.mouseY };

    const dx = end.x - start.x;
    const controlOffset = Math.min(Math.abs(dx) * 0.5, 100);

    const path = this.connectionState.sourceIsInput
      ? `M ${end.x} ${end.y} C ${end.x + controlOffset} ${end.y}, ${start.x - controlOffset} ${start.y}, ${start.x} ${start.y}`
      : `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;

    return html`<path class="connection-line" d=${path} />`;
  }

  private renderToolbar() {
    if (!this.showToolbar) return nothing;

    return html`
      <div class="canvas-toolbar">
        <button
          class="toolbar-btn ${this.mode === CanvasMode.SELECT ? 'active' : ''}"
          @click=${() => this.mode = CanvasMode.SELECT}
          title="Select (V)"
        >
          <nr-icon name="mouse-pointer" size="small"></nr-icon>
        </button>
        <button
          class="toolbar-btn ${this.showPalette ? 'active' : ''}"
          @click=${() => this.togglePalette()}
          title="Add Node (N)"
        >
          <nr-icon name="plus" size="small"></nr-icon>
        </button>
        <div class="toolbar-divider"></div>
        <button
          class="toolbar-btn"
          @click=${() => this.zoomIn()}
          title="Zoom In"
        >
          <nr-icon name="zoom-in" size="small"></nr-icon>
        </button>
        <button
          class="toolbar-btn"
          @click=${() => this.zoomOut()}
          title="Zoom Out"
        >
          <nr-icon name="zoom-out" size="small"></nr-icon>
        </button>
        <button
          class="toolbar-btn"
          @click=${() => this.resetView()}
          title="Reset View"
        >
          <nr-icon name="maximize" size="small"></nr-icon>
        </button>
        <div class="toolbar-divider"></div>
        <button
          class="toolbar-btn"
          @click=${() => this.openConfigForSelected()}
          ?disabled=${this.selectedNodeIds.size !== 1}
          title="Edit Node (Enter)"
        >
          <nr-icon name="settings" size="small"></nr-icon>
        </button>
        <button
          class="toolbar-btn"
          @click=${() => this.deleteSelected()}
          ?disabled=${this.selectedNodeIds.size === 0 && this.selectedEdgeIds.size === 0}
          title="Delete Selected (Del)"
        >
          <nr-icon name="trash-2" size="small"></nr-icon>
        </button>
      </div>
    `;
  }

  private renderZoomControls() {
    return html`
      <div class="zoom-controls">
        <button class="toolbar-btn" @click=${() => this.zoomOut()}>
          <nr-icon name="minus" size="small"></nr-icon>
        </button>
        <span class="zoom-value">${Math.round(this.viewport.zoom * 100)}%</span>
        <button class="toolbar-btn" @click=${() => this.zoomIn()}>
          <nr-icon name="plus" size="small"></nr-icon>
        </button>
      </div>
    `;
  }

  private renderPalette() {
    if (!this.showPalette) return nothing;

    return html`
      <div class="node-palette">
        <div class="palette-header">
          <span class="palette-title">Add Node</span>
          <button class="palette-close" @click=${() => this.showPalette = false}>
            <nr-icon name="x" size="small"></nr-icon>
          </button>
        </div>
        <div class="palette-content">
          ${NODE_CATEGORIES.map(category => html`
            <div class="palette-category">
              <div
                class="category-header"
                @click=${() => this.toggleCategory(category.id)}
              >
                <nr-icon name=${category.icon || 'folder'} size="small"></nr-icon>
                <span>${category.name}</span>
                <nr-icon
                  name=${this.expandedCategories.has(category.id) ? 'chevron-down' : 'chevron-right'}
                  size="small"
                ></nr-icon>
              </div>
              ${this.expandedCategories.has(category.id) ? html`
                <div class="category-items">
                  ${category.nodeTypes.map(nodeType => {
                    const template = NODE_TEMPLATES.find(t => t.type === nodeType);
                    if (!template) return nothing;
                    return html`
                      <div
                        class="palette-item"
                        draggable="true"
                        @dragstart=${(e: DragEvent) => this.handlePaletteItemDrag(e, nodeType)}
                        @dblclick=${() => this.addNode(nodeType)}
                        title=${template.description}
                      >
                        <div
                          class="palette-item-icon"
                          style="background: ${template.color}"
                        >
                          <nr-icon name=${template.icon} size="small"></nr-icon>
                        </div>
                        <span class="palette-item-name">${template.name}</span>
                      </div>
                    `;
                  })}
                </div>
              ` : nothing}
            </div>
          `)}
        </div>
      </div>
    `;
  }

  private renderContextMenu() {
    if (!this.contextMenu) return nothing;

    return html`
      <div
        class="context-menu"
        style="left: ${this.contextMenu.x}px; top: ${this.contextMenu.y}px;"
        @click=${() => this.contextMenu = null}
      >
        ${this.contextMenu.type === 'canvas' ? html`
          <div class="context-menu-item" @click=${() => this.togglePalette()}>
            <nr-icon name="plus" size="small"></nr-icon>
            Add Node
          </div>
          <div class="context-menu-item" @click=${() => this.selectAll()}>
            <nr-icon name="check-square" size="small"></nr-icon>
            Select All
          </div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item" @click=${() => this.resetView()}>
            <nr-icon name="maximize" size="small"></nr-icon>
            Reset View
          </div>
        ` : nothing}
        ${this.contextMenu.type === 'node' ? html`
          <div class="context-menu-item" @click=${() => this.openConfigForSelected()}>
            <nr-icon name="settings" size="small"></nr-icon>
            Configure
          </div>
          <div class="context-menu-item" @click=${() => this.duplicateSelected()}>
            <nr-icon name="copy" size="small"></nr-icon>
            Duplicate
          </div>
          <div class="context-menu-divider"></div>
          <div class="context-menu-item danger" @click=${() => this.deleteSelected()}>
            <nr-icon name="trash-2" size="small"></nr-icon>
            Delete
          </div>
        ` : nothing}
      </div>
    `;
  }

  private renderEmptyState() {
    if (this.workflow.nodes.length > 0) return nothing;

    return html`
      <div class="empty-state">
        <div class="empty-state-icon">
          <nr-icon name="git-branch" size="xlarge"></nr-icon>
        </div>
        <div class="empty-state-text">No nodes yet</div>
        <div class="empty-state-hint">
          Click the + button or double-click to add nodes
        </div>
      </div>
    `;
  }

  private closeConfigPanel() {
    this.configuredNode = null;
  }

  private updateNodeConfig(key: string, value: unknown) {
    if (!this.configuredNode) return;

    const updatedNode = {
      ...this.configuredNode,
      configuration: {
        ...this.configuredNode.configuration,
        [key]: value,
      },
    };

    this.workflow = {
      ...this.workflow,
      nodes: this.workflow.nodes.map(n =>
        n.id === updatedNode.id ? updatedNode : n
      ),
    };

    this.configuredNode = updatedNode;
    this.dispatchWorkflowChanged();
  }

  private updateNodeName(name: string) {
    if (!this.configuredNode) return;

    const updatedNode = {
      ...this.configuredNode,
      name,
    };

    this.workflow = {
      ...this.workflow,
      nodes: this.workflow.nodes.map(n =>
        n.id === updatedNode.id ? updatedNode : n
      ),
    };

    this.configuredNode = updatedNode;
    this.dispatchWorkflowChanged();
  }

  private updateNodeDescription(description: string) {
    if (!this.configuredNode) return;

    const updatedNode = {
      ...this.configuredNode,
      metadata: {
        ...this.configuredNode.metadata,
        description,
      },
    };

    this.workflow = {
      ...this.workflow,
      nodes: this.workflow.nodes.map(n =>
        n.id === updatedNode.id ? updatedNode : n
      ),
    };

    this.configuredNode = updatedNode;
    this.dispatchWorkflowChanged();
  }

  private renderConfigFields() {
    if (!this.configuredNode) return nothing;

    const type = this.configuredNode.type;
    const config = this.configuredNode.configuration;

    // Common fields for all nodes
    const commonFields = html`
      <div class="config-field">
        <label>Name</label>
        <nr-input
          value=${this.configuredNode.name}
          placeholder="Node name"
          @nr-input=${(e: CustomEvent) => this.updateNodeName(e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Description</label>
        <nr-input
          value=${this.configuredNode.metadata?.description || ''}
          placeholder="Description"
          @nr-input=${(e: CustomEvent) => this.updateNodeDescription(e.detail.value)}
        ></nr-input>
      </div>
    `;

    // Type-specific fields
    let typeFields = nothing;

    switch (type) {
      case WorkflowNodeType.HTTP:
        typeFields = html`
          <div class="config-field">
            <label>Method</label>
            <nr-input
              value=${config.method || 'GET'}
              placeholder="GET, POST, PUT, DELETE"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('method', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>URL</label>
            <nr-input
              value=${config.url || ''}
              placeholder="https://api.example.com"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('url', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Timeout (ms)</label>
            <nr-input
              type="number"
              value=${String(config.timeout || 30000)}
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('timeout', parseInt(e.detail.value))}
            ></nr-input>
          </div>
        `;
        break;

      case WorkflowNodeType.FUNCTION:
        typeFields = html`
          <div class="config-field">
            <label>Function ID</label>
            <nr-input
              value=${config.functionId || ''}
              placeholder="Enter function ID"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('functionId', e.detail.value)}
            ></nr-input>
          </div>
        `;
        break;

      case WorkflowNodeType.CONDITION:
        typeFields = html`
          <div class="config-field">
            <label>Expression</label>
            <nr-input
              value=${config.expression || ''}
              placeholder="data.value > 10"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('expression', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Language</label>
            <nr-input
              value=${config.language || 'javascript'}
              placeholder="javascript or jsonata"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('language', e.detail.value)}
            ></nr-input>
          </div>
        `;
        break;

      case WorkflowNodeType.DELAY:
        typeFields = html`
          <div class="config-field">
            <label>Duration</label>
            <nr-input
              type="number"
              value=${String(config.duration || 1000)}
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('duration', parseInt(e.detail.value))}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Unit</label>
            <nr-input
              value=${config.unit || 'milliseconds'}
              placeholder="milliseconds, seconds, minutes"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('unit', e.detail.value)}
            ></nr-input>
          </div>
        `;
        break;

      case WorkflowNodeType.LOOP:
        typeFields = html`
          <div class="config-field">
            <label>Iterator Variable</label>
            <nr-input
              value=${config.iteratorVariable || 'item'}
              placeholder="Variable name"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('iteratorVariable', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Array Expression</label>
            <nr-input
              value=${config.arrayExpression || ''}
              placeholder="data.items"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('arrayExpression', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Max Iterations</label>
            <nr-input
              type="number"
              value=${String(config.maxIterations || 100)}
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('maxIterations', parseInt(e.detail.value))}
            ></nr-input>
          </div>
        `;
        break;

      case WorkflowNodeType.TRANSFORM:
        typeFields = html`
          <div class="config-field">
            <label>Transform Expression</label>
            <nr-input
              value=${config.transformExpression || ''}
              placeholder="JSONata expression"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('transformExpression', e.detail.value)}
            ></nr-input>
          </div>
        `;
        break;

      case WorkflowNodeType.EMAIL:
        typeFields = html`
          <div class="config-field">
            <label>To</label>
            <nr-input
              value=${(config as any).to || ''}
              placeholder="recipient@example.com"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('to', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Subject</label>
            <nr-input
              value=${(config as any).subject || ''}
              placeholder="Email subject"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('subject', e.detail.value)}
            ></nr-input>
          </div>
        `;
        break;

      case AgentNodeType.AGENT:
        typeFields = html`
          <div class="config-field">
            <label>Agent ID</label>
            <nr-input
              value=${config.agentId || ''}
              placeholder="Agent identifier"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('agentId', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>System Prompt</label>
            <nr-input
              value=${config.systemPrompt || ''}
              placeholder="System prompt for the agent"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('systemPrompt', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Model</label>
            <nr-input
              value=${config.model || 'gpt-4'}
              placeholder="gpt-4, claude-3, etc."
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('model', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Temperature</label>
            <nr-input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value=${String(config.temperature || 0.7)}
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('temperature', parseFloat(e.detail.value))}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Max Tokens</label>
            <nr-input
              type="number"
              value=${String(config.maxTokens || 2048)}
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('maxTokens', parseInt(e.detail.value))}
            ></nr-input>
          </div>
        `;
        break;

      case AgentNodeType.LLM:
        typeFields = html`
          <div class="config-field">
            <label>Provider</label>
            <nr-input
              value=${config.provider || 'openai'}
              placeholder="openai, anthropic, local"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('provider', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Model Name</label>
            <nr-input
              value=${config.modelName || 'gpt-4'}
              placeholder="Model name"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('modelName', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Temperature</label>
            <nr-input
              type="number"
              step="0.1"
              min="0"
              max="2"
              value=${String(config.temperature || 0.7)}
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('temperature', parseFloat(e.detail.value))}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Max Tokens</label>
            <nr-input
              type="number"
              value=${String(config.maxTokens || 2048)}
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('maxTokens', parseInt(e.detail.value))}
            ></nr-input>
          </div>
        `;
        break;

      case AgentNodeType.PROMPT:
        typeFields = html`
          <div class="config-field">
            <label>Template</label>
            <nr-input
              value=${(config as any).template || ''}
              placeholder="Prompt template with {variables}"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('template', e.detail.value)}
            ></nr-input>
          </div>
        `;
        break;

      case AgentNodeType.MEMORY:
        typeFields = html`
          <div class="config-field">
            <label>Memory Type</label>
            <nr-input
              value=${config.memoryType || 'buffer'}
              placeholder="buffer, summary, vector"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('memoryType', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Max Messages</label>
            <nr-input
              type="number"
              value=${String(config.maxMessages || 10)}
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('maxMessages', parseInt(e.detail.value))}
            ></nr-input>
          </div>
        `;
        break;

      case AgentNodeType.TOOL:
        typeFields = html`
          <div class="config-field">
            <label>Tool Name</label>
            <nr-input
              value=${config.toolName || ''}
              placeholder="Tool identifier"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('toolName', e.detail.value)}
            ></nr-input>
          </div>
        `;
        break;

      case AgentNodeType.RETRIEVER:
        typeFields = html`
          <div class="config-field">
            <label>Vector Store ID</label>
            <nr-input
              value=${(config as any).vectorStoreId || ''}
              placeholder="Vector store identifier"
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('vectorStoreId', e.detail.value)}
            ></nr-input>
          </div>
          <div class="config-field">
            <label>Top K</label>
            <nr-input
              type="number"
              value=${String((config as any).topK || 5)}
              @nr-input=${(e: CustomEvent) => this.updateNodeConfig('topK', parseInt(e.detail.value))}
            ></nr-input>
          </div>
        `;
        break;
    }

    return html`${commonFields}${typeFields}`;
  }

  private renderConfigPanel() {
    if (!this.configuredNode) return nothing;

    const node = this.configuredNode;
    const template = NODE_TEMPLATES.find(t => t.type === node.type);

    // Calculate position next to the node
    const nodeWidth = 180;
    const panelOffset = 20;
    const panelX = (node.position.x + nodeWidth + panelOffset) * this.viewport.zoom + this.viewport.panX;
    const panelY = node.position.y * this.viewport.zoom + this.viewport.panY;

    const panelStyle = {
      left: `${panelX}px`,
      top: `${panelY}px`,
    };

    return html`
      <div class="config-panel" style=${styleMap(panelStyle)}>
        <div class="config-panel-header">
          <div class="config-panel-title">
            <div
              class="config-panel-icon"
              style="background: ${template?.color || '#3b82f6'}"
            >
              <nr-icon name=${template?.icon || 'box'} size="small"></nr-icon>
            </div>
            <span>${node.name}</span>
          </div>
          <button class="config-panel-close" @click=${() => this.closeConfigPanel()}>
            <nr-icon name="x" size="small"></nr-icon>
          </button>
        </div>
        <div class="config-panel-content">
          ${this.renderConfigFields()}
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <div
        class="canvas-wrapper"
        data-theme=${this.currentTheme}
        @mousedown=${this.handleCanvasMouseDown}
        @contextmenu=${this.handleCanvasContextMenu}
        @drop=${this.handleCanvasDrop}
        @dragover=${this.handleCanvasDragOver}
      >
        <div class="canvas-grid"></div>

        <div class="canvas-viewport">
          <!-- Edges SVG layer -->
          <svg class="edges-svg">
            ${this.workflow.edges.map(edge => this.renderEdge(edge))}
            ${this.renderConnectionLine()}
          </svg>

          <!-- Nodes layer -->
          <div class="nodes-layer">
            ${this.workflow.nodes.map(node => html`
              <workflow-node
                .node=${node}
                ?selected=${this.selectedNodeIds.has(node.id)}
                ?dragging=${this.dragState?.nodeId === node.id}
                .connectingPortId=${this.connectionState?.sourcePortId || null}
                @node-mousedown=${this.handleNodeMouseDown}
                @node-dblclick=${this.handleNodeDblClick}
                @port-mousedown=${this.handlePortMouseDown}
                @port-mouseup=${this.handlePortMouseUp}
              ></workflow-node>
            `)}
          </div>
        </div>

        ${this.renderEmptyState()}
        ${this.renderToolbar()}
        ${this.renderPalette()}
        ${this.renderConfigPanel()}
        ${this.renderZoomControls()}
        ${this.renderContextMenu()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workflow-canvas': WorkflowCanvasElement;
  }
}
