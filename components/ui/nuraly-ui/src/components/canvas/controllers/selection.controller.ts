/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost } from '../interfaces/index.js';
import type { WorkflowNode, WorkflowEdge } from '../workflow-canvas.types.js';
import type { UndoController } from './undo.controller.js';

/**
 * Controller for managing selection state (nodes and edges)
 */
export class SelectionController extends BaseCanvasController {
  private undoController: UndoController | null = null;

  constructor(host: CanvasHost & ReactiveControllerHost) {
    super(host);
  }

  /**
   * Set the undo controller (called after initialization)
   */
  setUndoController(controller: UndoController): void {
    this.undoController = controller;
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this._host.selectedNodeIds = new Set();
    this._host.selectedEdgeIds = new Set();
    this._host.contextMenu = null;
  }

  /**
   * Select all nodes and edges
   */
  selectAll(): void {
    this._host.selectedNodeIds = new Set(this._host.workflow.nodes.map(n => n.id));
    this._host.selectedEdgeIds = new Set(this._host.workflow.edges.map(e => e.id));
  }

  /**
   * Select a node
   */
  selectNode(nodeId: string, addToSelection: boolean = false): void {
    if (!addToSelection) {
      this.clearSelection();
    }
    this._host.selectedNodeIds.add(nodeId);
    this._host.selectedNodeIds = new Set(this._host.selectedNodeIds);
  }

  /**
   * Deselect a node
   */
  deselectNode(nodeId: string): void {
    this._host.selectedNodeIds.delete(nodeId);
    this._host.selectedNodeIds = new Set(this._host.selectedNodeIds);
  }

  /**
   * Toggle node selection
   */
  toggleNodeSelection(nodeId: string): void {
    if (this._host.selectedNodeIds.has(nodeId)) {
      this.deselectNode(nodeId);
    } else {
      this.selectNode(nodeId, true);
    }
  }

  /**
   * Select an edge
   */
  selectEdge(edgeId: string, addToSelection: boolean = false): void {
    if (!addToSelection) {
      this.clearSelection();
    }
    this._host.selectedEdgeIds.add(edgeId);
    this._host.selectedEdgeIds = new Set(this._host.selectedEdgeIds);
  }

  /**
   * Check if a node is selected
   */
  isNodeSelected(nodeId: string): boolean {
    return this._host.selectedNodeIds.has(nodeId);
  }

  /**
   * Check if an edge is selected
   */
  isEdgeSelected(edgeId: string): boolean {
    return this._host.selectedEdgeIds.has(edgeId);
  }

  /**
   * Get selected nodes
   */
  getSelectedNodes(): WorkflowNode[] {
    return this._host.workflow.nodes.filter(n => this._host.selectedNodeIds.has(n.id));
  }

  /**
   * Get selected edges
   */
  getSelectedEdges(): WorkflowEdge[] {
    return this._host.workflow.edges.filter(e => this._host.selectedEdgeIds.has(e.id));
  }

  /**
   * Delete selected items
   */
  deleteSelected(): void {
    if (this._host.readonly) return;

    const nodeIdsToDelete = this._host.selectedNodeIds;
    const edgeIdsToDelete = this._host.selectedEdgeIds;

    // Get the nodes and edges being deleted for undo
    const nodesToDelete = this._host.workflow.nodes.filter(n => nodeIdsToDelete.has(n.id));
    const edgesToDelete = this._host.workflow.edges.filter(
      e =>
        edgeIdsToDelete.has(e.id) ||
        nodeIdsToDelete.has(e.sourceNodeId) ||
        nodeIdsToDelete.has(e.targetNodeId)
    );

    // Record for undo before making changes
    if (this.undoController && (nodesToDelete.length > 0 || edgesToDelete.length > 0)) {
      this.undoController.recordBulkDeleted(nodesToDelete, edgesToDelete);
    }

    this._host.setWorkflow({
      ...this._host.workflow,
      nodes: this._host.workflow.nodes.filter(n => !nodeIdsToDelete.has(n.id)),
      edges: this._host.workflow.edges.filter(
        e =>
          !edgeIdsToDelete.has(e.id) &&
          !nodeIdsToDelete.has(e.sourceNodeId) &&
          !nodeIdsToDelete.has(e.targetNodeId)
      ),
    });

    this.clearSelection();
    this._host.dispatchWorkflowChanged();
  }

  /**
   * Duplicate selected nodes and their connecting edges
   */
  duplicateSelected(): void {
    if (this._host.readonly || this._host.selectedNodeIds.size === 0) return;

    const nodesToDuplicate = this._host.workflow.nodes.filter(n =>
      this._host.selectedNodeIds.has(n.id)
    );

    // Map from old node ID to new node ID
    const idMap = new Map<string, string>();
    const newNodes: WorkflowNode[] = [];
    const newEdges: WorkflowEdge[] = [];

    // Duplicate nodes
    for (const node of nodesToDuplicate) {
      const newId = this.generateNodeId();
      idMap.set(node.id, newId);

      newNodes.push({
        ...node,
        id: newId,
        name: this.generateUniqueName(node.name),
        position: {
          x: node.position.x + 40,
          y: node.position.y + 40,
        },
        ports: {
          inputs: node.ports.inputs.map(p => ({ ...p })),
          configs: node.ports.configs?.map(p => ({ ...p })),
          outputs: node.ports.outputs.map(p => ({ ...p })),
        },
      });
    }

    // Duplicate edges that connect the selected nodes
    const edgesToDuplicate = this._host.workflow.edges.filter(e =>
      this._host.selectedNodeIds.has(e.sourceNodeId) &&
      this._host.selectedNodeIds.has(e.targetNodeId)
    );

    for (const edge of edgesToDuplicate) {
      const newSourceId = idMap.get(edge.sourceNodeId);
      const newTargetId = idMap.get(edge.targetNodeId);

      if (newSourceId && newTargetId) {
        newEdges.push({
          ...edge,
          id: this.generateEdgeId(),
          sourceNodeId: newSourceId,
          targetNodeId: newTargetId,
        });
      }
    }

    // Record for undo before making changes
    if (this.undoController) {
      this.undoController.recordNodesDuplicated(newNodes, newEdges);
    }

    // Set selection before workflow update
    const newNodeIds = new Set(newNodes.map(n => n.id));
    const newEdgeIds = new Set(newEdges.map(e => e.id));
    this._host.selectedNodeIds = newNodeIds;
    this._host.selectedEdgeIds = newEdgeIds;

    this._host.setWorkflow({
      ...this._host.workflow,
      nodes: [...this._host.workflow.nodes, ...newNodes],
      edges: [...this._host.workflow.edges, ...newEdges],
    });

    this._host.dispatchWorkflowChanged();

    // Ensure selection persists after workflow update
    this._host.updateComplete.then(() => {
      this._host.selectedNodeIds = newNodeIds;
      this._host.selectedEdgeIds = newEdgeIds;
      this._host.requestUpdate();
    });
  }

  /**
   * Open configuration for the first selected node
   */
  openConfigForSelected(): void {
    if (this._host.selectedNodeIds.size === 0) return;
    const nodeId = Array.from(this._host.selectedNodeIds)[0];
    const node = this._host.workflow.nodes.find(n => n.id === nodeId);
    if (node) {
      this._host.configuredNode = node;
    }
  }

  /**
   * Check if there are any selections
   */
  hasSelection(): boolean {
    return this._host.selectedNodeIds.size > 0 || this._host.selectedEdgeIds.size > 0;
  }

  /**
   * Get count of selected items
   */
  getSelectionCount(): { nodes: number; edges: number } {
    return {
      nodes: this._host.selectedNodeIds.size,
      edges: this._host.selectedEdgeIds.size,
    };
  }
}
