/* eslint-disable @typescript-eslint/no-explicit-any */
import {LitElement, TemplateResult, html, nothing} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {styles} from './hy-dropdown.style.js';
import {DropDownDirection, IOption, TriggerMode} from './dropdown.types';
import './templates/hy-dropdown-item.js';
import './templates/hy-dropdown-menu.js';

@customElement('hy-dropdown')
export class HyDropdownComponent extends LitElement {
  static override styles = styles;
  @query('slot')
  triggerElement!: HTMLElement;
  @query('.dropdown-container')
  dropDownContainer!: HTMLElement;
  @property()
  options!: IOption[];
  @property({type: Boolean, reflect: true})
  show = false;
  @property()
  trigger = TriggerMode.Click;
  @property()
  template!:TemplateResult<1>;


  @state()
  isDropDownVisited = false;
  @state()
  dropDownDirection = DropDownDirection.Right;

  override firstUpdated(): void {
    document.addEventListener('scroll', this.calculatePosition);
    window.addEventListener('resize', this.calculatePosition);
    if (this.trigger == TriggerMode.Hover) {
      this.triggerElement.addEventListener('mouseenter', this.onMouseEnterTriggerElement);
      this.triggerElement.addEventListener('mouseleave', this.onMouseLeaveTriggerElement);
      this.dropDownContainer.addEventListener('mouseenter', this.onMouseEnterDropDown);
      this.dropDownContainer.addEventListener('mouseleave', this.onMouseLeaveDropDown);
    } else {
      this.triggerElement.addEventListener('click', this.onTriggerClick);
      window.addEventListener('click', this.onClickOutside);
    }
  }
  onTriggerClick = async () => {
    this.show = !this.show;
    await this.updateComplete;
    this.calculatePosition();
  };
  calculatePosition = () => {
    const triggerClientRect = this.shadowRoot!.querySelector('slot')!.assignedElements()[0].getBoundingClientRect()!;
    const dropDownWidth = this.dropDownContainer?.clientWidth;
    const dropDownHeight = this.dropDownContainer?.clientHeight;
    const availableBottomSpace = window.visualViewport!.height - triggerClientRect.bottom;
    const availableRightSpace = window.visualViewport!.width - triggerClientRect.left - triggerClientRect.width;
    const availableLeftSpace = triggerClientRect.right;
    this.dropDownContainer.style.position = 'fixed';
    if (dropDownHeight > availableBottomSpace) {
      this.dropDownContainer.style.top = `${triggerClientRect.top - dropDownHeight}px`;
    } else {
      //this.dropDownContainer.style.top = `${triggerClientRect.top +triggerClientRect.height+8}px`;
    }
    if (dropDownWidth > availableRightSpace && dropDownWidth < availableLeftSpace) {
      this.dropDownContainer.style.right = `${availableRightSpace}px`;
      this.dropDownDirection = DropDownDirection.Left;
    } else {
      this.dropDownDirection = DropDownDirection.Right;
      this.dropDownContainer.style.removeProperty('right');
    }
  };
  initPosition() {
    this.dropDownContainer.style.removeProperty('top');
    this.dropDownContainer.style.removeProperty('position');
    this.dropDownContainer.style.removeProperty('right');
  }
  onClickOutside = (onClickEvent:Event) => {
    const outsideClick = !onClickEvent.composedPath().includes(this)
    if (outsideClick && this.show){
      this.show = false;
      this.initPosition();
    }
  };
  onMouseEnterTriggerElement = async () => {
    this.show = true;
    await this.updateComplete;
    this.calculatePosition();
  };
  onMouseLeaveTriggerElement = () => {
    const waitIsDropDownVisited = 50;
    setTimeout(() => {
      if (!this.isDropDownVisited) this.show = false;
    }, waitIsDropDownVisited);
  };
  onMouseEnterDropDown = () => {
    this.isDropDownVisited = true;
  };
  onMouseLeaveDropDown = () => {
    this.isDropDownVisited = false;
    this.show = false;
    this.initPosition();
  };
  onOptionClick() {
    this.show = false;
  }

  override disconnectedCallback() {
    document.removeEventListener('scroll', this.calculatePosition);
    window.removeEventListener('resize', this.calculatePosition);
    if (this.trigger == TriggerMode.Hover) {
      this.triggerElement.removeEventListener('mouseenter', this.onMouseEnterTriggerElement);
      this.triggerElement.removeEventListener('mouseleave', this.onMouseLeaveTriggerElement);
      this.dropDownContainer.removeEventListener('mouseenter', this.onMouseEnterDropDown);
      this.dropDownContainer.removeEventListener('mouseleave', this.onMouseLeaveDropDown);
    } else {
      this.triggerElement.removeEventListener('click', this.onTriggerClick);
      window.removeEventListener('click', this.onClickOutside);
    }
  }

  display(options: IOption[]): any {
    return options.map((option) => {
      if (option.children) {
        return html`<hy-dropdown-menu
          .direction=${this.dropDownDirection}
          .disabled=${option.disabled}
          .icon=${option.icon}
          .label=${option.label}
        >
          <div class="dropdown-container">${this.display(option.children)}</div>
        </hy-dropdown-menu>`;
      } else {
        return html`<hy-dropdown-item
          .disabled=${option.disabled}
          .icon=${option.icon}
          .label=${option.label}
          .value=${option.value}
        ></hy-dropdown-item>`;
      }
    });
  }

  override render() {
    return html`
      <slot></slot>
      <div class="dropdown-container" @click-item=${this.onOptionClick}>
      ${this.template?html`${this.show ? this.template : nothing}`: this.display(this.options)}
      </div>
    `;
  }
}
