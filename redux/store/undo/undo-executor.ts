/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Operation, UndoEntry } from './operation.types';
import type { Workflow, WorkflowNode, WorkflowEdge } from '../../../components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import {
  popFromUndoStack,
  popFromRedoStack,
  canUndo as checkCanUndo,
  canRedo as checkCanRedo,
  addToOperationLog,
  getNextLamportTimestamp,
  $currentUserId,
} from './undo.store';
import { checkUndoConflict, checkRedoConflict } from './conflict-resolver';
import { flushPendingOperations } from './operation-recorder';

/**
 * Result of an undo/redo operation
 */
export interface UndoRedoResult {
  success: boolean;
  workflow?: Workflow;
  error?: string;
  description?: string;
}

/**
 * Execute undo for a workflow
 */
export function undo(workflowId: string, workflow: Workflow): UndoRedoResult {
  // Flush any pending operations first
  flushPendingOperations();

  if (!checkCanUndo(workflowId)) {
    return { success: false, error: 'Nothing to undo' };
  }

  // Peek at the entry to check for conflicts
  const entry = popFromUndoStack(workflowId);
  if (!entry) {
    return { success: false, error: 'Nothing to undo' };
  }

  // Check for conflicts
  const conflict = checkUndoConflict(entry, workflow);
  if (conflict.hasConflict) {
    // Put it back - we already popped it
    // Actually popFromUndoStack moves it to redo, so we need to move it back
    popFromRedoStack(workflowId); // This moves it back to undo
    return {
      success: false,
      error: conflict.reason || 'Cannot undo due to conflict',
    };
  }

  // Apply inverse operations
  let updatedWorkflow = workflow;

  for (const operation of entry.operations) {
    updatedWorkflow = applyInverseOperation(operation, updatedWorkflow);
  }

  return {
    success: true,
    workflow: updatedWorkflow,
    description: `Undo: ${entry.description}`,
  };
}

/**
 * Execute redo for a workflow
 */
export function redo(workflowId: string, workflow: Workflow): UndoRedoResult {
  // Flush any pending operations first
  flushPendingOperations();

  if (!checkCanRedo(workflowId)) {
    return { success: false, error: 'Nothing to redo' };
  }

  const entry = popFromRedoStack(workflowId);
  if (!entry) {
    return { success: false, error: 'Nothing to redo' };
  }

  // Check for conflicts
  const conflict = checkRedoConflict(entry, workflow);
  if (conflict.hasConflict) {
    // Put it back - we already popped it
    // Actually popFromRedoStack moves it to undo, so we need to move it back
    popFromUndoStack(workflowId); // This moves it back to redo
    return {
      success: false,
      error: conflict.reason || 'Cannot redo due to conflict',
    };
  }

  // Apply forward operations
  let updatedWorkflow = workflow;

  for (const operation of entry.operations) {
    updatedWorkflow = applyForwardOperation(operation, updatedWorkflow);
  }

  return {
    success: true,
    workflow: updatedWorkflow,
    description: `Redo: ${entry.description}`,
  };
}

/**
 * Apply the inverse of an operation (for undo)
 */
function applyInverseOperation(operation: Operation, workflow: Workflow): Workflow {
  switch (operation.type) {
    case 'ADD_NODE':
      // Inverse of add is delete
      return {
        ...workflow,
        nodes: workflow.nodes.filter(n => n.id !== operation.inverse.nodeId),
        edges: workflow.edges.filter(
          e => e.sourceNodeId !== operation.inverse.nodeId &&
               e.targetNodeId !== operation.inverse.nodeId
        ),
      };

    case 'DELETE_NODE':
      // Inverse of delete is restore
      return {
        ...workflow,
        nodes: [...workflow.nodes, operation.inverse.node],
        edges: [...workflow.edges, ...operation.inverse.connectedEdges],
      };

    case 'MOVE_NODE':
      // Inverse of move is move back to old positions
      return {
        ...workflow,
        nodes: workflow.nodes.map(node => {
          const moveData = operation.inverse.moves.find(m => m.nodeId === node.id);
          if (moveData) {
            return { ...node, position: moveData.oldPosition };
          }
          return node;
        }),
      };

    case 'UPDATE_NODE_CONFIG':
      // Inverse of update is restore previous state
      return {
        ...workflow,
        nodes: workflow.nodes.map(node => {
          if (node.id === operation.inverse.nodeId) {
            return { ...node, ...operation.inverse.previousState };
          }
          return node;
        }),
      };

    case 'ADD_EDGE':
      // Inverse of add edge is delete edge
      return {
        ...workflow,
        edges: workflow.edges.filter(e => e.id !== operation.inverse.edgeId),
      };

    case 'DELETE_EDGE':
      // Inverse of delete edge is restore edge
      return {
        ...workflow,
        edges: [...workflow.edges, operation.inverse.edge],
      };

    case 'BULK_DELETE':
      // Inverse of bulk delete is restore all items
      return {
        ...workflow,
        nodes: [...workflow.nodes, ...operation.inverse.nodes],
        edges: [...workflow.edges, ...operation.inverse.edges],
      };

    case 'PASTE_NODES':
    case 'DUPLICATE_NODES':
      // Inverse of paste/duplicate is delete the pasted items
      return {
        ...workflow,
        nodes: workflow.nodes.filter(n => !operation.inverse.nodeIds.includes(n.id)),
        edges: workflow.edges.filter(e => !operation.inverse.edgeIds.includes(e.id)),
      };

    default:
      console.warn('Unknown operation type for undo:', (operation as any).type);
      return workflow;
  }
}

/**
 * Apply an operation forward (for redo)
 */
function applyForwardOperation(operation: Operation, workflow: Workflow): Workflow {
  switch (operation.type) {
    case 'ADD_NODE':
      // Forward is add the node
      return {
        ...workflow,
        nodes: [...workflow.nodes, operation.data.node],
      };

    case 'DELETE_NODE':
      // Forward is delete the node
      return {
        ...workflow,
        nodes: workflow.nodes.filter(n => n.id !== operation.data.nodeId),
        edges: workflow.edges.filter(
          e => e.sourceNodeId !== operation.data.nodeId &&
               e.targetNodeId !== operation.data.nodeId
        ),
      };

    case 'MOVE_NODE':
      // Forward is move to new positions
      return {
        ...workflow,
        nodes: workflow.nodes.map(node => {
          const moveData = operation.data.moves.find(m => m.nodeId === node.id);
          if (moveData) {
            return { ...node, position: moveData.newPosition };
          }
          return node;
        }),
      };

    case 'UPDATE_NODE_CONFIG':
      // Forward is apply the changes
      return {
        ...workflow,
        nodes: workflow.nodes.map(node => {
          if (node.id === operation.data.nodeId) {
            return { ...node, ...operation.data.changes };
          }
          return node;
        }),
      };

    case 'ADD_EDGE':
      // Forward is add the edge
      return {
        ...workflow,
        edges: [...workflow.edges, operation.data.edge],
      };

    case 'DELETE_EDGE':
      // Forward is delete the edge
      return {
        ...workflow,
        edges: workflow.edges.filter(e => e.id !== operation.data.edgeId),
      };

    case 'BULK_DELETE':
      // Forward is delete the items
      const nodeIdsToDelete = new Set(operation.data.nodeIds);
      const edgeIdsToDelete = new Set(operation.data.edgeIds);
      return {
        ...workflow,
        nodes: workflow.nodes.filter(n => !nodeIdsToDelete.has(n.id)),
        edges: workflow.edges.filter(
          e => !edgeIdsToDelete.has(e.id) &&
               !nodeIdsToDelete.has(e.sourceNodeId) &&
               !nodeIdsToDelete.has(e.targetNodeId)
        ),
      };

    case 'PASTE_NODES':
    case 'DUPLICATE_NODES':
      // Forward is add the pasted items
      return {
        ...workflow,
        nodes: [...workflow.nodes, ...operation.data.nodes],
        edges: [...workflow.edges, ...operation.data.edges],
      };

    default:
      console.warn('Unknown operation type for redo:', (operation as any).type);
      return workflow;
  }
}

/**
 * Check if undo is available
 */
export function canUndo(workflowId: string): boolean {
  return checkCanUndo(workflowId);
}

/**
 * Check if redo is available
 */
export function canRedo(workflowId: string): boolean {
  return checkCanRedo(workflowId);
}
