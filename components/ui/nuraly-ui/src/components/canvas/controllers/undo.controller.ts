/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost } from '../interfaces/index.js';
import type { WorkflowNode, WorkflowEdge, Position, UndoProvider } from '../workflow-canvas.types.js';

/**
 * Controller for undo/redo operations.
 * Delegates all undo/redo logic to an externally-provided UndoProvider
 * so the UI library never imports from the redux store.
 */
export class UndoController extends BaseCanvasController {
  private _undoProvider: UndoProvider | null = null;

  constructor(host: CanvasHost & ReactiveControllerHost) {
    super(host);
  }

  /**
   * Set the undo provider (injected by the host)
   */
  set undoProvider(provider: UndoProvider | null) {
    this._undoProvider = provider;
  }

  get undoProvider(): UndoProvider | null {
    return this._undoProvider;
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
    if (!this._undoProvider) return false;
    const workflowId = this.getWorkflowId();

    if (!this._undoProvider.canUndo(workflowId)) {
      return false;
    }

    const result = this._undoProvider.undo(workflowId, this._host.workflow);

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
    if (!this._undoProvider) return false;
    const workflowId = this.getWorkflowId();

    if (!this._undoProvider.canRedo(workflowId)) {
      return false;
    }

    const result = this._undoProvider.redo(workflowId, this._host.workflow);

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
    return this._undoProvider?.canUndo(this.getWorkflowId()) ?? false;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this._undoProvider?.canRedo(this.getWorkflowId()) ?? false;
  }

  /**
   * Get undo tooltip text
   */
  getUndoTooltip(): string {
    const description = this._undoProvider?.getUndoDescription(this.getWorkflowId());
    if (description) {
      return `Undo: ${description} (Ctrl+Z)`;
    }
    return 'Undo (Ctrl+Z)';
  }

  /**
   * Get redo tooltip text
   */
  getRedoTooltip(): string {
    const description = this._undoProvider?.getRedoDescription(this.getWorkflowId());
    if (description) {
      return `Redo: ${description} (Ctrl+Shift+Z)`;
    }
    return 'Redo (Ctrl+Shift+Z)';
  }

  /**
   * Record that a node was added
   */
  recordNodeAdded(node: WorkflowNode): void {
    this._undoProvider?.recordAddNode(this.getWorkflowId(), node);
  }

  /**
   * Record that a node was deleted
   */
  recordNodeDeleted(node: WorkflowNode, connectedEdges: WorkflowEdge[]): void {
    this._undoProvider?.recordDeleteNode(this.getWorkflowId(), node, connectedEdges);
  }

  /**
   * Record that nodes were moved
   */
  recordNodesMoved(moves: Array<{ nodeId: string; oldPosition: Position; newPosition: Position }>): void {
    this._undoProvider?.recordMoveNodes(this.getWorkflowId(), moves);
  }

  /**
   * Record that a node's configuration was updated
   */
  recordNodeConfigUpdated(
    nodeId: string,
    changes: Partial<WorkflowNode>,
    previousState: Partial<WorkflowNode>
  ): void {
    this._undoProvider?.recordUpdateNodeConfig(this.getWorkflowId(), nodeId, changes, previousState);
  }

  /**
   * Record that an edge was added
   */
  recordEdgeAdded(edge: WorkflowEdge): void {
    this._undoProvider?.recordAddEdge(this.getWorkflowId(), edge);
  }

  /**
   * Record that an edge was deleted
   */
  recordEdgeDeleted(edge: WorkflowEdge): void {
    this._undoProvider?.recordDeleteEdge(this.getWorkflowId(), edge);
  }

  /**
   * Record a bulk delete operation
   */
  recordBulkDeleted(nodes: WorkflowNode[], edges: WorkflowEdge[]): void {
    this._undoProvider?.recordBulkDelete(this.getWorkflowId(), nodes, edges);
  }

  /**
   * Record that nodes were pasted
   */
  recordNodesPasted(nodes: WorkflowNode[], edges: WorkflowEdge[]): void {
    this._undoProvider?.recordPasteNodes(this.getWorkflowId(), nodes, edges);
  }

  /**
   * Record that nodes were duplicated
   */
  recordNodesDuplicated(nodes: WorkflowNode[], edges: WorkflowEdge[]): void {
    this._undoProvider?.recordDuplicateNodes(this.getWorkflowId(), nodes, edges);
  }

  /**
   * Flush any pending operations (call before undo)
   */
  flushPending(): void {
    this._undoProvider?.flushPendingOperations();
  }

  /**
   * Clear undo history for the current workflow
   */
  clearHistory(): void {
    this._undoProvider?.clearUndoHistory(this.getWorkflowId());
  }
}
