/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { WorkflowNode, Workflow } from '../../workflow-canvas.types.js';

/**
 * Callbacks for config panel interactions
 */
export interface ConfigPanelCallbacks {
  onClose: () => void;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string) => void;
  onUpdateConfig: (key: string, value: unknown) => void;
  onRetryNode?: (nodeId: string) => void;
}

/**
 * Dynamic variable from execution data
 */
export interface DynamicVariable {
  nodeName: string;
  nodeId: string;
  path: string;
  description: string;
  type: string;
  isDynamic?: boolean;
}

/**
 * Node execution data for displaying in config panel
 */
export interface NodeExecutionData {
  id: string;
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  inputData?: unknown;
  outputData?: unknown;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

/**
 * Data required for rendering the config panel
 */
export interface ConfigPanelTemplateData {
  node: WorkflowNode | null;
  position: { x: number; y: number } | null;
  callbacks: ConfigPanelCallbacks;
  workflowId?: string;
  /** Workflow for variable resolution */
  workflow?: Workflow;
  /** Dynamic variables from last execution */
  dynamicVariables?: DynamicVariable[];
  /** Loading state for dynamic variables */
  loadingVariables?: boolean;
  /** Node execution data from current/last execution */
  nodeExecution?: NodeExecutionData;
  /** Current execution ID for retry functionality */
  executionId?: string;
  /** KV entries for secret/connection selects (host-provided) */
  kvEntries?: { keyPath: string; value?: any; isSecret: boolean }[];
  /** Callback when a KV entry needs to be created */
  onCreateKvEntry?: (detail: { keyPath: string; value: any; scope: string; isSecret: boolean }) => void;
}
