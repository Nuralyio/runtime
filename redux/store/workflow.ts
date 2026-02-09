import { atom, map } from "nanostores";
import type { Workflow, WorkflowNode, WorkflowEdge, CanvasViewport } from "../../components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types";
import { workflowService, type ExecutionResult } from "../../services/workflow.service";
import { getKvEntry, setKvEntry } from "./kv";

/**
 * Save status enum
 */
export type WorkflowSaveStatus = 'saved' | 'saving' | 'error' | 'dirty';

/**
 * Workflow cache data structure
 */
export interface WorkflowCache {
  workflows: Workflow[];
  loading: boolean;
  timestamp: number;
}

/**
 * Execution state
 */
export interface WorkflowExecutionState {
  isExecuting: boolean;
  currentExecution: ExecutionResult | null;
  executionHistory: ExecutionResult[];
}

/**
 * Cache duration in milliseconds (5 minutes)
 */
const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Store for workflow cache
 * Key: applicationId
 */
export const $workflowCache = map<Record<string, WorkflowCache>>({});

/**
 * Currently selected workflow
 */
export const $currentWorkflow = atom<Workflow | null>(null);

/**
 * Current workflow ID
 */
export const $currentWorkflowId = atom<string | null>(null);

/**
 * Save status for UI feedback
 */
export const $workflowSaveStatus = atom<WorkflowSaveStatus>('saved');

/**
 * Execution state
 */
export const $workflowExecution = atom<WorkflowExecutionState>({
  isExecuting: false,
  currentExecution: null,
  executionHistory: [],
});

/**
 * Track in-flight requests to prevent duplicate fetches
 */
const pendingRequests = new Map<string, Promise<Workflow[] | null>>();

/**
 * Debounce timer for auto-save
 */
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 500;

/**
 * Track the last saved workflow state for diffing
 */
let lastSavedWorkflow: Workflow | null = null;

/**
 * Set the last saved workflow state (for when workflow loaded from external source)
 */
export function setLastSavedWorkflow(workflow: Workflow | null): void {
  lastSavedWorkflow = workflow ? JSON.parse(JSON.stringify(workflow)) : null;
}

/**
 * Get workflows from cache or fetch
 */
export async function getWorkflows(
  appId: string,
  forceRefresh = false
): Promise<Workflow[] | null> {
  if (!appId) return null;

  const cache = $workflowCache.get();
  const now = Date.now();

  // Check cache first (unless force refresh)
  if (!forceRefresh && cache[appId]) {
    const entry = cache[appId];
    if (now - entry.timestamp < CACHE_DURATION && entry.workflows.length > 0) {
      return entry.workflows;
    }
  }

  // Check if there's already a pending request
  if (pendingRequests.has(appId)) {
    return pendingRequests.get(appId)!;
  }

  // Mark as loading
  const existingData = cache[appId] || { workflows: [], loading: false, timestamp: 0 };
  $workflowCache.setKey(appId, {
    ...existingData,
    loading: true,
    timestamp: now
  });

  // Create the fetch promise
  const fetchPromise = workflowService.getWorkflowsByApplication(appId)
    .then((workflows) => {
      const currentCache = $workflowCache.get();
      const currentData = currentCache[appId] || { workflows: [], loading: false, timestamp: 0 };

      $workflowCache.setKey(appId, {
        ...currentData,
        workflows: workflows || [],
        loading: false,
        timestamp: Date.now()
      });
      return workflows;
    })
    .catch((error) => {
      console.error('Failed to fetch workflows:', error);
      const currentCache = $workflowCache.get();
      const currentData = currentCache[appId] || { workflows: [], loading: false, timestamp: 0 };
      $workflowCache.setKey(appId, {
        ...currentData,
        loading: false,
        timestamp: Date.now()
      });
      return null;
    })
    .finally(() => {
      pendingRequests.delete(appId);
    });

  pendingRequests.set(appId, fetchPromise);
  return fetchPromise;
}

/**
 * Get or create a workflow for the application
 * @param appId - The application ID
 * @param workflowId - Optional specific workflow ID to load
 */
export async function getOrCreateWorkflow(appId: string, workflowId?: string): Promise<Workflow | null> {
  const workflows = await getWorkflows(appId);

  if (workflows && workflows.length > 0) {
    // Update workflows list
    $workflows.set(workflows);

    let selectedWorkflow = workflows[0];

    // If a specific workflowId is requested, find it
    if (workflowId) {
      const requested = workflows.find(wf => wf.id === workflowId);
      if (requested) {
        selectedWorkflow = requested;
      }
    } else {
      // Prefer workflows with nodes, otherwise use the first one
      // This handles the case where empty workflows were created before proper ones
      for (const wf of workflows) {
        if (wf.nodes && wf.nodes.length > 0) {
          selectedWorkflow = wf;
          break;
        }
      }
    }

    // Fetch the full workflow with nodes (list endpoint may not include nodes)
    const fullWorkflow = await workflowService.getWorkflow(selectedWorkflow.id);
    $currentWorkflow.set(fullWorkflow);
    $currentWorkflowId.set(fullWorkflow.id);
    // Track loaded state for diffing on save
    lastSavedWorkflow = JSON.parse(JSON.stringify(fullWorkflow));
    return fullWorkflow;
  }

  // Create a default workflow if none exists
  try {
    const newWorkflow = await workflowService.createWorkflow(appId, 'Main Workflow', 'Default workflow for this application');
    $currentWorkflow.set(newWorkflow);
    $currentWorkflowId.set(newWorkflow.id);
    // Track loaded state for diffing on save
    lastSavedWorkflow = JSON.parse(JSON.stringify(newWorkflow));

    // Update cache
    const cache = $workflowCache.get();
    const existingData = cache[appId] || { workflows: [], loading: false, timestamp: 0 };
    $workflowCache.setKey(appId, {
      ...existingData,
      workflows: [newWorkflow],
      timestamp: Date.now()
    });

    // Update workflows list
    $workflows.set([newWorkflow]);

    return newWorkflow;
  } catch (error) {
    console.error('Failed to create workflow:', error);
    return null;
  }
}

/**
 * Load a specific workflow
 */
export async function loadWorkflow(workflowId: string): Promise<Workflow | null> {
  try {
    const workflow = await workflowService.getWorkflow(workflowId);
    $currentWorkflow.set(workflow);
    $currentWorkflowId.set(workflow.id);
    // Track loaded state for diffing on save
    lastSavedWorkflow = JSON.parse(JSON.stringify(workflow));
    return workflow;
  } catch (error) {
    console.error('Failed to load workflow:', error);
    return null;
  }
}

/**
 * Update the current workflow in memory (for canvas changes)
 */
export function updateCurrentWorkflow(workflow: Workflow): void {
  $currentWorkflow.set(workflow);
  $workflowSaveStatus.set('dirty');
}

/**
 * Save the current workflow (with debounce)
 */
export function saveCurrentWorkflowDebounced(appId: string): void {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }

  saveDebounceTimer = setTimeout(() => {
    saveCurrentWorkflow(appId);
  }, SAVE_DEBOUNCE_MS);
}

/**
 * Check if a string is a valid UUID
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Save the current workflow immediately
 * Syncs nodes and edges by diffing with last saved state
 */
export async function saveCurrentWorkflow(appId: string): Promise<boolean> {
  const workflow = $currentWorkflow.get();
  if (!workflow) return false;

  $workflowSaveStatus.set('saving');

  try {
    // Update workflow metadata
    await workflowService.updateWorkflow(workflow, appId);

    // Track ID mappings from client-generated IDs to server UUIDs
    const nodeIdMap = new Map<string, string>();

    // Sync nodes - diff with last saved state
    const oldNodes = lastSavedWorkflow?.nodes || [];
    const newNodes = workflow.nodes || [];
    const oldNodeIds = new Set(oldNodes.map(n => n.id));
    const newNodeIds = new Set(newNodes.map(n => n.id));

    // Add new nodes (nodes with non-UUID IDs are new)
    for (const node of newNodes) {
      if (!oldNodeIds.has(node.id) || !isValidUUID(node.id)) {
        const savedNode = await workflowService.addNode(workflow.id, node);
        // Map client ID to server-generated UUID
        nodeIdMap.set(node.id, savedNode.id);
      }
    }

    // Update existing nodes (position, config changes) - only those with valid UUIDs
    for (const node of newNodes) {
      if (oldNodeIds.has(node.id) && isValidUUID(node.id)) {
        const oldNode = oldNodes.find(n => n.id === node.id);
        if (oldNode && JSON.stringify(oldNode) !== JSON.stringify(node)) {
          try {
            await workflowService.updateNode(node, workflow.id);
          } catch (error: any) {
            // If node doesn't exist (404), create it instead
            if (error.message?.includes('404') || error.message?.includes('not found')) {
              console.warn('Node not found, creating instead:', node.id);
              const savedNode = await workflowService.addNode(workflow.id, node);
              nodeIdMap.set(node.id, savedNode.id);
            } else {
              throw error;
            }
          }
        }
      }
    }

    // Delete removed nodes - only those with valid UUIDs
    for (const oldNode of oldNodes) {
      if (!newNodeIds.has(oldNode.id) && isValidUUID(oldNode.id)) {
        await workflowService.deleteNode(oldNode.id, workflow.id);
      }
    }

    // Sync edges - diff with last saved state
    const oldEdges = lastSavedWorkflow?.edges || [];
    const newEdges = workflow.edges || [];
    const oldEdgeIds = new Set(oldEdges.map(e => e.id));

    // Add new edges - map node IDs if needed
    for (const edge of newEdges) {
      if (!oldEdgeIds.has(edge.id) || !isValidUUID(edge.id)) {
        // Map source/target node IDs if they were newly created
        const mappedEdge = {
          ...edge,
          sourceNodeId: nodeIdMap.get(edge.sourceNodeId) || edge.sourceNodeId,
          targetNodeId: nodeIdMap.get(edge.targetNodeId) || edge.targetNodeId,
        };
        await workflowService.addEdge(workflow.id, mappedEdge);
      }
    }

    // Delete removed edges - only those with valid UUIDs
    for (const oldEdge of oldEdges) {
      const stillExists = newEdges.some(e => e.id === oldEdge.id);
      if (!stillExists && isValidUUID(oldEdge.id)) {
        await workflowService.deleteEdge(oldEdge.id, workflow.id);
      }
    }

    // Update local workflow with server-generated UUIDs
    if (nodeIdMap.size > 0) {
      const updatedNodes = workflow.nodes.map(node => ({
        ...node,
        id: nodeIdMap.get(node.id) || node.id
      }));
      const updatedEdges = workflow.edges.map(edge => ({
        ...edge,
        sourceNodeId: nodeIdMap.get(edge.sourceNodeId) || edge.sourceNodeId,
        targetNodeId: nodeIdMap.get(edge.targetNodeId) || edge.targetNodeId,
      }));
      const updatedWorkflow = { ...workflow, nodes: updatedNodes, edges: updatedEdges };
      $currentWorkflow.set(updatedWorkflow);
      lastSavedWorkflow = JSON.parse(JSON.stringify(updatedWorkflow));
    } else {
      // Update last saved state
      lastSavedWorkflow = JSON.parse(JSON.stringify(workflow));
    }

    $workflowSaveStatus.set('saved');

    // Update cache
    const cache = $workflowCache.get();
    const existingData = cache[appId] || { workflows: [], loading: false, timestamp: 0 };
    const currentWorkflow = $currentWorkflow.get();
    const updatedWorkflows = existingData.workflows.map(w =>
      w.id === workflow.id ? currentWorkflow : w
    );
    $workflowCache.setKey(appId, {
      ...existingData,
      workflows: updatedWorkflows,
      timestamp: Date.now()
    });

    return true;
  } catch (error) {
    console.error('Failed to save workflow:', error);
    $workflowSaveStatus.set('error');
    return false;
  }
}

/**
 * Add a node to the current workflow
 */
export async function addNode(node: WorkflowNode): Promise<WorkflowNode | null> {
  const workflow = $currentWorkflow.get();
  if (!workflow) return null;

  try {
    const savedNode = await workflowService.addNode(workflow.id, node);

    // Update local state
    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, savedNode]
    };
    $currentWorkflow.set(updatedWorkflow);

    return savedNode;
  } catch (error) {
    console.error('Failed to add node:', error);
    return null;
  }
}

/**
 * Update a node
 */
export async function updateNode(node: WorkflowNode): Promise<WorkflowNode | null> {
  const workflow = $currentWorkflow.get();
  if (!workflow) return null;

  try {
    const savedNode = await workflowService.updateNode(node, workflow.id);

    // Update local state
    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(n => n.id === savedNode.id ? savedNode : n)
    };
    $currentWorkflow.set(updatedWorkflow);

    return savedNode;
  } catch (error) {
    console.error('Failed to update node:', error);
    return null;
  }
}

/**
 * Delete a node
 */
export async function deleteNode(nodeId: string): Promise<boolean> {
  const workflow = $currentWorkflow.get();
  if (!workflow) return false;

  try {
    await workflowService.deleteNode(nodeId, workflow.id);

    // Update local state - remove node and connected edges
    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.filter(n => n.id !== nodeId),
      edges: workflow.edges.filter(e => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId)
    };
    $currentWorkflow.set(updatedWorkflow);

    return true;
  } catch (error) {
    console.error('Failed to delete node:', error);
    return false;
  }
}

/**
 * Add an edge
 */
export async function addEdge(edge: WorkflowEdge): Promise<WorkflowEdge | null> {
  const workflow = $currentWorkflow.get();
  if (!workflow) return null;

  try {
    const savedEdge = await workflowService.addEdge(workflow.id, edge);

    // Update local state
    const updatedWorkflow = {
      ...workflow,
      edges: [...workflow.edges, savedEdge]
    };
    $currentWorkflow.set(updatedWorkflow);

    return savedEdge;
  } catch (error) {
    console.error('Failed to add edge:', error);
    return null;
  }
}

/**
 * Delete an edge
 */
export async function deleteEdge(edgeId: string): Promise<boolean> {
  const workflow = $currentWorkflow.get();
  if (!workflow) return false;

  try {
    await workflowService.deleteEdge(edgeId, workflow.id);

    // Update local state
    const updatedWorkflow = {
      ...workflow,
      edges: workflow.edges.filter(e => e.id !== edgeId)
    };
    $currentWorkflow.set(updatedWorkflow);

    return true;
  } catch (error) {
    console.error('Failed to delete edge:', error);
    return false;
  }
}

/**
 * Execute a workflow
 * @param input - Optional input data for the workflow
 * @param workflowId - Optional workflow ID (uses $currentWorkflow if not provided)
 * @param options - Optional execution options (e.g., startNodeId for partial execution)
 */
export async function executeWorkflow(
  input?: Record<string, unknown>,
  workflowId?: string,
  options?: { startNodeId?: string }
): Promise<ExecutionResult | null> {
  const workflow = $currentWorkflow.get();
  const targetWorkflowId = workflowId || workflow?.id;
  if (!targetWorkflowId) return null;

  const currentState = $workflowExecution.get();
  $workflowExecution.set({
    ...currentState,
    isExecuting: true,
    currentExecution: null
  });

  try {
    const result = await workflowService.executeWorkflow(targetWorkflowId, input, options);

    $workflowExecution.set({
      ...currentState,
      isExecuting: false,
      currentExecution: result,
      executionHistory: [result, ...currentState.executionHistory]
    });

    return result;
  } catch (error) {
    console.error('Failed to execute workflow:', error);
    $workflowExecution.set({
      ...currentState,
      isExecuting: false,
      currentExecution: null
    });
    return null;
  }
}

/**
 * Load execution history
 */
export async function loadExecutionHistory(): Promise<ExecutionResult[]> {
  const workflow = $currentWorkflow.get();
  if (!workflow) return [];

  try {
    const history = await workflowService.getExecutions(workflow.id);
    const currentState = $workflowExecution.get();
    $workflowExecution.set({
      ...currentState,
      executionHistory: history
    });
    return history;
  } catch (error) {
    console.error('Failed to load execution history:', error);
    return [];
  }
}

/**
 * Clear current workflow
 */
export function clearCurrentWorkflow(): void {
  $currentWorkflow.set(null);
  $currentWorkflowId.set(null);
  $workflowSaveStatus.set('saved');
  $workflowExecution.set({
    isExecuting: false,
    currentExecution: null,
    executionHistory: []
  });
}

/**
 * Invalidate workflow cache for an app
 */
export function invalidateWorkflowCache(appId: string): void {
  const cache = $workflowCache.get();
  if (cache[appId]) {
    const { [appId]: _, ...rest } = cache;
    $workflowCache.set(rest);
  }
}

/**
 * Environment detection flag
 */
const isServer: boolean = typeof window === "undefined";

/**
 * Current workflows list for the app
 */
export const $workflows = atom<Workflow[]>([]);

// Sync workflow state to runtime Vars (reactive - create new objects to trigger change detection)
$currentWorkflow.subscribe((workflow) => {
  if (isServer) return;
  const instance = (globalThis as any).__NURALY_EXECUTE_INSTANCE__;
  if (instance?.VarsProxy) {
    instance.VarsProxy.currentWorkflow = workflow ? { ...workflow } : null;
  }
});

$workflows.subscribe((workflows) => {
  if (isServer) return;
  const instance = (globalThis as any).__NURALY_EXECUTE_INSTANCE__;
  if (instance?.VarsProxy) {
    instance.VarsProxy.workflows = [...(workflows || [])];
  }
});

/**
 * Refresh workflows list for an app
 */
export async function refreshWorkflows(appId: string): Promise<Workflow[]> {
  const workflows = await getWorkflows(appId, true);
  $workflows.set(workflows || []);
  return workflows || [];
}

/**
 * Create a new workflow
 */
export async function createNewWorkflow(appId: string, name: string): Promise<Workflow | null> {
  try {
    const workflow = await workflowService.createWorkflow(appId, name, '');

    // Update workflows list
    const currentWorkflows = $workflows.get();
    $workflows.set([...currentWorkflows, workflow]);

    // Set as current workflow
    $currentWorkflow.set(workflow);
    $currentWorkflowId.set(workflow.id);
    // Track loaded state for diffing on save
    lastSavedWorkflow = JSON.parse(JSON.stringify(workflow));

    return workflow;
  } catch (error) {
    console.error('Failed to create workflow:', error);
    return null;
  }
}

/**
 * Load workflow by ID and set as current
 */
export async function loadWorkflowById(workflowId: string): Promise<Workflow | null> {
  return loadWorkflow(workflowId);
}

// ============================================================================
// Workflow Canvas Viewport (per user, per workflow)
// ============================================================================

/**
 * In-memory cache for workflow viewports
 */
export const $workflowViewports = atom<Record<string, CanvasViewport>>({});

/**
 * Build KV key path for workflow viewport
 */
function buildWorkflowViewportKeyPath(workflowId: string): string {
  return `_user_prefs/workflow_viewport/${workflowId}`;
}

/**
 * Get default viewport
 */
export function getDefaultWorkflowViewport(): CanvasViewport {
  return {
    zoom: 1,
    panX: 0,
    panY: 0,
  };
}

/**
 * Get viewport for a workflow (from cache or KV)
 */
export async function getWorkflowViewport(
  workflowId: string,
  applicationId: string
): Promise<CanvasViewport | null> {
  // Check in-memory cache first
  const cached = $workflowViewports.get()[workflowId];
  if (cached) return cached;

  // Fetch from KV
  const keyPath = buildWorkflowViewportKeyPath(workflowId);
  const entry = await getKvEntry(applicationId, keyPath);

  if (entry?.value) {
    const viewport = entry.value as CanvasViewport;
    // Update cache
    $workflowViewports.set({
      ...$workflowViewports.get(),
      [workflowId]: viewport,
    });
    return viewport;
  }

  return null;
}

/**
 * Save viewport for a workflow to KV
 */
export async function saveWorkflowViewport(
  workflowId: string,
  applicationId: string,
  viewport: CanvasViewport
): Promise<boolean> {
  // Update in-memory cache immediately
  $workflowViewports.set({
    ...$workflowViewports.get(),
    [workflowId]: viewport,
  });

  // Persist to KV with user scope
  const keyPath = buildWorkflowViewportKeyPath(workflowId);
  const result = await setKvEntry(keyPath, {
    applicationId,
    scope: 'user',
    value: viewport,
    isSecret: false,
  });

  return result !== null;
}

/**
 * Migrate viewport from workflow to KV (one-time migration)
 * Call this when loading a workflow that has viewport in the workflow data
 */
export async function migrateWorkflowViewportToKv(
  workflowId: string,
  applicationId: string,
  viewport: CanvasViewport
): Promise<void> {
  // Check if already migrated (exists in KV)
  const existing = await getWorkflowViewport(workflowId, applicationId);
  if (!existing) {
    // Migrate to KV
    await saveWorkflowViewport(workflowId, applicationId, viewport);
  }
}
