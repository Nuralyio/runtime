import { ComponentType, type ComponentElement } from "$store/component/interface.ts";
import { $context, getVar } from "$store/context.ts";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { setDraggingComponentInfo } from "$store/actions/component/setDraggingComponentInfo.ts";

@customElement("component-title")
export class ComponentTitle extends LitElement {
  static styles = css`
    .component-name {
      position: absolute;
      display: none;
      /* z-index: 7; */
      padding: 1px;
   
      color: white;
      font-weight: 300;
      font-size: 14px;
      cursor: pointer;
      user-select: none;
      margin-top: -22px;
    }
  `;
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  hoveredComponent: ComponentElement;
  @state()
  selectedComponents: string[] = [];
  @state()
  isDragInitiator = false;

  override connectedCallback() {
    super.connectedCallback();
    this.setupSubscriptions();
  }

  setupSubscriptions() {
    $context.subscribe(() => {
    });
  }

  emitEvent(value: boolean) {
    const submitEvent = new CustomEvent("dragInit", {
      detail: { value },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(submitEvent);
  }

  render() {
    const displayStyle = this.selectedComponents.includes(this.component.uuid)
    ||  this.hoveredComponent?.uuid === this.component.uuid ? "block" : "none";

    return html`
      <span
        style=${styleMap({ display: displayStyle })}
        @mousedown=${this.handleMouseDown}
        @mouseup=${this.handleMouseUp}
        class="component-name"
      >
        <span style=${
          styleMap({
            padding:" 4px",
            background: "#2395ff"
          })
        }> ${this.component.name} </span>
        ${this.selectedComponents.includes(this.component.uuid)&& this.component.component_type ===ComponentType.Container ? html`
        <micro-app
      style=${styleMap({
      })}
    uuid="1" componentToRenderUUID="app_insert_top_bar2"> </micro-app>
          `: nothing}
      </span>
     
    `;
  }

  handleMouseDown(e: Event) {
    this.isDragInitiator = true;
    this.emitEvent(this.isDragInitiator);
    setDraggingComponentInfo({
      componentId: this.component?.uuid,
      blockInfo: {
        height: this.component.style?.height,
        width: this.component.style?.width
      }
    });
  }

  handleMouseUp(e: Event) {
    this.isDragInitiator = false;
    this.emitEvent(this.isDragInitiator);
    setDraggingComponentInfo(null);
  }
}
