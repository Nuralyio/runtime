import { $currentApplication } from '../../store/apps';
import { eventDispatcher } from '../../../utils/change-detection';
import { showToast } from '../../../utils/toast';
import type { Workflow, WorkflowNode, WorkflowEdge } from '../../../components/ui/nuraly-ui/src/components/canvas/workflow-canvas.types';
import {
  $currentWorkflow,
  $workflowSaveStatus,
  updateCurrentWorkflow,
  saveCurrentWorkflowDebounced,
  saveCurrentWorkflow,
  addNode as storeAddNode,
  updateNode as storeUpdateNode,
  deleteNode as storeDeleteNode,
  addEdge as storeAddEdge,
  deleteEdge as storeDeleteEdge,
  executeWorkflow as storeExecuteWorkflow,
  getOrCreateWorkflow,
  loadWorkflow,
  clearCurrentWorkflow,
} from '../../store/workflow';

/**
 * Handle workflow-changed event from canvas
 * This is called when the canvas emits a workflow-changed event
 */
export function handleWorkflowChanged(workflow: Workflow): void {
  const appId = $currentApplication.get()?.uuid;
  if (!appId) {
    console.error('No application selected');
    return;
  }

  // Update local state immediately
  updateCurrentWorkflow(workflow);

  // Debounced save to backend
  saveCurrentWorkflowDebounced(appId);

  // Emit event for other listeners
  eventDispatcher.emit('workflow:changed', { workflow });
}

/**
 * Handle node-added event from canvas
 */
export async function handleNodeAdded(node: WorkflowNode): Promise<WorkflowNode | null> {
  const savedNode = await storeAddNode(node);

  if (savedNode) {
    eventDispatcher.emit('workflow:node-added', { node: savedNode });
    showToast({ message: 'Node added', type: 'success' });
  } else {
    showToast({ message: 'Failed to add node', type: 'error' });
  }

  return savedNode;
}

/**
 * Handle node-configured event from canvas
 */
export async function handleNodeConfigured(node: WorkflowNode): Promise<WorkflowNode | null> {
  const savedNode = await storeUpdateNode(node);

  if (savedNode) {
    eventDispatcher.emit('workflow:node-configured', { node: savedNode });
  } else {
    showToast({ message: 'Failed to save node configuration', type: 'error' });
  }

  return savedNode;
}

/**
 * Handle node-moved event from canvas
 */
export async function handleNodeMoved(node: WorkflowNode): Promise<WorkflowNode | null> {
  // For position changes, we can batch these or debounce
  const savedNode = await storeUpdateNode(node);

  if (savedNode) {
    eventDispatcher.emit('workflow:node-moved', { node: savedNode });
  }

  return savedNode;
}

/**
 * Handle node-removed event from canvas
 */
export async function handleNodeRemoved(nodeId: string): Promise<boolean> {
  const success = await storeDeleteNode(nodeId);

  if (success) {
    eventDispatcher.emit('workflow:node-removed', { nodeId });
    showToast({ message: 'Node deleted', type: 'success' });
  } else {
    showToast({ message: 'Failed to delete node', type: 'error' });
  }

  return success;
}

/**
 * Handle edge-created event from canvas
 */
export async function handleEdgeCreated(edge: WorkflowEdge): Promise<WorkflowEdge | null> {
  const savedEdge = await storeAddEdge(edge);

  if (savedEdge) {
    eventDispatcher.emit('workflow:edge-created', { edge: savedEdge });
  } else {
    showToast({ message: 'Failed to create connection', type: 'error' });
  }

  return savedEdge;
}

/**
 * Handle edge-removed event from canvas
 */
export async function handleEdgeRemoved(edgeId: string): Promise<boolean> {
  const success = await storeDeleteEdge(edgeId);

  if (success) {
    eventDispatcher.emit('workflow:edge-removed', { edgeId });
  } else {
    showToast({ message: 'Failed to remove connection', type: 'error' });
  }

  return success;
}

/**
 * Execute a workflow
 * @param input - Optional input data for the workflow
 * @param workflowId - Optional workflow ID (uses $currentWorkflow if not provided)
 * @returns The execution result with id for real-time tracking, or null if failed
 */
export async function handleExecuteWorkflow(input?: Record<string, unknown>, workflowId?: string): Promise<{ id: string; status: string } | null> {
  const result = await storeExecuteWorkflow(input, workflowId);

  if (result) {
    if (result.status === 'COMPLETED') {
      showToast({ message: 'Workflow executed successfully', type: 'success' });
    } else if (result.status === 'FAILED') {
      showToast({ message: `Workflow failed: ${result.errorMessage || 'Unknown error'}`, type: 'error' });
    } else {
      showToast({ message: `Workflow status: ${result.status}`, type: 'info' });
    }
    eventDispatcher.emit('workflow:executed', { result });
    return { id: result.id, status: result.status };
  } else {
    showToast({ message: 'Failed to execute workflow', type: 'error' });
    return null;
  }
}

/**
 * Save the current workflow manually
 */
export async function handleSaveWorkflow(): Promise<boolean> {
  const appId = $currentApplication.get()?.uuid;
  if (!appId) {
    showToast({ message: 'No application selected', type: 'error' });
    return false;
  }

  const success = await saveCurrentWorkflow(appId);

  if (success) {
    showToast({ message: 'Workflow saved', type: 'success' });
    eventDispatcher.emit('workflow:saved', { workflow: $currentWorkflow.get() });
  } else {
    showToast({ message: 'Failed to save workflow', type: 'error' });
  }

  return success;
}

/**
 * Load workflow for the current application
 */
export async function handleLoadWorkflow(): Promise<Workflow | null> {
  const appId = $currentApplication.get()?.uuid;
  if (!appId) {
    console.error('No application selected');
    return null;
  }

  const workflow = await getOrCreateWorkflow(appId);

  if (workflow) {
    eventDispatcher.emit('workflow:loaded', { workflow });
  }

  return workflow;
}

/**
 * Load a specific workflow by ID
 */
export async function handleLoadWorkflowById(workflowId: string): Promise<Workflow | null> {
  const workflow = await loadWorkflow(workflowId);

  if (workflow) {
    eventDispatcher.emit('workflow:loaded', { workflow });
  }

  return workflow;
}

/**
 * Clear the current workflow
 */
export function handleClearWorkflow(): void {
  clearCurrentWorkflow();
  eventDispatcher.emit('workflow:cleared', {});
}

/**
 * Subscribe to save status changes
 */
export function subscribeSaveStatus(callback: (status: string) => void): () => void {
  return $workflowSaveStatus.subscribe(callback);
}
