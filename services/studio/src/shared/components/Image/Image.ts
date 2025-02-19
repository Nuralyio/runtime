import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/image";
import { type ComponentElement } from "$store/component/interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";


@customElement("image-block")
export class ImageBlock extends BaseElementBlock {
  @property({ type: Object })
  component: ComponentElement;
  isDarkMode: boolean;

  async connectedCallback(): Promise<void> {
     await super.connectedCallback();
     this.isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
     window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
      this.isDarkMode = event.matches;
      this.requestUpdate();
    });
  }

  renderComponent() {
    const imageStyles = this.calculatedStyles || {};
    const imageStyleHandlers = this.component?.styleHandlers ? Object.fromEntries(
      Object.entries(this.component?.styleHandlers).filter(([key, value]) => value)) : {};
      const imageSrc = this.isDarkMode 
      ? this.inputHandlersValue.darkSrc ?? this.inputHandlersValue.src 
      : this.inputHandlersValue.src;
    return html`
      <hy-image
      style=${
        styleMap({
          ...this.componentStyles}
        )
      }
        .src=${imageSrc ?? nothing}
        .source=${this.inputHandlersValue.srouce ?? nothing}
        .fallback=${this.inputHandlersValue.fallback ?? nothing}
        .width=${imageStyleHandlers?.width ? imageStyleHandlers.width : imageStyles?.width}
        .height=${imageStyleHandlers?.height ? imageStyleHandlers?.height : imageStyles?.height}
        .alt=${this.inputHandlersValue.alt ?? "image"}
      >
      </hy-image>
    `;
  }
}