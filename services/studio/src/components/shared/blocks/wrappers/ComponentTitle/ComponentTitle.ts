import { setDraggingComponentInfo } from "$store/actions/component";
import { type ComponentElement } from "$store/component/interface";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("component-title")
export class ComponentTitle extends LitElement {
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  selectedComponent: ComponentElement;

  @state()
  isDragintiator = false;

  static styles = [
    css`
      .component-name {
        position: absolute;
        display: none;
        z-index: 7;
        padding: 1px;
        background: #2395ff;
        color: white;
        font-weight: 300;
        font-size: 14px;
        cursor: pointer;
        user-select: none;
        margin-top: -22px;
      }
    `,
  ];

  emitEvent(value) {
    const submitEvent = new CustomEvent("dragInit", {
      detail: { value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(submitEvent);
  }
  render() {
    return html` <span
      style=${styleMap({
        display:
          this.selectedComponent?.uuid === this.component.uuid ? "block" : "none",
      })}
      @mousedown=${(e: Event) => {
        this.isDragintiator = true;
        this.emitEvent(this.isDragintiator);
        setDraggingComponentInfo({
          componentId: this.component?.uuid,
          blockInfo: {
            height: this.component.style.height,
            width: this.component.style.width,
          },
        });
      }}
      @mouseup=${(e: Event) => {
       // e.preventDefault();
        this.isDragintiator = false;
        this.emitEvent(this.isDragintiator);
        setDraggingComponentInfo(null);
      }}
      class="component-name"
      >${this.component.name}</span
    >`;
  }
}
