/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Operation, ConflictCheckResult, UndoEntry } from './operation.types';
import type { Workflow, WorkflowNode } from '../../../components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import {
  getOperationsForNode,
  getOperationsForEdge,
  $currentUserId,
} from './undo.store';

/**
 * Check if an undo operation would conflict with other operations
 */
export function checkUndoConflict(
  entry: UndoEntry,
  workflow: Workflow
): ConflictCheckResult {
  const userId = $currentUserId.get();

  for (const operation of entry.operations) {
    const conflict = checkOperationConflict(operation, workflow, userId, entry.timestamp);
    if (conflict.hasConflict) {
      return conflict;
    }
  }

  return { hasConflict: false };
}

/**
 * Check if a single operation would conflict
 */
function checkOperationConflict(
  operation: Operation,
  workflow: Workflow,
  userId: string,
  operationTimestamp: number
): ConflictCheckResult {
  switch (operation.type) {
    case 'ADD_NODE':
      return checkAddNodeUndoConflict(operation, workflow, userId, operationTimestamp);

    case 'DELETE_NODE':
      return checkDeleteNodeUndoConflict(operation, workflow, userId);

    case 'MOVE_NODE':
      return checkMoveNodeUndoConflict(operation, workflow, userId, operationTimestamp);

    case 'UPDATE_NODE_CONFIG':
      return checkUpdateNodeUndoConflict(operation, workflow, userId, operationTimestamp);

    case 'ADD_EDGE':
      return checkAddEdgeUndoConflict(operation, workflow, userId, operationTimestamp);

    case 'DELETE_EDGE':
      return checkDeleteEdgeUndoConflict(operation, workflow, userId);

    case 'BULK_DELETE':
      return checkBulkDeleteUndoConflict(operation, workflow, userId);

    case 'PASTE_NODES':
    case 'DUPLICATE_NODES':
      return checkPasteUndoConflict(operation, workflow, userId, operationTimestamp);

    default:
      return { hasConflict: false };
  }
}

/**
 * Check conflict for undoing ADD_NODE (which would delete the node)
 * Conflict if another user has modified this node since it was added
 */
function checkAddNodeUndoConflict(
  operation: Operation & { type: 'ADD_NODE' },
  workflow: Workflow,
  userId: string,
  operationTimestamp: number
): ConflictCheckResult {
  const nodeId = operation.data.node.id;

  // Check if node still exists
  const nodeExists = workflow.nodes.some(n => n.id === nodeId);
  if (!nodeExists) {
    return {
      hasConflict: true,
      reason: 'Node was already deleted',
    };
  }

  // Check for operations by other users on this node
  const recentOps = getOperationsForNode(nodeId, operationTimestamp);
  const otherUserOps = recentOps.filter(
    entry => entry.isRemote || entry.operation.userId !== userId
  );

  if (otherUserOps.length > 0) {
    return {
      hasConflict: true,
      reason: 'Node was modified by another user',
      conflictingOperations: otherUserOps.map(e => e.operation),
    };
  }

  return { hasConflict: false };
}

/**
 * Check conflict for undoing DELETE_NODE (which would restore the node)
 * No conflict expected - restoring is safe
 */
function checkDeleteNodeUndoConflict(
  operation: Operation & { type: 'DELETE_NODE' },
  workflow: Workflow,
  userId: string
): ConflictCheckResult {
  const nodeId = operation.data.nodeId;

  // Check if node ID is now used by something else (unlikely but possible)
  const nodeExists = workflow.nodes.some(n => n.id === nodeId);
  if (nodeExists) {
    return {
      hasConflict: true,
      reason: 'A node with this ID already exists',
    };
  }

  return { hasConflict: false };
}

/**
 * Check conflict for undoing MOVE_NODE
 * Conflict if the node was deleted or moved by another user
 */
function checkMoveNodeUndoConflict(
  operation: Operation & { type: 'MOVE_NODE' },
  workflow: Workflow,
  userId: string,
  operationTimestamp: number
): ConflictCheckResult {
  for (const move of operation.data.moves) {
    const nodeId = move.nodeId;

    // Check if node still exists
    const nodeExists = workflow.nodes.some(n => n.id === nodeId);
    if (!nodeExists) {
      return {
        hasConflict: true,
        reason: 'Node was deleted',
      };
    }

    // Check for move operations by other users
    const recentOps = getOperationsForNode(nodeId, operationTimestamp);
    const otherUserMoves = recentOps.filter(
      entry =>
        (entry.isRemote || entry.operation.userId !== userId) &&
        entry.operation.type === 'MOVE_NODE'
    );

    if (otherUserMoves.length > 0) {
      return {
        hasConflict: true,
        reason: 'Node was moved by another user',
        conflictingOperations: otherUserMoves.map(e => e.operation),
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Check conflict for undoing UPDATE_NODE_CONFIG
 * Conflict if the node was deleted or config was changed by another user
 */
function checkUpdateNodeUndoConflict(
  operation: Operation & { type: 'UPDATE_NODE_CONFIG' },
  workflow: Workflow,
  userId: string,
  operationTimestamp: number
): ConflictCheckResult {
  const nodeId = operation.data.nodeId;

  // Check if node still exists
  const nodeExists = workflow.nodes.some(n => n.id === nodeId);
  if (!nodeExists) {
    return {
      hasConflict: true,
      reason: 'Node was deleted',
    };
  }

  // Check for config updates by other users
  const recentOps = getOperationsForNode(nodeId, operationTimestamp);
  const otherUserUpdates = recentOps.filter(
    entry =>
      (entry.isRemote || entry.operation.userId !== userId) &&
      entry.operation.type === 'UPDATE_NODE_CONFIG'
  );

  if (otherUserUpdates.length > 0) {
    return {
      hasConflict: true,
      reason: 'Node configuration was changed by another user',
      conflictingOperations: otherUserUpdates.map(e => e.operation),
    };
  }

  return { hasConflict: false };
}

/**
 * Check conflict for undoing ADD_EDGE (which would delete the edge)
 * Conflict if another user has modified connected nodes
 */
function checkAddEdgeUndoConflict(
  operation: Operation & { type: 'ADD_EDGE' },
  workflow: Workflow,
  userId: string,
  operationTimestamp: number
): ConflictCheckResult {
  const edgeId = operation.data.edge.id;

  // Check if edge still exists
  const edgeExists = workflow.edges.some(e => e.id === edgeId);
  if (!edgeExists) {
    return {
      hasConflict: true,
      reason: 'Connection was already deleted',
    };
  }

  return { hasConflict: false };
}

/**
 * Check conflict for undoing DELETE_EDGE (which would restore the edge)
 * Conflict if connected nodes no longer exist
 */
function checkDeleteEdgeUndoConflict(
  operation: Operation & { type: 'DELETE_EDGE' },
  workflow: Workflow,
  userId: string
): ConflictCheckResult {
  const edge = operation.inverse.edge;

  // Check if both connected nodes still exist
  const sourceExists = workflow.nodes.some(n => n.id === edge.sourceNodeId);
  const targetExists = workflow.nodes.some(n => n.id === edge.targetNodeId);

  if (!sourceExists || !targetExists) {
    return {
      hasConflict: true,
      reason: 'Connected nodes no longer exist',
    };
  }

  // Check if edge already exists
  const edgeExists = workflow.edges.some(e => e.id === edge.id);
  if (edgeExists) {
    return {
      hasConflict: true,
      reason: 'Connection already exists',
    };
  }

  return { hasConflict: false };
}

/**
 * Check conflict for undoing BULK_DELETE (which would restore items)
 */
function checkBulkDeleteUndoConflict(
  operation: Operation & { type: 'BULK_DELETE' },
  workflow: Workflow,
  userId: string
): ConflictCheckResult {
  // Check if any node IDs are now in use
  for (const node of operation.inverse.nodes) {
    const nodeExists = workflow.nodes.some(n => n.id === node.id);
    if (nodeExists) {
      return {
        hasConflict: true,
        reason: `Node "${node.name}" ID is already in use`,
      };
    }
  }

  // Check if edges can be restored (connected nodes must exist after restore)
  const restoredNodeIds = new Set(operation.inverse.nodes.map(n => n.id));
  const existingNodeIds = new Set(workflow.nodes.map(n => n.id));

  for (const edge of operation.inverse.edges) {
    const sourceWillExist = restoredNodeIds.has(edge.sourceNodeId) || existingNodeIds.has(edge.sourceNodeId);
    const targetWillExist = restoredNodeIds.has(edge.targetNodeId) || existingNodeIds.has(edge.targetNodeId);

    if (!sourceWillExist || !targetWillExist) {
      return {
        hasConflict: true,
        reason: 'Cannot restore connection - nodes no longer exist',
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Check conflict for undoing PASTE_NODES or DUPLICATE_NODES (which would delete the pasted items)
 */
function checkPasteUndoConflict(
  operation: Operation & { type: 'PASTE_NODES' | 'DUPLICATE_NODES' },
  workflow: Workflow,
  userId: string,
  operationTimestamp: number
): ConflictCheckResult {
  const nodeIds = operation.inverse.nodeIds;

  for (const nodeId of nodeIds) {
    // Check if node still exists
    const nodeExists = workflow.nodes.some(n => n.id === nodeId);
    if (!nodeExists) {
      return {
        hasConflict: true,
        reason: 'Pasted node was already deleted',
      };
    }

    // Check for operations by other users on this node
    const recentOps = getOperationsForNode(nodeId, operationTimestamp);
    const otherUserOps = recentOps.filter(
      entry => entry.isRemote || entry.operation.userId !== userId
    );

    if (otherUserOps.length > 0) {
      return {
        hasConflict: true,
        reason: 'Pasted node was modified by another user',
        conflictingOperations: otherUserOps.map(e => e.operation),
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Check if a redo operation would conflict
 * Generally more permissive than undo conflicts
 */
export function checkRedoConflict(
  entry: UndoEntry,
  workflow: Workflow
): ConflictCheckResult {
  // For redo, we mainly check if the target state makes sense
  for (const operation of entry.operations) {
    switch (operation.type) {
      case 'ADD_NODE': {
        // Check if we can add the node (ID not in use)
        const nodeExists = workflow.nodes.some(n => n.id === operation.data.node.id);
        if (nodeExists) {
          return {
            hasConflict: true,
            reason: 'Cannot redo: Node ID already exists',
          };
        }
        break;
      }

      case 'DELETE_NODE': {
        // Check if node exists to delete
        const nodeExists = workflow.nodes.some(n => n.id === operation.data.nodeId);
        if (!nodeExists) {
          return {
            hasConflict: true,
            reason: 'Cannot redo: Node no longer exists',
          };
        }
        break;
      }

      case 'MOVE_NODE': {
        // Check if all nodes exist
        for (const move of operation.data.moves) {
          const nodeExists = workflow.nodes.some(n => n.id === move.nodeId);
          if (!nodeExists) {
            return {
              hasConflict: true,
              reason: 'Cannot redo: Node no longer exists',
            };
          }
        }
        break;
      }

      case 'ADD_EDGE': {
        // Check if edge can be created
        const edge = operation.data.edge;
        const sourceExists = workflow.nodes.some(n => n.id === edge.sourceNodeId);
        const targetExists = workflow.nodes.some(n => n.id === edge.targetNodeId);

        if (!sourceExists || !targetExists) {
          return {
            hasConflict: true,
            reason: 'Cannot redo: Connected nodes no longer exist',
          };
        }

        const edgeExists = workflow.edges.some(e => e.id === edge.id);
        if (edgeExists) {
          return {
            hasConflict: true,
            reason: 'Cannot redo: Connection already exists',
          };
        }
        break;
      }

      case 'DELETE_EDGE': {
        // Check if edge exists to delete
        const edgeExists = workflow.edges.some(e => e.id === operation.data.edgeId);
        if (!edgeExists) {
          return {
            hasConflict: true,
            reason: 'Cannot redo: Connection no longer exists',
          };
        }
        break;
      }
    }
  }

  return { hasConflict: false };
}
