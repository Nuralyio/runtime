import {LitElement, PropertyValueMap, html, nothing} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {styles} from './table-content.style.js';
import {repeat} from 'lit/directives/repeat.js';
import {choose} from 'lit/directives/choose.js';

import {IHeader, SelectionMode, Sizes, SortAttribute, SortOrder} from '../table.types.js';

@customElement('hy-table-content')
export class HyTableContent extends LitElement {
  @property({type: Array}) headers!: [];
  @property({type: Array}) rows!: [];
  @property({type: Sizes, reflect: true}) size!: Sizes;
  @property({type: String}) expandable: string | undefined;
  @property() selectionMode: SelectionMode | undefined;
  @property() selectedItems: boolean[] = [];
  @property() currentPage!: number;
  @property() itemPerPage!: number;
  @property() sortAttribute!: SortAttribute;
  @state() expand: boolean[] = [];
  @query('#global-check')
  globalCheck!: HTMLInputElement;

  override willUpdate(changedProperties: Map<string, this>) {
    if (changedProperties.has('rows')) {
      this.expand = Array(this.rows.length).fill(false);
    }
  }
  override updated(_changedProperties: PropertyValueMap<this> | Map<PropertyKey, unknown>): void {
    if (this.globalCheck && _changedProperties.has('selectedItems')) {
      if (this.selectedItems.every((isSelected) => isSelected)) {
        this.globalCheck.checked = true;
        this.globalCheck.setAttribute('data-indeterminate', 'false');
      } else if (this.selectedItems.some((isSelected) => isSelected)) {
        this.globalCheck.checked = false;
        this.globalCheck.setAttribute('data-indeterminate', 'true');
      } else {
        this.globalCheck.checked = false;
        this.globalCheck.setAttribute('data-indeterminate', 'false');
      }
    }
  }

  _showExpandedContent(index: number) {
    this.expand[index] = !this.expand[index];
    this.requestUpdate();
  }

  _onCheckAll() {
    this.dispatchEvent(
      new CustomEvent('check-all', {
        detail: {isEveryItemChecked: this.selectedItems.every((isSelected) => isSelected)},
        composed: true,
        bubbles: true,
      })
    );
  }

  _onCheckOne(checkOneEvent: Event, index: number) {
    const checked = (checkOneEvent.target as HTMLInputElement).checked;
    this.dispatchEvent(new CustomEvent('check-one', {detail: {value: checked, index}, composed: true, bubbles: true}));
  }

  _onSelectOne(index: number) {
    this.dispatchEvent(new CustomEvent('select-one', {detail: {index}}));
  }

  _onUpdateSortOrder(index: number) {
    this.dispatchEvent(new CustomEvent('update-sort', {detail: {index}, bubbles: true, composed: true}));
  }

  override render() {
    return html` <table>
      <tr>
        ${this.expandable || this.selectionMode
          ? html`<th>
              ${this.selectionMode == SelectionMode.Multiple
                ? html`<input id="global-check" type="checkbox" @change=${this._onCheckAll} />`
                : nothing}
            </th>`
          : nothing}
        ${repeat(
          this.headers,
          (header: IHeader, index) =>
            html`
              ${this.expandable != header.key
                ? html`<th @click=${() => this._onUpdateSortOrder(index)}>
                    <span
                      >${header.name}${index == this.sortAttribute.index
                        ? choose(this.sortAttribute.order, [
                            [SortOrder.Default, () => html`<hy-icon name="arrows-v"></hy-icon>`],
                            [SortOrder.Ascending, () => html`<hy-icon name="long-arrow-up"></hy-icon>`],
                            [SortOrder.Descending, () => html`<hy-icon name="long-arrow-down"></hy-icon>`],
                          ])
                        : html`<hy-icon name="arrows-v"></hy-icon>`}
                    </span>
                  </th>`
                : nothing}
            `
        )}
      </tr>
      ${repeat(
        this.rows,
        (row, index) => html`
          <tr>
            ${
              this.expandable && !this.selectionMode
                ? html`
                    <td @click=${() => this._showExpandedContent(index)} class="expand-icon">
                      <hy-icon name="${this.expand[index] ? 'angle-up' : 'angle-down'}"></hy-icon>
                    </td>
                  `
                : this.selectionMode
                ? choose(this.selectionMode, [
                    [
                      SelectionMode.Multiple,
                      () =>
                        html`<td>
                          <input
                            type="checkbox"
                            @change=${(checkOneEvent: Event) => this._onCheckOne(checkOneEvent, index)}
                            .checked=${this.selectedItems[index + (this.currentPage - 1) * this.itemPerPage]}
                          />
                        </td> `,
                    ],
                    [
                      SelectionMode.Single,
                      () => html` <td>
                        <input
                          type="radio"
                          name="item"
                          @change=${() => this._onSelectOne(index)}
                          .checked=${this.selectedItems[index + (this.currentPage - 1) * this.itemPerPage]}
                        />
                      </td>`,
                    ],
                  ])
                : nothing
            }
            ${repeat(
              this.headers,
              (header: IHeader) =>
                html` ${this.expandable != header.key ? html`<td>${row[header.key]}</td>` : nothing} `
            )}

            <tr style="display:${this.expand[index] ? 'table-row' : 'none'};">
            <td colspan=${this.headers.length}> ${this.expandable}: ${row[this.expandable!]}</td>
            </tr>
          </tr>
        `
      )}
    </table>`;
  }

  static override styles = styles;
}
