import { ComponentType, type ComponentElement } from '../../../../../redux/store/component/component.interface';
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { setDraggingComponentInfo } from '../../../../../redux/actions/component/setDraggingComponentInfo';

@customElement("component-title")
export class ComponentTitle extends LitElement {
  static styles = css`
    .component-name {
      position: absolute;
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
  @state()
  isDragInitiator = false;

  @property({ type: Boolean })
  display: Boolean;

  override connectedCallback() {
    super.connectedCallback();
    this.setupSubscriptions();
  }

  setupSubscriptions() {
   
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
   
    return html`
    ${this.display ? html`
      <span
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
        ${this.component.component_type ===ComponentType.Container && false ? html`
        <micro-app
      style=${styleMap({
      })}
    uuid="1" componentToRenderUUID="app_insert_top_bar2"> </micro-app>
          `: nothing}
      </span>

    `: nothing}
    
     
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
