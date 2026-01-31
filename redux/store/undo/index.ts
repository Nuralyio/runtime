/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 *
 * Multi-User Undo/Redo System
 *
 * This module provides a Command Pattern implementation for undo/redo
 * in multi-user collaborative workflow editing.
 *
 * Key Features:
 * - Per-user undo stacks (User A's undo won't affect User B's changes)
 * - Conflict detection (blocks undo if another user modified the target)
 * - Operation merging (rapid moves merge into single undo entry)
 * - WebSocket sync for real-time collaboration
 *
 * Usage:
 *
 * 1. Record operations when modifying the workflow:
 *    recordAddNode(workflowId, node);
 *    recordMoveNodes(workflowId, moves);
 *    recordDeleteNode(workflowId, node, connectedEdges);
 *
 * 2. Execute undo/redo:
 *    const result = undo(workflowId, currentWorkflow);
 *    if (result.success) {
 *      updateWorkflow(result.workflow);
 *    }
 *
 * 3. Check availability:
 *    const canUndoNow = canUndo(workflowId);
 *    const canRedoNow = canRedo(workflowId);
 *
 * 4. Handle remote operations (for multi-user):
 *    const updatedWorkflow = handleRemoteOperation(event, currentWorkflow);
 */

// Types
export * from './operation.types';

// Store
export {
  $undoStacks,
  $redoStacks,
  $operationLog,
  $currentUndoWorkflowId,
  $currentUserId,
  getUndoStack,
  getRedoStack,
  getUndoState,
  getUndoDescription,
  getRedoDescription,
  clearUndoHistory,
  clearAllUndoHistory,
  canUndo as canUndoStore,
  canRedo as canRedoStore,
} from './undo.store';

// Operation Recorder
export {
  recordAddNode,
  recordDeleteNode,
  recordMoveNode,
  recordMoveNodes,
  recordUpdateNodeConfig,
  recordAddEdge,
  recordDeleteEdge,
  recordBulkDelete,
  recordPasteNodes,
  recordDuplicateNodes,
  flushPendingOperations,
} from './operation-recorder';

// Conflict Resolver
export {
  checkUndoConflict,
  checkRedoConflict,
} from './conflict-resolver';

// Undo Executor
export {
  undo,
  redo,
  canUndo,
  canRedo,
  type UndoRedoResult,
} from './undo-executor';

// Remote Handler
export {
  handleRemoteOperation,
  handleRemoteUndo,
  handleRemoteRedo,
  onRemoteWorkflowUpdate,
  onConflictNotify,
  createOperationEvent,
  createUndoEvent,
  createRedoEvent,
  type RemoteOperationEvent,
  type RemoteUndoEvent,
  type RemoteRedoEvent,
} from './remote-handler';
