import { LitElement, html, css } from 'lit';
import { customElement, state, property } from 'lit/decorators.js';
import { ChatService } from './chat.service';
import {msg} from '@lit/localize';

@customElement('chatbot-agent')
export class ChatbotContainer extends LitElement {
  @state() private messages: {sender: string; text: string; timestamp: string; error?: boolean}[] = [
    {sender: 'bot', text: msg('Welcome! How can I assist you today?'), timestamp: new Date().toLocaleTimeString()},
  ];
  @property({type: Boolean}) direction = false;
  @state() private currentInput = '';
  @state() private isBotTyping = false;
  @state() private suggestions: string[] = [
    'Tell me about your services',
    'How can I get started?',
    'What are your pricing options?',
  ];
  @state() private chatStarted = false;

  static override styles = css`
      :host {
          display: block;
          width: 100%;
          height: 100%;
      }
  `;

  override render() {
    return html`
      <nr-chatbot
        .isRTL=${this.direction}
        .messages=${this.messages}
        .currentInput=${this.currentInput}
        .isBotTyping=${this.isBotTyping}
        .suggestions=${this.suggestions}
        .chatStarted=${this.chatStarted}
        @input-change=${this.handleInputChange}
        @send-message=${this.handleSendMessage}
        @retry-message=${this.handleRetryMessage}
        @suggestion-click=${this.handleSuggestionClick}
      ></nr-chatbot>
    `;
  }

  private handleInputChange(e: CustomEvent<string>) {
    this.currentInput = e.detail;
  }

  private handleSuggestionClick(e: CustomEvent<string>) {
    const suggestion = e.detail;
    this.currentInput = suggestion;
    this.suggestions = this.suggestions.filter((s) => s !== suggestion);
    this.handleSendMessage();
  }

  private handleRetryMessage(_e: CustomEvent<string>) {
    // Find the last user message and retry it
    const lastUserMessage = this.messages
      .slice()
      .reverse()
      .find(msg => msg.sender === 'user');

    if (lastUserMessage) {
      this.currentInput = lastUserMessage.text;
      this.handleSendMessage();
    }
  }

  private async handleSendMessage() {
    if (!this.currentInput.trim()) return;

    const userMessage = {
      sender: 'user',
      text: this.currentInput.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    this.messages = [...this.messages, userMessage];
    this.currentInput = '';
    this.chatStarted = true;
    this.isBotTyping = true;

    try {
      const responseGenerator = ChatService.streamResponse(userMessage.text);

      for await (const chunk of responseGenerator) {
        if (this.isBotTyping) {
          this.isBotTyping = false;
          this.messages = [
            ...this.messages,
            {
              sender: 'bot',
              text: '',
              timestamp: new Date().toLocaleTimeString(),
            },
          ];
        }
        this.messages = this.messages.map((msg, index) =>
          index === this.messages.length - 1 ? {...msg, text: msg.text + chunk} : msg
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      this.messages = [
        ...this.messages,
        {
          sender: 'bot',
          text: msg('Sorry, there was an error processing your message.'),
          timestamp: new Date().toLocaleTimeString(),
          error: true,
        },
      ];
    } finally {
      this.isBotTyping = false;
    }
  }
}