/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

const TWILIO_OPERATIONS = [
  { value: 'send_sms', label: 'Send SMS' },
  { value: 'make_call', label: 'Make Voice Call' },
  { value: 'send_whatsapp', label: 'Send WhatsApp Message' },
];

/**
 * Render Twilio SMS node config fields
 */
export function renderTwilioSmsFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
): TemplateResult {
  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Operation</span>
        <span class="config-section-desc">Choose the Twilio action to perform</span>
      </div>
      <div class="config-field">
        <label>Operation</label>
        <nr-select
          value=${(config as any).twilioOperation || 'send_sms'}
          @nr-change=${(e: CustomEvent) => onUpdate('twilioOperation', e.detail.value)}
        >
          ${TWILIO_OPERATIONS.map(op => html`
            <nr-option value=${op.value}>${op.label}</nr-option>
          `)}
        </nr-select>
        <span class="field-description">SMS, Voice Call, or WhatsApp message</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Credentials</span>
        <span class="config-section-desc">Twilio account credentials</span>
      </div>
      <div class="config-field">
        <label>Account SID</label>
        <nr-input
          type="password"
          value=${(config as any).twilioAccountSid || ''}
          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioAccountSid', e.detail.value)}
        ></nr-input>
        <span class="field-description">Your Twilio Account SID</span>
      </div>
      <div class="config-field">
        <label>Auth Token</label>
        <nr-input
          type="password"
          value=${(config as any).twilioAuthToken || ''}
          placeholder="Your Twilio Auth Token"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioAuthToken', e.detail.value)}
        ></nr-input>
        <span class="field-description">Your Twilio Auth Token</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Message</span>
        <span class="config-section-desc">Configure the message to send</span>
      </div>
      <div class="config-field">
        <label>From Number</label>
        <nr-input
          value=${(config as any).twilioFromNumber || ''}
          placeholder="+1234567890${(config as any).twilioOperation === 'send_whatsapp' ? ' or whatsapp:+1234567890' : ''}"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioFromNumber', e.detail.value)}
        ></nr-input>
        <span class="field-description">Your Twilio phone number${(config as any).twilioOperation === 'send_whatsapp' ? ' (prefix with whatsapp:)' : ''}</span>
      </div>
      <div class="config-field">
        <label>To Number</label>
        <nr-input
          value=${(config as any).twilioToNumber || ''}
          placeholder="+1234567890"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioToNumber', e.detail.value)}
        ></nr-input>
        <span class="field-description">Recipient phone number. Use \${variableName} for dynamic content.</span>
      </div>
      <div class="config-field">
        <label>Message Body</label>
        <nr-input
          type="textarea"
          value=${(config as any).twilioMessageBody || ''}
          placeholder="Hello from Nuraly! Use \${variable} for dynamic content"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioMessageBody', e.detail.value)}
        ></nr-input>
        <span class="field-description">Message text. Use \${variableName} for dynamic content.</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Options</span>
      </div>
      <div class="config-field">
        <label>Status Callback URL</label>
        <nr-input
          value=${(config as any).twilioStatusCallback || ''}
          placeholder="https://example.com/status (optional)"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioStatusCallback', e.detail.value)}
        ></nr-input>
        <span class="field-description">URL to receive delivery status updates</span>
      </div>
    </div>
  `;
}

/**
 * Render Twilio Voice Call node config fields
 */
export function renderTwilioVoiceFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
): TemplateResult {
  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Credentials</span>
        <span class="config-section-desc">Twilio account credentials</span>
      </div>
      <div class="config-field">
        <label>Account SID</label>
        <nr-input
          type="password"
          value=${(config as any).twilioAccountSid || ''}
          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioAccountSid', e.detail.value)}
        ></nr-input>
        <span class="field-description">Your Twilio Account SID</span>
      </div>
      <div class="config-field">
        <label>Auth Token</label>
        <nr-input
          type="password"
          value=${(config as any).twilioAuthToken || ''}
          placeholder="Your Twilio Auth Token"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioAuthToken', e.detail.value)}
        ></nr-input>
        <span class="field-description">Your Twilio Auth Token</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Call Configuration</span>
        <span class="config-section-desc">Configure the voice call</span>
      </div>
      <div class="config-field">
        <label>From Number</label>
        <nr-input
          value=${(config as any).twilioFromNumber || ''}
          placeholder="+1234567890"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioFromNumber', e.detail.value)}
        ></nr-input>
        <span class="field-description">Your Twilio phone number</span>
      </div>
      <div class="config-field">
        <label>To Number</label>
        <nr-input
          value=${(config as any).twilioToNumber || ''}
          placeholder="+1234567890"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioToNumber', e.detail.value)}
        ></nr-input>
        <span class="field-description">Recipient phone number. Use \${variableName} for dynamic content.</span>
      </div>
      <div class="config-field">
        <label>TwiML URL</label>
        <nr-input
          value=${(config as any).twilioVoiceUrl || ''}
          placeholder="https://example.com/twiml.xml"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioVoiceUrl', e.detail.value)}
        ></nr-input>
        <span class="field-description">URL that returns TwiML instructions for the call</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Options</span>
      </div>
      <div class="config-field">
        <label>Status Callback URL</label>
        <nr-input
          value=${(config as any).twilioStatusCallback || ''}
          placeholder="https://example.com/status (optional)"
          @nr-input=${(e: CustomEvent) => onUpdate('twilioStatusCallback', e.detail.value)}
        ></nr-input>
        <span class="field-description">URL to receive call status updates</span>
      </div>
    </div>
  `;
}
