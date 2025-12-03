import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import "@nuralyui/image";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
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
      <nr-image
      ${ref(this.inputRef)}
      style=${
        styleMap({
          ...this.getStyles(),
        "display": "block",
        "--nuraly-image-local-border-top-left-radius": fallbackStyles?.["border-top-left-radius"] ?? "",
              "--nuraly-image-local-border-top-right-radius": fallbackStyles?.["border-top-right-radius"] ?? "",
              "--nuraly-image-local-border-bottom-left-radius": fallbackStyles?.["border-bottom-left-radius"] ?? "",
              "--nuraly-image-local-border-bottom-right-radius": fallbackStyles?.["border-bottom-right-radius"] ?? "",
      })
      }
        .src=${imageSrc ?? nothing}
        .fallback=${this.inputHandlersValue.fallback ?? nothing}
        .previewable=${this.inputHandlersValue.previewable ?? false}
        .fit=${this.inputHandlersValue.fit ?? nothing}
        .block=${this.inputHandlersValue.block ?? false}
        .width=${imageStyleHandlers?.width ? imageStyleHandlers.width : imageStyles?.width}
        .height=${imageStyleHandlers?.height ? imageStyleHandlers?.height : imageStyles?.height}
        .alt=${this.inputHandlersValue.alt ?? "image"}
        @click=${(e: MouseEvent) => {
          this.executeEvent("onClick", e);
        }}
        @nr-image-error=${(e) => {
          this.executeEvent("onError", e);
        }}
        @nr-image-load=${(e) => {
          this.executeEvent("onLoad", e);
        }}
        @nr-image-preview-open=${(e) => {
          this.executeEvent("onPreviewOpen", e);
        }}
        @nr-image-preview-close=${(e) => {
          this.executeEvent("onPreviewClose", e);
        }}
      >
      </nr-image>
    `;
  }
}