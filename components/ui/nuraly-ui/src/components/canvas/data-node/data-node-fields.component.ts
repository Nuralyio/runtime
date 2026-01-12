/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { LitElement, html, nothing, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { map } from 'lit/directives/map.js';
import { classMap } from 'lit/directives/class-map.js';
import { dataNodeFieldStyles } from './data-node-fields.style.js';
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import {
  FilterCondition,
  FilterGroup,
  FilterOperator,
  FILTER_OPERATORS,
  SortOrder,
  FieldMapping,
  DataSource,
  DataEntity,
  DataField,
  DataOperation,
  DATA_OPERATIONS,
} from './data-node.types.js';

/**
 * Expression Input Component
 * Text input with ${...} syntax highlighting support
 */
@customElement('nr-expression-input')
export class ExpressionInputComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-input'];

  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = '';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  multiline = false;

  @property({ type: String })
  label = '';

  private handleInput(e: CustomEvent) {
    this.value = e.detail.value;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    return html`
      <div class="expression-input">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        ${this.multiline
          ? html`
            <nr-textarea
              .value=${this.value}
              placeholder=${this.placeholder}
              ?disabled=${this.disabled}
              @nr-input=${this.handleInput}
              rows="3"
            ></nr-textarea>
          `
          : html`
            <nr-input
              .value=${this.value}
              placeholder=${this.placeholder}
              ?disabled=${this.disabled}
              @nr-input=${this.handleInput}
            ></nr-input>
          `
        }
      </div>
    `;
  }
}

/**
 * Variable Name Input Component
 * Input for variable names with prefix display
 */
@customElement('nr-variable-name-input')
export class VariableNameInputComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-input'];

  @property({ type: String })
  value = '';

  @property({ type: String })
  placeholder = 'variableName';

  @property({ type: String })
  prefix = '';

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  private handleInput(e: CustomEvent) {
    // Only allow valid variable names (alphanumeric and underscore)
    const sanitized = e.detail.value.replace(/[^a-zA-Z0-9_]/g, '');
    this.value = sanitized;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <div class="variable-name-input">
          ${this.prefix ? html`<span class="variable-name-prefix">${this.prefix}</span>` : nothing}
          <nr-input
            .value=${this.value}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            @nr-input=${this.handleInput}
          ></nr-input>
        </div>
        ${this.description ? html`<span class="field-description">${this.description}</span>` : nothing}
      </div>
    `;
  }
}

/**
 * Operation Select Component
 * Dropdown for selecting data operations with icons
 */
@customElement('nr-operation-select')
export class OperationSelectComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-select'];

  @property({ type: String })
  value: DataOperation = DataOperation.QUERY;

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  private handleChange(e: CustomEvent) {
    this.value = e.detail.value as DataOperation;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    const options = DATA_OPERATIONS.map(op => ({
      value: op.value,
      label: op.label,
      description: op.description,
      icon: op.icon,
    }));

    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <nr-select
          .value=${this.value}
          .options=${options}
          ?disabled=${this.disabled}
          @nr-change=${this.handleChange}
        ></nr-select>
      </div>
    `;
  }
}

/**
 * DataSource Select Component
 * Dropdown for selecting configured data sources
 */
@customElement('nr-datasource-select')
export class DataSourceSelectComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-select'];

  @property({ type: String })
  value: string | null = null;

  @property({ type: Array })
  dataSources: DataSource[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  placeholder = 'Select data source...';

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  private handleChange(e: CustomEvent) {
    this.value = e.detail.value || null;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    const options = this.dataSources.map(ds => ({
      value: ds.id,
      label: ds.name,
      description: ds.type,
      icon: ds.icon || 'database',
    }));

    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <nr-select
          .value=${this.value || ''}
          .options=${options}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          @nr-change=${this.handleChange}
        ></nr-select>
        ${this.description ? html`<span class="field-description">${this.description}</span>` : nothing}
      </div>
    `;
  }
}

/**
 * Entity Select Component
 * Dropdown for selecting tables/collections from a data source
 */
@customElement('nr-entity-select')
export class EntitySelectComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-select'];

  @property({ type: String })
  value: string | null = null;

  @property({ type: Array })
  entities: DataEntity[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: Boolean })
  loading = false;

  @property({ type: String })
  placeholder = 'Select table/collection...';

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  private handleChange(e: CustomEvent) {
    this.value = e.detail.value || null;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    const options = this.entities.map(entity => ({
      value: entity.id,
      label: entity.schema ? `${entity.schema}.${entity.name}` : entity.name,
      description: entity.type,
      icon: entity.type === 'collection' ? 'folder' : 'table',
    }));

    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <nr-select
          .value=${this.value || ''}
          .options=${options}
          placeholder=${this.loading ? 'Loading...' : this.placeholder}
          ?disabled=${this.disabled || this.loading}
          searchable
          @nr-change=${this.handleChange}
        ></nr-select>
        ${this.description ? html`<span class="field-description">${this.description}</span>` : nothing}
      </div>
    `;
  }
}

/**
 * Field Select Component
 * Dropdown for selecting a single field/column
 */
@customElement('nr-field-select')
export class FieldSelectComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-select'];

  @property({ type: String })
  value: string | null = null;

  @property({ type: Array })
  fields: DataField[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  placeholder = 'Select field...';

  private handleChange(e: CustomEvent) {
    this.value = e.detail.value || null;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    const options = this.fields.map(field => ({
      value: field.name,
      label: field.name,
      description: field.type,
    }));

    return html`
      <nr-select
        .value=${this.value || ''}
        .options=${options}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        size="small"
        @nr-change=${this.handleChange}
      ></nr-select>
    `;
  }
}

/**
 * Field Multi-Select Component
 * Multi-select for choosing multiple fields
 */
@customElement('nr-field-multi-select')
export class FieldMultiSelectComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-select'];

  @property({ type: Array })
  value: string[] = [];

  @property({ type: Array })
  fields: DataField[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  placeholder = 'All fields';

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  private handleChange(e: CustomEvent) {
    this.value = Array.isArray(e.detail.value) ? e.detail.value : [e.detail.value].filter(Boolean);
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  override render() {
    const options = this.fields.map(field => ({
      value: field.name,
      label: field.name,
      description: field.type,
    }));

    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <nr-select
          .value=${this.value}
          .options=${options}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          multiple
          searchable
          clearable
          @nr-change=${this.handleChange}
        ></nr-select>
        ${this.description ? html`<span class="field-description">${this.description}</span>` : nothing}
      </div>
    `;
  }
}

/**
 * Filter Builder Component
 * Visual AND/OR filter tree builder
 */
@customElement('nr-filter-builder')
export class FilterBuilderComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-select', 'nr-input', 'nr-icon'];

  @property({ type: Object })
  value: FilterGroup | null = null;

  @property({ type: Array })
  fields: DataField[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  @property({ type: Boolean })
  allowExpressions = true;

  private getEmptyGroup(logic: 'and' | 'or' = 'and'): FilterGroup {
    return { [logic]: [] };
  }

  private getEmptyCondition(): FilterCondition {
    return { field: '', op: FilterOperator.EQUALS, value: '' };
  }

  private updateValue(newValue: FilterGroup | null) {
    this.value = newValue;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  private toggleLogic(group: FilterGroup): FilterGroup {
    if (group.and) {
      return { or: group.and };
    } else if (group.or) {
      return { and: group.or };
    }
    return group;
  }

  private addCondition() {
    if (!this.value) {
      this.updateValue({ and: [this.getEmptyCondition()] });
    } else {
      const logic = this.value.and ? 'and' : 'or';
      const conditions = this.value[logic] || [];
      this.updateValue({
        [logic]: [...conditions, this.getEmptyCondition()],
      } as FilterGroup);
    }
  }

  private addGroup() {
    if (!this.value) {
      this.updateValue({ and: [this.getEmptyGroup('and')] });
    } else {
      const logic = this.value.and ? 'and' : 'or';
      const conditions = this.value[logic] || [];
      this.updateValue({
        [logic]: [...conditions, this.getEmptyGroup('and')],
      } as FilterGroup);
    }
  }

  private removeCondition(index: number) {
    if (!this.value) return;
    const logic = this.value.and ? 'and' : 'or';
    const conditions = this.value[logic] || [];
    const newConditions = conditions.filter((_, i) => i !== index);

    if (newConditions.length === 0) {
      this.updateValue(null);
    } else {
      this.updateValue({ [logic]: newConditions } as FilterGroup);
    }
  }

  private updateCondition(index: number, updates: Partial<FilterCondition>) {
    if (!this.value) return;
    const logic = this.value.and ? 'and' : 'or';
    const conditions = [...(this.value[logic] || [])];
    conditions[index] = { ...conditions[index] as FilterCondition, ...updates };
    this.updateValue({ [logic]: conditions } as FilterGroup);
  }

  private renderCondition(condition: FilterCondition, index: number): TemplateResult {
    const operator = FILTER_OPERATORS.find(op => op.value === condition.op);
    const needsValue = operator?.requiresValue !== false;

    const fieldOptions = this.fields.map(field => ({
      value: field.name,
      label: field.name,
    }));

    const operatorOptions = FILTER_OPERATORS.map(op => ({
      value: op.value,
      label: op.label,
    }));

    return html`
      <div class="filter-condition">
        <nr-select
          .value=${condition.field}
          .options=${fieldOptions}
          placeholder="Select field..."
          ?disabled=${this.disabled}
          size="small"
          @nr-change=${(e: CustomEvent) => this.updateCondition(index, { field: e.detail.value })}
        ></nr-select>
        <nr-select
          .value=${condition.op}
          .options=${operatorOptions}
          ?disabled=${this.disabled}
          size="small"
          @nr-change=${(e: CustomEvent) => this.updateCondition(index, { op: e.detail.value as FilterOperator })}
        ></nr-select>
        ${needsValue ? html`
          <nr-input
            .value=${String(condition.value || '')}
            placeholder=${this.allowExpressions ? 'Value or ${expression}' : 'Value'}
            ?disabled=${this.disabled}
            size="small"
            @nr-input=${(e: CustomEvent) => this.updateCondition(index, { value: e.detail.value })}
          ></nr-input>
        ` : html`<div></div>`}
        <button
          class="filter-remove-btn"
          ?disabled=${this.disabled}
          @click=${() => this.removeCondition(index)}
        >
          <nr-icon name="x" size="small"></nr-icon>
        </button>
      </div>
    `;
  }

  private renderGroup(group: FilterGroup): TemplateResult {
    const logic = group.and ? 'and' : 'or';
    const conditions = group[logic] || [];

    return html`
      <div class="filter-group">
        <div class="filter-group-header">
          <div class="filter-group-logic">
            <button
              class=${classMap({ active: logic === 'and' })}
              ?disabled=${this.disabled}
              @click=${() => this.updateValue(this.toggleLogic(group))}
            >AND</button>
            <button
              class=${classMap({ active: logic === 'or' })}
              ?disabled=${this.disabled}
              @click=${() => this.updateValue(this.toggleLogic(group))}
            >OR</button>
          </div>
        </div>
        <div class="filter-conditions">
          ${map(conditions, (item, index) => {
            if ('and' in item || 'or' in item) {
              return this.renderGroup(item as FilterGroup);
            }
            return this.renderCondition(item as FilterCondition, index);
          })}
        </div>
        <div class="filter-actions">
          <button class="filter-add-btn" ?disabled=${this.disabled} @click=${() => this.addCondition()}>
            <nr-icon name="plus" size="small"></nr-icon>
            Add condition
          </button>
          <button class="filter-add-btn" ?disabled=${this.disabled} @click=${() => this.addGroup()}>
            <nr-icon name="folder-plus" size="small"></nr-icon>
            Add group
          </button>
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <div class="filter-builder">
          ${this.value
            ? this.renderGroup(this.value)
            : html`
              <div class="empty-state">
                <nr-icon name="filter" size="large"></nr-icon>
                <span class="empty-state-text">No filter conditions</span>
                <button class="filter-add-btn" ?disabled=${this.disabled} @click=${() => this.addCondition()}>
                  <nr-icon name="plus" size="small"></nr-icon>
                  Add condition
                </button>
              </div>
            `
          }
        </div>
        ${this.description ? html`<span class="field-description">${this.description}</span>` : nothing}
      </div>
    `;
  }
}

/**
 * Field Mapper Component
 * Key-value mapper with expression support
 */
@customElement('nr-field-mapper')
export class FieldMapperComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-select', 'nr-input', 'nr-icon'];

  @property({ type: Object })
  value: FieldMapping = {};

  @property({ type: Array })
  fields: DataField[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  @property({ type: String })
  description = '';

  @property({ type: Boolean })
  allowExpressions = true;

  private updateValue(newValue: FieldMapping) {
    this.value = newValue;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  private addMapping() {
    const usedFields = Object.keys(this.value);
    const availableField = this.fields.find(f => !usedFields.includes(f.name));
    if (availableField) {
      this.updateValue({ ...this.value, [availableField.name]: '' });
    }
  }

  private removeMapping(fieldName: string) {
    const newValue = { ...this.value };
    delete newValue[fieldName];
    this.updateValue(newValue);
  }

  private updateMapping(oldKey: string, newKey: string, newVal: string | number | boolean | null) {
    const newValue = { ...this.value };
    if (oldKey !== newKey) {
      delete newValue[oldKey];
    }
    newValue[newKey] = newVal;
    this.updateValue(newValue);
  }

  override render() {
    const mappings = Object.entries(this.value);
    const fieldOptions = this.fields.map(f => ({
      value: f.name,
      label: f.name,
    }));

    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <div class="field-mapper">
          <div class="field-mapper-header">
            <span>Field</span>
            <span>Value</span>
            <span></span>
          </div>
          ${mappings.length === 0
            ? html`
              <div class="empty-state">
                <nr-icon name="table" size="large"></nr-icon>
                <span class="empty-state-text">No field mappings</span>
              </div>
            `
            : map(mappings, ([field, val]) => html`
              <div class="field-mapper-row">
                <nr-select
                  .value=${field}
                  .options=${fieldOptions}
                  ?disabled=${this.disabled}
                  size="small"
                  @nr-change=${(e: CustomEvent) => this.updateMapping(field, e.detail.value, val)}
                ></nr-select>
                <nr-input
                  .value=${String(val || '')}
                  placeholder=${this.allowExpressions ? 'Value or ${expression}' : 'Value'}
                  ?disabled=${this.disabled}
                  size="small"
                  @nr-input=${(e: CustomEvent) => this.updateMapping(field, field, e.detail.value)}
                ></nr-input>
                <button
                  class="filter-remove-btn"
                  ?disabled=${this.disabled}
                  @click=${() => this.removeMapping(field)}
                >
                  <nr-icon name="x" size="small"></nr-icon>
                </button>
              </div>
            `)
          }
          <button class="filter-add-btn" ?disabled=${this.disabled} @click=${() => this.addMapping()}>
            <nr-icon name="plus" size="small"></nr-icon>
            Add field mapping
          </button>
        </div>
        ${this.description ? html`<span class="field-description">${this.description}</span>` : nothing}
      </div>
    `;
  }
}

/**
 * Sort Builder Component
 * Sortable list of field + direction
 */
@customElement('nr-sort-builder')
export class SortBuilderComponent extends NuralyUIBaseMixin(LitElement) {
  static override styles = dataNodeFieldStyles;

  override requiredComponents = ['nr-select', 'nr-icon'];

  @property({ type: Array })
  value: SortOrder[] = [];

  @property({ type: Array })
  fields: DataField[] = [];

  @property({ type: Boolean })
  disabled = false;

  @property({ type: String })
  label = '';

  private updateValue(newValue: SortOrder[]) {
    this.value = newValue;
    this.dispatchEvent(new CustomEvent('value-change', {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  private addSort() {
    const usedFields = this.value.map(s => s.field);
    const availableField = this.fields.find(f => !usedFields.includes(f.name));
    if (availableField) {
      this.updateValue([...this.value, { field: availableField.name, dir: 'ASC' }]);
    }
  }

  private removeSort(index: number) {
    this.updateValue(this.value.filter((_, i) => i !== index));
  }

  private updateSort(index: number, updates: Partial<SortOrder>) {
    const newValue = [...this.value];
    newValue[index] = { ...newValue[index], ...updates };
    this.updateValue(newValue);
  }

  private toggleDirection(index: number) {
    const current = this.value[index].dir;
    this.updateSort(index, { dir: current === 'ASC' ? 'DESC' : 'ASC' });
  }

  override render() {
    const fieldOptions = this.fields.map(f => ({
      value: f.name,
      label: f.name,
    }));

    return html`
      <div class="field-container">
        ${this.label ? html`<label class="field-label">${this.label}</label>` : nothing}
        <div class="sort-builder">
          ${this.value.length === 0
            ? html`
              <div class="empty-state">
                <nr-icon name="arrow-up-down" size="large"></nr-icon>
                <span class="empty-state-text">No sorting defined</span>
              </div>
            `
            : map(this.value, (sort, index) => html`
              <div class="sort-item">
                <nr-select
                  .value=${sort.field}
                  .options=${fieldOptions}
                  ?disabled=${this.disabled}
                  size="small"
                  @nr-change=${(e: CustomEvent) => this.updateSort(index, { field: e.detail.value })}
                ></nr-select>
                <button
                  class="sort-direction-btn ${sort.dir.toLowerCase()}"
                  ?disabled=${this.disabled}
                  @click=${() => this.toggleDirection(index)}
                  title=${sort.dir === 'ASC' ? 'Ascending' : 'Descending'}
                >
                  <nr-icon name=${sort.dir === 'ASC' ? 'arrow-up' : 'arrow-down'} size="small"></nr-icon>
                </button>
                <button
                  class="filter-remove-btn"
                  ?disabled=${this.disabled}
                  @click=${() => this.removeSort(index)}
                >
                  <nr-icon name="x" size="small"></nr-icon>
                </button>
              </div>
            `)
          }
          <button class="filter-add-btn" ?disabled=${this.disabled} @click=${() => this.addSort()}>
            <nr-icon name="plus" size="small"></nr-icon>
            Add sort
          </button>
        </div>
      </div>
    `;
  }
}

// Export all components
export {
  ExpressionInputComponent,
  VariableNameInputComponent,
  OperationSelectComponent,
  DataSourceSelectComponent,
  EntitySelectComponent,
  FieldSelectComponent,
  FieldMultiSelectComponent,
  FilterBuilderComponent,
  FieldMapperComponent,
  SortBuilderComponent,
};
