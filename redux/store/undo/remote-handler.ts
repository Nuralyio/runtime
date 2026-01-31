/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Operation, UndoEntry } from './operation.types';
import type { Workflow } from '../../../components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import {
  addToOperationLog,
  updateLamportClock,
  getUndoStack,
  markUndoConflict,
  $currentUserId,
} from './undo.store';
import { undo as executeUndo, redo as executeRedo, type UndoRedoResult } from './undo-executor';

/**
 * Remote operation event data received via WebSocket
 */
export interface RemoteOperationEvent {
  operation: Operation;
  senderId: string;
  senderName?: string;
}

/**
 * Remote undo event data
 */
export interface RemoteUndoEvent {
  workflowId: string;
  entryId: string;
  senderId: string;
  senderName?: string;
  updatedWorkflow: Workflow;
}

/**
 * Remote redo event data
 */
export interface RemoteRedoEvent {
  workflowId: string;
  entryId: string;
  senderId: string;
  senderName?: string;
  updatedWorkflow: Workflow;
}

/**
 * Callback for workflow updates from remote operations
 */
type WorkflowUpdateCallback = (workflow: Workflow) => void;

/**
 * Callback for conflict notifications
 */
type ConflictNotifyCallback = (message: string) => void;

/**
 * Registry for callbacks
 */
let workflowUpdateCallback: WorkflowUpdateCallback | null = null;
let conflictNotifyCallback: ConflictNotifyCallback | null = null;

/**
 * Register callback for workflow updates from remote operations
 */
export function onRemoteWorkflowUpdate(callback: WorkflowUpdateCallback): void {
  workflowUpdateCallback = callback;
}

/**
 * Register callback for conflict notifications
 */
export function onConflictNotify(callback: ConflictNotifyCallback): void {
  conflictNotifyCallback = callback;
}

/**
 * Handle a remote operation received via WebSocket
 * This updates the operation log and checks for conflicts with local undo stack
 */
export function handleRemoteOperation(
  event: RemoteOperationEvent,
  currentWorkflow: Workflow
): Workflow {
  const { operation, senderId, senderName } = event;
  const userId = $currentUserId.get();

  // Ignore our own operations that come back
  if (senderId === userId) {
    return currentWorkflow;
  }

  // Update Lamport clock
  updateLamportClock(operation.timestamp);

  // Add to operation log as remote
  addToOperationLog(operation, true);

  // Check if this conflicts with any pending undos
  checkAndMarkConflicts(operation, senderName);

  // Apply the remote operation to our local workflow
  const updatedWorkflow = applyRemoteOperation(operation, currentWorkflow);

  return updatedWorkflow;
}

/**
 * Apply a remote operation to the local workflow
 */
function applyRemoteOperation(operation: Operation, workflow: Workflow): Workflow {
  switch (operation.type) {
    case 'ADD_NODE':
      return {
        ...workflow,
        nodes: [...workflow.nodes, operation.data.node],
      };

    case 'DELETE_NODE':
      return {
        ...workflow,
        nodes: workflow.nodes.filter(n => n.id !== operation.data.nodeId),
        edges: workflow.edges.filter(
          e => e.sourceNodeId !== operation.data.nodeId &&
               e.targetNodeId !== operation.data.nodeId
        ),
      };

    case 'MOVE_NODE':
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
      return {
        ...workflow,
        edges: [...workflow.edges, operation.data.edge],
      };

    case 'DELETE_EDGE':
      return {
        ...workflow,
        edges: workflow.edges.filter(e => e.id !== operation.data.edgeId),
      };

    case 'BULK_DELETE':
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
      return {
        ...workflow,
        nodes: [...workflow.nodes, ...operation.data.nodes],
        edges: [...workflow.edges, ...operation.data.edges],
      };

    default:
      console.warn('Unknown remote operation type:', (operation as any).type);
      return workflow;
  }
}

/**
 * Check if a remote operation conflicts with local undo entries
 * and mark them as conflicted
 */
function checkAndMarkConflicts(operation: Operation, senderName?: string): void {
  const workflowId = operation.workflowId;
  const undoStack = getUndoStack(workflowId);
  const displayName = senderName || 'another user';

  for (const entry of undoStack) {
    if (!entry.canUndo) continue;

    const conflict = checkEntryConflictsWithOperation(entry, operation);
    if (conflict) {
      markUndoConflict(
        workflowId,
        entry.id,
        `${conflict} (by ${displayName})`
      );

      // Notify the user
      if (conflictNotifyCallback) {
        conflictNotifyCallback(
          `Cannot undo "${entry.description}": ${conflict} by ${displayName}`
        );
      }
    }
  }
}

/**
 * Check if an undo entry conflicts with a remote operation
 */
function checkEntryConflictsWithOperation(entry: UndoEntry, remoteOp: Operation): string | null {
  for (const localOp of entry.operations) {
    // Get the node/edge IDs affected by the local operation
    const localNodeIds = getAffectedNodeIds(localOp);
    const localEdgeIds = getAffectedEdgeIds(localOp);

    // Get the node/edge IDs affected by the remote operation
    const remoteNodeIds = getAffectedNodeIds(remoteOp);
    const remoteEdgeIds = getAffectedEdgeIds(remoteOp);

    // Check for overlap
    const nodeOverlap = localNodeIds.some(id => remoteNodeIds.includes(id));
    const edgeOverlap = localEdgeIds.some(id => remoteEdgeIds.includes(id));

    if (nodeOverlap || edgeOverlap) {
      return getConflictDescription(remoteOp);
    }
  }

  return null;
}

/**
 * Get node IDs affected by an operation
 */
function getAffectedNodeIds(op: Operation): string[] {
  switch (op.type) {
    case 'ADD_NODE':
      return [op.data.node.id];
    case 'DELETE_NODE':
      return [op.data.nodeId];
    case 'MOVE_NODE':
      return op.data.moves.map(m => m.nodeId);
    case 'UPDATE_NODE_CONFIG':
      return [op.data.nodeId];
    case 'BULK_DELETE':
      return op.data.nodeIds;
    case 'PASTE_NODES':
    case 'DUPLICATE_NODES':
      return op.data.nodes.map(n => n.id);
    default:
      return [];
  }
}

/**
 * Get edge IDs affected by an operation
 */
function getAffectedEdgeIds(op: Operation): string[] {
  switch (op.type) {
    case 'ADD_EDGE':
      return [op.data.edge.id];
    case 'DELETE_EDGE':
      return [op.data.edgeId];
    case 'BULK_DELETE':
      return op.data.edgeIds;
    case 'PASTE_NODES':
    case 'DUPLICATE_NODES':
      return op.data.edges.map(e => e.id);
    default:
      return [];
  }
}

/**
 * Get human-readable description of what a remote operation did
 */
function getConflictDescription(op: Operation): string {
  switch (op.type) {
    case 'ADD_NODE':
      return 'Node was added';
    case 'DELETE_NODE':
      return 'Node was deleted';
    case 'MOVE_NODE':
      return 'Node was moved';
    case 'UPDATE_NODE_CONFIG':
      return 'Node configuration was changed';
    case 'ADD_EDGE':
      return 'Connection was added';
    case 'DELETE_EDGE':
      return 'Connection was deleted';
    case 'BULK_DELETE':
      return 'Items were deleted';
    case 'PASTE_NODES':
      return 'Nodes were pasted';
    case 'DUPLICATE_NODES':
      return 'Nodes were duplicated';
    default:
      return 'Workflow was modified';
  }
}

/**
 * Handle remote undo event
 * When another user undoes an operation, we apply it locally
 */
export function handleRemoteUndo(
  event: RemoteUndoEvent
): void {
  const { workflowId, updatedWorkflow, senderName } = event;
  const userId = $currentUserId.get();

  // Ignore our own undo events
  if (event.senderId === userId) {
    return;
  }

  // Apply the updated workflow
  if (workflowUpdateCallback) {
    workflowUpdateCallback(updatedWorkflow);
  }
}

/**
 * Handle remote redo event
 */
export function handleRemoteRedo(
  event: RemoteRedoEvent
): void {
  const { workflowId, updatedWorkflow, senderName } = event;
  const userId = $currentUserId.get();

  // Ignore our own redo events
  if (event.senderId === userId) {
    return;
  }

  // Apply the updated workflow
  if (workflowUpdateCallback) {
    workflowUpdateCallback(updatedWorkflow);
  }
}

/**
 * Create event data for broadcasting an operation
 */
export function createOperationEvent(operation: Operation): RemoteOperationEvent {
  const userId = $currentUserId.get();
  return {
    operation,
    senderId: userId,
  };
}

/**
 * Create event data for broadcasting an undo
 */
export function createUndoEvent(
  workflowId: string,
  entryId: string,
  updatedWorkflow: Workflow
): RemoteUndoEvent {
  const userId = $currentUserId.get();
  return {
    workflowId,
    entryId,
    senderId: userId,
    updatedWorkflow,
  };
}

/**
 * Create event data for broadcasting a redo
 */
export function createRedoEvent(
  workflowId: string,
  entryId: string,
  updatedWorkflow: Workflow
): RemoteRedoEvent {
  const userId = $currentUserId.get();
  return {
    workflowId,
    entryId,
    senderId: userId,
    updatedWorkflow,
  };
}
