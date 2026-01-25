/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Config panel template - re-exports from modular structure
 *
 * The config panel has been split into smaller, focused modules:
 * - config-panel/types.ts - TypeScript interfaces
 * - config-panel/common-fields.ts - Common name/description fields
 * - config-panel/data-node-fields.ts - Database node configuration
 * - config-panel/chatbot-trigger-fields.ts - Chatbot trigger configuration
 * - config-panel/db-designer-fields.ts - DB designer nodes (Table, View, Index, etc.)
 * - config-panel/debug-fields.ts - Debug node configuration
 * - config-panel/workflow-node-fields.ts - Workflow nodes (HTTP, Function, Condition, etc.)
 * - config-panel/agent-node-fields.ts - Agent nodes (Agent, LLM, Prompt, etc.)
 * - config-panel/type-fields.ts - Type-based field routing
 * - config-panel/index.ts - Main template and re-exports
 */

export * from './config-panel/index.js';
