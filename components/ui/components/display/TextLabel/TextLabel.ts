import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { styles } from "./TextLabel.style.ts";
import { ref } from "lit/directives/ref.js";

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
        if (this.resolvedInputs?.innerAlignment === "end") {
          this.closestGenericComponentWrapper.style.marginLeft = "auto";
        } else {
          this.closestGenericComponentWrapper.style.marginLeft = "unset";
        }
      }
    });
  }


  override renderComponent() {
    
    return html`
     <nr-label
     class="${`drop-${this.component.uuid}`}"
     @input=${(e) => {
       const eventData = { ['value']: { type: 'string', value: e.target.innerText } };
      this.executeEvent("onInput", e, eventData);
     }}
          ${ref(this.inputRef)}
            id=${this.component.uuid}
            .size=${this.resolvedInputs.size ?? "medium"}
            .variant=${this.resolvedInputs.variant || 'default'}
            .required=${this.resolvedInputs.required || false}
            .disabled=${this.resolvedInputs.state === "disabled"}
            .for=${this.resolvedInputs.for || nothing}
            .value=${this.resolvedInputs.value || ""}
            contentEditable="${this.isEditable}"
            @click=${(e) => {
        this.executeEvent("onClick", e);
      }}
            @mouseenter=${(e) => {
        this.executeEvent("onMouseEnter", e);
      }}
            @mouseleave=${(e) => {
        this.executeEvent("onMouseLeave", e);
      }}
      
            @dblclick=${(e) => {
        e.preventDefault();
        this.isEditable = true;
      }}>${this.resolvedInputs.value || "Text label"}</nr-label>
    `;
  }
}
