import { type ComponentElement } from "$store/component/interface.ts";
import { html, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { BaseElementBlock } from "../BaseElement.ts";
import { styles } from "./TextLabel.style.ts";
import { eventDispatcher } from "@utils/change-detection.ts";
import { ref, } from "lit/directives/ref.js";

@customElement("text-label-block")
export class TextLabelBlock extends BaseElementBlock {
  static styles = styles;
  @property({ type: Object })
  component: ComponentElement;

  @property({ type: Object })
  item: any;

  @state()
  isEditable = false;
  @state()
  currentValue;

  constructor() {
    super();

    this.registerCallback("value", (value: any) => {
      if (value !== undefined)
        if (this.currentValue !== value) {
          this.currentValue = value;

        }
    });
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

  protected firstUpdated(_changedProperties: PropertyValues): void {
    eventDispatcher.on(`component-property-changed:${String(this.component.name)}`, (data) => {
      this.traitInputsHandlers();
    });

  }

  override renderComponent() {
    return html`
     <hy-label
     class="${`drop-${this.component.uuid}`}"
          ${ref(this.inputRef)}
            id=${this.component.uuid}
            contentEditable="${this.isEditable}"
            style=${styleMap({ ...this.calculatedStyles, "--text-label-font-size": this.calculatedStyles.fontSize })}
            @click=${(e) => {
        this.executeEvent("onClick", e);
      }}
            @mouseenter=${(e) => {
        this.executeEvent("mouseEnter");

      }}
            @mouseleave=${() => {
        this.executeEvent("mouseLeave");

      }}
      
            @dblclick=${(e) => {
        e.preventDefault();
        this.isEditable = true;
      }}>${this.currentValue || "Text label"} </hy-label>
    `;
  }
}