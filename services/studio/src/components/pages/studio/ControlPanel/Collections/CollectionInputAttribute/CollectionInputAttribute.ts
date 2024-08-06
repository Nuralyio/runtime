import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import "./CollectionInputLabel/CollectionInputLabel"
import "./CollectionInputValue/CollectionInputValue"
import { type ComponentElement } from "$store/component/interface";
@customElement("parameter-collection-input-attribute")
export class CollectionInputAttributes extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  static styles = [
    css`
      .container {
        display: block;
        flex-direction: row;
      }
      .first_column {
      }
    `,
  ];

  render() {
    return html` <div class="container">
      <collection-input-label
        class="first_column"
      ></collection-input-label>
      <collection-input-value-handler
      .flat=${true}
        .component=${this.component}
        @parametersUpdate=${(event: CustomEvent) => {
          const {
            detail: { value },
          } = event;
          /*updateComponentParameters(this.component.uuid, {
            value,
          });*/
        }}
        class="column"
      ></collection-input-value-handler>
    </div>`;
  }
}
