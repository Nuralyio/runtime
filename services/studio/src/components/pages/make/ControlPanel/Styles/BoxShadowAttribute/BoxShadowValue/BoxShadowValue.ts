import type { ComponentElement } from "$store/component/interface";
import { LitElement, css, html } from "lit";
import { property, state } from "lit/decorators.js";

//import "@hybridui/checkbox";
export class AttributeBoxShadowValue extends LitElement {
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

	boxShadow() {
		const shadowBox = ` ${this.horizontalValue}px ${this.verticalValue}px ${this.blurValue}px ${this.spreadValue}px ${this.colorValue} ${this.insetValue ? "inset" : ""}`;
		console.log(shadowBox)
		this.dispatchEvent(new CustomEvent("box-shadow-changed", {
			detail: {
				value: shadowBox
			}
		}))

		return shadowBox;
	}

	/*
	create state using decorator that hold enable disable shadow box with toggle function 
	*/
	@state()
	shadowBox = true;

	toggleShadowBox() {
		this.shadowBox = !this.shadowBox;
	}




	updated(changedProperties) {
		changedProperties.forEach((_oldValue, propName) => {
			if (propName === "component") {
				this.initValues();
			}
		});
	}
	initValues() {
		if (this.component.style["box-shadow"]) {
			const values = this.component.style["box-shadow"]?.match(/-?\d+px/g);
			this.horizontalValue = parseInt(values[0], 10);
			this.verticalValue = parseInt(values[1], 10);
			this.blurValue = parseInt(values[2], 10);
			this.spreadValue = parseInt(values[3], 10);
			const colorMatch = this.component.style["box-shadow"].match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
			const insetMatch = this.component.style["box-shadow"].match(/\binset\b/);
			 this.insetValue = insetMatch[0] ? true : false;
			this.colorValue = colorMatch ? colorMatch[0] : "#000000";
			this.requestUpdate();
		}
		else {
			this.horizontalValue = 0;
			this.verticalValue = 0;
			this.blurValue = 0;
			this.spreadValue = 0;
			this.colorValue = "#000000";
			this.insetValue = false;
			this.requestUpdate();
		}
        
	}

	connectedCallback() {


		super.connectedCallback();
		this.initValues();
	}

	override render() {
		return html`
		<hy-checkbox .checked=${this.insetValue} @checkbox-changed=${(e) => { this.insetValue = e.detail.value;  this.boxShadow()}} >
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
			           @changed="${(e) => (this.horizontalValue = e.detail.value) && this.boxShadow()}"
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
			           @changed="${(e) => (this.verticalValue = e.detail.value) && this.boxShadow()}"
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
			           @changed="${(e) => (this.blurValue = e.detail.value) && this.boxShadow()}"

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
			           @changed="${(e) => (this.spreadValue = e.detail.value) && this.boxShadow()}"

			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input  .value=${this.spreadValue + "px"}></hy-input>
		        </div>
			</div>

			
			<div style="display : flex">
				<div class="first-row">
	    			<hy-icon name="braille"></hy-icon>
					<hy-slider-input
			          id="slider-change-via-textbox"
			          data-prop="slider-change-via-textbox"
			          .min=${-50}
			          .max=${50}
			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input  value="0px"></hy-input>
		        </div>
			</div>
			<div>
			<hy-color-picker
			style="height: 100px; width: 100%;"
    .color="${this.colorValue}"
    @color-changed="${(e) => (this.colorValue = e.detail.value) && this.boxShadow()}"
    ></hy-color-picker>
    </div>

				
		</div>
        `	
	}
}
customElements.define('attribute-box-shadow-value', AttributeBoxShadowValue);