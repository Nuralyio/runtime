import { LitElement, html, css } from 'lit';

export class BorderLabel extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    override render() {
        return html`Label`;
    }
}
customElements.define('attribute-broder-label', BorderLabel);