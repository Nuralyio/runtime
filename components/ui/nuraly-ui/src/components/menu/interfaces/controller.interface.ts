/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ReactiveController } from 'lit';
import type { NrMenuElement } from '../menu.component.js';

/**
 * Base interface for all menu controllers
 */
export interface MenuController extends ReactiveController {
  host: NrMenuElement;
}

/**
 * Keyboard controller interface for menu navigation
 */
export interface MenuKeyboardController extends MenuController {
  handleKeydown(event: KeyboardEvent): void;
  handleArrowNavigation(event: KeyboardEvent): void;
  handleActivation(event: KeyboardEvent): void;
  handleEscape(event: KeyboardEvent): void;
  handleTypeAhead(event: KeyboardEvent): void;
}

/**
 * State controller interface for menu state management
 */
export interface MenuStateController extends MenuController {
  selectedPath: number[];
  openSubMenus: Set<string>;
  hoveredSubMenus: Set<string>;
  highlightedSubMenus: Set<string>;
  
  setSelectedPath(path: number[]): void;
  toggleSubMenu(path: number[]): void;
  openSubMenu(path: number[]): void;
  closeSubMenu(path: number[]): void;
  setHovered(path: number[], hovered: boolean): void;
  setHighlighted(path: number[], highlighted: boolean): void;
  clearHighlights(): void;
  isPathSelected(path: number[]): boolean;
}

/**
 * Accessibility controller interface for ARIA management
 */
export interface MenuAccessibilityController extends MenuController {
  updateAriaAttributes(): void;
  setAriaExpanded(element: HTMLElement, expanded: boolean): void;
  setAriaSelected(element: HTMLElement, selected: boolean): void;
  manageFocus(element: HTMLElement): void;
  announceToScreenReader(message: string): void;
}
