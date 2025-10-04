import { type ComponentElement } from "@shared/redux/store/component/interface.ts";
import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../BaseElement.ts";
import { styles } from "./TextLabel.style.ts";
import { ref, } from "lit/directives/ref.js";
import "@nuralyui/label";

@customElement("text-label-block")
export class TextLabelBlock extends BaseElementBlock {
  static styles = styles;
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  isEditable = false;


  constructor() {
    super();

  
    this.registerCallback("innerAlignment", (value: any) => {
      if (this.closestGenericComponentWrapper) {
        if (this.inputHandlersValue?.innerAlignment === "end") {
          this.closestGenericComponentWrapper.style.marginLeft = "auto";
        } else {
          this.closestGenericComponentWrapper.style.marginLeft = "unset";
        }
      }
    });
  }


  override renderComponent() {
    return html`
    <!-- ${this.inputHandlersValue.value} -->
     <hy-label
     class="${`drop-${this.component.uuid}`}"
     @input=${(e) => {
       const eventData = { ['value']: { type: 'string', value: e.target.innerText } };
      this.executeEvent("onInput", e, eventData);
          // updateComponentAttributes(this.component.application_id, this.component.uuid, "input", eventData);
     }}
          ${ref(this.inputRef)}
            id=${this.component.uuid}
            contentEditable="${this.isEditable}"
            style=${styleMap({ ...this.getStyles(), "--text-label-font-size": this.getStyles().fontSize })}
            @click=${(e) => {
        this.executeEvent("onClick", e);
      }}
            @mouseenter=${(e) => {
        this.executeEvent("onMouseEnter");

      }}
            @mouseleave=${() => {
        this.executeEvent("onMouseLeave");

      }}
      
            @dblclick=${(e) => {
        e.preventDefault();
        this.isEditable = true;
      }}>${this.inputHandlersValue.value || "Text label"} </hy-label>
    `;
  }
}