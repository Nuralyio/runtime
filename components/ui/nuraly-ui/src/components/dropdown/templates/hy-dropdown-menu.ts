import {LitElement, html, nothing} from 'lit';
import {customElement, property, query, state} from 'lit/decorators.js';
import {styles} from './hy-dropdown-menu.style.js';
import {DropDownDirection} from '../dropdown.types';
@customElement('hy-dropdown-menu')
export class HyDropdownMenu extends LitElement {
  static override styles = styles;
  @query('div')
  menuOption!: HTMLElement;
  @property({reflect: true, type: Boolean})
  disabled = false;
  @property({reflect: true, type: String})
  icon!: string;
  @property()
  label!: string;
  @property({reflect: true})
  direction!: DropDownDirection;
  @state()
  showChildren = false;

  override firstUpdated(): void {
    this.menuOption.addEventListener('mouseenter', this.onMouseEnterMenu);
    this.menuOption.addEventListener('mouseleave', this.onMouseLeaveMenu);
  }

  onMouseEnterMenu = () => {
    if (!this.disabled) this.showChildren = true;
  };
  onMouseLeaveMenu = () => {
    if (!this.disabled) this.showChildren = false;
  };
  onClickMenu(menuClickEvent: Event) {
    menuClickEvent.stopPropagation();
  }

  override disconnectedCallback(): void {
    this.menuOption.removeEventListener('mouseenter', this.onMouseEnterMenu);
    this.menuOption.removeEventListener('mouseleave', this.onMouseLeaveMenu);
  }

  override render() {
    return html`<div @mousedown=${this.onClickMenu}>
      ${this.icon ? html`<hy-icon name=${this.icon}></hy-icon>` : nothing}
      <hy-label class="menu-label"> ${this.label}</hy-label>
      <hy-icon
        name="${this.direction == DropDownDirection.Right ? 'caret-right' : 'caret-left'}"
        id="caret-icon"
      ></hy-icon>
      <slot style="display:${this.showChildren ? 'block' : 'none'}"></slot>
    </div>`;
  }
}
