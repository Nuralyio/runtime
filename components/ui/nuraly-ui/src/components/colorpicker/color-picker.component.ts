import { LitElement, html, css, isServer } from 'lit';
import { property } from 'lit/decorators.js';
import './color-holder.component';

export class ColorPicker extends LitElement {

	@property({ type: String })
	color: string = '#67d640';

	@property({ type: Boolean })
	fullBody: boolean = false


	static override get styles() {
		return css`
      output {
        display: block;
        margin-top: 10px;
        font-size: 1.25rem;
        text-align: center;
      }
    `;
	}

	constructor() {
		super();
		 if (typeof window !== 'undefined') {
      import('vanilla-colorful');
    }
	}

	renderDropDownColorPicker() {
		return html`
  	 <hy-dropdown
        style="float: right"
        .customStyles=${{ width: '400px', height: '250px' }}
        placeholder="Select an option"
        .template=${html`
          <hex-color-picker
	        .color="${this.color}"
	        @color-changed="${this.handleColorChanged.bind(this)}"
	      ></hex-color-picker>
	      <output>${this.color}</output>
        `}
      >
      <hy-colorholder-box slot="label" color="${this.color}"></hy-colorholder-box>
      </hy-dropdown>
  	`
	}
	renderFullBodyColorPicker() {
		return html`
		<hex-color-picker
	        .color="${this.color}"
	        @color-changed="${this.handleColorChanged}"
	      ></hex-color-picker>

		`
	}

	override render() {
		return html`

		${ isServer  &&this.fullBody ? this.renderFullBodyColorPicker() : this.renderDropDownColorPicker()}
      
    `;
	}

	handleColorChanged(event: CustomEvent) {
		this.color = event.detail.value;
		this.dispatchEvent(
			new CustomEvent('color-changed', {
			detail: {
				value: this.color
				},
		})
			)
		
	}
}

customElements.define('hy-color-picker', ColorPicker);
