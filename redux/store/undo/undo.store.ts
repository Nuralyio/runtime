/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { atom, map, computed } from 'nanostores';
import type { UndoEntry, UndoStackState, OperationLogEntry, Operation } from './operation.types';

/**
 * Maximum number of undo entries per workflow
 */
const MAX_UNDO_STACK_SIZE = 50;

/**
 * Maximum size of the operation log for conflict detection
 */
const MAX_OPERATION_LOG_SIZE = 100;

/**
 * Undo stacks per workflow
 * Key: workflowId
 */
export const $undoStacks = map<Record<string, UndoEntry[]>>({});

/**
 * Redo stacks per workflow
 * Key: workflowId
 */
export const $redoStacks = map<Record<string, UndoEntry[]>>({});

/**
 * Global operation log for conflict detection
 * Contains operations from all users
 */
export const $operationLog = atom<OperationLogEntry[]>([]);

/**
 * Current workflow ID being edited
 */
export const $currentUndoWorkflowId = atom<string | null>(null);

/**
 * Current user ID for tracking who made changes
 */
export const $currentUserId = atom<string>('local-user');

/**
 * Lamport clock for operation ordering
 */
let lamportClock = 0;

/**
 * Get the next Lamport timestamp
 */
export function getNextLamportTimestamp(): number {
  return ++lamportClock;
}

/**
 * Update Lamport clock based on received timestamp
 */
export function updateLamportClock(receivedTimestamp: number): void {
  lamportClock = Math.max(lamportClock, receivedTimestamp) + 1;
}

/**
 * Get undo stack for current workflow
 */
export function getUndoStack(workflowId: string): UndoEntry[] {
  return $undoStacks.get()[workflowId] || [];
}

/**
 * Get redo stack for current workflow
 */
export function getRedoStack(workflowId: string): UndoEntry[] {
  return $redoStacks.get()[workflowId] || [];
}

/**
 * Push an entry to the undo stack
 */
export function pushToUndoStack(workflowId: string, entry: UndoEntry): void {
  const stacks = $undoStacks.get();
  const currentStack = stacks[workflowId] || [];

  // Add new entry and limit size
  const newStack = [...currentStack, entry].slice(-MAX_UNDO_STACK_SIZE);

  $undoStacks.setKey(workflowId, newStack);

  // Clear redo stack when new action is performed
  $redoStacks.setKey(workflowId, []);
}

/**
 * Pop from undo stack and push to redo stack
 */
export function popFromUndoStack(workflowId: string): UndoEntry | null {
  const stacks = $undoStacks.get();
  const currentStack = stacks[workflowId] || [];

  if (currentStack.length === 0) {
    return null;
  }

  const entry = currentStack[currentStack.length - 1];
  const newStack = currentStack.slice(0, -1);

  $undoStacks.setKey(workflowId, newStack);

  // Push to redo stack
  const redoStacks = $redoStacks.get();
  const currentRedoStack = redoStacks[workflowId] || [];
  $redoStacks.setKey(workflowId, [...currentRedoStack, entry]);

  return entry;
}

/**
 * Pop from redo stack and push to undo stack
 */
export function popFromRedoStack(workflowId: string): UndoEntry | null {
  const redoStacks = $redoStacks.get();
  const currentStack = redoStacks[workflowId] || [];

  if (currentStack.length === 0) {
    return null;
  }

  const entry = currentStack[currentStack.length - 1];
  const newStack = currentStack.slice(0, -1);

  $redoStacks.setKey(workflowId, newStack);

  // Push to undo stack
  const undoStacks = $undoStacks.get();
  const currentUndoStack = undoStacks[workflowId] || [];
  $undoStacks.setKey(workflowId, [...currentUndoStack, entry]);

  return entry;
}

/**
 * Add operation to the global log
 */
export function addToOperationLog(operation: Operation, isRemote: boolean = false): void {
  const currentLog = $operationLog.get();

  const entry: OperationLogEntry = {
    operation,
    appliedAt: Date.now(),
    isRemote,
  };

  // Add new entry and limit size
  const newLog = [...currentLog, entry].slice(-MAX_OPERATION_LOG_SIZE);

  $operationLog.set(newLog);
}

/**
 * Get operations affecting a specific node
 */
export function getOperationsForNode(nodeId: string, sinceTimestamp: number): OperationLogEntry[] {
  const log = $operationLog.get();

  return log.filter(entry => {
    if (entry.appliedAt < sinceTimestamp) return false;

    const op = entry.operation;

    switch (op.type) {
      case 'ADD_NODE':
        return op.data.node.id === nodeId;
      case 'DELETE_NODE':
        return op.data.nodeId === nodeId;
      case 'MOVE_NODE':
        return op.data.moves.some(m => m.nodeId === nodeId);
      case 'UPDATE_NODE_CONFIG':
        return op.data.nodeId === nodeId;
      case 'BULK_DELETE':
        return op.data.nodeIds.includes(nodeId);
      case 'PASTE_NODES':
        return op.data.nodes.some(n => n.id === nodeId);
      case 'DUPLICATE_NODES':
        return op.data.nodes.some(n => n.id === nodeId);
      default:
        return false;
    }
  });
}

/**
 * Get operations affecting a specific edge
 */
export function getOperationsForEdge(edgeId: string, sinceTimestamp: number): OperationLogEntry[] {
  const log = $operationLog.get();

  return log.filter(entry => {
    if (entry.appliedAt < sinceTimestamp) return false;

    const op = entry.operation;

    switch (op.type) {
      case 'ADD_EDGE':
        return op.data.edge.id === edgeId;
      case 'DELETE_EDGE':
        return op.data.edgeId === edgeId;
      case 'BULK_DELETE':
        return op.data.edgeIds.includes(edgeId);
      case 'PASTE_NODES':
        return op.data.edges.some(e => e.id === edgeId);
      case 'DUPLICATE_NODES':
        return op.data.edges.some(e => e.id === edgeId);
      default:
        return false;
    }
  });
}

/**
 * Clear undo/redo stacks for a workflow
 */
export function clearUndoHistory(workflowId: string): void {
  $undoStacks.setKey(workflowId, []);
  $redoStacks.setKey(workflowId, []);
}

/**
 * Clear all undo/redo history
 */
export function clearAllUndoHistory(): void {
  $undoStacks.set({});
  $redoStacks.set({});
  $operationLog.set([]);
}

/**
 * Computed: Can undo for current workflow
 */
export function canUndo(workflowId: string): boolean {
  const stack = getUndoStack(workflowId);
  return stack.length > 0 && stack[stack.length - 1]?.canUndo !== false;
}

/**
 * Computed: Can redo for current workflow
 */
export function canRedo(workflowId: string): boolean {
  const stack = getRedoStack(workflowId);
  return stack.length > 0;
}

/**
 * Get undo description for current workflow
 */
export function getUndoDescription(workflowId: string): string | null {
  const stack = getUndoStack(workflowId);
  if (stack.length === 0) return null;
  return stack[stack.length - 1].description;
}

/**
 * Get redo description for current workflow
 */
export function getRedoDescription(workflowId: string): string | null {
  const stack = getRedoStack(workflowId);
  if (stack.length === 0) return null;
  return stack[stack.length - 1].description;
}

/**
 * Mark an undo entry as having a conflict
 */
export function markUndoConflict(workflowId: string, entryId: string, reason: string): void {
  const stacks = $undoStacks.get();
  const currentStack = stacks[workflowId] || [];

  const newStack = currentStack.map(entry => {
    if (entry.id === entryId) {
      return { ...entry, canUndo: false, conflictReason: reason };
    }
    return entry;
  });

  $undoStacks.setKey(workflowId, newStack);
}

/**
 * Get full undo/redo state for a workflow
 */
export function getUndoState(workflowId: string): UndoStackState {
  return {
    undoStack: getUndoStack(workflowId),
    redoStack: getRedoStack(workflowId),
  };
}
