/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { CanvasHost, CanvasBaseController, ErrorHandler } from '../interfaces/index.js';
import { BaseComponentController } from '@nuralyui/common/controllers';

/**
 * Abstract base controller class that implements common functionality
 * for all canvas component controllers.
 *
 * @typeParam THost - The canvas host type. Defaults to CanvasHost & ReactiveControllerHost.
 *   Subclasses with extended host interfaces can specify a narrower type.
 */
export abstract class BaseCanvasController<THost extends CanvasHost & ReactiveControllerHost = CanvasHost & ReactiveControllerHost>
  extends BaseComponentController<THost>
  implements CanvasBaseController, ErrorHandler {

  /**
   * Helper to get canvas wrapper element
   */
  protected get canvasWrapper(): HTMLElement | null {
    return this._host.canvasWrapper;
  }

  /**
   * Helper to get canvas viewport element
   */
  protected get canvasViewport(): HTMLElement | null {
    return this._host.canvasViewport;
  }

  /**
   * Helper to convert client coordinates to canvas coordinates
   */
  protected clientToCanvas(clientX: number, clientY: number): { x: number; y: number } {
    const wrapper = this.canvasWrapper;
    if (!wrapper) return { x: 0, y: 0 };

    const rect = wrapper.getBoundingClientRect();
    const { viewport } = this._host;

    return {
      x: (clientX - rect.left - viewport.panX) / viewport.zoom,
      y: (clientY - rect.top - viewport.panY) / viewport.zoom,
    };
  }

  /**
   * Helper to snap a position to the grid
   */
  protected snapToGrid(x: number, y: number, gridSize: number = 20): { x: number; y: number } {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }

  /**
   * Generate a unique name by appending " (copy)" or " (copy N)" suffix.
   * Checks against existing node names in the workflow.
   */
  protected generateUniqueName(originalName: string): string {
    const baseName = originalName.replace(/ \(copy(?: \d+)?\)$/, '');
    const existingNames = new Set(
      this._host.workflow.nodes.map(n => n.name)
    );

    const newName = `${baseName} (copy)`;
    if (!existingNames.has(newName)) {
      return newName;
    }

    let counter = 2;
    while (existingNames.has(`${baseName} (copy ${counter})`)) {
      counter++;
    }
    return `${baseName} (copy ${counter})`;
  }

  /**
   * Generate a unique node ID
   */
  protected generateNodeId(): string {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique edge ID
   */
  protected generateEdgeId(): string {
    return `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
