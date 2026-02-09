import { APIS_URL } from './constants';
import type { Workflow, WorkflowNode, WorkflowEdge } from '../components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import type { WorkflowTemplateDefinition } from './workflow-templates';

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
  isTemplate?: boolean;
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

export interface TriggerDTO {
  id: string;
  workflowId: string;
  name: string;
  type: string;
  configuration: string;
  enabled: boolean;
  webhookToken?: string;
  webhookUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  lastTriggeredAt?: string;
}

export interface TriggerStatusDTO {
  triggerId: string;
  name: string;
  type: string;
  desiredState?: string;
  connectionState: string;
  ownerInstance?: string;
  lastHeartbeat?: string;
  connectedSince?: string;
  messagesReceived?: number;
  lastMessageAt?: string;
  stateReason?: string;
  health?: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  healthMessage?: string;
  inDevMode?: boolean;
  devModeTriggerId?: string;
  devModeExpiresAt?: string;
}

export interface TriggerActivationResult {
  success: boolean;
  triggerId: string;
  message?: string;
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
    applicationId: dto.applicationId,
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
// Note: viewport is no longer saved with workflow - it's stored in KV per user
function workflowToDTO(workflow: Workflow, applicationId: string): Partial<WorkflowDTO> {
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    applicationId,
    variables: workflow.variables ? JSON.stringify(workflow.variables) : undefined,
    // viewport removed - now stored in KV per user
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
  // Get all workflows across all applications
  async getAllWorkflows(): Promise<(Workflow & { applicationId: string; isTemplate: boolean })[]> {
    const response = await fetch(APIS_URL.getAllWorkflows());
    const dtos = await handleResponse<WorkflowDTO[]>(response);
    return dtos.map(dto => ({
      ...dtoToWorkflow(dto),
      applicationId: dto.applicationId,
      isTemplate: dto.isTemplate ?? false,
    }));
  },

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

  // Create a workflow from a template definition (sends nodes + edges)
  async createWorkflowFromTemplate(
    applicationId: string,
    template: WorkflowTemplateDefinition,
    customName?: string
  ): Promise<Workflow> {
    // Build node DTOs from the template, mapping tempIds to placeholder UUIDs
    // The backend will generate real UUIDs — we use tempIds to wire edges
    const tempIdToPlaceholder = new Map<string, string>();
    template.nodes.forEach((n, i) => {
      // Use a predictable placeholder UUID format the backend will replace
      const placeholder = `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`;
      tempIdToPlaceholder.set(n.tempId, placeholder);
    });

    const nodes: Partial<WorkflowNodeDTO>[] = template.nodes.map(n => ({
      name: n.name,
      type: n.type,
      configuration: n.configuration,
      ports: n.ports,
      positionX: n.positionX,
      positionY: n.positionY,
    }));

    const edges: Partial<WorkflowEdgeDTO>[] = template.edges.map(e => ({
      sourceNodeId: tempIdToPlaceholder.get(e.sourceTempId),
      sourcePortId: e.sourcePortId,
      targetNodeId: tempIdToPlaceholder.get(e.targetTempId),
      targetPortId: e.targetPortId,
      label: e.label,
    }));

    // Step 1: Create the workflow (empty)
    const createResponse = await fetch(APIS_URL.createWorkflow(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: customName || template.name,
        description: template.description,
        applicationId,
      }),
    });
    const created = await handleResponse<WorkflowDTO>(createResponse);
    const workflowId = created.id;

    // Step 2: Add nodes one by one and collect real IDs
    const tempIdToRealId = new Map<string, string>();
    for (let i = 0; i < template.nodes.length; i++) {
      const nodePayload = { ...nodes[i], workflowId };
      const nodeResponse = await fetch(APIS_URL.addWorkflowNode(workflowId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodePayload),
      });
      const nodeDto = await handleResponse<WorkflowNodeDTO>(nodeResponse);
      tempIdToRealId.set(template.nodes[i].tempId, nodeDto.id);
    }

    // Step 3: Add edges using real node IDs
    for (const tmplEdge of template.edges) {
      const edgePayload = {
        workflowId,
        sourceNodeId: tempIdToRealId.get(tmplEdge.sourceTempId),
        sourcePortId: tmplEdge.sourcePortId,
        targetNodeId: tempIdToRealId.get(tmplEdge.targetTempId),
        targetPortId: tmplEdge.targetPortId,
        label: tmplEdge.label,
      };
      await fetch(APIS_URL.addWorkflowEdge(workflowId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edgePayload),
      });
    }

    // Step 4: Fetch the complete workflow with all nodes/edges
    const finalResponse = await fetch(APIS_URL.getWorkflow(workflowId));
    const finalDto = await handleResponse<WorkflowDTO>(finalResponse);
    return dtoToWorkflow(finalDto);
  },

  // Get all workflow templates
  async getTemplates(): Promise<(Workflow & { applicationId: string; isTemplate: boolean })[]> {
    const response = await fetch(APIS_URL.getWorkflowTemplates());
    const dtos = await handleResponse<WorkflowDTO[]>(response);
    return dtos.map(dto => ({
      ...dtoToWorkflow(dto),
      applicationId: dto.applicationId,
      isTemplate: dto.isTemplate ?? false,
    }));
  },

  // Set or unset a workflow as a template
  async setTemplate(workflowId: string, isTemplate: boolean): Promise<WorkflowDTO> {
    const response = await fetch(APIS_URL.setWorkflowTemplate(workflowId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isTemplate }),
    });
    return handleResponse<WorkflowDTO>(response);
  },

  // Create a new workflow from a user template
  async createFromTemplate(templateId: string, name: string, applicationId: string): Promise<Workflow> {
    const response = await fetch(APIS_URL.createFromTemplate(templateId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, applicationId }),
    });
    const dto = await handleResponse<WorkflowDTO>(response);
    return dtoToWorkflow(dto);
  },

  // Clone an existing workflow
  async cloneWorkflow(workflowId: string): Promise<Workflow> {
    const response = await fetch(APIS_URL.cloneWorkflow(workflowId), {
      method: 'POST',
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

  // Partial update workflow (name, description, etc.)
  // First fetches current workflow, merges updates, then sends full PUT
  async patchWorkflow(workflowId: string, updates: Partial<{ name: string; description: string }>): Promise<Workflow> {
    // Get current workflow
    const current = await this.getWorkflow(workflowId);

    // Merge updates
    const updatedWorkflow = {
      ...current,
      ...updates,
    };

    // Convert to DTO and send PUT
    const response = await fetch(APIS_URL.updateWorkflow(workflowId), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(workflowToDTO(updatedWorkflow, current.applicationId || '')),
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
  async executeWorkflow(
    workflowId: string,
    input?: Record<string, unknown>,
    options?: { startNodeId?: string }
  ): Promise<ExecutionResult> {
    const body: Record<string, unknown> = {
      input: input || {},
    };

    // Add startNodeId if provided (for partial execution from a specific node)
    if (options?.startNodeId) {
      body.startNodeId = options.startNodeId;
    }

    const response = await fetch(APIS_URL.executeWorkflow(workflowId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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

  // Trigger operations
  async getTriggers(workflowId: string): Promise<TriggerDTO[]> {
    const response = await fetch(APIS_URL.getWorkflowTriggers(workflowId));
    return handleResponse<TriggerDTO[]>(response);
  },

  async getTriggerStatus(triggerId: string): Promise<TriggerStatusDTO> {
    const response = await fetch(APIS_URL.getTriggerStatus(triggerId));
    return handleResponse<TriggerStatusDTO>(response);
  },

  async activateTrigger(triggerId: string): Promise<TriggerActivationResult> {
    const response = await fetch(APIS_URL.activateTrigger(triggerId), {
      method: 'POST',
    });
    return handleResponse<TriggerActivationResult>(response);
  },

  async deactivateTrigger(triggerId: string): Promise<void> {
    const response = await fetch(APIS_URL.deactivateTrigger(triggerId), {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to deactivate trigger');
    }
  },
};
