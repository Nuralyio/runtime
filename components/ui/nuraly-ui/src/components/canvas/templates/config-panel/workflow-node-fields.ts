/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Workflow node fields - re-exports from modular structure
 *
 * The workflow node fields have been split into smaller, focused modules:
 * - workflow-node-fields/http-fields.ts - HTTP Start, HTTP End, HTTP node configuration
 * - workflow-node-fields/function-fields.ts - Function node configuration
 * - workflow-node-fields/condition-fields.ts - Condition node configuration
 * - workflow-node-fields/delay-fields.ts - Delay node configuration
 * - workflow-node-fields/loop-fields.ts - Loop node configuration
 * - workflow-node-fields/transform-fields.ts - Transform node configuration
 * - workflow-node-fields/variable-fields.ts - Variable node configuration
 * - workflow-node-fields/email-fields.ts - Email node configuration
 * - workflow-node-fields/chat-fields.ts - Chat Start and Chat Output node configuration
 */

export * from './workflow-node-fields/index.js';
