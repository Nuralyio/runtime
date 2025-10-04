import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/document";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";


@customElement("document-block")
export class ImageBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  isDarkMode: boolean;



  renderComponent() {

    const documentStyles = this.getStyles() || {};
    const documentStyleHandlers = this.component?.styleHandlers ? Object.fromEntries(
      Object.entries(this.component?.styleHandlers).filter(([key, value]) => value)) : {};
      const documentSrc = this.isDarkMode 
      ? this.inputHandlersValue.darkSrc ?? this.inputHandlersValue.src 
      : this.inputHandlersValue.src;
    return html`
      <hy-document-viewer
      ${ref(this.inputRef)}
      @click=${(e: MouseEvent) => {
        this.executeEvent("onClick", e);
      }}
      style=${
        styleMap({
          ...this.getStyles(),
      },
          
        )
      }
        .src=${documentSrc ?? nothing}
        .previewable=${this.inputHandlersValue.previewable ?? nothing}
        .width=${documentStyleHandlers?.width ? documentStyleHandlers.width : documentStyles?.width}
        .height=${documentStyleHandlers?.height ? documentStyleHandlers?.height : documentStyles?.height}
      >
      </hy-document-viewer>
    `;
  }
}