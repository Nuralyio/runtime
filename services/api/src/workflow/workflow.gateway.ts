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
            subscribedWorkflows: new Set(),
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
          subscribedWorkflows: new Set(),
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
        this.handleSubscribeExecution(socket, data.executionId);
      });

      socket.on('unsubscribe:execution', (data: { executionId: string }) => {
        this.handleUnsubscribeExecution(socket, data.executionId);
      });

      socket.on('subscribe:workflow', (data: { workflowId: string }) => {
        this.handleSubscribeWorkflow(socket, data.workflowId);
      });

      socket.on('unsubscribe:workflow', (data: { workflowId: string }) => {
        this.handleUnsubscribeWorkflow(socket, data.workflowId);
      });

      socket.on('disconnect', (reason: string) => {
        logger.info(`Workflow socket disconnected: ${socket.id} (reason: ${reason})`);
      });
    });
  }

  private handleSubscribeExecution(socket: WorkflowSocket, executionId: string): void {
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

  private handleUnsubscribeExecution(socket: WorkflowSocket, executionId: string): void {
    const roomName = `execution:${executionId}`;
    socket.leave(roomName);
    socket.data.subscribedExecutions.delete(executionId);
    logger.info(`User ${socket.data.userId} unsubscribed from execution ${executionId}`);
  }

  private handleSubscribeWorkflow(socket: WorkflowSocket, workflowId: string): void {
    const roomName = `workflow:${workflowId}`;
    socket.join(roomName);
    socket.data.subscribedWorkflows.add(workflowId);
    logger.info(`User ${socket.data.userId} subscribed to workflow ${workflowId}`);
  }

  private handleUnsubscribeWorkflow(socket: WorkflowSocket, workflowId: string): void {
    const roomName = `workflow:${workflowId}`;
    socket.leave(roomName);
    socket.data.subscribedWorkflows.delete(workflowId);
    logger.info(`User ${socket.data.userId} unsubscribed from workflow ${workflowId}`);
  }

  private handleWorkflowEvent(event: WorkflowEvent): void {
    logger.info(`Handling workflow event: ${event.type} for execution ${event.executionId}`);

    const executionRoomName = `execution:${event.executionId}`;
    const workflowRoomName = `workflow:${event.workflowId}`;
    const eventName = this.getSocketEventName(event.type);

    if (eventName) {
      // Check how many sockets are in each room
      const execRoom = this.io.sockets.adapter.rooms.get(executionRoomName);
      const wfRoom = this.io.sockets.adapter.rooms.get(workflowRoomName);
      const execRoomSize = execRoom ? execRoom.size : 0;
      const wfRoomSize = wfRoom ? wfRoom.size : 0;
      logger.info(`Broadcasting ${eventName} to execution room (${execRoomSize} clients) and workflow room (${wfRoomSize} clients)`);

      // Broadcast to both execution-specific and workflow-level subscribers
      this.io.to(executionRoomName).to(workflowRoomName).emit(eventName, event);
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
      CHAT_MESSAGE: 'chat:message',
      // Agent activity events
      LLM_CALL_STARTED: 'execution:llm-call-started',
      LLM_CALL_COMPLETED: 'execution:llm-call-completed',
      TOOL_CALL_STARTED: 'execution:tool-call-started',
      TOOL_CALL_COMPLETED: 'execution:tool-call-completed',
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
