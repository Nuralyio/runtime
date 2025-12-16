import { html, css, nothing } from "lit";
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
export class VideoBlock extends BaseElementBlock {
  static styles = [css`
    .video-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #64748b;
      min-height: 200px;
      border-radius: 8px;
      border: 2px dashed #cbd5e1;
      gap: 12px;
    }
    .video-placeholder nr-icon {
      --nuraly-icon-size: 48px;
    }
    .video-placeholder span {
      font-size: 14px;
      font-weight: 500;
    }
  `];

  @property({ type: Object })
  component: ComponentElement;

  renderComponent() {
    const videoStyles = this.getStyles() || {};
    const videoStyleHandlers = this.component?.styleHandlers ? Object.fromEntries(
      Object.entries(this.component?.styleHandlers).filter(([key, value]) => value)) : {};

    const src = this.inputHandlersValue?.src;
    const poster = this.inputHandlersValue?.poster;
    const autoplay = this.inputHandlersValue?.autoplay ?? false;
    const controls = this.inputHandlersValue?.controls ?? true;
    const loop = this.inputHandlersValue?.loop ?? false;
    const muted = this.inputHandlersValue?.muted ?? false;
    const preload = this.inputHandlersValue?.preload ?? 'metadata';

    // Show placeholder when no video source
    if (!src) {
      return html`
        <div
          ${ref(this.inputRef)}
          class="video-placeholder"
          style=${styleMap({
            ...this.getStyles(),
            width: videoStyleHandlers?.width || videoStyles?.width || '100%',
            height: videoStyleHandlers?.height || videoStyles?.height || '200px',
          })}
          @click=${(e: MouseEvent) => this.executeEvent("onClick", e)}
        >
          <nr-icon name="video"></nr-icon>
          <nr-label>No video source</nr-label>
        </div>
      `;
    }

    return html`
      <nr-video-player
        ${ref(this.inputRef)}
        style=${styleMap({
          ...this.getStyles(),
          "display": "block",
        })}
        .src=${src}
        .poster=${poster ?? nothing}
        .autoplay=${autoplay}
        .controls=${controls}
        .loop=${loop}
        .muted=${muted}
        .preload=${preload}
        .width=${videoStyleHandlers?.width || videoStyles?.width}
        .height=${videoStyleHandlers?.height || videoStyles?.height}
        @click=${(e: MouseEvent) => this.executeEvent("onClick", e)}
        @play=${(e: Event) => this.executeEvent("onPlay", e)}
        @pause=${(e: Event) => this.executeEvent("onPause", e)}
        @ended=${(e: Event) => this.executeEvent("onEnded", e)}
        @loadeddata=${(e: Event) => this.executeEvent("onLoad", e)}
        @error=${(e: Event) => this.executeEvent("onError", e)}
        @timeupdate=${(e: Event) => {
          const video = e.target as HTMLVideoElement;
          this.executeEvent("onTimeUpdate", e, {
            currentTime: video?.currentTime,
            duration: video?.duration
          });
        }}
        @volumechange=${(e: Event) => {
          const video = e.target as HTMLVideoElement;
          this.executeEvent("onVolumeChange", e, {
            volume: video?.volume,
            muted: video?.muted
          });
        }}
      >
      </nr-video-player>
    `;
  }
}
