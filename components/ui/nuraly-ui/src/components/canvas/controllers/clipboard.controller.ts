/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost } from '../interfaces/index.js';
import { WorkflowNode, WorkflowEdge, Position } from '../workflow-canvas.types.js';
import type { UndoController } from './undo.controller.js';

/**
 * Clipboard data format for workflow nodes and edges
 */
export interface ClipboardData {
  type: 'nuraly-workflow-nodes';
  version: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  copyOrigin: Position;
}

/**
 * Extended canvas host interface for clipboard controller
 */
export interface ClipboardHost extends CanvasHost {
  /** Last mouse position on canvas for paste positioning */
  lastMousePosition?: Position;
}

/**
 * Controller for clipboard operations (copy, cut, paste)
 * Supports both internal clipboard and system clipboard with JSON serialization
 */
export class ClipboardController extends BaseCanvasController {
  private _clipboardHost: ClipboardHost & ReactiveControllerHost;
  private undoController: UndoController | null = null;

  /** Internal clipboard for fallback when system clipboard is unavailable */
  private internalClipboard: ClipboardData | null = null;

  constructor(host: ClipboardHost & ReactiveControllerHost) {
    super(host);
    this._clipboardHost = host;
  }

  /**
   * Set the undo controller (called after initialization)
   */
  setUndoController(controller: UndoController): void {
    this.undoController = controller;
  }

  /**
   * Copy selected nodes and their connecting edges to clipboard
   */
  async copySelected(): Promise<boolean> {
    if (this._host.selectedNodeIds.size === 0) {
      return false;
    }

    const clipboardData = this.serializeSelection();
    if (!clipboardData) {
      return false;
    }

    // Try to write to system clipboard
    try {
      const jsonString = JSON.stringify(clipboardData, null, 2);
      await navigator.clipboard.writeText(jsonString);
    } catch (error) {
      console.warn('[ClipboardController] System clipboard unavailable, using internal clipboard');
    }

    // Always store in internal clipboard as fallback
    this.internalClipboard = clipboardData;

    // Dispatch event for UI feedback
    this.dispatchEvent(new CustomEvent('clipboard-copy', {
      detail: {
        nodeCount: clipboardData.nodes.length,
        edgeCount: clipboardData.edges.length,
      },
      bubbles: true,
      composed: true,
    }));

    return true;
  }

  /**
   * Cut selected nodes (copy + delete)
   */
  async cutSelected(): Promise<boolean> {
    if (this._host.readonly) return false;

    const copied = await this.copySelected();
    if (copied) {
      this.deleteSelected();

      // Dispatch event for UI feedback
      this.dispatchEvent(new CustomEvent('clipboard-cut', {
        detail: { success: true },
        bubbles: true,
        composed: true,
      }));
    }
    return copied;
  }

  /**
   * Paste nodes from clipboard
   * @param position Optional position to paste at. If not provided, uses mouse position or canvas center.
   */
  async pasteFromClipboard(position?: Position): Promise<boolean> {
    if (this._host.readonly) return false;

    // Try to read from system clipboard first
    let clipboardData: ClipboardData | null = null;

    try {
      const text = await navigator.clipboard.readText();
      clipboardData = this.parseClipboardData(text);
    } catch (error) {
      console.warn('[ClipboardController] Cannot read system clipboard, using internal clipboard');
    }

    // Fall back to internal clipboard
    if (!clipboardData && this.internalClipboard) {
      clipboardData = structuredClone(this.internalClipboard);
    }

    if (!clipboardData || clipboardData.nodes.length === 0) {
      return false;
    }

    // Calculate paste position
    const pastePosition = position || this.getPastePosition(clipboardData.copyOrigin);

    // Generate new IDs for nodes and update edge references
    const idMap = new Map<string, string>();
    const newNodes: WorkflowNode[] = [];
    const newEdges: WorkflowEdge[] = [];

    // Clone nodes with new IDs and offset positions
    for (const node of clipboardData.nodes) {
      const newId = this.generateNodeId();
      idMap.set(node.id, newId);

      const offsetX = pastePosition.x - clipboardData.copyOrigin.x;
      const offsetY = pastePosition.y - clipboardData.copyOrigin.y;

      newNodes.push({
        ...structuredClone(node),
        id: newId,
        name: this.generateUniqueName(node.name),
        position: {
          x: this.snapToGrid(node.position.x + offsetX, node.position.y + offsetY).x,
          y: this.snapToGrid(node.position.x + offsetX, node.position.y + offsetY).y,
        },
        // Deep clone ports to avoid reference issues (with fallbacks for missing arrays)
        ports: {
          inputs: (node.ports?.inputs || []).map(p => ({ ...p })),
          configs: node.ports?.configs?.map(p => ({ ...p })),
          outputs: (node.ports?.outputs || []).map(p => ({ ...p })),
        },
      });
    }

    // Clone edges with updated node references
    for (const edge of clipboardData.edges) {
      const newSourceId = idMap.get(edge.sourceNodeId);
      const newTargetId = idMap.get(edge.targetNodeId);

      // Only include edge if both nodes are in the paste set
      if (newSourceId && newTargetId) {
        newEdges.push({
          ...structuredClone(edge),
          id: this.generateEdgeId(),
          sourceNodeId: newSourceId,
          targetNodeId: newTargetId,
        });
      }
    }

    // Select the pasted nodes first (before workflow update triggers re-render)
    this._host.selectedNodeIds = new Set(newNodes.map(n => n.id));
    this._host.selectedEdgeIds = new Set(newEdges.map(e => e.id));

    // Record for undo before making changes
    if (this.undoController) {
      this.undoController.recordNodesPasted(newNodes, newEdges);
    }

    // Add to workflow
    this._host.setWorkflow({
      ...this._host.workflow,
      nodes: [...this._host.workflow.nodes, ...newNodes],
      edges: [...this._host.workflow.edges, ...newEdges],
    });

    this._host.dispatchWorkflowChanged();

    // Ensure selection persists after workflow update
    await this._host.updateComplete;
    this._host.selectedNodeIds = new Set(newNodes.map(n => n.id));
    this._host.selectedEdgeIds = new Set(newEdges.map(e => e.id));
    this._host.requestUpdate();

    // Dispatch event for UI feedback
    this.dispatchEvent(new CustomEvent('clipboard-paste', {
      detail: {
        nodeCount: newNodes.length,
        edgeCount: newEdges.length,
      },
      bubbles: true,
      composed: true,
    }));

    return true;
  }

  /**
   * Check if there's content available to paste
   */
  async hasClipboardContent(): Promise<boolean> {
    if (this.internalClipboard) {
      return true;
    }

    try {
      const text = await navigator.clipboard.readText();
      return this.parseClipboardData(text) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Serialize the current selection to clipboard data format
   */
  private serializeSelection(): ClipboardData | null {
    const selectedNodes = this._host.workflow.nodes.filter(
      n => this._host.selectedNodeIds.has(n.id)
    );

    if (selectedNodes.length === 0) {
      return null;
    }

    // Get edges that connect selected nodes (both ends must be selected)
    const selectedEdges = this._host.workflow.edges.filter(
      e => this._host.selectedNodeIds.has(e.sourceNodeId) &&
           this._host.selectedNodeIds.has(e.targetNodeId)
    );

    // Calculate the center of the selection (for positioning on paste)
    const copyOrigin = this.calculateSelectionCenter(selectedNodes);

    return {
      type: 'nuraly-workflow-nodes',
      version: '1.0',
      nodes: structuredClone(selectedNodes),
      edges: structuredClone(selectedEdges),
      copyOrigin,
    };
  }

  /**
   * Parse clipboard text into ClipboardData
   * Supports both Nuraly format and raw workflow JSON
   */
  private parseClipboardData(text: string): ClipboardData | null {
    if (!text || typeof text !== 'string') {
      return null;
    }

    try {
      const json = JSON.parse(text);

      // Check for Nuraly clipboard format
      if (json.type === 'nuraly-workflow-nodes' && Array.isArray(json.nodes)) {
        return json as ClipboardData;
      }

      // Support pasting a full workflow
      if (json.nodes && Array.isArray(json.nodes)) {
        return {
          type: 'nuraly-workflow-nodes',
          version: '1.0',
          nodes: json.nodes,
          edges: json.edges || [],
          copyOrigin: this.calculateSelectionCenter(json.nodes),
        };
      }

      // Support pasting a single node
      if (json.type && json.position && json.ports) {
        return {
          type: 'nuraly-workflow-nodes',
          version: '1.0',
          nodes: [json],
          edges: [],
          copyOrigin: json.position,
        };
      }
    } catch {
      // Not valid JSON, ignore
    }

    return null;
  }

  /**
   * Calculate the center position of a selection of nodes
   */
  private calculateSelectionCenter(nodes: WorkflowNode[]): Position {
    if (nodes.length === 0) {
      return { x: 0, y: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const node of nodes) {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + 200); // estimated node width
      maxY = Math.max(maxY, node.position.y + 80);  // estimated node height
    }

    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    };
  }

  /**
   * Get the position to paste at
   * Uses mouse position if available, otherwise offsets from copy origin
   */
  private getPastePosition(copyOrigin: Position): Position {
    // If we have a last mouse position, use it
    if (this._clipboardHost.lastMousePosition) {
      return this._clipboardHost.lastMousePosition;
    }

    // Otherwise, offset from the copy origin
    return {
      x: copyOrigin.x + 40,
      y: copyOrigin.y + 40,
    };
  }

  /**
   * Delete selected nodes and their connected edges
   */
  private deleteSelected(): void {
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

    this._host.selectedNodeIds = new Set();
    this._host.selectedEdgeIds = new Set();
    this._host.dispatchWorkflowChanged();
  }

  /**
   * Generate a unique name for a pasted node
   */
  private generateUniqueName(originalName: string): string {
    // Remove any existing " (copy)" or " (copy N)" suffix
    let baseName = originalName.replace(/ \(copy(?: \d+)?\)$/, '');

    const existingNames = new Set(
      this._host.workflow.nodes.map(n => n.name)
    );

    // Try "Name (copy)" first
    let newName = `${baseName} (copy)`;
    if (!existingNames.has(newName)) {
      return newName;
    }

    // Then try "Name (copy 2)", "Name (copy 3)", etc.
    let counter = 2;
    while (existingNames.has(`${baseName} (copy ${counter})`)) {
      counter++;
    }
    return `${baseName} (copy ${counter})`;
  }

  /**
   * Generate a unique node ID
   */
  private generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique edge ID
   */
  private generateEdgeId(): string {
    return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
