/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html } from 'lit';
import { property, state, customElement } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { styles } from './select.style.js';
import { EMPTY_STRING } from './select.constant.js';

@customElement('hy-select')
export class HySelectComponent extends LitElement {
  static override styles = styles;

  @property({ type: Boolean })
  editable = false;
  @property({ type: Array })
  options = [];

  @property({ type: Object })
  selected: any;

  @property({ type: String })
  placeholder = 'Select an option';

  @property({ type: String })
  search = EMPTY_STRING;

  @state()
  searchedElement: any;

  @state()
  filteredOptions = {};

  @property({ type: Boolean })
  hasInner = false;

  @property({ type: Array })
  selectedElements: any[] = []; // For multiple select

  @property({ type: String }) // Add a property to specify selection mode
  selectionMode: 'single' | 'multiple' = 'single';

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
        const { label } = option;
        if (label && label.toLowerCase().includes(lowercaseSearchedElement)) {
          const startIndex = label.toLowerCase().indexOf(lowercaseSearchedElement);
          const endIndex = startIndex + lowercaseSearchedElement.length;
          const highlightedLabel =
            label.substring(0, startIndex) +
            `<strong>${label.substring(startIndex, endIndex)}</strong>` +
            label.substring(endIndex);
          return { ...option, label: html`${unsafeHTML(highlightedLabel)}` };
        }
        return undefined;
      })
      .filter((option) => option);
  }

  elementSelected(e: any) {
    const selectedValue = e.detail.value;

    if (this.selectionMode === 'single') {
      this.selectedElements = [];
      this.selected = selectedValue;
      this.dispatchEvent(new CustomEvent('changed', { detail: { value: this.selected } }));

    } else if (this.selectionMode === 'multiple') {
      const isValueInArray = this.selectedElements.some((item) =>
        this.isEqual(item, selectedValue)
      );

      if (isValueInArray) {
        this.selectedElements = this.selectedElements.filter(
          (item) => !this.isEqual(item, selectedValue)
        );
      } else {
        this.selectedElements.push(selectedValue);
      }
    this.dispatchEvent(new CustomEvent('changed', { detail: { value: this.selectedElements } }));

    }

  }

  isEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }

  override firstUpdated() {
    this.hasInner = this.innerHTML.trim().length > 0;
  }

  protected override render(): unknown {
    return html`
      <hy-dropdown
        .search=${this.searchedElement}
        .selectedElements=${this.selectedElements}
        .options=${this.options}
        .keepOpen=${this.selectionMode === 'multiple'}
        @change="${this.elementSelected}"
      >
        ${this.hasInner
          ? html`<span slot="label"><slot></slot> </span>`
          : this.editable
          ? html`
              <hy-input
                @valueChange=${this.valueChangeHandler}
                readonly="readonly"
                slot="label"
                placeholder=${this.placeholder}
                value=${this.selected?.label}
              ></hy-input>
            `
          : html`<hy-button slot="label" type="primary">${this.selected?.label ?? this.placeholder}</hy-button>`}
      </hy-dropdown>
    `;
  }
}
