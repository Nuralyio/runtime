/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { NodeConfiguration, Workflow, DbDesignerNodeType } from '../../../workflow-canvas.types.js';

interface ConnectedTables {
  sourceTableName: string | null;
  sourceColumns: string[];
  targetTableName: string | null;
  targetColumns: string[];
}

function getConnectedTables(workflow: Workflow | undefined, nodeId: string): ConnectedTables {
  const result: ConnectedTables = {
    sourceTableName: null,
    sourceColumns: [],
    targetTableName: null,
    targetColumns: [],
  };

  if (!workflow) return result;

  // Find edges connecting to this relationship node's source and target ports
  for (const edge of workflow.edges) {
    if (edge.targetNodeId !== nodeId) continue;

    const sourceNode = workflow.nodes.find(n => n.id === edge.sourceNodeId);
    if (!sourceNode || sourceNode.type !== DbDesignerNodeType.TABLE) continue;

    const tableName = (sourceNode.configuration.tableName as string) || sourceNode.name;
    const columns: string[] = ((sourceNode.configuration.columns as any[]) || []).map(c => c.name);

    if (edge.targetPortId === 'source') {
      result.sourceTableName = tableName;
      result.sourceColumns = columns;
    } else if (edge.targetPortId === 'target') {
      result.targetTableName = tableName;
      result.targetColumns = columns;
    }
  }

  return result;
}

/**
 * Render Relationship node specific configuration fields
 */
export function renderRelationshipNodeFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  workflow?: Workflow,
  nodeId?: string
): TemplateResult {
  const connected = getConnectedTables(workflow, nodeId || '');

  const sourceValue = (config.sourceColumn as string) || '';
  const targetValue = (config.targetColumn as string) || '';

  // Validate: column must exist in the connected table (only if table is connected and value is non-empty)
  const sourceValid = !sourceValue || !connected.sourceColumns.length || connected.sourceColumns.includes(sourceValue);
  const targetValid = !targetValue || !connected.targetColumns.length || connected.targetColumns.includes(targetValue);

  const sourceStatus = sourceValid ? 'default' : 'error';
  const targetStatus = targetValid ? 'default' : 'error';

  const sourceHint = connected.sourceTableName
    ? (sourceValid
        ? `Column in "${connected.sourceTableName}"`
        : `"${sourceValue}" not found in "${connected.sourceTableName}". Available: ${connected.sourceColumns.join(', ')}`)
    : 'Connect a source table first';

  const targetHint = connected.targetTableName
    ? (targetValid
        ? `Column in "${connected.targetTableName}" (foreign key)`
        : `"${targetValue}" not found in "${connected.targetTableName}". Available: ${connected.targetColumns.join(', ')}`)
    : 'Connect a target table first';

  return html`
    <!-- Relationship Type Section -->
    <div class="config-section">
      <div class="config-field">
        <label>Relationship Type</label>
        <nr-input
          .value=${(config.relationshipType as string) || 'ONE_TO_MANY'}
          placeholder="ONE_TO_ONE, ONE_TO_MANY, MANY_TO_MANY"
          @nr-input=${(e: CustomEvent) => onUpdate('relationshipType', e.detail.value)}
        ></nr-input>
        <span class="field-description">Type of relationship between tables</span>
      </div>
    </div>

    <!-- Column Mapping Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Column Mapping</span>
      </div>
      <div class="config-field">
        <label>Source Column${connected.sourceTableName ? html` <small>(${connected.sourceTableName})</small>` : nothing}</label>
        <nr-input
          .value=${sourceValue}
          placeholder=${connected.sourceColumns.length ? `e.g., ${connected.sourceColumns[0]}` : 'e.g., id'}
          status=${sourceStatus}
          @nr-input=${(e: CustomEvent) => onUpdate('sourceColumn', e.detail.value)}
        ></nr-input>
        <span class="field-description" style=${sourceValid ? '' : 'color: var(--n-color-error, #ef4444)'}>${sourceHint}</span>
      </div>
      <div class="config-field">
        <label>Target Column${connected.targetTableName ? html` <small>(${connected.targetTableName})</small>` : nothing}</label>
        <nr-input
          .value=${targetValue}
          placeholder=${connected.targetColumns.length ? `e.g., ${connected.targetColumns[0]}` : 'e.g., user_id'}
          status=${targetStatus}
          @nr-input=${(e: CustomEvent) => onUpdate('targetColumn', e.detail.value)}
        ></nr-input>
        <span class="field-description" style=${targetValid ? '' : 'color: var(--n-color-error, #ef4444)'}>${targetHint}</span>
      </div>
    </div>

    <!-- Referential Actions Section -->
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Referential Actions</span>
      </div>
      <div class="config-field">
        <label>On Delete</label>
        <nr-input
          .value=${(config.onDelete as string) || 'CASCADE'}
          placeholder="CASCADE, SET_NULL, RESTRICT, NO_ACTION"
          @nr-input=${(e: CustomEvent) => onUpdate('onDelete', e.detail.value)}
        ></nr-input>
        <span class="field-description">Action when parent record is deleted</span>
      </div>
      <div class="config-field">
        <label>On Update</label>
        <nr-input
          .value=${(config.onUpdate as string) || 'CASCADE'}
          placeholder="CASCADE, SET_NULL, RESTRICT, NO_ACTION"
          @nr-input=${(e: CustomEvent) => onUpdate('onUpdate', e.detail.value)}
        ></nr-input>
        <span class="field-description">Action when parent record is updated</span>
      </div>
    </div>
  `;
}
