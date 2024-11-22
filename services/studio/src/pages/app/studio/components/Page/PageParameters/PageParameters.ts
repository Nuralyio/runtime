import { type PageElement } from '$store/handlers/pages/interfaces/interface.ts';
import { $currentPage } from '$store/page.ts';
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import "../Attributes/BackgroundColorAttribute/BackgroundColorAttribute.ts";
import "../Attributes/DefaultPageParameter/DefaultPageParameter.ts";
import "./MetaInfos.ts";
@customElement('page-parameters')
export class PageParameters extends LitElement {
  
  
    static styles = [
        css`
            :host {
                display: block;
            }
            * {
                padding: 0;
                margin: 10px;
            }
        `
    ];

    @state()
    currentPage: PageElement;

    constructor() {
        super();
        /*$currentPage.subscribe((currentPage) => {
            this.currentPage = currentPage;
        })*/
    }

    render() {
        return html`<div>
                <page-meta-infos  .page=${{ ...this.currentPage }}></page-meta-infos>
                <attribute-page-background-color .page=${{ ...this.currentPage }}></attribute-page-background-color>
                <attribute-page-default .page=${{ ...this.currentPage }}></attribute-page-default>
        </div>`;
    }
}
