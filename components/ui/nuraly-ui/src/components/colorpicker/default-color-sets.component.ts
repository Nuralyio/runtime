import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import './color-holder.component.js';

export class DefaultColorSets extends LitElement {


	@property({ type: Array })
	defaultColorSets: Array<string> = [];

	static override styles = [
		css`
			.default-color-sets-container{
				display: flex;
				flex-wrap: wrap;
				justify-content: center;
				padding: 0 0 5px 0;
			}
			.default-color-sets-container * {
				margin: 3px;
			}

			@media (prefers-color-scheme: dark) {
				.default-color-sets-container {
					background: #2d2d2d;
				}

			}

        `
	];

	handleColorClick (_e: any, color: string) {
		this.dispatchEvent(new CustomEvent('color-click', {
			detail: {
				value: color
			}
		}));
	}

	override render() {
		return html` 
			<div class="default-color-sets-container">

        ${this.defaultColorSets.map(color => html`<hy-colorholder-box   @click=${(e:any) =>this.handleColorClick(e, color)}  color="${color}"></hy-colorholder-box>`)}
        </div>
        `;

	}
}
customElements.define('hy-default-color-sets', DefaultColorSets);