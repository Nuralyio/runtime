/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost } from '../interfaces/index.js';
import { WorkflowNode } from '../workflow-canvas.types.js';

/**
 * State for marquee selection box
 */
export interface MarqueeState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

/**
 * Extended canvas host interface for marquee controller
 */
export interface MarqueeHost extends CanvasHost {
  marqueeState: MarqueeState | null;
}

/**
 * Controller for marquee (box) selection on canvas
 * Allows users to click and drag to select multiple nodes
 */
export class MarqueeController extends BaseCanvasController {
  private _marqueeHost: MarqueeHost & ReactiveControllerHost;

  constructor(host: MarqueeHost & ReactiveControllerHost) {
    super(host);
    this._marqueeHost = host;
  }

  /**
   * Check if marquee selection is currently active
   */
  get isSelecting(): boolean {
    return this._marqueeHost.marqueeState !== null;
  }

  /**
   * Get the current marquee state
   */
  get marqueeState(): MarqueeState | null {
    return this._marqueeHost.marqueeState;
  }

  /**
   * Start marquee selection
   * Call this on mousedown on empty canvas area
   */
  startSelection(e: MouseEvent, addToSelection: boolean = false): void {
    if (this._host.readonly || this._host.disabled) return;

    const canvasPos = this.clientToCanvas(e.clientX, e.clientY);

    this._marqueeHost.marqueeState = {
      startX: canvasPos.x,
      startY: canvasPos.y,
      currentX: canvasPos.x,
      currentY: canvasPos.y,
    };

    // Clear selection unless shift is held
    if (!addToSelection) {
      this._host.selectedNodeIds = new Set();
      this._host.selectedEdgeIds = new Set();
    }

    this._host.requestUpdate();
  }

  /**
   * Update marquee selection box during drag
   * Call this on mousemove while marquee is active
   */
  updateSelection(e: MouseEvent): void {
    if (!this._marqueeHost.marqueeState) return;

    const canvasPos = this.clientToCanvas(e.clientX, e.clientY);

    this._marqueeHost.marqueeState = {
      ...this._marqueeHost.marqueeState,
      currentX: canvasPos.x,
      currentY: canvasPos.y,
    };

    this._host.requestUpdate();
  }

  /**
   * End marquee selection and select nodes/edges within the box
   * Call this on mouseup
   */
  endSelection(addToSelection: boolean = false): void {
    if (!this._marqueeHost.marqueeState) return;

    const rect = this.getSelectionRect();
    const selectedNodeIds = new Set(addToSelection ? this._host.selectedNodeIds : []);
    const selectedEdgeIds = new Set(addToSelection ? this._host.selectedEdgeIds : []);

    // Select nodes that intersect with the marquee rectangle
    for (const node of this._host.workflow.nodes) {
      if (this.nodeIntersectsRect(node, rect)) {
        selectedNodeIds.add(node.id);
      }
    }

    // Select edges where both source and target nodes are selected
    for (const edge of this._host.workflow.edges) {
      if (selectedNodeIds.has(edge.sourceNodeId) && selectedNodeIds.has(edge.targetNodeId)) {
        selectedEdgeIds.add(edge.id);
      }
    }

    // Update selection state
    this._host.selectedNodeIds = selectedNodeIds;
    this._host.selectedEdgeIds = selectedEdgeIds;

    // Clear marquee state
    this._marqueeHost.marqueeState = null;

    this._host.requestUpdate();
  }

  /**
   * Cancel marquee selection without applying selection
   */
  cancelSelection(): void {
    this._marqueeHost.marqueeState = null;
    this._host.requestUpdate();
  }

  /**
   * Get the normalized selection rectangle (always positive width/height)
   */
  getSelectionRect(): { x: number; y: number; width: number; height: number } {
    const state = this._marqueeHost.marqueeState;
    if (!state) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    return {
      x: Math.min(state.startX, state.currentX),
      y: Math.min(state.startY, state.currentY),
      width: Math.abs(state.currentX - state.startX),
      height: Math.abs(state.currentY - state.startY),
    };
  }

  /**
   * Check if a node intersects with a rectangle
   * Uses the node's bounding box (position + estimated size)
   */
  private nodeIntersectsRect(
    node: WorkflowNode,
    rect: { x: number; y: number; width: number; height: number }
  ): boolean {
    // Estimated node dimensions (adjust based on your node component)
    const nodeWidth = 200;
    const nodeHeight = 80;

    const nodeRect = {
      x: node.position.x,
      y: node.position.y,
      width: nodeWidth,
      height: nodeHeight,
    };

    // Check for intersection
    return !(
      nodeRect.x + nodeRect.width < rect.x ||
      rect.x + rect.width < nodeRect.x ||
      nodeRect.y + nodeRect.height < rect.y ||
      rect.y + rect.height < nodeRect.y
    );
  }
}
