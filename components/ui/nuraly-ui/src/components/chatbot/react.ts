/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrChatbotElement } from './chatbot.component.js';

/**
 * React wrapper for the nr-chatbot component
 * 
 * @example
 * ```jsx
 * import { NrChatbot } from '@nuralyui/chatbot/react';
 * 
 * function ChatExample() {
 *   const [messages, setMessages] = useState([]);
 *   const [suggestions] = useState([
 *     { id: '1', text: 'Help with account', enabled: true },
 *     { id: '2', text: 'Check balance', enabled: true }
 *   ]);
 * 
 *   const handleMessageSent = (event) => {
 *     const newMessage = event.detail.message;
 *     setMessages(prev => [...prev, newMessage]);
 *   };
 * 
 *   return (
 *     <NrChatbot
 *       messages={messages}
 *       suggestions={suggestions}
 *       size="medium"
 *       variant="default"
 *       onChatbotMessageSent={handleMessageSent}
 *     />
 *   );
 * }
 * ```
 */
export const NrChatbot = createComponent({
  tagName: 'nr-chatbot',
  elementClass: NrChatbotElement,
  react: React,
  events: {
    onChatbotMessageSent: 'chatbot-message-sent',
    onChatbotSuggestionClicked: 'chatbot-suggestion-clicked',
    onChatbotRetryRequested: 'chatbot-retry-requested',
    onChatbotInputChanged: 'chatbot-input-changed',
    onChatbotInputFocused: 'chatbot-input-focused',
    onChatbotInputBlurred: 'chatbot-input-blurred',
  },
});

// Legacy alias for backward compatibility
export const HyChatbot = NrChatbot;
