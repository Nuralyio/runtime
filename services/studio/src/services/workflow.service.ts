import { APIS_URL } from './constants';
import type { Workflow, WorkflowNode, WorkflowEdge } from '../features/runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';

export interface WorkflowDTO {
  id: string;
  name: string;
  description?: string;
  applicationId: string;
  status: string;
  version?: number;
  variables?: string;
  viewport?: string; // JSON string: {"zoom": 1, "panX": 0, "panY": 0}
  nodes: WorkflowNodeDTO[];
  edges: WorkflowEdgeDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowNodeDTO {
  id: string;
  workflowId: string;
  name: string;
  type: string;
  configuration: string;
  ports: string;
  positionX: number;
  positionY: number;
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export interface WorkflowEdgeDTO {
  id: string;
  workflowId: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
  condition?: string;
  label?: string;
  priority?: number;
}

export interface CreateWorkflowDTO {
  name: string;
  description?: string;
  applicationId: string;
}

export interface ExecutionResult {
  id: string;
  workflowId: string;
  status: string;
  inputData?: string;
  outputData?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

// Convert from backend DTO to canvas Workflow format
function dtoToWorkflow(dto: WorkflowDTO): Workflow {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    nodes: dto.nodes?.map(dtoToNode) || [],
    edges: dto.edges?.map(dtoToEdge) || [],
    variables: dto.variables ? JSON.parse(dto.variables) : undefined,
    viewport: dto.viewport ? JSON.parse(dto.viewport) : undefined,
    version: dto.version?.toString(),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function dtoToNode(dto: WorkflowNodeDTO): WorkflowNode {
  const ports = dto.ports ? JSON.parse(dto.ports) : { inputs: [], outputs: [] };
  const configuration = dto.configuration ? JSON.parse(dto.configuration) : {};
  const metadata = configuration.metadata || {};
  delete configuration.metadata;

  return {
    id: dto.id,
    name: dto.name,
    type: dto.type as any,
    position: { x: dto.positionX || 0, y: dto.positionY || 0 },
    configuration,
    ports,
    metadata: {
      maxRetries: dto.maxRetries,
      retryDelayMs: dto.retryDelayMs,
      timeoutMs: dto.timeoutMs,
      ...metadata,
    },
  };
}

function dtoToEdge(dto: WorkflowEdgeDTO): WorkflowEdge {
  return {
    id: dto.id,
    sourceNodeId: dto.sourceNodeId,
    sourcePortId: dto.sourcePortId || 'out',
    targetNodeId: dto.targetNodeId,
    targetPortId: dto.targetPortId || 'in',
    label: dto.label,
    condition: dto.condition,
    priority: dto.priority,
  };
}

// Convert from canvas Workflow to backend DTO format
function workflowToDTO(workflow: Workflow, applicationId: string): Partial<WorkflowDTO> {
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    applicationId,
    variables: workflow.variables ? JSON.stringify(workflow.variables) : undefined,
    viewport: workflow.viewport ? JSON.stringify(workflow.viewport) : undefined,
  };
}

function nodeToDTO(node: WorkflowNode, workflowId: string, includeId = true): Partial<WorkflowNodeDTO> {
  const dto: Partial<WorkflowNodeDTO> = {
    workflowId,
    name: node.name,
    type: node.type,
    configuration: JSON.stringify({ ...node.configuration, metadata: node.metadata }),
    ports: JSON.stringify(node.ports),
    positionX: node.position.x,
    positionY: node.position.y,
    maxRetries: node.metadata?.maxRetries,
    retryDelayMs: node.metadata?.retryDelayMs,
    timeoutMs: node.metadata?.timeoutMs,
  };
  // Only include ID if it's a valid UUID (for updates)
  if (includeId && node.id && isValidUUID(node.id)) {
    dto.id = node.id;
  }
  return dto;
}

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

function edgeToDTO(edge: WorkflowEdge, workflowId: string, includeId = true): Partial<WorkflowEdgeDTO> {
  const dto: Partial<WorkflowEdgeDTO> = {
    workflowId,
    sourceNodeId: edge.sourceNodeId,
    sourcePortId: edge.sourcePortId,
    targetNodeId: edge.targetNodeId,
    targetPortId: edge.targetPortId,
    condition: edge.condition,
    label: edge.label,
    priority: edge.priority,
  };
  // Only include ID if it's a valid UUID (for updates)
  if (includeId && edge.id && isValidUUID(edge.id)) {
    dto.id = edge.id;
  }
  return dto;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
}

export const workflowService = {
  // Get all workflows for an application
  async getWorkflowsByApplication(applicationId: string): Promise<Workflow[]> {
    const response = await fetch(APIS_URL.getWorkflows(applicationId));
    const dtos = await handleResponse<WorkflowDTO[]>(response);
    return dtos.map(dtoToWorkflow);
  },

  // Get a single workflow
  async getWorkflow(id: string): Promise<Workflow> {
    const response = await fetch(APIS_URL.getWorkflow(id));
    const dto = await handleResponse<WorkflowDTO>(response);
    return dtoToWorkflow(dto);
  },

  // Create a new workflow
  async createWorkflow(applicationId: string, name: string, description?: string): Promise<Workflow> {
    const response = await fetch(APIS_URL.createWorkflow(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, applicationId }),
    });
    const dto = await handleResponse<WorkflowDTO>(response);
    return dtoToWorkflow(dto);
  },

  // Update workflow metadata
  async updateWorkflow(workflow: Workflow, applicationId: string): Promise<Workflow> {
    const response = await fetch(APIS_URL.updateWorkflow(workflow.id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflowToDTO(workflow, applicationId)),
    });
    const dto = await handleResponse<WorkflowDTO>(response);
    return dtoToWorkflow(dto);
  },

  // Delete a workflow
  async deleteWorkflow(id: string): Promise<void> {
    const response = await fetch(APIS_URL.deleteWorkflow(id), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete workflow');
    }
  },

  // Node operations
  async addNode(workflowId: string, node: WorkflowNode): Promise<WorkflowNode> {
    const response = await fetch(APIS_URL.addWorkflowNode(workflowId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Don't include ID for new nodes - let backend generate UUID
      body: JSON.stringify(nodeToDTO(node, workflowId, false)),
    });
    const dto = await handleResponse<WorkflowNodeDTO>(response);
    return dtoToNode(dto);
  },

  async updateNode(node: WorkflowNode, workflowId: string): Promise<WorkflowNode> {
    const response = await fetch(APIS_URL.updateWorkflowNode(workflowId, node.id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nodeToDTO(node, workflowId)),
    });
    const dto = await handleResponse<WorkflowNodeDTO>(response);
    return dtoToNode(dto);
  },

  async deleteNode(nodeId: string, workflowId: string): Promise<void> {
    const response = await fetch(APIS_URL.deleteWorkflowNode(workflowId, nodeId), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete node');
    }
  },

  // Edge operations
  async addEdge(workflowId: string, edge: WorkflowEdge): Promise<WorkflowEdge> {
    const response = await fetch(APIS_URL.addWorkflowEdge(workflowId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Don't include ID for new edges - let backend generate UUID
      body: JSON.stringify(edgeToDTO(edge, workflowId, false)),
    });
    const dto = await handleResponse<WorkflowEdgeDTO>(response);
    return dtoToEdge(dto);
  },

  async deleteEdge(edgeId: string, workflowId: string): Promise<void> {
    const response = await fetch(APIS_URL.deleteWorkflowEdge(workflowId, edgeId), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete edge');
    }
  },

  // Execution
  async executeWorkflow(workflowId: string, input?: Record<string, unknown>): Promise<ExecutionResult> {
    const response = await fetch(APIS_URL.executeWorkflow(workflowId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: input ? JSON.stringify(input) : '{}' }),
    });
    return handleResponse<ExecutionResult>(response);
  },

  async getExecutions(workflowId: string): Promise<ExecutionResult[]> {
    const response = await fetch(APIS_URL.getWorkflowExecutions(workflowId));
    return handleResponse<ExecutionResult[]>(response);
  },

  async getExecution(executionId: string): Promise<ExecutionResult> {
    const response = await fetch(APIS_URL.getWorkflowExecution(executionId));
    return handleResponse<ExecutionResult>(response);
  },
};
