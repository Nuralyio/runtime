import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styles} from './menu-link.style.js';
import {EMPTY_STRING} from '../menu.constants.js';
import {ICON_POSITION} from './menu-link.contants.js';
import { IAction } from '../menu.types.js';
import '../../dropdown/hy-dropdown.component.js'

@customElement('hy-menu-link')
export class HyMenuLink extends LitElement {
  static index: number;

  @state()
  private linkPosition!: number;

  @property({reflect: true})
  text = EMPTY_STRING;

  @property()
  link!: string;

  @property({type: Boolean, reflect: true})
  disabled = false;

  @property({reflect: true})
  icon = EMPTY_STRING;

  @property({reflect: true})
  iconPosition = ICON_POSITION.LEFT;

  @property({type: Boolean, reflect: true})
  selected = false;

  @property()
  menu!:{icon:string,actions:IAction[]}

  optionPath!:number[];


  override connectedCallback(): void {
    super.connectedCallback();
    this.optionPath=this.getAttribute('data-path')!.split('-').map((stringValue)=>+stringValue);

    const isTheFirstOption=this.optionPath.filter((path)=>path!=0).length==0
    if (isTheFirstOption) {
      HyMenuLink.index = 0;
    }
    this.linkPosition = HyMenuLink.index;
    HyMenuLink.index++;
  }

  override firstUpdated(): void {
    if (this.selected) {
      this._clickLink();
    }
  }

  _clickLink() {
    this.dispatchEvent(
      new CustomEvent('selected-link', {
        detail: {index: this.linkPosition, value: this.text},
        bubbles: true,
        composed: true,
      })
    );
  }

  onActionClick(e:CustomEvent){
    e.stopPropagation()
    this.dispatchEvent(new CustomEvent('action-click',{detail:{value:e.detail.value,path:this.optionPath},composed:true,bubbles:true}))
  }

  override render() {
    return html`
      <li tabindex="0" @click=${!this.disabled ? this._clickLink : nothing}>
      <div class="icon-container" @click=${(e:Event)=>e.stopPropagation()}>
        ${this.icon
          ? html`${!this.text
              ? html`
                  <div id="icon-only">
                    <hy-icon name="${this.icon}"></hy-icon>
                  </div>
                `
              : html`<hy-icon name="${this.icon}"></hy-icon>`} `
          : nothing}
          ${this.menu?.actions?html`
              <hy-dropdown .options=${this.menu.actions} @click-item=${this.onActionClick}>
                <hy-icon name="${this.menu.icon}"></hy-icon>
              </hy-dropdown>
                `:nothing}
        </div>
        ${this.text
          ? html`
              <div id="text-container">
                <span>${this.text}</span>
              </div>
            `
          : nothing}
      </li>
    `;
  }
  static override styles = styles;
}
