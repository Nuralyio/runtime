import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { Logger } from 'tslog';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  SocketData,
  WorkflowEvent,
} from './interfaces/workflow.interface';
import { WorkflowConsumer } from './workflow.consumer';

const logger = new Logger({ name: 'WorkflowGateway' });

interface GatewayUser {
  uuid: string;
  username: string;
  email?: string;
  anonymous: boolean;
  roles: string[];
}

type WorkflowSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export class WorkflowGateway {
  private io: Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
  private consumer: WorkflowConsumer;

  constructor(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      path: '/socket.io/workflow',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    });

    this.consumer = new WorkflowConsumer();
    this.consumer.setEventHandler(this.handleWorkflowEvent.bind(this));

    this.setupMiddleware();
    this.setupHandlers();

    logger.info('Workflow gateway initialized');
  }

  async start(): Promise<void> {
    await this.consumer.connect();
  }

  async stop(): Promise<void> {
    await this.consumer.disconnect();
  }

  private setupMiddleware(): void {
    this.io.use((socket: WorkflowSocket, next: (err?: Error) => void) => {
      try {
        const xUserHeader = socket.handshake.headers['x-user'] as string;

        if (!xUserHeader) {
          socket.data = {
            userId: 'anonymous-' + socket.id,
            username: 'Anonymous',
            anonymous: true,
            roles: [],
            subscribedExecutions: new Set(),
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
          subscribedExecutions: new Set(),
        };

        next();
      } catch (error) {
        logger.error('Auth middleware error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupHandlers(): void {
    this.io.on('connection', (socket: WorkflowSocket) => {
      logger.info(`Workflow socket connected: ${socket.id} (user: ${socket.data.userId})`);

      socket.on('subscribe:execution', (data: { executionId: string }) => {
        this.handleSubscribe(socket, data.executionId);
      });

      socket.on('unsubscribe:execution', (data: { executionId: string }) => {
        this.handleUnsubscribe(socket, data.executionId);
      });

      socket.on('disconnect', (reason: string) => {
        logger.info(`Workflow socket disconnected: ${socket.id} (reason: ${reason})`);
      });
    });
  }

  private handleSubscribe(socket: WorkflowSocket, executionId: string): void {
    const roomName = `execution:${executionId}`;
    socket.join(roomName);
    socket.data.subscribedExecutions.add(executionId);
    logger.info(`User ${socket.data.userId} subscribed to execution ${executionId}`);

    // Send acknowledgment that subscription is active
    socket.emit('execution:started', {
      type: 'EXECUTION_QUEUED',
      executionId,
      workflowId: '',
      timestamp: new Date().toISOString(),
      data: { status: 'SUBSCRIBED', message: 'Waiting for execution events...' }
    });
  }

  private handleUnsubscribe(socket: WorkflowSocket, executionId: string): void {
    const roomName = `execution:${executionId}`;
    socket.leave(roomName);
    socket.data.subscribedExecutions.delete(executionId);
    logger.info(`User ${socket.data.userId} unsubscribed from execution ${executionId}`);
  }

  private handleWorkflowEvent(event: WorkflowEvent): void {
    logger.info(`Handling workflow event: ${event.type} for execution ${event.executionId}`);

    const roomName = `execution:${event.executionId}`;
    const eventName = this.getSocketEventName(event.type);

    if (eventName) {
      // Check how many sockets are in the room
      const room = this.io.sockets.adapter.rooms.get(roomName);
      const roomSize = room ? room.size : 0;
      logger.info(`Broadcasting ${eventName} to room ${roomName} (${roomSize} clients)`);

      this.io.to(roomName).emit(eventName, event);
    } else {
      logger.warn(`No socket event mapping for ${event.type}`);
    }
  }

  private getSocketEventName(
    eventType: string
  ): keyof ServerToClientEvents | null {
    const eventMap: Record<string, keyof ServerToClientEvents> = {
      EXECUTION_QUEUED: 'execution:started',  // Map queued to started for UI
      EXECUTION_STARTED: 'execution:started',
      EXECUTION_COMPLETED: 'execution:completed',
      EXECUTION_FAILED: 'execution:failed',
      EXECUTION_CANCELLED: 'execution:cancelled',
      NODE_STARTED: 'execution:node-started',
      NODE_EXECUTED: 'execution:node-completed',
      NODE_FAILED: 'execution:node-failed',
    };

    const result = eventMap[eventType] || null;
    if (!result) {
      logger.warn(`Unknown event type: ${eventType}`);
    }
    return result;
  }

  getIO(): Server {
    return this.io;
  }
}
