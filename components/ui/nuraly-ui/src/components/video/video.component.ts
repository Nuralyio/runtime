import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { NuralyUIBaseMixin } from "../../shared/base-mixin.js";
import styles from "./video.style.js";
import { VideoPreload } from "./video.types.js";

@customElement('nr-video')
export class NrVideoElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  @property({ type: String })
  src!: string;

  @property({ type: String })
  poster?: string;

  @property({ type: String })
  width = 'auto';

  @property({ type: String })
  height = 'auto';

  @property({ type: Boolean })
  autoplay = false;

  @property({ type: Boolean })
  loop = false;

  @property({ type: Boolean })
  muted = false;

  @property({ type: Boolean })
  controls = true;

  @property({ type: String })
  preload: VideoPreload = VideoPreload.Metadata;

  @property({ type: Boolean })
  previewable = false;

  @property({ type: Boolean, reflect: true })
  block = false;

  @state()
  private showPreview = false;

  @state()
  private hasError = false;

  private readonly defaultFallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDI0MCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI0MCIgaGVpZ2h0PSIxODAiIGZpbGw9IiNGM0Y0RjYiLz48cGF0aCBkPSJNMTg4IDY5TDE2OCA4OU0xNjggNjlMMTg4IDg5IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+';

  private handleError() {
    this.hasError = true;
    this.dispatchEvent(new CustomEvent('nr-video-error', {
      bubbles: true,
      composed: true,
      detail: { error: `Error loading video: ${this.src}`, src: this.src }
    }));
  }

  private handlePlay() {
    this.dispatchEvent(new CustomEvent('nr-video-play', {
      bubbles: true,
      composed: true,
      detail: { src: this.src }
    }));
  }

  private handlePause() {
    this.dispatchEvent(new CustomEvent('nr-video-pause', {
      bubbles: true,
      composed: true,
      detail: { src: this.src }
    }));
  }

  private handleEnded() {
    this.dispatchEvent(new CustomEvent('nr-video-ended', {
      bubbles: true,
      composed: true,
      detail: { src: this.src }
    }));
  }

  private showPreviewModal() {
    if (this.previewable && !this.hasError) {
      this.showPreview = true;
      this.dispatchEvent(new CustomEvent('nr-video-preview-open', {
        bubbles: true,
        composed: true,
        detail: { src: this.src }
      }));
    }
  }

  private closePreviewModal() {
    this.showPreview = false;
    this.dispatchEvent(new CustomEvent('nr-video-preview-close', {
      bubbles: true,
      composed: true,
      detail: { src: this.src }
    }));
  }

  override render() {
    const containerClasses = {
      'video-container': true,
      'video--error': this.hasError
    };

    const videoStyles: Record<string, string> = {
      width: typeof this.width === 'number' ? `${this.width}px` : this.width,
      height: typeof this.height === 'number' ? `${this.height}px` : this.height,
    };

    if (this.hasError) {
      return html`
        <div class=${classMap(containerClasses)}>
          <div class="error-message">
            <img class="error-icon" src=${this.defaultFallback} alt="Video error" />
            <p>Unable to load video</p>
          </div>
        </div>
      `;
    }

    return html`
      <div class=${classMap(containerClasses)}>
        <video
          style=${styleMap(videoStyles)}
          ?autoplay=${this.autoplay}
          ?loop=${this.loop}
          ?muted=${this.muted}
          ?controls=${this.controls}
          preload=${this.preload}
          poster=${this.poster || ''}
          @error=${this.handleError}
          @play=${this.handlePlay}
          @pause=${this.handlePause}
          @ended=${this.handleEnded}
        >
          <source src=${this.src} />
          Your browser does not support the video tag.
        </video>
        ${this.previewable ? html`
          <button class="preview-button" @click=${this.showPreviewModal}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v3a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v3a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v3a.5.5 0 0 0 1 0V6z"/>
              <path d="M2 1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H2zM1 2a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2z"/>
            </svg>
            Fullscreen
          </button>
        ` : ''}
        ${this.showPreview ? html`
          <div class="preview-modal" @click=${this.closePreviewModal}>
            <button class="preview-close" @click=${this.closePreviewModal} aria-label="Close preview">×</button>
            <video
              ?autoplay=${true}
              ?loop=${this.loop}
              ?muted=${this.muted}
              controls
              poster=${this.poster || ''}
            >
              <source src=${this.src} />
            </video>
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-video': NrVideoElement;
  }
}
