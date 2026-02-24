/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Agent node fields - re-exports from modular structure
 *
 * The agent node fields have been split into smaller, focused modules:
 * - agent-node-fields/agent-fields.ts - Agent node configuration
 * - agent-node-fields/llm-fields.ts - LLM node configuration
 * - agent-node-fields/prompt-fields.ts - Prompt node configuration
 * - agent-node-fields/memory-fields.ts - Memory node configuration
 * - agent-node-fields/tool-fields.ts - Tool node configuration
 * - agent-node-fields/retriever-fields.ts - Retriever node configuration
 */

export * from './agent-node-fields/index.js';
