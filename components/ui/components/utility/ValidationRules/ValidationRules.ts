import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from '../../base/BaseElement';
import { css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { handleComponentEvent } from '../../base/BaseElement/execute-event.helpers.ts';


// ValidationRule interface matching nr-input's expected format
interface ValidationRule {
  name?: string; // Custom name for the rule
  type?: 'string' | 'number' | 'boolean' | 'method' | 'regexp' | 'integer' | 'float' | 'array' | 'object' | 'enum' | 'date' | 'url' | 'hex' | 'email';
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  message?: string;
  warningOnly?: boolean;
}

// Rule presets matching nr-input's VALIDATION_RULES
const RULE_PRESETS = {
  required: (): ValidationRule => ({
    required: true,
    message: 'This field is required'
  }),
  email: (): ValidationRule => ({
    type: 'email',
    message: 'Please enter a valid email address'
  }),
  url: (): ValidationRule => ({
    type: 'url',
    message: 'Please enter a valid URL'
  }),
  phone: (): ValidationRule => ({
    pattern: '^[\\+]?[1-9][\\d]{0,15}$',
    message: 'Please enter a valid phone number'
  }),
  minLength: (value: number = 1): ValidationRule => ({
    minLength: value,
    message: `Minimum length is ${value} characters`
  }),
  maxLength: (value: number = 100): ValidationRule => ({
    maxLength: value,
    message: `Maximum length is ${value} characters`
  }),
  min: (value: number = 0): ValidationRule => ({
    type: 'number',
    min: value,
    message: `Minimum value is ${value}`
  }),
  max: (value: number = 100): ValidationRule => ({
    type: 'number',
    max: value,
    message: `Maximum value is ${value}`
  }),
  alphanumeric: (): ValidationRule => ({
    pattern: '^[a-zA-Z0-9]+$',
    message: 'Only letters and numbers allowed'
  }),
  numeric: (): ValidationRule => ({
    pattern: '^\\d+$',
    message: 'Only numbers allowed'
  }),
  strongPassword: (): ValidationRule => ({
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
    message: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
  }),
};

type RulePresetKey = keyof typeof RULE_PRESETS;

@customElement("validation-rules-display")
export class ValidationRulesDisplay extends BaseElementBlock {
  static override styles = [
    css`
      :host {
        display: block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        min-height: 0;
        flex-shrink: 0;
      }

      .validation-container {
        padding: 8px;
        width: 100%;
        box-sizing: border-box;
      }

      .section {
        margin-bottom: 12px;
      }

      .section-title {
        font-size: 10px;
        font-weight: 600;
        color: var(--nuraly-text-secondary, #888);
        text-transform: uppercase;
        margin-bottom: 8px;
        letter-spacing: 0.5px;
      }

      .preset-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      .preset-buttons nr-button {
        --nuraly-button-height: 24px;
        --nuraly-button-font-size: 10px;
        --nuraly-button-padding-horizontal: 8px;
        --nuraly-button-padding-small: 5px;
      }

      .rules-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
      }

      .rule-item {
        padding: 10px;
        background: var(--nuraly-bg-secondary, #f5f5f5);
        border-radius: 6px;
        border: 1px solid var(--nuraly-border, #e0e0e0);
      }

      .rule-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .rule-type-badge {
        font-size: 11px;
        font-weight: 600;
        color: var(--nuraly-primary, #4a9eff);
        background: var(--nuraly-primary-light, #e6f0ff);
        padding: 3px 8px;
        border-radius: 4px;
      }

      .rule-actions {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .warning-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 10px;
        color: var(--nuraly-text-tertiary, #888);
        cursor: pointer;
      }

      .warning-toggle input {
        width: 14px;
        height: 14px;
        cursor: pointer;
      }

      .delete-btn {
      }

      .rule-fields {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .rule-field {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .rule-field-label {
        font-size: 10px;
        color: var(--nuraly-text-tertiary, #888);
        min-width: 50px;
        text-transform: uppercase;
      }

      nr-input {
        flex: 1;
        --nuraly-spacing-input-height: 24px;
        --nuraly-font-size-input: 10px;
        --nuraly-font-size-input-placeholder: 10px;
        --nuraly-color-input-background: var(--validation-input-bg, white);
        --nuraly-color-input-inner-background: var(--validation-input-bg, white);
      }

      nr-input.small {
        width: 70px;
        flex: none;
      }

      nr-checkbox {
        --nuraly-checkbox-size: 14px;
      }

      .empty-state {
        text-align: center;
        padding: 16px;
        color: var(--nuraly-text-tertiary, #888);
        font-size: 11px;
        background: var(--nuraly-bg-secondary, #f5f5f5);
        border-radius: 4px;
        margin-bottom: 12px;
      }

      .divider {
        height: 1px;
        background: var(--nuraly-border, #e0e0e0);
        margin: 12px 0;
      }
    `,
  ];

  @property({ type: Object })
  component: ComponentElement;

  private emitRulesChange(rules: ValidationRule[]) {
    handleComponentEvent({
      isViewMode: true,
      component: this.component,
      item: this.item,
      eventName: "onChange",
      event: new CustomEvent('change'),
      data: { property: 'rules', type: 'array', value: rules },
    });

    // Optimistically update local state for immediate UI feedback
    if (this.inputHandlersValue?.value) {
      this.inputHandlersValue = {
        ...this.inputHandlersValue,
        value: { ...this.inputHandlersValue.value, rules }
      };
    } else {
      this.inputHandlersValue = { ...this.inputHandlersValue, rules };
    }
    this.requestUpdate();
  }

  private getRulesFromHandlers(): ValidationRule[] {
    const handlers = this.inputHandlersValue;
    if (handlers?.value?.rules) {
      return handlers.value.rules;
    }
    if (handlers?.rules) {
      return handlers.rules;
    }
    return [];
  }

  private addRule(presetKey: RulePresetKey) {
    const currentRules = this.getRulesFromHandlers();
    const presetFn = RULE_PRESETS[presetKey];
    const newRule = presetFn();
    this.emitRulesChange([...currentRules, newRule]);
  }

  private addCustomPattern() {
    const currentRules = this.getRulesFromHandlers();
    const newRule: ValidationRule = {
      name: 'custom',
      pattern: '',
      message: 'Invalid format'
    };
    this.emitRulesChange([...currentRules, newRule]);
  }

  private handleNameChange(index: number, name: string) {
    this.updateRule(index, { name });
  }

  private removeRule(index: number) {
    const currentRules = [...this.getRulesFromHandlers()];
    currentRules.splice(index, 1);
    this.emitRulesChange(currentRules);
  }

  private updateRule(index: number, updates: Partial<ValidationRule>) {
    const currentRules = [...this.getRulesFromHandlers()];
    currentRules[index] = { ...currentRules[index], ...updates };
    this.emitRulesChange(currentRules);
  }

  private getRuleType(rule: ValidationRule): string {
    // Use custom name if available
    if (rule.name) return rule.name;
    if (rule.required) return 'required';
    if (rule.type === 'email') return 'email';
    if (rule.type === 'url') return 'url';
    if (rule.minLength !== undefined) return 'minLength';
    if (rule.maxLength !== undefined) return 'maxLength';
    if (rule.min !== undefined) return 'min';
    if (rule.max !== undefined) return 'max';
    if (rule.pattern) return 'pattern';
    return 'custom';
  }

  private isCustomPatternRule(rule: ValidationRule): boolean {
    // A rule is a custom pattern if it has a name and pattern fields
    return rule.name !== undefined && rule.pattern !== undefined;
  }

  private getEditableValue(rule: ValidationRule): { key: string; value: any; type: 'number' | 'text' } | null {
    if (rule.minLength !== undefined) return { key: 'minLength', value: rule.minLength, type: 'number' };
    if (rule.maxLength !== undefined) return { key: 'maxLength', value: rule.maxLength, type: 'number' };
    if (rule.min !== undefined) return { key: 'min', value: rule.min, type: 'number' };
    if (rule.max !== undefined) return { key: 'max', value: rule.max, type: 'number' };
    if (rule.pattern !== undefined) return { key: 'pattern', value: rule.pattern, type: 'text' };
    return null;
  }

  private handleValueChange(index: number, key: string, value: string, type: 'number' | 'text') {
    const parsedValue = type === 'number' ? (value ? parseInt(value, 10) : 0) : value;
    this.updateRule(index, { [key]: parsedValue });
  }

  private handleMessageChange(index: number, message: string) {
    this.updateRule(index, { message });
  }

  private handleWarningToggle(index: number, warningOnly: boolean) {
    this.updateRule(index, { warningOnly });
  }

  private renderRuleItem(rule: ValidationRule, index: number) {
    const ruleType = this.getRuleType(rule);
    const editableValue = this.getEditableValue(rule);
    const isCustomPattern = this.isCustomPatternRule(rule);

    return html`
      <div class="rule-item">
        <div class="rule-header">
          <span class="rule-type-badge">${ruleType}</span>
          <div class="rule-actions">
            <label class="warning-toggle">
              <nr-checkbox
                size="small"
                .checked=${rule.warningOnly || false}
                @nr-change=${(e: CustomEvent) => this.handleWarningToggle(index, e.detail?.checked || false)}
              ></nr-checkbox>
              Warning only
            </label>
            <nr-button class="delete-btn" type="text" size="small" @click=${() => this.removeRule(index)}>×</nr-button>
          </div>
        </div>
        <div class="rule-fields">
          ${isCustomPattern ? html`
            <div class="rule-field">
              <span class="rule-field-label">Name</span>
              <nr-input
                size="small"
                .value=${rule.name || ''}
                placeholder="Rule name"
                @nr-input=${(e: CustomEvent) => this.handleNameChange(index, e.detail?.value || '')}
              ></nr-input>
            </div>
            <div class="rule-field">
              <span class="rule-field-label">Pattern</span>
              <nr-input
                size="small"
                .value=${rule.pattern || ''}
                placeholder="^[a-z]+$"
                @nr-input=${(e: CustomEvent) => this.handleValueChange(index, 'pattern', e.detail?.value || '', 'text')}
              ></nr-input>
            </div>
          ` : editableValue ? html`
            <div class="rule-field">
              <span class="rule-field-label">Value</span>
              <nr-input
                type=${editableValue.type}
                size="small"
                class=${editableValue.type === 'text' ? '' : 'small'}
                .value=${String(editableValue.value)}
                @nr-input=${(e: CustomEvent) => this.handleValueChange(index, editableValue.key, e.detail?.value || '', editableValue.type)}
              ></nr-input>
            </div>
          ` : nothing}
          <div class="rule-field">
            <span class="rule-field-label">Message</span>
            <nr-input
              size="small"
              .value=${rule.message || ''}
              placeholder="Validation message"
              @nr-input=${(e: CustomEvent) => this.handleMessageChange(index, e.detail?.value || '')}
            ></nr-input>
          </div>
        </div>
      </div>
    `;
  }

  override renderComponent() {
    const rules: ValidationRule[] = this.getRulesFromHandlers();

    return html`
      <div class="validation-container">
        <!-- Current Rules -->
        <div class="section">
          <div class="section-title">Validation Rules</div>
          ${rules.length > 0 ? html`
            <div class="rules-list">
              ${rules.map((rule, index) => this.renderRuleItem(rule, index))}
            </div>
          ` : html`
            <div class="empty-state">No validation rules configured</div>
          `}
        </div>

        <div class="divider"></div>

        <!-- Add Rules -->
        <div class="section">
          <div class="section-title">Add Rule</div>
          <div class="preset-buttons">
            <nr-button dashed size="small" @click=${() => this.addRule('required')}>+ required</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('email')}>+ email</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('url')}>+ url</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('phone')}>+ phone</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('minLength')}>+ minLength</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('maxLength')}>+ maxLength</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('min')}>+ min</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('max')}>+ max</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('alphanumeric')}>+ alphanumeric</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('numeric')}>+ numeric</nr-button>
            <nr-button dashed size="small" @click=${() => this.addRule('strongPassword')}>+ strongPassword</nr-button>
            <nr-button dashed size="small" @click=${() => this.addCustomPattern()}>+ custom pattern</nr-button>
          </div>
        </div>
      </div>
    `;
  }
}
