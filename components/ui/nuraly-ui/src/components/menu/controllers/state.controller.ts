/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { BaseMenuController } from './base.controller.js';
import type { MenuStateController } from '../interfaces/index.js';

/**
 * State controller manages all state for the menu component
 * Centralizes state management for selection, submenus, hover, and highlight states
 */
export class StateController extends BaseMenuController implements MenuStateController {
  private _selectedPath: number[] = [];
  private _openSubMenus: Set<string> = new Set();
  private _hoveredSubMenus: Set<string> = new Set();
  private _highlightedSubMenus: Set<string> = new Set();

  /**
   * Get the currently selected path
   */
  get selectedPath(): number[] {
    return this._selectedPath;
  }

  /**
   * Set the currently selected path
   */
  set selectedPath(path: number[]) {
    this._selectedPath = path;
  }

  /**
   * Get the set of open submenu paths
   */
  get openSubMenus(): Set<string> {
    return this._openSubMenus;
  }

  /**
   * Get the set of hovered submenu paths
   */
  get hoveredSubMenus(): Set<string> {
    return this._hoveredSubMenus;
  }

  /**
   * Get the set of highlighted submenu paths
   */
  get highlightedSubMenus(): Set<string> {
    return this._highlightedSubMenus;
  }

  /**
   * Set the selected path and trigger update
   * @param path - The path to select
   */
  setSelectedPath(path: number[]): void {
    try {
      this._selectedPath = path;
      this.clearHighlights();
      this.requestUpdate();
      
      this.dispatchEvent('selection-changed', {
        path,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error as Error, 'setSelectedPath');
    }
  }

  /**
   * Toggle a submenu open/closed state
   * @param path - The path to the submenu
   */
  toggleSubMenu(path: number[]): void {
    try {
      const pathKey = path.join('-');
      
      if (this._openSubMenus.has(pathKey)) {
        this.closeSubMenu(path);
      } else {
        this.openSubMenu(path);
      }
    } catch (error) {
      this.handleError(error as Error, 'toggleSubMenu');
    }
  }

  /**
   * Open a submenu
   * @param path - The path to the submenu
   */
  openSubMenu(path: number[]): void {
    try {
      const pathKey = path.join('-');
      
      if (!this._openSubMenus.has(pathKey)) {
        this._openSubMenus.add(pathKey);
        this.requestUpdate();
        
        this.dispatchEvent('submenu-opened', {
          path,
          pathKey,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      this.handleError(error as Error, 'openSubMenu');
    }
  }

  /**
   * Close a submenu
   * @param path - The path to the submenu
   */
  closeSubMenu(path: number[]): void {
    try {
      const pathKey = path.join('-');
      
      if (this._openSubMenus.has(pathKey)) {
        this._openSubMenus.delete(pathKey);
        this.requestUpdate();
        
        this.dispatchEvent('submenu-closed', {
          path,
          pathKey,
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      this.handleError(error as Error, 'closeSubMenu');
    }
  }

  /**
   * Close all open submenus
   */
  closeAllSubMenus(): void {
    try {
      this._openSubMenus.clear();
      this.requestUpdate();
      
      this.dispatchEvent('all-submenus-closed', {
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error as Error, 'closeAllSubMenus');
    }
  }

  /**
   * Set the hovered state of a submenu
   * @param path - The path to the submenu
   * @param hovered - Whether the submenu is hovered
   */
  setHovered(path: number[], hovered: boolean): void {
    try {
      const pathKey = path.join('-');
      
      if (hovered) {
        this._hoveredSubMenus.add(pathKey);
      } else {
        this._hoveredSubMenus.delete(pathKey);
      }
      
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'setHovered');
    }
  }

  /**
   * Set the highlighted state of a submenu
   * @param path - The path to the submenu
   * @param highlighted - Whether the submenu is highlighted
   */
  setHighlighted(path: number[], highlighted: boolean): void {
    try {
      const pathKey = path.join('-');
      
      if (highlighted) {
        this._highlightedSubMenus.add(pathKey);
      } else {
        this._highlightedSubMenus.delete(pathKey);
      }
      
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'setHighlighted');
    }
  }

  /**
   * Clear all highlighted states
   */
  clearHighlights(): void {
    try {
      this._highlightedSubMenus.clear();
      this.requestUpdate();
    } catch (error) {
      this.handleError(error as Error, 'clearHighlights');
    }
  }

  /**
   * Check if a path is currently selected
   * @param path - The path to check
   * @returns True if the path is selected
   */
  isPathSelected(path: number[]): boolean {
    return (
      path.length === this._selectedPath.length &&
      path.every((val, idx) => val === this._selectedPath[idx])
    );
  }

  /**
   * Check if a submenu is open
   * @param path - The path to check
   * @returns True if the submenu is open
   */
  isSubMenuOpen(path: number[]): boolean {
    const pathKey = path.join('-');
    return this._openSubMenus.has(pathKey);
  }

  /**
   * Check if a submenu is hovered
   * @param path - The path to check
   * @returns True if the submenu is hovered
   */
  isSubMenuHovered(path: number[]): boolean {
    const pathKey = path.join('-');
    return this._hoveredSubMenus.has(pathKey);
  }

  /**
   * Check if a submenu is highlighted
   * @param path - The path to check
   * @returns True if the submenu is highlighted
   */
  isSubMenuHighlighted(path: number[]): boolean {
    const pathKey = path.join('-');
    return this._highlightedSubMenus.has(pathKey);
  }

  /**
   * Reset all state to initial values
   */
  reset(): void {
    try {
      this._selectedPath = [];
      this._openSubMenus.clear();
      this._hoveredSubMenus.clear();
      this._highlightedSubMenus.clear();
      this.requestUpdate();
      
      this.dispatchEvent('state-reset', {
        timestamp: Date.now(),
      });
    } catch (error) {
      this.handleError(error as Error, 'reset');
    }
  }
}
