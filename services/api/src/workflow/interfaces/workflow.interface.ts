export type WorkflowEventType =
  | 'NODE_STARTED'
  | 'NODE_EXECUTED'
  | 'NODE_FAILED'
  | 'EXECUTION_QUEUED'
  | 'EXECUTION_STARTED'
  | 'EXECUTION_COMPLETED'
  | 'EXECUTION_FAILED'
  | 'EXECUTION_CANCELLED'
  | 'CHAT_MESSAGE';

export interface WorkflowEvent {
  type: WorkflowEventType;
  executionId: string;
  workflowId: string;
  nodeId?: string;
  nodeName?: string;
  timestamp: string;
  data?: any;
}

export interface ClientToServerEvents {
  'subscribe:execution': (data: { executionId: string }) => void;
  'unsubscribe:execution': (data: { executionId: string }) => void;
  'subscribe:workflow': (data: { workflowId: string }) => void;
  'unsubscribe:workflow': (data: { workflowId: string }) => void;
}

export interface ServerToClientEvents {
  'execution:started': (event: WorkflowEvent) => void;
  'execution:completed': (event: WorkflowEvent) => void;
  'execution:failed': (event: WorkflowEvent) => void;
  'execution:cancelled': (event: WorkflowEvent) => void;
  'execution:node-started': (event: WorkflowEvent) => void;
  'execution:node-completed': (event: WorkflowEvent) => void;
  'execution:node-failed': (event: WorkflowEvent) => void;
  'chat:message': (event: WorkflowEvent) => void;
}

export interface SocketData {
  userId: string;
  username: string;
  email?: string;
  anonymous: boolean;
  roles: string[];
  subscribedExecutions: Set<string>;
  subscribedWorkflows: Set<string>;
}
