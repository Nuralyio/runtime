import { LitElement, PropertyValues, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from './image.style.js';

@customElement('hy-image')
export class HyImage extends LitElement {
  static override styles = styles;

  @property()
  src!: string;

  @property({type : String})
  fallback! : string;

  @property()
  width = 'auto';

  @property()
  height = 'auto';

  @property()
  alt = '';

  @property({ type: Boolean })
  previewable = false;

  @state()
  image = '';

  @state()
  showPreview = false;

  defaultFallBack = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAxMjAgMTIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNFRkYxRjMiLz4NCjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMzMuMjUwMyAzOC40ODE2QzMzLjI2MDMgMzcuMDQ3MiAzNC40MTk5IDM1Ljg4NjQgMzUuODU0MyAzNS44NzVIODMuMTQ2M0M4NC41ODQ4IDM1Ljg3NSA4NS43NTAzIDM3LjA0MzEgODUuNzUwMyAzOC40ODE2VjgwLjUxODRDODUuNzQwMyA4MS45NTI4IDg0LjU4MDcgODMuMTEzNiA4My4xNDYzIDgzLjEyNUgzNS44NTQzQzM0LjQxNTggODMuMTIzNiAzMy4yNTAzIDgxLjk1NyAzMy4yNTAzIDgwLjUxODRWMzguNDgxNlpNODAuNTAwNiA0MS4xMjUxSDM4LjUwMDZWNzcuODc1MUw2Mi44OTIxIDUzLjQ3ODNDNjMuOTE3MiA1Mi40NTM2IDY1LjU3ODggNTIuNDUzNiA2Ni42MDM5IDUzLjQ3ODNMODAuNTAwNiA2Ny40MDEzVjQxLjEyNTFaTTQzLjc1IDUxLjYyNDlDNDMuNzUgNTQuNTI0NCA0Ni4xMDA1IDU2Ljg3NDkgNDkgNTYuODc0OUM1MS44OTk1IDU2Ljg3NDkgNTQuMjUgNTQuNTI0NCA1NC4yNSA1MS42MjQ5QzU0LjI1IDQ4LjcyNTQgNTEuODk5NSA0Ni4zNzQ5IDQ5IDQ2LjM3NDlDNDYuMTAwNSA0Ni4zNzQ5IDQzLjc1IDQ4LjcyNTQgNDMuNzUgNTEuNjI0OVoiIGZpbGw9IiM2ODc3ODciLz4NCjwvc3ZnPg==';

  override willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('fallback') || _changedProperties.has('src')) {
      this.image = this.src;
    }
  }

  private handleError() {
    this.dispatchEvent(new CustomEvent('onError', {
      bubbles: true,
      composed: true,
      detail: {
        error: `error loading image ${this.image}`
      }
    }));

    if (this.fallback && this.image !== this.fallback && this.image != this.defaultFallBack) {
      this.image = this.fallback;
    }
    else if (this.image != this.defaultFallBack) {
      this.image = this.defaultFallBack;
    }
  }

  private _showPreview() {
    if (this.previewable) {
      this.showPreview = true;
    }
  }

  private _closePreview() {
    this.showPreview = false;
  }

  override render() {
    return html`
      <div class="image-container">
        <img
          src=${this.image}
          @error=${this.handleError}
          @click=${this._showPreview}
          style="width:${this.width}; height:${this.height}; cursor: ${this.previewable ? 'pointer' : 'default'}"
          alt=${this.alt}
        />

        ${this.showPreview ? html`
          <div class="preview-modal" @click=${this._closePreview}>
            <button class="preview-close">×</button>
            <img src="${this.image}" alt="${this.alt}" />
          </div>
        ` : ''}
      </div>
    `;
  }
}