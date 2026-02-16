/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

// Import and re-export DataOperation from data-node
import { DataOperation } from './data-node/data-node.types.js';
export { DataOperation };

/**
 * Node types for standard workflow nodes
 */
export enum WorkflowNodeType {
  START = 'START',
  END = 'END',
  HTTP_START = 'HTTP_START',
  HTTP_END = 'HTTP_END',
  CHAT_START = 'CHAT_START',
  CHAT_OUTPUT = 'CHAT_OUTPUT',
  FUNCTION = 'FUNCTION',
  HTTP = 'HTTP',
  CONDITION = 'CONDITION',
  DELAY = 'DELAY',
  PARALLEL = 'PARALLEL',
  LOOP = 'LOOP',
  TRANSFORM = 'TRANSFORM',
  SUB_WORKFLOW = 'SUB_WORKFLOW',
  EMAIL = 'EMAIL',
  NOTIFICATION = 'NOTIFICATION',
  DATABASE = 'DATABASE',
  VARIABLE = 'VARIABLE',
  CHATBOT = 'CHATBOT',
  DEBUG = 'DEBUG',
  LLM = 'LLM',
  OCR = 'OCR',
  // Web nodes
  WEB_SEARCH = 'WEB_SEARCH',
  WEB_CRAWL = 'WEB_CRAWL',
  // Document generation
  DOCUMENT_GENERATOR = 'DOCUMENT_GENERATOR',
  // Storage nodes
  FILE_STORAGE = 'FILE_STORAGE',
  // RAG nodes
  EMBEDDING = 'EMBEDDING',
  DOCUMENT_LOADER = 'DOCUMENT_LOADER',
  TEXT_SPLITTER = 'TEXT_SPLITTER',
  VECTOR_WRITE = 'VECTOR_WRITE',
  VECTOR_SEARCH = 'VECTOR_SEARCH',
  CONTEXT_BUILDER = 'CONTEXT_BUILDER',
  // Safety nodes
  GUARDRAIL = 'GUARDRAIL',
  // Slack integration nodes
  SLACK_SEND_MESSAGE = 'SLACK_SEND_MESSAGE',
  SLACK_GET_CHANNEL_INFO = 'SLACK_GET_CHANNEL_INFO',
  SLACK_LIST_CHANNELS = 'SLACK_LIST_CHANNELS',
  SLACK_ADD_REACTION = 'SLACK_ADD_REACTION',
  SLACK_UPLOAD_FILE = 'SLACK_UPLOAD_FILE',
  // RAG nodes (continued)
  RERANKER = 'RERANKER',
  // Telegram integration nodes
  TELEGRAM_SEND = 'TELEGRAM_SEND',
  // Persistent trigger nodes
  TELEGRAM_BOT = 'TELEGRAM_BOT',
  SLACK_SOCKET = 'SLACK_SOCKET',
  DISCORD_BOT = 'DISCORD_BOT',
  WHATSAPP_WEBHOOK = 'WHATSAPP_WEBHOOK',
  CUSTOM_WEBSOCKET = 'CUSTOM_WEBSOCKET',
  // Display nodes
  UI_TABLE = 'UI_TABLE',
  // Annotation nodes
  NOTE = 'NOTE',
  FRAME = 'FRAME',
}

/**
 * Node types for agent-based workflows
 */
export enum AgentNodeType {
  AGENT = 'AGENT',
  TOOL = 'TOOL',
  MEMORY = 'MEMORY',
  CONTEXT_MEMORY = 'CONTEXT_MEMORY',
  PROMPT = 'PROMPT',
  LLM = 'AGENT_LLM',
  RETRIEVER = 'RETRIEVER',
  CHAIN = 'CHAIN',
  ROUTER = 'ROUTER',
  HUMAN_INPUT = 'HUMAN_INPUT',
  OUTPUT_PARSER = 'OUTPUT_PARSER',
}

/**
 * Node types for database designer mode
 */
export enum DbDesignerNodeType {
  TABLE = 'DB_TABLE',
  VIEW = 'DB_VIEW',
  INDEX = 'DB_INDEX',
  RELATIONSHIP = 'DB_RELATIONSHIP',
  CONSTRAINT = 'DB_CONSTRAINT',
  QUERY = 'DB_QUERY',
}

/**
 * Node types for whiteboard mode
 */
export enum WhiteboardNodeType {
  STICKY_NOTE = 'WB_STICKY_NOTE',
  SHAPE_RECTANGLE = 'WB_SHAPE_RECTANGLE',
  SHAPE_CIRCLE = 'WB_SHAPE_CIRCLE',
  SHAPE_DIAMOND = 'WB_SHAPE_DIAMOND',
  SHAPE_TRIANGLE = 'WB_SHAPE_TRIANGLE',
  SHAPE_ARROW = 'WB_SHAPE_ARROW',
  SHAPE_LINE = 'WB_SHAPE_LINE',
  SHAPE_STAR = 'WB_SHAPE_STAR',
  SHAPE_HEXAGON = 'WB_SHAPE_HEXAGON',
  TEXT_BLOCK = 'WB_TEXT_BLOCK',
  IMAGE = 'WB_IMAGE',
  DRAWING = 'WB_DRAWING',
  FRAME = 'WB_FRAME',
  VOTING = 'WB_VOTING',
  MERMAID = 'WB_MERMAID',
  ANCHOR = 'WB_ANCHOR',
}

/**
 * Canvas type to differentiate between canvas modes
 */
export enum CanvasType {
  WORKFLOW = 'WORKFLOW',
  DATABASE = 'DATABASE',
  WHITEBOARD = 'WHITEBOARD',
}

/**
 * Combined node type union
 */
export type NodeType = WorkflowNodeType | AgentNodeType | DbDesignerNodeType | WhiteboardNodeType;

/**
 * Connection state for long-running/persistent triggers (Telegram, Slack, etc.)
 */
export enum TriggerConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  PAUSED = 'PAUSED',
  HANDOFF_PENDING = 'HANDOFF_PENDING',
  ERROR = 'ERROR',
}

/**
 * Execution status for nodes and workflows
 */
export enum ExecutionStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
  WAITING = 'WAITING',
}

/**
 * Port types for node connections
 */
export enum PortType {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
  CONFIG = 'CONFIG',
  CONDITIONAL_TRUE = 'CONDITIONAL_TRUE',
  CONDITIONAL_FALSE = 'CONDITIONAL_FALSE',
  CONDITIONAL_DEFAULT = 'CONDITIONAL_DEFAULT',
  LOOP_ITEM = 'LOOP_ITEM',
  LOOP_DONE = 'LOOP_DONE',
  PARALLEL_BRANCH = 'PARALLEL_BRANCH',
  ERROR = 'ERROR',
}

/**
 * Port definition for node input/output
 */
export interface NodePort {
  id: string;
  type: PortType;
  label?: string;
  dataType?: string;
  multiple?: boolean;
}

/**
 * Visual position for nodes
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Filter condition for data queries
 */
export interface DataFilterCondition {
  field: string;
  op: string;
  value?: unknown;
}

/**
 * Filter group with AND/OR logic
 */
export interface DataFilterGroup {
  and?: (DataFilterCondition | DataFilterGroup)[];
  or?: (DataFilterCondition | DataFilterGroup)[];
}

/**
 * Sort order for data queries
 */
export interface DataSortOrder {
  field: string;
  dir: 'ASC' | 'DESC';
}

/**
 * Node configuration - varies by node type
 */
export interface NodeConfiguration {
  [key: string]: unknown;
  // Function node
  functionId?: string;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
  // HTTP node
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  // HTTP Start node (HTTP trigger)
  httpPath?: string;
  httpMethods?: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>;
  httpAuth?: 'none' | 'api_key' | 'bearer' | 'basic';
  httpCors?: boolean;
  httpRateLimit?: number;
  httpRequestSchema?: Record<string, unknown>;
  // HTTP End node (HTTP response)
  httpStatusCode?: number;
  httpResponseHeaders?: Record<string, string>;
  httpResponseBody?: string;
  httpContentType?: string;
  // Condition node
  expression?: string;
  language?: 'javascript' | 'jsonata' | 'fr';
  // Delay node
  duration?: number;
  unit?: 'milliseconds' | 'seconds' | 'minutes' | 'hours';
  // Loop node
  iteratorVariable?: string;
  arrayExpression?: string;
  maxIterations?: number;
  // Transform node
  transformExpression?: string;
  // Agent node
  agentId?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  // LLM node
  provider?: 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'local' | 'google';
  modelName?: string;
  apiUrlPath?: string;  // KV path for custom API URL (for Ollama)
  // Memory node (context memory for agents/LLM)
  cutoffMode?: 'message' | 'token';
  maxMessages?: number;
  // maxTokens is shared with Agent/LLM node above
  conversationIdExpression?: string;
  // Tool node
  toolName?: string;
  toolConfig?: Record<string, unknown>;
  // Database/Data node
  operation?: DataOperation;
  dataSource?: string | null;
  entity?: string | null;
  filter?: DataFilterGroup | null;
  fields?: Record<string, string | number | boolean | null>;
  select?: string[];
  orderBy?: DataSortOrder[];
  limit?: number | null;
  offset?: number | null;
  outputVariable?: string;
  // Variable node
  variableOperation?: 'set' | 'get';
  variableName?: string;
  value?: unknown;
  // DB Designer - Table node
  tableName?: string;
  columns?: Array<{
    name: string;
    type: string;
    nullable?: boolean;
    defaultValue?: unknown;
  }>;
  primaryKey?: string;
  // DB Designer - View node
  viewName?: string;
  query?: string;
  materialized?: boolean;
  // DB Designer - Index node
  indexName?: string;
  indexColumns?: string[];
  unique?: boolean;
  indexType?: 'BTREE' | 'HASH' | 'GIN' | 'GIST';
  // DB Designer - Relationship node
  relationshipType?: 'ONE_TO_ONE' | 'ONE_TO_MANY' | 'MANY_TO_MANY';
  sourceColumn?: string;
  targetColumn?: string;
  onDelete?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
  onUpdate?: 'CASCADE' | 'SET_NULL' | 'RESTRICT' | 'NO_ACTION';
  // DB Designer - Constraint node
  constraintName?: string;
  constraintType?: 'UNIQUE' | 'CHECK' | 'FOREIGN_KEY';
  constraintColumns?: string[];
  checkExpression?: string;
  // DB Designer - Query node
  queryName?: string;
  queryText?: string;
  parameters?: Array<{
    name: string;
    type: string;
    defaultValue?: unknown;
  }>;
  // OCR node
  imageSource?: 'base64' | 'url' | 'file' | 'variable';
  imageVariable?: string;
  ocrLanguage?: string;
  detectLayout?: boolean;
  asyncMode?: boolean;
  // Chatbot trigger - file upload
  enableFileUpload?: boolean;
  maxFileSize?: number;
  maxFiles?: number;
  allowImages?: boolean;
  allowDocuments?: boolean;
  allowText?: boolean;
  allowAudio?: boolean;
  allowVideo?: boolean;
  // Note node
  noteContent?: string;
  noteBackgroundColor?: string;
  noteTextColor?: string;
  noteFontSize?: 'small' | 'medium' | 'large';
  noteShowBorder?: boolean;
  // Frame node
  frameLabel?: string;
  frameWidth?: number;
  frameHeight?: number;
  frameBackgroundColor?: string;
  frameBorderColor?: string;
  frameLabelPosition?: 'top-left' | 'top-center' | 'top-right';
  frameLabelPlacement?: 'inside' | 'outside';
  frameShowLabel?: boolean;
  frameCollapsed?: boolean;
  /** Stored dimensions when collapsed (for restore) */
  _frameExpandedWidth?: number;
  _frameExpandedHeight?: number;
  // Slack nodes
  slackMethod?: 'webhook' | 'api';
  botToken?: string;
  channel?: string;
  text?: string;
  webhookUrl?: string;
  blocks?: unknown;
  threadTs?: string;
  unfurlLinks?: boolean;
  unfurlMedia?: boolean;
  includeLocale?: boolean;
  includeNumMembers?: boolean;
  types?: string;
  excludeArchived?: boolean;
  cursor?: string;
  teamId?: string;
  timestamp?: string;
  name?: string;
  channels?: string;
  filename?: string;
  content?: string;
  fileBase64?: string;
  filetype?: string;
  title?: string;
  initialComment?: string;
  // Reranker node
  topK?: number;
  threshold?: number;
  // Context Memory node
  memoryType?: 'buffer' | 'semantic' | 'hybrid';
  // UI Table node
  tableColumns?: Array<{ name: string; key: string; width?: number | string; filterable?: boolean }>;
  dataExpression?: string;
  tablePageSize?: number;
  tableEnableFilter?: boolean;
  tableEnableSort?: boolean;
  tableFixedHeader?: boolean;
  tableSize?: 'small' | 'normal' | 'large';
  tableEmptyText?: string;
  tableWidth?: number;
  tableHeight?: number;
  // Anchor / onClick action
  anchorLabel?: string;
  onClickAction?: 'none' | 'pan-to-anchor';
  onClickTargetAnchorId?: string;
}

/**
 * Workflow node definition
 */
export interface WorkflowNode {
  id: string;
  name: string;
  type: NodeType;
  position: Position;
  configuration: NodeConfiguration;
  ports: {
    inputs: NodePort[];
    configs?: NodePort[];
    outputs: NodePort[];
  };
  metadata?: {
    description?: string;
    icon?: string;
    color?: string;
    maxRetries?: number;
    retryDelayMs?: number;
    timeoutMs?: number;
  };
  status?: ExecutionStatus;
  selected?: boolean;
  error?: string;
  /** Agent activity indicator (LLM calls, tool calls) */
  agentActivity?: {
    type: 'llm' | 'tool';
    name?: string;
    active: boolean;
  };
  /** For FRAME nodes: IDs of nodes visually contained within this frame */
  containedNodeIds?: string[];
  /** For regular nodes: ID of the frame that contains this node (if any) */
  parentFrameId?: string | null;
  /** Trigger connection status for persistent trigger nodes (Telegram, Slack, etc.) */
  triggerStatus?: {
    triggerId: string;
    connectionState: TriggerConnectionState;
    health?: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
    messagesReceived?: number;
    lastMessageAt?: string;
    stateReason?: string;
  };
}

/**
 * Edge/connection between nodes
 */
export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  label?: string;
  condition?: string;
  priority?: number;
  animated?: boolean;
  selected?: boolean;
  status?: ExecutionStatus;
}

/**
 * Complete workflow definition
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  applicationId?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, unknown>;
  viewport?: CanvasViewport;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Canvas viewport state
 */
export interface CanvasViewport {
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Canvas interaction modes
 */
export enum CanvasMode {
  SELECT = 'SELECT',
  PAN = 'PAN',
  CONNECT = 'CONNECT',
  ADD_NODE = 'ADD_NODE',
}

/**
 * Node category for grouping in palette
 */
export interface NodeCategory {
  id: string;
  name: string;
  icon?: string;
  nodeTypes: NodeType[];
  canvasType?: CanvasType;
}

/**
 * Output variable schema for a node
 * Describes what variables are available from a node's output
 */
export interface OutputVariable {
  name: string;
  path: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';
  description: string;
  children?: OutputVariable[];
}

/**
 * Node template for creating new nodes
 */
export interface NodeTemplate {
  type: NodeType;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  defaultConfig: NodeConfiguration;
  defaultPorts: {
    inputs: NodePort[];
    configs?: NodePort[];
    outputs: NodePort[];
  };
  /** Output schema describing available variables from this node */
  outputSchema?: OutputVariable[];
}

/**
 * Canvas events
 */
export interface CanvasEvents {
  'node-selected': { node: WorkflowNode };
  'node-deselected': { node: WorkflowNode };
  'node-moved': { node: WorkflowNode; position: Position };
  'node-added': { node: WorkflowNode };
  'node-removed': { node: WorkflowNode };
  'node-configured': { node: WorkflowNode; config: NodeConfiguration };
  'edge-created': { edge: WorkflowEdge };
  'edge-removed': { edge: WorkflowEdge };
  'edge-selected': { edge: WorkflowEdge };
  'viewport-changed': { viewport: CanvasViewport };
  'workflow-changed': { workflow: Workflow };
  'connection-started': { nodeId: string; portId: string };
  'connection-cancelled': {};
}

/**
 * Default node colors by type
 */
export const NODE_COLORS: Record<NodeType, string> = {
  // Workflow nodes
  [WorkflowNodeType.START]: '#22c55e',
  [WorkflowNodeType.END]: '#ef4444',
  [WorkflowNodeType.HTTP_START]: '#059669',
  [WorkflowNodeType.HTTP_END]: '#dc2626',
  [WorkflowNodeType.CHAT_START]: '#0ea5e9',
  [WorkflowNodeType.CHAT_OUTPUT]: '#06b6d4',
  [WorkflowNodeType.FUNCTION]: '#3b82f6',
  [WorkflowNodeType.HTTP]: '#8b5cf6',
  [WorkflowNodeType.CONDITION]: '#f59e0b',
  [WorkflowNodeType.DELAY]: '#6b7280',
  [WorkflowNodeType.PARALLEL]: '#06b6d4',
  [WorkflowNodeType.LOOP]: '#ec4899',
  [WorkflowNodeType.TRANSFORM]: '#14b8a6',
  [WorkflowNodeType.SUB_WORKFLOW]: '#6366f1',
  [WorkflowNodeType.EMAIL]: '#f97316',
  [WorkflowNodeType.NOTIFICATION]: '#84cc16',
  [WorkflowNodeType.DATABASE]: '#a855f7',
  [WorkflowNodeType.VARIABLE]: '#64748b',
  [WorkflowNodeType.CHATBOT]: '#0ea5e9',
  [WorkflowNodeType.DEBUG]: '#f97316',
  [WorkflowNodeType.LLM]: '#22d3ee',
  [WorkflowNodeType.OCR]: '#0d9488',
  // Web nodes
  [WorkflowNodeType.WEB_SEARCH]: '#3b82f6',
  [WorkflowNodeType.WEB_CRAWL]: '#6366f1',
  // Document generation
  [WorkflowNodeType.DOCUMENT_GENERATOR]: '#0284c7',
  // Storage nodes
  [WorkflowNodeType.FILE_STORAGE]: '#f59e0b',
  // RAG nodes
  [WorkflowNodeType.EMBEDDING]: '#8b5cf6',
  [WorkflowNodeType.DOCUMENT_LOADER]: '#ec4899',
  [WorkflowNodeType.TEXT_SPLITTER]: '#14b8a6',
  [WorkflowNodeType.VECTOR_WRITE]: '#10b981',
  [WorkflowNodeType.VECTOR_SEARCH]: '#06b6d4',
  [WorkflowNodeType.CONTEXT_BUILDER]: '#a855f7',
  // Safety nodes
  [WorkflowNodeType.GUARDRAIL]: '#ef4444',
  // Slack integration nodes
  [WorkflowNodeType.SLACK_SEND_MESSAGE]: '#4A154B',
  [WorkflowNodeType.SLACK_GET_CHANNEL_INFO]: '#4A154B',
  [WorkflowNodeType.SLACK_LIST_CHANNELS]: '#4A154B',
  [WorkflowNodeType.SLACK_ADD_REACTION]: '#4A154B',
  [WorkflowNodeType.SLACK_UPLOAD_FILE]: '#4A154B',
  // RAG nodes (continued)
  [WorkflowNodeType.RERANKER]: '#d946ef',
  // Telegram integration nodes
  [WorkflowNodeType.TELEGRAM_SEND]: '#0088cc',
  // Persistent trigger nodes
  [WorkflowNodeType.TELEGRAM_BOT]: '#0088cc',
  [WorkflowNodeType.SLACK_SOCKET]: '#4A154B',
  [WorkflowNodeType.DISCORD_BOT]: '#5865F2',
  [WorkflowNodeType.WHATSAPP_WEBHOOK]: '#25D366',
  [WorkflowNodeType.CUSTOM_WEBSOCKET]: '#6366f1',
  // Display nodes
  [WorkflowNodeType.UI_TABLE]: '#0891b2',
  // Annotation nodes
  [WorkflowNodeType.NOTE]: '#fef08a',
  [WorkflowNodeType.FRAME]: '#6366f1',
  // Agent nodes
  [AgentNodeType.AGENT]: '#10b981',
  [AgentNodeType.TOOL]: '#0ea5e9',
  [AgentNodeType.MEMORY]: '#d946ef',
  [AgentNodeType.CONTEXT_MEMORY]: '#c026d3',
  [AgentNodeType.PROMPT]: '#f472b6',
  [AgentNodeType.LLM]: '#22d3ee',
  [AgentNodeType.RETRIEVER]: '#a78bfa',
  [AgentNodeType.CHAIN]: '#fbbf24',
  [AgentNodeType.ROUTER]: '#fb923c',
  [AgentNodeType.HUMAN_INPUT]: '#4ade80',
  [AgentNodeType.OUTPUT_PARSER]: '#2dd4bf',
  // DB Designer nodes
  [DbDesignerNodeType.TABLE]: '#64748b', // Soft slate for tables
  [DbDesignerNodeType.VIEW]: '#a855f7', // Purple for views
  [DbDesignerNodeType.INDEX]: '#f59e0b', // Amber for indexes
  [DbDesignerNodeType.RELATIONSHIP]: '#ec4899', // Pink for relationships
  [DbDesignerNodeType.CONSTRAINT]: '#ef4444', // Red for constraints
  [DbDesignerNodeType.QUERY]: '#06b6d4', // Cyan for queries
  // Whiteboard nodes
  [WhiteboardNodeType.STICKY_NOTE]: '#fef08a',
  [WhiteboardNodeType.SHAPE_RECTANGLE]: '#3b82f6',
  [WhiteboardNodeType.SHAPE_CIRCLE]: '#8b5cf6',
  [WhiteboardNodeType.SHAPE_DIAMOND]: '#f59e0b',
  [WhiteboardNodeType.SHAPE_TRIANGLE]: '#22c55e',
  [WhiteboardNodeType.SHAPE_ARROW]: '#6b7280',
  [WhiteboardNodeType.SHAPE_LINE]: '#6b7280',
  [WhiteboardNodeType.SHAPE_STAR]: '#f97316',
  [WhiteboardNodeType.SHAPE_HEXAGON]: '#ec4899',
  [WhiteboardNodeType.TEXT_BLOCK]: '#111827',
  [WhiteboardNodeType.IMAGE]: '#06b6d4',
  [WhiteboardNodeType.DRAWING]: '#14b8a6',
  [WhiteboardNodeType.FRAME]: '#6366f1',
  [WhiteboardNodeType.VOTING]: '#ef4444',
  [WhiteboardNodeType.MERMAID]: '#8b5cf6',
  [WhiteboardNodeType.ANCHOR]: '#f59e0b',
};

/**
 * Default node icons by type
 */
export const NODE_ICONS: Record<NodeType, string> = {
  // Workflow nodes
  [WorkflowNodeType.START]: 'play',
  [WorkflowNodeType.END]: 'stop',
  [WorkflowNodeType.HTTP_START]: 'download',
  [WorkflowNodeType.HTTP_END]: 'upload',
  [WorkflowNodeType.CHAT_START]: 'message-circle',
  [WorkflowNodeType.CHAT_OUTPUT]: 'message-square',
  [WorkflowNodeType.FUNCTION]: 'code',
  [WorkflowNodeType.HTTP]: 'globe',
  [WorkflowNodeType.CONDITION]: 'git-branch',
  [WorkflowNodeType.DELAY]: 'clock',
  [WorkflowNodeType.PARALLEL]: 'git-merge',
  [WorkflowNodeType.LOOP]: 'repeat',
  [WorkflowNodeType.TRANSFORM]: 'shuffle',
  [WorkflowNodeType.SUB_WORKFLOW]: 'layers',
  [WorkflowNodeType.EMAIL]: 'mail',
  [WorkflowNodeType.NOTIFICATION]: 'bell',
  [WorkflowNodeType.DATABASE]: 'database',
  [WorkflowNodeType.VARIABLE]: 'box',
  [WorkflowNodeType.CHATBOT]: 'message-circle',
  [WorkflowNodeType.DEBUG]: 'bug',
  [WorkflowNodeType.LLM]: 'brain',
  [WorkflowNodeType.OCR]: 'scan',
  // Web nodes
  [WorkflowNodeType.WEB_SEARCH]: 'search',
  [WorkflowNodeType.WEB_CRAWL]: 'globe',
  // Document generation
  [WorkflowNodeType.DOCUMENT_GENERATOR]: 'file-text',
  // Storage nodes
  [WorkflowNodeType.FILE_STORAGE]: 'hard-drive',
  // RAG nodes
  [WorkflowNodeType.EMBEDDING]: 'hash',
  [WorkflowNodeType.DOCUMENT_LOADER]: 'file-text',
  [WorkflowNodeType.TEXT_SPLITTER]: 'scissors',
  [WorkflowNodeType.VECTOR_WRITE]: 'database',
  [WorkflowNodeType.VECTOR_SEARCH]: 'search',
  [WorkflowNodeType.CONTEXT_BUILDER]: 'layers',
  // Safety nodes
  [WorkflowNodeType.GUARDRAIL]: 'shield',
  // Slack integration nodes
  [WorkflowNodeType.SLACK_SEND_MESSAGE]: 'message-square',
  [WorkflowNodeType.SLACK_GET_CHANNEL_INFO]: 'hash',
  [WorkflowNodeType.SLACK_LIST_CHANNELS]: 'list',
  [WorkflowNodeType.SLACK_ADD_REACTION]: 'smile-plus',
  [WorkflowNodeType.SLACK_UPLOAD_FILE]: 'upload',
  // RAG nodes (continued)
  [WorkflowNodeType.RERANKER]: 'arrow-up-down',
  // Telegram integration nodes
  [WorkflowNodeType.TELEGRAM_SEND]: 'send',
  // Persistent trigger nodes
  [WorkflowNodeType.TELEGRAM_BOT]: 'send',
  [WorkflowNodeType.SLACK_SOCKET]: 'message-square',
  [WorkflowNodeType.DISCORD_BOT]: 'gamepad-2',
  [WorkflowNodeType.WHATSAPP_WEBHOOK]: 'phone',
  [WorkflowNodeType.CUSTOM_WEBSOCKET]: 'radio',
  // Display nodes
  [WorkflowNodeType.UI_TABLE]: 'table',
  // Annotation nodes
  [WorkflowNodeType.NOTE]: 'sticky-note',
  [WorkflowNodeType.FRAME]: 'square',
  // Agent nodes
  [AgentNodeType.AGENT]: 'cpu',
  [AgentNodeType.TOOL]: 'tool',
  [AgentNodeType.MEMORY]: 'hard-drive',
  [AgentNodeType.CONTEXT_MEMORY]: 'brain',
  [AgentNodeType.PROMPT]: 'message-square',
  [AgentNodeType.LLM]: 'brain',
  [AgentNodeType.RETRIEVER]: 'search',
  [AgentNodeType.CHAIN]: 'link',
  [AgentNodeType.ROUTER]: 'git-pull-request',
  [AgentNodeType.HUMAN_INPUT]: 'user',
  [AgentNodeType.OUTPUT_PARSER]: 'file-text',
  // DB Designer nodes
  [DbDesignerNodeType.TABLE]: 'table',
  [DbDesignerNodeType.VIEW]: 'eye',
  [DbDesignerNodeType.INDEX]: 'list',
  [DbDesignerNodeType.RELATIONSHIP]: 'git-merge',
  [DbDesignerNodeType.CONSTRAINT]: 'shield',
  [DbDesignerNodeType.QUERY]: 'terminal',
  // Whiteboard nodes
  [WhiteboardNodeType.STICKY_NOTE]: 'sticky-note',
  [WhiteboardNodeType.SHAPE_RECTANGLE]: 'square',
  [WhiteboardNodeType.SHAPE_CIRCLE]: 'circle',
  [WhiteboardNodeType.SHAPE_DIAMOND]: 'diamond',
  [WhiteboardNodeType.SHAPE_TRIANGLE]: 'triangle',
  [WhiteboardNodeType.SHAPE_ARROW]: 'arrow-right',
  [WhiteboardNodeType.SHAPE_LINE]: 'minus',
  [WhiteboardNodeType.SHAPE_STAR]: 'star',
  [WhiteboardNodeType.SHAPE_HEXAGON]: 'hexagon',
  [WhiteboardNodeType.TEXT_BLOCK]: 'type',
  [WhiteboardNodeType.IMAGE]: 'image',
  [WhiteboardNodeType.DRAWING]: 'pen-tool',
  [WhiteboardNodeType.FRAME]: 'frame',
  [WhiteboardNodeType.VOTING]: 'thumbs-up',
  [WhiteboardNodeType.MERMAID]: 'git-branch',
  [WhiteboardNodeType.ANCHOR]: 'anchor',
};

/**
 * Node templates for creating new nodes
 */
export const NODE_TEMPLATES: NodeTemplate[] = [
  // Workflow nodes
  {
    type: WorkflowNodeType.START,
    name: 'Start',
    description: 'Entry point of the workflow',
    icon: NODE_ICONS[WorkflowNodeType.START],
    color: NODE_COLORS[WorkflowNodeType.START],
    category: 'control',
    defaultConfig: {},
    defaultPorts: {
      inputs: [],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: WorkflowNodeType.END,
    name: 'End',
    description: 'Exit point of the workflow',
    icon: NODE_ICONS[WorkflowNodeType.END],
    color: NODE_COLORS[WorkflowNodeType.END],
    category: 'control',
    defaultConfig: {},
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [],
    },
  },
  {
    type: WorkflowNodeType.HTTP_START,
    name: 'HTTP Trigger',
    description: 'Start workflow from HTTP request',
    icon: NODE_ICONS[WorkflowNodeType.HTTP_START],
    color: NODE_COLORS[WorkflowNodeType.HTTP_START],
    category: 'trigger',
    defaultConfig: {
      httpPath: '/webhook',
      httpMethods: ['POST'],
      httpAuth: 'none',
      httpCors: true,
      httpRateLimit: 100,
      httpRequestSchema: {},
    },
    defaultPorts: {
      inputs: [],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Request' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.HTTP_END,
    name: 'HTTP Response',
    description: 'Return HTTP response to caller',
    icon: NODE_ICONS[WorkflowNodeType.HTTP_END],
    color: NODE_COLORS[WorkflowNodeType.HTTP_END],
    category: 'control',
    defaultConfig: {
      httpStatusCode: 200,
      httpResponseHeaders: { 'Content-Type': 'application/json' },
      httpResponseBody: '{{data}}',
      httpContentType: 'application/json',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [],
    },
  },
  {
    type: WorkflowNodeType.CHAT_START,
    name: 'Chat Trigger',
    description: 'Start workflow from chatbot message',
    icon: NODE_ICONS[WorkflowNodeType.CHAT_START],
    color: NODE_COLORS[WorkflowNodeType.CHAT_START],
    category: 'trigger',
    defaultConfig: {
      outputVariable: 'chatInput',
      enableFileUpload: false,
      maxFileSize: 10,
      maxFiles: 5,
      allowImages: true,
      allowDocuments: false,
      allowText: false,
      allowAudio: false,
      allowVideo: false,
    },
    defaultPorts: {
      inputs: [],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Message' },
        { id: 'files', type: PortType.OUTPUT, label: 'Files' },
      ],
    },
  },
  {
    type: WorkflowNodeType.CHAT_OUTPUT,
    name: 'Chat Output',
    description: 'Send message to chatbot during execution',
    icon: NODE_ICONS[WorkflowNodeType.CHAT_OUTPUT],
    color: NODE_COLORS[WorkflowNodeType.CHAT_OUTPUT],
    category: 'action',
    defaultConfig: {
      message: '${variables.response}',
      messageType: 'text',
      typing: false,
      typingDelay: 1000,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: WorkflowNodeType.LLM,
    name: 'LLM',
    description: 'Call AI language model (OpenAI, Anthropic, etc.)',
    icon: NODE_ICONS[WorkflowNodeType.LLM],
    color: NODE_COLORS[WorkflowNodeType.LLM],
    category: 'action',
    defaultConfig: {
      provider: 'openai',
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: '',
      userPrompt: '${variables.message}',
    },
    defaultPorts: {
      inputs: [
        { id: 'in', type: PortType.INPUT, label: 'Input' },
        { id: 'context_memory', type: PortType.INPUT, label: 'Context Memory' },
      ],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Response' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.OCR,
    name: 'OCR',
    description: 'Extract text from images using OCR',
    icon: NODE_ICONS[WorkflowNodeType.OCR],
    color: NODE_COLORS[WorkflowNodeType.OCR],
    category: 'action',
    defaultConfig: {
      imageSource: 'variable',
      imageField: '${input.files[0].base64}',
      language: 'fr',
      detectLayout: false,
      outputVariable: 'ocrResult',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Image' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Text' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.FUNCTION,
    name: 'Function',
    description: 'Invoke a Nuraly function',
    icon: NODE_ICONS[WorkflowNodeType.FUNCTION],
    color: NODE_COLORS[WorkflowNodeType.FUNCTION],
    category: 'action',
    defaultConfig: { functionId: '', inputMapping: {}, outputMapping: {} },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: WorkflowNodeType.HTTP,
    name: 'HTTP Request',
    description: 'Make an HTTP request',
    icon: NODE_ICONS[WorkflowNodeType.HTTP],
    color: NODE_COLORS[WorkflowNodeType.HTTP],
    category: 'action',
    defaultConfig: { method: 'GET', url: '', headers: {}, timeout: 30000 },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Success' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.CONDITION,
    name: 'Condition',
    description: 'Branch based on a condition',
    icon: NODE_ICONS[WorkflowNodeType.CONDITION],
    color: NODE_COLORS[WorkflowNodeType.CONDITION],
    category: 'control',
    defaultConfig: { expression: '', language: 'javascript' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'true', type: PortType.CONDITIONAL_TRUE, label: 'True' },
        { id: 'false', type: PortType.CONDITIONAL_FALSE, label: 'False' },
      ],
    },
  },
  {
    type: WorkflowNodeType.DELAY,
    name: 'Delay',
    description: 'Wait for a specified duration',
    icon: NODE_ICONS[WorkflowNodeType.DELAY],
    color: NODE_COLORS[WorkflowNodeType.DELAY],
    category: 'control',
    defaultConfig: { duration: 1000, unit: 'milliseconds' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: WorkflowNodeType.PARALLEL,
    name: 'Parallel',
    description: 'Execute branches in parallel',
    icon: NODE_ICONS[WorkflowNodeType.PARALLEL],
    color: NODE_COLORS[WorkflowNodeType.PARALLEL],
    category: 'control',
    defaultConfig: {},
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'branch1', type: PortType.PARALLEL_BRANCH, label: 'Branch 1' },
        { id: 'branch2', type: PortType.PARALLEL_BRANCH, label: 'Branch 2' },
      ],
    },
  },
  {
    type: WorkflowNodeType.LOOP,
    name: 'Loop',
    description: 'Iterate over an array',
    icon: NODE_ICONS[WorkflowNodeType.LOOP],
    color: NODE_COLORS[WorkflowNodeType.LOOP],
    category: 'control',
    defaultConfig: { iteratorVariable: 'item', arrayExpression: '', maxIterations: 100 },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'item', type: PortType.LOOP_ITEM, label: 'Each Item' },
        { id: 'done', type: PortType.LOOP_DONE, label: 'Done' },
      ],
    },
  },
  {
    type: WorkflowNodeType.TRANSFORM,
    name: 'Transform',
    description: 'Transform data using expressions',
    icon: NODE_ICONS[WorkflowNodeType.TRANSFORM],
    color: NODE_COLORS[WorkflowNodeType.TRANSFORM],
    category: 'data',
    defaultConfig: { transformExpression: '', language: 'jsonata' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: WorkflowNodeType.SUB_WORKFLOW,
    name: 'Sub-Workflow',
    description: 'Invoke another workflow',
    icon: NODE_ICONS[WorkflowNodeType.SUB_WORKFLOW],
    color: NODE_COLORS[WorkflowNodeType.SUB_WORKFLOW],
    category: 'action',
    defaultConfig: { workflowId: '' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: WorkflowNodeType.EMAIL,
    name: 'Email',
    description: 'Send an email',
    icon: NODE_ICONS[WorkflowNodeType.EMAIL],
    color: NODE_COLORS[WorkflowNodeType.EMAIL],
    category: 'action',
    defaultConfig: { to: '', cc: '', bcc: '', subject: '', body: '', bodyType: 'text', fromName: '', replyTo: '', priority: 'normal' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: WorkflowNodeType.NOTIFICATION,
    name: 'Notification',
    description: 'Send a notification',
    icon: NODE_ICONS[WorkflowNodeType.NOTIFICATION],
    color: NODE_COLORS[WorkflowNodeType.NOTIFICATION],
    category: 'action',
    defaultConfig: { channel: '', message: '' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: WorkflowNodeType.DATABASE,
    name: 'Data',
    description: 'Read and write data to databases',
    icon: NODE_ICONS[WorkflowNodeType.DATABASE],
    color: '#6366F1',
    category: 'data',
    defaultConfig: {
      operation: DataOperation.QUERY,
      dataSource: null,
      entity: null,
      filter: null,
      fields: {},
      select: [],
      orderBy: [],
      limit: null,
      offset: null,
      outputVariable: 'results',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Output' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.VARIABLE,
    name: 'Variable',
    description: 'Set or get a workflow variable',
    icon: NODE_ICONS[WorkflowNodeType.VARIABLE],
    color: NODE_COLORS[WorkflowNodeType.VARIABLE],
    category: 'data',
    defaultConfig: { variableOperation: 'set', variableName: '', value: '' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: WorkflowNodeType.CHATBOT,
    name: 'Chatbot Trigger',
    description: 'Trigger workflow from chatbot interactions',
    icon: NODE_ICONS[WorkflowNodeType.CHATBOT],
    color: NODE_COLORS[WorkflowNodeType.CHATBOT],
    category: 'trigger',
    defaultConfig: {
      triggerEvents: ['MESSAGE_SENT'],
      chatbotSize: 'medium',
      chatbotVariant: 'floating',
      title: 'Chat Assistant',
      subtitle: 'Ask me anything',
      placeholder: 'Type a message...',
      initialMessage: '',
      enableTypingIndicator: true,
      enableSuggestions: false,
      suggestions: [],
      loadingType: 'dots',
      enableFileUpload: false,
      maxFileSize: 10,
      maxFiles: 5,
      allowImages: true,
      allowDocuments: false,
      allowText: false,
      allowAudio: false,
      allowVideo: false,
    },
    defaultPorts: {
      inputs: [],
      outputs: [
        { id: 'message', type: PortType.OUTPUT, label: 'Message' },
        { id: 'files', type: PortType.OUTPUT, label: 'Files' },
        { id: 'session', type: PortType.OUTPUT, label: 'Session Start' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.DEBUG,
    name: 'Debug',
    description: 'Display input, output, and variables for debugging',
    icon: NODE_ICONS[WorkflowNodeType.DEBUG],
    color: NODE_COLORS[WorkflowNodeType.DEBUG],
    category: 'data',
    defaultConfig: {},
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  // Display nodes
  {
    type: WorkflowNodeType.UI_TABLE,
    name: 'Table',
    description: 'Display data as an interactive table',
    icon: NODE_ICONS[WorkflowNodeType.UI_TABLE],
    color: NODE_COLORS[WorkflowNodeType.UI_TABLE],
    category: 'display',
    defaultConfig: {
      tableColumns: [],
      dataExpression: '',
      tablePageSize: 10,
      tableEnableFilter: false,
      tableEnableSort: true,
      tableFixedHeader: false,
      tableSize: 'normal',
      tableEmptyText: 'No data available',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Data' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  // Web nodes
  {
    type: WorkflowNodeType.WEB_SEARCH,
    name: 'Web Search',
    description: 'Search the web using Google, Bing, Brave, or DuckDuckGo',
    icon: NODE_ICONS[WorkflowNodeType.WEB_SEARCH],
    color: NODE_COLORS[WorkflowNodeType.WEB_SEARCH],
    category: 'web',
    defaultConfig: {
      provider: 'google',
      queryField: 'query',
      numResults: 10,
      safeSearch: true,
      timeout: 30000,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Results' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.WEB_CRAWL,
    name: 'Web Crawl',
    description: 'Crawl web pages and extract text content',
    icon: NODE_ICONS[WorkflowNodeType.WEB_CRAWL],
    color: NODE_COLORS[WorkflowNodeType.WEB_CRAWL],
    category: 'web',
    defaultConfig: {
      urlField: 'url',
      maxDepth: 1,
      maxPages: 10,
      sameDomainOnly: true,
      renderJs: false,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Pages' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  // Document generation
  {
    type: WorkflowNodeType.DOCUMENT_GENERATOR,
    name: 'Document Generator',
    description: 'Generate Word documents from templates with dynamic data',
    icon: NODE_ICONS[WorkflowNodeType.DOCUMENT_GENERATOR],
    color: NODE_COLORS[WorkflowNodeType.DOCUMENT_GENERATOR],
    category: 'documents',
    defaultConfig: {
      templateId: '',
      data: {},
      outputVariable: 'documentResult',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Result' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  // Storage nodes
  {
    type: WorkflowNodeType.FILE_STORAGE,
    name: 'File Storage',
    description: 'Store files to S3, MinIO, or local filesystem',
    icon: NODE_ICONS[WorkflowNodeType.FILE_STORAGE],
    color: NODE_COLORS[WorkflowNodeType.FILE_STORAGE],
    category: 'storage',
    defaultConfig: {
      provider: 'local',
      bucket: 'default',
      path: '',
      fileField: 'file',
      filenameField: 'filename',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Result' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  // RAG nodes
  {
    type: WorkflowNodeType.EMBEDDING,
    name: 'Embedding',
    description: 'Convert text to vector embeddings',
    icon: NODE_ICONS[WorkflowNodeType.EMBEDDING],
    color: NODE_COLORS[WorkflowNodeType.EMBEDDING],
    category: 'rag',
    defaultConfig: {
      provider: 'openai',
      model: 'text-embedding-3-small',
      inputField: 'text',
      batchSize: 100,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Text' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Embedding' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.DOCUMENT_LOADER,
    name: 'Document Loader',
    description: 'Load and parse documents (PDF, Word, HTML, etc.)',
    icon: NODE_ICONS[WorkflowNodeType.DOCUMENT_LOADER],
    color: NODE_COLORS[WorkflowNodeType.DOCUMENT_LOADER],
    category: 'rag',
    defaultConfig: {
      sourceType: 'text',
      contentField: 'content',
      filenameField: 'filename',
      defaultType: 'txt',
      timeout: 30000,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Document' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Content' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.TEXT_SPLITTER,
    name: 'Text Splitter',
    description: 'Split text into chunks for embedding',
    icon: NODE_ICONS[WorkflowNodeType.TEXT_SPLITTER],
    color: NODE_COLORS[WorkflowNodeType.TEXT_SPLITTER],
    category: 'rag',
    defaultConfig: {
      strategy: 'recursive',
      chunkSize: 1000,
      chunkOverlap: 200,
      contentField: 'content',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Text' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Chunks' }],
    },
  },
  {
    type: WorkflowNodeType.VECTOR_WRITE,
    name: 'Vector Write',
    description: 'Store embeddings in vector database',
    icon: NODE_ICONS[WorkflowNodeType.VECTOR_WRITE],
    color: NODE_COLORS[WorkflowNodeType.VECTOR_WRITE],
    category: 'rag',
    defaultConfig: {
      collectionName: '',
      upsertMode: 'replace',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Embeddings' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Result' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.VECTOR_SEARCH,
    name: 'Vector Search',
    description: 'Search for similar documents in vector store',
    icon: NODE_ICONS[WorkflowNodeType.VECTOR_SEARCH],
    color: NODE_COLORS[WorkflowNodeType.VECTOR_SEARCH],
    category: 'rag',
    defaultConfig: {
      collectionName: '',
      topK: 5,
      minScore: 0.7,
      includeContent: true,
      includeMetadata: true,
      provider: 'openai',
      model: 'text-embedding-3-small',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Query' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Results' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.CONTEXT_BUILDER,
    name: 'Context Builder',
    description: 'Format retrieved documents into LLM-ready context',
    icon: NODE_ICONS[WorkflowNodeType.CONTEXT_BUILDER],
    color: NODE_COLORS[WorkflowNodeType.CONTEXT_BUILDER],
    category: 'rag',
    defaultConfig: {
      template: 'default',
      maxTokens: 4000,
      maxDocuments: 10,
      includeSourceInfo: true,
      includeSimilarityScore: false,
      separator: '\n\n---\n\n',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Results' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Context' }],
    },
  },
  {
    type: WorkflowNodeType.RERANKER,
    name: 'Reranker',
    description: 'Re-rank search results by relevance',
    icon: NODE_ICONS[WorkflowNodeType.RERANKER],
    color: NODE_COLORS[WorkflowNodeType.RERANKER],
    category: 'rag',
    defaultConfig: {
      model: 'cross-encoder',
      topK: 5,
      threshold: 0.5,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Results' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Reranked' }],
    },
  },
  // Safety nodes
  {
    type: WorkflowNodeType.GUARDRAIL,
    name: 'Guardrail',
    description: 'Validate and filter LLM inputs/outputs for safety',
    icon: NODE_ICONS[WorkflowNodeType.GUARDRAIL],
    color: NODE_COLORS[WorkflowNodeType.GUARDRAIL],
    category: 'safety',
    defaultConfig: {
      mode: 'input',
      contentField: 'content',
      onFail: 'block',
      checks: [],
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Passed' },
        { id: 'blocked', type: PortType.ERROR, label: 'Blocked' },
      ],
    },
  },
  // Slack integration nodes
  {
    type: WorkflowNodeType.SLACK_SEND_MESSAGE,
    name: 'Slack: Send Message',
    description: 'Send a message to a Slack channel or user',
    icon: NODE_ICONS[WorkflowNodeType.SLACK_SEND_MESSAGE],
    color: NODE_COLORS[WorkflowNodeType.SLACK_SEND_MESSAGE],
    category: 'slack',
    defaultConfig: {
      slackMethod: 'api',
      botToken: '',
      channel: '',
      text: '',
      unfurlLinks: true,
      unfurlMedia: true,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Response' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.SLACK_GET_CHANNEL_INFO,
    name: 'Slack: Channel Info',
    description: 'Get information about a Slack channel',
    icon: NODE_ICONS[WorkflowNodeType.SLACK_GET_CHANNEL_INFO],
    color: NODE_COLORS[WorkflowNodeType.SLACK_GET_CHANNEL_INFO],
    category: 'slack',
    defaultConfig: {
      botToken: '',
      channel: '',
      includeLocale: false,
      includeNumMembers: false,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Info' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.SLACK_LIST_CHANNELS,
    name: 'Slack: List Channels',
    description: 'List available Slack channels in the workspace',
    icon: NODE_ICONS[WorkflowNodeType.SLACK_LIST_CHANNELS],
    color: NODE_COLORS[WorkflowNodeType.SLACK_LIST_CHANNELS],
    category: 'slack',
    defaultConfig: {
      botToken: '',
      types: 'public_channel',
      excludeArchived: true,
      limit: 100,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Channels' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.SLACK_ADD_REACTION,
    name: 'Slack: Add Reaction',
    description: 'Add a reaction emoji to a Slack message',
    icon: NODE_ICONS[WorkflowNodeType.SLACK_ADD_REACTION],
    color: NODE_COLORS[WorkflowNodeType.SLACK_ADD_REACTION],
    category: 'slack',
    defaultConfig: {
      botToken: '',
      channel: '',
      timestamp: '',
      name: 'thumbsup',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Response' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.SLACK_UPLOAD_FILE,
    name: 'Slack: Upload File',
    description: 'Upload a file to a Slack channel',
    icon: NODE_ICONS[WorkflowNodeType.SLACK_UPLOAD_FILE],
    color: NODE_COLORS[WorkflowNodeType.SLACK_UPLOAD_FILE],
    category: 'slack',
    defaultConfig: {
      botToken: '',
      channels: '',
      filename: '',
      content: '',
      title: '',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Response' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  // Telegram integration nodes
  {
    type: WorkflowNodeType.TELEGRAM_SEND,
    name: 'Telegram: Send Message',
    description: 'Send a message to a Telegram chat with typing indicator and optional emoji reaction',
    icon: NODE_ICONS[WorkflowNodeType.TELEGRAM_SEND],
    color: NODE_COLORS[WorkflowNodeType.TELEGRAM_SEND],
    category: 'telegram',
    defaultConfig: {
      botToken: '',
      chatId: '',
      text: '',
      parseMode: '',
      replyToMessageId: '',
      showTyping: true,
      reaction: '',
      disableNotification: false,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Response' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  // Persistent trigger nodes
  {
    type: WorkflowNodeType.TELEGRAM_BOT,
    name: 'Telegram Bot',
    description: 'Receive messages from a Telegram bot via polling or webhook',
    icon: NODE_ICONS[WorkflowNodeType.TELEGRAM_BOT],
    color: NODE_COLORS[WorkflowNodeType.TELEGRAM_BOT],
    category: 'trigger',
    defaultConfig: {
      botToken: '',
      mode: 'polling',
      pollingTimeout: 30,
      allowedUpdates: [],
      allowedChatIds: '',
      allowedUserIds: '',
    },
    defaultPorts: {
      inputs: [],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Message' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.SLACK_SOCKET,
    name: 'Slack Socket',
    description: 'Receive events via Slack Socket Mode (WebSocket)',
    icon: NODE_ICONS[WorkflowNodeType.SLACK_SOCKET],
    color: NODE_COLORS[WorkflowNodeType.SLACK_SOCKET],
    category: 'trigger',
    defaultConfig: { appToken: '', botToken: '' },
    defaultPorts: {
      inputs: [],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Event' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.DISCORD_BOT,
    name: 'Discord Bot',
    description: 'Receive events from a Discord bot (Gateway WebSocket)',
    icon: NODE_ICONS[WorkflowNodeType.DISCORD_BOT],
    color: NODE_COLORS[WorkflowNodeType.DISCORD_BOT],
    category: 'trigger',
    defaultConfig: { botToken: '' },
    defaultPorts: {
      inputs: [],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Event' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.WHATSAPP_WEBHOOK,
    name: 'WhatsApp',
    description: 'Receive messages via WhatsApp Business API',
    icon: NODE_ICONS[WorkflowNodeType.WHATSAPP_WEBHOOK],
    color: NODE_COLORS[WorkflowNodeType.WHATSAPP_WEBHOOK],
    category: 'trigger',
    defaultConfig: {},
    defaultPorts: {
      inputs: [],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Message' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  {
    type: WorkflowNodeType.CUSTOM_WEBSOCKET,
    name: 'WebSocket Listener',
    description: 'Listen for messages on a custom WebSocket endpoint',
    icon: NODE_ICONS[WorkflowNodeType.CUSTOM_WEBSOCKET],
    color: NODE_COLORS[WorkflowNodeType.CUSTOM_WEBSOCKET],
    category: 'trigger',
    defaultConfig: { url: '' },
    defaultPorts: {
      inputs: [],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Message' },
        { id: 'error', type: PortType.ERROR, label: 'Error' },
      ],
    },
  },
  // Annotation nodes
  {
    type: WorkflowNodeType.NOTE,
    name: 'Note',
    description: 'Add annotations and comments to your workflow',
    icon: NODE_ICONS[WorkflowNodeType.NOTE],
    color: NODE_COLORS[WorkflowNodeType.NOTE],
    category: 'annotation',
    defaultConfig: {
      noteContent: 'Add your note here...',
      noteBackgroundColor: '#fef08a',
      noteTextColor: '#713f12',
      noteFontSize: 'medium',
      noteShowBorder: false,
    },
    defaultPorts: {
      inputs: [],
      outputs: [],
    },
  },
  {
    type: WorkflowNodeType.FRAME,
    name: 'Frame',
    description: 'Group related nodes together with a labeled container',
    icon: NODE_ICONS[WorkflowNodeType.FRAME],
    color: NODE_COLORS[WorkflowNodeType.FRAME],
    category: 'annotation',
    defaultConfig: {
      frameLabel: 'Group',
      frameWidth: 400,
      frameHeight: 300,
      frameBackgroundColor: 'rgba(99, 102, 241, 0.05)',
      frameBorderColor: 'rgba(99, 102, 241, 0.3)',
      frameLabelPosition: 'top-left',
      frameLabelPlacement: 'outside',
      frameShowLabel: true,
      frameCollapsed: false,
    },
    defaultPorts: {
      inputs: [],
      outputs: [],
    },
  },
  // Agent nodes
  {
    type: AgentNodeType.AGENT,
    name: 'AI Agent',
    description: 'Autonomous AI agent that can use tools',
    icon: NODE_ICONS[AgentNodeType.AGENT],
    color: NODE_COLORS[AgentNodeType.AGENT],
    category: 'agent',
    defaultConfig: { agentId: '', maxIterations: 10 },
    defaultPorts: {
      inputs: [
        { id: 'in', type: PortType.INPUT, label: 'Input' },
        { id: 'retriever', type: PortType.INPUT, label: 'Retriever' },
      ],
      configs: [
        { id: 'llm', type: PortType.CONFIG, label: 'LLM' },
        { id: 'prompt', type: PortType.CONFIG, label: 'Prompt' },
        { id: 'memory', type: PortType.CONFIG, label: 'Memory' },
        { id: 'tools', type: PortType.CONFIG, label: 'Tools', multiple: true },
      ],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Output' },
      ],
    },
  },
  {
    type: AgentNodeType.TOOL,
    name: 'Tool',
    description: 'A tool that can be used by an agent',
    icon: NODE_ICONS[AgentNodeType.TOOL],
    color: NODE_COLORS[AgentNodeType.TOOL],
    category: 'agent',
    defaultConfig: { toolName: '', description: '', parameters: [] },
    defaultPorts: {
      inputs: [
        { id: 'function', type: PortType.INPUT, label: 'Function' },
      ],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Tool' }],
    },
  },
  {
    type: AgentNodeType.MEMORY,
    name: 'Context Memory',
    description: 'Conversation memory for agents - stores and retrieves chat history',
    icon: NODE_ICONS[AgentNodeType.MEMORY],
    color: NODE_COLORS[AgentNodeType.MEMORY],
    category: 'agent',
    defaultConfig: {
      cutoffMode: 'message',
      maxMessages: 50,
      maxTokens: 4000,
      conversationIdExpression: '${input.threadId}',
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Memory Config' }],
    },
  },
  {
    type: AgentNodeType.CONTEXT_MEMORY,
    name: 'Context Memory (RAG)',
    description: 'RAG-enhanced conversation memory with buffer, semantic, or hybrid modes',
    icon: NODE_ICONS[AgentNodeType.CONTEXT_MEMORY],
    color: NODE_COLORS[AgentNodeType.CONTEXT_MEMORY],
    category: 'agent',
    defaultConfig: {
      memoryType: 'hybrid',
      cutoffMode: 'message',
      maxMessages: 50,
      maxTokens: 4000,
      conversationIdExpression: '${input.threadId}',
    },
    defaultPorts: {
      inputs: [],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Memory Config' }],
    },
  },
  {
    type: AgentNodeType.PROMPT,
    name: 'Prompt',
    description: 'Prompt template for LLM',
    icon: NODE_ICONS[AgentNodeType.PROMPT],
    color: NODE_COLORS[AgentNodeType.PROMPT],
    category: 'agent',
    defaultConfig: { template: '', variables: [] },
    defaultPorts: {
      inputs: [],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Prompt' }],
    },
  },
  {
    type: AgentNodeType.LLM,
    name: 'LLM',
    description: 'Large Language Model call',
    icon: NODE_ICONS[AgentNodeType.LLM],
    color: NODE_COLORS[AgentNodeType.LLM],
    category: 'agent',
    defaultConfig: { provider: 'openai', modelName: 'gpt-4', temperature: 0.7, maxTokens: 2048 },
    defaultPorts: {
      inputs: [],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Response' }],
    },
  },
  {
    type: AgentNodeType.RETRIEVER,
    name: 'Retriever',
    description: 'Retrieve relevant documents from vector store',
    icon: NODE_ICONS[AgentNodeType.RETRIEVER],
    color: NODE_COLORS[AgentNodeType.RETRIEVER],
    category: 'agent',
    defaultConfig: { vectorStoreId: '', topK: 5 },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Query' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Documents' }],
    },
  },
  {
    type: AgentNodeType.CHAIN,
    name: 'Chain',
    description: 'Chain multiple LLM calls together',
    icon: NODE_ICONS[AgentNodeType.CHAIN],
    color: NODE_COLORS[AgentNodeType.CHAIN],
    category: 'agent',
    defaultConfig: { chainType: 'sequential' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
    },
  },
  {
    type: AgentNodeType.ROUTER,
    name: 'Router',
    description: 'Route to different chains based on input',
    icon: NODE_ICONS[AgentNodeType.ROUTER],
    color: NODE_COLORS[AgentNodeType.ROUTER],
    category: 'agent',
    defaultConfig: { routingExpression: '' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'route1', type: PortType.OUTPUT, label: 'Route 1' },
        { id: 'route2', type: PortType.OUTPUT, label: 'Route 2' },
        { id: 'default', type: PortType.CONDITIONAL_DEFAULT, label: 'Default' },
      ],
    },
  },
  {
    type: AgentNodeType.HUMAN_INPUT,
    name: 'Human Input',
    description: 'Wait for human input in the workflow',
    icon: NODE_ICONS[AgentNodeType.HUMAN_INPUT],
    color: NODE_COLORS[AgentNodeType.HUMAN_INPUT],
    category: 'agent',
    defaultConfig: { prompt: '', timeout: 86400000 },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Context' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Response' }],
    },
  },
  {
    type: AgentNodeType.OUTPUT_PARSER,
    name: 'Output Parser',
    description: 'Parse LLM output into structured data',
    icon: NODE_ICONS[AgentNodeType.OUTPUT_PARSER],
    color: NODE_COLORS[AgentNodeType.OUTPUT_PARSER],
    category: 'agent',
    defaultConfig: { parserType: 'json', schema: {} },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Raw Output' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Parsed Data' }],
    },
  },
  // DB Designer nodes
  {
    type: DbDesignerNodeType.TABLE,
    name: 'Table',
    description: 'Define a database table with columns',
    icon: NODE_ICONS[DbDesignerNodeType.TABLE],
    color: NODE_COLORS[DbDesignerNodeType.TABLE],
    category: 'db-tables-views',
    defaultConfig: {
      tableName: '',
      columns: [],
      primaryKey: '',
    },
    defaultPorts: {
      inputs: [],
      outputs: [
        { id: 'ref', type: PortType.OUTPUT, label: 'Reference' },
      ],
    },
  },
  {
    type: DbDesignerNodeType.VIEW,
    name: 'View',
    description: 'Create a database view based on queries',
    icon: NODE_ICONS[DbDesignerNodeType.VIEW],
    color: NODE_COLORS[DbDesignerNodeType.VIEW],
    category: 'db-tables-views',
    defaultConfig: {
      viewName: '',
      query: '',
      materialized: false,
    },
    defaultPorts: {
      inputs: [{ id: 'source', type: PortType.INPUT, label: 'Source Tables' }],
      outputs: [
        { id: 'ref', type: PortType.OUTPUT, label: 'Reference' },
      ],
    },
  },
  {
    type: DbDesignerNodeType.INDEX,
    name: 'Index',
    description: 'Create an index on table columns',
    icon: NODE_ICONS[DbDesignerNodeType.INDEX],
    color: NODE_COLORS[DbDesignerNodeType.INDEX],
    category: 'db-indexes-queries',
    defaultConfig: {
      indexName: '',
      indexColumns: [],
      unique: false,
      indexType: 'BTREE',
    },
    defaultPorts: {
      inputs: [{ id: 'table', type: PortType.INPUT, label: 'Table' }],
      outputs: [],
    },
  },
  {
    type: DbDesignerNodeType.RELATIONSHIP,
    name: 'Relationship',
    description: 'Define foreign key relationships between tables',
    icon: NODE_ICONS[DbDesignerNodeType.RELATIONSHIP],
    color: NODE_COLORS[DbDesignerNodeType.RELATIONSHIP],
    category: 'db-relations-constraints',
    defaultConfig: {
      relationshipType: 'ONE_TO_MANY',
      sourceColumn: '',
      targetColumn: '',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
    defaultPorts: {
      inputs: [
        { id: 'source', type: PortType.INPUT, label: 'Source Table' },
        { id: 'target', type: PortType.INPUT, label: 'Target Table' },
      ],
      outputs: [],
    },
  },
  {
    type: DbDesignerNodeType.CONSTRAINT,
    name: 'Constraint',
    description: 'Add constraints (unique, check, foreign_key)',
    icon: NODE_ICONS[DbDesignerNodeType.CONSTRAINT],
    color: NODE_COLORS[DbDesignerNodeType.CONSTRAINT],
    category: 'db-relations-constraints',
    defaultConfig: {
      constraintName: '',
      constraintType: 'UNIQUE',
      constraintColumns: [],
      checkExpression: '',
    },
    defaultPorts: {
      inputs: [{ id: 'table', type: PortType.INPUT, label: 'Table' }],
      outputs: [],
    },
  },
  {
    type: DbDesignerNodeType.QUERY,
    name: 'Query',
    description: 'Define saved queries or stored procedures',
    icon: NODE_ICONS[DbDesignerNodeType.QUERY],
    color: NODE_COLORS[DbDesignerNodeType.QUERY],
    category: 'db-indexes-queries',
    defaultConfig: {
      queryName: '',
      queryText: '',
      parameters: [],
    },
    defaultPorts: {
      inputs: [{ id: 'tables', type: PortType.INPUT, label: 'Tables' }],
      outputs: [{ id: 'result', type: PortType.OUTPUT, label: 'Result Schema' }],
    },
  },
  // Whiteboard nodes
  {
    type: WhiteboardNodeType.STICKY_NOTE,
    name: 'Sticky Note',
    description: 'Add a sticky note to the whiteboard',
    icon: NODE_ICONS[WhiteboardNodeType.STICKY_NOTE],
    color: NODE_COLORS[WhiteboardNodeType.STICKY_NOTE],
    category: 'wb-notes-text',
    defaultConfig: {
      textContent: '',
      backgroundColor: '#fef08a',
      textColor: '#713f12',
      fontSize: 14,
      width: 200,
      height: 200,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.TEXT_BLOCK,
    name: 'Text Block',
    description: 'Add a text block to the whiteboard',
    icon: NODE_ICONS[WhiteboardNodeType.TEXT_BLOCK],
    color: NODE_COLORS[WhiteboardNodeType.TEXT_BLOCK],
    category: 'wb-notes-text',
    defaultConfig: {
      textContent: '',
      fontSize: 16,
      fontWeight: 'normal',
      textAlign: 'left',
      width: 200,
      height: 50,
    },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.SHAPE_RECTANGLE,
    name: 'Rectangle',
    description: 'Add a rectangle shape',
    icon: NODE_ICONS[WhiteboardNodeType.SHAPE_RECTANGLE],
    color: NODE_COLORS[WhiteboardNodeType.SHAPE_RECTANGLE],
    category: 'wb-shapes',
    defaultConfig: { width: 120, height: 120, fillColor: '#3b82f6' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.SHAPE_CIRCLE,
    name: 'Circle',
    description: 'Add a circle shape',
    icon: NODE_ICONS[WhiteboardNodeType.SHAPE_CIRCLE],
    color: NODE_COLORS[WhiteboardNodeType.SHAPE_CIRCLE],
    category: 'wb-shapes',
    defaultConfig: { width: 120, height: 120, fillColor: '#8b5cf6' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.SHAPE_DIAMOND,
    name: 'Diamond',
    description: 'Add a diamond shape',
    icon: NODE_ICONS[WhiteboardNodeType.SHAPE_DIAMOND],
    color: NODE_COLORS[WhiteboardNodeType.SHAPE_DIAMOND],
    category: 'wb-shapes',
    defaultConfig: { width: 120, height: 120, fillColor: '#f59e0b' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.SHAPE_TRIANGLE,
    name: 'Triangle',
    description: 'Add a triangle shape',
    icon: NODE_ICONS[WhiteboardNodeType.SHAPE_TRIANGLE],
    color: NODE_COLORS[WhiteboardNodeType.SHAPE_TRIANGLE],
    category: 'wb-shapes',
    defaultConfig: { width: 120, height: 120, fillColor: '#22c55e' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.SHAPE_ARROW,
    name: 'Arrow',
    description: 'Add an arrow shape',
    icon: NODE_ICONS[WhiteboardNodeType.SHAPE_ARROW],
    color: NODE_COLORS[WhiteboardNodeType.SHAPE_ARROW],
    category: 'wb-shapes',
    defaultConfig: { width: 120, height: 60, fillColor: '#6b7280' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.SHAPE_LINE,
    name: 'Line',
    description: 'Add a line shape',
    icon: NODE_ICONS[WhiteboardNodeType.SHAPE_LINE],
    color: NODE_COLORS[WhiteboardNodeType.SHAPE_LINE],
    category: 'wb-shapes',
    defaultConfig: { width: 120, height: 4, fillColor: '#6b7280' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.SHAPE_STAR,
    name: 'Star',
    description: 'Add a star shape',
    icon: NODE_ICONS[WhiteboardNodeType.SHAPE_STAR],
    color: NODE_COLORS[WhiteboardNodeType.SHAPE_STAR],
    category: 'wb-shapes',
    defaultConfig: { width: 120, height: 120, fillColor: '#f97316' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.SHAPE_HEXAGON,
    name: 'Hexagon',
    description: 'Add a hexagon shape',
    icon: NODE_ICONS[WhiteboardNodeType.SHAPE_HEXAGON],
    color: NODE_COLORS[WhiteboardNodeType.SHAPE_HEXAGON],
    category: 'wb-shapes',
    defaultConfig: { width: 120, height: 120, fillColor: '#ec4899' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.IMAGE,
    name: 'Image',
    description: 'Add an image to the whiteboard',
    icon: NODE_ICONS[WhiteboardNodeType.IMAGE],
    color: NODE_COLORS[WhiteboardNodeType.IMAGE],
    category: 'wb-media',
    defaultConfig: { imageUrl: '', width: 200, height: 200 },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.DRAWING,
    name: 'Drawing',
    description: 'Add a freehand drawing area',
    icon: NODE_ICONS[WhiteboardNodeType.DRAWING],
    color: NODE_COLORS[WhiteboardNodeType.DRAWING],
    category: 'wb-media',
    defaultConfig: { pathData: '', width: 200, height: 200 },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.VOTING,
    name: 'Voting',
    description: 'Add a voting element for collaboration',
    icon: NODE_ICONS[WhiteboardNodeType.VOTING],
    color: NODE_COLORS[WhiteboardNodeType.VOTING],
    category: 'wb-media',
    defaultConfig: { textContent: 'Vote', width: 200, height: 150 },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.MERMAID,
    name: 'Mermaid Diagram',
    description: 'Add a Mermaid diagram to the whiteboard',
    icon: NODE_ICONS[WhiteboardNodeType.MERMAID],
    color: NODE_COLORS[WhiteboardNodeType.MERMAID],
    category: 'wb-media',
    defaultConfig: { textContent: 'graph TD\n  A[Start] --> B[End]', width: 400, height: 300 },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'In' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Out' }],
    },
  },
  {
    type: WhiteboardNodeType.ANCHOR,
    name: 'Anchor',
    description: 'Navigation anchor — other elements can link here',
    icon: NODE_ICONS[WhiteboardNodeType.ANCHOR],
    color: NODE_COLORS[WhiteboardNodeType.ANCHOR],
    category: 'wb-navigation',
    defaultConfig: { anchorLabel: 'Anchor', width: 120, height: 48 },
    defaultPorts: { inputs: [], outputs: [] },
  },
  {
    type: WhiteboardNodeType.FRAME,
    name: 'Frame',
    description: 'Group whiteboard elements together',
    icon: NODE_ICONS[WhiteboardNodeType.FRAME],
    color: NODE_COLORS[WhiteboardNodeType.FRAME],
    category: 'wb-layout',
    defaultConfig: {
      frameLabel: 'Group',
      frameWidth: 400,
      frameHeight: 300,
      frameBackgroundColor: 'rgba(99, 102, 241, 0.05)',
      frameBorderColor: 'rgba(99, 102, 241, 0.3)',
      frameLabelPosition: 'top-left',
      frameLabelPlacement: 'outside',
      frameShowLabel: true,
      frameCollapsed: false,
    },
    defaultPorts: {
      inputs: [],
      outputs: [],
    },
  },
];

/**
 * Node categories for palette organization
 */
export const NODE_CATEGORIES: NodeCategory[] = [
  // Workflow mode categories
  {
    id: 'trigger',
    name: 'Triggers',
    icon: 'zap',
    nodeTypes: [
      WorkflowNodeType.START,
      WorkflowNodeType.HTTP_START,
      WorkflowNodeType.CHAT_START,
      WorkflowNodeType.TELEGRAM_BOT,
      WorkflowNodeType.SLACK_SOCKET,
      WorkflowNodeType.DISCORD_BOT,
      WorkflowNodeType.WHATSAPP_WEBHOOK,
      WorkflowNodeType.CUSTOM_WEBSOCKET,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'control',
    name: 'Control Flow',
    icon: 'git-branch',
    nodeTypes: [
      WorkflowNodeType.END,
      WorkflowNodeType.HTTP_END,
      WorkflowNodeType.CONDITION,
      WorkflowNodeType.DELAY,
      WorkflowNodeType.PARALLEL,
      WorkflowNodeType.LOOP,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'action',
    name: 'Actions',
    icon: 'zap',
    nodeTypes: [
      WorkflowNodeType.FUNCTION,
      WorkflowNodeType.HTTP,
      WorkflowNodeType.LLM,
      WorkflowNodeType.OCR,
      WorkflowNodeType.CHAT_OUTPUT,
      WorkflowNodeType.SUB_WORKFLOW,
      WorkflowNodeType.EMAIL,
      WorkflowNodeType.NOTIFICATION,
      WorkflowNodeType.DOCUMENT_GENERATOR,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'data',
    name: 'Data',
    icon: 'database',
    nodeTypes: [
      WorkflowNodeType.TRANSFORM,
      WorkflowNodeType.DATABASE,
      WorkflowNodeType.VARIABLE,
      WorkflowNodeType.DEBUG,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'web',
    name: 'Web',
    icon: 'globe',
    nodeTypes: [
      WorkflowNodeType.WEB_SEARCH,
      WorkflowNodeType.WEB_CRAWL,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: 'hard-drive',
    nodeTypes: [
      WorkflowNodeType.FILE_STORAGE,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'rag',
    name: 'RAG',
    icon: 'layers',
    nodeTypes: [
      WorkflowNodeType.DOCUMENT_LOADER,
      WorkflowNodeType.TEXT_SPLITTER,
      WorkflowNodeType.EMBEDDING,
      WorkflowNodeType.VECTOR_WRITE,
      WorkflowNodeType.VECTOR_SEARCH,
      WorkflowNodeType.CONTEXT_BUILDER,
      WorkflowNodeType.RERANKER,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'safety',
    name: 'Safety',
    icon: 'shield',
    nodeTypes: [
      WorkflowNodeType.GUARDRAIL,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'display',
    name: 'Display',
    icon: 'monitor',
    nodeTypes: [
      WorkflowNodeType.UI_TABLE,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: 'send',
    nodeTypes: [
      WorkflowNodeType.TELEGRAM_SEND,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'message-square',
    nodeTypes: [
      WorkflowNodeType.SLACK_SEND_MESSAGE,
      WorkflowNodeType.SLACK_GET_CHANNEL_INFO,
      WorkflowNodeType.SLACK_LIST_CHANNELS,
      WorkflowNodeType.SLACK_ADD_REACTION,
      WorkflowNodeType.SLACK_UPLOAD_FILE,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'annotation',
    name: 'Annotations',
    icon: 'message-square',
    nodeTypes: [
      WorkflowNodeType.NOTE,
      WorkflowNodeType.FRAME,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  {
    id: 'agent',
    name: 'AI Agents',
    icon: 'cpu',
    nodeTypes: [
      AgentNodeType.AGENT,
      AgentNodeType.LLM,
      AgentNodeType.PROMPT,
      AgentNodeType.MEMORY,
      AgentNodeType.CONTEXT_MEMORY,
      AgentNodeType.TOOL,
      AgentNodeType.RETRIEVER,
      AgentNodeType.CHAIN,
      AgentNodeType.ROUTER,
      AgentNodeType.HUMAN_INPUT,
      AgentNodeType.OUTPUT_PARSER,
    ],
    canvasType: CanvasType.WORKFLOW,
  },
  // Database designer mode categories
  {
    id: 'db-tables-views',
    name: 'Tables & Views',
    icon: 'table',
    nodeTypes: [
      DbDesignerNodeType.TABLE,
      DbDesignerNodeType.VIEW,
    ],
    canvasType: CanvasType.DATABASE,
  },
  {
    id: 'db-relations-constraints',
    name: 'Relations & Constraints',
    icon: 'git-merge',
    nodeTypes: [
      DbDesignerNodeType.RELATIONSHIP,
      DbDesignerNodeType.CONSTRAINT,
    ],
    canvasType: CanvasType.DATABASE,
  },
  {
    id: 'db-indexes-queries',
    name: 'Indexes & Queries',
    icon: 'list',
    nodeTypes: [
      DbDesignerNodeType.INDEX,
      DbDesignerNodeType.QUERY,
    ],
    canvasType: CanvasType.DATABASE,
  },
  // Whiteboard mode categories
  {
    id: 'wb-notes-text',
    name: 'Notes & Text',
    icon: 'sticky-note',
    nodeTypes: [WhiteboardNodeType.STICKY_NOTE, WhiteboardNodeType.TEXT_BLOCK],
    canvasType: CanvasType.WHITEBOARD,
  },
  {
    id: 'wb-shapes',
    name: 'Shapes',
    icon: 'square',
    nodeTypes: [
      WhiteboardNodeType.SHAPE_RECTANGLE,
      WhiteboardNodeType.SHAPE_CIRCLE,
      WhiteboardNodeType.SHAPE_DIAMOND,
      WhiteboardNodeType.SHAPE_TRIANGLE,
      WhiteboardNodeType.SHAPE_ARROW,
      WhiteboardNodeType.SHAPE_LINE,
      WhiteboardNodeType.SHAPE_STAR,
      WhiteboardNodeType.SHAPE_HEXAGON,
    ],
    canvasType: CanvasType.WHITEBOARD,
  },
  {
    id: 'wb-media',
    name: 'Media & Interactive',
    icon: 'image',
    nodeTypes: [WhiteboardNodeType.IMAGE, WhiteboardNodeType.DRAWING, WhiteboardNodeType.VOTING, WhiteboardNodeType.MERMAID],
    canvasType: CanvasType.WHITEBOARD,
  },
  {
    id: 'wb-navigation',
    name: 'Navigation',
    icon: 'anchor',
    nodeTypes: [WhiteboardNodeType.ANCHOR],
    canvasType: CanvasType.WHITEBOARD,
  },
  {
    id: 'wb-layout',
    name: 'Layout',
    icon: 'frame',
    nodeTypes: [WhiteboardNodeType.FRAME],
    canvasType: CanvasType.WHITEBOARD,
  },
];

/**
 * Helper to get node template by type
 */
export function getNodeTemplate(type: NodeType): NodeTemplate | undefined {
  return NODE_TEMPLATES.find(t => t.type === type);
}

/**
 * Helper to check if node type is an agent node
 */
export function isAgentNode(type: NodeType): boolean {
  return Object.values(AgentNodeType).includes(type as AgentNodeType);
}

/**
 * Helper to check if node type is a workflow node
 */
export function isWorkflowNode(type: NodeType): boolean {
  return Object.values(WorkflowNodeType).includes(type as WorkflowNodeType);
}

/**
 * Helper to check if node type is a DB designer node
 */
export function isDbDesignerNode(type: NodeType): boolean {
  return Object.values(DbDesignerNodeType).includes(type as DbDesignerNodeType);
}

/**
 * Helper to check if node type is a whiteboard node
 */
export function isWhiteboardNode(type: NodeType): boolean {
  return Object.values(WhiteboardNodeType).includes(type as WhiteboardNodeType);
}

/**
 * Get filtered categories for the current canvas type
 */
export function getCategoriesForCanvasType(canvasType: CanvasType): NodeCategory[] {
  return NODE_CATEGORIES.filter(
    category => category.canvasType === canvasType
  );
}

/**
 * Create a new node from template
 */
export function createNodeFromTemplate(
  type: NodeType,
  position: Position,
  id?: string
): WorkflowNode | null {
  const template = getNodeTemplate(type);
  if (!template) return null;

  return {
    id: id || `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: template.name,
    type: template.type,
    position,
    configuration: { ...template.defaultConfig },
    ports: {
      inputs: template.defaultPorts.inputs.map(p => ({ ...p })),
      configs: template.defaultPorts.configs?.map(p => ({ ...p })),
      outputs: template.defaultPorts.outputs.map(p => ({ ...p })),
    },
    metadata: {
      icon: template.icon,
      color: template.color,
      description: template.description,
    },
    status: ExecutionStatus.IDLE,
    selected: false,
  };
}

/**
 * Color preset for note nodes
 */
export interface NoteColorPreset {
  name: string;
  bg: string;
  text: string;
}

/**
 * Color preset for frame nodes
 */
export interface FrameColorPreset {
  name: string;
  bg: string;
  border: string;
  solid: string;
}

/**
 * Predefined color presets for note nodes
 */
export const NOTE_COLOR_PRESETS: NoteColorPreset[] = [
  { name: 'Yellow', bg: '#fef08a', text: '#713f12' },
  { name: 'Blue', bg: '#bfdbfe', text: '#1e3a5f' },
  { name: 'Green', bg: '#bbf7d0', text: '#14532d' },
  { name: 'Pink', bg: '#fbcfe8', text: '#831843' },
  { name: 'Orange', bg: '#fed7aa', text: '#7c2d12' },
  { name: 'Purple', bg: '#ddd6fe', text: '#4c1d95' },
  { name: 'Gray', bg: '#e5e7eb', text: '#374151' },
];

/**
 * Predefined color presets for frame nodes
 */
export const FRAME_COLOR_PRESETS: FrameColorPreset[] = [
  { name: 'Indigo', bg: 'rgba(99, 102, 241, 0.05)', border: 'rgba(99, 102, 241, 0.3)', solid: '#6366f1' },
  { name: 'Blue', bg: 'rgba(59, 130, 246, 0.05)', border: 'rgba(59, 130, 246, 0.3)', solid: '#3b82f6' },
  { name: 'Green', bg: 'rgba(34, 197, 94, 0.05)', border: 'rgba(34, 197, 94, 0.3)', solid: '#22c55e' },
  { name: 'Orange', bg: 'rgba(249, 115, 22, 0.05)', border: 'rgba(249, 115, 22, 0.3)', solid: '#f97316' },
  { name: 'Red', bg: 'rgba(239, 68, 68, 0.05)', border: 'rgba(239, 68, 68, 0.3)', solid: '#ef4444' },
  { name: 'Purple', bg: 'rgba(168, 85, 247, 0.05)', border: 'rgba(168, 85, 247, 0.3)', solid: '#a855f7' },
  { name: 'Gray', bg: 'rgba(107, 114, 128, 0.05)', border: 'rgba(107, 114, 128, 0.3)', solid: '#6b7280' },
];

/**
 * Helper to check if node type is an annotation node (NOTE or FRAME)
 */
export function isAnnotationNode(type: NodeType): boolean {
  return type === WorkflowNodeType.NOTE || type === WorkflowNodeType.FRAME;
}

/**
 * Helper to check if node type is a frame node
 */
export function isFrameNode(type: NodeType): boolean {
  return type === WorkflowNodeType.FRAME;
}

/**
 * Helper to check if node type is a note node
 */
export function isNoteNode(type: NodeType): boolean {
  return type === WorkflowNodeType.NOTE;
}

/**
 * Set of node types that are persistent/long-running triggers
 */
export const PERSISTENT_TRIGGER_TYPES: Set<NodeType> = new Set([
  WorkflowNodeType.TELEGRAM_BOT,
  WorkflowNodeType.SLACK_SOCKET,
  WorkflowNodeType.DISCORD_BOT,
  WorkflowNodeType.WHATSAPP_WEBHOOK,
  WorkflowNodeType.CUSTOM_WEBSOCKET,
]);

export function isPersistentTriggerNode(type: NodeType): boolean {
  return PERSISTENT_TRIGGER_TYPES.has(type);
}

/**
 * Aggregated port for collapsed frames
 */
export interface AggregatedPort {
  id: string;
  originalEdgeId: string;
  internalNodeId: string;
  internalPortId: string;
  label?: string;
  direction: 'incoming' | 'outgoing';
}

/**
 * Frame resize state
 */
export interface FrameResizeState {
  frameId: string;
  handle: ResizeHandle;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  startPosition: Position;
}

/**
 * Resize handle type
 */
export type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

/**
 * Result from an undo/redo operation
 */
export interface UndoRedoResult {
  success: boolean;
  workflow?: Workflow;
  description?: string;
  error?: string;
}

/**
 * Provider interface for undo/redo operations.
 * Host injects an implementation so the UI never imports from the store.
 */
export interface UndoProvider {
  undo(workflowId: string, workflow: Workflow): UndoRedoResult;
  redo(workflowId: string, workflow: Workflow): UndoRedoResult;
  canUndo(workflowId: string): boolean;
  canRedo(workflowId: string): boolean;
  getUndoDescription(workflowId: string): string | undefined;
  getRedoDescription(workflowId: string): string | undefined;
  recordAddNode(workflowId: string, node: WorkflowNode): void;
  recordDeleteNode(workflowId: string, node: WorkflowNode, connectedEdges: WorkflowEdge[]): void;
  recordMoveNodes(workflowId: string, moves: Array<{ nodeId: string; oldPosition: Position; newPosition: Position }>): void;
  recordUpdateNodeConfig(workflowId: string, nodeId: string, changes: Partial<WorkflowNode>, previousState: Partial<WorkflowNode>): void;
  recordAddEdge(workflowId: string, edge: WorkflowEdge): void;
  recordDeleteEdge(workflowId: string, edge: WorkflowEdge): void;
  recordBulkDelete(workflowId: string, nodes: WorkflowNode[], edges: WorkflowEdge[]): void;
  recordPasteNodes(workflowId: string, nodes: WorkflowNode[], edges: WorkflowEdge[]): void;
  recordDuplicateNodes(workflowId: string, nodes: WorkflowNode[], edges: WorkflowEdge[]): void;
  flushPendingOperations(): void;
  clearUndoHistory(workflowId: string): void;
}
