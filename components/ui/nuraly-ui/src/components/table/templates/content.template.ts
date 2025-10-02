import { html, nothing, TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { choose } from 'lit/directives/choose.js';
import { IHeader, SelectionMode, SortAttribute, SortOrder } from '../table.types.js';
import { renderColumnFilterTemplate, renderFilterIcon } from './column-filter.template.js';

export interface ContentTemplateData {
  headers: IHeader[];
  rows: any[];
  expandable: string | undefined;
  selectionMode: SelectionMode | undefined;
  selectedItems: boolean[];
  currentPage: number;
  itemPerPage: number;
  sortAttribute: SortAttribute;
  expand: boolean[];
  columnFilters: Map<string, string | number>;
  activeFilterColumn: string | null;
  globalCheckRef?: (el: HTMLInputElement | null) => void;
  onCheckAll: () => void;
  onCheckOne: (event: Event, index: number) => void;
  onSelectOne: (index: number) => void;
  onUpdateSort: (index: number) => void;
  onShowExpandedContent: (index: number) => void;
  onToggleColumnFilter: (columnKey: string) => void;
  onApplyColumnFilter: (columnKey: string, value: string | number) => void;
  onClearColumnFilter: (columnKey: string) => void;
}

/**
 * Renders the table content template
 * @param data - Table content data and event handlers
 * @returns Template for table content
 */
export function renderContentTemplate(data: ContentTemplateData): TemplateResult {
  return html`
    <table>
      <thead>
        <tr>
          ${data.expandable || data.selectionMode
            ? html`<th>
                ${data.selectionMode === SelectionMode.Multiple
                  ? html`<nr-checkbox 
                      id="global-check"
                      @nr-change=${data.onCheckAll}
                    ></nr-checkbox>`
                  : nothing}
              </th>`
            : nothing}
          ${repeat(
            data.headers,
            (header: IHeader, index) =>
              html`
                ${data.expandable !== header.key
                  ? html`<th class="${header.filterable ? 'filterable' : ''}">
                      <div class="th-content">
                        <span class="th-text" @click=${() => data.onUpdateSort(index)}>
                          ${header.name}
                          ${index === data.sortAttribute.index
                            ? choose(data.sortAttribute.order, [
                                [SortOrder.Default, () => html`<nr-icon name="arrows-v"></nr-icon>`],
                                [SortOrder.Ascending, () => html`<nr-icon name="long-arrow-up"></nr-icon>`],
                                [SortOrder.Descending, () => html`<nr-icon name="long-arrow-down"></nr-icon>`],
                              ])
                            : html`<nr-icon name="arrows-v"></nr-icon>`}
                        </span>
                        ${header.filterable && header.filterConfig
                          ? html`
                              <div class="filter-wrapper">
                                <button 
                                  class="filter-trigger"
                                  @click=${(e: Event) => {
                                    e.stopPropagation();
                                    data.onToggleColumnFilter(header.key);
                                  }}
                                >
                                  ${renderFilterIcon(
                                    data.activeFilterColumn === header.key,
                                    data.columnFilters.has(header.key)
                                  )}
                                </button>
                                ${data.activeFilterColumn === header.key
                                  ? renderColumnFilterTemplate({
                                      columnKey: header.key,
                                      filterConfig: header.filterConfig,
                                      currentValue: data.columnFilters.get(header.key),
                                      isActive: true,
                                      onFilterChange: (value) => data.onApplyColumnFilter(header.key, value),
                                      onClearFilter: () => data.onClearColumnFilter(header.key),
                                    })
                                  : nothing}
                              </div>
                            `
                          : nothing}
                      </div>
                    </th>`
                  : nothing}
              `
          )}
        </tr>
      </thead>
      <tbody>
        ${repeat(
          data.rows,
          (row, index) => html`
            <tr>
            ${data.expandable && !data.selectionMode
              ? html`
                  <td @click=${() => data.onShowExpandedContent(index)} class="expand-icon">
                    <nr-icon name="${data.expand[index] ? 'angle-up' : 'angle-down'}"></nr-icon>
                  </td>
                `
              : data.selectionMode
              ? choose(data.selectionMode, [
                  [
                    SelectionMode.Multiple,
                    () =>
                      html`<td>
                        <nr-checkbox
                          @nr-change=${(checkOneEvent: Event) => data.onCheckOne(checkOneEvent, index)}
                          .checked=${data.selectedItems[index + (data.currentPage - 1) * data.itemPerPage]}
                        ></nr-checkbox>
                      </td>`,
                  ],
                  [
                    SelectionMode.Single,
                    () => html`<td>
                      <nr-radio
                        name="table-row-selection"
                        value="${index}"
                        @nr-change=${() => data.onSelectOne(index)}
                        .checked=${data.selectedItems[index + (data.currentPage - 1) * data.itemPerPage]}
                      ></nr-radio>
                    </td>`,
                  ],
                ])
              : nothing}
            ${repeat(
              data.headers,
              (header: IHeader) =>
                html`${data.expandable !== header.key ? html`<td>${row[header.key]}</td>` : nothing}`
            )}

            <tr style="display:${data.expand[index] ? 'table-row' : 'none'};">
              <td colspan=${data.headers.length}>${data.expandable}: ${row[data.expandable!]}</td>
            </tr>
          </tr>
        `
        )}
      </tbody>
    </table>
  `;
}
