/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { WorkflowNode } from '../../workflow-canvas.types.js';

/**
 * Callbacks for config panel interactions
 */
export interface ConfigPanelCallbacks {
  onClose: () => void;
  onUpdateName: (name: string) => void;
  onUpdateDescription: (description: string) => void;
  onUpdateConfig: (key: string, value: unknown) => void;
}

/**
 * Data required for rendering the config panel
 */
export interface ConfigPanelTemplateData {
  node: WorkflowNode | null;
  position: { x: number; y: number } | null;
  callbacks: ConfigPanelCallbacks;
  workflowId?: string;
}
