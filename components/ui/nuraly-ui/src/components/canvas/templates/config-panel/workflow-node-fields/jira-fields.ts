/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

const OPERATIONS = [
  { value: 'createIssue', label: 'Create Issue' },
  { value: 'getIssue', label: 'Get Issue' },
  { value: 'updateIssue', label: 'Update Issue' },
  { value: 'searchJql', label: 'Search (JQL)' },
  { value: 'transitionIssue', label: 'Transition Issue' },
  { value: 'addComment', label: 'Add Comment' },
  { value: 'listProjects', label: 'List Projects' },
];

const ISSUE_TYPES = [
  { value: 'Task', label: 'Task' },
  { value: 'Bug', label: 'Bug' },
  { value: 'Story', label: 'Story' },
  { value: 'Epic', label: 'Epic' },
  { value: 'Sub-task', label: 'Sub-task' },
];

const PRIORITIES = [
  { value: 'Highest', label: 'Highest' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
  { value: 'Lowest', label: 'Lowest' },
];

/**
 * Render Jira node config fields
 */
export function renderJiraFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
): TemplateResult {
  const operation = (config as any).operation || 'createIssue';
  const needsIssueKey = ['getIssue', 'updateIssue', 'transitionIssue', 'addComment'].includes(operation);
  const needsProjectKey = ['createIssue', 'searchJql'].includes(operation);
  const needsIssueFields = ['createIssue', 'updateIssue'].includes(operation);
  const needsJql = operation === 'searchJql';
  const needsTransition = operation === 'transitionIssue';
  const needsComment = operation === 'addComment';

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Connection</span>
        <span class="config-section-desc">Jira instance and credentials</span>
      </div>
      <div class="config-field">
        <label>Jira Instance URL</label>
        <nr-input
          value=${(config as any).jiraInstanceUrl || ''}
          placeholder="https://your-org.atlassian.net"
          @nr-input=${(e: CustomEvent) => onUpdate('jiraInstanceUrl', e.detail.value)}
        ></nr-input>
        <span class="field-description">Your Jira Cloud or Server URL</span>
      </div>
      <div class="config-field">
        <label>Email</label>
        <nr-input
          value=${(config as any).email || ''}
          placeholder="user@example.com"
          @nr-input=${(e: CustomEvent) => onUpdate('email', e.detail.value)}
        ></nr-input>
        <span class="field-description">Jira account email for authentication</span>
      </div>
      <div class="config-field">
        <label>API Token</label>
        <nr-input
          type="password"
          value=${(config as any).apiToken || ''}
          placeholder="Jira API token"
          @nr-input=${(e: CustomEvent) => onUpdate('apiToken', e.detail.value)}
        ></nr-input>
        <span class="field-description">Atlassian API token (generate at id.atlassian.com)</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Operation</span>
        <span class="config-section-desc">What action to perform</span>
      </div>
      <div class="config-field">
        <label>Operation</label>
        <nr-select
          value=${operation}
          @nr-change=${(e: CustomEvent) => onUpdate('operation', e.detail.value)}
        >
          ${OPERATIONS.map(op => html`
            <nr-option value=${op.value}>${op.label}</nr-option>
          `)}
        </nr-select>
      </div>
    </div>

    ${needsIssueKey ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Issue</span>
        </div>
        <div class="config-field">
          <label>Issue Key</label>
          <nr-input
            value=${(config as any).issueKey || ''}
            placeholder="PROJECT-123"
            @nr-input=${(e: CustomEvent) => onUpdate('issueKey', e.detail.value)}
          ></nr-input>
          <span class="field-description">Jira issue key. Use \${variableName} for dynamic values.</span>
        </div>
      </div>
    ` : nothing}

    ${needsProjectKey ? html`
      <div class="config-field">
        <label>Project Key</label>
        <nr-input
          value=${(config as any).projectKey || ''}
          placeholder="PROJ"
          @nr-input=${(e: CustomEvent) => onUpdate('projectKey', e.detail.value)}
        ></nr-input>
        <span class="field-description">Jira project key</span>
      </div>
    ` : nothing}

    ${needsIssueFields ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Issue Details</span>
          <span class="config-section-desc">Configure the issue fields</span>
        </div>
        <div class="config-field">
          <label>Issue Type</label>
          <nr-select
            value=${(config as any).issueType || 'Task'}
            @nr-change=${(e: CustomEvent) => onUpdate('issueType', e.detail.value)}
          >
            ${ISSUE_TYPES.map(t => html`
              <nr-option value=${t.value}>${t.label}</nr-option>
            `)}
          </nr-select>
        </div>
        <div class="config-field">
          <label>Summary</label>
          <nr-input
            value=${(config as any).summary || ''}
            placeholder="Issue summary"
            @nr-input=${(e: CustomEvent) => onUpdate('summary', e.detail.value)}
          ></nr-input>
          <span class="field-description">Issue title. Use \${variableName} for dynamic content.</span>
        </div>
        <div class="config-field">
          <label>Description</label>
          <nr-input
            type="textarea"
            value=${(config as any).description || ''}
            placeholder="Issue description"
            @nr-input=${(e: CustomEvent) => onUpdate('description', e.detail.value)}
          ></nr-input>
          <span class="field-description">Issue description. Use \${variableName} for dynamic content.</span>
        </div>
        <div class="config-field">
          <label>Assignee</label>
          <nr-input
            value=${(config as any).assignee || ''}
            placeholder="Account ID or email"
            @nr-input=${(e: CustomEvent) => onUpdate('assignee', e.detail.value)}
          ></nr-input>
          <span class="field-description">Jira user account ID or email (optional)</span>
        </div>
        <div class="config-field">
          <label>Priority</label>
          <nr-select
            value=${(config as any).priority || 'Medium'}
            @nr-change=${(e: CustomEvent) => onUpdate('priority', e.detail.value)}
          >
            ${PRIORITIES.map(p => html`
              <nr-option value=${p.value}>${p.label}</nr-option>
            `)}
          </nr-select>
        </div>
        <div class="config-field">
          <label>Labels</label>
          <nr-input
            value=${(config as any).labels || ''}
            placeholder="label1, label2"
            @nr-input=${(e: CustomEvent) => onUpdate('labels', e.detail.value)}
          ></nr-input>
          <span class="field-description">Comma-separated list of labels (optional)</span>
        </div>
      </div>
    ` : nothing}

    ${needsJql ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Search</span>
        </div>
        <div class="config-field">
          <label>JQL Query</label>
          <nr-input
            type="textarea"
            value=${(config as any).jqlQuery || ''}
            placeholder="project = PROJ AND status = 'In Progress'"
            @nr-input=${(e: CustomEvent) => onUpdate('jqlQuery', e.detail.value)}
          ></nr-input>
          <span class="field-description">Jira Query Language expression. Use \${variableName} for dynamic values.</span>
        </div>
      </div>
    ` : nothing}

    ${needsTransition ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Transition</span>
        </div>
        <div class="config-field">
          <label>Transition ID</label>
          <nr-input
            value=${(config as any).transitionId || ''}
            placeholder="21"
            @nr-input=${(e: CustomEvent) => onUpdate('transitionId', e.detail.value)}
          ></nr-input>
          <span class="field-description">The ID of the transition to apply (get from Jira workflow)</span>
        </div>
      </div>
    ` : nothing}

    ${needsComment ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Comment</span>
        </div>
        <div class="config-field">
          <label>Comment Text</label>
          <nr-input
            type="textarea"
            value=${(config as any).comment || ''}
            placeholder="Comment body"
            @nr-input=${(e: CustomEvent) => onUpdate('comment', e.detail.value)}
          ></nr-input>
          <span class="field-description">Comment text. Use \${variableName} for dynamic content.</span>
        </div>
      </div>
    ` : nothing}

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Output</span>
      </div>
      <div class="config-field">
        <label>Output Variable</label>
        <nr-input
          value=${(config as any).outputVariable || ''}
          placeholder="jiraResult"
          @nr-input=${(e: CustomEvent) => onUpdate('outputVariable', e.detail.value)}
        ></nr-input>
        <span class="field-description">Variable name to store the Jira response</span>
      </div>
    </div>
  `;
}
