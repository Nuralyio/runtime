import { ComponentElement } from '$store/component/interface';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import "./SizePaddingMarginLabel/SizePaddingMarginLabel";
import "./SizePaddingMarginValue/SizePaddingMarginValue";

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
        <div >
        <size-padding-margin-label></size-padding-margin-label> 
        <size-padding-margin-value .component=${this.component}></size-padding-margin-value>
        </div>
        `;
    }
}
