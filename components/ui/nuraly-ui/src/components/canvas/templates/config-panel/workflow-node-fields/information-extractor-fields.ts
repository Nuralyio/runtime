/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { NodeConfiguration } from '../../../workflow-canvas.types.js';

interface SchemaField {
  name: string;
  type: string;
  description: string;
  required: boolean;
}

/**
 * Render Information Extractor node fields
 *
 * Backend expects:
 * - inputField: Variable expression for the text to extract from
 * - schema: Array of { name, type, description, required } field definitions
 * - provider: LLM provider (openai, anthropic, gemini, ollama)
 * - model: LLM model name
 * - apiKeyPath: KV store path for API key
 * - instructions: Additional extraction instructions for the LLM
 */
export function renderInformationExtractorFields(
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void
): TemplateResult {
  const schema = (config.schema as SchemaField[] | undefined) || [
    { name: 'field1', type: 'string', description: '', required: true },
  ];

  const addField = () => {
    const newSchema = [
      ...schema,
      { name: '', type: 'string', description: '', required: true },
    ];
    onUpdate('schema', newSchema);
  };

  const removeField = (index: number) => {
    const newSchema = schema.filter((_, i) => i !== index);
    onUpdate('schema', newSchema);
  };

  const updateField = (index: number, key: keyof SchemaField, value: unknown) => {
    const newSchema = schema.map((field, i) =>
      i === index ? { ...field, [key]: value } : field
    );
    onUpdate('schema', newSchema);
  };

  return html`
    <div class="config-field">
      <label>Input Field</label>
      <nr-input
        value=${(config.inputField as string) || 'text'}
        placeholder="\${input.text}"
        @nr-input=${(e: CustomEvent) => onUpdate('inputField', e.detail.value)}
      ></nr-input>
      <small class="field-hint">Field or expression containing the text to extract from</small>
    </div>

    <div class="config-field">
      <label>Extraction Schema</label>
      <small class="field-hint">Define the fields to extract from the text</small>

      ${schema.map(
        (field: SchemaField, index: number) => html`
          <div class="schema-field-group" style="border: 1px solid var(--nuraly-color-border, #e2e8f0); border-radius: 6px; padding: 8px; margin-top: 8px;">
            <div style="display: flex; gap: 8px; align-items: center;">
              <div style="flex: 1;">
                <nr-input
                  value=${field.name}
                  placeholder="Field name"
                  size="small"
                  @nr-input=${(e: CustomEvent) => updateField(index, 'name', e.detail.value)}
                ></nr-input>
              </div>
              <div style="width: 120px;">
                <nr-select
                  .value=${field.type}
                  .options=${[
                    { label: 'String', value: 'string' },
                    { label: 'Number', value: 'number' },
                    { label: 'Date', value: 'date' },
                    { label: 'Boolean', value: 'boolean' },
                    { label: 'Array', value: 'array' },
                  ]}
                  size="small"
                  @nr-change=${(e: CustomEvent) => updateField(index, 'type', e.detail.value)}
                ></nr-select>
              </div>
              <nr-button
                variant="ghost"
                size="small"
                @click=${() => removeField(index)}
                ?disabled=${schema.length <= 1}
              >
                <nr-icon name="trash-2" size="14"></nr-icon>
              </nr-button>
            </div>
            <div style="margin-top: 4px;">
              <nr-input
                value=${field.description}
                placeholder="Description (helps AI understand what to extract)"
                size="small"
                @nr-input=${(e: CustomEvent) => updateField(index, 'description', e.detail.value)}
              ></nr-input>
            </div>
            <div style="margin-top: 4px;">
              <label class="checkbox-label" style="font-size: 12px;">
                <nr-checkbox
                  ?checked=${field.required !== false}
                  @nr-change=${(e: CustomEvent) => updateField(index, 'required', e.detail.checked)}
                ></nr-checkbox>
                Required
              </label>
            </div>
          </div>
        `
      )}

      <nr-button
        variant="outline"
        size="small"
        style="margin-top: 8px; width: 100%;"
        @click=${addField}
      >
        <nr-icon name="plus" size="14"></nr-icon>
        Add Field
      </nr-button>
    </div>

    <div class="config-field">
      <label>LLM Provider</label>
      <nr-select
        .value=${(config.provider as string) || 'openai'}
        .options=${[
          { label: 'OpenAI', value: 'openai' },
          { label: 'Anthropic', value: 'anthropic' },
          { label: 'Google Gemini', value: 'gemini' },
          { label: 'Ollama (Local)', value: 'ollama' },
        ]}
        @nr-change=${(e: CustomEvent) => onUpdate('provider', e.detail.value)}
      ></nr-select>
    </div>

    <div class="config-field">
      <label>Model</label>
      <nr-input
        value=${(config.model as string) || 'gpt-4o-mini'}
        placeholder="gpt-4o-mini"
        @nr-input=${(e: CustomEvent) => onUpdate('model', e.detail.value)}
      ></nr-input>
    </div>

    <div class="config-field">
      <label>API Key</label>
      <nr-input
        value=${(config.apiKeyPath as string) || ''}
        placeholder="openai/my-key"
        @nr-input=${(e: CustomEvent) => onUpdate('apiKeyPath', e.detail.value)}
      ></nr-input>
      <small class="field-hint">KV store path for the API key</small>
    </div>

    ${(config.provider as string) === 'ollama'
      ? html`
          <div class="config-field">
            <label>API URL</label>
            <nr-input
              value=${(config.apiUrlPath as string) || ''}
              placeholder="ollama/server-url"
              @nr-input=${(e: CustomEvent) => onUpdate('apiUrlPath', e.detail.value)}
            ></nr-input>
            <small class="field-hint">KV store path for Ollama server URL</small>
          </div>
        `
      : nothing}

    <div class="config-field">
      <label>Additional Instructions</label>
      <nr-textarea
        value=${(config.instructions as string) || ''}
        placeholder="Optional: provide extra context to guide the extraction..."
        rows="3"
        @nr-input=${(e: CustomEvent) => onUpdate('instructions', e.detail.value)}
      ></nr-textarea>
      <small class="field-hint">Extra guidance for the AI on how to extract fields</small>
    </div>
  `;
}
