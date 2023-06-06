/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, html, nothing} from 'lit';
import {property, queryAssignedElements, state} from 'lit/decorators.js';
import {ref, createRef, Ref} from 'lit/directives/ref.js';
import '../icon/icon.component';
import {EMPTY_STRING, NOTHING_STRING} from './hy-dropdown.constants';
import {styles} from './hy-dropdown.style';
export class HyDropdownComponent extends LitElement {
  static override styles = styles;

  @property({type: Array})
  options = [];

  @property({type: Object})
  selected: any;

  @property({type: Boolean})
  open = false;

  @property({type: String})
  placeholder = EMPTY_STRING;

  @property({type: String})
  handler = 'hover';

  @queryAssignedElements({slot: 'label', flatten: true})
  _prefixItems!: Array<HTMLElement>;
  @state()
  hasSlotLabel = false;

  override firstUpdated() {
    this.hasSlotLabel = !!this._prefixItems.length;
    this.performUpdate();
  }

  override render() {
    return html`
      <div class="dropdown">
        ${this.renderDropDownIntiator()} ${(this.open && this.renderDropdowContent()) || nothing}
      </div>
    `;
  }

  renderDropDownIntiator() {
    return html`
      <slot
        name="label"
        @click="${() => this.handler === 'click' && this.toggleDropdown()}"
        @mouseover="${() => this.handler === 'hover' && this.showDropdown()}"
      ></slot>
      ${(!this.hasSlotLabel &&
        html`<button
          class="dropbtn"
          @click="${() => this.handler === 'click' && this.toggleDropdown()}"
          @mouseover="${() => this.handler === 'hover' && this.showDropdown()}"
        >
          ${this.selected ? this.selected.label : this.placeholder}
        </button>`) ||
      nothing}
    `;
  }

  renderDropdowContent() {
    return html`
      <div class="dropdown-content show">
        <ul>
          ${this.options.map((option) => this.renderOption(option))}
        </ul>
      </div>
    `;
  }

  renderOption(option: any) {
    const childMenuRef: Ref<HTMLInputElement> = createRef();
    const parentRef: Ref<HTMLInputElement> = createRef();
    return html`
      <li
        ${ref(parentRef)}
        @click="${(e: any) => this.handleSelect(option, e)}"
        class=${option === this.selected ? 'selected' : NOTHING_STRING}
        @mouseover="${() => this.onItemMouseOver(parentRef, childMenuRef)}"
      >
        ${option.label}
        ${option.children
          ? html`
              <hy-icon name="caret-right" class="has-childrens"></hy-icon>
              <ul ${ref(childMenuRef)} class="nested">
                <div class="block">${option.children.map((child: any) => this.renderOption(child))}</div>
              </ul>
            `
          : ''}
      </li>
    `;
  }
  onItemMouseOver = (parentRef: Ref<HTMLInputElement>, childMenuRef: Ref<HTMLInputElement>): void => {
    if (childMenuRef.value) {
      childMenuRef.value!.style.marginTop = parentRef.value?.offsetTop + 'px';
    }
  };

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

  showDropdown() {
    this.open = true;
  }

  _onClickOutside(e: MouseEvent) {
    if (!e.composedPath().includes(this)) {
      this.open = false;
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onClickOutside.bind(this));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onClickOutside.bind(this));
  }
}

customElements.define('hy-dropdown', HyDropdownComponent);
