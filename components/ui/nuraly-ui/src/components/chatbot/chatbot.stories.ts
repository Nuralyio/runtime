/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import {
  ChatbotMessage,
  ChatbotSuggestion,
  ChatbotSender,
  ChatbotSize,
  ChatbotVariant,
  ChatbotLoadingType,
  ChatbotModule,
  ChatbotThread
} from './chatbot.types.js';
import { ChatbotFileType } from './chatbot.types.js';

// Import the core controller and providers
import { ChatbotCoreController } from './core/chatbot-core.controller.js';
import { MockProvider } from './providers/mock-provider.js';

// Import storage implementations
import { MemoryStorage, LocalStorageAdapter, IndexedDBStorage } from './storage/index.js';

// Note: Theme CSS is imported globally in .storybook/preview.ts
// No need to import themes here to avoid conflicts
import '../input/input.component.js';
import '../button/button.component.js';
import '../icon/icon.component.js';
import '../dropdown/dropdown.component.js';
import '../select/select.component.js';
import '../tag/tag.component.js';
import '../modal/modal.component.js';
import '../document/document.component.js';
import './chatbot.component.js';

const meta: Meta = {
  title: 'Components/Chatbot',
  component: 'nr-chatbot',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Chatbot Component with Controller Architecture

A modern, controller-based chatbot component that separates UI from business logic.

## Architecture

- **ChatbotCoreController**: Pure business logic, framework-agnostic
- **Providers**: Pluggable AI/API backends (OpenAI, Custom, Mock)
- **UI Component**: Lit-based web component that renders the chatbot

## Basic Usage

\`\`\`javascript
import { ChatbotCoreController, MockProvider } from '@nuraly/chatbot';

// Create controller with provider
const controller = new ChatbotCoreController({
  provider: new MockProvider(),
  ui: {
    onStateChange: (state) => {
      chatbot.messages = state.messages;
    }
  }
});

// Attach to component
chatbot.controller = controller;
\`\`\`
        `
      }
    }
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: Object.values(ChatbotSize),
      description: 'Chatbot size variant'
    },
    variant: {
      control: { type: 'select' },
      options: Object.values(ChatbotVariant),
      description: 'Chatbot visual variant'
    },
    loadingIndicator: {
      control: { type: 'select' },
      options: Object.values(ChatbotLoadingType),
      description: 'Loading indicator type'
    },
    isRTL: {
      control: { type: 'boolean' },
      description: 'Right-to-left text direction'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable input and interactions'
    },
    showSendButton: {
      control: { type: 'boolean' },
      description: 'Show send button'
    },
    autoScroll: {
      control: { type: 'boolean' },
      description: 'Auto-scroll to new messages'
    },
    showThreads: {
      control: { type: 'boolean' },
      description: 'Show thread sidebar'
    },
    boxed: {
      control: { type: 'boolean' },
      description: 'Enable boxed layout for large widths (ChatGPT-style)'
    },
    showMessages: {
      control: { type: 'boolean' },
      description: 'Show messages area (set to false for input-only mode)'
    },
    enableModuleSelection: {
      control: { type: 'boolean' },
      description: 'Enable module selection dropdown'
    }
  }
};

export default meta;
type Story = StoryObj;

// ===== SAMPLE DATA =====

const sampleSuggestions: ChatbotSuggestion[] = [
  { id: 'sugg1', text: 'What can you help me with?', enabled: true },
  { id: 'sugg2', text: 'Tell me about your features', enabled: true },
  { id: 'sugg3', text: 'How do I get started?', enabled: true },
  { id: 'sugg4', text: 'Show me an example', enabled: true }
];

const sampleModules: ChatbotModule[] = [
  { 
    id: 'web-search', 
    name: 'Web Search', 
    description: 'Search the web for information',
    icon: 'search',
    enabled: true 
  },
  { 
    id: 'file-analysis', 
    name: 'File Analysis', 
    description: 'Analyze uploaded files',
    icon: 'file-text',
    enabled: true 
  },
  { 
    id: 'code-generation', 
    name: 'Code Generation', 
    description: 'Generate code snippets',
    icon: 'code',
    enabled: true 
  }
];

// ===== HELPER FUNCTIONS =====

/**
 * Create a controller and sync it with a chatbot element
 */
function createControllerForElement(element: any, providerConfig: any = {}) {
  const controller = new ChatbotCoreController({
    provider: new MockProvider(providerConfig),
    ui: {
      onStateChange: (state) => {
        element.messages = state.messages;
        element.threads = state.threads;
        element.isBotTyping = state.isTyping;
        element.chatStarted = state.messages.length > 0;
      },
      onTypingStart: () => {
        element.isBotTyping = true;
      },
      onTypingEnd: () => {
        element.isBotTyping = false;
      }
    }
  });

  return controller;
}

// ===== STORIES =====

/**
 * Default chatbot with mock provider - Fully interactive!
 * Try asking questions and see contextual responses.
 */
export const Default: Story = {
  args: {
    size: ChatbotSize.Medium,
    variant: ChatbotVariant.Default,
    isRTL: false,
    disabled: false,
    showSendButton: true,
    autoScroll: true,
    showThreads: false,
    boxed: false
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('nr-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = createControllerForElement(chatbot, {
          delay: 600,
          streaming: true,
          streamingSpeed: 4,
          streamingInterval: 25,
          contextualResponses: true
        });
        chatbot.controller = controller;
        chatbot.suggestions = sampleSuggestions;
      }
    }, 0);

    return html`
      <div style="width: 500px; height: 600px;">
        <nr-chatbot
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Chatbot with streaming responses
 */
export const WithStreaming: Story = {
  args: {
    ...Default.args
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#streaming-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = createControllerForElement(chatbot, {
          delay: 500,
          streaming: true,
          streamingSpeed: 3,
          streamingInterval: 30,
          contextualResponses: true
        });
        chatbot.controller = controller;
        chatbot.suggestions = sampleSuggestions;
      }
    }, 0);

    return html`
      <div style="width: 500px; height: 600px;">
        <nr-chatbot
          id="streaming-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Chatbot with thread support - Create multiple conversations!
 * Try creating new threads and switching between them.
 */
export const WithThreads: Story = {
  args: {
    ...Default.args,
    showThreads: true
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#threaded-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        // Create controller with thread support enabled
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 500,
            streaming: true,
            streamingSpeed: 5,
            streamingInterval: 20,
            contextualResponses: true
          }),
          enableThreads: true,
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.threads = state.threads;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            },
            onTypingStart: () => {
              chatbot.isBotTyping = true;
            },
            onTypingEnd: () => {
              chatbot.isBotTyping = false;
            }
          }
        });
        
        chatbot.controller = controller;
        chatbot.suggestions = [
          { id: 'thread1', text: 'Start a conversation about AI', enabled: true },
          { id: 'thread2', text: 'Ask about programming', enabled: true },
          { id: 'thread3', text: 'Create a new thread', enabled: true },
          { id: 'thread4', text: 'Switch between threads', enabled: true }
        ];
        chatbot.enableThreadCreation = true;
      }
    }, 0);

    return html`
      <div style="width: 800px; height: 600px;">
        <nr-chatbot
          id="threaded-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Chatbot with module selection - Select modules and chat!
 * Try selecting different modules before sending messages.
 */
export const WithModules: Story = {
  args: {
    ...Default.args,
    enableModuleSelection: true
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#module-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = createControllerForElement(chatbot, {
          delay: 500,
          streaming: true,
          streamingSpeed: 5,
          streamingInterval: 20,
          contextualResponses: true
        });
        
        chatbot.controller = controller;
        chatbot.suggestions = [
          { id: 'mod1', text: 'Search the web for information', enabled: true },
          { id: 'mod2', text: 'Analyze this file', enabled: true },
          { id: 'mod3', text: 'Generate some code', enabled: true },
          { id: 'mod4', text: 'What modules are available?', enabled: true }
        ];
        chatbot.modules = sampleModules;
        chatbot.enableModuleSelection = true;
      }
    }, 0);

    return html`
      <div style="width: 500px; height: 600px;">
        <nr-chatbot
          id="module-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Boxed layout (ChatGPT-style) - Full-screen interactive experience!
 * Experience a ChatGPT-like interface with centered conversation.
 */
export const BoxedLayout: Story = {
  args: {
    ...Default.args,
    boxed: true
  },
  parameters: {
    layout: 'fullscreen'
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#boxed-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = createControllerForElement(chatbot, {
          delay: 400,
          streaming: true,
          streamingSpeed: 6,
          streamingInterval: 15,
          contextualResponses: true
        });
        chatbot.controller = controller;
        chatbot.suggestions = sampleSuggestions;
      }
    }, 0);

    return html`
      <div style="width: 100vw; height: 100vh; background: var(--nr-color-background, #f5f5f5);">
        <nr-chatbot
          id="boxed-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Interactive demo with initial messages
 */
export const WithInitialMessages: Story = {
  args: {
    ...Default.args
  },
  render: (args) => {
    const initialMessages: ChatbotMessage[] = [
      {
        id: 'welcome-1',
        sender: ChatbotSender.Bot,
        text: 'Hello! 👋 Welcome to the chatbot demo. I\'m powered by a mock provider that simulates realistic conversations.',
        timestamp: new Date().toISOString(),
        introduction: true
      },
      {
        id: 'welcome-2',
        sender: ChatbotSender.Bot,
        text: 'Try asking me questions! I can respond contextually to greetings, questions about features, and more.',
        timestamp: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      const chatbot = document.querySelector('#initial-messages-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 600,
            streaming: true,
            streamingSpeed: 4,
            streamingInterval: 25,
            contextualResponses: true
          }),
          initialMessages,
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            }
          }
        });
        
        chatbot.controller = controller;
        chatbot.suggestions = sampleSuggestions;
      }
    }, 0);

    return html`
      <div style="width: 500px; height: 600px;">
        <nr-chatbot
          id="initial-messages-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * RTL (Right-to-Left) layout demo - Interactive Arabic interface!
 * Try the Arabic suggestions or type your own messages.
 */
export const RTLLayout: Story = {
  args: {
    ...Default.args,
    isRTL: true
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#rtl-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = createControllerForElement(chatbot, {
          delay: 500,
          streaming: true,
          streamingSpeed: 3,
          streamingInterval: 30,
          contextualResponses: true
        });
        chatbot.controller = controller;
        chatbot.suggestions = [
          { id: 'rtl1', text: 'مرحبا كيف حالك؟', enabled: true },
          { id: 'rtl2', text: 'ما هي الميزات المتاحة؟', enabled: true },
          { id: 'rtl3', text: 'كيف يمكنني البدء؟', enabled: true },
          { id: 'rtl4', text: 'أخبرني عن نفسك', enabled: true }
        ];
      }
    }, 0);

    return html`
      <div style="width: 500px; height: 600px;">
        <nr-chatbot
          id="rtl-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Different size variants - All fully interactive!
 */
export const SizeVariants: Story = {
  render: () => {
    ['small', 'medium', 'large'].forEach((size) => {
      setTimeout(() => {
        const chatbot = document.querySelector(`#chatbot-${size}`) as any;
        if (chatbot && !chatbot.controller) {
          const controller = createControllerForElement(chatbot, {
            delay: 500,
            streaming: true,
            streamingSpeed: 4,
            streamingInterval: 25,
            contextualResponses: true
          });
          chatbot.controller = controller;
          chatbot.suggestions = sampleSuggestions;
        }
      }, 0);
    });

    return html`
      <div style="display: flex; gap: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 300px;">
          <h3>Small</h3>
          <div style="width: 100%; height: 400px;">
            <nr-chatbot
              id="chatbot-small"
              .size=${ChatbotSize.Small}
            ></nr-chatbot>
          </div>
        </div>
        <div style="flex: 1; min-width: 300px;">
          <h3>Medium</h3>
          <div style="width: 100%; height: 500px;">
            <nr-chatbot
              id="chatbot-medium"
              .size=${ChatbotSize.Medium}
            ></nr-chatbot>
          </div>
        </div>
        <div style="flex: 1; min-width: 300px;">
          <h3>Large</h3>
          <div style="width: 100%; height: 600px;">
            <nr-chatbot
              id="chatbot-large"
              .size=${ChatbotSize.Large}
            ></nr-chatbot>
          </div>
        </div>
      </div>
    `;
  }
};

/**
 * Custom provider configuration demo
 */
export const CustomConfiguration: Story = {
  args: {
    ...Default.args
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#custom-config-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        // Create controller with custom mock responses
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 400,
            streaming: true,
            streamingSpeed: 6,
            streamingInterval: 20,
            contextualResponses: true,
            customResponses: [
              "That's a great question! Let me provide you with a detailed answer...",
              "I understand your concern. Here's what I can tell you:",
              "Based on my knowledge, I would recommend the following approach:",
              "Excellent point! This is an important topic to discuss.",
              "Let me break this down for you in a simple way:"
            ]
          }),
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            },
            showNotification: (message, type) => {
              console.log(`[${type.toUpperCase()}]`, message);
            }
          }
        });
        
        chatbot.controller = controller;
        chatbot.suggestions = sampleSuggestions;
      }
    }, 0);

    return html`
      <div style="width: 500px; height: 600px;">
        <nr-chatbot
          id="custom-config-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Boxed layout with threads - ChatGPT-style with conversation management
 * Create multiple conversations and switch between them seamlessly!
 */
export const BoxedWithThreads: Story = {
  args: {
    ...Default.args,
    boxed: true,
    showThreads: true
  },
  parameters: {
    layout: 'fullscreen'
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#boxed-threads-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        // Create controller with thread support and file upload enabled
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 500,
            streaming: true,
            streamingSpeed: 5,
            streamingInterval: 20,
            contextualResponses: true
          }),
          enableThreads: true,
          enableFileUpload: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          allowedFileTypes: ['image/*', 'application/pdf', 'text/*', 'video/*', 'audio/*'],
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.threads = state.threads;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
              chatbot.uploadedFiles = state.uploadedFiles;
            },
            onTypingStart: () => {
              chatbot.isBotTyping = true;
            },
            onTypingEnd: () => {
              chatbot.isBotTyping = false;
            },
            focusInput: () => {
              chatbot.focusInput();
            },
            showNotification: (message, type) => {
              console.log(`[${type.toUpperCase()}] ${message}`);
            }
          }
        });
        
        chatbot.controller = controller;
        //chatbot.suggestions;
        chatbot.enableThreadCreation = true;
        chatbot.enableFileUpload = true;
        chatbot.actionButtons = [
          { type: 'attach', enabled: true }
        ];
      }
    }, 0);

    return html`
      <div style="width: 100vw; height: 100vh; background: var(--nr-color-background, #f5f5f5);">
        <nr-chatbot
          id="boxed-threads-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Message attachments: initial message shows file tags
 */
export const WithInitialMessageAttachments: Story = {
  args: {
    ...Default.args,
    boxed: false
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#attachments-initial-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 400,
            streaming: true,
            streamingSpeed: 4,
            streamingInterval: 20,
            contextualResponses: true
          }),
          initialMessages: [
            {
              id: 'intro',
              sender: ChatbotSender.Bot,
              text: 'Hi! I can analyze your files. Try sending a message with attachments.',
              timestamp: new Date().toISOString()
            },
            {
              id: 'with-files',
              sender: ChatbotSender.User,
              text: 'Please analyze the attached documents.',
              timestamp: new Date().toISOString(),
              files: [
                { id: 'f1', name: 'report.pdf', size: 123456, type: ChatbotFileType.Document, mimeType: 'application/pdf' },
                { id: 'f2', name: 'notes.txt', size: 2048, type: ChatbotFileType.Document, mimeType: 'text/plain' }
              ]
            }
          ],
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            }
          }
        });
        chatbot.controller = controller;
      }
    }, 0);

    return html`
      <div style="width: 500px; height: 600px;">
        <nr-chatbot
          id="attachments-initial-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Message attachments: attach files, then send to see tags move to the message
 */
export const WithFileUploadAttachments: Story = {
  args: {
    ...Default.args,
    boxed: false
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#attachments-upload-chatbot') as any;
      const attachBtn = document.querySelector('#attach-sample-file') as HTMLButtonElement | null;
      const sendBtn = document.querySelector('#send-with-files') as HTMLButtonElement | null;

      if (chatbot && !chatbot.controller) {
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 400,
            streaming: true,
            streamingSpeed: 4,
            streamingInterval: 20,
            contextualResponses: true
          }),
          enableFileUpload: true,
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
              chatbot.uploadedFiles = state.uploadedFiles;
            }
          }
        });
        chatbot.controller = controller;
        chatbot.enableFileUpload = true;
      }

      // Wire demo buttons
      if (attachBtn) {
        attachBtn.onclick = async () => {
          const chatbotEl = document.querySelector('#attachments-upload-chatbot') as any;
          const controller = chatbotEl?.controller as ChatbotCoreController | undefined;
          if (!controller) return;
          // Create a sample File via Blob
          const pdfBlob = new Blob([new Uint8Array([0x25,0x50,0x44,0x46])], { type: 'application/pdf' });
          const txtBlob = new Blob(['Sample notes'], { type: 'text/plain' });
          const pdf = new File([pdfBlob], 'sample.pdf', { type: 'application/pdf' });
          const txt = new File([txtBlob], 'notes.txt', { type: 'text/plain' });
          await controller.uploadFiles([pdf, txt]);
        };
      }

      if (sendBtn) {
        sendBtn.onclick = async () => {
          const chatbotEl = document.querySelector('#attachments-upload-chatbot') as any;
          const controller = chatbotEl?.controller as ChatbotCoreController | undefined;
          if (!controller) return;
          const files = controller.getUploadedFiles();
          await controller.sendMessage('Analyze the attached files, please.', { files });
          controller.clearFiles();
        };
      }
    }, 0);

    return html`
      <div style="display: grid; gap: 12px; width: 520px;">
        <div style="display:flex; gap: 8px; align-items:center;">
          <button id="attach-sample-file" type="button">Attach sample files</button>
          <button id="send-with-files" type="button">Send with files</button>
          <span style="color:#666; font-size:12px;">Or use the Attach button inside the chatbot</span>
        </div>
        <div style="width: 500px; height: 600px;">
          <nr-chatbot
            id="attachments-upload-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .isRTL=${args.isRTL}
            .disabled=${args.disabled}
            .showSendButton=${args.showSendButton}
            .autoScroll=${args.autoScroll}
            .showThreads=${args.showThreads}
            .boxed=${args.boxed}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Storage - Memory Storage (Non-persistent)
 * Messages are stored in memory only - lost on page refresh.
 * Try sending messages and note they disappear when you refresh the page.
 */
export const StorageMemory: Story = {
  args: {
    ...Default.args,
    showThreads: true
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#storage-memory-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 500,
            streaming: true,
            streamingSpeed: 5,
            streamingInterval: 20,
            contextualResponses: true
          }),
          storage: new MemoryStorage(),
          enableThreads: true,
          autoSaveInterval: 1000, // Auto-save every 1 second
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.threads = state.threads;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            },
            onTypingStart: () => {
              chatbot.isBotTyping = true;
            },
            onTypingEnd: () => {
              chatbot.isBotTyping = false;
            },
            showNotification: (message, type) => {
              console.log(`[MemoryStorage ${type.toUpperCase()}] ${message}`);
            }
          }
        });
        
        chatbot.controller = controller;
        chatbot.suggestions = [
          { id: 'mem1', text: 'Send a message', enabled: true },
          { id: 'mem2', text: 'Create a thread', enabled: true },
          { id: 'mem3', text: 'Messages will be lost on refresh!', enabled: true }
        ];
        chatbot.enableThreadCreation = true;
        
        // Display storage info
        setTimeout(() => {
          console.log('[MemoryStorage] Using in-memory storage - data will be lost on page refresh');
        }, 100);
      }
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="padding: 16px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #856404;">🔄 Memory Storage</h3>
          <p style="margin: 0; color: #856404;">
            Messages are stored in memory only and <strong>will be lost on page refresh</strong>.
            Perfect for temporary conversations or demos.
          </p>
        </div>
        <div style="width: 800px; height: 600px;">
          <nr-chatbot
            id="storage-memory-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .isRTL=${args.isRTL}
            .disabled=${args.disabled}
            .showSendButton=${args.showSendButton}
            .autoScroll=${args.autoScroll}
            .showThreads=${args.showThreads}
            .boxed=${args.boxed}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Storage - LocalStorage (Persistent)
 * Messages persist across page refreshes using browser's localStorage.
 * Try sending messages, refresh the page, and see them still there!
 */
export const StorageLocalStorage: Story = {
  args: {
    ...Default.args,
    showThreads: true
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#storage-localstorage-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 500,
            streaming: true,
            streamingSpeed: 5,
            streamingInterval: 20,
            contextualResponses: true
          }),
          storage: new LocalStorageAdapter(),
          enableThreads: true,
          autoSaveInterval: 2000, // Auto-save every 2 seconds
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.threads = state.threads;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            },
            onTypingStart: () => {
              chatbot.isBotTyping = true;
            },
            onTypingEnd: () => {
              chatbot.isBotTyping = false;
            },
            showNotification: (message, type) => {
              console.log(`[LocalStorage ${type.toUpperCase()}] ${message}`);
            }
          }
        });
        
        chatbot.controller = controller;
        chatbot.suggestions = [
          { id: 'local1', text: 'Send a message and refresh!', enabled: true },
          { id: 'local2', text: 'Create multiple threads', enabled: true },
          { id: 'local3', text: 'Messages persist across refreshes', enabled: true }
        ];
        chatbot.enableThreadCreation = true;
        
        // Load persisted data
        setTimeout(async () => {
          try {
            await controller.loadFromStorage('chatbot-state');
            console.log('[LocalStorage] Successfully loaded persisted conversation history');
          } catch (error) {
            console.log('[LocalStorage] No persisted data found - starting fresh');
          }
        }, 100);
      }
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="padding: 16px; background: #d1ecf1; border: 1px solid #17a2b8; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #0c5460;">💾 LocalStorage Persistence</h3>
          <p style="margin: 0 0 8px 0; color: #0c5460;">
            Messages persist across page refreshes using <strong>localStorage</strong>.
            Try sending messages, then refresh the page!
          </p>
          <button 
            onclick="localStorage.clear(); location.reload();" 
            style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
            🗑️ Clear Storage & Reload
          </button>
        </div>
        <div style="width: 800px; height: 600px;">
          <nr-chatbot
            id="storage-localstorage-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .isRTL=${args.isRTL}
            .disabled=${args.disabled}
            .showSendButton=${args.showSendButton}
            .autoScroll=${args.autoScroll}
            .showThreads=${args.showThreads}
            .boxed=${args.boxed}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Storage - IndexedDB (High Performance)
 * Messages persist using IndexedDB for larger datasets and better performance.
 * Ideal for production applications with extensive conversation history.
 */
export const StorageIndexedDB: Story = {
  args: {
    ...Default.args,
    showThreads: true
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#storage-indexeddb-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const indexedDBStorage = new IndexedDBStorage('chatbot-demo-db', 'conversations');
        
        const controller = new ChatbotCoreController({
          provider: new MockProvider({
            delay: 500,
            streaming: true,
            streamingSpeed: 5,
            streamingInterval: 20,
            contextualResponses: true
          }),
          storage: indexedDBStorage,
          enableThreads: true,
          autoSaveInterval: 3000, // Auto-save every 3 seconds
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.threads = state.threads;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            },
            onTypingStart: () => {
              chatbot.isBotTyping = true;
            },
            onTypingEnd: () => {
              chatbot.isBotTyping = false;
            },
            showNotification: (message, type) => {
              console.log(`[IndexedDB ${type.toUpperCase()}] ${message}`);
            }
          }
        });
        
        chatbot.controller = controller;
        chatbot.suggestions = [
          { id: 'idb1', text: 'High performance storage', enabled: true },
          { id: 'idb2', text: 'Handles large datasets', enabled: true },
          { id: 'idb3', text: 'Production-ready persistence', enabled: true }
        ];
        chatbot.enableThreadCreation = true;
        
        // Load persisted data
        setTimeout(async () => {
          try {
            await controller.loadFromStorage('chatbot-state');
            console.log('[IndexedDB] Successfully loaded persisted conversation history');
          } catch (error) {
            console.log('[IndexedDB] No persisted data found - starting fresh');
          }
        }, 100);
      }
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="padding: 16px; background: #d4edda; border: 1px solid #28a745; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0; color: #155724;">🚀 IndexedDB Storage</h3>
          <p style="margin: 0 0 8px 0; color: #155724;">
            High-performance persistent storage using <strong>IndexedDB</strong>.
            Perfect for production apps with extensive conversation history.
          </p>
          <div style="display: flex; gap: 8px;">
            <button 
              onclick="
                const db = indexedDB.open('chatbot-demo-db');
                db.onsuccess = (e) => {
                  const database = e.target.result;
                  const transaction = database.transaction(['conversations'], 'readwrite');
                  const store = transaction.objectStore('conversations');
                  store.clear();
                  console.log('[IndexedDB] Cleared all data');
                  setTimeout(() => location.reload(), 500);
                };
              " 
              style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
              🗑️ Clear IndexedDB & Reload
            </button>
            <button 
              onclick="
                const db = indexedDB.open('chatbot-demo-db');
                db.onsuccess = (e) => {
                  const database = e.target.result;
                  const transaction = database.transaction(['conversations'], 'readonly');
                  const store = transaction.objectStore('conversations');
                  const request = store.get('chatbot-state');
                  request.onsuccess = () => {
                    console.log('[IndexedDB] Current state:', request.result);
                    alert('Check console for IndexedDB data');
                  };
                };
              " 
              style="padding: 8px 16px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer;">
              🔍 Inspect Data
            </button>
          </div>
        </div>
        <div style="width: 800px; height: 600px;">
          <nr-chatbot
            id="storage-indexeddb-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .isRTL=${args.isRTL}
            .disabled=${args.disabled}
            .showSendButton=${args.showSendButton}
            .autoScroll=${args.autoScroll}
            .showThreads=${args.showThreads}
            .boxed=${args.boxed}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Storage Comparison - See all three storage types side by side
 * Compare Memory, LocalStorage, and IndexedDB implementations.
 */
export const StorageComparison: Story = {
  args: {
    ...Default.args,
    showThreads: false
  },
  render: (args) => {
    ['memory', 'localstorage', 'indexeddb'].forEach((storageType) => {
      setTimeout(() => {
        const chatbot = document.querySelector(`#chatbot-${storageType}`) as any;
        if (chatbot && !chatbot.controller) {
          let storage;
          let storageLabel;
          
          if (storageType === 'memory') {
            storage = new MemoryStorage();
            storageLabel = 'Memory';
          } else if (storageType === 'localstorage') {
            storage = new LocalStorageAdapter();
            storageLabel = 'LocalStorage';
          } else {
            storage = new IndexedDBStorage(`chatbot-${storageType}-db`, 'messages');
            storageLabel = 'IndexedDB';
          }
          
          const controller = new ChatbotCoreController({
            provider: new MockProvider({
              delay: 300,
              streaming: true,
              streamingSpeed: 8,
              streamingInterval: 15,
              contextualResponses: true
            }),
            storage,
            enableThreads: false,
            autoSaveInterval: 2000,
            ui: {
              onStateChange: (state) => {
                chatbot.messages = state.messages;
                chatbot.isBotTyping = state.isTyping;
                chatbot.chatStarted = state.messages.length > 0;
              },
              showNotification: (message, type) => {
                console.log(`[${storageLabel} ${type.toUpperCase()}] ${message}`);
              }
            }
          });
          
          chatbot.controller = controller;
          chatbot.suggestions = [
            { id: `${storageType}-1`, text: `Test ${storageLabel}`, enabled: true }
          ];
        }
      }, 0);
    });

    return html`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="padding: 16px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;">
          <h3 style="margin: 0 0 8px 0;">📊 Storage Comparison</h3>
          <p style="margin: 0;">
            Compare all three storage implementations side by side. 
            Send messages to each and refresh to see persistence differences.
          </p>
        </div>
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <h4 style="margin: 0 0 8px 0; padding: 8px; background: #fff3cd; border-radius: 4px;">
              🔄 Memory Storage
            </h4>
            <div style="width: 100%; height: 450px;">
              <nr-chatbot
                id="chatbot-memory"
                .size=${ChatbotSize.Small}
                .variant=${args.variant}
                .showSendButton=${true}
                .autoScroll=${true}
              ></nr-chatbot>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">
              ⚠️ Lost on refresh
            </p>
          </div>
          <div style="flex: 1; min-width: 300px;">
            <h4 style="margin: 0 0 8px 0; padding: 8px; background: #d1ecf1; border-radius: 4px;">
              💾 LocalStorage
            </h4>
            <div style="width: 100%; height: 450px;">
              <nr-chatbot
                id="chatbot-localstorage"
                .size=${ChatbotSize.Small}
                .variant=${args.variant}
                .showSendButton=${true}
                .autoScroll=${true}
              ></nr-chatbot>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">
              ✅ Persists across refreshes
            </p>
          </div>
          <div style="flex: 1; min-width: 300px;">
            <h4 style="margin: 0 0 8px 0; padding: 8px; background: #d4edda; border-radius: 4px;">
              🚀 IndexedDB
            </h4>
            <div style="width: 100%; height: 450px;">
              <nr-chatbot
                id="chatbot-indexeddb"
                .size=${ChatbotSize.Small}
                .variant=${args.variant}
                .showSendButton=${true}
                .autoScroll=${true}
              ></nr-chatbot>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">
              ✅ High performance persistence
            </p>
          </div>
        </div>
      </div>
    `;
  }
};

/**
 * Custom API Provider with Custom Headers - Test multipart/form-data streaming
 * Tests CustomAPIProvider with custom Content-Type headers and streaming text/plain response.
 */
export const CustomAPIWithHeaders: Story = {
  args: {
    ...Default.args,
    boxed: true,
    showThreads: false
  },
  parameters: {
    layout: 'fullscreen'
  },
  render: (args) => {
    // Mock fetch to simulate streaming text/plain response
    const originalFetch = window.fetch;
    const mockFetch = async (url: string | URL | Request, options?: RequestInit) => {
      if (url.toString().includes('/api/v3/iassistant/text-processing')) {
        console.log('🎯 Intercepted API call to:', url);
        console.log('📦 Request options:', options);
        
        // Simulate streaming text/plain response
        const responseText = 'This is a simulated streaming response from the API. It demonstrates how the chatbot handles text/plain content type with streaming. Each chunk arrives progressively to create a typewriter effect. 🎉';
        
        const stream = new ReadableStream({
          start(controller) {
            let index = 0;
            const interval = setInterval(() => {
              if (index < responseText.length) {
                // Send 1-3 characters at a time to simulate realistic streaming
                const chunkSize = Math.floor(Math.random() * 3) + 1;
                const chunk = responseText.slice(index, index + chunkSize);
                controller.enqueue(new TextEncoder().encode(chunk));
                index += chunkSize;
              } else {
                clearInterval(interval);
                controller.close();
              }
            }, 50); // 50ms delay between chunks
          }
        });

        return new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            'Transfer-Encoding': 'chunked'
          }
        });
      }
      return originalFetch(url, options);
    };

    setTimeout(async () => {
      const chatbot = document.querySelector('#custom-api-headers-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        // Temporarily replace fetch
        window.fetch = mockFetch as any;
        
        // Import CustomAPIProvider
        const { CustomAPIProvider } = await import('./providers/custom-api-provider.js');
        
        // Extend CustomAPIProvider to override buildPayload
        class ExtendedAPIProvider extends CustomAPIProvider {
          buildPayload(text: string, context: any): any {
            console.log('📤 Building payload with context:', context);
            const payload = {
              userText: text,
              variables: context.metadata || {},
              tag: context.metadata?.tag || 'default',
              stream: true
            };
            console.log('📤 Payload:', payload);
            return payload;
          }
        }

        const provider = new ExtendedAPIProvider();
        
        // Connect with custom headers
        try {
          await provider.connect({
            apiUrl: '/api/v3/iassistant/text-processing',
            headers: {
              'accept': 'text/plain',
              'Content-Type': 'multipart/form-data'
            }
          });
          console.log('✅ CustomAPIProvider connected with custom headers');
          console.log('📋 Headers configured for multipart/form-data with text/plain streaming');
        } catch (error) {
          console.error('❌ Failed to connect:', error);
        }

        const controller = new ChatbotCoreController({
          provider,
          enableThreads: false,
          enableFileUpload: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxFiles: 5,
          allowedFileTypes: ['image/*', 'application/pdf', 'text/*', 'video/*', 'audio/*'],
          metadata: {
            tag: 'summarize'
          },
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.threads = state.threads;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
              chatbot.uploadedFiles = state.uploadedFiles;
            },
            onTypingStart: () => { chatbot.isBotTyping = true; },
            onTypingEnd: () => { chatbot.isBotTyping = false; },
            focusInput: () => { chatbot.focusInput(); },
            showNotification: (message, type) => {
              console.log(`[${type.toUpperCase()}] ${message}`);
            }
          }
        });

        chatbot.controller = controller;
        chatbot.enableThreadCreation = false;
        chatbot.enableFileUpload = true;
        chatbot.actionButtons = [
          { type: 'attach', enabled: true }
        ];
        
        chatbot.suggestions = [
          { id: 'test1', text: 'Test streaming response', enabled: true },
          { id: 'test2', text: 'Send with multipart/form-data', enabled: true },
          { id: 'test3', text: 'Check console for logs', enabled: true }
        ];

        // Cleanup on unmount
        const cleanup = () => {
          window.fetch = originalFetch;
        };
        
        // Store cleanup for later
        (window as any).__storyCleanup = cleanup;
      }
    }, 0);

    return html`
      <div style="width: 100vw; height: 100vh; background: var(--nr-color-background, #f5f5f5);">
        <div style="position: absolute; top: 16px; left: 16px; right: 16px; z-index: 1000; padding: 16px; background: #fff; border: 2px solid #28a745; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 8px 0; color: #155724;">🎬 Custom API Provider - Streaming Test</h3>
          <p style="margin: 0 0 8px 0; color: #155724; font-size: 14px;">
            This story tests <strong>multipart/form-data</strong> with <strong>text/plain streaming</strong>:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #155724; font-size: 13px;">
            <li>✅ <strong>Request:</strong> multipart/form-data (FormData fields)</li>
            <li>✅ <strong>Response:</strong> text/plain with streaming</li>
            <li>✅ <strong>Metadata tag:</strong> summarize</li>
            <li>✅ <strong>Effect:</strong> Typewriter streaming animation</li>
          </ul>
          <p style="margin: 8px 0 0 0; color: #0c5460; font-size: 12px; background: #d1ecf1; padding: 8px; border-radius: 4px;">
            💡 <strong>Try it:</strong> Send a message and watch it stream character by character! 
            Open the <strong>Console</strong> to see request/response logs.
          </p>
        </div>
        <nr-chatbot
          id="custom-api-headers-chatbot"
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
          style="padding-top: 220px;"
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Custom API Provider - Error Handling Showcase
 * Demonstrates styled error messages in the chat.
 */
export const CustomAPIErrorHandling: Story = {
  args: {
    ...Default.args,
    boxed: false
  },
  render: (args) => {
    // Mock fetch to simulate different error scenarios
    const originalFetch = window.fetch;
    let errorScenario = 0;
    
    const mockFetch = async (url: string | URL | Request, options?: RequestInit) => {
      if (url.toString().includes('/api/v3/iassistant/text-processing')) {
        console.log('🎯 Intercepted API call - Scenario:', errorScenario);
        
        // Cycle through different error scenarios
        const scenarios = [
          // Scenario 0: Success
          () => {
            const stream = new ReadableStream({
              start(controller) {
                const text = '✅ Success! This is a successful streaming response.';
                let index = 0;
                const interval = setInterval(() => {
                  if (index < text.length) {
                    controller.enqueue(new TextEncoder().encode(text[index]));
                    index++;
                  } else {
                    clearInterval(interval);
                    controller.close();
                  }
                }, 30);
              }
            });
            return new Response(stream, {
              status: 200,
              headers: { 'Content-Type': 'text/plain' }
            });
          },
          // Scenario 1: 404 Not Found
          () => new Response('The requested endpoint was not found on this server.', {
            status: 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'text/plain' }
          }),
          // Scenario 2: 500 Internal Server Error  
          () => new Response('An internal server error occurred while processing your request.', {
            status: 500,
            statusText: 'Internal Server Error',
            headers: { 'Content-Type': 'text/plain' }
          }),
          // Scenario 3: 401 Unauthorized
          () => new Response('You must be authenticated to access this resource.', {
            status: 401,
            statusText: 'Unauthorized',
            headers: { 'Content-Type': 'text/plain' }
          }),
          // Scenario 4: Network error (simulated)
          () => Promise.reject(new Error('Failed to fetch: Network connection was lost')),
          // Scenario 5: Streaming error mid-stream
          () => {
            const stream = new ReadableStream({
              start(controller) {
                const text = 'Starting to stream response... ';
                controller.enqueue(new TextEncoder().encode(text));
                setTimeout(() => {
                  controller.error(new Error('Connection interrupted while streaming'));
                }, 100);
              }
            });
            return new Response(stream, {
              status: 200,
              headers: { 'Content-Type': 'text/plain' }
            });
          }
        ];
        
        const scenario = scenarios[errorScenario % scenarios.length];
        errorScenario = (errorScenario + 1) % scenarios.length;
        
        return scenario();
      }
      return originalFetch(url, options);
    };

    setTimeout(async () => {
      const chatbot = document.querySelector('#error-handling-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        window.fetch = mockFetch as any;
        
        const { CustomAPIProvider } = await import('./providers/custom-api-provider.js');
        
        class ExtendedAPIProvider extends CustomAPIProvider {
          buildPayload(text: string, context: any): any {
            return {
              userText: text,
              variables: context.metadata || {},
              tag: context.metadata?.tag || 'default',
              stream: true
            };
          }
        }

        const provider = new ExtendedAPIProvider();
        
        await provider.connect({
          apiUrl: '/api/v3/iassistant/text-processing',
          headers: {
            'accept': 'text/plain',
            'Content-Type': 'multipart/form-data'
          }
        });

        const controller = new ChatbotCoreController({
          provider,
          metadata: { tag: 'test' },
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            },
            onTypingStart: () => { chatbot.isBotTyping = true; },
            onTypingEnd: () => { chatbot.isBotTyping = false; },
            focusInput: () => { chatbot.focusInput(); }
          }
        });

        chatbot.controller = controller;
        chatbot.suggestions = [
          { id: 'test1', text: 'Test success (1st)', enabled: true },
          { id: 'test2', text: 'Test 404 error (2nd)', enabled: true },
          { id: 'test3', text: 'Test 500 error (3rd)', enabled: true },
          { id: 'test4', text: 'Test 401 error (4th)', enabled: true },
          { id: 'test5', text: 'Test network error (5th)', enabled: true },
          { id: 'test6', text: 'Test stream error (6th)', enabled: true }
        ];

        (window as any).__storyCleanup = () => {
          window.fetch = originalFetch;
        };
      }
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; max-width: 800px;">
        <div style="padding: 16px; background: #fff; border: 2px solid #dc3545; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 8px 0; color: #721c24;">🚨 Styled Error Handling</h3>
          <p style="margin: 0 0 8px 0; color: #721c24; font-size: 14px;">
            Errors are displayed in a styled container with a title and description:
          </p>
          <ul style="margin: 0; padding-left: 20px; color: #721c24; font-size: 13px;">
            <li><strong>1st message:</strong> ✅ Success - Normal streaming response</li>
            <li><strong>2nd message:</strong> ⚠️ 404 Not Found error</li>
            <li><strong>3rd message:</strong> ⚠️ 500 Internal Server Error</li>
            <li><strong>4th message:</strong> ⚠️ 401 Unauthorized error</li>
            <li><strong>5th message:</strong> ⚠️ Network connection error</li>
            <li><strong>6th message:</strong> ⚠️ Streaming interrupted mid-stream</li>
          </ul>
          <p style="margin: 8px 0 0 0; color: #0c5460; font-size: 12px; background: #d1ecf1; padding: 8px; border-radius: 4px;">
            💡 <strong>Try it:</strong> Send messages one by one to see each error type with styled formatting!
          </p>
        </div>
        <div style="width: 100%; height: 600px; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden;">
          <nr-chatbot
            id="error-handling-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .showSendButton=${true}
            .autoScroll=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Mock API with Conversation Loading
 * Tests overriding conversation loading by mocking fetch API to simulate:
 * - Loading existing conversations from API
 * - Creating new conversations
 * - Switching between conversations
 * - Deleting conversations
 */
export const MockAPIWithConversationLoading: Story = {
  args: {
    ...Default.args,
    showThreads: true
  },
  render: (args) => {
    const originalFetch = window.fetch;

    // Mock conversation data
    const mockConversations = [
      {
        id: 'conv_1',
        title: 'Product Recommendations',
        messages: [
          {
            id: 'msg_1',
            text: 'Can you recommend a laptop for programming?',
            sender: 'user' as ChatbotSender,
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'msg_2',
            text: 'I recommend the MacBook Pro M3 for development work. It offers excellent performance, long battery life, and a great development environment with macOS.',
            sender: 'bot' as ChatbotSender,
            timestamp: new Date(Date.now() - 3590000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3590000).toISOString()
      },
      {
        id: 'conv_2',
        title: 'Web Development Tips',
        messages: [
          {
            id: 'msg_3',
            text: 'What are the best practices for React development?',
            sender: 'user' as ChatbotSender,
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'msg_4',
            text: 'Key React best practices include: 1) Use functional components with hooks, 2) Keep components small and focused, 3) Use proper state management, 4) Implement code splitting, and 5) Follow the single responsibility principle.',
            sender: 'bot' as ChatbotSender,
            timestamp: new Date(Date.now() - 86395000).toISOString()
          },
          {
            id: 'msg_5',
            text: 'How about TypeScript integration?',
            sender: 'user' as ChatbotSender,
            timestamp: new Date(Date.now() - 86300000).toISOString()
          },
          {
            id: 'msg_6',
            text: 'TypeScript with React is highly recommended! It provides type safety, better IDE support, and catches errors at compile time. Use proper typing for props, state, and events.',
            sender: 'bot' as ChatbotSender,
            timestamp: new Date(Date.now() - 86295000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86295000).toISOString()
      },
      {
        id: 'conv_3',
        title: 'Database Design Question',
        messages: [
          {
            id: 'msg_7',
            text: 'What database should I use for a high-traffic app?',
            sender: 'user' as ChatbotSender,
            timestamp: new Date(Date.now() - 259200000).toISOString()
          },
          {
            id: 'msg_8',
            text: 'For high-traffic applications, consider PostgreSQL for relational data or MongoDB for document-based data. Redis is excellent for caching. The choice depends on your data structure and query patterns.',
            sender: 'bot' as ChatbotSender,
            timestamp: new Date(Date.now() - 259195000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 259195000).toISOString()
      }
    ];

    let conversationStore = [...mockConversations];

    // Mock fetch implementation
    const mockFetch = async (url: string | URL | Request, options?: RequestInit) => {
      const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
      
      // Mock: Load specific conversation (check this BEFORE the list endpoint)
      if (urlString.match(/\/api\/conversations\/[^/?]+$/) && (!options?.method || options?.method === 'GET')) {
        const conversationId = urlString.split('/').pop();
        const conversation = conversationStore.find(c => c.id === conversationId);
        
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        
        if (conversation) {
          return new Response(JSON.stringify(conversation), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({ error: 'Conversation not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Mock: Load conversations list
      if (urlString.includes('/api/conversations') && (!options?.method || options?.method === 'GET')) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        return new Response(JSON.stringify({
          conversations: conversationStore.map(c => ({
            id: c.id,
            title: c.title,
            messageCount: c.messages.length,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
          }))
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Mock: Create new conversation
      if (urlString.includes('/api/conversations') && options?.method === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay
        
        const body = JSON.parse(options?.body as string || '{}');
        const newConversation = {
          id: `conv_${Date.now()}`,
          title: body.title || `Chat ${conversationStore.length + 1}`,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        conversationStore = [newConversation, ...conversationStore];
        
        return new Response(JSON.stringify(newConversation), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Mock: Delete conversation
      if (urlString.match(/\/api\/conversations\/[^/]+$/) && options?.method === 'DELETE') {
        const conversationId = urlString.split('/').pop();
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
        
        conversationStore = conversationStore.filter(c => c.id !== conversationId);
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Mock: Send message to conversation (streaming response)
      if (urlString.includes('/api/chat') && options?.method === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const body = JSON.parse(options?.body as string || '{}');
        const userMessage = body.message || body.userMessage || body.text;
        
        // Generate AI response based on keywords
        let aiResponse = 'I understand your question. Let me help you with that.';
        
        if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
          aiResponse = 'Hello! 👋 How can I assist you today?';
        } else if (userMessage.toLowerCase().includes('api')) {
          aiResponse = 'APIs are essential for modern web development. They allow different applications to communicate with each other. RESTful APIs are the most common, using HTTP methods like GET, POST, PUT, and DELETE.';
        } else if (userMessage.toLowerCase().includes('conversation') || userMessage.toLowerCase().includes('thread')) {
          aiResponse = 'This chatbot supports multiple conversations! You can create new threads, switch between them, and each conversation maintains its own history. Try creating a new conversation using the sidebar.';
        } else if (userMessage.toLowerCase().includes('help')) {
          aiResponse = 'I can help you with:\n• Web development questions\n• Programming best practices\n• Technology recommendations\n• Code architecture advice\n\nJust ask me anything!';
        }
        
        // Stream the response
        const stream = new ReadableStream({
          async start(controller) {
            for (let i = 0; i < aiResponse.length; i++) {
              await new Promise(resolve => setTimeout(resolve, 20));
              controller.enqueue(new TextEncoder().encode(aiResponse[i]));
            }
            controller.close();
          }
        });
        
        return new Response(stream, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      // Fallback to original fetch for other requests
      return originalFetch(url, options);
    };

    setTimeout(async () => {
      const chatbot = document.querySelector('#conversation-loading-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        // Override fetch
        window.fetch = mockFetch as any;
        
        const { CustomAPIProvider } = await import('./providers/custom-api-provider.js');
        
        // Type definitions for API responses
        interface ConversationSummary {
          id: string;
          title: string;
          messageCount: number;
          createdAt: string;
          updatedAt: string;
        }

        interface ConversationDetail extends ConversationSummary {
          messages: ChatbotMessage[];
        }

        interface ConversationsListResponse {
          conversations: ConversationSummary[];
        }
        
        // Extended provider with conversation loading support
        class ConversationAPIProvider extends CustomAPIProvider {
          async loadConversations(): Promise<ConversationSummary[]> {
            try {
              const response = await fetch('/api/conversations', { method: 'GET' });
              const data: ConversationsListResponse = await response.json();
              return data.conversations || [];
            } catch (error) {
              console.error('Failed to load conversations:', error);
              return [];
            }
          }

          async loadConversation(conversationId: string): Promise<ConversationDetail | null> {
            try {
              const response = await fetch(`/api/conversations/${conversationId}`, { method: 'GET' });
              return await response.json() as ConversationDetail;
            } catch (error) {
              console.error(`Failed to load conversation ${conversationId}:`, error);
              return null;
            }
          }

          async createConversation(title?: string): Promise<ConversationDetail | null> {
            try {
              const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
              });
              return await response.json() as ConversationDetail;
            } catch (error) {
              console.error('Failed to create conversation:', error);
              return null;
            }
          }

          async deleteConversation(conversationId: string): Promise<boolean> {
            try {
              const response = await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' });
              return response.ok;
            } catch (error) {
              console.error(`Failed to delete conversation ${conversationId}:`, error);
              return false;
            }
          }

          buildPayload(text: string, context: any): any {
            return {
              message: text,
              conversationId: context.conversationId,
              metadata: context.metadata || {}
            };
          }
        }

        const provider = new ConversationAPIProvider();
        
        await provider.connect({
          apiUrl: '/api/chat',
          headers: {
            'accept': 'text/plain',
            'Content-Type': 'application/json'
          }
        });

        // Create controller with threads enabled
        const controller = new ChatbotCoreController({
          provider,
          enableThreads: true,
          ui: {
            onStateChange: (state) => {
              chatbot.messages = state.messages;
              chatbot.threads = state.threads;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            },
            onTypingStart: () => { chatbot.isBotTyping = true; },
            onTypingEnd: () => { chatbot.isBotTyping = false; },
            focusInput: () => { chatbot.focusInput(); }
          }
        });

        chatbot.controller = controller;

        // Listen to thread events for debugging and state sync
        controller.on('thread:selected', (thread) => {
          console.log('Thread selected event:', thread);
          const state = controller.getState();
          console.log('Current state after selection:', {
            currentThreadId: state.currentThreadId,
            messagesCount: state.messages.length,
            threadsCount: state.threads.length
          });
          // Force update the UI
          chatbot.messages = state.messages;
          chatbot.threads = state.threads;
          chatbot.chatStarted = state.messages.length > 0;
        });

        controller.on('thread:created', (thread) => {
          console.log('Thread created event:', thread);
          const state = controller.getState();
          chatbot.threads = state.threads;
        });

        controller.on('thread:deleted', (threadId) => {
          console.log('Thread deleted event:', threadId);
          const state = controller.getState();
          chatbot.threads = state.threads;
          chatbot.messages = state.messages;
          chatbot.chatStarted = state.messages.length > 0;
        });

        // Load existing conversations from API
        try {
          const conversations = await provider.loadConversations();
          console.log('Loaded conversations:', conversations);
          
          // Convert API conversations to threads
          const loadedThreads: ChatbotThread[] = [];
          for (const conv of conversations) {
            const fullConversation = await provider.loadConversation(conv.id);
            if (fullConversation) {
              console.log('Loaded full conversation:', fullConversation);
              const thread: ChatbotThread = {
                id: fullConversation.id,
                title: fullConversation.title,
                messages: fullConversation.messages || [],
                createdAt: fullConversation.createdAt,
                updatedAt: fullConversation.updatedAt
              };
              loadedThreads.push(thread);
            }
          }

          // Add all threads to controller state at once
          if (loadedThreads.length > 0) {
            console.log('Setting initial state with threads:', loadedThreads);
            const currentState = controller.getState();
            controller.setState({
              threads: loadedThreads,
              currentThreadId: loadedThreads[0].id,
              messages: [...loadedThreads[0].messages],
              isTyping: false
            });
            
            console.log('State after initialization:', controller.getState());
            
            // Force UI update
            chatbot.threads = loadedThreads;
            chatbot.messages = [...loadedThreads[0].messages];
            chatbot.chatStarted = loadedThreads[0].messages.length > 0;
            
            console.log('UI updated - messages:', chatbot.messages.length, 'threads:', chatbot.threads.length);
          }
        } catch (error) {
          console.error('Failed to initialize conversations:', error);
        }

        chatbot.suggestions = [
          { id: 'api', text: 'Tell me about APIs', enabled: true },
          { id: 'threads', text: 'How do conversations work?', enabled: true },
          { id: 'help', text: 'What can you help with?', enabled: true }
        ];

        // Store cleanup function
        (window as any).__storyCleanup = () => {
          window.fetch = originalFetch;
        };
      }
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; max-width: 1200px;">
        <div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); color: white;">
          <h3 style="margin: 0 0 12px 0; font-size: 20px;">💬 Mock API with Conversation Loading</h3>
          <p style="margin: 0 0 12px 0; font-size: 14px; opacity: 0.95;">
            This story demonstrates loading existing conversations from a mocked API backend.
          </p>
          <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">🔄 Mocked API Endpoints:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; opacity: 0.9;">
              <li><code>GET /api/conversations</code> - Load all conversations</li>
              <li><code>GET /api/conversations/:id</code> - Load specific conversation</li>
              <li><code>POST /api/conversations</code> - Create new conversation</li>
              <li><code>DELETE /api/conversations/:id</code> - Delete conversation</li>
              <li><code>POST /api/chat</code> - Send message (streaming response)</li>
            </ul>
          </div>
          <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px;">
            <p style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">✨ Features:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 13px; opacity: 0.9;">
              <li>3 pre-loaded conversations with message history</li>
              <li>Network delays simulated (300-500ms)</li>
              <li>Create new conversations via the sidebar</li>
              <li>Switch between conversations seamlessly</li>
              <li>Delete conversations (with API sync)</li>
              <li>Streaming AI responses</li>
            </ul>
          </div>
        </div>
        <div style="width: 100%; height: 700px; border: 1px solid #dee2e6; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <nr-chatbot
            id="conversation-loading-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .showSendButton=${true}
            .autoScroll=${true}
            .showThreads=${true}
            .boxed=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Auto-Loading Conversations with Custom Provider
 * Demonstrates automatic conversation loading when extending CustomAPIProvider.
 * The controller automatically calls loadConversations() when the provider connects,
 * eliminating the need for manual initialization code.
 */
export const AutoLoadingConversations: Story = {
  args: {
    ...Default.args,
    showThreads: true
  },
  render: (args) => {
    const originalFetch = window.fetch;

    // Mock conversation data store
    let conversationStore = [
      {
        id: 'auto_conv_1',
        title: '✈️ Flight Booking',
        messages: [
          {
            id: 'auto_msg_1',
            text: 'I need to book a flight from New York to London',
            sender: 'user' as ChatbotSender,
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'auto_msg_2',
            text: 'I found some great flight options for you:\n\n[FLIGHT]{\n  "flightNumber": "BA117",\n  "airline": "British Airways",\n  "origin": "JFK",\n  "destination": "LHR",\n  "departureTime": "6:30 PM",\n  "arrivalTime": "6:45 AM",\n  "departureDate": "Mar 15, 2024",\n  "arrivalDate": "Mar 16, 2024",\n  "duration": "7h 15min",\n  "terminal": "7",\n  "gate": "B32",\n  "arrivalTerminal": "5",\n  "arrivalGate": "A18"\n}[/FLIGHT]\n\nThis is a direct flight with excellent reviews! Would you like to see more options?',
            sender: 'bot' as ChatbotSender,
            timestamp: new Date(Date.now() - 3590000).toISOString()
          },
          {
            id: 'auto_msg_3',
            text: 'Perfect! Can you show me a business class option?',
            sender: 'user' as ChatbotSender,
            timestamp: new Date(Date.now() - 3580000).toISOString()
          },
          {
            id: 'auto_msg_4',
            text: 'Here\'s a premium business class option:\n\n[FLIGHT]{\n  "flightNumber": "VS4",\n  "airline": "Virgin Atlantic",\n  "origin": "JFK",\n  "destination": "LHR",\n  "departureTime": "8:00 PM",\n  "arrivalTime": "8:15 AM",\n  "departureDate": "Mar 15, 2024",\n  "arrivalDate": "Mar 16, 2024",\n  "duration": "7h 15min",\n  "terminal": "4",\n  "gate": "B24",\n  "arrivalTerminal": "3",\n  "arrivalGate": "A10",\n  "status": "On Time"\n}[/FLIGHT]\n\nThis includes lie-flat seats, premium dining, priority boarding, and access to the Clubhouse lounge!',
            sender: 'bot' as ChatbotSender,
            timestamp: new Date(Date.now() - 3570000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3570000).toISOString()
      },
      {
        id: 'auto_conv_2',
        title: '🚀 Project Setup Guide',
        messages: [
          {
            id: 'auto_msg_5',
            text: 'How do I set up a new React project?',
            sender: 'user' as ChatbotSender,
            timestamp: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: 'auto_msg_6',
            text: 'Here\'s a quick guide to set up a React project:\n\n1. **Using Create React App:**\n```bash\nnpx create-react-app my-app\ncd my-app\nnpm start\n```\n\n2. **Using Vite (faster):**\n```bash\nnpm create vite@latest my-app -- --template react\ncd my-app\nnpm install\nnpm run dev\n```\n\nVite is recommended for new projects due to faster build times!',
            sender: 'bot' as ChatbotSender,
            timestamp: new Date(Date.now() - 7190000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7190000).toISOString()
      },
      {
        id: 'auto_conv_3',
        title: '💡 TypeScript Best Practices',
        messages: [
          {
            id: 'auto_msg_7',
            text: 'What are some TypeScript best practices?',
            sender: 'user' as ChatbotSender,
            timestamp: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 'auto_msg_8',
            text: 'Here are key TypeScript best practices:\n\n✅ **Enable strict mode** in tsconfig.json\n✅ **Use interfaces** for object shapes\n✅ **Avoid "any" type** - use unknown or proper types\n✅ **Leverage utility types** (Partial, Pick, Omit, etc.)\n✅ **Use type guards** for runtime type checking\n✅ **Document with JSDoc** for better IDE support\n\nThese practices will make your code more maintainable and catch bugs early!',
            sender: 'bot' as ChatbotSender,
            timestamp: new Date(Date.now() - 86390000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86390000).toISOString()
      },
      {
        id: 'auto_conv_4',
        title: '🎨 CSS Architecture',
        messages: [
          {
            id: 'auto_msg_9',
            text: 'How should I organize my CSS in a large project?',
            sender: 'user' as ChatbotSender,
            timestamp: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 'auto_msg_10',
            text: 'For large projects, consider these CSS organization strategies:\n\n**1. CSS Modules:**\n- Scoped styles per component\n- Prevents naming conflicts\n\n**2. CSS-in-JS:**\n- Styled Components\n- Emotion\n- Dynamic theming\n\n**3. Utility-First:**\n- Tailwind CSS\n- Rapid development\n\n**4. BEM Methodology:**\n- Block__Element--Modifier\n- Clear naming conventions\n\nChoose based on your team\'s preferences and project requirements!',
            sender: 'bot' as ChatbotSender,
            timestamp: new Date(Date.now() - 172790000).toISOString()
          }
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172790000).toISOString()
      }
    ];

    // Mock fetch to intercept API calls
    const mockFetch = async (url: string | URL | Request, options?: RequestInit) => {
      const urlString = typeof url === 'string' ? url : url instanceof URL ? url.toString() : url.url;
      
      // Mock: Load specific conversation
      if (urlString.match(/\/api\/conversations\/[^/?]+$/) && (!options?.method || options?.method === 'GET')) {
        const conversationId = urlString.split('/').pop();
        const conversation = conversationStore.find(c => c.id === conversationId);
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (conversation) {
          return new Response(JSON.stringify(conversation), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({ error: 'Conversation not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Mock: Load conversations list
      if (urlString.includes('/api/conversations') && (!options?.method || options?.method === 'GET')) {
        await new Promise(resolve => setTimeout(resolve, 300));
        return new Response(JSON.stringify({
          conversations: conversationStore.map(c => ({
            id: c.id,
            title: c.title,
            messageCount: c.messages.length,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt
          }))
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Mock: Create new conversation
      if (urlString.includes('/api/conversations') && options?.method === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 250));
        
        const body = JSON.parse(options?.body as string || '{}');
        const newConversation = {
          id: `auto_conv_${Date.now()}`,
          title: body.title || `New Chat ${conversationStore.length + 1}`,
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        conversationStore = [newConversation, ...conversationStore];
        
        return new Response(JSON.stringify(newConversation), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Mock: Delete conversation
      if (urlString.match(/\/api\/conversations\/[^/]+$/) && options?.method === 'DELETE') {
        const conversationId = urlString.split('/').pop();
        await new Promise(resolve => setTimeout(resolve, 200));
        
        conversationStore = conversationStore.filter(c => c.id !== conversationId);
        
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Mock: Send message (streaming response)
      if (urlString.includes('/api/chat') && options?.method === 'POST') {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const body = JSON.parse(options?.body as string || '{}');
        const userMessage = body.userMessage || body.message || '';
        
        let aiResponse = 'Thanks for your question! ';
        
        if (userMessage.toLowerCase().includes('hello') || userMessage.toLowerCase().includes('hi')) {
          aiResponse += 'Hello! How can I help you today with your development questions?';
        } else if (userMessage.toLowerCase().includes('help')) {
          aiResponse += 'I can assist you with:\n• Programming concepts\n• Framework recommendations\n• Best practices\n• Code architecture\n\nWhat would you like to know?';
        } else {
          aiResponse += 'That\'s an interesting question! Let me help you with that...';
        }
        
        const stream = new ReadableStream({
          async start(controller) {
            for (let i = 0; i < aiResponse.length; i++) {
              await new Promise(resolve => setTimeout(resolve, 15));
              controller.enqueue(new TextEncoder().encode(aiResponse[i]));
            }
            controller.close();
          }
        });
        
        return new Response(stream, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }

      return originalFetch(url, options);
    };

    setTimeout(async () => {
      const chatbot = document.querySelector('#auto-loading-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        // Override fetch
        window.fetch = mockFetch as any;
        
        const { CustomAPIProvider } = await import('./providers/custom-api-provider.js');
        const { ChatbotCoreController } = await import('./core/chatbot-core.controller.js');
        const { FlightCardPlugin } = await import('./plugins/flight-card-plugin.js');
        
        // Extended provider with auto-loading support
        class AutoLoadingProvider extends CustomAPIProvider {
          async loadConversations(): Promise<Array<{id: string, title: string, createdAt: string, updatedAt: string}>> {
            console.log('[AutoLoadingProvider] loadConversations() called automatically!');
            try {
              const response = await fetch('/api/conversations', { method: 'GET' });
              const data = await response.json();
              console.log('[AutoLoadingProvider] Loaded conversation summaries:', data.conversations);
              return data.conversations || [];
            } catch (error) {
              console.error('[AutoLoadingProvider] Failed to load conversations:', error);
              return [];
            }
          }

          async loadConversation(conversationId: string): Promise<any> {
            console.log(`[AutoLoadingProvider] loadConversation(${conversationId}) called automatically!`);
            try {
              const response = await fetch(`/api/conversations/${conversationId}`, { method: 'GET' });
              const data = await response.json();
              console.log(`[AutoLoadingProvider] Loaded full conversation ${conversationId}:`, data);
              return data;
            } catch (error) {
              console.error(`[AutoLoadingProvider] Failed to load conversation ${conversationId}:`, error);
              return null;
            }
          }

          buildPayload(text: string, context: any): any {
            return {
              userMessage: text,
              conversationId: context.currentThread?.id,
              metadata: context.metadata || {}
            };
          }
        }

        const provider = new AutoLoadingProvider();
        
        console.log('[Story] Connecting provider...');
        await provider.connect({
          apiUrl: '/api/chat',
          headers: {
            'accept': 'text/plain',
            'Content-Type': 'application/json'
          }
        });
        console.log('[Story] Provider connected!');

        // Create controller - conversations will load automatically!
        console.log('[Story] Creating ChatbotCoreController...');
        const controller = new ChatbotCoreController({
          provider,
          enableThreads: true,
          debug: true, // Enable debug logging to see auto-load process
          plugins: [new FlightCardPlugin()], // Add flight card plugin for HTML rendering
          ui: {
            onStateChange: (state) => {
              console.log('[UI] State changed:', {
                threadsCount: state.threads.length,
                messagesCount: state.messages.length,
                currentThreadId: state.currentThreadId
              });
              chatbot.messages = state.messages;
              chatbot.threads = state.threads;
              chatbot.isBotTyping = state.isTyping;
              chatbot.chatStarted = state.messages.length > 0;
            },
            onTypingStart: () => { chatbot.isBotTyping = true; },
            onTypingEnd: () => { chatbot.isBotTyping = false; },
            focusInput: () => { chatbot.focusInput(); }
          }
        });

        chatbot.controller = controller;

        // Note: No manual conversation loading code needed!
        // The controller automatically calls provider.loadConversations() on connect

        chatbot.suggestions = [
          { id: 'react', text: '⚛️ React tips', enabled: true },
          { id: 'typescript', text: '📘 TypeScript help', enabled: true },
          { id: 'css', text: '🎨 CSS advice', enabled: true }
        ];

        // Cleanup
        (window as any).__storyCleanup = () => {
          window.fetch = originalFetch;
        };
      }
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 16px; padding: 20px; max-width: 1200px;">
        <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; box-shadow: 0 4px 20px rgba(102,126,234,0.4); color: white;">
          <h3 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">✨ Auto-Loading Conversations Demo</h3>
          <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; opacity: 0.95;">
            This story demonstrates the <strong>automatic conversation loading</strong> feature. 
            When you extend <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">CustomAPIProvider</code> 
            and implement <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">loadConversations()</code>, 
            the controller automatically loads existing conversations when the provider connects!
          </p>
          
          <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
            <p style="margin: 0 0 12px 0; font-weight: 600; font-size: 15px;">🔄 How it works:</p>
            <ol style="margin: 0; padding-left: 24px; font-size: 14px; line-height: 1.8; opacity: 0.95;">
              <li>Provider connects via <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">provider.connect()</code></li>
              <li>Controller detects <code style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px;">loadConversations()</code> method</li>
              <li>Automatically calls it to fetch conversation list</li>
              <li>Loads full details for each conversation</li>
              <li><strong>Processes messages through plugins</strong> (e.g., renders flight cards)</li>
              <li>Updates UI with loaded threads - <strong>no manual code needed!</strong></li>
            </ol>
          </div>

          <div style="background: rgba(255,255,255,0.15); padding: 16px; border-radius: 8px;">
            <p style="margin: 0 0 12px 0; font-weight: 600; font-size: 15px;">📋 Pre-loaded conversations:</p>
            <ul style="margin: 0; padding-left: 24px; font-size: 14px; line-height: 1.8; opacity: 0.95;">
              <li>✈️ <strong>Flight Booking</strong> - Demonstrates HTML rendering with flight cards</li>
              <li>🚀 Project Setup Guide</li>
              <li>💡 TypeScript Best Practices</li>
              <li>🎨 CSS Architecture</li>
            </ul>
          </div>

          <div style="background: rgba(46,213,115,0.2); padding: 12px; border-radius: 6px; margin-top: 16px; border-left: 4px solid #2ed573;">
            <p style="margin: 0; font-size: 13px; line-height: 1.6;">
              <strong>💡 Tip:</strong> Click on the "Flight Booking" conversation to see rich HTML cards automatically rendered from loaded messages!
            </p>
          </div>
          
          <div style="background: rgba(255,193,7,0.2); padding: 12px; border-radius: 6px; margin-top: 12px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 13px; line-height: 1.6;">
              <strong>🔍 Debug:</strong> Open the browser console to see the auto-loading process and plugin rendering in action!
            </p>
          </div>
        </div>

        <div style="width: 100%; height: 700px; border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">
          <nr-chatbot
            id="auto-loading-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .showSendButton=${true}
            .autoScroll=${true}
            .showThreads=${true}
            .boxed=${true}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

// ===== INPUT-ONLY MODE STORIES =====

/**
 * Input-only mode - shows only the input area without messages.
 * Useful for embedded command inputs or quick actions.
 */
export const InputOnly: Story = {
  args: {
    size: ChatbotSize.Medium,
    variant: ChatbotVariant.Default,
    showMessages: false,
    showSendButton: true
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#input-only-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = createControllerForElement(chatbot, {
          delay: 500,
          responses: {
            default: 'Command received! Processing your request...'
          }
        });
        chatbot.controller = controller;
      }
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 24px; width: 600px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 12px 0; font-size: 18px;">Input-Only Mode</h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            Shows only the input area without displaying messages.
            Perfect for command inputs, search bars, or embedded quick actions.
          </p>
        </div>

        <div style="border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <nr-chatbot
            id="input-only-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .showMessages=${false}
            .showSendButton=${args.showSendButton}
            placeholder="Type a command..."
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Input-only mode with suggestions displayed as bubbles above the input.
 */
export const InputOnlyWithSuggestions: Story = {
  args: {
    size: ChatbotSize.Medium,
    variant: ChatbotVariant.Default,
    showMessages: false,
    showSendButton: true
  },
  render: (args) => {
    const quickActionSuggestions: ChatbotSuggestion[] = [
      { id: 'action1', text: 'Create new project', enabled: true },
      { id: 'action2', text: 'Open settings', enabled: true },
      { id: 'action3', text: 'Search files', enabled: true },
      { id: 'action4', text: 'Run build', enabled: true }
    ];

    setTimeout(() => {
      const chatbot = document.querySelector('#input-only-suggestions-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = createControllerForElement(chatbot, {
          delay: 500,
          responses: {
            'Create new project': 'Creating a new project for you...',
            'Open settings': 'Opening settings panel...',
            'Search files': 'Starting file search...',
            'Run build': 'Running build process...',
            default: 'Executing command...'
          }
        });
        chatbot.controller = controller;
        chatbot.suggestions = quickActionSuggestions;
      }
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 24px; width: 600px;">
        <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 12px 0; font-size: 18px;">Input-Only With Suggestions</h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            Suggestions appear as clickable bubbles above the input.
            Click a suggestion or type your own command.
          </p>
        </div>

        <div style="padding-top: 50px;">
          <nr-chatbot
            id="input-only-suggestions-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .showMessages=${false}
            .showSendButton=${args.showSendButton}
            .suggestions=${quickActionSuggestions}
            placeholder="Type a command or click a suggestion..."
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Input-only mode with file upload enabled.
 */
export const InputOnlyWithFileUpload: Story = {
  args: {
    size: ChatbotSize.Medium,
    variant: ChatbotVariant.Default,
    showMessages: false,
    showSendButton: true,
    enableFileUpload: true
  },
  render: (args) => {
    setTimeout(() => {
      const chatbot = document.querySelector('#input-only-file-chatbot') as any;
      if (chatbot && !chatbot.controller) {
        const controller = createControllerForElement(chatbot, {
          delay: 500,
          responses: {
            default: 'File received! Processing your upload...'
          }
        });
        chatbot.controller = controller;
      }
    }, 0);

    return html`
      <div style="display: flex; flex-direction: column; gap: 24px; width: 600px;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 12px 0; font-size: 18px;">Input-Only With File Upload</h3>
          <p style="margin: 0; font-size: 14px; opacity: 0.9;">
            Input-only mode with file upload functionality enabled.
            Upload files to attach to your command.
          </p>
        </div>

        <div style="border: 1px solid #dee2e6; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <nr-chatbot
            id="input-only-file-chatbot"
            .size=${args.size}
            .variant=${args.variant}
            .showMessages=${false}
            .showSendButton=${args.showSendButton}
            .enableFileUpload=${true}
            placeholder="Type a command or upload a file..."
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};
