/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ProviderConfig } from './types.js';

export const openaiConfig: ProviderConfig = {
  id: 'openai',
  label: 'OpenAI',
  defaultModel: 'gpt-4',
  modelPlaceholder: 'gpt-4, gpt-4-turbo, gpt-3.5-turbo...',
  modelOptions: [
    { label: 'GPT-4', value: 'gpt-4' },
    { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
    { label: 'GPT-4o', value: 'gpt-4o' },
    { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    { label: 'O1', value: 'o1' },
    { label: 'O1 Mini', value: 'o1-mini' },
    { label: 'O1 Preview', value: 'o1-preview' },
  ],
  requiresApiKey: true,
  requiresApiUrl: false,
  apiKeyDescription: 'Select or create an OpenAI API key',
  defaultMaxTokens: 4096,
};
