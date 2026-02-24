/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ProviderConfig } from './types.js';

export const geminiConfig: ProviderConfig = {
  id: 'gemini',
  label: 'Google (Gemini)',
  defaultModel: 'gemini-1.5-pro',
  modelPlaceholder: 'gemini-1.5-pro, gemini-1.5-flash...',
  modelOptions: [
    { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
    { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
    { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
    { label: 'Gemini 1.5 Flash-8B', value: 'gemini-1.5-flash-8b' },
    { label: 'Gemini 1.0 Pro', value: 'gemini-1.0-pro' },
  ],
  requiresApiKey: true,
  requiresApiUrl: false,
  apiKeyDescription: 'Select or create a Google AI API key',
  defaultMaxTokens: 8192,
};
