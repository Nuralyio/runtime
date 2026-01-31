/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { BaseCanvasController } from './base.controller.js';
import { CanvasHost } from '../interfaces/index.js';
import { WorkflowNode, Position, CanvasMode } from '../workflow-canvas.types.js';
import { SelectionController } from './selection.controller.js';
import { ClipboardController } from './clipboard.controller.js';
import type { UndoController } from './undo.controller.js';

type ArrowDirection = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight';

/**
 * Controller for keyboard navigation and shortcuts
 */
export class KeyboardController extends BaseCanvasController {
  private boundHandleKeyDown: (e: KeyboardEvent) => void;
  private selectionController: SelectionController;
  private clipboardController: ClipboardController | null = null;
  private undoController: UndoController | null = null;

  constructor(host: CanvasHost & ReactiveControllerHost, selectionController: SelectionController) {
    super(host);
    this.selectionController = selectionController;
    this.boundHandleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Set the clipboard controller (called after initialization)
   */
  setClipboardController(controller: ClipboardController): void {
    this.clipboardController = controller;
  }

  /**
   * Set the undo controller (called after initialization)
   */
  setUndoController(controller: UndoController): void {
    this.undoController = controller;
  }

  override hostConnected(): void {
    window.addEventListener('keydown', this.boundHandleKeyDown);
  }

  override hostDisconnected(): void {
    window.removeEventListener('keydown', this.boundHandleKeyDown);
  }

  /**
   * Check if an element or any of its shadow roots contain an editable element
   */
  private isEditableElement(element: Element | null): boolean {
    if (!element) return false;

    const tagName = element.tagName.toUpperCase();

    // Check if it's a native editable element
    if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
      return true;
    }

    // Check for contenteditable
    if ((element as HTMLElement).isContentEditable) {
      return true;
    }

    // Check if it's a custom input component (nr-input, nr-select, etc.)
    if (tagName.startsWith('NR-') && (
      tagName.includes('INPUT') ||
      tagName.includes('SELECT') ||
      tagName.includes('TEXTAREA')
    )) {
      return true;
    }

    // Check shadow root for editable elements
    const shadowRoot = element.shadowRoot;
    if (shadowRoot) {
      const activeInShadow = shadowRoot.activeElement;
      if (activeInShadow && this.isEditableElement(activeInShadow)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Block keyboard events when canvas is disabled
    if (this._host.disabled) return;

    // Don't handle key events if focus is in an input field
    const target = e.target as HTMLElement;
    const activeElement = document.activeElement;

    // Check both the event target and the active element
    if (this.isEditableElement(target) || this.isEditableElement(activeElement)) {
      return;
    }

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (!this._host.readonly && this.selectionController.hasSelection()) {
          e.preventDefault();
          this.selectionController.deleteSelected();
        }
        break;

      case 'Escape':
        this._host.connectionState = null;
        this._host.contextMenu = null;
        this._host.configuredNode = null;
        this.selectionController.clearSelection();
        break;

      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.selectionController.selectAll();
        }
        break;

      case 'c':
        // Copy (Ctrl+C / Cmd+C) - only if nodes are selected, otherwise allow default text copy
        if ((e.ctrlKey || e.metaKey) && this.clipboardController && this.selectionController.hasSelection()) {
          e.preventDefault();
          this.clipboardController.copySelected();
        }
        break;

      case 'x':
        // Cut (Ctrl+X / Cmd+X) - only if nodes are selected, otherwise allow default text cut
        if ((e.ctrlKey || e.metaKey) && !this._host.readonly && this.clipboardController && this.selectionController.hasSelection()) {
          e.preventDefault();
          this.clipboardController.cutSelected();
        }
        break;

      case 'v':
        // Paste (Ctrl+V / Cmd+V) or Select mode (V key alone)
        if ((e.ctrlKey || e.metaKey) && !this._host.readonly && this.clipboardController) {
          e.preventDefault();
          this.clipboardController.pasteFromClipboard();
        } else if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          // Select mode (V key alone)
          e.preventDefault();
          this._host.mode = CanvasMode.SELECT;
          this._host.requestUpdate();
        }
        break;

      case 'd':
        // Duplicate (Ctrl+D / Cmd+D)
        if ((e.ctrlKey || e.metaKey) && !this._host.readonly) {
          e.preventDefault();
          this.selectionController.duplicateSelected();
        }
        break;

      case 'z':
        // Undo (Ctrl+Z / Cmd+Z) or Redo (Ctrl+Shift+Z / Cmd+Shift+Z)
        if ((e.ctrlKey || e.metaKey) && !this._host.readonly && this.undoController) {
          e.preventDefault();
          if (e.shiftKey) {
            this.undoController.performRedo();
          } else {
            this.undoController.performUndo();
          }
        }
        break;

      case 'y':
        // Redo (Ctrl+Y / Cmd+Y) - alternative shortcut
        if ((e.ctrlKey || e.metaKey) && !this._host.readonly && this.undoController) {
          e.preventDefault();
          this.undoController.performRedo();
        }
        break;

      case 'h':
        // Pan mode (H key)
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          this._host.mode = CanvasMode.PAN;
          this._host.requestUpdate();
        }
        break;

      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        this.navigateToNode(e.key);
        break;

      case 'Enter':
        if (this._host.selectedNodeIds.size === 1) {
          this.selectionController.openConfigForSelected();
        }
        break;
    }
  }

  /**
   * Navigate to a node using arrow keys
   */
  private navigateToNode(direction: ArrowDirection): void {
    const { workflow, selectedNodeIds, viewport, configuredNode } = this._host;

    if (workflow.nodes.length === 0) return;

    // Get current position
    let currentPosition: Position;
    if (selectedNodeIds.size > 0) {
      const selectedId = Array.from(selectedNodeIds)[0];
      const selectedNode = workflow.nodes.find(n => n.id === selectedId);
      if (selectedNode) {
        currentPosition = selectedNode.position;
      } else {
        currentPosition = { x: 0, y: 0 };
      }
    } else {
      // No node selected, start from center of viewport
      currentPosition = {
        x: (-viewport.panX + 400) / viewport.zoom,
        y: (-viewport.panY + 300) / viewport.zoom,
      };
    }

    // Find the nearest node in the specified direction
    let bestNode: WorkflowNode | null = null;
    let bestScore = Infinity;

    for (const node of workflow.nodes) {
      if (selectedNodeIds.has(node.id)) continue;

      const dx = node.position.x - currentPosition.x;
      const dy = node.position.y - currentPosition.y;

      let isInDirection = false;
      let primaryDist = 0;
      let secondaryDist = 0;

      switch (direction) {
        case 'ArrowUp':
          isInDirection = dy < -10;
          primaryDist = Math.abs(dy);
          secondaryDist = Math.abs(dx);
          break;
        case 'ArrowDown':
          isInDirection = dy > 10;
          primaryDist = Math.abs(dy);
          secondaryDist = Math.abs(dx);
          break;
        case 'ArrowLeft':
          isInDirection = dx < -10;
          primaryDist = Math.abs(dx);
          secondaryDist = Math.abs(dy);
          break;
        case 'ArrowRight':
          isInDirection = dx > 10;
          primaryDist = Math.abs(dx);
          secondaryDist = Math.abs(dy);
          break;
      }

      if (isInDirection) {
        const score = primaryDist + secondaryDist * 2;
        if (score < bestScore) {
          bestScore = score;
          bestNode = node;
        }
      }
    }

    // If no node found in direction, try to find the closest node overall
    if (!bestNode && selectedNodeIds.size === 0) {
      for (const node of workflow.nodes) {
        const dx = node.position.x - currentPosition.x;
        const dy = node.position.y - currentPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < bestScore) {
          bestScore = dist;
          bestNode = node;
        }
      }
    }

    if (bestNode) {
      this.selectionController.clearSelection();
      this._host.selectedNodeIds.add(bestNode.id);
      this._host.selectedNodeIds = new Set(this._host.selectedNodeIds);

      // Update config panel if it's open
      if (configuredNode) {
        this._host.configuredNode = bestNode;
      }

      this._host.dispatchNodeSelected(bestNode);
    }
  }
}
