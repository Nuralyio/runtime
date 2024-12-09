import { html, css, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

@customElement('nr-chatbot')
export class NrChatbot extends LitElement {
  @property({type: Array}) messages: {sender: string; text: string; timestamp: string}[] = [];
  @property() currentInput = '';
  @property() isBotTyping = false;
  @property({type: Array}) suggestions: string[] = [];
  @property() chatStarted = false;
  @property() isRTL = true;

  @property() loadingIndicator = 'dots';
  @property() loadingText = 'Bot is typing...';

  static override styles = css`
    :host {
      display: block;
      font-family: 'Arial', sans-serif;
      max-width: 100%;
      height: 100%;
      box-sizing: border-box;
    }

    .chatbox {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
      border-radius: 9px;
      overflow: hidden;
    }

    .messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: linear-gradient(135deg, #f3f4f6, #ffffff);
      max-height: calc(100% - 60px);
    }

    .suggestion-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 12px;
    }

    :host([dir='rtl']) .suggestion-container {
      flex-direction: row-reverse;
    }

    .suggestion {
      display: inline-flex;
      align-items: center;
      background-color: #2663eb1a;
      padding: 8px 12px;
      border-radius: 16px;
      cursor: pointer;
      font-size: 14px;
      color: #333333;
      white-space: nowrap;
      transition: background-color 0.3s ease;
    }

    .suggestion:hover {
      background-color: #d5d8f1;
    }

    .message {
      display: inline-block;
      max-width: 70%;
      padding: 12px;
      border-radius: 16px;
      position: relative;
      word-wrap: break-word;
      font-size: 14px;
    }

    .user {
      background-color: #d1f7e0;
      align-self: flex-end;
      border-radius: 16px 16px 0 16px;
      color: #1b4332;
    }

    .bot {
      background-color: #eef1f6;
      align-self: flex-start;
      border-radius: 16px 16px 16px 0;
      color: #333333;
    }

    :host([dir='ltr']) .user {
      align-self: flex-end;
      border-radius: 16px 16px 0 16px;
    }

    :host([dir='ltr']) .bot {
      align-self: flex-start;
      border-radius: 16px 16px 16px 0;
    }

    :host([dir='rtl']) .user {
      align-self: flex-start;
      border-radius: 16px 16px 16px 0;
    }

    :host([dir='rtl']) .bot {
      align-self: flex-end;
      border-radius: 16px 0 16px 16px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #eef1f6;
      border-radius: 16px;
      padding: 10px;
      color: #888888;
      font-style: italic;
    }
    .loading.dots {
      width: 50px;
      display: flex;
      justify-content: space-between;
    }

    .dots span {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin: 0 1px;
      background-color: #888888;
      border-radius: 50%;
      animation: bounce 1.2s infinite;
    }

    .dots span:nth-child(2) {
      animation-delay: 0.2s;
    }

    .dots span:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes bounce {
      0%,
      80%,
      100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    .input-box {
      display: flex;
      border-top: 1px solid #ddd;
      background-color: #f9fafb;
      flex-direction: row;
    }

    :host([dir='rtl']) .input-box {
      flex-direction: row-reverse;
    }

    input {
      flex: 1;
      padding: 12px;
      font-size: 14px;
      border: none;
      outline: none;
      background-color: #f9fafb;
      border-top-left-radius: 16px;
      border-top-right-radius: 16px;
      max-width: 100%;
    }

    :host([dir='rtl']) input {
      text-align: right;
    }

    button {
      background-color: #2563eb;
      color: white;
      border: none;
      padding: 12px 16px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      border-bottom-right-radius: 4px;
    }

    :host([dir='rtl']) button {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 0;
    }

    button:hover {
      background-color: #1d4ed8;
    }

    .suggestion-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-bottom: 12px;
    }

    :host([dir='rtl']) .suggestion-container {
      flex-direction: row-reverse;
    }

    .suggestion {
      display: inline-block;
      background-color: #2663eb1a;
      padding: 8px 12px;
      border-radius: 16px;
      cursor: pointer;
      font-size: 14px;
      color: #333333;
      white-space: nowrap;
    }

    .suggestion:hover {
      background-color: #d5d8f1;
    }

    .timestamp {
      font-size: 10px;
      color: #888888;
      margin-top: 4px;
    }
  `;

  override render() {
    return html`
      <div class="chatbox" dir=${this.isRTL ? 'rtl' : 'ltr'}>
        <div class="messages">
          ${this.messages.map(
            (message) => html`
              <div class="message ${message.sender}">
                <div>${message.text}</div>
                <div class="timestamp">${message.timestamp}</div>
              </div>
            `
          )}
          ${!this.chatStarted
            ? html`
                <div class="suggestion-container">
                  ${this.suggestions.map(
                    (suggestion) => html`
                      <div class="suggestion" @click=${() => this.handleSuggestionClick(suggestion)}>${suggestion}</div>
                    `
                  )}
                </div>
              `
            : nothing}
          ${this.isBotTyping
            ? html`
                <div
                  class=${classMap({
                    message: true,
                    loading: true,
                    dots: this.loadingIndicator === 'dots',
                  })}
                >
                  ${this.loadingIndicator === 'text'
                    ? this.loadingText
                    : html`
                        <div class="dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      `}
                </div>
              `
            : ''}
        </div>
        <div class="input-box">
          <input
            type="text"
            .value=${this.currentInput}
            @input=${this.handleInputChange}
            @keydown=${this.handleKeyDown}
            placeholder=${this.isRTL ? 'اكتب رسالتك...' : 'Type your message...'}
            dir=${this.isRTL ? 'rtl' : 'ltr'}
          />
          <button @click=${this.handleSendMessage}>${this.isRTL ? 'إرسال' : 'Send'}</button>
        </div>
      </div>
    `;
  }

  private handleInputChange(e: Event) {
    const input = (e.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent('input-change', {detail: input}));
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.handleSendMessage();
    }
  }

  private handleSendMessage() {
    this.dispatchEvent(new CustomEvent('send-message'));
  }

  private handleSuggestionClick(suggestion: string) {
    this.dispatchEvent(new CustomEvent('suggestion-click', {detail: suggestion}));
  }
}