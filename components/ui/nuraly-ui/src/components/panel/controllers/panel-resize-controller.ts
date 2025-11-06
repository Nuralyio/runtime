/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Interface for panel resize host element
 */
export interface PanelResizeHost extends ReactiveControllerHost {
  resizable: boolean;
  panelWidth: number;
  panelHeight: number;
  shadowRoot: ShadowRoot | null;
  requestUpdate(): void;
}

/**
 * Controller for handling panel resize functionality
 */
export class PanelResizeController implements ReactiveController {
  private host: PanelResizeHost;
  private isResizing = false;
  private initialWidth = 0;
  private initialHeight = 0;
  private initialX = 0;
  private initialY = 0;
  private resizeDirection = '';

  constructor(host: PanelResizeHost) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    this.setupResizeHandlers();
  }

  hostDisconnected() {
    this.cleanupResizeHandlers();
  }

  private setupResizeHandlers() {
    requestAnimationFrame(() => {
      if (!this.host.resizable) return;

      const handles = this.host.shadowRoot?.querySelectorAll('.resize-handle');
      handles?.forEach(handle => {
        handle.addEventListener('mousedown', this.handleMouseDown as EventListener);
      });

      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
    });
  }

  private cleanupResizeHandlers() {
    const handles = this.host.shadowRoot?.querySelectorAll('.resize-handle');
    handles?.forEach(handle => {
      handle.removeEventListener('mousedown', this.handleMouseDown as EventListener);
    });

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseDown = (event: MouseEvent) => {
    if (!this.host.resizable) return;

    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.initialX = event.clientX;
    this.initialY = event.clientY;

    const panel = this.host.shadowRoot?.querySelector('.panel') as HTMLElement;
    if (panel) {
      this.initialWidth = panel.offsetWidth;
      this.initialHeight = panel.offsetHeight;
    }

    // Get resize direction from class
    const target = event.target as HTMLElement;
    const classList = target.classList;
    this.resizeDirection = Array.from(classList).find(c => c.startsWith('resize-handle-'))?.replace('resize-handle-', '') || '';
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.isResizing || !this.host.resizable) return;

    event.preventDefault();

    const deltaX = event.clientX - this.initialX;
    const deltaY = event.clientY - this.initialY;

    const panel = this.host.shadowRoot?.querySelector('.panel') as HTMLElement;
    if (!panel) return;

    let newWidth = this.initialWidth;
    let newHeight = this.initialHeight;

    // Calculate new dimensions based on resize direction
    if (this.resizeDirection.includes('e')) {
      newWidth = this.initialWidth + deltaX;
    } else if (this.resizeDirection.includes('w')) {
      newWidth = this.initialWidth - deltaX;
    }

    if (this.resizeDirection.includes('s')) {
      newHeight = this.initialHeight + deltaY;
    } else if (this.resizeDirection.includes('n')) {
      newHeight = this.initialHeight - deltaY;
    }

    // Apply minimum dimensions
    const minWidth = 280;
    const minHeight = 200;
    newWidth = Math.max(minWidth, newWidth);
    newHeight = Math.max(minHeight, newHeight);

    // Apply new dimensions
    panel.style.width = `${newWidth}px`;
    panel.style.height = `${newHeight}px`;

    this.host.panelWidth = newWidth;
    this.host.panelHeight = newHeight;
    this.host.requestUpdate();
  };

  private handleMouseUp = () => {
    if (!this.isResizing) return;

    this.isResizing = false;
    this.resizeDirection = '';
    this.host.requestUpdate();
  };
}
