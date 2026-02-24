/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration, TriggerConnectionState } from '../../../workflow-canvas.types.js';
import type { TriggerInfo, TriggerActions } from '../types.js';

const TRANSPORT_TYPES = [
  { label: 'Streamable HTTP', value: 'streamable_http' },
  { label: 'SSE (Server-Sent Events)', value: 'sse' },
];

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return 'just now';
  if (diffMs < 60_000) return `${Math.floor(diffMs / 1000)}s ago`;
  if (diffMs < 3_600_000) return `${Math.floor(diffMs / 60_000)} min ago`;
  if (diffMs < 86_400_000) return `${Math.floor(diffMs / 3_600_000)}h ago`;
  return `${Math.floor(diffMs / 86_400_000)}d ago`;
}

function getStatusDisplay(state?: TriggerConnectionState): { label: string; cssClass: string } {
  switch (state) {
    case TriggerConnectionState.CONNECTED:
      return { label: 'Connected', cssClass: 'trigger-status--connected' };
    case TriggerConnectionState.CONNECTING:
      return { label: 'Connecting...', cssClass: 'trigger-status--connecting' };
    case TriggerConnectionState.ERROR:
      return { label: 'Error', cssClass: 'trigger-status--error' };
    case TriggerConnectionState.PAUSED:
      return { label: 'Paused', cssClass: 'trigger-status--paused' };
    case TriggerConnectionState.DISCONNECTED:
    default:
      return { label: 'Disconnected', cssClass: 'trigger-status--disconnected' };
  }
}

function renderTriggerStatusSection(
  triggerInfo: TriggerInfo | undefined,
  triggerActions: TriggerActions | undefined,
  config: NodeConfiguration,
): TemplateResult {
  const hasTrigger = !!triggerInfo?.triggerId;
  const statusDisplay = getStatusDisplay(triggerInfo?.status);
  const isActive = triggerInfo?.status === TriggerConnectionState.CONNECTED
    || triggerInfo?.status === TriggerConnectionState.CONNECTING;

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">
          <nr-icon name="radio" size="small"></nr-icon>
          Connection Status
        </span>
      </div>
      <div class="trigger-status-panel">
        <div class="trigger-status-row">
          <span class="trigger-status-dot ${statusDisplay.cssClass}"></span>
          <span class="trigger-status-label">${statusDisplay.label}</span>
          ${triggerInfo?.health && isActive ? html`
            <span class="trigger-health-badge trigger-health--${triggerInfo.health.toLowerCase()}">${triggerInfo.health}</span>
          ` : nothing}
        </div>
        ${triggerInfo?.stateReason ? html`
          <div class="trigger-status-reason">${triggerInfo.stateReason}</div>
        ` : nothing}
        ${isActive && triggerInfo?.messagesReceived != null ? html`
          <div class="trigger-stats-row">
            <span class="trigger-stat">
              <nr-icon name="tool" size="small"></nr-icon>
              ${triggerInfo.messagesReceived} tool call${triggerInfo.messagesReceived !== 1 ? 's' : ''} routed
            </span>
            ${triggerInfo.lastMessageAt ? html`
              <span class="trigger-stat trigger-stat--secondary">
                Last: ${formatRelativeTime(triggerInfo.lastMessageAt)}
              </span>
            ` : nothing}
          </div>
        ` : nothing}
      </div>
      ${triggerActions ? html`
        <div class="trigger-actions">
          ${!hasTrigger ? html`
            <button class="trigger-action-btn trigger-action-btn--primary"
              @click=${() => triggerActions.onCreateAndActivate('MCP', config)}>
              <nr-icon name="play" size="small"></nr-icon>
              Connect
            </button>
          ` : isActive ? html`
            <button class="trigger-action-btn trigger-action-btn--danger"
              @click=${() => triggerActions.onDeactivate(triggerInfo!.triggerId!)}>
              <nr-icon name="square" size="small"></nr-icon>
              Disconnect
            </button>
          ` : html`
            <button class="trigger-action-btn trigger-action-btn--primary"
              @click=${() => triggerActions.onActivate(triggerInfo!.triggerId!)}>
              <nr-icon name="play" size="small"></nr-icon>
              Connect
            </button>
          `}
        </div>
      ` : nothing}
    </div>
  `;
}

/**
 * Render MCP Server config fields
 */
export function renderMcpFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  triggerInfo?: TriggerInfo,
  triggerActions?: TriggerActions,
): TemplateResult {
  const transportType = (config as any).transportType || 'streamable_http';

  return html`
    ${renderTriggerStatusSection(triggerInfo, triggerActions, config)}

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Server Configuration</span>
        <span class="config-section-desc">Configure the MCP server connection</span>
      </div>
      <div class="config-field">
        <label>Server URL</label>
        <nr-input
          value=${(config as any).serverUrl || ''}
          placeholder="http://localhost:3000/mcp"
          @nr-input=${(e: CustomEvent) => onUpdate('serverUrl', e.detail.value)}
        ></nr-input>
        <span class="field-description">The URL of the MCP server endpoint</span>
      </div>
      <div class="config-field">
        <label>Transport Type</label>
        <nr-select
          .value=${transportType}
          .options=${TRANSPORT_TYPES}
          @nr-change=${(e: CustomEvent) => onUpdate('transportType', e.detail.value)}
        ></nr-select>
        <span class="field-description">
          ${transportType === 'sse'
            ? 'Server-Sent Events transport (legacy MCP servers)'
            : 'Streamable HTTP transport (recommended for MCP 2025+)'}
        </span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">
          <nr-icon name="info" size="small"></nr-icon>
          Usage
        </span>
      </div>
      <div class="config-field">
        <span class="field-description">
          Connect this node to an Agent or LLM node's <strong>tools</strong> port.
          The Agent/LLM will automatically discover and call tools from the MCP server.
        </span>
      </div>
    </div>
  `;
}
