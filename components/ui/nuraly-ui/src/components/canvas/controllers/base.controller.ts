/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import { CanvasHost, CanvasBaseController, ErrorHandler } from '../interfaces/index.js';

/**
 * Abstract base controller class that implements common functionality
 * for all canvas component controllers
 */
export abstract class BaseCanvasController implements CanvasBaseController, ReactiveController, ErrorHandler {
  protected _host: CanvasHost & ReactiveControllerHost;

  constructor(host: CanvasHost & ReactiveControllerHost) {
    this._host = host;
    this._host.addController(this);
  }

  /**
   * Get the host element
   */
  get host(): CanvasHost {
    return this._host;
  }

  /**
   * Reactive controller lifecycle - called when host connects
   */
  hostConnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Reactive controller lifecycle - called when host disconnects
   */
  hostDisconnected(): void {
    // Override in subclasses if needed
  }

  /**
   * Reactive controller lifecycle - called when host updates
   */
  hostUpdate(): void {
    // Override in subclasses if needed
  }

  /**
   * Reactive controller lifecycle - called when host has updated
   */
  hostUpdated(): void {
    // Override in subclasses if needed
  }

  /**
   * Handle errors with consistent logging and optional user feedback
   */
  handleError(error: Error, context: string): void {
    console.error(`[CanvasController] Error in ${context}:`, error);

    this.dispatchEvent(
      new CustomEvent('canvas-error', {
        detail: {
          error,
          context,
          timestamp: Date.now(),
          controller: this.constructor.name,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Helper method to dispatch events consistently
   */
  protected dispatchEvent(event: CustomEvent): void {
    try {
      this._host.dispatchEvent(event);
    } catch (error) {
      console.error('[CanvasController] Failed to dispatch event:', error);
    }
  }

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
}
