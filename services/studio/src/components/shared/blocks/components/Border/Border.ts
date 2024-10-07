import type { ComponentElement } from '$store/component/interface';
import { BaseElementBlock } from '../BaseElement';
import { html, css, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@hybridui/slider-input';
import { executeCodeWithClosure } from 'core/executer';
import { getNestedAttribute } from 'utils/object.utils';

// Debounce function
function debounce(func: Function, wait: number) {
	let timeout: number;
	return function (...args: any[]) {
		clearTimeout(timeout);
		timeout = window.setTimeout(() => func.apply(this, args), wait);
	};
}

@customElement('attribute-border-value')
export class AttributeBorderValue extends BaseElementBlock {
	@property()
	component: ComponentElement;

	@state()
	borderRadius = 0;

	@state()
	unity = '';

	static override styles = [
		css`
      :host {
        display: block;
      }
      hy-slider-input {
        width: 100%;
        margin-left: 14px;
      }
      hy-input {
        --hybrid-input-container-padding-top: 0px;
        --hybrid-input-container-padding-bottom: 0px;
        --hybrid-input-container-padding-left: 0px;
        --hybrid-input-container-padding-right: 0px;
        --hybrid-input-text-align: center;
      }
      hy-icon {
        font-size: 20px;
      }
      .first-row {
        flex: 80%;
        display: flex;
      }
      .second-row {
        flex: 20%;
      }
    `,
	];

	// Debounced changed event handler
	debouncedChanged = debounce((e: Event) => {
		if (this.component.event.borderRadiusChanged) {
      const fn = executeCodeWithClosure(this.component, getNestedAttribute(this.component, `event.borderRadiusChanged`),{
        value: (e as CustomEvent).detail.value, unity: this.unity });
		}
	}, 100); // Adjust the debounce delay as needed

	override render() {
    this.borderRadius = this.inputHandlersValue.value?this.inputHandlersValue.value[0]:0;
		this.unity = this.inputHandlersValue.value?this.inputHandlersValue.value[1]:'px';
    const isDisabled = this.inputHandlersValue.state =='disabled'?true:false;
		return html`
      <div style="display: flex">
        <div class="first-row">
          <hy-icon name="expand"></hy-icon>
          <hy-slider-input
            id="slider-change-via-textbox"
            data-prop="slider-change-via-textbox"
            .min=${0}
            .max=${200}
            .value=${this.borderRadius}
            .disabled =${isDisabled}
            @changed="${this.debouncedChanged}"
          ></hy-slider-input>
        </div>
        <div class="second-row">
          <hy-input 
          .value=${this.borderRadius} 
          .disabled =${isDisabled}
          ></hy-input>
        </div>
      </div>
    `;
	}
}
