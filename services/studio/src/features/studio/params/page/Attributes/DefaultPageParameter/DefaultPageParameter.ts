import { $currentApplication } from "@shared/redux/store/apps";
import type { PageElement } from "@shared/redux/handlers/pages/page.interface";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { updateApplication } from "@shared/redux/actions/application/updateApplication";

@customElement("attribute-page-default")
export class AttributePageDefault extends LitElement {
  static override styles = [
    css`
            .container {
                display: flex;
                flex-direction: row;
            }
            .first_column {
                width: 60%;
            }
        `
  ];
  @property({ type: Object })
  page: PageElement;
  @state()
  currentApplicaton: any;
  @state()
  currentPage: any;

  constructor() {
    super();
    $currentApplication.subscribe((currentApplication) => {
      this.currentApplicaton = currentApplication;
    });
    /**$currentPage.subscribe((currentPage) => {
     this.currentPage = currentPage;
     })**/


  }

  override render() {
    return html`
            <div class="container">
                <div class="first_column">
                    Default page
                    </div>
                    <div>
                        ${this.currentPage.uuid === this.currentApplicaton.default_page_uuid ?
      html`This page is set to Default` :
      html`
                            This page is not set to Default <br/><br/>
                        <hy-button @click=${() => {
        updateApplication({
          default_page_uuid: this.currentPage.uuid
        });
      }}>Set as default</hy-button>`}</div>
                    </div>
                    `;
  }
}