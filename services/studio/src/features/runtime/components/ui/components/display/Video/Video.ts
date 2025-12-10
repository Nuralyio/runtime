import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { type ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { styleMap } from "lit/directives/style-map.js";
import { ref } from "lit/directives/ref.js";

// Safely import @nuralyui/video
try {
  await import("@nuralyui/video");
} catch (error) {
  console.warn('[@nuralyui/video] Package not found or failed to load.');
}



@customElement("video-block")
export class ImageBlock extends BaseElementBlock {
    @property({ type: Object })
    component: ComponentElement;
    isDarkMode: boolean;


    renderComponent() {

        const imageStyles = this.getStyles() || {};
        const imageStyleHandlers = this.component?.styleHandlers ? Object.fromEntries(
            Object.entries(this.component?.styleHandlers).filter(([key, value]) => value)) : {};
        const imageSrc = this.isDarkMode
            ? this.inputHandlersValue.darkSrc ?? this.inputHandlersValue.src
            : this.inputHandlersValue.src;
        return html`
      <nr-video-player
      ${ref(this.inputRef)}
      @click=${(e: MouseEvent) => {
                this.executeEvent("onClick", e);
            }}
      style=${styleMap({
                ...this.getStyles(),
                "display": "block",
            },

            )
            }
        .src=${imageSrc ?? nothing}
        .previewable=${this.inputHandlersValue.previewable ?? nothing}
        .width=${imageStyleHandlers?.width ? imageStyleHandlers.width : imageStyles?.width}
        .height=${imageStyleHandlers?.height ? imageStyleHandlers?.height : imageStyles?.height}
      >
      </<nr-video-player>
    `;
    }
}
