/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { nothing, TemplateResult } from 'lit';
import {
  NodeConfiguration,
  WorkflowNodeType,
  AgentNodeType,
  DbDesignerNodeType,
} from '../../workflow-canvas.types.js';

// Import field renderers
import { renderDataNodeFields } from './data-node-fields.js';
import { renderChatbotTriggerFields } from './chatbot-trigger-fields.js';
import { renderDebugNodeFields } from './debug-fields.js';
import {
  renderTableNodeFields,
  renderViewNodeFields,
  renderIndexNodeFields,
  renderRelationshipNodeFields,
  renderConstraintNodeFields,
  renderQueryNodeFields,
} from './db-designer-fields.js';
import {
  renderHttpStartFields,
  renderHttpEndFields,
  renderHttpFields,
  renderFunctionFields,
  renderConditionFields,
  renderDelayFields,
  renderLoopFields,
  renderTransformFields,
  renderVariableFields,
  renderEmailFields,
  renderChatStartFields,
  renderChatOutputFields,
  renderOcrFields,
} from './workflow-node-fields.js';
import {
  renderAgentFields,
  renderLlmFields,
  renderPromptFields,
  renderMemoryFields,
  renderToolFields,
  renderRetrieverFields,
} from './agent-node-fields.js';

/**
 * Render type-specific config fields
 */
export function renderTypeFields(
  type: string,
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  workflowId?: string
): TemplateResult | typeof nothing {
  switch (type) {
    // Workflow nodes
    case WorkflowNodeType.HTTP_START:
      return renderHttpStartFields(config, onUpdate, workflowId);

    case WorkflowNodeType.HTTP_END:
      return renderHttpEndFields(config, onUpdate);

    case WorkflowNodeType.HTTP:
      return renderHttpFields(config, onUpdate);

    case WorkflowNodeType.FUNCTION:
      return renderFunctionFields(config, onUpdate);

    case WorkflowNodeType.CONDITION:
      return renderConditionFields(config, onUpdate);

    case WorkflowNodeType.DELAY:
      return renderDelayFields(config, onUpdate);

    case WorkflowNodeType.LOOP:
      return renderLoopFields(config, onUpdate);

    case WorkflowNodeType.TRANSFORM:
      return renderTransformFields(config, onUpdate);

    case WorkflowNodeType.VARIABLE:
      return renderVariableFields(config, onUpdate);

    case WorkflowNodeType.EMAIL:
      return renderEmailFields(config, onUpdate);

    case WorkflowNodeType.DEBUG:
      return renderDebugNodeFields(config, onUpdate);

    case WorkflowNodeType.DATABASE:
      return renderDataNodeFields(config, onUpdate);

    case WorkflowNodeType.CHATBOT:
      return renderChatbotTriggerFields(config, onUpdate);

    case WorkflowNodeType.CHAT_START:
      return renderChatStartFields(config, onUpdate);

    case WorkflowNodeType.CHAT_OUTPUT:
      return renderChatOutputFields(config, onUpdate);

    case WorkflowNodeType.OCR:
      return renderOcrFields(config, onUpdate);

    // Agent nodes
    case AgentNodeType.AGENT:
      return renderAgentFields(config, onUpdate);

    case AgentNodeType.LLM:
      return renderLlmFields(config, onUpdate);

    case AgentNodeType.PROMPT:
      return renderPromptFields(config, onUpdate);

    case AgentNodeType.MEMORY:
      return renderMemoryFields(config, onUpdate);

    case AgentNodeType.TOOL:
      return renderToolFields(config, onUpdate);

    case AgentNodeType.RETRIEVER:
      return renderRetrieverFields(config, onUpdate);

    // DB Designer nodes
    case DbDesignerNodeType.TABLE:
      return renderTableNodeFields(config, onUpdate);

    case DbDesignerNodeType.VIEW:
      return renderViewNodeFields(config, onUpdate);

    case DbDesignerNodeType.INDEX:
      return renderIndexNodeFields(config, onUpdate);

    case DbDesignerNodeType.RELATIONSHIP:
      return renderRelationshipNodeFields(config, onUpdate);

    case DbDesignerNodeType.CONSTRAINT:
      return renderConstraintNodeFields(config, onUpdate);

    case DbDesignerNodeType.QUERY:
      return renderQueryNodeFields(config, onUpdate);

    default:
      return nothing;
  }
}
