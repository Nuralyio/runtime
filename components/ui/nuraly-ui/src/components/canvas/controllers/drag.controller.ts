/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost, DragState } from '../interfaces/index.js';
import { WorkflowNode } from '../workflow-canvas.types.js';
import { ViewportController } from './viewport.controller.js';

/**
 * Controller for managing node dragging
 */
export class DragController extends BaseCanvasController {
  private viewportController: ViewportController;

  constructor(host: CanvasHost & ReactiveControllerHost, viewportController: ViewportController) {
    super(host);
    this.viewportController = viewportController;
  }

  /**
   * Start dragging a node
   */
  startDrag(node: WorkflowNode, event: MouseEvent): void {
    const pos = this.clientToCanvas(event.clientX, event.clientY);

    this._host.dragState = {
      nodeId: node.id,
      startX: node.position.x,
      startY: node.position.y,
      offsetX: pos.x - node.position.x,
      offsetY: pos.y - node.position.y,
    };
  }

  /**
   * Handle node drag movement
   */
  handleDrag(event: MouseEvent): void {
    const { dragState } = this._host;
    if (!dragState) return;

    const pos = this.clientToCanvas(event.clientX, event.clientY);
    const x = pos.x - dragState.offsetX;
    const y = pos.y - dragState.offsetY;

    // Snap to grid
    const snapped = this.snapToGrid(x, y);

    // Move all selected nodes
    const deltaX = snapped.x - dragState.startX;
    const deltaY = snapped.y - dragState.startY;

    this._host.setWorkflow({
      ...this._host.workflow,
      nodes: this._host.workflow.nodes.map(node => {
        if (this._host.selectedNodeIds.has(node.id)) {
          if (node.id === dragState.nodeId) {
            return { ...node, position: { x: snapped.x, y: snapped.y } };
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
    });

    this._host.dragState = { ...dragState, startX: snapped.x, startY: snapped.y };

    // Update config panel position if the configured node is being dragged
    if (
      this._host.configuredNode &&
      this._host.selectedNodeIds.has(this._host.configuredNode.id)
    ) {
      const updatedNode = this._host.workflow.nodes.find(
        n => n.id === this._host.configuredNode!.id
      );
      if (updatedNode) {
        this._host.configuredNode = updatedNode;
        this.viewportController.updateConfigPanelPosition();
      }
    }
  }

  /**
   * Stop dragging
   */
  stopDrag(): void {
    if (this._host.dragState) {
      this._host.dragState = null;
      this._host.dispatchWorkflowChanged();
    }
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this._host.dragState !== null;
  }

  /**
   * Get current drag state
   */
  getDragState(): DragState | null {
    return this._host.dragState;
  }

  /**
   * Get the node being dragged
   */
  getDraggedNodeId(): string | null {
    return this._host.dragState?.nodeId || null;
  }
}
