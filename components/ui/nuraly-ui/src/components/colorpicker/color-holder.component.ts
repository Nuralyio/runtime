import { LitElement, html, css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

export class ColerHolderBox extends LitElement {

	@property({type:String})
	color: string = '#FFFFFF';


	@property({type:String})
	size: string = 'default';
    

    static override styles = [
        css`
            .color-holder-container{
            	border: 1px solid gray;
            	border-radius: 5px;
                cursor: pointer;
            }
            .default-size{
            	width: 30px;
            	height: 25px;
			}
			.large-size{
				width: 60px;
            	height: 30px;
			}
        `
    ];

    override render() {
        return html`
        	<div class="${classMap({
        		"color-holder-container": true,
        		"large-size": this.size === 'large',
        		"default-size": this.size === 'default'
        	})}" style="background-color: ${this.color}"></div>
        `;
    }
}
customElements.define('hy-colorholder-box', ColerHolderBox);