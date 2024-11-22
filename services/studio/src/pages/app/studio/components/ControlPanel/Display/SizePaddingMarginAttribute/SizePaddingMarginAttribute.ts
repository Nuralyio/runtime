import { type  ComponentElement } from '$store/component/interface.ts';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import "./SizePaddingMarginValue/SizePaddingMarginValue.ts";

@customElement('size-padding-margin-attribute')
export class SIzePAddingMArginATtribute extends LitElement {
    @property({ type: Object })
    component: ComponentElement;
    static styles = [
        css`
          .container {
              border: 1px solid #bcbcbc;
              border-radius: 3px;
          }
        `
    ];

    render() {
        return html`
        <div>
        <span>Position</span>
        <size-padding-margin-value 
        @attributeUpdate=${(event: CustomEvent) => {
           // todo: implment this
        }} .component=${{...this.component}}></size-padding-margin-value>
        </div>
        `;
    }
}
