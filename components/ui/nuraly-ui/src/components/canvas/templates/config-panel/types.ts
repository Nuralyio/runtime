/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { WorkflowNode, Workflow, NodeConfiguration, TriggerConnectionState } from '../../workflow-canvas.types.js';
import type { DatabaseProvider } from '../../data-node/data-node.types.js';

/**
 * Trigger info for persistent trigger nodes (Telegram, Slack, etc.)
 */
export interface TriggerInfo {
  triggerId?: string;
  status?: TriggerConnectionState;
  health?: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
  messagesReceived?: number;
  lastMessageAt?: string;
  stateReason?: string;
  webhookUrl?: string;
  inDevMode?: boolean;
}

/**
 * Trigger action callbacks for config panel controls
 */
export interface TriggerActions {
  onActivate: (triggerId: string) => void;
  onDeactivate: (triggerId: string) => void;
  onCreateAndActivate: (nodeType: string, config: NodeConfiguration) => Promise<string | undefined>;
  onToggleDevMode: (triggerId: string, enable: boolean) => void;
}

/**
 * Callbacks for config panel interactions
 */
export interface ConfigPanelCallbacks {
  onClose: () => void;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string) => void;
  onUpdateConfig: (key: string, value: unknown) => void;
  onRetryNode?: (nodeId: string) => void;
  onActivateTrigger?: (triggerId: string) => void;
  onDeactivateTrigger?: (triggerId: string) => void;
  onCreateAndActivateTrigger?: (nodeType: string, config: NodeConfiguration) => Promise<string | undefined>;
  onToggleDevMode?: (triggerId: string, enable: boolean) => void;
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
  /** Application ID for database operations (host-provided) */
  applicationId?: string;
  /** Database introspection provider (host-provided) */
  databaseProvider?: DatabaseProvider;
  /** Trigger info for persistent trigger nodes */
  triggerInfo?: TriggerInfo;
  /** Trigger action callbacks for persistent trigger nodes */
  triggerActions?: TriggerActions;
}
