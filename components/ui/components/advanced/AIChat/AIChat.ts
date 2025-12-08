import { styleMap } from "lit/directives/style-map.js";
import type { ComponentElement } from '../../../../../redux/store/component/component.interface.ts';
import { BaseElementBlock } from "../../base/BaseElement.ts";
import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import styles from "./AIChat.style.ts";
import { createChat } from '../../../../../redux/handlers/aichat/create-chat.handler.ts';
import { replaceUUIDs } from "./AIChat.helper.ts";
import { addGeneratedComponents } from '../../../../../redux/actions/aitchat.ts';
import { addTempApplication } from '../../../../../redux/actions/application/addTempApplication.ts';

// Safely import @nuralyui/slider-input
try {
  await import("@nuralyui/slider-input");
} catch (error) {
  console.warn('[@nuralyui/slider-input] Package not found or failed to load.');
}
// Safely import @nuralyui/button
try {
  await import("@nuralyui/button");
} catch (error) {
  console.warn('[@nuralyui/button] Package not found or failed to load.');
}
// Safely import @nuralyui/input
try {
  await import("@nuralyui/input");
} catch (error) {
  console.warn('[@nuralyui/input] Package not found or failed to load.');
}


@customElement("ai-chat-block")
export class AiChat extends BaseElementBlock {
  static override styles = styles;
  @property({ type: Object })
  component: ComponentElement;
  @state()
  preview = false;
  @state()
  rootUUID = "";
  selectedComponent: any;
  structureComponent: any[];
  @state()
  private isChatBoxVisible = false;
  @state()
  private chatUuid = "";
  @state()
  private messages: { type: "user" | "ai", content: string }[] = [];
  @state()
  private errorMessage = "";
  @state()
  private inputValue = "";
  @state()
  private isLoading = false;

  override async connectedCallback() {
    super.connectedCallback();
  }

  override render() {
    const aiChatStyle = this.component?.style || {};
    return html`
            <div class="chat-input-container" style=${styleMap({ ...aiChatStyle })}>
                <nr-button @click=${this.toggleChatBox}>Ask AI</nr-button>
                ${this.isChatBoxVisible ? html`
                    <div class="chat-input">
                        <nr-input value=${this.inputValue} placeholder="Type your message" @valueChange=${this.handleInputChange} @keyup=${this.handleKeyUp} ></nr-input>
                        <nr-button @click=${this.handleSendMessage}>Send</nr-button>
                    </div>
                    ${this.messages.length > 0 ? html`
                        <div class="chat-messages">
                            ${this.preview ? html`<micro-app uuid=${this.chatUuid} componentToRenderUUID=${this.rootUUID}></micro-app>` : ""}
                        <nr-button @click=${() => addGeneratedComponents(this.structureComponent)}>Insert</nr-button>
                        </div>
                    ` : ""}
                    ${this.errorMessage ? html`<div class="error-message">${this.errorMessage}</div>` : ""}
                    ${this.isLoading ? html`<div class="loading-indicator">Loading...</div>` : ""}
                ` : ""}
            </div>
        `;
  }

  private async toggleChatBox() {
    this.isChatBoxVisible = !this.isChatBoxVisible;
    if (this.isChatBoxVisible) {
      await this.getChatUuid();
    } else {
      this.errorMessage = "";
    }
  }

  private async getChatUuid() {
    this.isLoading = true;
    createChat().then((data) => {
      this.chatUuid = data.chat_id;
      this.errorMessage = "";
    }).catch((error) => {
      console.error("Error getting chat UUID:", error);
      this.errorMessage = "Cannot connect to server. Please try again.";
    }).finally(() => {
      this.isLoading = false;
    });
  }

  private async sendMessage(message: string) {
    this.isLoading = true;
    try {
      const response = await fetch(`/api/chat/${this.chatUuid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: message })
      });
      const aiResponse = (await response.json()).response;
      this.messages.push({ type: "ai", content: aiResponse });

      this.structureComponent = [];
      const result = aiResponse.components ?? aiResponse;
      if (Array.isArray(result)) {
        this.structureComponent = result.map((component: any) => {
          component.application_id = this.chatUuid;
          return component;
        });
      }

      this.structureComponent = replaceUUIDs(this.structureComponent);
      const structureComponentRoot = this.structureComponent.find((component: any) => component.component_type === "vertical-container-block");
      this.rootUUID = structureComponentRoot.uuid;
      addTempApplication(this.chatUuid, [...this.structureComponent]);
      requestAnimationFrame(() => {
        this.preview = true;
      });
      console.log("Message sent:", this.messages);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleSendMessage(event: Event) {
    const message = this.inputValue;

    if (message.trim()) {
      this.sendMessage(message);
      this.inputValue = "";
    }
  }

  private handleInputChange(event: CustomEvent) {
    this.inputValue = event.detail.value;
  }

  private handleKeyUp(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.handleSendMessage(event);
    }
  }
}
