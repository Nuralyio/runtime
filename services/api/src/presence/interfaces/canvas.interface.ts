/**
 * Canvas collaboration interfaces
 * Types for real-time whiteboard collaboration
 */

// Canvas operation types
export type CanvasOperationType =
  | 'ADD'
  | 'UPDATE'
  | 'DELETE'
  | 'MOVE'
  | 'RESIZE'
  | 'UPDATE_TEXT'
  | 'ADD_CONNECTOR'
  | 'DELETE_CONNECTOR';

// Canvas operation for OT
export interface CanvasOperation {
  id: string;
  type: CanvasOperationType;
  elementId?: string;
  data: Record<string, unknown>;
  userId: string;
  timestamp: number;
  version: number;
}

// Cursor position on canvas
export interface CursorPosition {
  x: number;
  y: number;
}

// Canvas user with cursor
export interface CanvasUser {
  userId: string;
  username: string;
  color: string;
  cursor?: CursorPosition;
  selectedElementIds?: string[];
  isTyping?: boolean;
  typingElementId?: string;
}

// Socket Events - Client to Server (Canvas specific)
export interface CanvasClientToServerEvents {
  // Join/leave canvas
  'canvas:join': (data: { canvasId: string; canvasType: 'WORKFLOW' | 'WHITEBOARD' }) => void;
  'canvas:leave': (data: { canvasId: string }) => void;

  // Cursor tracking
  'cursor:move': (data: { canvasId: string; x: number; y: number }) => void;

  // Selection tracking
  'selection:change': (data: { canvasId: string; elementIds: string[] }) => void;

  // Typing indicators
  'typing:start': (data: { canvasId: string; elementId: string }) => void;
  'typing:stop': (data: { canvasId: string; elementId: string }) => void;

  // Operations (for OT)
  'operation:apply': (data: {
    canvasId: string;
    operationType: CanvasOperationType;
    elementId?: string;
    data: Record<string, unknown>;
    baseVersion: number;
  }) => void;

  // Comments
  'comment:add': (data: {
    canvasId: string;
    elementId?: string;
    content: string;
    parentId?: string;
  }) => void;
  'comment:resolve': (data: { canvasId: string; commentId: string }) => void;

  // Votes
  'vote:cast': (data: { canvasId: string; elementId: string; value: string }) => void;
  'vote:remove': (data: { canvasId: string; elementId: string }) => void;
}

// Socket Events - Server to Client (Canvas specific)
export interface CanvasServerToClientEvents {
  // User presence on canvas
  'canvas:users:sync': (data: { canvasId: string; users: CanvasUser[] }) => void;
  'canvas:user:joined': (data: { canvasId: string; user: CanvasUser }) => void;
  'canvas:user:left': (data: { canvasId: string; userId: string }) => void;

  // Cursor updates
  'cursor:update': (data: {
    canvasId: string;
    userId: string;
    username: string;
    color: string;
    x: number;
    y: number;
  }) => void;

  // Selection updates
  'selection:update': (data: {
    canvasId: string;
    userId: string;
    elementIds: string[];
  }) => void;

  // Typing indicators
  'typing:indicator': (data: {
    canvasId: string;
    userId: string;
    elementId: string;
    isTyping: boolean;
  }) => void;

  // Operation sync
  'operation:received': (data: { canvasId: string; operation: CanvasOperation }) => void;
  'operation:ack': (data: { operationId: string; serverVersion: number }) => void;

  // Comments
  'comment:added': (data: {
    canvasId: string;
    comment: {
      id: string;
      elementId?: string;
      content: string;
      authorId: string;
      authorName: string;
      parentId?: string;
      createdAt: number;
    };
  }) => void;
  'comment:resolved': (data: { canvasId: string; commentId: string; resolvedBy: string }) => void;

  // Votes
  'vote:updated': (data: {
    canvasId: string;
    elementId: string;
    votes: Array<{ userId: string; userName: string; value: string }>;
    totalVotes: number;
  }) => void;
}

// Extended socket data for canvas
export interface CanvasSocketData {
  currentCanvasId?: string;
  canvasType?: 'WORKFLOW' | 'WHITEBOARD';
  color?: string;
  cursor?: CursorPosition;
  selectedElementIds?: string[];
}

// User colors for presence
export const USER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#ec4899', // pink
];

/**
 * Generate a consistent color for a user based on their ID.
 */
export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}
