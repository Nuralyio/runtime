/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveControllerHost } from 'lit';
import { ChatbotMessage, ChatbotSuggestion, ChatbotEventDetail } from '../chatbot.types.js';

/**
 * Interface for chatbot host components
 */
export interface ChatbotHost extends ReactiveControllerHost {
  messages: ChatbotMessage[];
  suggestions: ChatbotSuggestion[];
  disabled: boolean;
  dispatchEventWithMetadata(type: string, detail?: ChatbotEventDetail): void;
}

/**
 * Interface for chatbot validation capabilities
 */
export interface ChatbotValidationCapable {
  validateMessage(text: string): Promise<boolean>;
  addValidationRule(rule: any): void;
  removeValidationRule(ruleId: string): void;
}