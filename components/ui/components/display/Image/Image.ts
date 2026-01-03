import { html, css, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";

import "@nuralyui/image";

@customElement("image-block")
export class ImageBlock extends BaseElementBlock {
  static styles = [css`
    :host {
      display: block;
    }
    .image-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      min-height: 200px;
      min-width: 200px;
      border-radius: 8px;
      border: 2px dashed #cbd5e1;
      gap: 12px;
      box-sizing: border-box;
    }
    .image-placeholder nr-icon {
      --nuraly-icon-size: 48px;
    }
  `];

  @property({ type: Object })
  component: ComponentElement;
  isDarkMode: boolean;

  override connectedCallback() {
    super.connectedCallback();
    this.isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
      this.isDarkMode = event.matches;
      this.requestUpdate();
    });
  }

  renderComponent() {
    const fallbackStyles = this.getStyles();
    const imageStyles = this.getStyles() || {};
    const imageStyleHandlers = this.component?.style_handlers ? Object.fromEntries(
      Object.entries(this.component?.style_handlers).filter(([key, value]) => value)) : {};

    const imageSrc = this.isDarkMode
      ? this.resolvedInputs?.darkSrc ?? this.resolvedInputs?.src
      : this.resolvedInputs?.src;

    // Show placeholder when no image source
    if (!imageSrc) {
      return html`
        <div
          ${ref(this.inputRef)}
          class="image-placeholder"
          style=${styleMap({
            width: imageStyleHandlers?.width || imageStyles?.width || '100%',
            height: imageStyleHandlers?.height || imageStyles?.height || '200px',
          })}
          @click=${(e: MouseEvent) => this.executeEvent("onClick", e)}
        >
          <nr-icon name="image"></nr-icon>
          <nr-label>No image source</nr-label>
        </div>
      `;
    }

    return html`
      <nr-image
        ${ref(this.inputRef)}
        style=${styleMap({
          ...this.getStyles(),
          "display": "block",
          "--nuraly-image-local-border-top-left-radius": fallbackStyles?.["border-top-left-radius"] ?? "",
          "--nuraly-image-local-border-top-right-radius": fallbackStyles?.["border-top-right-radius"] ?? "",
          "--nuraly-image-local-border-bottom-left-radius": fallbackStyles?.["border-bottom-left-radius"] ?? "",
          "--nuraly-image-local-border-bottom-right-radius": fallbackStyles?.["border-bottom-right-radius"] ?? "",
        })}
        .src=${imageSrc}
        .fallback=${this.resolvedInputs?.fallback ?? nothing}
        .previewable=${this.resolvedInputs?.previewable ?? false}
        .fit=${this.resolvedInputs?.fit ?? nothing}
        .block=${this.resolvedInputs?.block ?? false}
        .width=${imageStyleHandlers?.width || imageStyles?.width}
        .height=${imageStyleHandlers?.height || imageStyles?.height}
        .alt=${this.resolvedInputs?.alt ?? "image"}
        @click=${(e: MouseEvent) => this.executeEvent("onClick", e)}
        @nr-image-error=${(e: Event) => this.executeEvent("onError", e)}
        @nr-image-load=${(e: Event) => this.executeEvent("onLoad", e)}
        @nr-image-preview-open=${(e: Event) => this.executeEvent("onPreviewOpen", e)}
        @nr-image-preview-close=${(e: Event) => this.executeEvent("onPreviewClose", e)}
      >
      </nr-image>
    `;
  }
}
