/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { TabsHost, BaseTabsController } from './base.controller.js';
import { ReactiveControllerHost } from 'lit';
import { TabOrderChangeEventDetail, TabEvent } from '../tabs.types.js';

/**
 * Drag and drop controller interface for tabs components
 */
export interface DragDropController {
  handleDragStart(event: DragEvent): void;
  handleDragOver(event: DragEvent): void;
  handleDragEnter(event: DragEvent): void;
  handleDragLeave(event: DragEvent): void;
  handleDrop(event: DragEvent): void;
}

/**
 * Enhanced tabs host interface for drag and drop functionality
 */
export interface TabsDragDropHost extends TabsHost {
  editable?: {
    canMove?: boolean;
  };
  dispatchEventWithMetadata(eventName: string, detail: any): void;
}

/**
 * Drag and drop controller manages drag and drop functionality for tabs components
 * Handles all drag events and tab reordering
 */
export class TabsDragDropController extends BaseTabsController implements DragDropController {
  protected override _host: TabsDragDropHost & ReactiveControllerHost;
  private dragOverHandler: (event: Event) => void;

  constructor(host: TabsDragDropHost & ReactiveControllerHost) {
    super(host);
    this._host = host;
    this.dragOverHandler = (event: Event) => this.handleDragOver(event as DragEvent);
  }

  override get host(): TabsDragDropHost & ReactiveControllerHost {
    return this._host;
  }

  override hostConnected(): void {
    super.hostConnected();
    
    // Add global drag over listener
    this._host.addEventListener('dragover', this.dragOverHandler);
  }

  override hostDisconnected(): void {
    super.hostDisconnected();
    
    // Remove global drag over listener
    this._host.removeEventListener('dragover', this.dragOverHandler);
  }

  /**
   * Handle drag start event
   * @param event - The drag event
   */
  handleDragStart(event: DragEvent): void {
    try {
      if (!event.dataTransfer) return;
      
      const target = event.currentTarget as HTMLElement;
      const tabIndex = target.dataset.index || '';
      
      if (!this.isValidTabIndex(parseInt(tabIndex))) return;
      
      event.dataTransfer.setData('text/plain', tabIndex);
      event.dataTransfer.effectAllowed = 'move';
      target.classList.add('dragging-start');

      // Dispatch drag start event
      this.dispatchEvent(
        new CustomEvent('tabs-drag-start', {
          detail: {
            tabIndex: parseInt(tabIndex),
            tab: this.host.tabs[parseInt(tabIndex)],
            timestamp: Date.now()
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError(error as Error, 'handleDragStart');
    }
  }

  /**
   * Handle drag over event
   * @param event - The drag event
   */
  handleDragOver(event: DragEvent): void {
    try {
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    } catch (error) {
      this.handleError(error as Error, 'handleDragOver');
    }
  }

  /**
   * Handle drag enter event
   * @param event - The drag event
   */
  handleDragEnter(event: DragEvent): void {
    try {
      event.preventDefault();
      const target = event.currentTarget as HTMLElement;
      
      if (target.contains(event.relatedTarget as Node)) {
        return;
      }
      
      target.classList.add('dragging');
    } catch (error) {
      this.handleError(error as Error, 'handleDragEnter');
    }
  }

  /**
   * Handle drag leave event
   * @param event - The drag event
   */
  handleDragLeave(event: DragEvent): void {
    try {
      event.preventDefault();
      const target = event.currentTarget as HTMLElement;
      
      if (target.contains(event.relatedTarget as Node)) {
        return;
      }
      
      if (target.classList.contains('dragging')) {
        target.classList.remove('dragging');
      }
    } catch (error) {
      this.handleError(error as Error, 'handleDragLeave');
    }
  }

  /**
   * Handle drop event
   * @param event - The drag event
   */
  handleDrop(event: DragEvent): void {
    try {
      event.preventDefault();
      if (!event.dataTransfer) return;
      
      const target = event.currentTarget as HTMLElement;
      const sourceIndex = parseInt(event.dataTransfer.getData('text/plain'));
      const targetIndex = parseInt(target.dataset.index || '0');
      
      if (this.isValidTabReorder(sourceIndex, targetIndex)) {
        this.performTabReorder(sourceIndex, targetIndex);
      }
      
      this.cleanupDragClasses();
    } catch (error) {
      this.handleError(error as Error, 'handleDrop');
    }
  }

  /**
   * Check if tab can be moved (drag and drop enabled)
   */
  canMoveTab(): boolean {
    return this.host.editable?.canMove ?? false;
  }

  /**
   * Validate if tab reorder is valid
   */
  private isValidTabReorder(sourceIndex: number, targetIndex: number): boolean {
    return (
      sourceIndex !== targetIndex &&
      this.isValidTabIndex(sourceIndex) &&
      this.isValidTabIndex(targetIndex) &&
      this.canMoveTab()
    );
  }

  /**
   * Perform tab reordering
   */
  private performTabReorder(sourceIndex: number, targetIndex: number): void {
    try {
      const sourceTab = this.host.tabs[sourceIndex];
      const targetTab = this.host.tabs[targetIndex];
      
      // Dispatch tab order change event
      this.host.dispatchEventWithMetadata(TabEvent.TabOrderChange, {
        sourceIndex,
        targetIndex,
        sourceTab,
        targetTab
      } as TabOrderChangeEventDetail);

      // Dispatch drag drop complete event
      this.dispatchEvent(
        new CustomEvent('tabs-drag-complete', {
          detail: {
            sourceIndex,
            targetIndex,
            sourceTab,
            targetTab,
            timestamp: Date.now()
          },
          bubbles: true,
          composed: true,
        })
      );
    } catch (error) {
      this.handleError(error as Error, 'performTabReorder');
    }
  }

  /**
   * Clean up drag-related CSS classes
   */
  private cleanupDragClasses(): void {
    try {
      const shadowRoot = this.host.shadowRoot;
      if (shadowRoot) {
        shadowRoot.querySelector('.dragging')?.classList.remove('dragging');
        shadowRoot.querySelector('.dragging-start')?.classList.remove('dragging-start');
      }
    } catch (error) {
      this.handleError(error as Error, 'cleanupDragClasses');
    }
  }

  /**
   * Get draggable state for tab element
   */
  getDraggableState(): boolean {
    return this.canMoveTab();
  }
}