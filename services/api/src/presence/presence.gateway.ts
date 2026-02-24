/**
 * Presence Gateway
 * Socket.IO server for real-time presence tracking
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Logger } from 'tslog';
import { presenceStore } from './presence.store';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  PresenceUser,
  PresenceMetadata,
} from './interfaces/presence.interface';
import {
  CanvasClientToServerEvents,
  CanvasServerToClientEvents,
  CanvasSocketData,
} from './interfaces/canvas.interface';
import { setupCanvasHandlers } from './canvas.gateway';

// Combined event types for presence + canvas
type CombinedClientEvents = ClientToServerEvents & CanvasClientToServerEvents;
type CombinedServerEvents = ServerToClientEvents & CanvasServerToClientEvents;
type CombinedSocketData = SocketData & CanvasSocketData;

const logger = new Logger({ name: 'PresenceGateway' });

// User info from gateway X-USER header
interface GatewayUser {
  uuid: string;
  username: string;
  email?: string;
  anonymous: boolean;
  roles: string[];
}

type PresenceSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export class PresenceGateway {
  private io: Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      path: '/socket.io/presence',
      cors: {
        origin: '*', // Configure based on environment
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupHandlers();

    // Initialize canvas collaboration handlers
    setupCanvasHandlers(this.io as any);

    logger.info('Presence gateway initialized with canvas support');
  }

  private setupMiddleware(): void {
    // Authentication middleware - extract user from X-USER header
    this.io.use((socket: PresenceSocket, next: (err?: Error) => void) => {
      try {
        const xUserHeader = socket.handshake.headers['x-user'] as string;

        if (!xUserHeader) {
          // Allow anonymous connections
          socket.data = {
            userId: 'anonymous-' + socket.id,
            username: 'Anonymous',
            anonymous: true,
            roles: [],
          };
          return next();
        }

        const user: GatewayUser = JSON.parse(xUserHeader);

        if (!user.uuid || typeof user.anonymous !== 'boolean') {
          return next(new Error('Invalid user data'));
        }

        socket.data = {
          userId: user.uuid,
          username: user.username || 'User',
          email: user.email,
          anonymous: user.anonymous,
          roles: user.roles || [],
        };

        next();
      } catch (error) {
        logger.error('Auth middleware error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupHandlers(): void {
    this.io.on('connection', (socket: PresenceSocket) => {
      logger.info(`Socket connected: ${socket.id} (user: ${socket.data.userId})`);

      // Join application room
      socket.on('join:application', (data: { applicationId: string; metadata?: PresenceMetadata }) => {
        this.handleJoinApplication(socket, data.applicationId, data.metadata);
      });

      // Leave application room
      socket.on('leave:application', (data: { applicationId: string }) => {
        this.handleLeaveApplication(socket, data.applicationId);
      });

      // Update location (page/component)
      socket.on('update:location', (data: { applicationId: string; metadata: PresenceMetadata }) => {
        this.handleUpdateLocation(socket, data.applicationId, data.metadata);
      });

      // Handle disconnect
      socket.on('disconnect', (reason: string) => {
        this.handleDisconnect(socket, reason);
      });
    });
  }

  private handleJoinApplication(
    socket: PresenceSocket,
    applicationId: string,
    metadata?: PresenceMetadata
  ): void {
    // Leave previous application if any
    const currentAppId = socket.data.currentApplicationId;
    if (currentAppId && currentAppId !== applicationId) {
      this.handleLeaveApplication(socket, currentAppId);
    }

    // Create presence user
    const presenceUser: PresenceUser = {
      userId: socket.data.userId,
      username: socket.data.username,
      email: socket.data.email,
      socketId: socket.id,
      joinedAt: Date.now(),
      lastActivity: Date.now(),
      metadata: metadata || {},
    };

    // Add to store
    presenceStore.addUser(applicationId, presenceUser);
    socket.data.currentApplicationId = applicationId;

    // Join Socket.IO room
    socket.join(`app:${applicationId}`);

    // Send current users to the new user
    const currentUsers = presenceStore.getApplicationUsers(applicationId);
    socket.emit('presence:sync', { users: currentUsers, applicationId });

    // Broadcast to others that a new user joined
    socket.to(`app:${applicationId}`).emit('user:joined', {
      user: presenceUser,
      applicationId,
    });

    logger.info(`User ${socket.data.userId} joined app ${applicationId}`);
  }

  private handleLeaveApplication(socket: PresenceSocket, applicationId: string): void {
    const result = presenceStore.removeUser(socket.id);

    if (result) {
      // Leave Socket.IO room
      socket.leave(`app:${applicationId}`);

      // Broadcast to others
      this.io.to(`app:${applicationId}`).emit('user:left', {
        userId: socket.data.userId,
        socketId: socket.id,
        applicationId,
      });

      socket.data.currentApplicationId = undefined;
      logger.info(`User ${socket.data.userId} left app ${applicationId}`);
    }
  }

  private handleUpdateLocation(
    socket: PresenceSocket,
    applicationId: string,
    metadata: PresenceMetadata
  ): void {
    const updatedUser = presenceStore.updateUserLocation(socket.id, metadata);

    if (updatedUser) {
      // Broadcast update to all in the room (including sender for confirmation)
      this.io.to(`app:${applicationId}`).emit('user:updated', {
        user: updatedUser,
        applicationId,
      });

      logger.debug(`User ${socket.data.userId} updated location in app ${applicationId}`);
    }
  }

  private handleDisconnect(socket: PresenceSocket, reason: string): void {
    const result = presenceStore.removeUser(socket.id);

    if (result) {
      // Broadcast to others in the application
      this.io.to(`app:${result.applicationId}`).emit('user:left', {
        userId: result.user.userId,
        socketId: socket.id,
        applicationId: result.applicationId,
      });
    }

    logger.info(`Socket disconnected: ${socket.id} (reason: ${reason})`);
  }

  getIO(): Server {
    return this.io;
  }
}
