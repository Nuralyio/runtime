/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Interface for panel host element
 */
export interface PanelDragHost extends ReactiveControllerHost {
  draggable: boolean;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  shadowRoot: ShadowRoot | null;
  requestUpdate(): void;
}

/**
 * Controller for handling panel drag functionality
 */
export class PanelDragController implements ReactiveController {
  private host: PanelDragHost;
  private initialX = 0;
  private initialY = 0;
  private dragHandle: HTMLElement | null = null;

  constructor(host: PanelDragHost) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    this.setupDragHandlers();
  }

  hostDisconnected() {
    this.cleanupDragHandlers();
  }

  hostUpdated() {
    // Re-setup handlers when the component updates (e.g., mode changes)
    this.cleanupDragHandlers();
    this.setupDragHandlers();
  }

  private setupDragHandlers() {
    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Clean up any existing listeners first
      this.cleanupDragHandlers();
      
      this.dragHandle = this.host.shadowRoot?.querySelector('.panel-header--draggable') as HTMLElement;
      
      if (this.dragHandle && this.host.draggable) {
        this.dragHandle.addEventListener('mousedown', this.handleMouseDown);
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
      }
    });
  }

  private cleanupDragHandlers() {
    if (this.dragHandle) {
      this.dragHandle.removeEventListener('mousedown', this.handleMouseDown);
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  private handleMouseDown = (event: MouseEvent) => {
    if (!this.host.draggable) return;
    
    event.preventDefault();
    this.host.isDragging = true;
    this.initialX = event.clientX - this.host.offsetX;
    this.initialY = event.clientY - this.host.offsetY;
    
    // Add dragging class for styling
    const panel = this.host.shadowRoot?.querySelector('.panel') as HTMLElement;
    if (panel) {
      panel.classList.add('panel--dragging');
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.host.isDragging || !this.host.draggable) return;
    
    event.preventDefault();
    
    // Calculate new position
    const newX = event.clientX - this.initialX;
    const newY = event.clientY - this.initialY;
    
    // Get panel and viewport dimensions for boundary checking
    const panel = this.host.shadowRoot?.querySelector('.panel') as HTMLElement;
    if (panel) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Keep at least 100px of the panel visible on screen
      // Since panel is centered with translate(-50%, -50%), we need to account for that
      const minVisiblePx = 100;
      const minX = -(viewportWidth / 2) + minVisiblePx;
      const maxX = (viewportWidth / 2) - minVisiblePx;
      const minY = -(viewportHeight / 2) + minVisiblePx;
      const maxY = (viewportHeight / 2) - minVisiblePx;
      
      this.host.offsetX = Math.max(minX, Math.min(maxX, newX));
      this.host.offsetY = Math.max(minY, Math.min(maxY, newY));
      
      // Apply transform - for window mode we need to adjust from center
      const transformX = this.host.offsetX;
      const transformY = this.host.offsetY;
      panel.style.transform = `translate(calc(-50% + ${transformX}px), calc(-50% + ${transformY}px))`;
    }
    
    this.host.requestUpdate();
  };

  private handleMouseUp = () => {
    if (!this.host.isDragging) return;
    
    this.host.isDragging = false;
    
    // Remove dragging class
    const panel = this.host.shadowRoot?.querySelector('.panel') as HTMLElement;
    if (panel) {
      panel.classList.remove('panel--dragging');
    }
    
    this.host.requestUpdate();
  };

  /**
   * Reset panel position to center
   */
  resetPosition() {
    this.host.offsetX = 0;
    this.host.offsetY = 0;
    
    const panel = this.host.shadowRoot?.querySelector('.panel') as HTMLElement;
    if (panel) {
      panel.style.transform = 'translate(-50%, -50%)';
    }
    
    this.host.requestUpdate();
  }
}
