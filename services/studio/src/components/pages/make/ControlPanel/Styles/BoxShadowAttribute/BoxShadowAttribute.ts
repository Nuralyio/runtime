import { LitElement, html, css } from 'lit';
import "./BoxShadowLabel/BoxShadowLabel";
import "./BoxShadowValue/BoxShadowValue";
import { property } from 'lit/decorators.js';
import type { ComponentElement } from '$store/component/interface';
import { updateComponentAttributes } from '$store/component/action';
export class BoxShadowAttribute extends LitElement {
    @property()
    component : ComponentElement;
    static override styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    override render() {
        return html`
        <attribute-box-shadow-label></attribute-box-shadow-label>
        <attribute-box-shadow-value .component=${{...this.component}}
        @box-shadow-changed=${(e: any) => {
             updateComponentAttributes(this.component.id, {
              'box-shadow': e.detail.value,
            });
         }}
        ></attribute-box-shadow-value>
        `
    }
}
customElements.define('attribute-box-shadow-attribute', BoxShadowAttribute);