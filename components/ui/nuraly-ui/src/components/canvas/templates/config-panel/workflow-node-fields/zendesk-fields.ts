/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

const RESOURCES = [
  { value: 'TICKET', label: 'Ticket' },
  { value: 'USER', label: 'User' },
  { value: 'ORGANIZATION', label: 'Organization' },
  { value: 'TICKET_COMMENT', label: 'Ticket Comment' },
  { value: 'SATISFACTION_RATING', label: 'Satisfaction Rating' },
];

const OPERATIONS = [
  { value: 'CREATE', label: 'Create' },
  { value: 'READ', label: 'Read' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LIST', label: 'List' },
  { value: 'SEARCH', label: 'Search' },
];

const PRIORITIES = [
  { value: '', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUSES = [
  { value: '', label: 'None' },
  { value: 'new', label: 'New' },
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'hold', label: 'Hold' },
  { value: 'solved', label: 'Solved' },
  { value: 'closed', label: 'Closed' },
];

/**
 * Render Zendesk node config fields
 */
export function renderZendeskFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
): TemplateResult {
  const resource = (config as any).zendeskResource || 'TICKET';
  const operation = (config as any).zendeskOperation || 'LIST';
  const isTicket = resource === 'TICKET' || resource === 'TICKET_COMMENT';
  const needsId = ['READ', 'UPDATE', 'DELETE'].includes(operation);
  const isSearch = operation === 'SEARCH';
  const isCreateOrUpdate = ['CREATE', 'UPDATE'].includes(operation);

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Connection</span>
        <span class="config-section-desc">Zendesk API authentication</span>
      </div>
      <div class="config-field">
        <label>Subdomain</label>
        <nr-input
          value=${(config as any).zendeskSubdomain || ''}
          placeholder="mycompany"
          @nr-input=${(e: CustomEvent) => onUpdate('zendeskSubdomain', e.detail.value)}
        ></nr-input>
        <span class="field-description">Your Zendesk subdomain (e.g., "mycompany" for mycompany.zendesk.com)</span>
      </div>
      <div class="config-field">
        <label>Email</label>
        <nr-input
          value=${(config as any).zendeskEmail || ''}
          placeholder="agent@company.com"
          @nr-input=${(e: CustomEvent) => onUpdate('zendeskEmail', e.detail.value)}
        ></nr-input>
        <span class="field-description">Agent email for API authentication</span>
      </div>
      <div class="config-field">
        <label>API Token</label>
        <nr-input
          type="password"
          value=${(config as any).zendeskApiToken || ''}
          placeholder="Your Zendesk API token"
          @nr-input=${(e: CustomEvent) => onUpdate('zendeskApiToken', e.detail.value)}
        ></nr-input>
        <span class="field-description">Zendesk API token (Admin > Channels > API)</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Operation</span>
        <span class="config-section-desc">What to do with the resource</span>
      </div>
      <div class="config-field">
        <label>Resource</label>
        <nr-select
          value=${resource}
          @nr-change=${(e: CustomEvent) => onUpdate('zendeskResource', e.detail.value)}
        >
          ${RESOURCES.map(r => html`
            <nr-option value=${r.value}>${r.label}</nr-option>
          `)}
        </nr-select>
      </div>
      <div class="config-field">
        <label>Operation</label>
        <nr-select
          value=${operation}
          @nr-change=${(e: CustomEvent) => onUpdate('zendeskOperation', e.detail.value)}
        >
          ${OPERATIONS.map(o => html`
            <nr-option value=${o.value}>${o.label}</nr-option>
          `)}
        </nr-select>
      </div>
      ${needsId ? html`
        <div class="config-field">
          <label>Resource ID</label>
          <nr-input
            value=${(config as any).zendeskResourceId || ''}
            placeholder="12345"
            @nr-input=${(e: CustomEvent) => onUpdate('zendeskResourceId', e.detail.value)}
          ></nr-input>
          <span class="field-description">ID of the resource to ${operation.toLowerCase()}</span>
        </div>
      ` : ''}
      ${isSearch ? html`
        <div class="config-field">
          <label>Search Query</label>
          <nr-input
            type="textarea"
            value=${(config as any).zendeskSearchQuery || ''}
            placeholder='type:ticket status:open priority:high'
            @nr-input=${(e: CustomEvent) => onUpdate('zendeskSearchQuery', e.detail.value)}
          ></nr-input>
          <span class="field-description">Zendesk search syntax</span>
        </div>
      ` : ''}
    </div>

    ${isCreateOrUpdate && isTicket ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Ticket Fields</span>
        </div>
        <div class="config-field">
          <label>Subject</label>
          <nr-input
            value=${(config as any).zendeskSubject || ''}
            placeholder="Ticket subject"
            @nr-input=${(e: CustomEvent) => onUpdate('zendeskSubject', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Description</label>
          <nr-input
            type="textarea"
            value=${(config as any).zendeskDescription || ''}
            placeholder="Ticket description"
            @nr-input=${(e: CustomEvent) => onUpdate('zendeskDescription', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Priority</label>
          <nr-select
            value=${(config as any).zendeskPriority || ''}
            @nr-change=${(e: CustomEvent) => onUpdate('zendeskPriority', e.detail.value)}
          >
            ${PRIORITIES.map(p => html`
              <nr-option value=${p.value}>${p.label}</nr-option>
            `)}
          </nr-select>
        </div>
        <div class="config-field">
          <label>Status</label>
          <nr-select
            value=${(config as any).zendeskStatus || ''}
            @nr-change=${(e: CustomEvent) => onUpdate('zendeskStatus', e.detail.value)}
          >
            ${STATUSES.map(s => html`
              <nr-option value=${s.value}>${s.label}</nr-option>
            `)}
          </nr-select>
        </div>
        <div class="config-field">
          <label>Assignee ID</label>
          <nr-input
            value=${(config as any).zendeskAssigneeId || ''}
            placeholder="User ID to assign"
            @nr-input=${(e: CustomEvent) => onUpdate('zendeskAssigneeId', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Tags</label>
          <nr-input
            value=${(config as any).zendeskTags || ''}
            placeholder="tag1, tag2, tag3"
            @nr-input=${(e: CustomEvent) => onUpdate('zendeskTags', e.detail.value)}
          ></nr-input>
          <span class="field-description">Comma-separated tags</span>
        </div>
        <div class="config-field">
          <label>Custom Fields (JSON)</label>
          <nr-input
            type="textarea"
            value=${(config as any).zendeskCustomFields || ''}
            placeholder='[{"id": 123, "value": "custom"}]'
            @nr-input=${(e: CustomEvent) => onUpdate('zendeskCustomFields', e.detail.value)}
          ></nr-input>
          <span class="field-description">Custom field values as JSON array</span>
        </div>
      </div>
    ` : ''}
  `;
}
