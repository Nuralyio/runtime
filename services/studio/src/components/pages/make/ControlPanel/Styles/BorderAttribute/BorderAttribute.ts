import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import"./BorderLabel/BorderLabel";
import"./BorderValue/BorderValue";
import type { ComponentElement } from '$store/component/interface';
import { updateComponentAttributes } from '$store/component/action';

@customElement('border-attribute')
export class BorderAttribute extends LitElement {

	@property({ type: Object })
	component: ComponentElement;

    static override styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    override render() {
        return html`
        <attribute-border-label></attribute-border-label>
        <attribute-border-value 

       @border-radius-changed=${(e: CustomEvent) => {
       	 updateComponentAttributes(this.component.id, {
              'border-radius': e.detail.value,
            });
       }}
        .component=${{...this.component}}></attribute-border-value>
        `
    }
}
