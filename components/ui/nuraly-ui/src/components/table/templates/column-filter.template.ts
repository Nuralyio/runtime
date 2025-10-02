import { html, nothing, TemplateResult } from 'lit';
import { FilterType, ColumnFilter } from '../table.types.js';

export interface ColumnFilterTemplateData {
  columnKey: string;
  filterConfig: ColumnFilter;
  currentValue: string | number | undefined;
  isActive: boolean;
  onFilterChange: (value: string | number) => void;
  onClearFilter: () => void;
}

/**
 * Renders the column filter dropdown template
 * @param data - Column filter data and event handlers
 * @returns Template for column filter dropdown
 */
export function renderColumnFilterTemplate(data: ColumnFilterTemplateData): TemplateResult {
  const { filterConfig, currentValue, onFilterChange, onClearFilter } = data;

  return html`
    <div class="column-filter-dropdown">
      <div class="column-filter-content">
        ${filterConfig.type === FilterType.Select
          ? html`
              <nr-select
                .options=${filterConfig.options || []}
                .value=${currentValue || ''}
                placeholder=${filterConfig.placeholder || 'Filter...'}
                @nr-change=${(e: CustomEvent) => onFilterChange(e.detail.value)}
              ></nr-select>
            `
          : filterConfig.type === FilterType.Number
          ? html`
              <input
                type="number"
                class="column-filter-input"
                placeholder=${filterConfig.placeholder || 'Filter by number...'}
                .value=${currentValue || ''}
                @input=${(e: Event) => onFilterChange((e.target as HTMLInputElement).value)}
              />
            `
          : filterConfig.type === FilterType.Date
          ? html`
              <input
                type="date"
                class="column-filter-input"
                placeholder=${filterConfig.placeholder || 'Filter by date...'}
                .value=${currentValue || ''}
                @input=${(e: Event) => onFilterChange((e.target as HTMLInputElement).value)}
              />
            `
          : html`
              <input
                type="text"
                class="column-filter-input"
                placeholder=${filterConfig.placeholder || 'Filter...'}
                .value=${currentValue || ''}
                @input=${(e: Event) => onFilterChange((e.target as HTMLInputElement).value)}
              />
            `}
        
        ${currentValue
          ? html`
              <button class="column-filter-clear" @click=${onClearFilter}>
                <nr-icon name="times"></nr-icon>
              </button>
            `
          : nothing}
      </div>
    </div>
  `;
}

/**
 * Renders filter icon with active indicator
 * @param isActive - Whether the filter is active
 * @param hasFilter - Whether a filter value is set
 * @returns Template for filter icon
 */
export function renderFilterIcon(_isActive: boolean, hasFilter: boolean): TemplateResult {
  return html`
    <span class="filter-icon ${hasFilter ? 'has-filter' : ''}">
      <nr-icon name="filter"></nr-icon>
      ${hasFilter ? html`<span class="filter-indicator"></span>` : nothing}
    </span>
  `;
}
