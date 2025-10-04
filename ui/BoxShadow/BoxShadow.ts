import type { ComponentElement } from "@shared/redux/store/component/interface.ts";
import { css, html } from "lit";
import { property, state } from "lit/decorators.js";
import "@nuralyui/checkbox";
import "@nuralyui/slider-input";
import { BaseElementBlock } from "@runtime/ui/BaseElement.ts";
import { executeCodeWithClosure } from "@runtime/Kernel.ts";
import { getNestedAttribute } from "@shared/utils/object.utils.ts";

function debounce(func, wait = 100) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export class AttributeBoxShadowValue extends BaseElementBlock {
  static override styles = [
    css`
        :host {
            display: block;
        }
        hy-slider-input{
    	    width: 100%;
    	    margin-left: 14px;
        }
        hy-input {
			--hybrid-input-container-padding-top : 0px;
			--hybrid-input-container-padding-bottom : 0px;
			--hybrid-input-container-padding-left : 0px;
			--hybrid-input-container-padding-right : 0px;
			--hybrid-input-text-align:center
		}
		hy-icon{
			font-size: 20px;
		}

		.first-row{
			flex: 80%; display: flex;
		}
		.second-row{
			flex: 20%;
		}
		hy-checkbox{
			--hy-checkbox-size: 15px;
			}
        `
  ];
  @property()
  component: ComponentElement;
  @state()
  horizontalValue = 0;

  @state()
  verticalValue = 0;

  @state()
  blurValue = 0;

  @state()
  spreadValue = 0;

  @state()
  colorValue = "#000000";

  @state()
  insetValue = false;
  /*
  create state using decorator that hold enable disable shadow box with toggle function
  */
  @state()
  shadowBox = true;
  handleColorChange = debounce((e) => {
	  this.colorValue = e.detail.value;
	  if(e.detail.value!=this.colorValue){
		this.boxShadow();
	}
  });

  boxShadow() {
	return
    const shadowBox = ` ${this.horizontalValue}px ${this.verticalValue}px ${this.blurValue}px ${this.spreadValue}px ${this.colorValue} ${this.insetValue ? "inset" : ""}`;
    if (this.component.event.boxShadowChanged) {

      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.boxShadowChanged`), {
        value: shadowBox
      });
    }
  }

  toggleShadowBox() {
    this.shadowBox = !this.shadowBox;
  }

  override render() {
    const isDisabled = this.inputHandlersValue?.state == "disabled" ? true : false;
    this.horizontalValue = this.inputHandlersValue?.value ? this.inputHandlersValue.value[0] : 0;
    this.verticalValue = this.inputHandlersValue?.value ? this.inputHandlersValue.value[1] : 0;
    this.blurValue = this.inputHandlersValue?.value ? this.inputHandlersValue.value[2] : 0;
    this.spreadValue = this.inputHandlersValue?.value ? this.inputHandlersValue.value[3] : 0;
    this.insetValue = this.inputHandlersValue?.value ? this.inputHandlersValue.value[4] : false;
    this.colorValue = this.inputHandlersValue?.value ? this.inputHandlersValue.value[5] : "#000000";
    return html`
		<hy-checkbox 
		.disabled=${isDisabled}
		.checked=${this.inputHandlersValue?.value ? this.inputHandlersValue.value[4] : false} 
		@checkbox-changed=${(e) => {
			this.handleColorChange(e);
    }}
		 >
		${this.insetValue ? html`<hy-label>Disable</hy-label>` : html`<hy-label>Enable</hy-label>`}<hy-label> Shodow Box</hy-label>
		</hy-checkbox>
		<div>
			<div style="display : flex">
				<div class="first-row">
	    			<hy-icon name="arrows-alt-h"></hy-icon>
					<hy-slider-input
			          id="slider-change-via-textbox"
			          data-prop="slider-change-via-textbox"
			          .min=${-50}
			          .max=${50}
					  .disabled=${isDisabled}
			          .value=${this.inputHandlersValue?.value ? this.inputHandlersValue.value[0] : 0}
			           @changed="${(e) => {
      this.horizontalValue = e.detail.value;
      this.boxShadow();
    }}"
			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input 
					 .value=${this.horizontalValue} 				
					 .disabled=${isDisabled}
					 @valueChange=${(e) => {
      if (e.detail.value && !isNaN(e.detail.value) && +e.detail.value >= -50 && +e.detail.value <= 50) {
        this.horizontalValue = e.detail.value;
        this.boxShadow();
      }
    }}
					 >
					 </hy-input>
		        </div>
			</div>

			<div style="display : flex">
				<div class="first-row">
	    			<hy-icon name="arrows-alt-v"></hy-icon>
					<hy-slider-input
			          id="slider-change-via-textbox"
			          data-prop="slider-change-via-textbox"
			          .min=${-50}
			          .max=${50}
					  .disabled=${isDisabled}
			          .value=${this.inputHandlersValue?.value ? this.inputHandlersValue.value[1] : 0}
			           @changed="${(e) => {
      this.verticalValue = e.detail.value;
      this.boxShadow();
    }}"
			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input 
					 .value=${this.verticalValue} 					  
					 .disabled=${isDisabled}
					 @valueChange=${(e) => {
      if (e.detail.value && !isNaN(e.detail.value) && +e.detail.value >= -50 && +e.detail.value <= 50) {
        this.verticalValue = e.detail.value;
        this.boxShadow();
      }
    }}
					 
					 >
					 </hy-input>
		        </div>
			</div>

			<div style="display : flex">
				<div class="first-row">
	    			<hy-icon name="burn"></hy-icon>
					<hy-slider-input
			          id="slider-change-via-textbox"
			          data-prop="slider-change-via-textbox"
			          .min=${-50}
			          .max=${50}
					  .disabled=${isDisabled}
			          .value=${this.inputHandlersValue?.value ? this.inputHandlersValue.value[2] : 0}
					  @changed="${(e) => {
      this.blurValue = e.detail.value;
      this.boxShadow();
    }}"

			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input   
					 .disabled=${isDisabled}
					 .value=${this.blurValue} 
					 @valueChange=${(e) => {
      if (e.detail.value && !isNaN(e.detail.value) && +e.detail.value >= -50 && +e.detail.value <= 50) {
        this.blurValue = e.detail.value;
        this.boxShadow();
      }
    }}
					>
					</hy-input>
		        </div>
			</div>

			<div style="display : flex">
				<div class="first-row">
	    			<hy-icon name="compress"></hy-icon>
					<hy-slider-input
			          id="slider-change-via-textbox"
			          data-prop="slider-change-via-textbox"
			          .min=${-50}
			          .max=${50}
					  .disabled=${isDisabled}
			          .value=${this.inputHandlersValue?.value ? this.inputHandlersValue.value[3] : 0}
			           @changed="${(e) => {
      this.spreadValue = e.detail.value;
      this.boxShadow();
    }}"
			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input 					  
					 .disabled=${isDisabled}
					 .value=${this.spreadValue}
					 @valueChange=${(e) => {
      if (e.detail.value && !isNaN(e.detail.value) && +e.detail.value >= -50 && +e.detail.value <= 50) {
        this.spreadValue = e.detail.value;
        this.boxShadow();
      }
    }}
					 ></hy-input>
		        </div>
			</div>
			<div>
			<hy-color-picker
			style="height: 100px; width: 100%;"
			.disabled=${isDisabled}
            .color="${this.inputHandlersValue?.value ? this.inputHandlersValue.value[5] : "#000000"}"
            @color-changed="${this.handleColorChange}"
             >
			 </hy-color-picker>
    </div>			
		</div>
        `;
  }
}

customElements.define("attribute-box-shadow-value", AttributeBoxShadowValue);
