/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

const OPERATIONS = [
  { value: 'getAll', label: 'Get All Events' },
  { value: 'get', label: 'Get Event' },
  { value: 'create', label: 'Create Event' },
  { value: 'update', label: 'Update Event' },
  { value: 'delete', label: 'Delete Event' },
];

/**
 * Render Google Calendar node config fields
 */
export function renderGoogleCalendarFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
): TemplateResult {
  const operation = (config as any).googleCalendarOperation || 'getAll';
  const showEventFields = operation === 'create' || operation === 'update';
  const showDateRange = operation === 'getAll';
  const showEventId = operation === 'get' || operation === 'update' || operation === 'delete';

  return html`
    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Connection</span>
        <span class="config-section-desc">Google Calendar API credentials</span>
      </div>
      <div class="config-field">
        <label>OAuth2 Credential</label>
        <nr-input
          type="password"
          value=${(config as any).googleCalendarCredential || ''}
          placeholder="Google OAuth2 credential"
          @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarCredential', e.detail.value)}
        ></nr-input>
        <span class="field-description">OAuth2 credential for Google Calendar API</span>
      </div>
      <div class="config-field">
        <label>Calendar ID</label>
        <nr-input
          value=${(config as any).googleCalendarId || 'primary'}
          placeholder="primary"
          @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarId', e.detail.value)}
        ></nr-input>
        <span class="field-description">Calendar ID or "primary" for the user's main calendar</span>
      </div>
    </div>

    <div class="config-section">
      <div class="config-section-header">
        <span class="config-section-title">Operation</span>
        <span class="config-section-desc">Choose what to do with calendar events</span>
      </div>
      <div class="config-field">
        <label>Operation</label>
        <nr-select
          value=${operation}
          @nr-change=${(e: CustomEvent) => onUpdate('googleCalendarOperation', e.detail.value)}
        >
          ${OPERATIONS.map(op => html`
            <nr-option value=${op.value}>${op.label}</nr-option>
          `)}
        </nr-select>
      </div>
    </div>

    ${showEventId ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Event ID</span>
        </div>
        <div class="config-field">
          <label>Event ID</label>
          <nr-input
            value=${(config as any).googleCalendarEventId || ''}
            placeholder="Event ID"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarEventId', e.detail.value)}
          ></nr-input>
          <span class="field-description">The ID of the calendar event</span>
        </div>
      </div>
    ` : ''}

    ${showEventFields ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Event Details</span>
          <span class="config-section-desc">Configure the calendar event</span>
        </div>
        <div class="config-field">
          <label>Summary</label>
          <nr-input
            value=${(config as any).googleCalendarEventSummary || ''}
            placeholder="Event title"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarEventSummary', e.detail.value)}
          ></nr-input>
          <span class="field-description">Title of the event</span>
        </div>
        <div class="config-field">
          <label>Description</label>
          <nr-input
            type="textarea"
            value=${(config as any).googleCalendarEventDescription || ''}
            placeholder="Event description"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarEventDescription', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Start</label>
          <nr-input
            value=${(config as any).googleCalendarEventStart || ''}
            placeholder="2024-01-01T09:00:00Z"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarEventStart', e.detail.value)}
          ></nr-input>
          <span class="field-description">Start datetime in ISO 8601 format</span>
        </div>
        <div class="config-field">
          <label>End</label>
          <nr-input
            value=${(config as any).googleCalendarEventEnd || ''}
            placeholder="2024-01-01T10:00:00Z"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarEventEnd', e.detail.value)}
          ></nr-input>
          <span class="field-description">End datetime in ISO 8601 format</span>
        </div>
        <div class="config-field">
          <label>Location</label>
          <nr-input
            value=${(config as any).googleCalendarEventLocation || ''}
            placeholder="Meeting room or address"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarEventLocation', e.detail.value)}
          ></nr-input>
        </div>
        <div class="config-field">
          <label>Attendees</label>
          <nr-input
            value=${(config as any).googleCalendarEventAttendees || ''}
            placeholder="email1@example.com, email2@example.com"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarEventAttendees', e.detail.value)}
          ></nr-input>
          <span class="field-description">Comma-separated email addresses</span>
        </div>
        <div class="config-field">
          <label>Recurrence</label>
          <nr-input
            value=${(config as any).googleCalendarRecurrence || ''}
            placeholder="RRULE:FREQ=WEEKLY;BYDAY=MO"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarRecurrence', e.detail.value)}
          ></nr-input>
          <span class="field-description">Recurrence rule in RRULE format</span>
        </div>
        <div class="config-field">
          <label>Add Google Meet</label>
          <nr-switch
            ?checked=${(config as any).googleCalendarConferenceData === true}
            @nr-change=${(e: CustomEvent) => onUpdate('googleCalendarConferenceData', e.detail.checked)}
          ></nr-switch>
          <span class="field-description">Automatically add a Google Meet video conference link</span>
        </div>
      </div>
    ` : ''}

    ${showDateRange ? html`
      <div class="config-section">
        <div class="config-section-header">
          <span class="config-section-title">Date Range</span>
          <span class="config-section-desc">Filter events by date range</span>
        </div>
        <div class="config-field">
          <label>Time Min</label>
          <nr-input
            value=${(config as any).googleCalendarTimeMin || ''}
            placeholder="2024-01-01T00:00:00Z"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarTimeMin', e.detail.value)}
          ></nr-input>
          <span class="field-description">Lower bound (inclusive) for event start time</span>
        </div>
        <div class="config-field">
          <label>Time Max</label>
          <nr-input
            value=${(config as any).googleCalendarTimeMax || ''}
            placeholder="2024-12-31T23:59:59Z"
            @nr-input=${(e: CustomEvent) => onUpdate('googleCalendarTimeMax', e.detail.value)}
          ></nr-input>
          <span class="field-description">Upper bound (exclusive) for event start time</span>
        </div>
      </div>
    ` : ''}
  `;
}
