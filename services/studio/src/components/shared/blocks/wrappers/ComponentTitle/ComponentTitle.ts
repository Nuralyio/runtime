import { setDraggingComponentInfo } from "$store/actions/component";
import { type ComponentElement } from "$store/component/interface";
import { $context, getVar } from "$store/context";
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("component-title")
export class ComponentTitle extends LitElement {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  selectedComponents: string[] = [];

  @state()
  isDragInitiator = false;

  static styles = css`
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
      margin-top: -20px;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    $context.subscribe(() => {
      this.selectedComponents = getVar("global", "selectedComponents")?.value || [];
    });
  }

  emitEvent(value: boolean) {
    const submitEvent = new CustomEvent("dragInit", {
      detail: { value },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(submitEvent);
  }

  render() {
    const displayStyle = this.selectedComponents.includes(this.component.uuid) ? "block" : "none";

    return html`
      <span
        style=${styleMap({ display: displayStyle })}
        @mousedown=${this.handleMouseDown}
        @mouseup=${this.handleMouseUp}
        class="component-name"
      >
        ${this.component.name}
      </span>
    `;
  }

  handleMouseDown(e: Event) {
    this.isDragInitiator = true;
    this.emitEvent(this.isDragInitiator);
    setDraggingComponentInfo({
      componentId: this.component?.uuid,
      blockInfo: {
        height: this.component.style.height,
        width: this.component.style.width,
      },
    });
  }

  handleMouseUp(e: Event) {
    this.isDragInitiator = false;
    this.emitEvent(this.isDragInitiator);
    setDraggingComponentInfo(null);
  }
}
