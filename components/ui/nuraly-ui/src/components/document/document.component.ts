import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement('hy-document-viewer')
export class HyPdfViewer extends LitElement {
  @property()
  src!: string;

  @property()
  width = 'auto';

  @property()
  height = 'auto';

  @property({type: Object})
  fallback = null;

  @property({ type: Boolean })
  previewable = false;

  @state()
  private isFullscreen = false;

  defaultFallBack = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IS0tIFVwbG9hZGVkIHRvOiBTVkcgUmVwbywgd3d3LnN2Z3JlcG8uY29tLCBHZW5lcmF0b3I6IFNWRyBSZXBvIE1peGVyIFRvb2xzIC0tPg0KPHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAxMjAgMTIwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KPHJlY3Qgd2lkdGg9IjEyMCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNFRkYxRjMiLz4NCjxwYXRoIGQ9Ik01OS40IDYyLjhWODAuNEg0OC4yVjQxLjZINjMuNEM2Ny4xIDQxLjYgNzAuMSA0Mi42IDcyLjQgNDQuN0M3NC43IDQ2LjggNzUuOCA0OS42IDc1LjggNTNDNzUuOCA1Ni41IDc0LjcgNTkuMiA3Mi40IDYxLjNDNzAuMiA2My40IDY3LjIgNjQuNCA2My40IDY0LjRINTkuNFY2Mi44Wk01OS40IDU0LjZINjMuNEM2NSA1NC42IDY2LjMgNTQuMSA2Ny4yIDUzQzY4LjEgNTEuOSA2OC42IDUwLjYgNjguNiA0OUM2OC42IDQ3LjUgNjguMSA0Ni4yIDY3LjIgNDUuMUM2Ni4zIDQ0IDY1IDQzLjQgNjMuNCA0My40SDU5LjRWNTQuNloiIGZpbGw9IiM2ODc3ODciLz4NCjwvc3ZnPg==';

  static override styles = css`
    :host {
      display: block;
    }
    
    .pdf-container {
      position: relative;
      overflow: hidden;
      min-height: 100px;
      background-color: #f5f5f5;
      border: 1px solid #e0e0e0;
    }
    
    .pdf-iframe {
      border: none;
      display: block;
      width: 100%;
      height: 100%;
    }
    
    .preview-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background-color: rgba(255, 255, 255, 0.8);
      border: 1px solid #ccc;
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .preview-button:hover {
      background-color: rgba(255, 255, 255, 1);
    }

    .preview-button svg {
      margin-right: 4px;
    }
    
    .fullscreen-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.95);
      z-index: 9999;
      display: flex;
      flex-direction: column;
    }
    
    .fullscreen-header {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
      background-color: rgba(0, 0, 0, 0.4);
    }
    
    .close-button {
      background-color: white;
      border: none;
      border-radius: 4px;
      padding: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .close-button:hover {
      background-color: #f0f0f0;
    }
    
    .fullscreen-content {
      flex: 1;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .fullscreen-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background-color: white;
    }
  `;

  override render() {
    return html`
      <div class="pdf-container" style="width:${this.width}; height:${this.height};">
        <iframe 
          class="pdf-iframe"
          src="${this.src}" 
          title="PDF Viewer"
          @error=${this._handleError}
        ></iframe>
        
        ${this.previewable ? html`
          <button class="preview-button" @click=${this._openFullscreen}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.5 1H1.5C1.22386 1 1 1.22386 1 1.5V5.5C1 5.77614 1.22386 6 1.5 6C1.77614 6 2 5.77614 2 5.5V2H5.5C5.77614 2 6 1.77614 6 1.5C6 1.22386 5.77614 1 5.5 1Z" fill="currentColor"/>
              <path d="M14.5 1H10.5C10.2239 1 10 1.22386 10 1.5C10 1.77614 10.2239 2 10.5 2H14V5.5C14 5.77614 14.2239 6 14.5 6C14.7761 6 15 5.77614 15 5.5V1.5C15 1.22386 14.7761 1 14.5 1Z" fill="currentColor"/>
              <path d="M5.5 14H2V10.5C2 10.2239 1.77614 10 1.5 10C1.22386 10 1 10.2239 1 10.5V14.5C1 14.7761 1.22386 15 1.5 15H5.5C5.77614 15 6 14.7761 6 14.5C6 14.2239 5.77614 14 5.5 14Z" fill="currentColor"/>
              <path d="M14.5 10C14.2239 10 14 10.2239 14 10.5V14H10.5C10.2239 14 10 14.2239 10 14.5C10 14.7761 10.2239 15 10.5 15H14.5C14.7761 15 15 14.7761 15 14.5V10.5C15 10.2239 14.7761 10 14.5 10Z" fill="currentColor"/>
            </svg>
            Fullscreen
          </button>
        ` : ''}
      </div>
      
      ${this.isFullscreen ? html`
        <div class="fullscreen-overlay">
          <div class="fullscreen-header">
            <button class="close-button" @click=${this._closeFullscreen}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12.5 12.5L3.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="fullscreen-content">
            <iframe 
              class="fullscreen-iframe"
              src="${this.src}" 
              title="Fullscreen PDF"
            ></iframe>
          </div>
        </div>
      ` : ''}
    `;
  }

  _handleError(e: Event) {
    console.error('PDF loading error:', e);
    this.dispatchEvent(new CustomEvent('onError', {
      bubbles: true,
      composed: true,
      detail: {
        error: `Error loading PDF: PDF viewer not supported or file cannot be loaded`
      }
    }));
    
    // Show fallback image when error occurs
    const container = this.shadowRoot?.querySelector('.pdf-container');
    if (container) {
      const iframe = container.querySelector('iframe');
      if (iframe) {
        const img = document.createElement('img');
        img.src = this.fallback || this.defaultFallBack;
        img.alt = "PDF failed to load";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "contain";
        container.replaceChild(img, iframe);
      }
    }
  }

  _openFullscreen() {
    this.isFullscreen = true;
    // Prevent scrolling of the background when fullscreen is active
    document.body.style.overflow = 'hidden';
  }

  _closeFullscreen() {
    this.isFullscreen = false;
    // Restore scrolling when fullscreen is closed
    document.body.style.overflow = '';
  }

  // Clean up when component is removed
  override disconnectedCallback() {
    super.disconnectedCallback();
    // Ensure body scrolling is restored if component is removed while in fullscreen
    if (this.isFullscreen) {
      document.body.style.overflow = '';
    }
  }
}