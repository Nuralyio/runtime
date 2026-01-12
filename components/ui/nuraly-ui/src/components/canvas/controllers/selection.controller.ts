/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost } from '../interfaces/index.js';
import { WorkflowNode, WorkflowEdge } from '../workflow-canvas.types.js';

/**
 * Controller for managing selection state (nodes and edges)
 */
export class SelectionController extends BaseCanvasController {
  constructor(host: CanvasHost & ReactiveControllerHost) {
    super(host);
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
   * Duplicate selected nodes
   */
  duplicateSelected(): void {
    if (this._host.readonly || this._host.selectedNodeIds.size === 0) return;

    const nodesToDuplicate = this._host.workflow.nodes.filter(n =>
      this._host.selectedNodeIds.has(n.id)
    );
    const newNodes: WorkflowNode[] = [];

    for (const node of nodesToDuplicate) {
      const newId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    this._host.setWorkflow({
      ...this._host.workflow,
      nodes: [...this._host.workflow.nodes, ...newNodes],
    });

    // Select the new nodes
    this.clearSelection();
    for (const node of newNodes) {
      this._host.selectedNodeIds.add(node.id);
    }
    this._host.selectedNodeIds = new Set(this._host.selectedNodeIds);
    this._host.dispatchWorkflowChanged();
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
