/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../chatbot.component.js';
import type { NrChatbotElement } from '../chatbot.component.js';
import { ChatbotCoreController } from '../core/chatbot-core.controller.js';
import { MockProvider } from '../providers/mock-provider.js';
import { MarkdownPlugin } from './markdown-plugin.js';
import { ArtifactPlugin } from './artifact-plugin.js';
import { FlowDiagramPlugin } from './flow-diagram-plugin.js';
import { ChatbotSender } from '../chatbot.types.js';

const meta: Meta = {
  title: 'Components/Chatbot/Plugins/Flow Diagram',
  component: 'nr-chatbot',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Flow Diagram Plugin

Renders JSON artifacts that describe a workflow (with \`Steps\`, \`Transitions\`, and optionally \`Events\`)
as an interactive split-view: editable JSON editor on the left, live-updating vertical flow diagram on the right.

## Detection

A JSON artifact is a "workflow" if the parsed object has:
- \`Steps\` (object with named steps)
- \`Transitions\` (object with source/target connections)
- Optionally \`Events\` (StartEvent, EndEvent)

Non-matching JSON falls back to the default artifact panel.

## Usage

\`\`\`typescript
import { FlowDiagramPlugin } from '@nuraly/chatbot/plugins';

const controller = new ChatbotCoreController({
  plugins: [
    new MarkdownPlugin(),
    new ArtifactPlugin(),
    new FlowDiagramPlugin()
  ]
});
\`\`\`
        `
      }
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj;

// ── Sample data ────────────────────────────────────────────────────

const batchWorkflowJson = `{
  "Name": "BatchCreateDocumentIf",
  "DocflowTags": ["Batch"],
  "CorrelationId": "BatchCreateDocument \${system:datetime:now:format(dd-MM-yyyy)}",
  "JobName": "BatchCreateDocument \${system:datetime:now:format(D):cultureinfo(fr-FR)}",
  "MetaData": {
    "SingleDocumentFormat": {
      "Description": "SingleDocumentFormat",
      "Values": ["Pdf"],
      "ValueType": "ProductionFormat"
    }
  },
  "Configuration": {},
  "Events": {
    "StartEvent": { "Name": "Start", "Type": "Start" },
    "EndEvent": { "Name": "End", "Type": "End" }
  },
  "Steps": {
    "Parsing": {
      "Description": "XML parsing and document separation",
      "StepType": "Worker",
      "WorkerStepType": "Parsing",
      "Type": "Parsing",
      "Configuration": {
        "@type": "type.googleapis.com/bdoc.prod.common.workflow.design.ParsingStepConfiguration",
        "DatastreamFormat": "XML",
        "DocumentSeparatorPath": "/ROOT/CONTENT",
        "TemplateName": "N_PAGES"
      }
    },
    "Assembly": {
      "Description": "Document assembly",
      "StepType": "Worker",
      "WorkerStepType": "Assembly",
      "Type": "assembly",
      "Configuration": {
        "@type": "type.googleapis.com/bdoc.prod.common.workflow.design.AssemblyStepConfiguration",
        "IndexFileMode": "SINGLE"
      }
    },
    "IfConversionStep": {
      "Description": "FO to IF conversion step",
      "StepType": "Worker",
      "WorkerStepType": "FoToIf",
      "Type": "conversion",
      "Configuration": {
        "@type": "type.googleapis.com/bdoc.prod.common.workflow.design.FoToIfStepConfiguration"
      }
    },
    "DocumentIfCreationStep": {
      "Description": "Document IF creation step",
      "StepType": "System",
      "SystemTaskType": "DocumentIfCreation",
      "Configuration": {
        "@type": "type.googleapis.com/bdoc.prod.common.workflow.design.DocumentIfCreationStepConfiguration"
      }
    },
    "IfToSingleDocument": {
      "Description": "IF to single document conversion",
      "StepType": "Worker",
      "WorkerStepType": "IfToSingleDocument",
      "Type": "Conversion",
      "Configuration": {
        "@type": "type.googleapis.com/bdoc.prod.common.workflow.design.IfToSingleDocumentStepConfiguration",
        "ProductionFormatOverride": "PDF"
      }
    }
  },
  "Transitions": {
    "Start": { "Source": "StartEvent", "Target": "Parsing" },
    "Parsing": { "Source": "Parsing", "Target": "Assembly" },
    "Assembly": { "Source": "Assembly", "Target": "IfConversionStep" },
    "IfConversionStep": { "Source": "IfConversionStep", "Target": "DocumentIfCreationStep" },
    "DocumentIfCreationStep": { "Source": "DocumentIfCreationStep", "Target": "IfToSingleDocument" },
    "IfToSingleDocument": { "Source": "IfToSingleDocument", "Target": "EndEvent" }
  }
}`;

const simpleWorkflowJson = `{
  "Name": "SimpleMailMerge",
  "DocflowTags": ["Simple", "Mail"],
  "Events": {
    "StartEvent": { "Name": "Start", "Type": "Start" },
    "EndEvent": { "Name": "End", "Type": "End" }
  },
  "Steps": {
    "DataExtraction": {
      "Description": "Extract recipient data from CSV",
      "StepType": "Worker",
      "WorkerStepType": "DataExtraction"
    },
    "TemplateRender": {
      "Description": "Render document template",
      "StepType": "Worker",
      "WorkerStepType": "TemplateEngine"
    },
    "SendMail": {
      "Description": "Dispatch via SMTP gateway",
      "StepType": "System",
      "SystemTaskType": "MailDispatch"
    }
  },
  "Transitions": {
    "Start": { "Source": "StartEvent", "Target": "DataExtraction" },
    "DataExtraction": { "Source": "DataExtraction", "Target": "TemplateRender" },
    "TemplateRender": { "Source": "TemplateRender", "Target": "SendMail" },
    "SendMail": { "Source": "SendMail", "Target": "EndEvent" }
  }
}`;

const minimalWorkflowJson = `{
  "Name": "MinimalPipeline",
  "Steps": {
    "Process": {
      "Description": "Single processing step",
      "StepType": "Worker"
    }
  },
  "Transitions": {
    "Only": { "Source": "Process", "Target": "EndEvent" }
  }
}`;

// ── Helper ─────────────────────────────────────────────────────────

function renderFlowDiagramStory(
  elementId: string,
  workflowJson: string,
  userMessage: string,
  botProse: string
) {
  const messages = [
    {
      id: `${elementId}-msg-1`,
      sender: ChatbotSender.User,
      text: userMessage,
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: `${elementId}-msg-2`,
      sender: ChatbotSender.Bot,
      text: `${botProse}\n\n\`\`\`json\n${workflowJson}\n\`\`\``,
      timestamp: new Date().toISOString()
    }
  ];

  setTimeout(() => {
    const chatbot = document.querySelector(`#${elementId}`) as NrChatbotElement | null;
    if (chatbot && !chatbot.controller) {
      const controller = new ChatbotCoreController({
        provider: new MockProvider({
          delay: 600,
          streaming: true,
          streamingSpeed: 4,
          streamingInterval: 25,
          contextualResponses: true
        }),
        plugins: [new MarkdownPlugin(), new ArtifactPlugin(), new FlowDiagramPlugin()],
        ui: {
          onStateChange: (state) => {
            chatbot.messages = state.messages;
            chatbot.threads = state.threads;
            chatbot.isBotTyping = state.isTyping;
            chatbot.chatStarted = state.messages.length > 0;
          },
          onTypingStart: () => { chatbot.isBotTyping = true; },
          onTypingEnd: () => { chatbot.isBotTyping = false; }
        }
      });

      chatbot.controller = controller;
      chatbot.enableArtifacts = true;

      for (const msg of messages) {
        controller.addMessage(msg);
      }
    }
  }, 0);

  return html`
    <div style="height: 100vh; display: flex; flex-direction: column;">
      <nr-chatbot
        id="${elementId}"
        size="full"
        variant="default"
        .showSendButton=${true}
        .autoScroll=${true}
        .enableArtifacts=${true}
      ></nr-chatbot>
    </div>
  `;
}

// ── Stories ─────────────────────────────────────────────────────────

/**
 * Full batch document processing workflow (5 steps).
 * Click the JSON artifact card to open the split editor/diagram view.
 * Edit JSON in the left pane to see the diagram update live.
 */
export const BatchDocumentWorkflow: Story = {
  render: () => renderFlowDiagramStory(
    'flow-batch',
    batchWorkflowJson,
    'Show me the BatchCreateDocumentIf workflow definition',
    'Here is the workflow definition for **BatchCreateDocumentIf**. It processes XML input through parsing, assembly, FO-to-IF conversion, IF document creation, and finally converts to a single PDF document.'
  )
};

/**
 * Simple 3-step mail merge workflow.
 * Demonstrates a shorter pipeline with both Worker and System step types.
 */
export const SimpleMailMerge: Story = {
  render: () => renderFlowDiagramStory(
    'flow-simple',
    simpleWorkflowJson,
    'Show the mail merge workflow',
    'Here is the **SimpleMailMerge** workflow. It extracts recipient data, renders a template, and dispatches via SMTP.'
  )
};

/**
 * Minimal workflow with no Events — only Steps and Transitions.
 * The diagram omits Start/End event nodes and shows only the step(s).
 */
export const MinimalNoEvents: Story = {
  render: () => renderFlowDiagramStory(
    'flow-minimal',
    minimalWorkflowJson,
    'Show the minimal pipeline',
    'Here is a minimal workflow with a single processing step and no explicit Start/End events.'
  )
};

/**
 * Non-workflow JSON — falls back to the default artifact panel code view.
 * Proves that the FlowDiagramPlugin correctly returns '' for JSON that
 * does not have Steps + Transitions.
 */
export const NonWorkflowFallback: Story = {
  render: () => {
    const plainJson = `{
  "name": "factorial-service",
  "version": "1.0.0",
  "settings": {
    "maxInput": 170,
    "cache": true,
    "timeout": 5000
  },
  "endpoints": [
    { "path": "/factorial", "method": "GET" },
    { "path": "/batch", "method": "POST" }
  ]
}`;

    return renderFlowDiagramStory(
      'flow-fallback',
      plainJson,
      'Show the factorial service config',
      'Here is the JSON configuration for the factorial service. Since it has no `Steps` or `Transitions`, it renders as a standard code view.'
    );
  }
};

/**
 * Two artifacts in one conversation — a workflow JSON and a plain JSON.
 * The workflow opens in the flow diagram split view; the plain config
 * falls back to the default code panel.
 */
export const MixedArtifacts: Story = {
  render: () => {
    const elementId = 'flow-mixed';
    const configJson = `{
  "name": "factorial-service",
  "version": "1.0.0",
  "settings": { "maxInput": 170, "cache": true }
}`;

    const messages = [
      {
        id: `${elementId}-msg-1`,
        sender: ChatbotSender.User,
        text: 'Show me the mail merge workflow and the service config',
        timestamp: new Date(Date.now() - 90000).toISOString()
      },
      {
        id: `${elementId}-msg-2`,
        sender: ChatbotSender.Bot,
        text: `Here is the **SimpleMailMerge** workflow:\n\n\`\`\`json\n${simpleWorkflowJson}\n\`\`\`\n\nAnd here is a plain service configuration:\n\n\`\`\`json\n${configJson}\n\`\`\`\n\nClick the first card for the flow diagram view, and the second for the default code view.`,
        timestamp: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      const chatbot = document.querySelector(`#${elementId}`) as NrChatbotElement | null;
      if (chatbot && !chatbot.controller) {
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 600,
            streaming: true,
            streamingSpeed: 4,
            streamingInterval: 25,
            contextualResponses: true
          }),
          plugins: [new MarkdownPlugin(), new ArtifactPlugin(), new FlowDiagramPlugin()],
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.threads = state.threads;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            },
            onTypingStart: () => { chatbot.isBotTyping = true; },
            onTypingEnd: () => { chatbot.isBotTyping = false; }
          }
        });

        chatbot.controller = controller;
        chatbot.enableArtifacts = true;

        for (const msg of messages) {
          controller.addMessage(msg);
        }
      }
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <nr-chatbot
          id="${elementId}"
          size="full"
          variant="default"
          .showSendButton=${true}
          .autoScroll=${true}
          .enableArtifacts=${true}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Isolated custom element rendering — no chatbot, just the
 * `<nr-flow-diagram-editor>` element directly in the page.
 * Useful for testing the editor/diagram split view in isolation.
 */
export const IsolatedCustomElement: Story = {
  render: () => {
    // Register the custom element via plugin init
    const plugin = new FlowDiagramPlugin();
    plugin.onInit?.();

    const escaped = batchWorkflowJson
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');

    return html`
      <div style="padding: 40px; max-width: 1000px; margin: 0 auto;">
        <h2 style="margin-bottom: 8px; font-family: system-ui;">Isolated Flow Diagram Editor</h2>
        <p style="color: #64748b; margin-bottom: 24px; font-family: system-ui; font-size: 14px;">
          The custom element rendered directly, outside the chatbot artifact panel.
          Edit the JSON on the left and watch the diagram update on the right.
        </p>
        <div style="height: 600px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <nr-flow-diagram-editor content="${escaped}"></nr-flow-diagram-editor>
        </div>
      </div>
    `;
  }
};
