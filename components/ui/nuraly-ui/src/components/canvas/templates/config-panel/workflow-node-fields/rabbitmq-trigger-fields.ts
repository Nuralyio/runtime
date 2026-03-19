/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration, TriggerConnectionState } from '../../../workflow-canvas.types.js';
import type { TriggerInfo, TriggerActions } from '../types.js';

const CONTENT_TYPE_OPTIONS = [
  { value: 'application/json', label: 'JSON' },
  { value: 'text/plain', label: 'Text' },
  { value: 'application/octet-stream', label: 'Binary' },
];

/**
 * Format a relative time string from an ISO timestamp
 */
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

/**
 * Get display label and CSS class for a trigger connection state
 */
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

/**
 * Render the trigger stats row (messages received, last message time)
 */
function renderTriggerStats(triggerInfo: TriggerInfo): TemplateResult {
  return html`
    <div class="trigger-stats-row">
      <span class="trigger-stat">
        <nr-icon name="message-square" size="small"></nr-icon>
        ${triggerInfo.messagesReceived} message${triggerInfo.messagesReceived === 1 ? '' : 's'} received
      </span>
      ${triggerInfo.lastMessageAt ? html`
        <span class="trigger-stat trigger-stat--secondary">
          Last: ${formatRelativeTime(triggerInfo.lastMessageAt)}
        </span>
      ` : nothing}
    </div>
  `;
}

/**
 * Render the action button based on trigger state
 */
function renderActionButton(
  hasTrigger: boolean,
  isActive: boolean,
  triggerInfo: TriggerInfo | undefined,
  triggerActions: TriggerActions,
  nodeType: string,
  config: NodeConfiguration,
): TemplateResult {
  if (!hasTrigger) {
    return html`
      <button
        class="trigger-action-btn trigger-action-btn--primary"
        @click=${() => triggerActions.onCreateAndActivate(nodeType, config)}
      >
        <nr-icon name="play" size="small"></nr-icon>
        Activate Trigger
      </button>
    `;
  }
  const triggerId = triggerInfo?.triggerId ?? '';
  if (isActive) {
    return html`
      <button
        class="trigger-action-btn trigger-action-btn--danger"
        @click=${() => triggerActions.onDeactivate(triggerId)}
      >
        <nr-icon name="square" size="small"></nr-icon>
        Deactivate
      </button>
    `;
  }
  return html`
    <button
      class="trigger-action-btn trigger-action-btn--primary"
      @click=${() => triggerActions.onActivate(triggerId)}
    >
      <nr-icon name="play" size="small"></nr-icon>
      Activate
    </button>
  `;
}

/**
 * Render the trigger status section at the top of the config panel
 */
function renderTriggerStatusSection(
  triggerInfo: TriggerInfo | undefined,
  triggerActions: TriggerActions | undefined,
  nodeType: string,
  config: NodeConfiguration,
): TemplateResult {
  const hasTrigger = !!triggerInfo?.triggerId;
  const statusDisplay = getStatusDisplay(triggerInfo?.status);
  const isActive = triggerInfo?.status === TriggerConnectionState.CONNECTED
    || triggerInfo?.status === TriggerConnectionState.CONNECTING;
  const showStats = isActive && triggerInfo?.messagesReceived != null;

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">
          <nr-icon name="radio" size="small"></nr-icon>
          Trigger Status
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

        ${showStats && triggerInfo ? renderTriggerStats(triggerInfo) : nothing}

        ${triggerInfo?.inDevMode ? html`
          <div class="trigger-dev-mode-badge">
            <nr-icon name="code" size="small"></nr-icon>
            Dev Mode Active
          </div>
        ` : nothing}
      </div>

      ${triggerActions ? html`
        <div class="trigger-actions">
          ${renderActionButton(hasTrigger, isActive, triggerInfo, triggerActions, nodeType, config)}

          ${hasTrigger ? html`
            <label class="trigger-dev-toggle">
              <input
                type="checkbox"
                .checked=${!!triggerInfo?.inDevMode}
                @change=${(e: Event) => {
                  const checked = (e.target as HTMLInputElement).checked;
                  triggerActions.onToggleDevMode(triggerInfo!.triggerId!, checked);
                }}
              />
              <span class="trigger-dev-toggle-label">
                ${triggerInfo?.inDevMode ? 'Exit Dev Mode' : 'Dev Mode'}
              </span>
            </label>
          ` : nothing}
        </div>
      ` : nothing}
    </div>
  `;
}

/**
 * Render RabbitMQ Trigger config fields
 */
export function renderRabbitMQTriggerFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  triggerInfo?: TriggerInfo,
  triggerActions?: TriggerActions,
): TemplateResult {
  return html`
    ${renderTriggerStatusSection(triggerInfo, triggerActions, 'RABBITMQ_TRIGGER', config)}

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Connection</span>
        <span class="config-section-desc">Configure the RabbitMQ connection</span>
      </div>
      <div class="config-field">
        <label>Connection URL</label>
        <nr-input
          type="password"
          value=${(config as any).connectionUrl || ''}
          placeholder="amqp://user:password@host:5672"
          @nr-input=${(e: CustomEvent) => onUpdate('connectionUrl', e.detail.value)}
        ></nr-input>
        <span class="field-description">AMQP connection URL for the RabbitMQ server</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Queue Configuration</span>
        <span class="config-section-desc">Specify the queue and routing settings</span>
      </div>
      <div class="config-field">
        <label>Queue Name</label>
        <nr-input
          value=${(config as any).queueName || ''}
          placeholder="my-queue"
          @nr-input=${(e: CustomEvent) => onUpdate('queueName', e.detail.value)}
        ></nr-input>
        <span class="field-description">The queue to listen on for incoming messages</span>
      </div>
      <div class="config-field">
        <label>Exchange</label>
        <nr-input
          value=${(config as any).exchange || ''}
          placeholder="my-exchange (optional)"
          @nr-input=${(e: CustomEvent) => onUpdate('exchange', e.detail.value)}
        ></nr-input>
        <span class="field-description">Exchange to bind the queue to (leave empty for default exchange)</span>
      </div>
      <div class="config-field">
        <label>Routing Key</label>
        <nr-input
          value=${(config as any).routingKey || '#'}
          placeholder="#"
          @nr-input=${(e: CustomEvent) => onUpdate('routingKey', e.detail.value)}
        ></nr-input>
        <span class="field-description">Routing key for message filtering (# matches all)</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Consumer Settings</span>
        <span class="config-section-desc">Configure message consumption behavior</span>
      </div>
      <div class="config-field">
        <label>Auto Acknowledge</label>
        <nr-checkbox
          .checked=${!!(config as any).autoAck}
          @nr-change=${(e: CustomEvent) => onUpdate('autoAck', e.detail.checked)}
        ></nr-checkbox>
        <span class="field-description">Automatically acknowledge messages (disable for manual ack after workflow completion)</span>
      </div>
      <div class="config-field">
        <label>Content Type</label>
        <nr-select
          .value=${(config as any).contentType || 'application/json'}
          .options=${CONTENT_TYPE_OPTIONS}
          @nr-change=${(e: CustomEvent) => onUpdate('contentType', e.detail.value)}
        ></nr-select>
        <span class="field-description">Expected message content type for deserialization</span>
      </div>
      <div class="config-field">
        <label>Prefetch Count</label>
        <nr-input
          type="number"
          value=${(config as any).prefetchCount ?? 1}
          min="1"
          max="100"
          @nr-input=${(e: CustomEvent) => onUpdate('prefetchCount', parseInt(e.detail.value, 10) || 1)}
        ></nr-input>
        <span class="field-description">Maximum number of unacknowledged messages to receive concurrently</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Credentials</span>
        <span class="config-section-desc">RabbitMQ connection credentials</span>
      </div>
      <div class="config-field">
        <label>Credential</label>
        <nr-select
          .value=${(config as any).credentialId || ''}
          placeholder="Select credential..."
          @nr-change=${(e: CustomEvent) => onUpdate('credentialId', e.detail.value)}
        ></nr-select>
        <span class="field-description">Select saved RabbitMQ credentials or use the connection URL above</span>
      </div>
    </div>
  `;
}
