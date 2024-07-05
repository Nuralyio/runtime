import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styles} from './sub-menu.style';
import {EMPTY_STRING} from '../menu.constants';

@customElement('hy-sub-menu')
export class HySubMenu extends LitElement {
  @property()
  text!: string;

  @property({reflect: true})
  icon = EMPTY_STRING;

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({type: Boolean, reflect: true})
  highlighted = false;

  @state()
  isOpen = false;

  _toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  _handleSelectedChild() {
    this.highlighted = true;
  }

  override render() {
    return html`
      <ul tabindex="0">
        <div @click=${!this.disabled ? this._toggleMenu : nothing}>
          ${this.icon ? html`<hy-icon id="text-icon" name="${this.icon}"></hy-icon>` : nothing}
          <span>${this.text}</span>
          <hy-icon id="toggle-icon" name="${this.isOpen ? 'angle-up' : 'angle-down'}"></hy-icon>
        </div>
        <slot @selected-link=${this._handleSelectedChild} style="display:${this.isOpen ? nothing : 'none'};"></slot>
      </ul>
    `;
  }
  static override styles = styles;
}
