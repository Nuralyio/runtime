/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * Interface for modal host element
 */
export interface ModalDragHost extends ReactiveControllerHost {
  modalDraggable: boolean;
  offsetX: number;
  offsetY: number;
  isDragging: boolean;
  shadowRoot: ShadowRoot | null;
  requestUpdate(): void;
}

/**
 * Controller for handling modal drag functionality
 */
export class ModalDragController implements ReactiveController {
  private host: ModalDragHost;
  private initialX = 0;
  private initialY = 0;
  private dragHandle: HTMLElement | null = null;

  constructor(host: ModalDragHost) {
    this.host = host;
    this.host.addController(this);
  }

  hostConnected() {
    this.setupDragHandlers();
  }

  hostDisconnected() {
    this.cleanupDragHandlers();
  }

  private setupDragHandlers() {
    // Wait for next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      this.dragHandle = this.host.shadowRoot?.querySelector('.modal-header--draggable') as HTMLElement;
      
      if (this.dragHandle && this.host.modalDraggable) {
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
    if (!this.host.modalDraggable) return;
    
    event.preventDefault();
    this.host.isDragging = true;
    this.initialX = event.clientX - this.host.offsetX;
    this.initialY = event.clientY - this.host.offsetY;
    
    // Add dragging class for styling
    const modal = this.host.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (modal) {
      modal.classList.add('modal--dragging');
    }
  };

  private handleMouseMove = (event: MouseEvent) => {
    if (!this.host.isDragging || !this.host.modalDraggable) return;
    
    event.preventDefault();
    
    // Calculate new position
    const newX = event.clientX - this.initialX;
    const newY = event.clientY - this.initialY;
    
    // Get modal and viewport dimensions for boundary checking
    const modal = this.host.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (modal) {
      const modalRect = modal.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Keep modal within viewport bounds
      const minX = -modalRect.width / 2;
      const maxX = viewportWidth - modalRect.width / 2;
      const minY = -modalRect.height / 2;
      const maxY = viewportHeight - modalRect.height / 2;
      
      this.host.offsetX = Math.max(minX, Math.min(maxX, newX));
      this.host.offsetY = Math.max(minY, Math.min(maxY, newY));
      
      // Apply transform
      modal.style.transform = `translate(${this.host.offsetX}px, ${this.host.offsetY}px)`;
    }
    
    this.host.requestUpdate();
  };

  private handleMouseUp = () => {
    if (!this.host.isDragging) return;
    
    this.host.isDragging = false;
    
    // Remove dragging class
    const modal = this.host.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (modal) {
      modal.classList.remove('modal--dragging');
    }
    
    this.host.requestUpdate();
  };

  /**
   * Reset modal position to center
   */
  resetPosition() {
    this.host.offsetX = 0;
    this.host.offsetY = 0;
    
    const modal = this.host.shadowRoot?.querySelector('.modal') as HTMLElement;
    if (modal) {
      modal.style.transform = 'none';
    }
    
    this.host.requestUpdate();
  }
}