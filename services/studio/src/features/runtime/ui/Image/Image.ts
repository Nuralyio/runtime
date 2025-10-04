import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/image";
import { type ComponentElement } from "@shared/redux/store/component/component.interface.ts";
import { BaseElementBlock } from "../BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";


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
   const fallbackStyles = this.getStyles();

    const imageStyles = this.getStyles() || {};
    const imageStyleHandlers = this.component?.styleHandlers ? Object.fromEntries(
      Object.entries(this.component?.styleHandlers).filter(([key, value]) => value)) : {};
      const imageSrc = this.isDarkMode 
      ? this.inputHandlersValue.darkSrc ?? this.inputHandlersValue.src 
      : this.inputHandlersValue.src;
    return html`
      <hy-image
      ${ref(this.inputRef)}
      @click=${(e: MouseEvent) => {
        this.executeEvent("onClick", e);
      }}
      style=${
        styleMap({
          ...this.getStyles(),
        "display": "block",
        "--hybrid-image-local-border-top-left-radius": fallbackStyles?.["border-top-left-radius"] ?? "",
              "--hybrid-image-local-border-top-right-radius": fallbackStyles?.["border-top-right-radius"] ?? "",
              "--hybrid-image-local-border-bottom-left-radius": fallbackStyles?.["border-bottom-left-radius"] ?? "",
              "--hybrid-image-local-border-bottom-right-radius": fallbackStyles?.["border-bottom-right-radius"] ?? "",
      },
          
        )
      }
        .src=${imageSrc ?? nothing}
        .source=${this.inputHandlersValue.srouce ?? nothing}
        .previewable=${this.inputHandlersValue.previewable ?? nothing}
        .fallback=${this.inputHandlersValue.fallback ?? nothing}
        .width=${imageStyleHandlers?.width ? imageStyleHandlers.width : imageStyles?.width}
        .height=${imageStyleHandlers?.height ? imageStyleHandlers?.height : imageStyles?.height}
        .alt=${this.inputHandlersValue.alt ?? "image"}
      >
      </hy-image>
    `;
  }
}