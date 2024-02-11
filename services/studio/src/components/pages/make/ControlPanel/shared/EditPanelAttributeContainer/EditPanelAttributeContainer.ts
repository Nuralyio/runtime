import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('editpanel-attribute-container')
export class EditPanelAttributeContainer extends LitElement {
    static override styles = [
        css`
       
            .container {
                display: flex;
                flex-direction: row;
            }
            .first_column {
                width: 30%;
            }
            .second_column {
                width: 70%;
                display: flex;
            flex-direction: row;
            align-items: center;              
            }

        `
    ];

    override render() {
        return html`
            <div class="container">
                <div class="first_column">
                    <slot name="firstColumn"></slot>
                </div>
                <div class="second_column">
                    <slot name="secondColumn"></slot>
                </div>
            </div>
       `;
    }
}