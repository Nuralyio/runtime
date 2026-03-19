/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

const HUBSPOT_RESOURCES = [
  { value: 'contact', label: 'Contact' },
  { value: 'deal', label: 'Deal' },
  { value: 'company', label: 'Company' },
  { value: 'ticket', label: 'Ticket' },
  { value: 'engagement', label: 'Engagement' },
];

const HUBSPOT_OPERATIONS = [
  { value: 'create', label: 'Create' },
  { value: 'get', label: 'Get' },
  { value: 'getAll', label: 'Get All' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'search', label: 'Search' },
];

const HUBSPOT_FILTER_OPERATORS = [
  { value: 'EQ', label: 'Equal to' },
  { value: 'NEQ', label: 'Not equal to' },
  { value: 'LT', label: 'Less than' },
  { value: 'LTE', label: 'Less than or equal' },
  { value: 'GT', label: 'Greater than' },
  { value: 'GTE', label: 'Greater than or equal' },
  { value: 'CONTAINS_TOKEN', label: 'Contains token' },
  { value: 'NOT_CONTAINS_TOKEN', label: 'Does not contain token' },
];

/**
 * Render HubSpot CRM node config fields
 */
export function renderHubspotFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
): TemplateResult {
  const resource = (config as any).hubspotResource || 'contact';
  const operation = (config as any).hubspotOperation || 'getAll';
  const filterGroups: Array<{ filters: Array<{ propertyName: string; operator: string; value: string }> }> =
    (config as any).hubspotFilterGroups || [];
  const associations: Array<{ toObjectType: string; toObjectId: string }> =
    (config as any).hubspotAssociations || [];

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Authentication</span>
        <span class="config-section-desc">HubSpot Private App access token</span>
      </div>
      <div class="config-field">
        <label>Access Token</label>
        <nr-input
          type="password"
          value=${(config as any).hubspotAccessToken || ''}
          placeholder="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          @nr-input=${(e: CustomEvent) => onUpdate('hubspotAccessToken', e.detail.value)}
        ></nr-input>
        <span class="field-description">Private App token from HubSpot settings. Use \${kv.secret} to reference a stored secret.</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Resource & Operation</span>
        <span class="config-section-desc">Select the CRM object and action</span>
      </div>
      <div class="config-field">
        <label>Resource</label>
        <nr-select
          value=${resource}
          @nr-change=${(e: CustomEvent) => onUpdate('hubspotResource', e.detail.value)}
        >
          ${HUBSPOT_RESOURCES.map(r => html`
            <nr-option value=${r.value}>${r.label}</nr-option>
          `)}
        </nr-select>
        <span class="field-description">CRM object type to operate on</span>
      </div>
      <div class="config-field">
        <label>Operation</label>
        <nr-select
          value=${operation}
          @nr-change=${(e: CustomEvent) => onUpdate('hubspotOperation', e.detail.value)}
        >
          ${HUBSPOT_OPERATIONS.map(o => html`
            <nr-option value=${o.value}>${o.label}</nr-option>
          `)}
        </nr-select>
        <span class="field-description">Action to perform on the resource</span>
      </div>
    </div>

    ${operation === 'create' || operation === 'update' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Properties</span>
          <span class="config-section-desc">Object properties as JSON (varies by resource and portal)</span>
        </div>
        <div class="config-field">
          <label>Properties (JSON)</label>
          <nr-input
            type="textarea"
            value=${JSON.stringify((config as any).hubspotProperties || {}, null, 2)}
            placeholder='{"email": "john@example.com", "firstname": "John", "lastname": "Doe"}'
            @nr-input=${(e: CustomEvent) => {
              try {
                onUpdate('hubspotProperties', JSON.parse(e.detail.value));
              } catch {
                // Allow typing — only update on valid JSON
              }
            }}
          ></nr-input>
          <span class="field-description">HubSpot properties for create/update. Use \${variableName} for dynamic values.</span>
        </div>
      </div>
    ` : ''}

    ${operation === 'get' || operation === 'update' || operation === 'delete' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Record ID</span>
        </div>
        <div class="config-field">
          <label>Object ID</label>
          <nr-input
            value=${(config as any).hubspotObjectId || ''}
            placeholder="12345 or \${input.id}"
            @nr-input=${(e: CustomEvent) => onUpdate('hubspotObjectId', e.detail.value)}
          ></nr-input>
          <span class="field-description">HubSpot record ID. Use \${variableName} for dynamic values.</span>
        </div>
      </div>
    ` : ''}

    ${operation === 'getAll' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Pagination</span>
        </div>
        <div class="config-field">
          <label>Limit</label>
          <nr-input
            type="number"
            value=${String((config as any).hubspotLimit ?? 100)}
            placeholder="100"
            @nr-input=${(e: CustomEvent) => onUpdate('hubspotLimit', parseInt(e.detail.value, 10) || 100)}
          ></nr-input>
          <span class="field-description">Maximum number of records to return (max 100 per page)</span>
        </div>
      </div>
    ` : ''}

    ${operation === 'search' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Search Filters</span>
          <span class="config-section-desc">Filter groups (AND between groups, OR within a group)</span>
        </div>
        ${filterGroups.map((group, gi) => html`
          <div class="config-subsection" style="border: 1px solid var(--nuraly-color-border, #e5e7eb); border-radius: 6px; padding: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <strong style="font-size: 12px;">Filter Group ${gi + 1}</strong>
              <nr-button size="small" variant="text" @click=${() => {
                const updated = [...filterGroups];
                updated.splice(gi, 1);
                onUpdate('hubspotFilterGroups', updated);
              }}>Remove</nr-button>
            </div>
            ${group.filters.map((filter, fi) => html`
              <div style="display: flex; gap: 4px; margin-bottom: 4px; align-items: center;">
                <nr-input
                  size="small"
                  value=${filter.propertyName}
                  placeholder="Property"
                  style="flex: 1;"
                  @nr-input=${(e: CustomEvent) => {
                    const updated = [...filterGroups];
                    updated[gi].filters[fi] = { ...filter, propertyName: e.detail.value };
                    onUpdate('hubspotFilterGroups', updated);
                  }}
                ></nr-input>
                <nr-select
                  size="small"
                  value=${filter.operator}
                  style="flex: 1;"
                  @nr-change=${(e: CustomEvent) => {
                    const updated = [...filterGroups];
                    updated[gi].filters[fi] = { ...filter, operator: e.detail.value };
                    onUpdate('hubspotFilterGroups', updated);
                  }}
                >
                  ${HUBSPOT_FILTER_OPERATORS.map(op => html`
                    <nr-option value=${op.value}>${op.label}</nr-option>
                  `)}
                </nr-select>
                <nr-input
                  size="small"
                  value=${filter.value}
                  placeholder="Value"
                  style="flex: 1;"
                  @nr-input=${(e: CustomEvent) => {
                    const updated = [...filterGroups];
                    updated[gi].filters[fi] = { ...filter, value: e.detail.value };
                    onUpdate('hubspotFilterGroups', updated);
                  }}
                ></nr-input>
                <nr-button size="small" variant="text" @click=${() => {
                  const updated = [...filterGroups];
                  updated[gi].filters.splice(fi, 1);
                  if (updated[gi].filters.length === 0) {
                    updated.splice(gi, 1);
                  }
                  onUpdate('hubspotFilterGroups', updated);
                }}>x</nr-button>
              </div>
            `)}
            <nr-button size="small" variant="outline" @click=${() => {
              const updated = [...filterGroups];
              updated[gi].filters.push({ propertyName: '', operator: 'EQ', value: '' });
              onUpdate('hubspotFilterGroups', updated);
            }}>+ Add Filter</nr-button>
          </div>
        `)}
        <nr-button size="small" variant="outline" @click=${() => {
          const updated = [...filterGroups, { filters: [{ propertyName: '', operator: 'EQ', value: '' }] }];
          onUpdate('hubspotFilterGroups', updated);
        }}>+ Add Filter Group</nr-button>
        <div class="config-field" style="margin-top: 8px;">
          <label>Limit</label>
          <nr-input
            type="number"
            value=${String((config as any).hubspotLimit ?? 100)}
            placeholder="100"
            @nr-input=${(e: CustomEvent) => onUpdate('hubspotLimit', parseInt(e.detail.value, 10) || 100)}
          ></nr-input>
          <span class="field-description">Maximum number of search results</span>
        </div>
      </div>
    ` : ''}

    ${operation === 'create' ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Associations</span>
          <span class="config-section-desc">Link this record to other HubSpot objects</span>
        </div>
        ${associations.map((assoc, i) => html`
          <div style="display: flex; gap: 4px; margin-bottom: 4px; align-items: center;">
            <nr-select
              size="small"
              value=${assoc.toObjectType}
              style="flex: 1;"
              @nr-change=${(e: CustomEvent) => {
                const updated = [...associations];
                updated[i] = { ...assoc, toObjectType: e.detail.value };
                onUpdate('hubspotAssociations', updated);
              }}
            >
              ${HUBSPOT_RESOURCES.map(r => html`
                <nr-option value=${r.value}>${r.label}</nr-option>
              `)}
            </nr-select>
            <nr-input
              size="small"
              value=${assoc.toObjectId}
              placeholder="Object ID"
              style="flex: 1;"
              @nr-input=${(e: CustomEvent) => {
                const updated = [...associations];
                updated[i] = { ...assoc, toObjectId: e.detail.value };
                onUpdate('hubspotAssociations', updated);
              }}
            ></nr-input>
            <nr-button size="small" variant="text" @click=${() => {
              const updated = [...associations];
              updated.splice(i, 1);
              onUpdate('hubspotAssociations', updated);
            }}>x</nr-button>
          </div>
        `)}
        <nr-button size="small" variant="outline" @click=${() => {
          const updated = [...associations, { toObjectType: 'contact', toObjectId: '' }];
          onUpdate('hubspotAssociations', updated);
        }}>+ Add Association</nr-button>
      </div>
    ` : ''}
  `;
}
