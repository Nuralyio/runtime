/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { io, type Socket } from 'socket.io-client';
import { BaseCanvasController } from './base.controller.js';
import type {
  CanvasOperation,
  CanvasOperationType,
  CollaborationState,
  CollaborationUser,
  RemoteCursor,
} from '../interfaces/collaboration.interface.js';

const CURSOR_THROTTLE_MS = 33;
const STALE_CURSOR_MS = 10_000;
const STALE_CURSOR_CHECK_MS = 5_000;

/**
 * CollaborationController manages real-time collaboration via Socket.IO.
 * Connects to the existing Canvas Gateway at /socket.io/presence.
 */
export class CollaborationController extends BaseCanvasController {
  private socket: Socket | null = null;
  private staleCursorInterval: ReturnType<typeof setInterval> | null = null;
  private lastCursorBroadcast = 0;
  private cursorThrottleTimer: ReturnType<typeof setTimeout> | null = null;

  private state: CollaborationState = {
    connected: false,
    canvasId: null,
    users: new Map(),
    cursors: new Map(),
    selections: new Map(),
    typingIndicators: new Map(),
    serverVersion: 0,
    pendingOps: new Map(),
  };

  private opCounter = 0;

  // ==================== Lifecycle ====================

  connect(canvasId: string, canvasType: 'WORKFLOW' | 'WHITEBOARD' = 'WHITEBOARD'): void {
    if (this.socket?.connected && this.state.canvasId === canvasId) return;

    this.disconnect();
    this.state.canvasId = canvasId;

    try {
      const origin = globalThis.location.origin;
      this.socket = io(origin, {
        path: '/socket.io/presence',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        this.state.connected = true;
        this.safeExecute(
          () => this.socket!.emit('canvas:join', { canvasId, canvasType }),
          'connect: canvas:join'
        );
        this._host.requestUpdate();
      });

      this.socket.on('disconnect', () => {
        this.state.connected = false;
        this._host.requestUpdate();
      });

      this.socket.on('reconnect', () => {
        this.safeExecute(
          () => this.socket!.emit('canvas:join', { canvasId, canvasType }),
          'reconnect: canvas:join'
        );
      });

      // Register inbound event handlers
      this.registerEventHandlers();

      // Start stale cursor cleanup
      this.staleCursorInterval = setInterval(() => this.cleanStaleCursors(), STALE_CURSOR_CHECK_MS);
    } catch (error) {
      this.handleError(error as Error, 'connect');
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.safeExecute(() => {
        if (this.state.canvasId) {
          this.socket!.emit('canvas:leave', { canvasId: this.state.canvasId });
        }
        this.socket!.removeAllListeners();
        this.socket!.disconnect();
      }, 'disconnect');
      this.socket = null;
    }

    if (this.staleCursorInterval) {
      clearInterval(this.staleCursorInterval);
      this.staleCursorInterval = null;
    }

    if (this.cursorThrottleTimer) {
      clearTimeout(this.cursorThrottleTimer);
      this.cursorThrottleTimer = null;
    }

    this.state = {
      connected: false,
      canvasId: null,
      users: new Map(),
      cursors: new Map(),
      selections: new Map(),
      typingIndicators: new Map(),
      serverVersion: 0,
      pendingOps: new Map(),
    };
  }

  override hostDisconnected(): void {
    this.disconnect();
  }

  // ==================== Event Registration ====================

  private registerEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('canvas:users:sync', (data: { canvasId: string; users: CollaborationUser[] }) => {
      this.safeExecute(() => this.handleUsersSync(data), 'handleUsersSync');
    });

    this.socket.on('canvas:user:joined', (data: { canvasId: string; user: CollaborationUser }) => {
      this.safeExecute(() => this.handleUserJoined(data), 'handleUserJoined');
    });

    this.socket.on('canvas:user:left', (data: { canvasId: string; userId: string }) => {
      this.safeExecute(() => this.handleUserLeft(data), 'handleUserLeft');
    });

    this.socket.on('cursor:update', (data: {
      canvasId: string; userId: string; username: string; color: string; x: number; y: number;
    }) => {
      this.safeExecute(() => this.handleCursorUpdate(data), 'handleCursorUpdate');
    });

    this.socket.on('selection:update', (data: {
      canvasId: string; userId: string; elementIds: string[];
    }) => {
      this.safeExecute(() => this.handleSelectionUpdate(data), 'handleSelectionUpdate');
    });

    this.socket.on('typing:indicator', (data: {
      canvasId: string; userId: string; elementId: string; isTyping: boolean;
    }) => {
      this.safeExecute(() => this.handleTypingIndicator(data), 'handleTypingIndicator');
    });

    this.socket.on('operation:received', (data: {
      canvasId: string; operation: CanvasOperation;
    }) => {
      this.safeExecute(() => this.handleOperationReceived(data), 'handleOperationReceived');
    });

    this.socket.on('operation:ack', (data: {
      operationId: string; serverVersion: number;
    }) => {
      this.safeExecute(() => this.handleOperationAck(data), 'handleOperationAck');
    });
  }

  // ==================== Outbound Methods ====================

  broadcastCursorMove(x: number, y: number): void {
    if (!this.socket?.connected || !this.state.canvasId) return;

    const now = Date.now();
    if (now - this.lastCursorBroadcast < CURSOR_THROTTLE_MS) {
      // Throttle: schedule a trailing emit
      if (!this.cursorThrottleTimer) {
        this.cursorThrottleTimer = setTimeout(() => {
          this.cursorThrottleTimer = null;
          this.emitCursorMove(x, y);
        }, CURSOR_THROTTLE_MS - (now - this.lastCursorBroadcast));
      }
      return;
    }

    this.emitCursorMove(x, y);
  }

  private emitCursorMove(x: number, y: number): void {
    if (!this.socket?.connected || !this.state.canvasId) return;
    this.lastCursorBroadcast = Date.now();
    this.safeExecute(
      () => this.socket!.emit('cursor:move', { canvasId: this.state.canvasId, x, y }),
      'emitCursorMove'
    );
  }

  broadcastSelectionChange(elementIds: string[]): void {
    if (!this.socket?.connected || !this.state.canvasId) return;
    this.safeExecute(
      () => this.socket!.emit('selection:change', { canvasId: this.state.canvasId, elementIds }),
      'broadcastSelectionChange'
    );
  }

  broadcastTypingStart(elementId: string): void {
    if (!this.socket?.connected || !this.state.canvasId) return;
    this.safeExecute(
      () => this.socket!.emit('typing:start', { canvasId: this.state.canvasId, elementId }),
      'broadcastTypingStart'
    );
  }

  broadcastTypingStop(elementId: string): void {
    if (!this.socket?.connected || !this.state.canvasId) return;
    this.safeExecute(
      () => this.socket!.emit('typing:stop', { canvasId: this.state.canvasId, elementId }),
      'broadcastTypingStop'
    );
  }

  broadcastOperation(type: CanvasOperationType, elementId: string, data: Record<string, unknown>): void {
    if (!this.socket?.connected || !this.state.canvasId) return;

    const opId = `op_${Date.now()}_${++this.opCounter}`;
    const operation: CanvasOperation = {
      id: opId,
      type,
      elementId,
      data,
      userId: '', // server fills this
      timestamp: Date.now(),
      version: this.state.serverVersion,
    };

    this.state.pendingOps.set(opId, operation);

    this.safeExecute(
      () => this.socket!.emit('operation:apply', {
        canvasId: this.state.canvasId,
        operationType: type,
        elementId,
        data,
        baseVersion: this.state.serverVersion,
      }),
      'broadcastOperation'
    );
  }

  // ==================== Inbound Handlers ====================

  private handleUsersSync(data: { canvasId: string; users: CollaborationUser[] }): void {
    if (data.canvasId !== this.state.canvasId) return;
    this.state.users.clear();
    for (const user of data.users) {
      this.state.users.set(user.userId, user);
    }
    this._host.requestUpdate();
  }

  private handleUserJoined(data: { canvasId: string; user: CollaborationUser }): void {
    if (data.canvasId !== this.state.canvasId) return;
    this.state.users.set(data.user.userId, data.user);
    this._host.requestUpdate();
  }

  private handleUserLeft(data: { canvasId: string; userId: string }): void {
    if (data.canvasId !== this.state.canvasId) return;
    this.state.users.delete(data.userId);
    this.state.cursors.delete(data.userId);
    this.state.selections.delete(data.userId);
    this.state.typingIndicators.delete(data.userId);
    this._host.requestUpdate();
  }

  private handleCursorUpdate(data: {
    canvasId: string; userId: string; username: string; color: string; x: number; y: number;
  }): void {
    if (data.canvasId !== this.state.canvasId) return;
    this.state.cursors.set(data.userId, {
      userId: data.userId,
      username: data.username,
      color: data.color,
      x: data.x,
      y: data.y,
      lastUpdate: Date.now(),
    });
    this._host.requestUpdate();
  }

  private handleSelectionUpdate(data: {
    canvasId: string; userId: string; elementIds: string[];
  }): void {
    if (data.canvasId !== this.state.canvasId) return;
    if (data.elementIds.length === 0) {
      this.state.selections.delete(data.userId);
    } else {
      this.state.selections.set(data.userId, {
        userId: data.userId,
        elementIds: data.elementIds,
      });
    }
    this._host.requestUpdate();
  }

  private handleTypingIndicator(data: {
    canvasId: string; userId: string; elementId: string; isTyping: boolean;
  }): void {
    if (data.canvasId !== this.state.canvasId) return;
    if (data.isTyping) {
      this.state.typingIndicators.set(data.userId, {
        userId: data.userId,
        elementId: data.elementId,
        isTyping: true,
      });
    } else {
      this.state.typingIndicators.delete(data.userId);
    }
    this._host.requestUpdate();
  }

  private handleOperationReceived(data: { canvasId: string; operation: CanvasOperation }): void {
    if (data.canvasId !== this.state.canvasId) return;
    this.state.serverVersion = Math.max(this.state.serverVersion, data.operation.version);
    this.applyRemoteOperation(data.operation);
  }

  private handleOperationAck(data: { operationId: string; serverVersion: number }): void {
    this.state.pendingOps.delete(data.operationId);
    this.state.serverVersion = Math.max(this.state.serverVersion, data.serverVersion);
  }

  // ==================== Remote Operation Application ====================

  private applyRemoteOperation(op: CanvasOperation): void {
    const workflow = this._host.workflow;
    if (!workflow) return;

    let updatedNodes = [...workflow.nodes];
    let updatedEdges = [...workflow.edges];
    let modified = false;

    switch (op.type) {
      case 'ADD': {
        const nodeData = op.data.node as Record<string, unknown> | undefined;
        if (nodeData) {
          updatedNodes = [...updatedNodes, nodeData as any];
          modified = true;
        }
        break;
      }

      case 'DELETE': {
        if (op.elementId) {
          updatedNodes = updatedNodes.filter(n => n.id !== op.elementId);
          updatedEdges = updatedEdges.filter(
            e => e.sourceNodeId !== op.elementId && e.targetNodeId !== op.elementId
          );
          modified = true;
        }
        break;
      }

      case 'MOVE': {
        if (op.elementId) {
          updatedNodes = updatedNodes.map(n => {
            if (n.id === op.elementId) {
              return {
                ...n,
                position: {
                  x: op.data.x as number,
                  y: op.data.y as number,
                },
              };
            }
            return n;
          });
          modified = true;
        }
        break;
      }

      case 'RESIZE': {
        if (op.elementId) {
          updatedNodes = updatedNodes.map(n => {
            if (n.id === op.elementId) {
              return {
                ...n,
                configuration: {
                  ...n.configuration,
                  width: op.data.width as number,
                  height: op.data.height as number,
                },
              };
            }
            return n;
          });
          modified = true;
        }
        break;
      }

      case 'UPDATE_TEXT': {
        if (op.elementId) {
          updatedNodes = updatedNodes.map(n => {
            if (n.id === op.elementId) {
              return {
                ...n,
                configuration: {
                  ...n.configuration,
                  textContent: op.data.textContent as string,
                },
              };
            }
            return n;
          });
          modified = true;
        }
        break;
      }

      case 'UPDATE': {
        if (op.elementId) {
          updatedNodes = updatedNodes.map(n => {
            if (n.id === op.elementId) {
              return {
                ...n,
                configuration: {
                  ...n.configuration,
                  ...op.data,
                },
              };
            }
            return n;
          });
          modified = true;
        }
        break;
      }

      case 'ADD_CONNECTOR': {
        const edgeData = op.data.edge as Record<string, unknown> | undefined;
        if (edgeData) {
          updatedEdges = [...updatedEdges, edgeData as any];
          modified = true;
        }
        break;
      }

      case 'DELETE_CONNECTOR': {
        if (op.elementId) {
          updatedEdges = updatedEdges.filter(e => e.id !== op.elementId);
          modified = true;
        }
        break;
      }
    }

    if (modified) {
      // Update workflow WITHOUT dispatching workflow-changed event
      // to prevent re-broadcasting and re-triggering HTTP save
      this._host.setWorkflow({
        ...workflow,
        nodes: updatedNodes,
        edges: updatedEdges,
      });
      this._host.requestUpdate();
    }
  }

  // ==================== Query Methods ====================

  getState(): CollaborationState {
    return this.state;
  }

  isConnected(): boolean {
    return this.state.connected;
  }

  getUsers(): CollaborationUser[] {
    return Array.from(this.state.users.values());
  }

  getCursors(): RemoteCursor[] {
    return Array.from(this.state.cursors.values());
  }

  isElementSelectedByRemote(elementId: string): { userId: string; color: string; username: string } | null {
    for (const [userId, sel] of this.state.selections) {
      if (sel.elementIds.includes(elementId)) {
        const user = this.state.users.get(userId);
        if (user) {
          return { userId, color: user.color, username: user.username };
        }
      }
    }
    return null;
  }

  isElementBeingTypedByRemote(elementId: string): { userId: string; username: string; color: string } | null {
    for (const [userId, indicator] of this.state.typingIndicators) {
      if (indicator.elementId === elementId && indicator.isTyping) {
        const user = this.state.users.get(userId);
        if (user) {
          return { userId, username: user.username, color: user.color };
        }
      }
    }
    return null;
  }

  // ==================== Helpers ====================

  private cleanStaleCursors(): void {
    const now = Date.now();
    let changed = false;
    for (const [userId, cursor] of this.state.cursors) {
      if (now - cursor.lastUpdate > STALE_CURSOR_MS) {
        this.state.cursors.delete(userId);
        changed = true;
      }
    }
    if (changed) {
      this._host.requestUpdate();
    }
  }
}
