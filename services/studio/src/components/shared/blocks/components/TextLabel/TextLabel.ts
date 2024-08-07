import { type ComponentElement } from "$store/component/interface";
import { html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../BaseElement";
import { executeEventHandler } from "core/engine";

const isServer = typeof window === 'undefined';

@customElement("text-label-block")
export class TextLabelBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;

  @state()
  currentPageViewPort: string;

  @state()
  viewPortStyles: any;

  static styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @state()
  isEditable = false;

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
      // Click is outside the label, make it non-editable
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

  render() {
    const labelStyles = this.component?.style || {};
    return html` 
    ${labelStyles.display ? html` <label
      id=${this.component.uuid}
      contentEditable="${this.isEditable}"
      style=${styleMap(labelStyles)}
      @click=${(e) => {
          if (this.component.event.onClick) {
            executeEventHandler(this.component, 'event', 'onClick');
          }
        }}
      @dblclick=${(e) => {
          e.preventDefault();

          this.isEditable = true;
          this.requestUpdate();
        }}
    >
      ${this.inputHandlersValue.value ?? "Text label"}
    </label>`: nothing}
      `}

}
