/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, html} from 'lit';
import {property, state} from 'lit/decorators.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {styles} from './select.style.js';
import {EMPTY_STRING} from './select.constant.js';

export class HySelectComponent extends LitElement {
  static override styles = styles;

  @property({type: Array})
  options = [];

  @property({type: Object})
  selected: any;

  @property({type: String})
  placeholder = 'Select an option';

  @property({type: String})
  search = EMPTY_STRING;

  @state()
  searchedElement: any;

  @state()
  filteredOptions = {};

  constructor() {
    super();
  }
  valueChangeHandler(_e: any) {
    this.searchedElement = _e.detail.value;
    this.filteredOption();
  }

  filteredOption() {
    if (!this.searchedElement) {
      return this.options;
    }

    const lowercaseSearchedElement = this.searchedElement.toLowerCase();

    return this.options
      ?.map((option: any) => {
        const {label} = option;
        if (label && label.toLowerCase().includes(lowercaseSearchedElement)) {
          const startIndex = label.toLowerCase().indexOf(lowercaseSearchedElement);
          const endIndex = startIndex + lowercaseSearchedElement.length;
          const highlightedLabel =
            label.substring(0, startIndex) +
            `<strong>${label.substring(startIndex, endIndex)}</strong>` +
            label.substring(endIndex);
          return {...option, label: html`${unsafeHTML(highlightedLabel)}`};
        }
        return undefined;
      })
      .filter((option) => option);
  }

  elementSelected(e: any) {
    this.selected = e.detail.value;
  }

  protected override render(): unknown {
    return html`
      <hy-dropdown .search=${this.searchedElement} .options=${this.options} @change="${this.elementSelected}">
        <hy-input
          @valueChange=${this.valueChangeHandler}
          readonly="readonly"
          slot="label"
          placeholder=${this.placeholder}
          value=${this.selected?.label}
        ></hy-input>
      </hy-dropdown>
    `;
  }
}

customElements.define('hy-select', HySelectComponent);
