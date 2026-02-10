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
  WhiteboardNodeType,
} from '../../workflow-canvas.types.js';
import type { DatabaseProvider } from '../../data-node/data-node.types.js';

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
  // Web nodes
  renderWebSearchFields,
  renderWebCrawlFields,
  // Storage nodes
  renderFileStorageFields,
  // RAG nodes
  renderEmbeddingFields,
  renderDocumentLoaderFields,
  renderTextSplitterFields,
  renderVectorWriteFields,
  renderVectorSearchFields,
  renderContextBuilderFields,
  // Safety nodes
  renderGuardrailFields,
} from './workflow-node-fields.js';
import {
  renderAgentFields,
  renderLlmFields,
  renderPromptFields,
  renderMemoryFields,
  renderToolFields,
  renderRetrieverFields,
} from './agent-node-fields.js';
import { renderNoteFields } from './note-node-fields.js';
import { renderMermaidFields } from './mermaid-fields.js';
import { renderAnchorFields } from './anchor-node-fields.js';

/**
 * Render type-specific config fields
 */
export function renderTypeFields(
  type: string,
  config: NodeConfiguration,
  onUpdate: (key: string, value: unknown) => void,
  workflowId?: string,
  kvEntries?: { keyPath: string; value?: any; isSecret: boolean }[],
  onCreateKvEntry?: (detail: { keyPath: string; value: any; scope: string; isSecret: boolean }) => void,
  applicationId?: string,
  databaseProvider?: DatabaseProvider,
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
      return renderDataNodeFields(config, onUpdate, kvEntries, onCreateKvEntry, applicationId, databaseProvider);

    case WorkflowNodeType.CHATBOT:
      return renderChatbotTriggerFields(config, onUpdate);

    case WorkflowNodeType.CHAT_START:
      return renderChatStartFields(config, onUpdate);

    case WorkflowNodeType.CHAT_OUTPUT:
      return renderChatOutputFields(config, onUpdate);

    case WorkflowNodeType.OCR:
      return renderOcrFields(config, onUpdate);

    // Web nodes
    case WorkflowNodeType.WEB_SEARCH:
      return renderWebSearchFields(config, onUpdate);

    case WorkflowNodeType.WEB_CRAWL:
      return renderWebCrawlFields(config, onUpdate);

    // Storage nodes
    case WorkflowNodeType.FILE_STORAGE:
      return renderFileStorageFields(config, onUpdate);

    // RAG nodes
    case WorkflowNodeType.EMBEDDING:
      return renderEmbeddingFields(config, onUpdate);

    case WorkflowNodeType.DOCUMENT_LOADER:
      return renderDocumentLoaderFields(config, onUpdate);

    case WorkflowNodeType.TEXT_SPLITTER:
      return renderTextSplitterFields(config, onUpdate);

    case WorkflowNodeType.VECTOR_WRITE:
      return renderVectorWriteFields(config, onUpdate);

    case WorkflowNodeType.VECTOR_SEARCH:
      return renderVectorSearchFields(config, onUpdate);

    case WorkflowNodeType.CONTEXT_BUILDER:
      return renderContextBuilderFields(config, onUpdate);

    // Safety nodes
    case WorkflowNodeType.GUARDRAIL:
      return renderGuardrailFields(config, onUpdate);

    // Annotation nodes
    case WorkflowNodeType.NOTE:
      return renderNoteFields(config, onUpdate);

    // Agent nodes
    case AgentNodeType.AGENT:
      return renderAgentFields(config, onUpdate);

    case AgentNodeType.LLM:
      return renderLlmFields(config, onUpdate, kvEntries, onCreateKvEntry);

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

    // Whiteboard nodes
    case WhiteboardNodeType.MERMAID:
      return renderMermaidFields(config, onUpdate);

    case WhiteboardNodeType.ANCHOR:
      return renderAnchorFields(config, onUpdate);

    default:
      return nothing;
  }
}
