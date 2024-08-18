import { type ComponentElement } from "$store/component/interface";
import { html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../BaseElement";
import { executeEventHandler } from "core/engine";
import { updateComponentAttributes } from "$store/actions/component";
import { styles } from "./TextLabel.style";

const isServer = typeof window === 'undefined';

@customElement("text-label-block")
export class TextLabelBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  currentPageViewPort: string;

  @state()
  viewPortStyles: any;

  static styles = styles

  @state()
  components: ComponentElement[];

  @state()
  thisvalue;

  constructor() {
    super();
  }

  handleBodyClick = (event) => {
    const label = this.shadowRoot.querySelector("label");
    if (label && !label.contains(event.target)) {
      this.isEditable = false;
    }
  };

  @property({ type: Object })
  item: any;

  updated(changedProperties) {
    changedProperties.forEach((_oldValue, propName) => {
      if (propName === "component" || propName === "item") {
      }
    });
  }

  handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      alert('')
      this.isEditable = true;
      this.requestUpdate();
    }
  };

  render() {
    const labelStyles = this.component?.style || {};
    return html`
      ${true ? html`
        <label
          id=${this.component.uuid}
          contentEditable="${this.isEditable}"
          style=${styleMap({ ...labelStyles })}
          @click=${() => {
          if (this.component.event?.onClick) {
            executeEventHandler(this.component, 'event', 'onClick');
          }
        }}
              @mouseenter=${(e) => {
          if (this.component?.event?.mouseEnter) {
            executeEventHandler(this.component, 'event', 'mouseEnter');
          }
        }}
        @mouseleave=${(e) => {
          if (this.component?.event?.mouseLeave) {
            executeEventHandler(this.component, 'event', 'mouseLeave')
          }
        }}
          @blur=${(e) => {
          this.isEditable = false;
          this.requestUpdate();
          updateComponentAttributes(this.component.applicationId, this.component.uuid, "input", {
            value: {
              type: "value",
              value: e.target.textContent,
            },
          });
        }}
          @dblclick=${(e) => {
          e.preventDefault();
          this.isEditable = true;
          this.requestUpdate();
        }}
          
        >${this.inputHandlersValue.value ?? "Text label"}</label>
      ` : nothing}
    `;
  }
}