import type { ComponentElement } from '$store/component/interface';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('attribute-border-value')
export class AttributeBorderValue extends LitElement {
	@property()
	component : ComponentElement;

	@state()
	borderRadius = 0;

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
        `
    ];

    dispatchBorderRadius(){

    	this.dispatchEvent(new CustomEvent("border-radius-changed", {
			detail: {
				value: this.borderRadius + "px"

				}
			})
    	)

    }

   	updated(changedProperties) {
        changedProperties.forEach((_oldValue, propName) => {
          if (propName === "component") {
            this.initValues();
          }
        });
      }

    initValues() {
    	if(this.component.style["border-radius"]){
    		const values = this.component.style["border-radius"].split("px");
			this.borderRadius = parseInt(values[0]);
    	}else{
    		this.borderRadius = 0;
    	}
    }

    override render() {
        return html`

			<div style="display : flex">
				<div class="first-row">
	    			<hy-icon name="expand"></hy-icon>
					<hy-slider-input
			          id="slider-change-via-textbox"
			          data-prop="slider-change-via-textbox"
			          .min=${0}
			          .max=${200}
			          .value=${this.borderRadius}
			           @changed="${(e) => (this.borderRadius = e.detail.value) && this.dispatchBorderRadius()}"

			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input  .value=${this.borderRadius+"px"}></hy-input>
		        </div>
			</div>


        `;
    }
}
