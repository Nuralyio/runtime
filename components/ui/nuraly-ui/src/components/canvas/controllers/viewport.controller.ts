/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost, CanvasViewport } from '../interfaces/index.js';

/**
 * Extended host interface for viewport controller
 */
export interface ViewportHost extends CanvasHost {
  viewport: CanvasViewport;
}

/**
 * Controller for managing canvas viewport (pan, zoom, transform)
 */
export class ViewportController extends BaseCanvasController<ViewportHost & ReactiveControllerHost> {
  private readonly boundHandleWheel: (e: WheelEvent) => void;
  private readonly debouncedDispatchViewportChanged = this.debounce(() => {
    this._host.dispatchViewportChanged();
  }, 300);
  private animationFrameId: number | null = null;

  constructor(host: ViewportHost & ReactiveControllerHost) {
    super(host);
    this.boundHandleWheel = this.handleWheel.bind(this);
  }

  override hostConnected(): void {
    window.addEventListener('wheel', this.boundHandleWheel, { passive: false, capture: true });
  }

  override hostDisconnected(): void {
    window.removeEventListener('wheel', this.boundHandleWheel, { capture: true });
    this.debouncedDispatchViewportChanged.cancel();
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Handle wheel events for pan and zoom
   */
  private handleWheel(e: WheelEvent): void {
    const wrapper = this.canvasWrapper;

    if (!wrapper) return;

    // Block wheel events when canvas is disabled
    if (this._host.disabled) return;

    // Check if event is within our canvas (using shadow DOM)
    const path = e.composedPath();
    const isInCanvas = path.some(el => el === wrapper || el === this._host);
    if (!isInCanvas) return;

    // Skip if inside scrollable panels - check composedPath for shadow DOM support
    const isInScrollablePanel = path.some(el => {
      if (el instanceof HTMLElement) {
        return el.classList?.contains('node-palette') ||
               el.classList?.contains('config-panel') ||
               el.classList?.contains('insert-panel') ||
               el.classList?.contains('chatbot-preview-panel') ||
               el.classList?.contains('palette-content') ||
               el.classList?.contains('config-panel-content') ||
               el.classList?.contains('chatbot-preview-content');
      }
      return false;
    });

    if (isInScrollablePanel) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const { deltaX, deltaY, ctrlKey, metaKey } = e;

    if (ctrlKey || metaKey) {
      this.handleZoom(e, deltaY);
    } else {
      this.handlePan(deltaX, deltaY);
    }
  }

  /**
   * Handle zoom via wheel
   */
  private handleZoom(e: WheelEvent, deltaY: number): void {
    const wrapper = this.canvasWrapper;
    if (!wrapper) return;

    const { viewport } = this._host;
    const zoom = Math.max(0.25, Math.min(2, viewport.zoom * (1 - deltaY * 0.01)));
    const rect = wrapper.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scale = zoom / viewport.zoom;

    this._host.viewport = {
      zoom,
      panX: mx - (mx - viewport.panX) * scale,
      panY: my - (my - viewport.panY) * scale,
    };

    this.updateTransform();
    this._host.dispatchViewportChanged();
  }

  /**
   * Handle pan via wheel
   */
  private handlePan(deltaX: number, deltaY: number): void {
    const { viewport } = this._host;

    this._host.viewport = {
      ...viewport,
      panX: viewport.panX - deltaX,
      panY: viewport.panY - deltaY,
    };

    this.updateTransform();

    // Debounce viewport changed event to avoid excessive saves during scroll
    this.debouncedDispatchViewportChanged();
  }

  /**
   * Update the CSS transform on the viewport element
   */
  updateTransform(): void {
    const viewportEl = this.canvasViewport;
    if (!viewportEl) return;

    const { viewport } = this._host;
    viewportEl.style.transform = `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`;

    this.updateConfigPanelPosition();
    this.updateInsertPanelPosition();
  }

  /**
   * Update config panel position to follow the configured node
   */
  updateConfigPanelPosition(): void {
    const { configuredNode, configPanel, viewport } = this._host;
    if (!configPanel || !configuredNode) return;

    const nodeWidth = 180;
    const panelOffset = 20;
    const panelX = (configuredNode.position.x + nodeWidth + panelOffset) * viewport.zoom + viewport.panX;
    const panelY = configuredNode.position.y * viewport.zoom + viewport.panY;

    configPanel.style.left = `${panelX}px`;
    configPanel.style.top = `${panelY}px`;
  }

  /**
   * Update insert panel position to track LEFT of the target node
   */
  updateInsertPanelPosition(): void {
    const host = this._host as any;
    const { insertPanelNode, insertPanel, viewport } = host;
    if (!insertPanel || !insertPanelNode) return;

    const panelWidth = 320;
    const panelOffset = 20;
    const panelX = insertPanelNode.position.x * viewport.zoom + viewport.panX - (panelWidth + panelOffset) * viewport.zoom;
    const panelY = insertPanelNode.position.y * viewport.zoom + viewport.panY;

    insertPanel.style.left = `${panelX}px`;
    insertPanel.style.top = `${panelY}px`;
    insertPanel.style.transform = `scale(${viewport.zoom})`;
    insertPanel.style.transformOrigin = 'top right';
  }

  /**
   * Handle panning via mouse drag
   */
  handlePanDrag(e: MouseEvent): void {
    if (this._host.disabled) return;
    const { panStart } = this._host;
    this._host.viewport = {
      ...this._host.viewport,
      panX: e.clientX - panStart.x,
      panY: e.clientY - panStart.y,
    };
    this.updateTransform();
  }

  /**
   * Start panning
   */
  startPan(e: MouseEvent): void {
    if (this._host.disabled) return;
    this._host.isPanning = true;
    this._host.panStart = {
      x: e.clientX - this._host.viewport.panX,
      y: e.clientY - this._host.viewport.panY,
    };
  }

  /**
   * Stop panning and dispatch viewport changed event
   */
  stopPan(): void {
    this._host.isPanning = false;
    this._host.dispatchViewportChanged();
  }

  /**
   * Zoom in
   */
  zoomIn(): void {
    this.setZoom(Math.min(2, this._host.viewport.zoom * 1.2));
  }

  /**
   * Zoom out
   */
  zoomOut(): void {
    this.setZoom(Math.max(0.25, this._host.viewport.zoom / 1.2));
  }

  /**
   * Pan the viewport to center on a specific canvas coordinate.
   * Animates smoothly using an ease-out curve. Preserves the current zoom level.
   */
  panToPosition(canvasX: number, canvasY: number, animate = true): void {
    const wrapper = this.canvasWrapper;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const { zoom } = this._host.viewport;

    const targetPanX = rect.width / 2 - canvasX * zoom;
    const targetPanY = rect.height / 2 - canvasY * zoom;

    if (!animate) {
      this._host.viewport = { zoom, panX: targetPanX, panY: targetPanY };
      this.updateTransform();
      this._host.dispatchViewportChanged();
      return;
    }

    // Cancel any in-progress animation
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const startPanX = this._host.viewport.panX;
    const startPanY = this._host.viewport.panY;
    const duration = 500; // ms
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic: 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - t, 3);

      const panX = startPanX + (targetPanX - startPanX) * eased;
      const panY = startPanY + (targetPanY - startPanY) * eased;

      this._host.viewport = { zoom, panX, panY };
      this.updateTransform();

      if (t < 1) {
        this.animationFrameId = requestAnimationFrame(step);
      } else {
        this.animationFrameId = null;
        this._host.dispatchViewportChanged();
      }
    };

    this.animationFrameId = requestAnimationFrame(step);
  }

  /**
   * Reset view to default
   */
  resetView(): void {
    this._host.viewport = { zoom: 1, panX: 0, panY: 0 };
    this.updateTransform();
    this._host.dispatchViewportChanged();
  }

  /**
   * Set zoom level centered on a specific screen point (used by pinch-to-zoom)
   */
  setZoomAtPoint(newZoom: number, clientX: number, clientY: number): void {
    const wrapper = this.canvasWrapper;
    if (!wrapper) return;
    const zoom = Math.max(0.25, Math.min(2, newZoom));
    const rect = wrapper.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    const { viewport } = this._host;
    const scale = zoom / viewport.zoom;
    this._host.viewport = {
      zoom,
      panX: mx - (mx - viewport.panX) * scale,
      panY: my - (my - viewport.panY) * scale,
    };
    this.updateTransform();
    this._host.dispatchViewportChanged();
  }

  /**
   * Set zoom level centered on viewport
   */
  setZoom(zoom: number): void {
    const wrapper = this.canvasWrapper;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const { viewport } = this._host;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newPanX = centerX - (centerX - viewport.panX) * (zoom / viewport.zoom);
    const newPanY = centerY - (centerY - viewport.panY) * (zoom / viewport.zoom);

    this._host.viewport = { zoom, panX: newPanX, panY: newPanY };
    this.updateTransform();
    this._host.dispatchViewportChanged();
  }

  /**
   * Get current zoom percentage
   */
  getZoomPercentage(): number {
    return Math.round(this._host.viewport.zoom * 100);
  }
}
