/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

const RESOURCES = [
  { value: 'ORDER', label: 'Order' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'INVENTORY', label: 'Inventory' },
  { value: 'FULFILLMENT', label: 'Fulfillment' },
];

const OPERATIONS = [
  { value: 'LIST', label: 'List' },
  { value: 'READ', label: 'Read' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
];

/**
 * Render Shopify node config fields
 */
export function renderShopifyFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
): TemplateResult {
  const operation = (config as any).operation || 'LIST';
  const needsId = operation === 'READ' || operation === 'UPDATE' || operation === 'DELETE';

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Connection</span>
        <span class="config-section-desc">Shopify store credentials</span>
      </div>
      <div class="config-field">
        <label>Shop Domain</label>
        <nr-input
          value=${(config as any).shopDomain || ''}
          placeholder="mystore.myshopify.com"
          @nr-input=${(e: CustomEvent) => onUpdate('shopDomain', e.detail.value)}
        ></nr-input>
        <span class="field-description">Your Shopify store domain</span>
      </div>
      <div class="config-field">
        <label>Access Token</label>
        <nr-input
          type="password"
          value=${(config as any).accessToken || ''}
          placeholder="shpat_..."
          @nr-input=${(e: CustomEvent) => onUpdate('accessToken', e.detail.value)}
        ></nr-input>
        <span class="field-description">Shopify Admin API access token</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Operation</span>
        <span class="config-section-desc">Resource and action to perform</span>
      </div>
      <div class="config-field">
        <label>Resource</label>
        <nr-select
          value=${(config as any).resource || 'ORDER'}
          @nr-change=${(e: CustomEvent) => onUpdate('resource', e.detail.value)}
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
          @nr-change=${(e: CustomEvent) => onUpdate('operation', e.detail.value)}
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
            value=${(config as any).resourceId || ''}
            placeholder="e.g., 450789469"
            @nr-input=${(e: CustomEvent) => onUpdate('resourceId', e.detail.value)}
          ></nr-input>
          <span class="field-description">ID of the specific resource</span>
        </div>
      ` : ''}
      ${operation === 'LIST' ? html`
        <div class="config-field">
          <label>Filters (JSON)</label>
          <nr-input
            type="textarea"
            value=${(config as any).filters || ''}
            placeholder='{"status": "open", "limit": "50"}'
            @nr-input=${(e: CustomEvent) => onUpdate('filters', e.detail.value)}
          ></nr-input>
          <span class="field-description">Optional JSON filters for list operations</span>
        </div>
      ` : ''}
    </div>
  `;
}
