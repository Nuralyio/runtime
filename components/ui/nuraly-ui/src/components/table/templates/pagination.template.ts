import { html, nothing, TemplateResult } from 'lit';
import { Sizes } from '../table.types.js';

export interface PaginationTemplateData {
  numberOfItems: number;
  itemPerPage: number[];
  selectedItemPerPage: number;
  currentPage: number;
  size: Sizes;
  numberOfPages: number;
  fromItem: number;
  toItem: number;
  enableNext: boolean;
  enablePrevious: boolean;
  onItemPerPageChange: (event: CustomEvent) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

/**
 * Renders the pagination template for the table
 * @param data - Pagination data and event handlers
 * @returns Template for pagination UI
 */
export function renderPaginationTemplate(data: PaginationTemplateData): TemplateResult {
  const selectOptions = data.itemPerPage.map(item => ({
    label: String(item),
    value: String(item)
  }));

  return html`
    <div class="pagination-container" data-size="${data.size}">
      <div class="left-content">
        <span class="select-details">
          <label>Items per page:</label>
          <hy-select
            .options=${selectOptions}
            .value=${String(data.selectedItemPerPage)}
            size="small"
            @nr-change=${data.onItemPerPageChange}
          ></hy-select>
        </span>
        <span class="items-details">
          ${data.fromItem} - ${data.toItem} of ${data.numberOfItems} items
        </span>
      </div>

      <div class="right-content">
        <span class="page-details">
          ${data.currentPage} of ${data.numberOfPages} pages
        </span>
        <span class="icon-container">
          <nr-icon
            class="left-arrow"
            data-enabled=${data.enablePrevious}
            name="caret-left"
            @click=${data.enablePrevious ? data.onPreviousPage : nothing}
          ></nr-icon>

          <nr-icon
            class="right-arrow"
            data-enabled=${data.enableNext}
            name="caret-right"
            @click=${data.enableNext ? data.onNextPage : nothing}
          ></nr-icon>
        </span>
      </div>
    </div>
  `;
}
