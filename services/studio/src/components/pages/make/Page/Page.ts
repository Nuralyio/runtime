import { PageElement } from "$store/page/interface";
import { $currentPage, $pages } from "$store/page/store";
import { useStores } from "@nanostores/lit";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./Page.style";
import { $currentPageComponents } from "$store/component/sotre";
import { ComponentElement, ComponentType } from "$store/component/interface";

import "../../../shared/blocks/ComponentWrappers/GenerikWrapper/GenerikWrapper";
import "../../../shared/blocks/ComponentElements/TextInput/TextInput";
import "../../../shared/blocks/ComponentElements/TextLabel/TextLabel";
import "../../../shared/blocks/ComponentElements/Button/Button";

@customElement("content-page")
@useStores($currentPage, $currentPageComponents)
export class PageContent extends LitElement {
  static styles = styles;

  @state()
  currentPage: PageElement;
  @state()
  components: ComponentElement[] = [];
  constructor() {
    super();
    $currentPage.subscribe((currentPage) => {
      this.currentPage = { ...currentPage };
    });
    $currentPageComponents.subscribe((components = []) => {
      this.components = [...components];
    });
  }

  renderComponent(components: ComponentElement[]) {
    return html`
      ${components.map((component: ComponentElement) => {
        switch (component.type) {
          case ComponentType.TextInput:
            return html`<generik-component-wrapper
              .component=${{ ...component }}
            >
              <text-input-block
                .component=${{ ...component }}
              ></text-input-block>
            </generik-component-wrapper>`;
          case ComponentType.TextLabel:
            return html`<generik-component-wrapper
              .component=${{ ...component }}
            >
              <text-label-block
                .component=${{ ...component }}
              ></text-label-block>
            </generik-component-wrapper>`;
          case ComponentType.Button:
            return html`<generik-component-wrapper
              .component=${{ ...component }}
            >
              <button-block .component=${{ ...component }}></button-block>
            </generik-component-wrapper>`;
          default:
            return html``;
        }
      })}
    `;
  }
  render() {
    return html`<div>
      ${this.components?.length
        ? this.renderComponent(this.components)
        : html`<div class="page-empty-message-container">
            <p class="page-empty-message">Add an item from the insert panel</p>
          </div>`}
    </div>`;
  }
}
