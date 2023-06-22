/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, html, nothing, PropertyValueMap} from 'lit';
import {property, queryAssignedElements, state} from 'lit/decorators.js';
import {ref, createRef, Ref} from 'lit/directives/ref.js';
import {EMPTY_STRING, NOTHING_STRING, OPTION_TYPES, TRIGGERS} from './hy-dropdown.constants';
import {styles} from './hy-dropdown.style';
import {classMap} from 'lit/directives/class-map.js';
import {childrensArrow} from './templates/has-children-arrow.template';
import {styleMap} from 'lit/directives/style-map.js';

export class HyDropdownComponent extends LitElement {
  static override styles = styles;

  @property({type: Array})
  options = [];

  @property({type: Object})
  selected: any;

  @property({type: Boolean})
  open = false;

  @property({type: String})
  template = EMPTY_STRING;

  @property({type: String})
  placeholder = EMPTY_STRING;

  @property({type: String})
  search = EMPTY_STRING;

  @property({type: Object})
  customStyles = {};

  @property({type: String})
  trigger = 'click';

  @state()
  positioningStyle = EMPTY_STRING;

  @state()
  boundery = {
    right: false,
  };

  @state()
  searchedELement: any;

  @state()
  private showChildrenMap = new Map<any, boolean>(); // Map to store showChildren values
  private selectedElementMap = new Map<any, boolean>(); // Map to store showChildren values

  @queryAssignedElements({slot: 'label', flatten: true})
  _prefixItems!: Array<HTMLElement>;
  @state()
  hasSlotLabel = false;

  dropdownContentRef: Ref<HTMLInputElement> = createRef();
  dropdownInitiatorRef: Ref<HTMLInputElement> = createRef();

  constructor() {
    super();
    this.addEventListener('contextmenu', this.handleContextMenu);
  }

  handleContextMenu(event: MouseEvent) {
    const shouldOpenOnContextMenu = this.trigger === TRIGGERS.ContextMenu;

    if (shouldOpenOnContextMenu) {
      event.preventDefault();
      this.open = true;
      setTimeout(() => {
        const positionedElement: HTMLElement | null = this.shadowRoot!.querySelector('.dropdown-content');
        if (positionedElement !== null) {
          positionedElement.style.left = `${event.clientX}px`;
          positionedElement.style.top = `${event.clientY}px`;
          positionedElement.style.position = 'fixed';
        }
        this.requestUpdate();
      });
    }
  }

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
  getRandomId() {
    const randomString = Math.random().toString(36).substr(2, 9);
    return `id-${randomString}`;
  }

  renderDropDownIntiator() {
    const hasLabelSlot = this.hasSlotLabel;
    const hasSelected = Boolean(this.selected);
    const shouldToggleDropdownOnClick = this.trigger === TRIGGERS.Click;
    const shouldShowDropdownOnHover = this.trigger === TRIGGERS.Hover;

    return html`
      <span ${ref(this.dropdownInitiatorRef)} class="initiator">
        <slot
          name="label"
          @click="${() => shouldToggleDropdownOnClick && this.toggleDropdown()}"
          @mouseover="${() => shouldShowDropdownOnHover && this.showDropdown()}"
        ></slot>
        ${!hasLabelSlot
          ? html`
              <button
                class="dropbtn"
                @click="${() => shouldToggleDropdownOnClick && this.toggleDropdown()}"
                @mouseover="${() => shouldShowDropdownOnHover && this.showDropdown()}"
              >
                ${hasSelected ? this.selected.label : this.placeholder}
              </button>
            `
          : NOTHING_STRING}
      </span>
    `;
  }

  renderDropdowContent() {
    setTimeout(() => {
      this.adjustDropdownPosition();
    });
    return html`
      <div class="dropdown-content show" ${ref(this.dropdownContentRef)} style=${styleMap(this.customStyles || {})}>
        ${html`${this.template}`}
        <ul>
          ${this.options?.map((option) => this.renderOption(option))}
        </ul>
      </div>
    `;
  }

  renderOption(option: any) {
    const childMenuRef: Ref<HTMLInputElement> = createRef();
    const parentRef: Ref<HTMLInputElement> = createRef();
    const showChildren = this.showChildrenMap.get(option) || false;
    const parentId = this.getRandomId();

    return option.type === OPTION_TYPES.DIVIDER
      ? this.renderDividerOption()
      : this.renderRegularOption(option, childMenuRef, parentRef, showChildren, parentId);
  }

  renderDividerOption() {
    return html`<li class="divider"></li>`;
  }

  renderRegularOption(
    option: any,
    childMenuRef: Ref<HTMLInputElement>,
    parentRef: Ref<HTMLInputElement>,
    showChildren: boolean,
    parentId: string
  ) {
    const isSelected = Boolean(option === this.selected || this.selectedElementMap.get(option));
    const isGroupElement = option.type === OPTION_TYPES.GROUP;
    const hasChildren = option.children && option.children.length > 0;
    const showArrow = option.type !== OPTION_TYPES.GROUP;

    return html`
      <li
        id="${parentId}"
        ${ref(parentRef)}
        @click="${(e: Event) => this.handleOptionClick(option, e)}"
        class=${classMap({
          selected: isSelected,
          'group-element': isGroupElement,
        })}
        @mouseover="${() => {
          this.showChildrenMap.set(option, true);
          this.requestUpdate();
        }}"
        @mouseleave="${() => {
          this.showChildrenMap.set(option, false);
          this.requestUpdate();
        }}"
      >
        <span class=${classMap({'group-label': isGroupElement})}
          >${html`${option.template ? option.template(option) : option.label}`}
          ${this.searchedELement?.label === option.label
            ? html`<span class="arrow arrow-container">
                <hy-icon name="arrow-left"></hy-icon>
              </span>`
            : NOTHING_STRING}
        </span>

        ${hasChildren
          ? html`
              ${showArrow ? childrensArrow(this.boundery) : ''}
              <ul
                ${ref(childMenuRef)}
                class=${classMap({
                  'nested-search': showChildren,
                  nested: option.type !== OPTION_TYPES.GROUP,
                  'nested-group': isGroupElement,
                })}
                style="${this.positioningStyle}; ${this.updateNestedMenuPosition(parentId)}"
              >
                <div class="block">${option.children.map((child: any) => this.renderOption(child))}</div>
              </ul>
            `
          : NOTHING_STRING}
      </li>
    `;
  }

  handleOptionClick(option: any, e: Event) {
    if (!option.template) {
      this.handleSelect(option, e);
    } else {
      e.stopPropagation();
    }
  }

  updateNestedMenuPosition(parentId: string) {
    requestAnimationFrame(() => {
      const listItems = this.shadowRoot!.getElementById(`${parentId}`);
      const nested: HTMLElement | null | undefined = listItems?.querySelector('ul.nested');
      if (nested) {
        nested.style!.marginTop = `${listItems?.offsetTop}px`;
      }
      this.adjustDropdownPosition();
    });
    this.requestUpdate();
  }

  override updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('search')) {
      if (this.search) {
        this.searching();
        if (!this.open) {
          this.open = true;
        }
      }
    }
  }

  searching() {
    this.options;
    const stacks: any[] = [];
    this.recursivesearch(stacks, this.options, this.search);
    this.showChildrenMap = new Map<any, boolean>();
    this.selectedElementMap = new Map<any, boolean>();
    this.searchedELement = undefined;
    for (const stack of stacks) {
      this.showChildrenMap.set(stack, true);
      this.selectedElementMap.set(stack, true);
      this.searchedELement = stack;
    }
  }
  recursivesearch(stack: any[], options: any[], searching: string) {
    for (const option of options) {
      if (option.label.toLowerCase().includes(searching)) {
        stack.push(option);
        return; // Break the loop
      }

      if (option.children) {
        stack.push(option);
        this.recursivesearch(stack, option.children, searching);
        if (stack.length && stack[stack.length - 1] === option) {
          stack.pop();
        } else {
          return;
        }
      }
    }
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

  showDropdown() {
    this.open = true;
  }
  adjustDropdownPosition() {
    this.getDistanceFromRight(this.dropdownContentRef.value);
    const distanceFromRight = this.getDistanceFromRight(this.dropdownContentRef.value);
    if (distanceFromRight < this.dropdownContentRef.value!.offsetWidth) {
      this.dropdownContentRef.value!.style.marginLeft =
        '-' + (this.dropdownContentRef.value!.offsetWidth - this.dropdownInitiatorRef.value!.offsetWidth) + 'px';
      this.positioningStyle = `margin-left: -${this.dropdownContentRef.value!.offsetWidth * 2}px`;
      this.boundery.right = true;
    }
  }

  private onClickOutside(e: MouseEvent) {
    if (!e.composedPath().includes(this)) {
      this.open = false;
    }
  }

  getDistanceFromRight(element: any) {
    const rect = element.getBoundingClientRect();
    const distanceToBottom = Math.max(0, window.innerWidth - rect.right);
    return distanceToBottom;
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.onClickOutside.bind(this));
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.onClickOutside.bind(this));
  }
}

customElements.define('hy-dropdown', HyDropdownComponent);
