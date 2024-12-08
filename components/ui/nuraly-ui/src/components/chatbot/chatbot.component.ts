import { html, css, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('nr-chatbot')
export class NrChatbot extends LitElement {
  @state() private messages: { sender: string; text: string }[] = [];
  @state() private currentInput: string = '';
  @state() private isBotTyping: boolean = false;

  @property({ type: String }) loadingIndicator: string = 'dots'; // 'text' or 'dots'
  @property({ type: String }) loadingText: string = 'Bot is typing...';

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
          max-height: calc(100% - 60px); /* Keeps the messages area responsive */
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

      .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #eef1f6;
          align-self: flex-start;
          border-radius: 16px;
          padding: 10px;
          color: #888888;
          font-style: italic;
      }

      .dots span {
          display: inline-block;
          width: 8px;
          height: 8px;
          margin: 0 2px;
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
          0%, 80%, 100% {
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
      }

      input {
          flex: 1;
          padding: 12px;
          font-size: 14px;
          border: none;
          outline: none;
          background-color: #f9fafb;
          border-top-left-radius: 16px;
          max-width: 100%;
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

      button:hover {
          background-color: #1d4ed8;
      }
  `;

  override render() {
    return html`
      <div class="chatbox">
        <div class="messages">
          ${this.messages.map(
            (message) => html`
              <div class="message ${message.sender}">
                <div>${message.text}</div>
              </div>
            `
          )}
          ${this.isBotTyping
            ? html`
              <div class="message loading">
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
            placeholder="Type your message..."
          />
          <button @click=${this.handleSendMessage}>Send</button>
        </div>
      </div>
    `;
  }

  private handleInputChange(e: Event) {
    this.currentInput = (e.target as HTMLInputElement).value;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.handleSendMessage();
    }
  }

  private handleSendMessage() {
    if (!this.currentInput.trim()) return;

    const userMessage = { sender: 'user', text: this.currentInput.trim() };
    this.messages = [...this.messages, userMessage];
    this.currentInput = '';

    this.startBotResponse();
  }

  private async startBotResponse() {
    this.isBotTyping = true;

    setTimeout(async () => {
      const botMessageIndex = this.messages.length;
      this.messages = [...this.messages, { sender: 'bot', text: '' }];
      this.isBotTyping = false;

      const simulatedStream = this.mockLLMStream();
      for await (const chunk of simulatedStream) {
        this.messages[botMessageIndex].text += chunk;
        this.requestUpdate();
      }
    }, 1000);
  }

  private async *mockLLMStream(): AsyncIterable<string> {
    const chunks = [
      'This ',
      'is ',
      'a ',
      'streaming ',
      'response ',
      'from ',
      'an ',
      'LLM.',
    ];
    for (const chunk of chunks) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      yield chunk;
    }
  }
}