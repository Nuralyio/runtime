/* eslint-disable @typescript-eslint/no-explicit-any */
import { LitElement, html, nothing, PropertyValueMap, TemplateResult } from 'lit';
import { property, queryAssignedElements, state } from 'lit/decorators.js';
import { ref, createRef, Ref } from 'lit/directives/ref.js';
import { EMPTY_STRING, NOTHING_STRING } from './hy-dropdown.constants.js';
import { styles } from './hy-dropdown.style.js';
import { classMap } from 'lit/directives/class-map.js';

export class HyDropdownComponent extends LitElement {
  static override styles = styles;

  @property({ type: Array })
  options = [];

  @property({ type: Object })
  selected: any;

  @property({ type: Boolean })
  open = false;

  @property({ type: String })
  placeholder = EMPTY_STRING;

  @property({ type: String })
  template!: TemplateResult<1>;

  @property({ type: String })
  search = EMPTY_STRING;

  @property({ type: String })
  trigger = 'click';

  @state()
  positioningStyle = EMPTY_STRING;

  @state()
  boundery = {
    right: false,
  };

  @state()
  searchedELement: any;

  @property({ type: Boolean })
  keepOpen = false;

  @state()
  private showChildrenMap = new Map<any, boolean>(); // Map to store showChildren values
  private selectedElementMap = new Map<any, boolean>(); // Map to store showChildren values

  @property({ type: Array })
  selectedElements: any[] = [];

  @queryAssignedElements({ slot: 'label', flatten: true })
  _prefixItems!: Array<HTMLElement>;
  @state()
  hasSlotLabel = false;

  dropdownContentRef: Ref<HTMLInputElement> = createRef();
  dropdownInitiatorRef: Ref<HTMLInputElement> = createRef();

  constructor() {
    super();
  }

  handleRightClick(event: any) {
    if (this.trigger == 'context-menu') {
      event.preventDefault(); // Prevent the default context menu from appearing
      this.open = true;
      setTimeout(() => {
        const positionedElement: any = this.shadowRoot!.querySelector('.dropdown-content');
        console.log(event);
        positionedElement.style.left = `${event.clientX}px`;
        positionedElement.style.top = `${event.clientY}px`;
        positionedElement.style.position = `fixed`;
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
    return html`
      <span ${ref(this.dropdownInitiatorRef)} class="initiator">
        <slot
          name="label"
          @click="${() => this.trigger === 'click' && this.toggleDropdown()}"
          @mouseover="${() => this.trigger === 'hover' && this.showDropdown()}"
        ></slot>
        ${(!this.hasSlotLabel &&
        html`<button
            class="dropbtn"
            @click="${() => this.trigger === 'click' && this.toggleDropdown()}"
            @mouseover="${() => this.trigger === 'hover' && this.showDropdown()}"
          >
            ${this.selected ? this.selected.label : this.placeholder}
          </button>`) ||
      nothing}
      </span>
    `;
  }

  renderDropdowContent() {
    return html`
      <div class="dropdown-content show" ${ref(this.dropdownContentRef)}>
        ${this.template
        ? html` ${this.template} `
        : html` <ul>
              ${this.options?.map((option) => this.renderOption(option))}
            </ul>`}
      </div>
    `;
  }

  renderOption(option: any) {
    const childMenuRef: Ref<HTMLInputElement> = createRef();
    const parentRef: Ref<HTMLInputElement> = createRef();
    const showChildren = this.showChildrenMap.get(option) || false;
    // delegate the showing to the css until shifted to js
    //const showChildren = true;
    const parentId = this.getRandomId();
    return html`
      ${option.type === 'divider'
        ? html`<li class="divider"></li>`
        : html`
            <li
              id="${parentId}"
              ${ref(parentRef)}
              @click="${(e: any) => {
            if (option.handler) {
              option.handler();
            }
            if (!option.template) {
              this.handleSelect(option, e);
            } else {
              if (e) e.stopPropagation();
            }
          }}"
              class=${classMap({
            selected: Boolean( this.selectedElementMap.get(JSON.stringify(option))),
            'group-element': option.type === 'group',
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
              <span class=${classMap({ 'group-label': option.type === 'group' })}
                >${html`${option.template ? option.template(option) : option.label}`}
                ${this.searchedELement?.label === option.label
            ? html`<span class="arrow arrow-ccontainer">
                      <hy-icon name="arrow-left"></hy-icon>
                    </span>`
            : NOTHING_STRING}
              </span>
              ${option.children
            ? html`
                    ${option.type != 'group'
                ? html`<hy-icon
                          style="z-index:0"
                          name="caret-right"
                          class="has-childrens ${(this.boundery.right && 'carret-boundery-right') || NOTHING_STRING}"
                        ></hy-icon>`
                : ''}
                    <ul
                      ${ref(childMenuRef)}
                      class="  ${classMap({
                  'nested-search': showChildren,
                  nested: option.type != 'group',
                  'nested-group': option.type === 'group',
                })}"
                      style="${this.positioningStyle}; ${this.calculateOffsetTop(parentId)}"
                    >
                      <div class="block">${option.children.map((child: any) => this.renderOption(child))}</div>
                    </ul>
                  `
            : NOTHING_STRING}
            </li>
          `}
    `;
  }

  calculateOffsetTop(parentId: string) {
    requestAnimationFrame(() => {
      const listItems = this.shadowRoot!.getElementById(`${parentId}`);
      const nested: HTMLElement | null | undefined = listItems?.querySelector('ul.nested');
      if (nested) {
        nested.style!.marginTop = `${listItems?.offsetTop}px`;
      }
      this.positionDropDown();
    });
    this.requestUpdate();

    return 0;
  }
  onItemMouseOver = (parentRef: Ref<HTMLInputElement>, childMenuRef: Ref<HTMLInputElement>): void => {
    if (childMenuRef.value) {
      childMenuRef.value!.style.marginTop = parentRef.value?.offsetTop + 'px';
    }
  };

  override updated(changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>) {
    super.updated(changedProperties);
    //
    if (changedProperties.has('search')) {
      if (this.search) {
        this.searching();
        if (!this.open) {
          this.open = true;
        }
      }
    }

    if (changedProperties.has('selectedElements')) {
      this.selectedElementMap = new Map<any, boolean>();
      for (const element of this.selectedElements) {
        this.selectedElementMap.set(JSON.stringify(element), true);
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
    // this.selected = option;
    console.log(this.selectedElementMap.has(JSON.stringify(option)))
      if(this.selectedElementMap.has(JSON.stringify(option))){
        this.selectedElementMap.delete(JSON.stringify(option));
      }else{
        this.selectedElementMap.set(JSON.stringify(option), true);
      }
      this.requestUpdate();
      console.log(this.selectedElementMap)

    if(!this.keepOpen){
    this.open = false;

    }
    const changeEvent = new CustomEvent('change', {
      detail: { value: option},
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(changeEvent);
  }

  toggleDropdown() {
    this.open = !this.open;
    if (!this.open) {
      this.emitClosedEvent();
    }
    requestAnimationFrame(() => {
      this.positionDropDown();
    });
  }

  showDropdown() {
    this.open = true;
  }
  positionDropDown() {
    this.getDistanceFromBRight(this.dropdownContentRef.value);
    const distanceFromRight = this.getDistanceFromBRight(this.dropdownContentRef.value);
    const distanceFromBottom = this.getDistanceFromBottom(this.dropdownContentRef.value!);

    if (distanceFromRight < this.dropdownContentRef.value!.offsetWidth) {
      this.dropdownContentRef.value!.style.marginLeft =
        '-' + (this.dropdownContentRef.value!.offsetWidth - this.dropdownInitiatorRef.value!.offsetWidth) + 'px';
      this.positioningStyle = `margin-left : -${this.dropdownContentRef.value!.offsetWidth * 2}px`;
      this.boundery.right = true;
    }
    //code me: if the height of the window is less than the height of the dropdown content then resize is and active scroll
    if(window.innerHeight < this.dropdownContentRef.value!.offsetHeight){
      this.dropdownContentRef.value!.style.height = `${window.innerHeight - 100}px`;
      this.dropdownContentRef.value!.style.overflowY = `scroll`;
    }else{

    if (distanceFromBottom < this.dropdownContentRef.value!.offsetHeight) {
      this.dropdownContentRef.value!.style.marginTop = '-' + (this.dropdownContentRef.value!.offsetHeight + this.dropdownInitiatorRef.value!.offsetHeight + 4) + 'px';
    } 
    }


  }

  emitClosedEvent() {
    const closedEvent = new CustomEvent('closed', {
      detail: { value: this.selected },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(closedEvent);
  }

  _onClickOutside(e: MouseEvent) {
    if (!e.composedPath().includes(this)) {
      this.open = false;
      this.emitClosedEvent();
    }
  }

  getDistanceFromBottom(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const distanceToBottom = Math.max(0, window.innerHeight - rect.bottom);
    return distanceToBottom;
  }

  getDistanceFromBRight(element: any) {
    const rect = element.getBoundingClientRect();
    const distanceToBottom = Math.max(0, window.innerWidth - rect.right);
    return distanceToBottom;
  }

  override connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this._onClickOutside.bind(this));
    this.addEventListener('contextmenu', this.handleRightClick);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onClickOutside.bind(this));
  }
}

customElements.define('hy-dropdown', HyDropdownComponent);
