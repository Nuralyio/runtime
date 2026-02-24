import { html, LitElement, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { NuralyUIBaseMixin } from '@nuralyui/common/mixins';
import styles from "./image.style.js";
import { ImageFit } from "./image.types.js";

@customElement('nr-image')
export class NrImageElement extends NuralyUIBaseMixin(LitElement) {
  static override styles = styles;

  @property({ type: String })
  src!: string;

  @property({ type: String })
  fallback?: string;

  @property({ type: String })
  width = 'auto';

  @property({ type: String })
  height = 'auto';

  @property({ type: String })
  alt = '';

  @property({ type: Boolean })
  previewable = false;

  @property({ type: String })
  fit?: ImageFit;

  @property({ type: Boolean, reflect: true })
  block = false;

  @state()
  private currentSrc = '';

  @state()
  private showPreview = false;

  @state()
  private hasError = false;

  private readonly defaultFallback = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAxMjAgMTIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNFRkYxRjMiLz4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzMuMjUwMyAzOC40ODE2QzMzLjI2MDMgMzcuMDQ3MiAzNC40MTk5IDM1Ljg4NjQgMzUuODU0MyAzNS44NzVIODMuMTQ2M0M4NC41ODQ4IDM1Ljg3NSA4NS43NTAzIDM3LjA0MzEgODUuNzUwMyAzOC40ODE2VjgwLjUxODRDODUuNzQwMyA4MS45NTI4IDg0LjU4MDcgODMuMTEzNiA4My4xNDYzIDgzLjEyNUgzNS44NTQzQzM0LjQxNTggODMuMTIzNiAzMy4yNTAzIDgxLjk1NyAzMy4yNTAzIDgwLjUxODRWMzguNDgxNlpNODAuNTAwNiA0MS4xMjUxSDM4LjUwMDZWNzcuODc1MUw2Mi44OTIxIDUzLjQ3ODNDNjMuOTE3MiA1Mi40NTM2IDY1LjU3ODggNTIuNDUzNiA2Ni42MDM5IDUzLjQ3ODNMODAuNTAwNiA2Ny40MDEzVjQxLjEyNTFaTTQzLjc1IDUxLjYyNDlDNDMuNzUgNTQuNTI0NCA0Ni4xMDA1IDU2Ljg3NDkgNDkgNTYuODc0OUM1MS44OTk1IDU2Ljg3NDkgNTQuMjUgNTQuNTI0NCA1NC4yNSA1MS42MjQ5QzU0LjI1IDQ4LjcyNTQgNTEuODk5NSA0Ni4zNzQ5IDQ5IDQ2LjM3NDlDNDYuMTAwNSA0Ni4zNzQ5IDQzLjc1IDQ4LjcyNTQgNDMuNzUgNTEuNjI0OVoiIGZpbGw9IiM2ODc3ODciLz4NCjwvc3ZnPg==';

  override willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has('src')) {
      this.currentSrc = this.src;
      this.hasError = false;
    }
  }

  private handleError() {
    this.hasError = true;
    this.dispatchEvent(new CustomEvent('nr-image-error', {
      bubbles: true,
      composed: true,
      detail: { error: `Error loading image: ${this.currentSrc}`, src: this.currentSrc }
    }));
    if (this.fallback && this.currentSrc !== this.fallback && this.currentSrc !== this.defaultFallback) {
      this.currentSrc = this.fallback;
    } else if (this.currentSrc !== this.defaultFallback) {
      this.currentSrc = this.defaultFallback;
    }
  }

  private handleLoad() {
    this.hasError = false;
    this.dispatchEvent(new CustomEvent('nr-image-load', {
      bubbles: true,
      composed: true,
      detail: { src: this.currentSrc }
    }));
  }

  private showPreviewModal() {
    if (this.previewable && !this.hasError) {
      this.showPreview = true;
      this.dispatchEvent(new CustomEvent('nr-image-preview-open', {
        bubbles: true,
        composed: true,
        detail: { src: this.currentSrc }
      }));
    }
  }

  private closePreviewModal() {
    this.showPreview = false;
    this.dispatchEvent(new CustomEvent('nr-image-preview-close', {
      bubbles: true,
      composed: true,
      detail: { src: this.currentSrc }
    }));
  }

  override render() {
    const containerClasses = {
      'image-container': true,
      'image--previewable': this.previewable,
      'image--error': this.hasError
    };
    const imageStyles: Record<string, string> = {
      width: typeof this.width === 'number' ? `${this.width}px` : this.width,
      height: typeof this.height === 'number' ? `${this.height}px` : this.height,
    };
    if (this.fit) {
      imageStyles['object-fit'] = this.fit;
    }
    return html`
      <div class=${classMap(containerClasses)}>
        <img
          src=${this.currentSrc}
          alt=${this.alt}
          style=${styleMap(imageStyles)}
          @error=${this.handleError}
          @load=${this.handleLoad}
          @click=${this.showPreviewModal}
        />
        ${this.showPreview ? html`
          <div class="preview-modal" @click=${this.closePreviewModal}>
            <button class="preview-close" @click=${this.closePreviewModal} aria-label="Close preview">×</button>
            <img src="${this.currentSrc}" alt="${this.alt}" />
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'nr-image': NrImageElement;
  }
}
