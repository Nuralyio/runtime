import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from '../../base/BaseElement';
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { handleComponentEvent } from '../../base/BaseElement/execute-event.helpers.ts';

interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message?: string;
}

@customElement("validation-rules-display")
export class ValidationRulesDisplay extends BaseElementBlock {
  static override styles = [
    css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        color: #e0e0e0;
      }

      .validation-container {
        background: #2a2a2a;
        border-radius: 6px;
        padding: 12px;
        width: 100%;
        box-sizing: border-box;
      }

      .section {
        margin-bottom: 12px;
      }

      .section:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 11px;
        font-weight: 600;
        color: #888;
        text-transform: uppercase;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }

      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .row:last-child {
        margin-bottom: 0;
      }

      .label {
        font-size: 12px;
        color: #ccc;
        flex: 1;
      }

      .toggle-switch {
        position: relative;
        width: 36px;
        height: 20px;
        background: #444;
        border-radius: 10px;
        cursor: pointer;
        transition: background 0.2s;
      }

      .toggle-switch.active {
        background: #4a9eff;
      }

      .toggle-switch::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        transition: transform 0.2s;
      }

      .toggle-switch.active::after {
        transform: translateX(16px);
      }

      .input-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .input-field {
        flex: 1;
        background: #333;
        border: 1px solid #444;
        border-radius: 4px;
        padding: 6px 8px;
        color: #e0e0e0;
        font-size: 12px;
        outline: none;
        transition: border-color 0.2s;
      }

      .input-field:focus {
        border-color: #4a9eff;
      }

      .input-field::placeholder {
        color: #666;
      }

      .input-field.small {
        width: 60px;
        flex: none;
      }

      .preset-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 6px;
      }

      .preset-btn {
        background: #333;
        border: 1px solid #444;
        border-radius: 4px;
        padding: 4px 8px;
        color: #ccc;
        font-size: 10px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .preset-btn:hover {
        background: #3a3a3a;
        border-color: #555;
      }

      .preset-btn.active {
        background: #4a9eff;
        border-color: #4a9eff;
        color: white;
      }

      .rules-list {
        background: #252525;
        border-radius: 4px;
        padding: 8px;
        margin-top: 8px;
      }

      .rule-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        background: #333;
        border-radius: 4px;
        margin-bottom: 4px;
      }

      .rule-item:last-child {
        margin-bottom: 0;
      }

      .rule-info {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .rule-type {
        font-size: 11px;
        font-weight: 500;
        color: #4a9eff;
      }

      .rule-value {
        font-size: 11px;
        color: #888;
      }

      .rule-message {
        font-size: 10px;
        color: #666;
        font-style: italic;
      }

      .delete-btn {
        background: transparent;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        font-size: 14px;
        line-height: 1;
        transition: color 0.2s;
      }

      .delete-btn:hover {
        color: #ff6b6b;
      }

      .add-rule-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        width: 100%;
        background: #333;
        border: 1px dashed #555;
        border-radius: 4px;
        padding: 8px;
        color: #888;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.2s;
        margin-top: 8px;
      }

      .add-rule-btn:hover {
        background: #3a3a3a;
        border-color: #4a9eff;
        color: #4a9eff;
      }

      .empty-state {
        text-align: center;
        padding: 16px;
        color: #666;
        font-size: 11px;
      }

      .divider {
        height: 1px;
        background: #3a3a3a;
        margin: 12px 0;
      }
    `,
  ];

  @property({ type: Object })
  component: ComponentElement;

  @state()
  private _showCustomPattern = false;

  private emitChange(property: string, type: string, value: any) {
    handleComponentEvent({
      isViewMode: true,
      component: this.component,
      item: this.item,
      eventName: "onChange",
      event: new CustomEvent('change'),
      data: { property, type, value },
    });
  }

  private handleToggle(property: string, currentValue: boolean) {
    this.emitChange(property, 'boolean', !currentValue);
  }

  private handleNumberChange(property: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value ? parseInt(input.value, 10) : null;
    this.emitChange(property, 'number', value);
  }

  private handlePatternPreset(preset: string) {
    const patterns: Record<string, string> = {
      email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      url: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$',
      phone: '^[+]?[(]?[0-9]{1,3}[)]?[-\\s.]?[0-9]{1,4}[-\\s.]?[0-9]{1,4}[-\\s.]?[0-9]{1,9}$',
      alphanumeric: '^[a-zA-Z0-9]+$',
      numeric: '^[0-9]+$',
    };

    if (preset === 'custom') {
      this._showCustomPattern = true;
    } else {
      this._showCustomPattern = false;
      this.emitChange('pattern', 'string', patterns[preset] || '');
    }
  }

  private handleCustomPattern(event: Event) {
    const input = event.target as HTMLInputElement;
    this.emitChange('pattern', 'string', input.value);
  }

  private handleRulesChange(rules: ValidationRule[]) {
    this.emitChange('rules', 'array', rules);
  }

  private addRule(type: ValidationRule['type']) {
    const currentRules = this.inputHandlersValue?.rules || [];
    const newRule: ValidationRule = { type, message: '' };

    if (type === 'minLength' || type === 'maxLength') {
      newRule.value = type === 'minLength' ? 1 : 100;
    } else if (type === 'min' || type === 'max') {
      newRule.value = type === 'min' ? 0 : 100;
    } else if (type === 'pattern') {
      newRule.value = '';
    }

    this.handleRulesChange([...currentRules, newRule]);
  }

  private removeRule(index: number) {
    const currentRules = [...(this.inputHandlersValue?.rules || [])];
    currentRules.splice(index, 1);
    this.handleRulesChange(currentRules);
  }

  private getActivePreset(pattern: string): string {
    const patterns: Record<string, string> = {
      email: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      url: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$',
      phone: '^[+]?[(]?[0-9]{1,3}[)]?[-\\s.]?[0-9]{1,4}[-\\s.]?[0-9]{1,4}[-\\s.]?[0-9]{1,9}$',
      alphanumeric: '^[a-zA-Z0-9]+$',
      numeric: '^[0-9]+$',
    };

    for (const [key, value] of Object.entries(patterns)) {
      if (pattern === value) return key;
    }
    return pattern ? 'custom' : '';
  }

  override renderComponent() {
    const handlers = this.inputHandlersValue || {};

    if (!handlers || Object.keys(handlers).length === 0) {
      return html`
        <div class="validation-container">
          <div class="empty-state">
            Select a component to configure validation
          </div>
        </div>
      `;
    }

    const required = handlers.required || false;
    const minLength = handlers.minLength ?? '';
    const maxLength = handlers.maxLength ?? '';
    const pattern = handlers.pattern || '';
    const rules = handlers.rules || [];
    const activePreset = this.getActivePreset(pattern);

    return html`
      <div class="validation-container">
        <!-- Required Toggle -->
        <div class="section">
          <div class="row">
            <span class="label">Required</span>
            <div
              class="toggle-switch ${required ? 'active' : ''}"
              @click=${() => this.handleToggle('required', required)}
            ></div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Length Constraints -->
        <div class="section">
          <div class="section-title">Length</div>
          <div class="row">
            <span class="label">Min Length</span>
            <input
              type="number"
              class="input-field small"
              .value=${minLength}
              placeholder="0"
              min="0"
              @change=${(e: Event) => this.handleNumberChange('minLength', e)}
            />
          </div>
          <div class="row">
            <span class="label">Max Length</span>
            <input
              type="number"
              class="input-field small"
              .value=${maxLength}
              placeholder="100"
              min="0"
              @change=${(e: Event) => this.handleNumberChange('maxLength', e)}
            />
          </div>
        </div>

        <div class="divider"></div>

        <!-- Pattern Validation -->
        <div class="section">
          <div class="section-title">Pattern</div>
          <div class="preset-buttons">
            ${['email', 'url', 'phone', 'alphanumeric', 'numeric', 'custom'].map(preset => html`
              <button
                class="preset-btn ${activePreset === preset ? 'active' : ''}"
                @click=${() => this.handlePatternPreset(preset)}
              >
                ${preset}
              </button>
            `)}
          </div>
          ${this._showCustomPattern || activePreset === 'custom' ? html`
            <input
              type="text"
              class="input-field"
              style="margin-top: 8px;"
              .value=${pattern}
              placeholder="Enter regex pattern"
              @change=${(e: Event) => this.handleCustomPattern(e)}
            />
          ` : ''}
        </div>

        <div class="divider"></div>

        <!-- Custom Rules -->
        <div class="section">
          <div class="section-title">Custom Rules</div>
          ${rules.length > 0 ? html`
            <div class="rules-list">
              ${rules.map((rule: ValidationRule, index: number) => html`
                <div class="rule-item">
                  <div class="rule-info">
                    <span class="rule-type">${rule.type}</span>
                    ${rule.value !== undefined ? html`
                      <span class="rule-value">${rule.value}</span>
                    ` : ''}
                    ${rule.message ? html`
                      <span class="rule-message">"${rule.message}"</span>
                    ` : ''}
                  </div>
                  <button
                    class="delete-btn"
                    @click=${() => this.removeRule(index)}
                  >×</button>
                </div>
              `)}
            </div>
          ` : html`
            <div class="empty-state">No custom rules defined</div>
          `}
          <button class="add-rule-btn" @click=${() => this.addRule('custom')}>
            + Add Custom Rule
          </button>
        </div>
      </div>
    `;
  }
}
