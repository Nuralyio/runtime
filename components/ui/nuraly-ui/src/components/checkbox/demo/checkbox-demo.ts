import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('hy-checkbox-demo')
export class CheckBoxDemo extends LitElement {
    static override styles = [
        css`
           .customized {
		  --hy-checkbox-checked-color: #006;
		  --hy-checkbox-unchecked-color: #f66;
		  --hy-checkbox-fill-color: #fcc;
		  --hy-checkbox-unchecked-fill-color: #666;
		  --hy-checkbox-label-color: #c57;
		  --hy-checkbox-font-weight: bold;
		  font-size: 1.5em;
		}
        @media (prefers-color-scheme: dark) {
               .customized {
          --hy-checkbox-checked-color: #006;
          --hy-checkbox-unchecked-color: #f66;
          --hy-checkbox-fill-color: #fcc;
          --hy-checkbox-unchecked-fill-color: #666;
          --hy-checkbox-label-color: #c57;
          --hy-checkbox-font-weight: bold;
          font-size: 1.5em;
        }
        }
        `
    ];

    override render() {
        return html`
        <hy-checkbox>Accept the terms and conditions</hy-checkbox>
        <hr>
        <hy-checkbox checked class="customized">Mark as urgent</hy-checkbox>
        <hr>
        <hy-checkbox disabled>Checkbox disabled</hy-checkbox>
        <hr>
        <hy-checkbox></hy-checkbox> 
        <hr>
        <style>
        .big {
          --hy-checkbox-size: 32px;
        }
        </style>
        <hy-checkbox class="big">Big checkbox!!</hy-checkbox>
        <style>
        .small {
          --hy-checkbox-size: 16px;
        }
        </style>
        <br>
        <hy-checkbox class="small">Small checkbox!!</hy-checkbox>

        `;
    }
}
