import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement('nr-video-player')
export class HyVideoPlayer extends LitElement {
  @property()
  src!: string;

  @property()
  width = 'auto';

  @property()
  height = 'auto';

  @property({ type: Object })
  fallback = null;

  @property({ type: Boolean })
  previewable = false;

  @state()
  private isFullscreen = false;

  @state()
  private hasError = false;

  // Updated fallback with a broken video icon
  defaultFallBack = `data:image/svg+xml;base64,${btoa(`
    <svg width="240" height="180" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="240" height="180" fill="#F3F4F6"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M120 82C109.507 82 101 90.5066 101 101C101 111.493 109.507 120 120 120C130.493 120 139 111.493 139 101C139 90.5066 130.493 82 120 82ZM105 101C105 92.7157 111.716 86 120 86C128.284 86 135 92.7157 135 101C135 109.284 128.284 116 120 116C111.716 116 105 109.284 105 101Z" fill="#9CA3AF"/>
      <path d="M120 90V96" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
      <path d="M120 106V112" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
      <path d="M106.343 87.3431L110.686 91.6863" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
      <path d="M129.314 110.314L133.657 114.657" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
      <path d="M95 101H101" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
      <path d="M139 101H145" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
      <path d="M106.343 114.657L110.686 110.314" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
      <path d="M129.314 91.6863L133.657 87.3431" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
      <rect x="70" y="60" width="100" height="4" rx="2" fill="#9CA3AF"/>
      <path d="M82 45C82 43.3431 83.3431 42 85 42H155C156.657 42 158 43.3431 158 45V60H82V45Z" fill="#9CA3AF"/>
      <rect x="70" y="138" width="100" height="4" rx="2" fill="#9CA3AF"/>
      <path d="M89 60H151C152.657 60 154 61.3431 154 63V138H86C84.3431 138 83 136.657 83 135V66C83 62.6863 85.6863 60 89 60Z" fill="#E5E7EB"/>
      <path d="M188 69L168 89M168 69L188 89" stroke="#9CA3AF" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `)}`;

  static override styles = css`
    :host {
      display: block;
    }
    
    .video-container {
      position: relative;
      overflow: hidden;
      min-height: 100px;
      background-color: black;
    }
    
    .video-element {
      width: 100%;
      height: 100%;
      display: block;
    }

    .fallback-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #F3F4F6;
      padding: 20px;
      box-sizing: border-box;
    }

    .fallback-image {
      max-width: 240px;
      width: 100%;
      height: auto;
      margin-bottom: 16px;
    }

    .error-message {
      font-family: system-ui, -apple-system, sans-serif;
      color: #6B7280;
      font-size: 14px;
      text-align: center;
      max-width: 300px;
      margin: 0;
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
      background-color: black;
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
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  override render() {
    return html`
      <div class="video-container" style="width:${this.width}; height:${this.height};">
        ${this.hasError ? html`
          <div class="fallback-container">
            <img
              class="fallback-image"
              src=${this.fallback || this.defaultFallBack}
              alt="Video failed to load"
            />
            <p class="error-message">This video cannot be played.</p>
          </div>
        ` : html`
          <video
            class="video-element"
            src="${this.src}"
            controls
            @error=${this._handleError}
          ></video>
          
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
        `}
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
            ${this.hasError ? html`
              <div class="fallback-container" style="max-width: 100%; max-height: calc(100vh - 64px);">
                <img
                  class="fallback-image"
                  src=${this.fallback || this.defaultFallBack}
                  alt="Video failed to load"
                />
                <p class="error-message">This video cannot be played.</p>
              </div>
            ` : html`
              <video
                class="video-element"
                src="${this.src}"
                controls
                @error=${this._handleError}
                style="max-width: 100%; max-height: calc(100vh - 64px);"
              ></video>
            `}
          </div>
        </div>
      ` : ''}
    `;
  }

  _handleError(e: Event) {
    console.error('Video loading error:', e);
    this.hasError = true;
    this.dispatchEvent(new CustomEvent('onError', {
      bubbles: true,
      composed: true,
      detail: {
        error: `Error loading video: Format not supported or file cannot be loaded`
      }
    }));
  }

  _openFullscreen() {
    this.isFullscreen = true;
    document.body.style.overflow = 'hidden';
  }

  _closeFullscreen() {
    this.isFullscreen = false;
    document.body.style.overflow = '';
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.isFullscreen) {
      document.body.style.overflow = '';
    }
  }
}