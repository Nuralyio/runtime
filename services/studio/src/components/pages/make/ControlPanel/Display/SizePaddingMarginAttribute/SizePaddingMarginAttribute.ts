import { type  ComponentElement } from '$store/component/interface';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import "./SizePaddingMarginLabel/SizePaddingMarginLabel";
import "./SizePaddingMarginValue/SizePaddingMarginValue";
import { updateComponentAttributes } from '$store/component/action';

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
        <div style="margin-left : 15px">
        <size-padding-margin-label></size-padding-margin-label> 
        <size-padding-margin-value 
        @attributeUpdate=${(event: CustomEvent) => {
           updateComponentAttributes(this.component.uuid, {
              [ event.detail.key]: event.detail.value,
            });
        }} .component=${{...this.component}}></size-padding-margin-value>
        </div>
        `;
    }
}
