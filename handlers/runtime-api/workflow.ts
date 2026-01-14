/**
 * @fileoverview Workflow Runtime API Functions
 * @module Runtime/Handlers/RuntimeAPI/Workflow
 */

import {
  createNewWorkflow,
  refreshWorkflows,
  loadWorkflowById,
  $workflows,
  $currentWorkflow,
} from '../../redux/store/workflow';

/**
 * Creates workflow-related functions for handler code
 */
export function createWorkflowFunctions() {
  return {
    /**
     * Create a new workflow
     */
    createWorkflow: async (appId: string, name: string, description?: string) => {
      return createNewWorkflow(appId, name);
    },

    /**
     * Refresh workflows list for an app
     */
    refreshWorkflows: async (appId: string) => {
      return refreshWorkflows(appId);
    },

    /**
     * Load a workflow by ID
     */
    loadWorkflowById: async (workflowId: string) => {
      return loadWorkflowById(workflowId);
    },

    /**
     * Get current workflows list
     */
    getWorkflows: () => {
      return $workflows.get();
    },

    /**
     * Get current workflow
     */
    getCurrentWorkflow: () => {
      return $currentWorkflow.get();
    },

    /**
     * Set current workflow
     */
    setCurrentWorkflow: (workflow: any) => {
      $currentWorkflow.set(workflow);
    },
  };
}
