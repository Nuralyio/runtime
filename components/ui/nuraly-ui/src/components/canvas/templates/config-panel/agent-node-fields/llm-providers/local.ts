/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ProviderConfig } from './types.js';

export const localConfig: ProviderConfig = {
  id: 'local',
  label: 'Local',
  defaultModel: '',
  modelPlaceholder: 'Enter model name...',
  modelOptions: [],
  requiresApiKey: false,
  requiresApiUrl: true,
  apiKeyDescription: 'Optional - depends on your local server configuration',
  apiUrlDescription: 'URL of your local LLM server (e.g., http://localhost:8080)',
  defaultMaxTokens: 2048,
};
