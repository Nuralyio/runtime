import {LitElement, html, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {styles} from './sub-menu.style.js';
import {EMPTY_STRING} from '../menu.constants.js';
import { IAction } from '../menu.types.js';

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

  @property()
  menu!:{icon:string,actions:IAction[]}
  
  optionPath!:number[];
  
  override connectedCallback(): void {
    super.connectedCallback();
    this.optionPath=this.getAttribute('data-path')!.split('-').map((stringValue)=>+stringValue);
  }

  _toggleMenu() {
    if(!this.isOpen){
      this.isOpen = !this.isOpen;
    }
    this.dispatchEvent(new CustomEvent('select-menu', {
      bubbles: true,
      composed: true,
      detail: {value:this.text,path:this.optionPath},
    }));
    this.highlighted = true
  }

  toggleIcon(){
    this.isOpen = !this.isOpen
  }

  _handleSelectedChild() {
    this.highlighted = true;
  }
  
  onActionClick(e:CustomEvent){
    e.stopPropagation()
    this.dispatchEvent(new CustomEvent('action-click',{detail:{value:e.detail.value,path:this.optionPath},composed:true,bubbles:true}))
  }

  override render() {
    return html`
    <ul tabindex="0">
        <div @click=${!this.disabled ? this._toggleMenu : nothing}>
          ${this.icon ? html`<hy-icon id="text-icon" name="${this.icon}"></hy-icon>` : nothing}
          <span>${this.text}</span>
          <div class="icons-container" @click=${(e:Event)=>e.stopPropagation()}>
          ${this.menu?.actions?html`
            <hy-dropdown .options=${this.menu.actions} @click-item=${this.onActionClick}>
              <hy-icon name="${this.menu.icon}" class="action-icon" ></hy-icon>
            </hy-dropdown>
            `:nothing}
            <hy-icon id="toggle-icon" name="${this.isOpen ? 'angle-up' : 'angle-down'}" @click=${!this.disabled ? this.toggleIcon : nothing}></hy-icon>
          </div>
        </div>
        <slot @select-menu=${this._handleSelectedChild} @selected-link=${this._handleSelectedChild} style="display:${this.isOpen ? nothing : 'none'};"></slot>
      </ul>
    `;
  }
  static override styles = styles;
}
