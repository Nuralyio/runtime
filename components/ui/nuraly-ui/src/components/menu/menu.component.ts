/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, html, nothing, PropertyValueMap} from 'lit';
import {property, queryAssignedElements, state} from 'lit/decorators.js';
import {ref, createRef, Ref} from 'lit/directives/ref.js';
import {EMPTY_STRING, NOTHING_STRING, OPTION_TYPES, TRIGGERS} from './menu.constants';
import {styles} from './menu.style';
import {classMap} from 'lit/directives/class-map.js';
import {childrensArrow} from './templates/has-children-arrow.template';

export class HyMenuComponent extends LitElement {
  static override styles = styles;

  @property({type: Array})
  options = [];

  @property({type: Object})
  selected: any;

  @property({type: Boolean})
  open = true;

  @property({type: String})
  placeholder = EMPTY_STRING;

  @property({type: String})
  search = EMPTY_STRING;

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

  menuContentRef: Ref<HTMLInputElement> = createRef();
  menuInitiatorRef: Ref<HTMLInputElement> = createRef();

  override firstUpdated() {
    this.hasSlotLabel = !!this._prefixItems.length;
    this.performUpdate();
  }

  override render() {
    return html`
      <div class="menu">${this.renderDropDownIntiator()} ${(this.open && this.renderDropdowContent()) || nothing}</div>
    `;
  }

  renderDropDownIntiator() {
    const shouldToggleDropdownOnClick = this.trigger === TRIGGERS.Click;
    const shouldShowDropdownOnHover = this.trigger === TRIGGERS.Hover;

    return html`
      <span ${ref(this.menuInitiatorRef)} class="initiator">
        <slot
          name="label"
          @click="${() => {
            shouldToggleDropdownOnClick;
          }}"
          @mouseover="${() => {
            shouldShowDropdownOnHover;
          }}"
        ></slot>
      </span>
    `;
  }

  renderDropdowContent() {
    return html`
      <div class="menu-content show" ${ref(this.menuContentRef)}>
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

    return option.type === OPTION_TYPES.DIVIDER
      ? this.renderDividerOption()
      : this.renderRegularOption(option, childMenuRef, parentRef, showChildren);
  }

  renderDividerOption() {
    return html`<li class="divider"></li>`;
  }

  renderRegularOption(
    option: any,
    childMenuRef: Ref<HTMLInputElement>,
    parentRef: Ref<HTMLInputElement>,
    showChildren: boolean
  ) {
    const isSelected = Boolean(option === this.selected || this.showChildrenMap.get(option));
    const isGroupElement = option.type === OPTION_TYPES.GROUP;
    const hasChildren = option.children && option.children.length > 0;

    return html`
      <li
        ${ref(parentRef)}
        class=${classMap({
          selected: isSelected,
          'group-element': isGroupElement,
        })}
        @mouseleave="${() => {}}"
      >
        <div style="float:right;    margin-top: -10px;">
          ${html`${option.moreTemplate ? option.moreTemplate(option) : ''}`}
        </div>
        <div
          style="user-select : none"
          class=${classMap({'group-label': isGroupElement})}
          @click="${(e: Event) => {
            if (hasChildren) {
              this.toggleOption(option);
              this.requestUpdate();
            } else {
              this.handleOptionClick(option, e);
            }
          }}"
        >
          ${hasChildren ? childrensArrow(this.boundery, isSelected) : ''}
          ${this.searchedELement?.label === option.label
            ? html`<span class="arrow arrow-container"> </span>`
            : NOTHING_STRING}
          ${html`${option.template ? option.template(option) : option.label}`}
        </div>
        ${isSelected && hasChildren
          ? html`
              <ul
                ${ref(childMenuRef)}
                class=${classMap({
                  'nested-search': showChildren,
                  nested: option.type !== OPTION_TYPES.GROUP,
                  'nested-group': isGroupElement,
                })}
              >
                <span>${option.children.map((child: any) => this.renderOption(child))}</span>
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
  toggleOption(option: any) {
    this.showChildrenMap.set(option, !this.showChildrenMap.get(option));
    console.log(this.showChildrenMap.get(option));
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
    this.open = true;
    const changeEvent = new CustomEvent('change', {
      detail: {value: this.selected},
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);
  }
}

customElements.define('hy-menu', HyMenuComponent);
