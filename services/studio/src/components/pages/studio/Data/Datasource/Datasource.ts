import { LitElement, html, css } from 'lit';
import "./DatasourceCreate/DatasourceCreate";
import "./DatasourceList/DatasourceList";


export class Datasouces extends LitElement {
    static override styles = [
        css`
            :host {
                display: block;
            }
        `
    ];

    override render() {
        return html`<data-source-create></data-source-create>
        <datasource-list></datasource-list>
        `
    }
}
customElements.define('data-soucres', Datasouces);