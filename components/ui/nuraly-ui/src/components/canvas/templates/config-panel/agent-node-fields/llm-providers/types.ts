/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Provider-specific configuration
 */
export interface ProviderConfig {
  id: string;
  label: string;
  defaultModel: string;
  modelPlaceholder: string;
  modelOptions: Array<{ label: string; value: string }>;
  requiresApiKey: boolean;
  requiresApiUrl: boolean;
  apiKeyDescription: string;
  apiUrlDescription?: string;
  defaultMaxTokens: number;
}

/**
 * Common update callback type
 */
export type OnUpdateFn = (key: string, value: unknown) => void;
