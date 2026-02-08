/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Collaboration interfaces for real-time whiteboard collaboration.
 * Mirrors backend types from presence/interfaces/canvas.interface.ts
 */

export type CanvasOperationType =
  | 'ADD'
  | 'UPDATE'
  | 'DELETE'
  | 'MOVE'
  | 'RESIZE'
  | 'UPDATE_TEXT'
  | 'ADD_CONNECTOR'
  | 'DELETE_CONNECTOR';

export interface CanvasOperation {
  id: string;
  type: CanvasOperationType;
  elementId?: string;
  data: Record<string, unknown>;
  userId: string;
  timestamp: number;
  version: number;
}

export interface RemoteCursor {
  userId: string;
  username: string;
  color: string;
  x: number;
  y: number;
  lastUpdate: number;
}

export interface CollaborationUser {
  userId: string;
  username: string;
  color: string;
  cursor?: { x: number; y: number };
  selectedElementIds?: string[];
  isTyping?: boolean;
  typingElementId?: string;
}

export interface CollaborationState {
  connected: boolean;
  canvasId: string | null;
  users: Map<string, CollaborationUser>;
  cursors: Map<string, RemoteCursor>;
  selections: Map<string, { userId: string; elementIds: string[] }>;
  typingIndicators: Map<string, { userId: string; elementId: string; isTyping: boolean }>;
  serverVersion: number;
  pendingOps: Map<string, CanvasOperation>;
}

export const USER_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
];
