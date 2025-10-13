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
  ChatbotModule
} from './chatbot.types.js';

// Import the core controller and providers
import { ChatbotCoreController } from './core/chatbot-core.controller.js';
import { MockProvider } from './providers/mock-provider.js';

// Import shared theme system
import '../../shared/themes/carbon/index.css';
import '../../shared/themes/default/index.css';
import '../input/input.component.js';
import '../button/button.component.js';
import '../icon/icon.component.js';
import '../dropdown/dropdown.component.js';
import '../select/select.component.js';
import '../tag/tag.component.js';
import '../modal/modal.component.js';
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
