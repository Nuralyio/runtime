/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { WorkflowNode, WorkflowEdge, Position } from '../../../components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';

/**
 * Types of operations that can be undone/redone
 */
export enum OperationType {
  ADD_NODE = 'ADD_NODE',
  DELETE_NODE = 'DELETE_NODE',
  MOVE_NODE = 'MOVE_NODE',
  UPDATE_NODE_CONFIG = 'UPDATE_NODE_CONFIG',
  ADD_EDGE = 'ADD_EDGE',
  DELETE_EDGE = 'DELETE_EDGE',
  BULK_DELETE = 'BULK_DELETE',
  PASTE_NODES = 'PASTE_NODES',
  DUPLICATE_NODES = 'DUPLICATE_NODES',
}

/**
 * Base operation interface
 */
export interface BaseOperation {
  id: string;
  type: OperationType;
  workflowId: string;
  userId: string;
  timestamp: number;        // Lamport clock for ordering
  createdAt: number;        // Wall clock for merging
}

/**
 * Operation for adding a node
 */
export interface AddNodeOperation extends BaseOperation {
  type: OperationType.ADD_NODE;
  data: {
    node: WorkflowNode;
  };
  inverse: {
    nodeId: string;
  };
}

/**
 * Operation for deleting a node
 */
export interface DeleteNodeOperation extends BaseOperation {
  type: OperationType.DELETE_NODE;
  data: {
    nodeId: string;
  };
  inverse: {
    node: WorkflowNode;
    connectedEdges: WorkflowEdge[];
  };
}

/**
 * Operation for moving one or more nodes
 */
export interface MoveNodeOperation extends BaseOperation {
  type: OperationType.MOVE_NODE;
  data: {
    moves: Array<{
      nodeId: string;
      newPosition: Position;
    }>;
  };
  inverse: {
    moves: Array<{
      nodeId: string;
      oldPosition: Position;
    }>;
  };
}

/**
 * Operation for updating node configuration
 */
export interface UpdateNodeConfigOperation extends BaseOperation {
  type: OperationType.UPDATE_NODE_CONFIG;
  data: {
    nodeId: string;
    changes: Partial<WorkflowNode>;
  };
  inverse: {
    nodeId: string;
    previousState: Partial<WorkflowNode>;
  };
}

/**
 * Operation for adding an edge
 */
export interface AddEdgeOperation extends BaseOperation {
  type: OperationType.ADD_EDGE;
  data: {
    edge: WorkflowEdge;
  };
  inverse: {
    edgeId: string;
  };
}

/**
 * Operation for deleting an edge
 */
export interface DeleteEdgeOperation extends BaseOperation {
  type: OperationType.DELETE_EDGE;
  data: {
    edgeId: string;
  };
  inverse: {
    edge: WorkflowEdge;
  };
}

/**
 * Operation for bulk delete (multiple nodes and/or edges)
 */
export interface BulkDeleteOperation extends BaseOperation {
  type: OperationType.BULK_DELETE;
  data: {
    nodeIds: string[];
    edgeIds: string[];
  };
  inverse: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
}

/**
 * Operation for pasting nodes
 */
export interface PasteNodesOperation extends BaseOperation {
  type: OperationType.PASTE_NODES;
  data: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
  inverse: {
    nodeIds: string[];
    edgeIds: string[];
  };
}

/**
 * Operation for duplicating nodes
 */
export interface DuplicateNodesOperation extends BaseOperation {
  type: OperationType.DUPLICATE_NODES;
  data: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };
  inverse: {
    nodeIds: string[];
    edgeIds: string[];
  };
}

/**
 * Union type of all operations
 */
export type Operation =
  | AddNodeOperation
  | DeleteNodeOperation
  | MoveNodeOperation
  | UpdateNodeConfigOperation
  | AddEdgeOperation
  | DeleteEdgeOperation
  | BulkDeleteOperation
  | PasteNodesOperation
  | DuplicateNodesOperation;

/**
 * Entry in the undo/redo stack
 * Can contain multiple operations that were merged together
 */
export interface UndoEntry {
  id: string;
  operations: Operation[];
  description: string;
  timestamp: number;
  canUndo: boolean;
  conflictReason?: string;
}

/**
 * Undo stack state for a workflow
 */
export interface UndoStackState {
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
}

/**
 * Operation log entry for conflict detection
 */
export interface OperationLogEntry {
  operation: Operation;
  appliedAt: number;
  isRemote: boolean;
}

/**
 * Conflict check result
 */
export interface ConflictCheckResult {
  hasConflict: boolean;
  reason?: string;
  conflictingOperations?: Operation[];
}
