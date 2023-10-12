import { PageElement } from '$store/page/interface';
import { $currentPage } from '$store/page/store';
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js'
import "../Attributes/BackgroundColorAttribute/BackgroundColorAttribute";
@customElement('page-parameters')
export class PageParameters extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
            }
        `
    ];
    currentPage: PageElement;

    constructor() {
        super();
        $currentPage.subscribe((currentPage) => {
            this.currentPage = currentPage;
        })
    }

    render() {
        return html`<div>
                <attribute-page-background-color .page=${{ ...this.currentPage }}></attribute-page-background-color>
        </div>`;
    }
}
