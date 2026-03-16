/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html } from 'lit';
import { ArtifactPlugin } from './artifact-plugin.js';
import { MarkdownPlugin } from './markdown-plugin.js';
import { ChatbotCoreController } from '../core/chatbot-core.controller.js';
import { MockProvider } from '../providers/mock-provider.js';
import { ChatbotSender } from '../chatbot.types.js';
import type { ChatbotMessage } from '../chatbot.types.js';
import '../chatbot.component.js';
import '.././../skeleton/index.js';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Components/Chatbot/Plugins/Artifact Panel',
  component: 'nr-chatbot',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Artifact Panel — Content Rendering

Tests for artifact panel text wrapping, line breaks, and content rendering across different languages.

## Key scenarios

- **Plain text**: Should wrap long lines, preserve line breaks
- **Code**: Should wrap long lines with \`pre-wrap\`, preserve indentation
- **Markdown**: Rendered as rich HTML
- **JSON**: Pretty-printed with proper formatting
- **HTML**: Rendered inline
        `
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Helper to set up a chatbot with artifact messages
 */
function renderArtifactStory(
  elementId: string,
  messages: ChatbotMessage[]
) {
  setTimeout(() => {
    const chatbot = document.querySelector(`#${elementId}`) as any;
    if (chatbot && !chatbot.controller) {
      const controller = new ChatbotCoreController({
        provider: new MockProvider({
          delay: 600,
          streaming: true,
          streamingSpeed: 4,
          streamingInterval: 25,
          contextualResponses: true
        }),
        plugins: [new MarkdownPlugin(), new ArtifactPlugin()],
        ui: {
          onStateChange: (state: any) => {
            chatbot.messages = state.messages;
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
    <div style="width: 100%; height: 100vh;">
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

/**
 * Plain text artifact — long paragraphs that must wrap.
 *
 * **What to check:**
 * - Click the artifact card to open the panel
 * - Text should wrap at the panel edge, NOT overflow in a single line
 * - Line breaks in the original text should be preserved
 */
export const PlainTextWrapping: Story = {
  render: () => renderArtifactStory('artifact-text', [
    {
      id: 'txt-q',
      sender: ChatbotSender.User,
      text: 'Write me a summary about climate change',
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'txt-a',
      sender: ChatbotSender.Bot,
      text: `Here is a detailed summary:\n\n\`\`\`text\nClimate change refers to long-term shifts in global temperatures and weather patterns. While these shifts can be natural, since the 1800s, human activities have been the main driver — primarily due to burning fossil fuels like coal, oil and gas, which produce heat-trapping gases.\n\nThe effects of climate change are far-reaching and include rising sea levels, more frequent and severe weather events, loss of biodiversity, and threats to food security. The Intergovernmental Panel on Climate Change (IPCC) has warned that global warming of 1.5°C above pre-industrial levels will cause unavoidable increases in multiple climate hazards.\n\nAddressing climate change requires both mitigation (reducing emissions) and adaptation (adjusting to current and future effects). Key strategies include transitioning to renewable energy sources, improving energy efficiency, protecting and restoring ecosystems, and developing climate-resilient infrastructure.\n\nThe Paris Agreement, adopted in 2015, aims to limit global temperature rise to well below 2°C above pre-industrial levels, with efforts to limit the increase to 1.5°C. As of 2024, nearly every country has submitted nationally determined contributions (NDCs) outlining their climate action plans.\n\`\`\`\n\nThis covers the main points. Let me know if you'd like more detail on any section.`,
      timestamp: new Date().toISOString()
    }
  ])
};

/**
 * Code artifact with very long lines — should wrap, not overflow.
 *
 * **What to check:**
 * - Click the artifact card
 * - Long lines should wrap within the panel (not require horizontal scroll for miles)
 * - Indentation should be preserved
 */
export const LongCodeLines: Story = {
  render: () => renderArtifactStory('artifact-longcode', [
    {
      id: 'lc-q',
      sender: ChatbotSender.User,
      text: 'Show me a function with really long lines',
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'lc-a',
      sender: ChatbotSender.Bot,
      text: `Here's an example with long lines:\n\n\`\`\`typescript\n// Configuration loader with extremely long type annotations and default values for demonstration purposes\nexport function loadConfiguration(options: { database: { host: string; port: number; username: string; password: string; database: string; ssl: boolean; poolSize: number; connectionTimeout: number; idleTimeout: number }; cache: { enabled: boolean; ttl: number; maxSize: number; strategy: 'lru' | 'lfu' | 'fifo'; evictionPolicy: 'lazy' | 'eager' }; logging: { level: 'debug' | 'info' | 'warn' | 'error'; format: 'json' | 'text' | 'structured'; destination: 'console' | 'file' | 'remote'; filePath?: string; remoteEndpoint?: string } }): Promise<ApplicationConfiguration> {\n  const defaultConfig = { database: { host: 'localhost', port: 5432, username: 'admin', password: 'secret', database: 'myapp', ssl: true, poolSize: 10, connectionTimeout: 30000, idleTimeout: 600000 }, cache: { enabled: true, ttl: 3600, maxSize: 1000, strategy: 'lru' as const, evictionPolicy: 'lazy' as const }, logging: { level: 'info' as const, format: 'json' as const, destination: 'console' as const } };\n\n  // Merge with provided options\n  return deepMerge(defaultConfig, options);\n}\n\n// Short function for contrast\nfunction add(a: number, b: number): number {\n  return a + b;\n}\n\`\`\`\n\nNote how the first function has very long type annotations. The panel should wrap these lines.`,
      timestamp: new Date().toISOString()
    }
  ])
};

/**
 * Markdown artifact — rendered as rich HTML in the panel.
 *
 * **What to check:**
 * - Headings, lists, bold, links render correctly
 * - Content wraps properly
 */
export const MarkdownArtifact: Story = {
  render: () => renderArtifactStory('artifact-md', [
    {
      id: 'md-q',
      sender: ChatbotSender.User,
      text: 'Write me a markdown document',
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'md-a',
      sender: ChatbotSender.Bot,
      text: "Here's your document:\n\n```markdown\n# Project Overview\n\nThis is a comprehensive guide to building modern web applications with **TypeScript** and **Lit**.\n\n## Getting Started\n\n1. Install the dependencies: `npm install`\n2. Start the dev server: `npm run dev`\n3. Open your browser to `http://localhost:3000`\n\n## Key Features\n\n- **Component-based architecture** — each UI element is a self-contained web component\n- **Reactive properties** — changes automatically trigger re-renders\n- **Shadow DOM** — styles are scoped to each component, preventing leaks\n- **TypeScript support** — full type safety with decorators and interfaces\n\n## Architecture\n\nThe application follows a layered architecture:\n\n- **Presentation layer**: Lit web components\n- **Business logic**: Pure TypeScript services\n- **Data layer**: REST API clients with type-safe responses\n\n> Note: All components extend the `NuralyUIBaseMixin` for consistent theming and validation.\n\n## Contributing\n\nPlease read our [contribution guidelines](https://example.com) before submitting a pull request. All code must pass linting and have test coverage above 80%.\n```\n\nThis covers the basics. Click the artifact to view the rendered markdown.",
      timestamp: new Date().toISOString()
    }
  ])
};

/**
 * JSON artifact — should be pretty-printed in the panel.
 *
 * **What to check:**
 * - JSON is formatted with indentation
 * - Long string values wrap
 */
export const JsonArtifact: Story = {
  render: () => renderArtifactStory('artifact-json', [
    {
      id: 'json-q',
      sender: ChatbotSender.User,
      text: 'Show me a JSON config example',
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'json-a',
      sender: ChatbotSender.Bot,
      text: `Here's the configuration:\n\n\`\`\`json\n{"name":"my-application","version":"2.1.0","description":"A comprehensive application configuration with very long description text that should demonstrate how the artifact panel handles wrapping of long string values within JSON content blocks","settings":{"database":{"host":"db.example.com","port":5432,"username":"app_user","password":"****","pool":{"min":2,"max":20,"idleTimeout":30000}},"cache":{"enabled":true,"ttl":3600,"maxEntries":10000},"features":{"darkMode":true,"analytics":true,"betaFeatures":false,"experimentalApi":false}},"endpoints":[{"path":"/api/v1/users","method":"GET","auth":true,"rateLimit":100},{"path":"/api/v1/users","method":"POST","auth":true,"rateLimit":50},{"path":"/api/v1/health","method":"GET","auth":false,"rateLimit":1000}]}\n\`\`\`\n\nThe JSON is auto-formatted in the artifact panel.`,
      timestamp: new Date().toISOString()
    }
  ])
};

/**
 * HTML artifact — rendered inline in the panel.
 *
 * **What to check:**
 * - HTML is rendered (not shown as source)
 * - Content is properly contained within the panel
 */
export const HtmlArtifact: Story = {
  render: () => renderArtifactStory('artifact-html', [
    {
      id: 'html-q',
      sender: ChatbotSender.User,
      text: 'Create a simple HTML card component',
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'html-a',
      sender: ChatbotSender.Bot,
      text: `Here's a simple card:\n\n\`\`\`html\n<div style="max-width: 400px; font-family: system-ui, sans-serif; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">\n  <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 24px; color: white;">\n    <h2 style="margin: 0 0 8px 0; font-size: 20px;">Welcome Card</h2>\n    <p style="margin: 0; opacity: 0.9; font-size: 14px;">This HTML artifact is rendered live in the panel</p>\n  </div>\n  <div style="padding: 20px;">\n    <p style="color: #555; line-height: 1.6; margin: 0 0 16px 0;">This demonstrates how HTML artifacts render directly in the artifact panel instead of showing source code. The content is sandboxed within the panel.</p>\n    <div style="display: flex; gap: 8px;">\n      <span style="padding: 4px 12px; background: #f0f0f0; border-radius: 16px; font-size: 12px; color: #666;">HTML</span>\n      <span style="padding: 4px 12px; background: #f0f0f0; border-radius: 16px; font-size: 12px; color: #666;">CSS</span>\n      <span style="padding: 4px 12px; background: #f0f0f0; border-radius: 16px; font-size: 12px; color: #666;">Inline</span>\n    </div>\n  </div>\n</div>\n\`\`\`\n\nClick the card to see it rendered live!`,
      timestamp: new Date().toISOString()
    }
  ])
};

/**
 * Multiple artifacts of different types in one message.
 *
 * **What to check:**
 * - Each artifact card shows in the message
 * - Clicking each opens the correct content in the panel
 * - Switching between artifacts works
 */
export const MixedArtifacts: Story = {
  render: () => renderArtifactStory('artifact-mixed', [
    {
      id: 'mix-q',
      sender: ChatbotSender.User,
      text: 'Show me code, config, and documentation for a todo app',
      timestamp: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'mix-a',
      sender: ChatbotSender.Bot,
      text: `Here's everything you need:\n\n\`\`\`typescript\n// Todo service implementation\ninterface Todo {\n  id: string;\n  title: string;\n  completed: boolean;\n  createdAt: Date;\n}\n\nclass TodoService {\n  private todos: Map<string, Todo> = new Map();\n\n  create(title: string): Todo {\n    const todo: Todo = {\n      id: crypto.randomUUID(),\n      title,\n      completed: false,\n      createdAt: new Date()\n    };\n    this.todos.set(todo.id, todo);\n    return todo;\n  }\n\n  toggle(id: string): Todo | undefined {\n    const todo = this.todos.get(id);\n    if (todo) {\n      todo.completed = !todo.completed;\n    }\n    return todo;\n  }\n\n  list(): Todo[] {\n    return Array.from(this.todos.values());\n  }\n}\n\`\`\`\n\nConfiguration:\n\n\`\`\`json\n{\n  "name": "todo-app",\n  "version": "1.0.0",\n  "database": {\n    "type": "sqlite",\n    "path": "./data/todos.db"\n  },\n  "server": {\n    "port": 3000,\n    "cors": true\n  }\n}\n\`\`\`\n\nDocumentation:\n\n\`\`\`text\nTodo Application - Quick Start Guide\n\nThis application provides a simple todo management system with the following features:\n\n- Create new todos with a title\n- Toggle completion status\n- List all todos with filtering options\n- Persistent storage using SQLite\n\nTo get started, run 'npm install' followed by 'npm start'. The server will be available at http://localhost:3000. Use the REST API endpoints documented below to interact with the service.\n\nAPI Endpoints:\n  POST   /todos          - Create a new todo\n  GET    /todos          - List all todos\n  PATCH  /todos/:id      - Toggle todo completion\n  DELETE /todos/:id      - Delete a todo\n\`\`\`\n\nClick each artifact to view it in the panel!`,
      timestamp: new Date().toISOString()
    }
  ])
};

/**
 * Streaming artifact — send a message and watch the artifact appear during streaming.
 *
 * **What to check:**
 * - Code renders inline during streaming (via MarkdownPlugin)
 * - After streaming completes, code collapses into artifact cards
 * - Clicking the card opens the panel with wrapped content
 */
export const StreamingArtifact: Story = {
  render: () => {
    const mockProvider = new MockProvider({
      delay: 300,
      streaming: true,
      streamingSpeed: 4,
      streamingInterval: 20,
      customResponses: [
        `Here's a function with a very long line that tests wrapping:\n\n\`\`\`typescript\n// Database connection manager with comprehensive options\nexport async function createDatabaseConnection(host: string, port: number, database: string, options: { ssl: boolean; poolSize: number; timeout: number; retries: number; retryDelay: number; onConnect?: () => void; onDisconnect?: () => void; onError?: (err: Error) => void }): Promise<DatabaseConnection> {\n  const connection = await connect({ host, port, database, ...options });\n  if (options.onConnect) options.onConnect();\n  return connection;\n}\n\`\`\`\n\nThis function has intentionally long parameter types to test text wrapping in the artifact panel.`,
        `Here's some plain text content:\n\n\`\`\`text\nThis is a plain text artifact that contains multiple paragraphs of content. Each paragraph should wrap naturally at the edge of the artifact panel without requiring horizontal scrolling. The text should be displayed in a readable, proportional font rather than monospace.\n\nSecond paragraph here with more content. This tests that line breaks between paragraphs are preserved correctly, and that the overall reading experience is comfortable for longer text content.\n\nThird paragraph: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\`\`\`\n\nPlain text should render with a readable font and proper line wrapping.`
      ]
    });

    mockProvider.connect();

    setTimeout(() => {
      const chatbot = document.querySelector('#artifact-streaming') as any;
      if (chatbot && !chatbot.controller) {
        const controller = new ChatbotCoreController({
          provider: mockProvider,
          plugins: [new MarkdownPlugin(), new ArtifactPlugin()]
        });

        chatbot.controller = controller;
        chatbot.enableArtifacts = true;
      }
    }, 0);

    return html`
      <div style="width: 100%; height: 100vh;">
        <nr-chatbot
          id="artifact-streaming"
          size="full"
          variant="default"
          .showSendButton=${true}
          .autoScroll=${true}
          .enableArtifacts=${true}
          placeholder="Send a message to see streaming artifacts..."
        ></nr-chatbot>
      </div>
    `;
  }
};
