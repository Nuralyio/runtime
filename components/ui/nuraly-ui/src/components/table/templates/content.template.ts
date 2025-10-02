import { html, nothing, TemplateResult } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { choose } from 'lit/directives/choose.js';
import { IHeader, SelectionMode, SortAttribute, SortOrder } from '../table.types.js';

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
  globalCheckRef?: (el: HTMLInputElement | null) => void;
  onCheckAll: () => void;
  onCheckOne: (event: Event, index: number) => void;
  onSelectOne: (index: number) => void;
  onUpdateSort: (index: number) => void;
  onShowExpandedContent: (index: number) => void;
}

/**
 * Renders the table content template
 * @param data - Table content data and event handlers
 * @returns Template for table content
 */
export function renderContentTemplate(data: ContentTemplateData): TemplateResult {
  return html`
    <table>
      <tr>
        ${data.expandable || data.selectionMode
          ? html`<th>
              ${data.selectionMode === SelectionMode.Multiple
                ? html`<input 
                    id="global-check" 
                    type="checkbox" 
                    @change=${data.onCheckAll}
                  />`
                : nothing}
            </th>`
          : nothing}
        ${repeat(
          data.headers,
          (header: IHeader, index) =>
            html`
              ${data.expandable !== header.key
                ? html`<th @click=${() => data.onUpdateSort(index)}>
                    <span>
                      ${header.name}
                      ${index === data.sortAttribute.index
                        ? choose(data.sortAttribute.order, [
                            [SortOrder.Default, () => html`<nr-icon name="arrows-v"></nr-icon>`],
                            [SortOrder.Ascending, () => html`<nr-icon name="long-arrow-up"></nr-icon>`],
                            [SortOrder.Descending, () => html`<nr-icon name="long-arrow-down"></nr-icon>`],
                          ])
                        : html`<nr-icon name="arrows-v"></nr-icon>`}
                    </span>
                  </th>`
                : nothing}
            `
        )}
      </tr>
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
                        <input
                          type="checkbox"
                          @change=${(checkOneEvent: Event) => data.onCheckOne(checkOneEvent, index)}
                          .checked=${data.selectedItems[index + (data.currentPage - 1) * data.itemPerPage]}
                        />
                      </td>`,
                  ],
                  [
                    SelectionMode.Single,
                    () => html`<td>
                      <input
                        type="radio"
                        name="item"
                        @change=${() => data.onSelectOne(index)}
                        .checked=${data.selectedItems[index + (data.currentPage - 1) * data.itemPerPage]}
                      />
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
    </table>
  `;
}
