/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ProviderConfig } from './types.js';

export const ollamaConfig: ProviderConfig = {
  id: 'ollama',
  label: 'Ollama',
  defaultModel: '',
  modelPlaceholder: 'Select a model from your Ollama server...',
  // Models are fetched dynamically from the Ollama server
  modelOptions: [],
  requiresApiKey: false,
  requiresApiUrl: true,
  apiKeyDescription: 'Optional - Ollama works without authentication by default',
  apiUrlDescription: 'Leave empty for default (http://localhost:11434)',
  defaultMaxTokens: 2048,
};
