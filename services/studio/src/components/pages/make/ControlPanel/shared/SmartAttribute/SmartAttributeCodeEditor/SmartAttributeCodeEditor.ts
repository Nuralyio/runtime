import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("smart-attribute-codeeditor")
export class SmartAttributeCodeeditor extends LitElement {
  @property()
  value: string;
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];
  @property({ type: Object })
  containerStyle: any = {
    width: "500px",
    height: "250px",
    border: "solid 1px gray",
  };

  render() {
    return html` <div style=${styleMap(this.containerStyle)}>
      <code-editor
        theme="vs"
        @change=${(event: CustomEvent) => {
          const {
            detail: { value },
          } = event;
          const submitEvent = new CustomEvent("change", {
            detail: { value },
            bubbles: true,
            composed: true,
          });
          this.dispatchEvent(submitEvent);
        }}
        .code=${this.value}
        language="mylang"
      >
      </code-editor>
    </div>`;
  }
}
