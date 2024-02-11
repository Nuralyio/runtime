import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./BackgroundColorLabel/BackgroundColorLabel";
import "./BackgroundColorValue/BackgroundColorValue";
import styles from "./BackgroundColorAttribute.style";
import { type PageElement } from "$store/page/interface";
import { updatePageStyleAttributes } from "$store/page/action";

@customElement("attribute-page-background-color")
export class AttributeColor extends LitElement {
  @property({ type: Object })
  page: PageElement;


  @property({ type: Boolean })
  slim: boolean = false;


  static styles = styles;
  changeHandler(event: CustomEvent) {
    updatePageStyleAttributes(this.page.uuid, {
      backgroundColor: event.detail.value,
    });
  }
  render() {
    return html`<div class="container">
      ${this.slim ? nothing : html`<attribute-background-color-label class="first_column"></attribute-background-color-label>` }
      <attribute-backgroundcolor-value-handler
        @attributeUpdate=${this.changeHandler}
        .page=${{ ...this.page }}
      ></attribute-backgroundcolor-value-handler>
    </div> `;
  }
}
