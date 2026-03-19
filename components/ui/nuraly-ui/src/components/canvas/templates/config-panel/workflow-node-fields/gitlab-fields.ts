/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

const GITLAB_RESOURCES = [
  { value: 'issue', label: 'Issue' },
  { value: 'merge_request', label: 'Merge Request' },
  { value: 'repository', label: 'Repository' },
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'release', label: 'Release' },
  { value: 'user', label: 'User' },
];

const GITLAB_OPERATIONS = [
  { value: 'create', label: 'Create' },
  { value: 'get', label: 'Get' },
  { value: 'getAll', label: 'Get All' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
];

function renderIssueFields(
  config: any,
  onUpdate: (key: string, value: unknown) => void,
  operation: string,
): TemplateResult | typeof nothing {
  if (operation !== 'create' && operation !== 'update') return nothing;

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Issue Details</span>
      </div>
      <div class="config-field">
        <label>Title</label>
        <nr-input
          value=${config.gitlabTitle || ''}
          placeholder="Issue title"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabTitle', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Description</label>
        <nr-input
          type="textarea"
          value=${config.gitlabDescription || ''}
          placeholder="Issue description (supports Markdown)"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabDescription', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Labels</label>
        <nr-input
          value=${(config.gitlabLabels || []).join(', ')}
          placeholder="bug, feature, urgent"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabLabels', e.detail.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
        ></nr-input>
        <span class="field-description">Comma-separated list of labels</span>
      </div>
      <div class="config-field">
        <label>Assignee IDs</label>
        <nr-input
          value=${(config.gitlabAssigneeIds || []).join(', ')}
          placeholder="1, 2, 3"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabAssigneeIds', e.detail.value.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n)))}
        ></nr-input>
        <span class="field-description">Comma-separated list of user IDs</span>
      </div>
    </div>
  `;
}

function renderMergeRequestFields(
  config: any,
  onUpdate: (key: string, value: unknown) => void,
  operation: string,
): TemplateResult | typeof nothing {
  if (operation !== 'create' && operation !== 'update') return nothing;

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Merge Request Details</span>
      </div>
      <div class="config-field">
        <label>Title</label>
        <nr-input
          value=${config.gitlabTitle || ''}
          placeholder="Merge request title"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabTitle', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Description</label>
        <nr-input
          type="textarea"
          value=${config.gitlabDescription || ''}
          placeholder="Merge request description"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabDescription', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Source Branch</label>
        <nr-input
          value=${config.gitlabSourceBranch || ''}
          placeholder="feature/my-branch"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabSourceBranch', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Target Branch</label>
        <nr-input
          value=${config.gitlabTargetBranch || ''}
          placeholder="main"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabTargetBranch', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Labels</label>
        <nr-input
          value=${(config.gitlabLabels || []).join(', ')}
          placeholder="review, ready"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabLabels', e.detail.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
        ></nr-input>
        <span class="field-description">Comma-separated list of labels</span>
      </div>
      <div class="config-field">
        <label>Assignee IDs</label>
        <nr-input
          value=${(config.gitlabAssigneeIds || []).join(', ')}
          placeholder="1, 2, 3"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabAssigneeIds', e.detail.value.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n)))}
        ></nr-input>
        <span class="field-description">Comma-separated list of user IDs</span>
      </div>
    </div>
  `;
}

function renderPipelineFields(
  config: any,
  onUpdate: (key: string, value: unknown) => void,
  operation: string,
): TemplateResult | typeof nothing {
  if (operation !== 'create') return nothing;

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Pipeline Details</span>
      </div>
      <div class="config-field">
        <label>Ref (Branch/Tag)</label>
        <nr-input
          value=${config.gitlabRef || ''}
          placeholder="main"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabRef', e.detail.value)}
        ></nr-input>
        <span class="field-description">Branch or tag to run the pipeline on</span>
      </div>
    </div>
  `;
}

function renderReleaseFields(
  config: any,
  onUpdate: (key: string, value: unknown) => void,
  operation: string,
): TemplateResult | typeof nothing {
  if (operation !== 'create' && operation !== 'update') return nothing;

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Release Details</span>
      </div>
      <div class="config-field">
        <label>Tag Name</label>
        <nr-input
          value=${config.gitlabRef || ''}
          placeholder="v1.0.0"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabRef', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Name</label>
        <nr-input
          value=${config.gitlabTitle || ''}
          placeholder="Release name"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabTitle', e.detail.value)}
        ></nr-input>
      </div>
      <div class="config-field">
        <label>Description</label>
        <nr-input
          type="textarea"
          value=${config.gitlabDescription || ''}
          placeholder="Release notes (supports Markdown)"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabDescription', e.detail.value)}
        ></nr-input>
      </div>
    </div>
  `;
}

/**
 * Render GitLab node config fields
 */
export function renderGitlabFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
): TemplateResult {
  const cfg = config as any;
  const resource = cfg.gitlabResource || 'issue';
  const operation = cfg.gitlabOperation || 'getAll';

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Connection</span>
        <span class="config-section-desc">GitLab instance and authentication</span>
      </div>
      <div class="config-field">
        <label>Base URL</label>
        <nr-input
          value=${cfg.gitlabBaseUrl || 'https://gitlab.com'}
          placeholder="https://gitlab.com"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabBaseUrl', e.detail.value)}
        ></nr-input>
        <span class="field-description">GitLab instance URL (supports self-hosted)</span>
      </div>
      <div class="config-field">
        <label>Access Token</label>
        <nr-input
          type="password"
          value=${cfg.gitlabAccessToken || ''}
          placeholder="glpat-xxxxxxxxxxxxxxxxxxxx"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabAccessToken', e.detail.value)}
        ></nr-input>
        <span class="field-description">Personal or Project Access Token</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Action</span>
        <span class="config-section-desc">Resource type and operation</span>
      </div>
      <div class="config-field">
        <label>Resource</label>
        <nr-select
          value=${resource}
          @nr-change=${(e: CustomEvent) => onUpdate('gitlabResource', e.detail.value)}
        >
          ${GITLAB_RESOURCES.map(r => html`
            <nr-option value=${r.value}>${r.label}</nr-option>
          `)}
        </nr-select>
      </div>
      <div class="config-field">
        <label>Operation</label>
        <nr-select
          value=${operation}
          @nr-change=${(e: CustomEvent) => onUpdate('gitlabOperation', e.detail.value)}
        >
          ${GITLAB_OPERATIONS.map(o => html`
            <nr-option value=${o.value}>${o.label}</nr-option>
          `)}
        </nr-select>
      </div>
      <div class="config-field">
        <label>Project ID</label>
        <nr-input
          value=${cfg.gitlabProjectId || ''}
          placeholder="12345 or group/project"
          @nr-input=${(e: CustomEvent) => onUpdate('gitlabProjectId', e.detail.value)}
        ></nr-input>
        <span class="field-description">Numeric ID or URL-encoded path (e.g. group%2Fproject)</span>
      </div>
    </div>

    ${resource === 'issue' ? renderIssueFields(cfg, onUpdate, operation) : nothing}
    ${resource === 'merge_request' ? renderMergeRequestFields(cfg, onUpdate, operation) : nothing}
    ${resource === 'pipeline' ? renderPipelineFields(cfg, onUpdate, operation) : nothing}
    ${resource === 'release' ? renderReleaseFields(cfg, onUpdate, operation) : nothing}
  `;
}
