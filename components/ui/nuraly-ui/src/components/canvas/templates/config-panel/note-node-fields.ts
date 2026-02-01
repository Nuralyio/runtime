/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../workflow-canvas.types.js';

// Import color picker component
import '../../../colorpicker/color-picker.component.js';

/**
 * Render NOTE node specific configuration fields
 */
export function renderNoteFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const bgColor = (config.noteBackgroundColor as string) || '#fef08a';
  const textColor = (config.noteTextColor as string) || '#713f12';
  const fontSize = (config.noteFontSize as string) || 'medium';
  const showBorder = (config.noteShowBorder as boolean) || false;

  // Predefined note color presets
  const colorPresets = [
    { bg: '#fef08a', text: '#713f12', name: 'Yellow' },
    { bg: '#bbf7d0', text: '#166534', name: 'Green' },
    { bg: '#bfdbfe', text: '#1e40af', name: 'Blue' },
    { bg: '#fecaca', text: '#991b1b', name: 'Red' },
    { bg: '#e9d5ff', text: '#6b21a8', name: 'Purple' },
    { bg: '#fed7aa', text: '#9a3412', name: 'Orange' },
    { bg: '#f3f4f6', text: '#374151', name: 'Gray' },
    { bg: '#fce7f3', text: '#9d174d', name: 'Pink' },
  ];

  return html`
    <div class="config-field">
      <label>Note Color</label>
      <div class="note-color-presets">
        ${colorPresets.map(preset => html`
          <button
            class="note-color-preset ${bgColor === preset.bg ? 'active' : ''}"
            style="background-color: ${preset.bg}; color: ${preset.text};"
            title="${preset.name}"
            @click=${() => {
              onUpdate('noteBackgroundColor', preset.bg);
              onUpdate('noteTextColor', preset.text);
            }}
          >
            <nr-icon name="check" size="small" style="opacity: ${bgColor === preset.bg ? '1' : '0'}"></nr-icon>
          </button>
        `)}
      </div>
    </div>

    <div class="config-field">
      <label>Custom Background</label>
      <nr-color-picker
        color=${bgColor}
        size="small"
        show-input
        @hy-color-change=${(e: CustomEvent) => onUpdate('noteBackgroundColor', e.detail.value)}
      ></nr-color-picker>
    </div>

    <div class="config-field">
      <label>Text Color</label>
      <nr-color-picker
        color=${textColor}
        size="small"
        show-input
        @hy-color-change=${(e: CustomEvent) => onUpdate('noteTextColor', e.detail.value)}
      ></nr-color-picker>
    </div>

    <div class="config-field">
      <label>Font Size</label>
      <nr-select
        .value=${fontSize}
        @nr-change=${(e: CustomEvent) => onUpdate('noteFontSize', e.detail.value)}
      >
        <nr-option value="small">Small</nr-option>
        <nr-option value="medium">Medium</nr-option>
        <nr-option value="large">Large</nr-option>
      </nr-select>
    </div>

    <div class="config-field">
      <nr-checkbox
        ?checked=${showBorder}
        @nr-change=${(e: CustomEvent) => onUpdate('noteShowBorder', e.detail.checked)}
      >
        Show border
      </nr-checkbox>
    </div>
  `;
}
