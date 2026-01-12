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
 * Controller for managing node configuration panel
 */
export class ConfigController extends BaseCanvasController {
  constructor(host: CanvasHost & ReactiveControllerHost) {
    super(host);
  }

  /**
   * Open config panel for a node
   */
  openConfig(node: WorkflowNode): void {
    this._host.configuredNode = node;
  }

  /**
   * Close the config panel
   */
  closeConfig(): void {
    this._host.configuredNode = null;
  }

  /**
   * Get currently configured node
   */
  getConfiguredNode(): WorkflowNode | null {
    return this._host.configuredNode;
  }

  /**
   * Check if config panel is open
   */
  isOpen(): boolean {
    return this._host.configuredNode !== null;
  }

  /**
   * Update a configuration field
   */
  updateConfig(key: string, value: unknown): void {
    const node = this._host.configuredNode;
    if (!node) return;

    const updatedNode = {
      ...node,
      configuration: {
        ...node.configuration,
        [key]: value,
      },
    };

    this.applyNodeUpdate(updatedNode);
  }

  /**
   * Update the node name
   */
  updateName(name: string): void {
    const node = this._host.configuredNode;
    if (!node) return;

    const updatedNode = {
      ...node,
      name,
    };

    this.applyNodeUpdate(updatedNode);
  }

  /**
   * Update the node description
   */
  updateDescription(description: string): void {
    const node = this._host.configuredNode;
    if (!node) return;

    const updatedNode = {
      ...node,
      metadata: {
        ...node.metadata,
        description,
      },
    };

    this.applyNodeUpdate(updatedNode);
  }

  /**
   * Apply a node update to the workflow
   */
  private applyNodeUpdate(updatedNode: WorkflowNode): void {
    this._host.setWorkflow({
      ...this._host.workflow,
      nodes: this._host.workflow.nodes.map(n =>
        n.id === updatedNode.id ? updatedNode : n
      ),
    });

    this._host.configuredNode = updatedNode;
    this._host.dispatchWorkflowChanged();
  }

  /**
   * Calculate panel position next to the configured node
   */
  getPanelPosition(): { x: number; y: number } | null {
    const node = this._host.configuredNode;
    if (!node) return null;

    const { viewport } = this._host;
    const nodeWidth = 180;
    const panelOffset = 20;

    return {
      x: (node.position.x + nodeWidth + panelOffset) * viewport.zoom + viewport.panX,
      y: node.position.y * viewport.zoom + viewport.panY,
    };
  }
}
