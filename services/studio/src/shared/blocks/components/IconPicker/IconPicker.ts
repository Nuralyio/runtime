import type { ComponentElement } from '$store/component/interface.ts';
import { css, html, nothing } from 'lit';
import {customElement, property, state} from 'lit/decorators.js'
import { BaseElementBlock } from '../BaseElement.ts';
import '@nuralyui/icon'
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import {styles} from "./IconPicker.style.ts"
import { executeCodeWithClosure } from "../../../../core/executer.ts";
import { getNestedAttribute } from "../../../../utils/object.utils.ts";

@customElement("icon-picker-block")
export class IconPicker extends BaseElementBlock{
   
    icons=  Array.from(new Set([...Object.keys(solidIcons).filter((key)=>key.startsWith('fa')).map((key)=>solidIcons[key].iconName).filter((iconName)=>iconName)]) )
    @state()
    filtredIcons=this.icons;
    @state() 
    selectedIcon='';
    @state() 
    dropdownOpen=false;
    @property()
	component: ComponentElement;

    static override styles= styles;

    constructor(){
        super();
        document.addEventListener('click', this.onClickOutside);
    }

    toggleDropDown(){
        this.dropdownOpen = !this.dropdownOpen;
        this.filtredIcons = this.icons;
    }

    handleIconSelect(icon:string){
        this.selectedIcon = icon == this.selectedIcon?'':icon;
        this.dropdownOpen =false;
        this.dispatchEvent(new CustomEvent('icon-selected',{detail:icon}));
        if(this.component.event?.iconChanged){
            const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.iconChanged`),{
                value: this.selectedIcon,
              });
        }
    }
    handleIconChange= (e:Event)=>{
        const searchString=(e.target as HTMLInputElement).value;
         if(searchString){
            this.filtredIcons = this.icons.filter((icon)=>icon.includes(searchString))
         }
         else 
         this.filtredIcons = this.icons
    }

    private onClickOutside = (onClickEvent: Event) => {
        const outsideClick =  !onClickEvent.composedPath().includes(this)
          if(outsideClick)
            this.dropdownOpen =false
      };

      override disconnectedCallback(): void {
          super.disconnectedCallback();
          document.removeEventListener('click', this.onClickOutside);
      }

    override render(){
        this.selectedIcon = this.inputHandlersValue.value??''
        const isDisabled = this.inputHandlersValue?.disable || false
        return html`
        <div class="input-container ${isDisabled?'disable':''}" @click=${!isDisabled &&this.toggleDropDown}>
        <hy-icon class="icon-preview" .name=${this.selectedIcon}></hy-icon>
        </div>
        ${
            this.dropdownOpen?html`
             <div class="dropdown">
                <div class="search-container">
                    <input  .placeholder=${!this.selectedIcon?this.inputHandlersValue.placeholder:nothing} @input=${this.handleIconChange}/>
                </div>
                ${this.filtredIcons.map((icon)=>html` 
                    <div 
                    class="icon-item ${icon ==this.selectedIcon?'selected':''}"
                    @click=${()=>this.handleIconSelect(icon)}
                    >
                        <hy-icon .name=${icon}></hy-icon>
                    </div>
                
                    `)}

             </div>
            `:nothing
        }
        ` 
    }
}