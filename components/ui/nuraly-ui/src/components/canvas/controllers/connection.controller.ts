/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost, ConnectionState } from '../interfaces/index.js';
import { WorkflowNode, WorkflowEdge, NodePort, Position } from '../workflow-canvas.types.js';

/**
 * Controller for managing edge connections
 */
export class ConnectionController extends BaseCanvasController {
  constructor(host: CanvasHost & ReactiveControllerHost) {
    super(host);
  }

  /**
   * Start creating a connection from a port
   */
  startConnection(node: WorkflowNode, port: NodePort, isInput: boolean, event: MouseEvent): void {
    const pos = this.clientToCanvas(event.clientX, event.clientY);

    this._host.connectionState = {
      sourceNodeId: node.id,
      sourcePortId: port.id,
      sourceIsInput: isInput,
      mouseX: pos.x,
      mouseY: pos.y,
    };
  }

  /**
   * Update the connection line position during drag
   */
  updateConnectionPosition(event: MouseEvent): void {
    if (!this._host.connectionState) return;

    const pos = this.clientToCanvas(event.clientX, event.clientY);

    this._host.connectionState = {
      ...this._host.connectionState,
      mouseX: pos.x,
      mouseY: pos.y,
    };
  }

  /**
   * Complete the connection when released on a valid port
   */
  completeConnection(node: WorkflowNode, port: NodePort, isInput: boolean): boolean {
    const state = this._host.connectionState;
    if (!state) return false;

    // Can't connect input to input or output to output
    if (state.sourceIsInput === isInput) {
      this.cancelConnection();
      return false;
    }

    // Can't connect to same node
    if (state.sourceNodeId === node.id) {
      this.cancelConnection();
      return false;
    }

    // Determine source and target based on which port started the connection
    const sourceNodeId = state.sourceIsInput ? node.id : state.sourceNodeId;
    const sourcePortId = state.sourceIsInput ? port.id : state.sourcePortId;
    const targetNodeId = state.sourceIsInput ? state.sourceNodeId : node.id;
    const targetPortId = state.sourceIsInput ? state.sourcePortId : port.id;

    // Check if edge already exists
    const edgeExists = this._host.workflow.edges.some(
      edge =>
        edge.sourceNodeId === sourceNodeId &&
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

      this._host.setWorkflow({
        ...this._host.workflow,
        edges: [...this._host.workflow.edges, newEdge],
      });

      this._host.dispatchWorkflowChanged();
    }

    this.cancelConnection();
    return !edgeExists;
  }

  /**
   * Cancel the current connection
   */
  cancelConnection(): void {
    this._host.connectionState = null;
  }

  /**
   * Check if currently creating a connection
   */
  isConnecting(): boolean {
    return this._host.connectionState !== null;
  }

  /**
   * Get the current connection state
   */
  getConnectionState(): ConnectionState | null {
    return this._host.connectionState;
  }

  /**
   * Get port position for a node
   */
  getPortPosition(node: WorkflowNode, portId: string, isInput: boolean): Position {
    const portIndex = isInput
      ? node.ports.inputs.findIndex(p => p.id === portId)
      : node.ports.outputs.findIndex(p => p.id === portId);

    const totalPorts = isInput ? node.ports.inputs.length : node.ports.outputs.length;

    // Match the port positioning from workflow-node.component.ts
    const nodeHeight = 80;
    const portSpacing = 20;

    // Calculate vertical center position
    const totalPortsHeight = (totalPorts - 1) * portSpacing;
    const startY = (nodeHeight - totalPortsHeight) / 2;
    const topOffset = startY + portIndex * portSpacing;

    const nodeWidth = 180;

    return {
      x: node.position.x + (isInput ? 2 : nodeWidth - 2),
      y: node.position.y + topOffset + 3,
    };
  }

  /**
   * Delete an edge by ID
   */
  deleteEdge(edgeId: string): void {
    if (this._host.readonly) return;

    this._host.setWorkflow({
      ...this._host.workflow,
      edges: this._host.workflow.edges.filter(e => e.id !== edgeId),
    });

    this._host.dispatchWorkflowChanged();
  }

  /**
   * Get edges connected to a node
   */
  getNodeEdges(nodeId: string): { inputs: WorkflowEdge[]; outputs: WorkflowEdge[] } {
    return {
      inputs: this._host.workflow.edges.filter(e => e.targetNodeId === nodeId),
      outputs: this._host.workflow.edges.filter(e => e.sourceNodeId === nodeId),
    };
  }

  /**
   * Set hovered edge ID
   */
  setHoveredEdge(edgeId: string | null): void {
    this._host.hoveredEdgeId = edgeId;
  }

  /**
   * Get hovered edge ID
   */
  getHoveredEdge(): string | null {
    return this._host.hoveredEdgeId;
  }
}
