/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import type { ChatbotCoreController } from '../../chatbot/core/chatbot-core.controller.js';

/**
 * Data required for rendering the chatbot panel
 */
export interface ChatbotPanelTemplateData {
  isOpen: boolean;
  controller: ChatbotCoreController | null;
  unreadCount: number;
  currentTheme: string;
}

/**
 * Callbacks for chatbot panel interactions
 */
export interface ChatbotPanelCallbacks {
  onClose: () => void;
  onMessageSent?: () => void;
}

/**
 * Stop event propagation — prevents canvas pan/drag when interacting with the panel
 */
function stopPropagation(e: Event): void {
  e.stopPropagation();
}

/**
 * Render the chatbot side panel
 */
export function renderChatbotPanelTemplate(
  data: ChatbotPanelTemplateData,
  callbacks: ChatbotPanelCallbacks
): TemplateResult | typeof nothing {
  if (!data.isOpen) return nothing;

  return html`
    <div class="chatbot-panel"
      data-theme=${data.currentTheme}
      @mousedown=${stopPropagation}
      @touchstart=${stopPropagation}
      @pointerdown=${stopPropagation}
    >
      <div class="chatbot-panel-header">
        <span class="chatbot-panel-title">
          <nr-icon name="message-circle" size="small"></nr-icon>
          AI Assistant
        </span>
        <button
          class="chatbot-panel-close"
          @click=${callbacks.onClose}
          title="Close (Ctrl+/)"
        >
          <nr-icon name="x" size="small"></nr-icon>
        </button>
      </div>
      <div class="chatbot-panel-content">
        <nr-chatbot
          size="small"
          variant="minimal"
          .controller=${data.controller}
        ></nr-chatbot>
      </div>
    </div>
  `;
}
