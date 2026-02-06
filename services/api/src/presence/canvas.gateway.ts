/**
 * Canvas Gateway
 * Socket.IO server extension for real-time canvas collaboration
 * Handles cursor tracking, selection sync, typing indicators, and OT operations
 */

import { Server, Socket } from 'socket.io';
import { Logger } from 'tslog';
import {
  CanvasClientToServerEvents,
  CanvasServerToClientEvents,
  CanvasSocketData,
  CanvasUser,
  CanvasOperation,
  getUserColor,
} from './interfaces/canvas.interface';
import { SocketData } from './interfaces/presence.interface';

const logger = new Logger({ name: 'CanvasGateway' });

// Extended socket type with canvas data
type CanvasSocket = Socket<
  CanvasClientToServerEvents,
  CanvasServerToClientEvents,
  Record<string, never>,
  SocketData & CanvasSocketData
>;

// In-memory stores (consider Redis for scaling)
const canvasUsers = new Map<string, Map<string, CanvasUser>>(); // canvasId -> userId -> user
const operationBuffers = new Map<string, { operations: CanvasOperation[]; version: number }>();

// Throttle tracking
const lastCursorUpdate = new Map<string, number>(); // socketId -> timestamp
const CURSOR_THROTTLE_MS = 33; // ~30fps

// Max buffer size for operations
const MAX_OPERATION_BUFFER = 1000;

export function setupCanvasHandlers(
  io: Server<CanvasClientToServerEvents, CanvasServerToClientEvents, Record<string, never>, SocketData & CanvasSocketData>
): void {
  io.on('connection', (socket: CanvasSocket) => {
    // Canvas join/leave
    socket.on('canvas:join', (data) => handleCanvasJoin(socket, io, data));
    socket.on('canvas:leave', (data) => handleCanvasLeave(socket, io, data));

    // Cursor tracking
    socket.on('cursor:move', (data) => handleCursorMove(socket, io, data));

    // Selection tracking
    socket.on('selection:change', (data) => handleSelectionChange(socket, io, data));

    // Typing indicators
    socket.on('typing:start', (data) => handleTypingStart(socket, io, data));
    socket.on('typing:stop', (data) => handleTypingStop(socket, io, data));

    // Operations (OT)
    socket.on('operation:apply', (data) => handleOperationApply(socket, io, data));

    // Comments
    socket.on('comment:add', (data) => handleCommentAdd(socket, io, data));
    socket.on('comment:resolve', (data) => handleCommentResolve(socket, io, data));

    // Votes
    socket.on('vote:cast', (data) => handleVoteCast(socket, io, data));
    socket.on('vote:remove', (data) => handleVoteRemove(socket, io, data));

    // Clean up on disconnect
    socket.on('disconnect', () => handleCanvasDisconnect(socket, io));
  });

  logger.info('Canvas handlers initialized');
}

// ==================== Canvas Join/Leave ====================

function handleCanvasJoin(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string; canvasType: 'WORKFLOW' | 'WHITEBOARD' }
): void {
  const { canvasId, canvasType } = data;

  // Leave previous canvas if any
  if (socket.data.currentCanvasId) {
    handleCanvasLeave(socket, io, { canvasId: socket.data.currentCanvasId });
  }

  // Generate user color
  const color = getUserColor(socket.data.userId);

  // Create canvas user
  const canvasUser: CanvasUser = {
    userId: socket.data.userId,
    username: socket.data.username,
    color,
  };

  // Store user info on socket
  socket.data.currentCanvasId = canvasId;
  socket.data.canvasType = canvasType;
  socket.data.color = color;

  // Add to canvas users map
  if (!canvasUsers.has(canvasId)) {
    canvasUsers.set(canvasId, new Map());
  }
  canvasUsers.get(canvasId)!.set(socket.data.userId, canvasUser);

  // Join Socket.IO room
  socket.join(`canvas:${canvasId}`);

  // Send current users to the new user
  const users = Array.from(canvasUsers.get(canvasId)?.values() || []);
  socket.emit('canvas:users:sync', { canvasId, users });

  // Broadcast to others
  socket.to(`canvas:${canvasId}`).emit('canvas:user:joined', {
    canvasId,
    user: canvasUser,
  });

  logger.info(`User ${socket.data.userId} joined canvas ${canvasId} (${canvasType})`);
}

function handleCanvasLeave(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string }
): void {
  const { canvasId } = data;

  // Remove from canvas users
  const users = canvasUsers.get(canvasId);
  if (users) {
    users.delete(socket.data.userId);
    if (users.size === 0) {
      canvasUsers.delete(canvasId);
    }
  }

  // Leave Socket.IO room
  socket.leave(`canvas:${canvasId}`);

  // Clear socket canvas data
  socket.data.currentCanvasId = undefined;
  socket.data.canvasType = undefined;

  // Broadcast to others
  io.to(`canvas:${canvasId}`).emit('canvas:user:left', {
    canvasId,
    userId: socket.data.userId,
  });

  logger.info(`User ${socket.data.userId} left canvas ${canvasId}`);
}

function handleCanvasDisconnect(socket: CanvasSocket, io: Server): void {
  if (socket.data.currentCanvasId) {
    handleCanvasLeave(socket, io, { canvasId: socket.data.currentCanvasId });
  }
  lastCursorUpdate.delete(socket.id);
}

// ==================== Cursor Tracking ====================

function handleCursorMove(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string; x: number; y: number }
): void {
  // Throttle cursor updates
  const now = Date.now();
  const lastUpdate = lastCursorUpdate.get(socket.id) || 0;
  if (now - lastUpdate < CURSOR_THROTTLE_MS) {
    return;
  }
  lastCursorUpdate.set(socket.id, now);

  const { canvasId, x, y } = data;

  // Update user cursor in store
  const users = canvasUsers.get(canvasId);
  if (users) {
    const user = users.get(socket.data.userId);
    if (user) {
      user.cursor = { x, y };
    }
  }

  // Broadcast to others
  socket.to(`canvas:${canvasId}`).emit('cursor:update', {
    canvasId,
    userId: socket.data.userId,
    username: socket.data.username,
    color: socket.data.color || '#888888',
    x,
    y,
  });
}

// ==================== Selection Tracking ====================

function handleSelectionChange(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string; elementIds: string[] }
): void {
  const { canvasId, elementIds } = data;

  // Update user selection in store
  const users = canvasUsers.get(canvasId);
  if (users) {
    const user = users.get(socket.data.userId);
    if (user) {
      user.selectedElementIds = elementIds;
    }
  }

  // Broadcast to others
  socket.to(`canvas:${canvasId}`).emit('selection:update', {
    canvasId,
    userId: socket.data.userId,
    elementIds,
  });
}

// ==================== Typing Indicators ====================

function handleTypingStart(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string; elementId: string }
): void {
  const { canvasId, elementId } = data;

  // Update user typing state
  const users = canvasUsers.get(canvasId);
  if (users) {
    const user = users.get(socket.data.userId);
    if (user) {
      user.isTyping = true;
      user.typingElementId = elementId;
    }
  }

  // Broadcast to others
  socket.to(`canvas:${canvasId}`).emit('typing:indicator', {
    canvasId,
    userId: socket.data.userId,
    elementId,
    isTyping: true,
  });
}

function handleTypingStop(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string; elementId: string }
): void {
  const { canvasId, elementId } = data;

  // Update user typing state
  const users = canvasUsers.get(canvasId);
  if (users) {
    const user = users.get(socket.data.userId);
    if (user) {
      user.isTyping = false;
      user.typingElementId = undefined;
    }
  }

  // Broadcast to others
  socket.to(`canvas:${canvasId}`).emit('typing:indicator', {
    canvasId,
    userId: socket.data.userId,
    elementId,
    isTyping: false,
  });
}

// ==================== Operations (OT) ====================

function handleOperationApply(
  socket: CanvasSocket,
  io: Server,
  data: {
    canvasId: string;
    operationType: string;
    elementId?: string;
    data: Record<string, unknown>;
    baseVersion: number;
  }
): void {
  const { canvasId, operationType, elementId, baseVersion } = data;

  // Get or create operation buffer
  if (!operationBuffers.has(canvasId)) {
    operationBuffers.set(canvasId, { operations: [], version: 0 });
  }
  const buffer = operationBuffers.get(canvasId)!;

  // Create operation
  const operation: CanvasOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: operationType as CanvasOperation['type'],
    elementId,
    data: data.data,
    userId: socket.data.userId,
    timestamp: Date.now(),
    version: ++buffer.version,
  };

  // Simple OT: transform against concurrent operations
  const concurrentOps = buffer.operations.filter((op) => op.version > baseVersion);
  let transformedOp: CanvasOperation | null = operation;

  for (const concurrent of concurrentOps) {
    transformedOp = transformOperation(transformedOp, concurrent);
    if (!transformedOp) {
      // Operation was invalidated
      socket.emit('operation:ack', { operationId: operation.id, serverVersion: -1 });
      return;
    }
  }

  // Add to buffer
  buffer.operations.push(transformedOp);

  // Trim buffer if too large
  if (buffer.operations.length > MAX_OPERATION_BUFFER) {
    buffer.operations = buffer.operations.slice(-MAX_OPERATION_BUFFER);
  }

  // Acknowledge to sender
  socket.emit('operation:ack', {
    operationId: operation.id,
    serverVersion: transformedOp.version,
  });

  // Broadcast to others
  socket.to(`canvas:${canvasId}`).emit('operation:received', {
    canvasId,
    operation: transformedOp,
  });

  logger.debug(`Operation ${operation.id} applied to canvas ${canvasId}`);
}

/**
 * Transform operation against a concurrent operation.
 * Returns null if the operation should be discarded.
 */
function transformOperation(
  op: CanvasOperation,
  concurrent: CanvasOperation
): CanvasOperation | null {
  // Different elements - no transformation needed
  if (op.elementId !== concurrent.elementId) {
    return op;
  }

  // Same element - apply conflict resolution
  if (concurrent.type === 'DELETE') {
    // Element was deleted, discard operation
    return null;
  }

  // For position/property updates, last-write-wins
  return op;
}

// ==================== Comments ====================

function handleCommentAdd(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string; elementId?: string; content: string; parentId?: string }
): void {
  const { canvasId, elementId, content, parentId } = data;

  // Create comment (in real impl, save to DB via API call)
  const comment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    elementId,
    content,
    authorId: socket.data.userId,
    authorName: socket.data.username,
    parentId,
    createdAt: Date.now(),
  };

  // Broadcast to all in canvas (including sender)
  io.to(`canvas:${canvasId}`).emit('comment:added', { canvasId, comment });
}

function handleCommentResolve(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string; commentId: string }
): void {
  const { canvasId, commentId } = data;

  // Broadcast to all in canvas
  io.to(`canvas:${canvasId}`).emit('comment:resolved', {
    canvasId,
    commentId,
    resolvedBy: socket.data.userId,
  });
}

// ==================== Votes ====================

// In-memory vote store (in real impl, use DB)
const voteStore = new Map<string, Map<string, { userId: string; userName: string; value: string }>>();

function handleVoteCast(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string; elementId: string; value: string }
): void {
  const { canvasId, elementId, value } = data;
  const voteKey = `${canvasId}:${elementId}`;

  // Get or create vote map for element
  if (!voteStore.has(voteKey)) {
    voteStore.set(voteKey, new Map());
  }
  const votes = voteStore.get(voteKey)!;

  // Add/update vote
  votes.set(socket.data.userId, {
    userId: socket.data.userId,
    userName: socket.data.username,
    value,
  });

  // Broadcast updated votes
  io.to(`canvas:${canvasId}`).emit('vote:updated', {
    canvasId,
    elementId,
    votes: Array.from(votes.values()),
    totalVotes: votes.size,
  });
}

function handleVoteRemove(
  socket: CanvasSocket,
  io: Server,
  data: { canvasId: string; elementId: string }
): void {
  const { canvasId, elementId } = data;
  const voteKey = `${canvasId}:${elementId}`;

  const votes = voteStore.get(voteKey);
  if (votes) {
    votes.delete(socket.data.userId);

    // Broadcast updated votes
    io.to(`canvas:${canvasId}`).emit('vote:updated', {
      canvasId,
      elementId,
      votes: Array.from(votes.values()),
      totalVotes: votes.size,
    });
  }
}
