/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type {
  Workflow,
  WorkflowNode,
  Position,
  CanvasViewport,
  CanvasMode,
} from '../workflow-canvas.types.js';
import type { MarqueeState } from '../controllers/marquee.controller.js';

// Re-export for convenience
export type { CanvasViewport } from '../workflow-canvas.types.js';

/**
 * Connection state for edge creation
 */
export interface ConnectionState {
  sourceNodeId: string;
  sourcePortId: string;
  sourceIsInput: boolean;
  mouseX: number;
  mouseY: number;
}

/**
 * Drag state for node dragging
 */
export interface DragState {
  nodeId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Context menu state
 */
export interface ContextMenuState {
  x: number;
  y: number;
  type: 'canvas' | 'node' | 'edge';
  target?: string;
}

/**
 * Interface for the canvas host component
 * Controllers interact with the host through this interface
 */
export interface CanvasHost extends EventTarget {
  // Properties
  workflow: Workflow;
  readonly: boolean;
  disabled: boolean;
  showMinimap: boolean;
  showToolbar: boolean;
  showPalette: boolean;
  currentTheme: string;

  // Viewport state
  viewport: CanvasViewport;
  mode: CanvasMode;

  // Selection state
  selectedNodeIds: Set<string>;
  selectedEdgeIds: Set<string>;

  // Interaction state
  connectionState: ConnectionState | null;
  dragState: DragState | null;
  contextMenu: ContextMenuState | null;
  isPanning: boolean;
  panStart: Position;
  hoveredEdgeId: string | null;
  marqueeState: MarqueeState | null;
  lastMousePosition: Position | null;

  // Config state
  configuredNode: WorkflowNode | null;
  expandedCategories: Set<string>;

  // DOM references
  canvasWrapper: HTMLElement | null;
  canvasViewport: HTMLElement | null;
  configPanel: HTMLElement | null;
  shadowRoot: ShadowRoot | null;

  // Core methods
  requestUpdate(): void;
  updateComplete: Promise<boolean>;

  // Workflow methods
  setWorkflow(workflow: Workflow): void;
  dispatchWorkflowChanged(): void;
  dispatchViewportChanged(): void;
  dispatchNodeSelected(node: WorkflowNode): void;
  dispatchNodeMoved(node: WorkflowNode, position: Position): void;
}

/**
 * Base controller interface
 */
export interface CanvasBaseController {
  host: CanvasHost;
}

/**
 * Error handler interface for controllers
 */
export interface ErrorHandler {
  handleError(error: Error, context: string): void;
}
