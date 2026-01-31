/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type {
  Operation,
  OperationType,
  UndoEntry,
  AddNodeOperation,
  DeleteNodeOperation,
  MoveNodeOperation,
  UpdateNodeConfigOperation,
  AddEdgeOperation,
  DeleteEdgeOperation,
  BulkDeleteOperation,
  PasteNodesOperation,
  DuplicateNodesOperation,
} from './operation.types';
import type { WorkflowNode, WorkflowEdge, Position } from '../../../components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import {
  pushToUndoStack,
  getUndoStack,
  addToOperationLog,
  getNextLamportTimestamp,
  $currentUserId,
} from './undo.store';

/**
 * Time window in ms for merging consecutive operations
 */
const MERGE_WINDOW_MS = 1000;

/**
 * Last recorded operation for merge checking
 */
let lastOperation: {
  type: OperationType;
  timestamp: number;
  nodeIds?: string[];
} | null = null;

/**
 * Pending move operations for merging
 */
let pendingMoves: Map<string, { oldPosition: Position; newPosition: Position }> = new Map();
let pendingMoveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingMoveWorkflowId: string | null = null;

/**
 * Generate a unique operation ID
 */
function generateOperationId(): string {
  return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique entry ID
 */
function generateEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get operation description for display
 */
function getOperationDescription(type: OperationType, count: number = 1): string {
  switch (type) {
    case 'ADD_NODE':
      return count > 1 ? `Add ${count} nodes` : 'Add node';
    case 'DELETE_NODE':
      return count > 1 ? `Delete ${count} nodes` : 'Delete node';
    case 'MOVE_NODE':
      return count > 1 ? `Move ${count} nodes` : 'Move node';
    case 'UPDATE_NODE_CONFIG':
      return 'Update node configuration';
    case 'ADD_EDGE':
      return 'Add connection';
    case 'DELETE_EDGE':
      return 'Delete connection';
    case 'BULK_DELETE':
      return 'Delete selected';
    case 'PASTE_NODES':
      return count > 1 ? `Paste ${count} nodes` : 'Paste node';
    case 'DUPLICATE_NODES':
      return count > 1 ? `Duplicate ${count} nodes` : 'Duplicate node';
    default:
      return 'Unknown operation';
  }
}

/**
 * Create an undo entry from operations
 */
function createUndoEntry(operations: Operation[], description: string): UndoEntry {
  return {
    id: generateEntryId(),
    operations,
    description,
    timestamp: Date.now(),
    canUndo: true,
  };
}

/**
 * Record an ADD_NODE operation
 */
export function recordAddNode(
  workflowId: string,
  node: WorkflowNode
): Operation {
  const userId = $currentUserId.get();

  const operation: AddNodeOperation = {
    id: generateOperationId(),
    type: 'ADD_NODE' as OperationType.ADD_NODE,
    workflowId,
    userId,
    timestamp: getNextLamportTimestamp(),
    createdAt: Date.now(),
    data: { node },
    inverse: { nodeId: node.id },
  };

  const entry = createUndoEntry([operation], getOperationDescription('ADD_NODE'));
  pushToUndoStack(workflowId, entry);
  addToOperationLog(operation);

  lastOperation = { type: 'ADD_NODE' as OperationType, timestamp: Date.now() };

  return operation;
}

/**
 * Record a DELETE_NODE operation
 */
export function recordDeleteNode(
  workflowId: string,
  node: WorkflowNode,
  connectedEdges: WorkflowEdge[]
): Operation {
  const userId = $currentUserId.get();

  const operation: DeleteNodeOperation = {
    id: generateOperationId(),
    type: 'DELETE_NODE' as OperationType.DELETE_NODE,
    workflowId,
    userId,
    timestamp: getNextLamportTimestamp(),
    createdAt: Date.now(),
    data: { nodeId: node.id },
    inverse: { node, connectedEdges },
  };

  const entry = createUndoEntry([operation], getOperationDescription('DELETE_NODE'));
  pushToUndoStack(workflowId, entry);
  addToOperationLog(operation);

  lastOperation = { type: 'DELETE_NODE' as OperationType, timestamp: Date.now() };

  return operation;
}

/**
 * Record node movement (with merging for rapid moves)
 */
export function recordMoveNode(
  workflowId: string,
  nodeId: string,
  oldPosition: Position,
  newPosition: Position
): void {
  const now = Date.now();

  // Check if we should merge with pending moves
  if (pendingMoveWorkflowId === workflowId && pendingMoveTimer) {
    // Update the pending move for this node
    const existing = pendingMoves.get(nodeId);
    if (existing) {
      // Keep original old position, update new position
      pendingMoves.set(nodeId, { oldPosition: existing.oldPosition, newPosition });
    } else {
      pendingMoves.set(nodeId, { oldPosition, newPosition });
    }

    // Reset the timer
    clearTimeout(pendingMoveTimer);
    pendingMoveTimer = setTimeout(() => flushPendingMoves(), MERGE_WINDOW_MS);
    return;
  }

  // Start new pending move batch
  pendingMoves.clear();
  pendingMoves.set(nodeId, { oldPosition, newPosition });
  pendingMoveWorkflowId = workflowId;
  pendingMoveTimer = setTimeout(() => flushPendingMoves(), MERGE_WINDOW_MS);
}

/**
 * Record multiple node movements at once
 */
export function recordMoveNodes(
  workflowId: string,
  moves: Array<{ nodeId: string; oldPosition: Position; newPosition: Position }>
): void {
  const now = Date.now();

  // Check if we should merge with pending moves
  if (pendingMoveWorkflowId === workflowId && pendingMoveTimer) {
    // Update pending moves
    for (const move of moves) {
      const existing = pendingMoves.get(move.nodeId);
      if (existing) {
        pendingMoves.set(move.nodeId, { oldPosition: existing.oldPosition, newPosition: move.newPosition });
      } else {
        pendingMoves.set(move.nodeId, { oldPosition: move.oldPosition, newPosition: move.newPosition });
      }
    }

    // Reset the timer
    clearTimeout(pendingMoveTimer);
    pendingMoveTimer = setTimeout(() => flushPendingMoves(), MERGE_WINDOW_MS);
    return;
  }

  // Start new pending move batch
  pendingMoves.clear();
  for (const move of moves) {
    pendingMoves.set(move.nodeId, { oldPosition: move.oldPosition, newPosition: move.newPosition });
  }
  pendingMoveWorkflowId = workflowId;
  pendingMoveTimer = setTimeout(() => flushPendingMoves(), MERGE_WINDOW_MS);
}

/**
 * Flush pending moves to create the actual operation
 */
function flushPendingMoves(): void {
  if (!pendingMoveWorkflowId || pendingMoves.size === 0) {
    pendingMoves.clear();
    pendingMoveWorkflowId = null;
    pendingMoveTimer = null;
    return;
  }

  const userId = $currentUserId.get();
  const workflowId = pendingMoveWorkflowId;

  const movesData: Array<{ nodeId: string; newPosition: Position }> = [];
  const inverseMoves: Array<{ nodeId: string; oldPosition: Position }> = [];

  pendingMoves.forEach((positions, nodeId) => {
    movesData.push({ nodeId, newPosition: positions.newPosition });
    inverseMoves.push({ nodeId, oldPosition: positions.oldPosition });
  });

  const operation: MoveNodeOperation = {
    id: generateOperationId(),
    type: 'MOVE_NODE' as OperationType.MOVE_NODE,
    workflowId,
    userId,
    timestamp: getNextLamportTimestamp(),
    createdAt: Date.now(),
    data: { moves: movesData },
    inverse: { moves: inverseMoves },
  };

  const entry = createUndoEntry(
    [operation],
    getOperationDescription('MOVE_NODE', pendingMoves.size)
  );
  pushToUndoStack(workflowId, entry);
  addToOperationLog(operation);

  lastOperation = {
    type: 'MOVE_NODE' as OperationType,
    timestamp: Date.now(),
    nodeIds: Array.from(pendingMoves.keys()),
  };

  pendingMoves.clear();
  pendingMoveWorkflowId = null;
  pendingMoveTimer = null;
}

/**
 * Force flush pending moves immediately (call before undo)
 */
export function flushPendingOperations(): void {
  if (pendingMoveTimer) {
    clearTimeout(pendingMoveTimer);
    flushPendingMoves();
  }
}

/**
 * Record an UPDATE_NODE_CONFIG operation
 */
export function recordUpdateNodeConfig(
  workflowId: string,
  nodeId: string,
  changes: Partial<WorkflowNode>,
  previousState: Partial<WorkflowNode>
): Operation {
  const userId = $currentUserId.get();

  const operation: UpdateNodeConfigOperation = {
    id: generateOperationId(),
    type: 'UPDATE_NODE_CONFIG' as OperationType.UPDATE_NODE_CONFIG,
    workflowId,
    userId,
    timestamp: getNextLamportTimestamp(),
    createdAt: Date.now(),
    data: { nodeId, changes },
    inverse: { nodeId, previousState },
  };

  const entry = createUndoEntry([operation], getOperationDescription('UPDATE_NODE_CONFIG'));
  pushToUndoStack(workflowId, entry);
  addToOperationLog(operation);

  lastOperation = { type: 'UPDATE_NODE_CONFIG' as OperationType, timestamp: Date.now() };

  return operation;
}

/**
 * Record an ADD_EDGE operation
 */
export function recordAddEdge(
  workflowId: string,
  edge: WorkflowEdge
): Operation {
  const userId = $currentUserId.get();

  const operation: AddEdgeOperation = {
    id: generateOperationId(),
    type: 'ADD_EDGE' as OperationType.ADD_EDGE,
    workflowId,
    userId,
    timestamp: getNextLamportTimestamp(),
    createdAt: Date.now(),
    data: { edge },
    inverse: { edgeId: edge.id },
  };

  const entry = createUndoEntry([operation], getOperationDescription('ADD_EDGE'));
  pushToUndoStack(workflowId, entry);
  addToOperationLog(operation);

  lastOperation = { type: 'ADD_EDGE' as OperationType, timestamp: Date.now() };

  return operation;
}

/**
 * Record a DELETE_EDGE operation
 */
export function recordDeleteEdge(
  workflowId: string,
  edge: WorkflowEdge
): Operation {
  const userId = $currentUserId.get();

  const operation: DeleteEdgeOperation = {
    id: generateOperationId(),
    type: 'DELETE_EDGE' as OperationType.DELETE_EDGE,
    workflowId,
    userId,
    timestamp: getNextLamportTimestamp(),
    createdAt: Date.now(),
    data: { edgeId: edge.id },
    inverse: { edge },
  };

  const entry = createUndoEntry([operation], getOperationDescription('DELETE_EDGE'));
  pushToUndoStack(workflowId, entry);
  addToOperationLog(operation);

  lastOperation = { type: 'DELETE_EDGE' as OperationType, timestamp: Date.now() };

  return operation;
}

/**
 * Record a BULK_DELETE operation
 */
export function recordBulkDelete(
  workflowId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Operation {
  const userId = $currentUserId.get();

  const operation: BulkDeleteOperation = {
    id: generateOperationId(),
    type: 'BULK_DELETE' as OperationType.BULK_DELETE,
    workflowId,
    userId,
    timestamp: getNextLamportTimestamp(),
    createdAt: Date.now(),
    data: {
      nodeIds: nodes.map(n => n.id),
      edgeIds: edges.map(e => e.id),
    },
    inverse: { nodes, edges },
  };

  const entry = createUndoEntry([operation], getOperationDescription('BULK_DELETE'));
  pushToUndoStack(workflowId, entry);
  addToOperationLog(operation);

  lastOperation = { type: 'BULK_DELETE' as OperationType, timestamp: Date.now() };

  return operation;
}

/**
 * Record a PASTE_NODES operation
 */
export function recordPasteNodes(
  workflowId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Operation {
  const userId = $currentUserId.get();

  const operation: PasteNodesOperation = {
    id: generateOperationId(),
    type: 'PASTE_NODES' as OperationType.PASTE_NODES,
    workflowId,
    userId,
    timestamp: getNextLamportTimestamp(),
    createdAt: Date.now(),
    data: { nodes, edges },
    inverse: {
      nodeIds: nodes.map(n => n.id),
      edgeIds: edges.map(e => e.id),
    },
  };

  const entry = createUndoEntry(
    [operation],
    getOperationDescription('PASTE_NODES', nodes.length)
  );
  pushToUndoStack(workflowId, entry);
  addToOperationLog(operation);

  lastOperation = { type: 'PASTE_NODES' as OperationType, timestamp: Date.now() };

  return operation;
}

/**
 * Record a DUPLICATE_NODES operation
 */
export function recordDuplicateNodes(
  workflowId: string,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): Operation {
  const userId = $currentUserId.get();

  const operation: DuplicateNodesOperation = {
    id: generateOperationId(),
    type: 'DUPLICATE_NODES' as OperationType.DUPLICATE_NODES,
    workflowId,
    userId,
    timestamp: getNextLamportTimestamp(),
    createdAt: Date.now(),
    data: { nodes, edges },
    inverse: {
      nodeIds: nodes.map(n => n.id),
      edgeIds: edges.map(e => e.id),
    },
  };

  const entry = createUndoEntry(
    [operation],
    getOperationDescription('DUPLICATE_NODES', nodes.length)
  );
  pushToUndoStack(workflowId, entry);
  addToOperationLog(operation);

  lastOperation = { type: 'DUPLICATE_NODES' as OperationType, timestamp: Date.now() };

  return operation;
}
