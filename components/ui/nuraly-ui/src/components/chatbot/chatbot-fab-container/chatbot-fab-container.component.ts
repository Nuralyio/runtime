import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { property } from 'lit/decorators.js';
import {chatbotIcon} from '../assets/chatbotIcon';
import {closeButtonIcon} from '../assets/closeButtonIcon';
 import styles from './chatbot-fab-container.style';

@customElement('nr-chatbot-container')
export class NrChatbotContainer extends LitElement {
  @state() private isChatbotOpen = false;
  @state() private isRTL = false;

  @property({ type: Boolean }) set direction(value: boolean) {
    this.isRTL = value;
  }

  static override styles = styles;

  override render() {
    return html`
      <div class="bottom-container">
        <div
          class="fab-button ${this.isRTL ? 'rtl' : 'ltr'}"
          @click=${this.toggleChatbot}
        >
          ${chatbotIcon}
        </div>

        <div class="chat-box-container ${this.isChatbotOpen ? 'open' : ''} ${this.isRTL ? 'rtl' : 'ltr'}">
          <div class="chat-box-header">
            <button class="icon-button" @click=${this.closeChatbot}>
              ${closeButtonIcon}
            </button>
          </div>
          <slot></slot>
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