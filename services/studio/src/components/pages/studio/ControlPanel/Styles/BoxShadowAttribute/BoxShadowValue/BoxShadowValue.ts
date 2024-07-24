import type { ComponentElement } from "$store/component/interface";
import {css, html, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import "@hybridui/checkbox";
import "@hybridui/slider-input"
import { executeHandler } from "core/helper";
import { BaseElementBlock } from "components/shared/blocks/ComponentElements/BaseElement";
export class AttributeBoxShadowValue extends BaseElementBlock {
	@property()
	component: ComponentElement;
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

	@state()
	horizontalValue = 0;

	@state()
	verticalValue = 0;

	@state()
	blurValue = 0;

	@state()
	spreadValue = 0;

	@state()
	colorValue = "#000000"

	@state()
	insetValue = false;
	
    firstUpdated(_changedProperties: PropertyValues): void {
	    this.horizontalValue= this.inputHandlersValue.value[0];
		this.verticalValue= this.inputHandlersValue.value[1];
		this.blurValue= this.inputHandlersValue.value[2];
		this.spreadValue= this.inputHandlersValue.value[3];
		this.insetValue= this.inputHandlersValue.value[4];
		this.colorValue= this.inputHandlersValue.value[5]
    }  

	updated(_changedProperties: PropertyValues): void {
		if(_changedProperties.has('horizontalValue') || _changedProperties.has('verticalValue') || _changedProperties.has('blurValue') || _changedProperties.has('spreadValue') || _changedProperties.has('colorValue') || _changedProperties.has('insetValue')) {
			this.boxShadow();
		}
	}

	boxShadow() {
		const shadowBox = ` ${this.horizontalValue}px ${this.verticalValue}px ${this.blurValue}px ${this.spreadValue}px ${this.colorValue} ${this.insetValue ? "inset" : ""}`;
		if(this.component.event.boxShadowChanged){
			executeHandler({
				component:this.component,
				type:'event.boxShadowChanged',
				extras:{EventData:{value:shadowBox}}
			})
		}
	}

	/*
	create state using decorator that hold enable disable shadow box with toggle function 
	*/
	@state()
	shadowBox = true;

	toggleShadowBox() {
		this.shadowBox = !this.shadowBox;
	}

	override render() {
		return html`
		<hy-checkbox .checked=${this.insetValue} @checkbox-changed=${(e) => { this.insetValue = e.detail.value}} >
		${this.insetValue ? html`Disable` : html`Enable`} Shodow Box
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
			          .value=${this.horizontalValue}
			           @changed="${(e) => (this.horizontalValue = e.detail.value) }"
			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input   .value=${this.horizontalValue + "px"} @ch></hy-input>
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
			          .value=${this.verticalValue}
			           @changed="${(e) => (this.verticalValue = e.detail.value)}"
			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input .value=${this.verticalValue + "px"}></hy-input>
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
			          .value=${this.blurValue}
			           @changed="${(e) => (this.blurValue = e.detail.value) }"

			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input   .value=${this.blurValue + "px"}></hy-input>
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
			          .value=${this.spreadValue}
			           @changed="${(e) => (this.spreadValue = e.detail.value) }"

			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input  .value=${this.spreadValue + "px"}></hy-input>
		        </div>
			</div>
			<div>
			<hy-color-picker
			style="height: 100px; width: 100%;"
    .color="${this.colorValue}"
    @color-changed="${(e) => (this.colorValue = e.detail.value)}"
    ></hy-color-picker>
    </div>

				
		</div>
        `	
	}
}
customElements.define('attribute-box-shadow-value', AttributeBoxShadowValue);