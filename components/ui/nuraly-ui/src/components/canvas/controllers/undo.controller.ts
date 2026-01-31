/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost } from '../interfaces/index.js';
import type { WorkflowNode, WorkflowEdge, Position } from '../workflow-canvas.types.js';
import {
  undo,
  redo,
  canUndo,
  canRedo,
  getUndoDescription,
  getRedoDescription,
  recordAddNode,
  recordDeleteNode,
  recordMoveNodes,
  recordUpdateNodeConfig,
  recordAddEdge,
  recordDeleteEdge,
  recordBulkDelete,
  recordPasteNodes,
  recordDuplicateNodes,
  flushPendingOperations,
  clearUndoHistory,
} from '../../../../../../../redux/store/undo/index.js';

/**
 * Controller for undo/redo operations
 */
export class UndoController extends BaseCanvasController {
  constructor(host: CanvasHost & ReactiveControllerHost) {
    super(host);
  }

  /**
   * Get the current workflow ID
   */
  private getWorkflowId(): string {
    return this._host.workflow.id;
  }

  /**
   * Execute undo
   */
  performUndo(): boolean {
    const workflowId = this.getWorkflowId();

    if (!canUndo(workflowId)) {
      return false;
    }

    const result = undo(workflowId, this._host.workflow);

    if (result.success && result.workflow) {
      this._host.setWorkflow(result.workflow);
      this._host.dispatchWorkflowChanged();

      // Clear selection since undone items may no longer exist
      this._host.selectedNodeIds = new Set();
      this._host.selectedEdgeIds = new Set();
      this._host.configuredNode = null;

      // Dispatch undo event for UI feedback
      this.dispatchEvent(new CustomEvent('undo-performed', {
        detail: { description: result.description },
        bubbles: true,
        composed: true,
      }));

      return true;
    }

    if (result.error) {
      // Dispatch error event
      this.dispatchEvent(new CustomEvent('undo-error', {
        detail: { error: result.error },
        bubbles: true,
        composed: true,
      }));
    }

    return false;
  }

  /**
   * Execute redo
   */
  performRedo(): boolean {
    const workflowId = this.getWorkflowId();

    if (!canRedo(workflowId)) {
      return false;
    }

    const result = redo(workflowId, this._host.workflow);

    if (result.success && result.workflow) {
      this._host.setWorkflow(result.workflow);
      this._host.dispatchWorkflowChanged();

      // Clear selection since redone items may have changed
      this._host.selectedNodeIds = new Set();
      this._host.selectedEdgeIds = new Set();
      this._host.configuredNode = null;

      // Dispatch redo event for UI feedback
      this.dispatchEvent(new CustomEvent('redo-performed', {
        detail: { description: result.description },
        bubbles: true,
        composed: true,
      }));

      return true;
    }

    if (result.error) {
      // Dispatch error event
      this.dispatchEvent(new CustomEvent('redo-error', {
        detail: { error: result.error },
        bubbles: true,
        composed: true,
      }));
    }

    return false;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return canUndo(this.getWorkflowId());
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return canRedo(this.getWorkflowId());
  }

  /**
   * Get undo tooltip text
   */
  getUndoTooltip(): string {
    const description = getUndoDescription(this.getWorkflowId());
    if (description) {
      return `Undo: ${description} (Ctrl+Z)`;
    }
    return 'Undo (Ctrl+Z)';
  }

  /**
   * Get redo tooltip text
   */
  getRedoTooltip(): string {
    const description = getRedoDescription(this.getWorkflowId());
    if (description) {
      return `Redo: ${description} (Ctrl+Shift+Z)`;
    }
    return 'Redo (Ctrl+Shift+Z)';
  }

  /**
   * Record that a node was added
   */
  recordNodeAdded(node: WorkflowNode): void {
    recordAddNode(this.getWorkflowId(), node);
  }

  /**
   * Record that a node was deleted
   */
  recordNodeDeleted(node: WorkflowNode, connectedEdges: WorkflowEdge[]): void {
    recordDeleteNode(this.getWorkflowId(), node, connectedEdges);
  }

  /**
   * Record that nodes were moved
   */
  recordNodesMoved(moves: Array<{ nodeId: string; oldPosition: Position; newPosition: Position }>): void {
    recordMoveNodes(this.getWorkflowId(), moves);
  }

  /**
   * Record that a node's configuration was updated
   */
  recordNodeConfigUpdated(
    nodeId: string,
    changes: Partial<WorkflowNode>,
    previousState: Partial<WorkflowNode>
  ): void {
    recordUpdateNodeConfig(this.getWorkflowId(), nodeId, changes, previousState);
  }

  /**
   * Record that an edge was added
   */
  recordEdgeAdded(edge: WorkflowEdge): void {
    recordAddEdge(this.getWorkflowId(), edge);
  }

  /**
   * Record that an edge was deleted
   */
  recordEdgeDeleted(edge: WorkflowEdge): void {
    recordDeleteEdge(this.getWorkflowId(), edge);
  }

  /**
   * Record a bulk delete operation
   */
  recordBulkDeleted(nodes: WorkflowNode[], edges: WorkflowEdge[]): void {
    recordBulkDelete(this.getWorkflowId(), nodes, edges);
  }

  /**
   * Record that nodes were pasted
   */
  recordNodesPasted(nodes: WorkflowNode[], edges: WorkflowEdge[]): void {
    recordPasteNodes(this.getWorkflowId(), nodes, edges);
  }

  /**
   * Record that nodes were duplicated
   */
  recordNodesDuplicated(nodes: WorkflowNode[], edges: WorkflowEdge[]): void {
    recordDuplicateNodes(this.getWorkflowId(), nodes, edges);
  }

  /**
   * Flush any pending operations (call before undo)
   */
  flushPending(): void {
    flushPendingOperations();
  }

  /**
   * Clear undo history for the current workflow
   */
  clearHistory(): void {
    clearUndoHistory(this.getWorkflowId());
  }
}
