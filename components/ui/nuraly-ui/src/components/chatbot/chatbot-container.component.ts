import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { property } from 'lit/decorators.js';

@customElement('nr-chatbot-container')
export class NrChatbotContainer extends LitElement {
  @state() private isChatbotOpen: boolean = false;
  @state() private isRTL: boolean = false;

  @property({ type: Boolean }) set direction(value: boolean) {
    this.isRTL = value;
  }

  static override styles = css`
      :host {
          display: block;
          font-family: 'Arial', sans-serif;
          position: relative;
          width: 100%;
          height: 100%;
      }

      .bottom-container {
          position: fixed;
          bottom: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
      }

      .fab-button {
          position: fixed;
          bottom: 20px;
          background-color: #2563eb;
          color: white;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          font-size: 30px;
          transition: background-color 0.3s ease, transform 0.3s ease, right 0.3s ease,
          left 0.3s ease;
          user-select: none;
      }

      .fab-button:hover {
          background-color: #1d4ed8;
          transform: scale(1.1);
      }

      .fab-button svg {
          width: 30px;
          height: 30px;
          fill: white;
      }

      .fab-button.ltr {
          right: 20px;
      }

      .fab-button.rtl {
          left: 20px;
      }

      .chatbox-container {
          position: fixed;
          bottom: 95px;
          width: 400px;
          height: 550px;
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9998;
          display: flex;
          flex-direction: column;
          background-color: white;
          border-radius: 8px;
          transition: opacity 0.1s ease-in-out, visibility 0.1s ease-in-out,
          transform 0.3s ease, width 0.3s ease, height 0.3s ease;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
      }

      .chatbox-container.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
      }

      .chatbox-container.ltr {
          right: 10px;
      }

      .chatbox-container.rtl {
          left: 10px;
      }

      .chatbox-header {
          display: flex;
          justify-content: flex-end;
          padding: 10px;
          background-color: #2563eb;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
      }

      .icon-button {
          background: none;
          border: none;
          cursor: pointer;
          width: 32px;
          height: 32px;
          transition: transform 0.3s ease;
      }

      .icon-button:hover {
          transform: scale(1.3);
      }

      .icon-button svg {
          width: 100%;
          height: 100%;
          fill: white;
      }

      @media (max-width: 768px) {
          .chatbox-container {
              right: 10px;
              width: calc(100% - 20px);
              height:  calc(100% - 130px);
              bottom: 100px;
          }

          .chatbox-container.open {
              transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out,
              transform 0.5s ease, width 0.5s ease, height 0.5s ease;
          }

          .fab-button {
              bottom: 20px;
              transition: transform 0.5s ease, right 0.5s ease, left 0.5s ease;
          }
      }
  `;

  override render() {
    return html`
      <div class="bottom-container">
        <div
          class="fab-button ${this.isRTL ? 'rtl' : 'ltr'}"
          @click=${this.toggleChatbot}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M11.999 0c-2.25 0-4.5.06-6.6.21a5.57 5.57 0 0 0-5.19 5.1c-.24 3.21-.27 6.39-.06 9.6a5.644 5.644 0 0 0 5.7 5.19h3.15v-3.9h-3.15c-.93.03-1.74-.63-1.83-1.56-.18-3-.15-6 .06-9 .06-.84.72-1.47 1.56-1.53 2.04-.15 4.2-.21 6.36-.21s4.32.09 6.36.18c.81.06 1.5.69 1.56 1.53.24 3 .24 6 .06 9-.12.93-.9 1.62-1.83 1.59h-3.15l-6 3.9V24l6-3.9h3.15c2.97.03 5.46-2.25 5.7-5.19.21-3.18.18-6.39-.03-9.57a5.57 5.57 0 0 0-5.19-5.1c-2.13-.18-4.38-.24-6.63-.24zm-5.04 8.76c-.36 0-.66.3-.66.66v2.34c0 .33.18.63.48.78 1.62.78 3.42 1.2 5.22 1.26 1.8-.06 3.6-.48 5.22-1.26.3-.15.48-.45.48-.78V9.42c0-.09-.03-.15-.09-.21a.648.648 0 0 0-.87-.36c-1.5.66-3.12 1.02-4.77 1.05-1.65-.03-3.27-.42-4.77-1.08a.566.566 0 0 0-.24-.06z"
            />
          </svg>
        </div>

        <div class="chatbox-container ${this.isChatbotOpen ? 'open' : ''} ${this.isRTL ? 'rtl' : 'ltr'}">
          <div class="chatbox-header">
            <button class="icon-button" @click=${this.closeChatbot}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M19 11H5V9h14v2z" />
              </svg>
            </button>
          </div>
          <nr-chatbot .direction="${this.isRTL}"></nr-chatbot>
        </div>
      </div>
    `;
  }

  private toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
  }

  private closeChatbot() {
    this.isChatbotOpen = false;
  }
}