import { html, css, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

@customElement('nr-chatbot-container')
export class NrChatbotContainer extends LitElement {
  @state() private isChatbotOpen: boolean = false; // State to control visibility
  @state() private isNewConversation: boolean = false; // State for starting a new conversation

  static override styles = css`
      :host {
          display: block;
          font-family: 'Arial', sans-serif;
          position: relative;
          width: 100%;
          height: 100%;
      }

      .bottom-right-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
      }

      .fab-button {
          background-color: #2563eb;
          color: white;
          width: 70px; /* Increased size */
          height: 70px; /* Increased size */
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          font-size: 30px; /* Increased font size */
          transition: background-color 0.3s ease;
          user-select: none; /* Disable text selection */
      }

      .fab-button:hover {
          background-color: #1d4ed8;
      }

      .chatbox-container {
          position: fixed;
          bottom: 95px; /* Adjusted to place chatbox just above FAB button */
          right: 17px;
          width: 400px; /* Default size */
          height: 550px; /* Default size */
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9998;
          display: flex;
          flex-direction: column;
          background-color: white;
          border-radius: 8px;
          transition: opacity 0.1s ease-in-out, visibility 0.1s ease-in-out;
          opacity: 0;
          visibility: hidden;
      }

      .chatbox-container.open {
          opacity: 1;
          visibility: visible;
      }

      .chatbox-header {
          display: flex;
          justify-content: flex-end;
          padding: 10px; /* Increased padding */
          background-color: #2563eb; /* Set background color to match the button */
          border-top-left-radius: 8px; /* Rounded top left corner */
          border-top-right-radius: 8px; /* Rounded top right corner */
      }

      .icon-button {
          background: none;
          border: none;
          cursor: pointer;
          width: 32px; /* Increased icon size */
          height: 32px; /* Increased icon size */
          transition: transform 0.3s ease;
      }

      .icon-button:hover {
          transform: scale(1.3); /* Increased scale on hover */
      }

      .icon-button svg {
          width: 100%;
          height: 100%;
          fill: white; /* Changed to white for contrast */
      }

      .icon-button:hover svg {
      }

      /* Mobile responsive styles */
      @media (max-width: 768px) {
          .chatbox-container {
              right : 10px;
              width: calc(100% - 20px); /* Full width minus 20px */
              height: 90%; /* Full height */
              bottom: 100px; /* Position the chatbox at the bottom */
          }

          .fab-button {
              bottom: 20px; /* Keep the FAB button at the bottom */
          }
      }
  `;

  override render() {
    return html`
      <div class="bottom-right-container">
        <div class="fab-button" @click=${this.toggleChatbot}>
          ${this.isChatbotOpen ? '−' : '+'}
        </div>

        <div class="chatbox-container ${this.isChatbotOpen ? 'open' : ''}">
          <div class="chatbox-header">
            <button class="icon-button" @click=${this.closeChatbot}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 11H5V9h14v2z"/></svg>
            </button>
          </div>
          <nr-chatbot></nr-chatbot>
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