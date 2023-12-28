import { LitElement, html, isServer } from 'lit';
import { property } from 'lit/decorators.js';
import './color-holder.component.js';
import './default-color-sets.component.js';
import styles from './color-picker.style.js';

export class ColorPicker extends LitElement {

	@property({ type: String })
	color: string = '#67d640';

	@property({ type: Boolean })
	fullBody: boolean = false

	@property({ type: Array })
	defaultColorSets: Array<string> = ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51',  '#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557'];


	static override styles = styles;

	constructor() {
		super();
		if (typeof window !== 'undefined') {
			import('vanilla-colorful');
		}
	}


  copyToClipboard(textToCopy :string) {
    // Create a new text area element
    const textArea = document.createElement('textarea');
    
    // Set the text content to be copied
    textArea.value = textToCopy;
    
    // Append the text area to the document
    document.body.appendChild(textArea);
    
    // Select the text in the text area
    textArea.select();
    
    // Try to copy the selected text to the clipboard
    try {
      document.execCommand('copy');
      console.log('Text copied to clipboard');
    } catch (err) {
      console.error('Unable to copy text to clipboard', err);
    }
    
    // Remove the temporary text area
    document.body.removeChild(textArea);
  }


	renderDropDownColorPicker() {
		return html`
  	 <hy-dropdown
        style="float: right;    position: relative;"
        .customStyles=${{ width: '400px', height: '250px' }}
        placeholder="Select an option"
        .template=${html`
        <style>

				hy-icon {
					cursor: pointer;
				}
				hy-icon:active{
					color: #2a77e3;
				}
				
hex-color-picker::part(saturation) {
  border-radius: 0px 0px 0 0;
}
        </style>
        <div class="class="color-picker-container" > 
        <hy-default-color-sets .defaultColorSets=${this.defaultColorSets}
        @color-click="${this.handleColorChanged.bind(this)}"
        ></hy-default-color-sets>
          <hex-color-picker
	        .color="${this.color}"
	        @color-changed="${this.handleColorChanged.bind(this)}"
	      ></hex-color-picker>
	      <hy-input type="text" .value="${this.color}" @valueChange="${(e: any) => {
	      	this.color = e.detail.value;

	      }}">
	      	<span slot="suffix">
          	<hy-icon name="copy" class="copy-icon" @click=${()=>this.copyToClipboard(this.color)}></hy-icon>
        </span>
	      </hy-input>
	      </div>
        `}
      >
      <hy-colorholder-box slot="label" color="${this.color}"></hy-colorholder-box>
      </hy-dropdown>
  	`;
	}

	renderFullBodyColorPicker() {
		return html`<hex-color-picker
	        .color="${this.color}"
	        @color-changed="${this.handleColorChanged}"
	      ></hex-color-picker>
		`;
	}

	override render() {
		return html`<div class="color-picker-container" style="background-color: red">
		${isServer && this.fullBody ? this.renderFullBodyColorPicker() : this.renderDropDownColorPicker()}
      
		</div>
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