/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Node types for standard workflow nodes
 */
export enum WorkflowNodeType {
  START = 'START',
  END = 'END',
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
}

/**
 * Node types for agent-based workflows
 */
export enum AgentNodeType {
  AGENT = 'AGENT',
  TOOL = 'TOOL',
  MEMORY = 'MEMORY',
  PROMPT = 'PROMPT',
  LLM = 'LLM',
  RETRIEVER = 'RETRIEVER',
  CHAIN = 'CHAIN',
  ROUTER = 'ROUTER',
  HUMAN_INPUT = 'HUMAN_INPUT',
  OUTPUT_PARSER = 'OUTPUT_PARSER',
}

/**
 * Combined node type union
 */
export type NodeType = WorkflowNodeType | AgentNodeType;

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
 * Data node operation types
 */
export type DataOperation = 'QUERY' | 'INSERT' | 'UPDATE' | 'DELETE';

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
  // Condition node
  expression?: string;
  language?: 'javascript' | 'jsonata';
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
  provider?: 'openai' | 'anthropic' | 'local';
  modelName?: string;
  // Memory node
  memoryType?: 'buffer' | 'summary' | 'vector';
  maxMessages?: number;
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
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, unknown>;
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
    outputs: NodePort[];
  };
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
  // Agent nodes
  [AgentNodeType.AGENT]: '#10b981',
  [AgentNodeType.TOOL]: '#0ea5e9',
  [AgentNodeType.MEMORY]: '#d946ef',
  [AgentNodeType.PROMPT]: '#f472b6',
  [AgentNodeType.LLM]: '#22d3ee',
  [AgentNodeType.RETRIEVER]: '#a78bfa',
  [AgentNodeType.CHAIN]: '#fbbf24',
  [AgentNodeType.ROUTER]: '#fb923c',
  [AgentNodeType.HUMAN_INPUT]: '#4ade80',
  [AgentNodeType.OUTPUT_PARSER]: '#2dd4bf',
};

/**
 * Default node icons by type
 */
export const NODE_ICONS: Record<NodeType, string> = {
  // Workflow nodes
  [WorkflowNodeType.START]: 'play',
  [WorkflowNodeType.END]: 'stop',
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
  // Agent nodes
  [AgentNodeType.AGENT]: 'cpu',
  [AgentNodeType.TOOL]: 'tool',
  [AgentNodeType.MEMORY]: 'hard-drive',
  [AgentNodeType.PROMPT]: 'message-square',
  [AgentNodeType.LLM]: 'brain',
  [AgentNodeType.RETRIEVER]: 'search',
  [AgentNodeType.CHAIN]: 'link',
  [AgentNodeType.ROUTER]: 'git-pull-request',
  [AgentNodeType.HUMAN_INPUT]: 'user',
  [AgentNodeType.OUTPUT_PARSER]: 'file-text',
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
    defaultConfig: { to: '', subject: '', body: '' },
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
      operation: 'QUERY',
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
    defaultConfig: { operation: 'set', variableName: '', value: '' },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Output' }],
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
    defaultConfig: { agentId: '', systemPrompt: '', model: 'gpt-4', tools: [] },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [
        { id: 'out', type: PortType.OUTPUT, label: 'Output' },
        { id: 'tool', type: PortType.OUTPUT, label: 'Tool Call' },
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
    defaultConfig: { toolName: '', toolConfig: {} },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Result' }],
    },
  },
  {
    type: AgentNodeType.MEMORY,
    name: 'Memory',
    description: 'Conversation memory for agents',
    icon: NODE_ICONS[AgentNodeType.MEMORY],
    color: NODE_COLORS[AgentNodeType.MEMORY],
    category: 'agent',
    defaultConfig: { memoryType: 'buffer', maxMessages: 10 },
    defaultPorts: {
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Input' }],
      outputs: [{ id: 'out', type: PortType.OUTPUT, label: 'Context' }],
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
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Variables' }],
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
      inputs: [{ id: 'in', type: PortType.INPUT, label: 'Prompt' }],
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
];

/**
 * Node categories for palette organization
 */
export const NODE_CATEGORIES: NodeCategory[] = [
  {
    id: 'control',
    name: 'Control Flow',
    icon: 'git-branch',
    nodeTypes: [
      WorkflowNodeType.START,
      WorkflowNodeType.END,
      WorkflowNodeType.CONDITION,
      WorkflowNodeType.DELAY,
      WorkflowNodeType.PARALLEL,
      WorkflowNodeType.LOOP,
    ],
  },
  {
    id: 'action',
    name: 'Actions',
    icon: 'zap',
    nodeTypes: [
      WorkflowNodeType.FUNCTION,
      WorkflowNodeType.HTTP,
      WorkflowNodeType.SUB_WORKFLOW,
      WorkflowNodeType.EMAIL,
      WorkflowNodeType.NOTIFICATION,
    ],
  },
  {
    id: 'data',
    name: 'Data',
    icon: 'database',
    nodeTypes: [
      WorkflowNodeType.TRANSFORM,
      WorkflowNodeType.DATABASE,
      WorkflowNodeType.VARIABLE,
    ],
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
      AgentNodeType.TOOL,
      AgentNodeType.RETRIEVER,
      AgentNodeType.CHAIN,
      AgentNodeType.ROUTER,
      AgentNodeType.HUMAN_INPUT,
      AgentNodeType.OUTPUT_PARSER,
    ],
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
