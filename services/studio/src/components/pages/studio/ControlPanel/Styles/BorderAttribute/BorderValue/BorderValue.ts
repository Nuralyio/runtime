import type { ComponentElement } from '$store/component/interface';
import { BaseElementBlock } from 'components/shared/blocks/ComponentElements/BaseElement';
import { executeHandler } from 'core/helper';
import { html, css, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('attribute-border-value')
export class AttributeBorderValue extends BaseElementBlock {
	@property()
	component : ComponentElement;

	@state()
	borderRadius = 0;

	@state()
	unity=''

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

	firstUpdated(_changedProperties: PropertyValues): void {
		    this.borderRadius = this.inputHandlersValue.value[0]
			this.unity = this.inputHandlersValue.value[1]					
	}
    
	 override updated(_changedProperties: PropertyValues): void {
		if(_changedProperties.has('borderRadius')){
			if(this.component.event.borderRadiusChanged){
				executeHandler({
					component:this.component,
					type:'event.borderRadiusChanged',
					extras:{EventData:{value:this.borderRadius,unity:this.unity}}
				})
			}
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
			          .value=${this.inputHandlersValue.value[0]}
			           @changed="${(e) => (this.borderRadius = e.detail.value)}"

			        ></hy-slider-input>
				</div>
		        <div class="second-row">
		        	 <hy-input  .value=${this.borderRadius}></hy-input>
		        </div>
			</div>


        `;
    }
}
