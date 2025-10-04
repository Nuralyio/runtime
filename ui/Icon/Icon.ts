import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/select";
import { styleMap } from "lit/directives/style-map.js";
import { type ComponentElement } from "@shared/redux/store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import "@nuralyui/icon";
import { ref } from "lit/directives/ref.js";


@customElement("icon-block")
export class IconBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  @property({ type: Object })
  item: any;

  constructor() {
    super();
    this.registerCallback("icon", () => {
    });
  }
  override async connectedCallback() {
    await super.connectedCallback();

  }

  renderComponent() {

    return html`
      <hy-icon
      ${ref(this.inputRef)}
     
      @click=${(e) => {
         this.executeEvent("onClick", e);
    
    }}
        .name=${this.inputHandlersValue.icon ?? "smile"}
        style=${styleMap({ display:"block",...this.getStyles(), 
          "--hybrid-icon-width" : this.getStyles().width,
          "--hybrid-icon-height" : this.getStyles().height
        })}>
      </hy-icon>
    `;
  }
}