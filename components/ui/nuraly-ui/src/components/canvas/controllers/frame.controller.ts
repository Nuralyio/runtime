/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost } from '../interfaces/index.js';
import {
  WorkflowNode,
  WorkflowNodeType,
  ResizeHandle,
  FrameResizeState,
  AggregatedPort,
  NODE_COLORS,
  NODE_ICONS,
} from '../workflow-canvas.types.js';

/**
 * Controller for frame node operations including:
 * - Resize functionality
 * - Containment detection
 * - Move with contents
 * - Collapse/expand
 * - Aggregated ports calculation
 */
export class FrameController extends BaseCanvasController {
  private resizeState: FrameResizeState | null = null;
  private readonly MIN_FRAME_WIDTH = 200;
  private readonly MIN_FRAME_HEIGHT = 150;

  constructor(host: CanvasHost & ReactiveControllerHost) {
    super(host);
  }

  // ===== RESIZE OPERATIONS =====

  /**
   * Start resizing a frame from a specific handle
   */
  startResize(event: MouseEvent, frame: WorkflowNode, handle: ResizeHandle): void {
    event.stopPropagation();
    event.preventDefault();

    const config = frame.configuration || {};

    this.resizeState = {
      frameId: frame.id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: (config.frameWidth as number) || 400,
      startHeight: (config.frameHeight as number) || 300,
      startPosition: { ...frame.position },
    };

    // Add global listeners
    document.addEventListener('mousemove', this.handleResizeDrag);
    document.addEventListener('mouseup', this.stopResize);
  }

  private handleResizeDrag = (event: MouseEvent): void => {
    if (!this.resizeState) return;

    const { handle, startX, startY, startWidth, startHeight, startPosition, frameId } = this.resizeState;
    const frame = this._host.workflow.nodes.find(n => n.id === frameId);
    if (!frame) return;

    const deltaX = (event.clientX - startX) / this._host.viewport.zoom;
    const deltaY = (event.clientY - startY) / this._host.viewport.zoom;

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
    const snapped = this.snapToGrid(newX, newY);
    newX = snapped.x;
    newY = snapped.y;
    newWidth = Math.round(newWidth / 20) * 20;
    newHeight = Math.round(newHeight / 20) * 20;

    // Update frame
    frame.position = { x: newX, y: newY };
    frame.configuration = {
      ...frame.configuration,
      frameWidth: newWidth,
      frameHeight: newHeight,
    };

    this._host.requestUpdate();
  };

  stopResize = (): void => {
    if (!this.resizeState) return;

    const frame = this._host.workflow.nodes.find(n => n.id === this.resizeState!.frameId);
    if (frame) {
      // Update containment after resize
      this.updateFrameContainment(frame);
    }

    this.resizeState = null;
    document.removeEventListener('mousemove', this.handleResizeDrag);
    document.removeEventListener('mouseup', this.stopResize);

    this._host.dispatchWorkflowChanged();
  };

  // ===== CONTAINMENT DETECTION =====

  /**
   * Check if a node's center is within a frame's bounds
   */
  isNodeInFrame(node: WorkflowNode, frame: WorkflowNode): boolean {
    // Frames and notes cannot be contained in frames
    if (node.type === WorkflowNodeType.FRAME || node.type === WorkflowNodeType.NOTE) {
      return false;
    }

    const config = frame.configuration || {};
    const frameWidth = (config.frameWidth as number) || 400;
    const frameHeight = (config.frameHeight as number) || 300;
    const nodeWidth = 180; // Standard node width
    const nodeHeight = 80; // Standard node height

    const frameLeft = frame.position.x;
    const frameTop = frame.position.y;
    const frameRight = frameLeft + frameWidth;
    const frameBottom = frameTop + frameHeight;

    // Node center must be inside frame
    const nodeCenterX = node.position.x + nodeWidth / 2;
    const nodeCenterY = node.position.y + nodeHeight / 2;

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

    for (const node of this._host.workflow.nodes) {
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
   * @param triggerUpdate If true, triggers a workflow update after containment changes
   */
  updateAllFrameContainments(triggerUpdate: boolean = false): void {
    const frames = this._host.workflow.nodes.filter(n => n.type === WorkflowNodeType.FRAME);
    let hasChanges = false;

    for (const frame of frames) {
      const oldIds = new Set(frame.containedNodeIds || []);
      this.updateFrameContainment(frame);
      const newIds = new Set(frame.containedNodeIds || []);

      // Check if containment changed
      if (oldIds.size !== newIds.size || ![...oldIds].every(id => newIds.has(id))) {
        hasChanges = true;
      }
    }

    // If changes occurred and update is requested, trigger a re-render
    if (hasChanges && triggerUpdate) {
      this._host.requestUpdate();
    }
  }

  /**
   * Get all nodes contained in a frame
   */
  getContainedNodes(frame: WorkflowNode): WorkflowNode[] {
    const ids = new Set(frame.containedNodeIds || []);
    return this._host.workflow.nodes.filter(n => ids.has(n.id));
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
    const config = frame.configuration || {};
    const collapsed = config.frameCollapsed as boolean;

    // Build new configuration
    let newConfig: typeof config;
    if (collapsed) {
      // Expand: restore original dimensions
      newConfig = {
        ...config,
        frameWidth: (config._frameExpandedWidth as number) || 400,
        frameHeight: (config._frameExpandedHeight as number) || 300,
        frameCollapsed: false,
      };
    } else {
      // Collapse: save dimensions and collapse
      newConfig = {
        ...config,
        _frameExpandedWidth: config.frameWidth,
        _frameExpandedHeight: config.frameHeight,
        frameCollapsed: true,
      };
    }

    // Determine visibility for contained nodes
    // collapsed=true (currently collapsed) means we're expanding -> show nodes (visible=true)
    // collapsed=false (currently expanded) means we're collapsing -> hide nodes (visible=false)
    const shouldHide = !collapsed; // Hide when collapsing
    const containedIds = new Set(frame.containedNodeIds || []);

    // Create immutable workflow update to ensure Lit detects the change
    const updatedNodes = this._host.workflow.nodes.map(node => {
      if (node.id === frame.id) {
        return {
          ...node,
          configuration: newConfig,
          // Preserve containedNodeIds
          containedNodeIds: frame.containedNodeIds,
        };
      }
      // Update contained nodes' metadata immutably
      if (containedIds.has(node.id)) {
        return {
          ...node,
          metadata: {
            ...node.metadata,
            _hiddenByFrame: shouldHide,
          },
        };
      }
      return node;
    });

    // Update edges between contained nodes immutably
    const updatedEdges = this._host.workflow.edges.map(edge => {
      const sourceInside = containedIds.has(edge.sourceNodeId);
      const targetInside = containedIds.has(edge.targetNodeId);

      // Internal edges (both nodes inside) should be hidden when collapsed
      if (sourceInside && targetInside) {
        return {
          ...edge,
          _hiddenByFrame: shouldHide,
        } as typeof edge;
      }
      return edge;
    });

    this._host.setWorkflow({
      ...this._host.workflow,
      nodes: updatedNodes,
      edges: updatedEdges,
    });

    this._host.dispatchWorkflowChanged();
  }

  /**
   * Set visibility of nodes contained in a frame
   */
  // @ts-ignore Reserved for future frame collapse/expand feature
  private setContainedNodesVisibility(frame: WorkflowNode, visible: boolean): void {
    const containedNodes = this.getContainedNodes(frame);
    for (const node of containedNodes) {
      // Use a metadata flag for visibility
      node.metadata = node.metadata || {};
      (node.metadata as Record<string, unknown>)._hiddenByFrame = !visible;
    }

    // Also handle edges between contained nodes
    const containedIds = new Set(frame.containedNodeIds || []);
    for (const edge of this._host.workflow.edges) {
      const sourceInside = containedIds.has(edge.sourceNodeId);
      const targetInside = containedIds.has(edge.targetNodeId);

      // Internal edges (both nodes inside) should be hidden
      if (sourceInside && targetInside) {
        (edge as unknown as Record<string, unknown>)._hiddenByFrame = !visible;
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

    for (const edge of this._host.workflow.edges) {
      const sourceInside = containedIds.has(edge.sourceNodeId);
      const targetInside = containedIds.has(edge.targetNodeId);

      // External -> Internal = Input
      if (!sourceInside && targetInside) {
        const sourceNode = this._host.workflow.nodes.find(n => n.id === edge.sourceNodeId);
        inputs.push({
          id: `agg-in-${edge.id}`,
          originalEdgeId: edge.id,
          internalNodeId: edge.targetNodeId,
          internalPortId: edge.targetPortId,
          label: sourceNode?.name || 'Input',
          direction: 'incoming',
        });
      }

      // Internal -> External = Output
      if (sourceInside && !targetInside) {
        const targetNode = this._host.workflow.nodes.find(n => n.id === edge.targetNodeId);
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

    const nodeWidth = 180;
    const nodeHeight = 80;

    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const node of containedNodes) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + nodeWidth);
      maxY = Math.max(maxY, node.position.y + nodeHeight);
    }

    const config = frame.configuration || {};
    const labelPlacement = config.frameLabelPlacement || 'outside';

    frame.position = {
      x: minX - padding,
      y: minY - padding - (labelPlacement === 'outside' ? 24 : 0),
    };

    frame.configuration = {
      ...config,
      frameWidth: maxX - minX + padding * 2,
      frameHeight: maxY - minY + padding * 2 + (labelPlacement === 'outside' ? 24 : 0),
    };

    this._host.requestUpdate();
    this._host.dispatchWorkflowChanged();
  }

  // ===== CREATE FRAME FROM SELECTION =====

  /**
   * Create a new frame around currently selected nodes
   */
  createFrameFromSelection(): WorkflowNode | null {
    const selectedNodes = this._host.workflow.nodes.filter(
      n => this._host.selectedNodeIds.has(n.id) &&
           n.type !== WorkflowNodeType.FRAME &&
           n.type !== WorkflowNodeType.NOTE
    );

    if (selectedNodes.length === 0) return null;

    const nodeWidth = 180;
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
        frameLabel: 'Group',
        frameWidth: maxX - minX + padding * 2,
        frameHeight: maxY - minY + padding * 2 + 24,
        frameBackgroundColor: 'rgba(99, 102, 241, 0.05)',
        frameBorderColor: 'rgba(99, 102, 241, 0.3)',
        frameLabelPosition: 'top-left',
        frameLabelPlacement: 'outside',
        frameShowLabel: true,
        frameCollapsed: false,
      },
      ports: { inputs: [], outputs: [] },
      containedNodeIds: selectedNodes.map(n => n.id),
    };

    // Update node parentFrameId
    for (const node of selectedNodes) {
      node.parentFrameId = frame.id;
    }

    // Add frame to workflow (at beginning so it renders behind)
    this._host.workflow.nodes.unshift(frame);

    this._host.requestUpdate();
    this._host.dispatchWorkflowChanged();

    return frame;
  }

  // ===== DELETE FRAME =====

  /**
   * Delete a frame
   * @param deleteContents If true, also delete contained nodes
   */
  deleteFrame(frame: WorkflowNode, deleteContents: boolean = false): void {
    if (deleteContents) {
      // Delete all contained nodes and their edges
      const containedIds = new Set(frame.containedNodeIds || []);
      this._host.workflow.edges = this._host.workflow.edges.filter(
        e => !containedIds.has(e.sourceNodeId) && !containedIds.has(e.targetNodeId)
      );
      this._host.workflow.nodes = this._host.workflow.nodes.filter(
        n => n.id !== frame.id && !containedIds.has(n.id)
      );
    } else {
      // Only delete frame, clear parentFrameId on contained nodes
      for (const nodeId of frame.containedNodeIds || []) {
        const node = this._host.workflow.nodes.find(n => n.id === nodeId);
        if (node) node.parentFrameId = null;
      }
      this._host.workflow.nodes = this._host.workflow.nodes.filter(n => n.id !== frame.id);
    }

    this._host.requestUpdate();
    this._host.dispatchWorkflowChanged();
  }

  // ===== HELPERS =====

  /**
   * Check if a frame is collapsed
   */
  isFrameCollapsed(frame: WorkflowNode): boolean {
    return Boolean(frame.configuration?.frameCollapsed);
  }

  /**
   * Get node icons and colors for collapsed frame preview
   */
  getContainedNodePreviews(frame: WorkflowNode, maxCount: number = 5): Array<{ icon: string; color: string; name: string }> {
    const containedNodes = this.getContainedNodes(frame);
    return containedNodes.slice(0, maxCount).map(node => ({
      icon: node.metadata?.icon || NODE_ICONS[node.type] || 'box',
      color: node.metadata?.color || NODE_COLORS[node.type] || '#3b82f6',
      name: node.name,
    }));
  }
}
