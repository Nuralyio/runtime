/**
 * Shared Workflow Utilities
 * Reusable functions for workflow DTO conversion and viewport management
 */

import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  CanvasViewport,
} from '../features/runtime/components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';

/**
 * Backend DTO format for workflows
 */
export interface WorkflowDTO {
  id: string;
  name: string;
  description?: string;
  applicationId?: string;
  status?: string;
  version?: number;
  variables?: string;
  viewport?: string;
  nodes?: WorkflowNodeDTO[];
  edges?: WorkflowEdgeDTO[];
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkflowNodeDTO {
  id: string;
  workflowId?: string;
  name: string;
  type: string;
  configuration: string;
  ports: string;
  positionX: number;
  positionY: number;
  position?: { x: number; y: number };
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
  metadata?: Record<string, unknown>;
}

export interface WorkflowEdgeDTO {
  id: string;
  workflowId?: string;
  sourceNodeId: string;
  sourcePortId?: string;
  targetNodeId: string;
  targetPortId?: string;
  condition?: string;
  label?: string;
  priority?: number;
}

/**
 * Convert backend DTO format to canvas format
 * Backend returns positionX/Y as numbers and configuration/ports as JSON strings
 * Canvas expects position as {x,y} object and configuration/ports as parsed objects
 */
export function convertDtoToWorkflow(dto: WorkflowDTO | null | undefined): Workflow | null {
  if (!dto) return null;

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    applicationId: dto.applicationId,
    nodes: (dto.nodes || []).map((n): WorkflowNode => {
      // Parse configuration and ports if they're strings
      const config = typeof n.configuration === 'string'
        ? JSON.parse(n.configuration || '{}')
        : (n.configuration || {});
      const ports = typeof n.ports === 'string'
        ? JSON.parse(n.ports || '{}')
        : (n.ports || { inputs: [], outputs: [] });

      // Extract metadata from config (backend stores it there)
      const metadata = config.metadata || n.metadata || {};
      delete config.metadata;

      return {
        id: n.id,
        name: n.name,
        type: n.type,
        position: n.position || { x: n.positionX || 0, y: n.positionY || 0 },
        configuration: config,
        ports,
        metadata: {
          maxRetries: n.maxRetries,
          retryDelayMs: n.retryDelayMs,
          timeoutMs: n.timeoutMs,
          ...metadata,
        },
      };
    }),
    edges: (dto.edges || []).map((e): WorkflowEdge => ({
      id: e.id,
      sourceNodeId: e.sourceNodeId,
      sourcePortId: e.sourcePortId || 'out',
      targetNodeId: e.targetNodeId,
      targetPortId: e.targetPortId || 'in',
      label: e.label,
      condition: e.condition,
      priority: e.priority,
    })),
    // Parse viewport from JSON string if present
    viewport: dto.viewport
      ? (typeof dto.viewport === 'string' ? JSON.parse(dto.viewport) : dto.viewport)
      : undefined,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/**
 * Convert canvas workflow to backend DTO format
 */
export function convertWorkflowToDto(workflow: Workflow, applicationId?: string): WorkflowDTO {
  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    applicationId: applicationId || workflow.applicationId,
    variables: workflow.variables ? JSON.stringify(workflow.variables) : undefined,
    nodes: workflow.nodes?.map((node): WorkflowNodeDTO => ({
      id: node.id,
      name: node.name,
      type: node.type,
      configuration: JSON.stringify({ ...node.configuration, metadata: node.metadata }),
      ports: JSON.stringify(node.ports),
      positionX: node.position.x,
      positionY: node.position.y,
      maxRetries: node.metadata?.maxRetries as number | undefined,
      retryDelayMs: node.metadata?.retryDelayMs as number | undefined,
      timeoutMs: node.metadata?.timeoutMs as number | undefined,
    })),
    edges: workflow.edges?.map((edge): WorkflowEdgeDTO => ({
      id: edge.id,
      sourceNodeId: edge.sourceNodeId,
      sourcePortId: edge.sourcePortId,
      targetNodeId: edge.targetNodeId,
      targetPortId: edge.targetPortId,
      condition: edge.condition,
      label: edge.label,
      priority: edge.priority,
    })),
  };
}

/**
 * Viewport debouncer interface
 */
export interface ViewportDebouncer {
  /** Call this when viewport changes to trigger debounced save */
  update: (viewport: CanvasViewport) => void;
  /** Cancel any pending save */
  cancel: () => void;
  /** Get the current pending viewport (if any) */
  getCurrentViewport: () => CanvasViewport | null;
}

/**
 * Create a viewport debouncer that saves after a delay
 * Useful for saving viewport state to KV without excessive API calls
 *
 * @param saveCallback - Function to call with viewport when debounce completes
 * @param debounceMs - Milliseconds to wait before saving (default: 500)
 * @returns Debouncer object with update and cancel methods
 */
export function createViewportDebouncer(
  saveCallback: (viewport: CanvasViewport) => void,
  debounceMs: number = 500
): ViewportDebouncer {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let pendingViewport: CanvasViewport | null = null;

  return {
    update(viewport: CanvasViewport): void {
      pendingViewport = viewport;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (pendingViewport) {
          saveCallback(pendingViewport);
          pendingViewport = null;
        }
        timeoutId = null;
      }, debounceMs);
    },

    cancel(): void {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      pendingViewport = null;
    },

    getCurrentViewport(): CanvasViewport | null {
      return pendingViewport;
    },
  };
}

/**
 * Get default viewport settings
 */
export function getDefaultViewport(): CanvasViewport {
  return {
    zoom: 1,
    panX: 0,
    panY: 0,
  };
}
