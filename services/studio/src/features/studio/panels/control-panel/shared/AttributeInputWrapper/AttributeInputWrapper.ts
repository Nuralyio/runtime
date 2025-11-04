import { type ComponentElement } from "@shared/redux/store/component/component.interface";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, type Ref, ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("attribute-input-wrapper")
export class AttributeInputWrapper extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-block;
      }
      .has-smart-attribute {
        position: absolute;
        background-color: grey;
        opacity: 0.8;
        z-index: 100;
        text-align: center;
      }
    `
  ];
  @property({ type: Object })
  component: ComponentElement;
  @property()
  attribute: string;
  @state()
  inputRef: Ref<HTMLInputElement> = createRef();
  @state()
  wrapperStyle: any = {};

  connectedCallback(): void {
    super.connectedCallback();
    setTimeout(() => {
      requestAnimationFrame(() => {
        this.wrapperStyle = {
          width: this.inputRef?.value?.getBoundingClientRect().width + "px",
          height: this.inputRef?.value?.getBoundingClientRect().height + "px"
        };
      });
    }, 500);
  }

  render() {
    return html` ${this.component?.styleHandlers && this.component?.styleHandlers[this.attribute] &&
    this.wrapperStyle?.width
      ? html`<div
            class="has-smart-attribute"
            style=${styleMap({ ...this.wrapperStyle })}
          >
            <nr-icon name="code" style="vertical-align: middle;"></nr-icon>
          </div>`
      : ""}
      <div ${ref(this.inputRef)} style="display : flex">
        <slot></slot>
      </div>`;
  }
}
