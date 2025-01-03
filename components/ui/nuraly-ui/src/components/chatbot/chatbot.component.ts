import {html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {classMap} from 'lit/directives/class-map.js';
import {localized, msg} from '@lit/localize';

import styles from './chatbot.style.js';
import {Message} from './shared/interfaces/message.interface';
import {EMPTY_STRING} from './shared/constant';

@localized()
@customElement('nr-chatbot')
export class NrChatbot extends LitElement {
  @property({type: Array}) messages: Message[] = [];
  @property({type: String}) currentInput = EMPTY_STRING;
  @property({type: Boolean}) isBotTyping = false;
  @property({type: Array}) suggestions: string[] = [];
  @property({type: Boolean}) chatStarted = false;
  @property({type: Boolean}) isRTL = true;

  @property({type: String}) loadingIndicator = 'dots';
  @property({type: String}) loadingText: string = msg('Bot is typing...');

  static override styles = styles;

  override render() {
    return html`
    <div class="chat-box" dir=${this.isRTL ? 'rtl' : 'ltr'}>
      ${this.renderMessages()}
      ${this.renderInputBox()}
    </div>
  `;
  }

  private renderMessages() {
    return html`
    <div class="messages">
      ${this.messages.map((message) => this.renderMessage(message))}
      ${this.renderSuggestions()}
      ${this.renderBotTypingIndicator()}
    </div>
  `;
  }

  private renderMessage(message: Message) {
    return html`
    <div
      class="message ${classMap({
      error: !!message.error,
      introduction: !!message.introduction,
      [message.sender]: true,
    })}"
    >
      <div>${message.text}</div>
      ${message.error
      ? html`<div class="retry" @click=${() => this.handleRetry(message)}>${msg('Retry')}</div>`
      : nothing}
    </div>
  `;
  }

  private renderSuggestions() {
    return !this.chatStarted && this.suggestions.length
      ? html`
        <div class="suggestion-container">
          ${this.suggestions.map((suggestion) =>
        this.renderSuggestion(suggestion)
      )}
        </div>
      `
      : nothing;
  }

  private renderSuggestion(suggestion: string) {
    return html`
    <div class="suggestion" @click=${() => this.handleSuggestionClick(suggestion)}>
      ${suggestion}
    </div>
  `;
  }

  private renderBotTypingIndicator() {
    return this.isBotTyping
      ? html`
        <div class="message bot loading">
          <div class="dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      `
      : nothing;
  }

  private renderInputBox() {
    return html`
    <div class="input-box">
      <input
        type="text"
        .value=${this.currentInput}
        @input=${this.handleInputChange}
        @keydown=${this.handleKeyDown}
        placeholder=${msg('Type your message...')}
        dir=${this.isRTL ? 'rtl' : 'ltr'}
      />
      <button @click=${this.handleSendMessage}>${msg('Send')}</button>
    </div>
  `;
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (changedProperties.has('messages')) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom() {
    const messagesContainer = this.shadowRoot?.querySelector('.messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
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

  private handleRetry(message: Message) {
    this.dispatchEvent(new CustomEvent('retry-message', {detail: message.text}));
  }

  private handleSuggestionClick(suggestion: string) {
    this.currentInput = suggestion;
    this.dispatchEvent(new CustomEvent('suggestion-click', {detail: suggestion}));
    this.handleSendMessage();
    this.currentInput = '';
  }
}