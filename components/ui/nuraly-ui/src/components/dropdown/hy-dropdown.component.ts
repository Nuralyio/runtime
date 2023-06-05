/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, html, css} from 'lit';
import {property} from 'lit/decorators.js';
import {ref, createRef, Ref} from 'lit/directives/ref.js';
import '../icon/icon.component';
export class HyDropdownComponent extends LitElement {
  static override styles = css`
    .dropdown {
      position: relative;
      display: inline-block;
      border: 1px solid #ccc;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .dropdown-content {
      display: none;
      position: absolute;
      min-width: 160px;
      z-index: 1;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background-color: #fff;
    }

    .dropdown-content ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .dropdown-content ul li {
      padding: 12px 16px;
      cursor: pointer;
    }

    .nested {
      display: none;
      position: absolute;
      left: 100%;
      width: 100%;
      top: 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .dropdown-content ul li:hover > .nested {
      display: block;
    }

    .dropdown-content.show {
      display: block;
      opacity: 1;
    }

    .selected {
      background-color: #ddd;
    }
    .has-childrens {
      color: #444444;
      margin-left: 6px;
      float: right;
    }
  `;

  @property({type: Array})
  options = [];

  @property({type: Object})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selected: any;

  @property({type: Boolean})
  open = false;

  override render() {
    return html`
      <div class="dropdown">
        <button class="dropbtn" @click="${this.toggleDropdown}">
          ${this.selected ? this.selected.label : 'Select an option'}
        </button>
        <div class="dropdown-content ${this.open ? 'show' : ''}">
          <ul>
            ${this.options.map((option) => this.renderOption(option))}
          </ul>
        </div>
      </div>
    `;
  }

  renderOption(option: any) {
    const inputRef: Ref<HTMLInputElement> = createRef();
    const parentRef: Ref<HTMLInputElement> = createRef();
    return html`
      <li
        ${ref(parentRef)}
        @click="${(e: any) => this.handleSelect(option, e)}"
        class=${option === this.selected ? 'selected' : ''}
        @mouseover="${() => {
          if (inputRef.value) {
            inputRef.value!.style.marginTop = parentRef.value?.offsetTop + 'px';
          }
        }}"
      >
        ${option.label}
        ${option.children
          ? html`
              <hy-icon name="caret-right" class="has-childrens"></hy-icon>
              <ul ${ref(inputRef)} class="nested">
                ${option.children.map((child: any) => this.renderOption(child))}
              </ul>
            `
          : ''}
      </li>
    `;
  }

  handleSelect(option: any, e: any) {
    if (e) e.stopPropagation();
    this.selected = option;
    this.open = false;
    const changeEvent = new CustomEvent('change', {
      detail: {value: this.selected},
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);
  }

  toggleDropdown() {
    this.open = !this.open;
  }
}

customElements.define('hy-dropdown', HyDropdownComponent);
