import { LitElement, html, css } from 'lit';

export class AttributeBoxShadowLabel extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    override render() {
        return html``;
    }
}
customElements.define('attribute-box-shadow-label', AttributeBoxShadowLabel);