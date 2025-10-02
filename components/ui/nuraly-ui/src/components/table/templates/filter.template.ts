import { html, nothing, TemplateResult } from 'lit';

export interface FilterTemplateData {
  showInput: boolean;
  value: string;
  onToggleInput: () => void;
  onChange: (event: Event) => void;
}

/**
 * Renders the filter/search template for the table
 * @param data - Filter data and event handlers
 * @returns Template for search filter
 */
export function renderFilterTemplate(data: FilterTemplateData): TemplateResult {
  return html`
    <div class="filter-container">
      ${data.showInput
        ? html`
            <nr-icon name="search" class="search-icon"></nr-icon>
            <input
              type="text"
              placeholder="search"
              @blur=${!data.value.trim() ? data.onToggleInput : nothing}
              @input=${data.onChange}
            />
          `
        : html`
            <div class="icon-container" @click=${data.onToggleInput}>
              <nr-icon name="search"></nr-icon>
            </div>
          `}
    </div>
  `;
}
