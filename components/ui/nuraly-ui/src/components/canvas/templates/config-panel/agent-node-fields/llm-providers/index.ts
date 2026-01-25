/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * LLM Provider configurations
 *
 * Each provider has its own configuration file:
 * - openai.ts - OpenAI (GPT-4, GPT-3.5, etc.)
 * - anthropic.ts - Anthropic (Claude models)
 * - gemini.ts - Google (Gemini models)
 * - ollama.ts - Ollama (local LLMs)
 * - local.ts - Custom local LLM servers
 */

export * from './types.js';
export { openaiConfig } from './openai.js';
export { anthropicConfig } from './anthropic.js';
export { geminiConfig } from './gemini.js';
export { ollamaConfig } from './ollama.js';
export { localConfig } from './local.js';

import { ProviderConfig } from './types.js';
import { openaiConfig } from './openai.js';
import { anthropicConfig } from './anthropic.js';
import { geminiConfig } from './gemini.js';
import { ollamaConfig } from './ollama.js';
import { localConfig } from './local.js';

/**
 * All provider configurations
 */
export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  openai: openaiConfig,
  anthropic: anthropicConfig,
  gemini: geminiConfig,
  ollama: ollamaConfig,
  local: localConfig,
};

/**
 * List of all providers for select options
 */
export const PROVIDER_OPTIONS = [
  { label: openaiConfig.label, value: openaiConfig.id },
  { label: anthropicConfig.label, value: anthropicConfig.id },
  { label: geminiConfig.label, value: geminiConfig.id },
  { label: ollamaConfig.label, value: ollamaConfig.id },
  { label: localConfig.label, value: localConfig.id },
];

/**
 * Get provider configuration by ID
 */
export function getProviderConfig(providerId: string): ProviderConfig {
  return PROVIDER_CONFIGS[providerId] || openaiConfig;
}
