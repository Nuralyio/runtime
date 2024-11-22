import { LitElement, html, css } from 'lit';
import "./ResponsiveSelectionLabel/ResponsiveSelectionLabel.ts";
import "./ResponsiveSelectionValue/ResponsiveSelectionValue.ts";
import styles from "./ResponsiveParameter.style.ts";

export class ResponsiveParameter extends LitElement {
      static styles = styles;


    override render() {
        return html`
        <div class="container">
        	<responsive-selectionl-parameter-label class="first_column"></responsive-selectionl-parameter-label>
        	<responsive-selectionl-parameter-value></responsive-selectionl-parameter-value>
        
        </div>
        `;
    }
}
customElements.define('responsive-selectionl-parameter', ResponsiveParameter);