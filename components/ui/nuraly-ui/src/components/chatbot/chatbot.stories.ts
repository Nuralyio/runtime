/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ChatbotMessage, ChatbotSuggestion, ChatbotSender, ChatbotSize, ChatbotVariant, ChatbotLoadingType } from './chatbot.types.js';

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
        component: 'A versatile chatbot component with message handling, suggestions, and typing indicators.'
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
    isBotTyping: {
      control: { type: 'boolean' },
      description: 'Show typing indicator'
    },
    showSendButton: {
      control: { type: 'boolean' },
      description: 'Show send button'
    },
    autoScroll: {
      control: { type: 'boolean' },
      description: 'Auto-scroll to new messages'
    },
    enableFileUpload: {
      control: { type: 'boolean' },
      description: 'Enable file upload functionality'
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
    },
    modules: {
      control: { type: 'object' },
      description: 'Available modules for selection'
    },
    selectedModules: {
      control: { type: 'object' },
      description: 'Array of selected module IDs'
    },
    moduleSelectionLabel: {
      control: { type: 'text' },
      description: 'Label for module selection button'
    },
    isQueryRunning: {
      control: { type: 'boolean' },
      description: 'Show stop button instead of send button (simulates active query)'
    }
  }
};

export default meta;
type Story = StoryObj;

// Sample messages for stories
const sampleMessages: ChatbotMessage[] = [
  {
    id: 'msg1',
    sender: ChatbotSender.Bot,
    text: 'Hello! How can I help you today?',
    timestamp: '10:00 AM',
    introduction: true
  },
  {
    id: 'msg2',
    sender: ChatbotSender.User,
    text: 'I need help with my account',
    timestamp: '10:01 AM'
  },
  {
    id: 'msg3',
    sender: ChatbotSender.Bot,
    text: 'I\'d be happy to help you with your account. What specific issue are you experiencing?',
    timestamp: '10:01 AM'
  }
];

const sampleSuggestions: ChatbotSuggestion[] = [
  { id: 'sugg1', text: 'Check account balance', enabled: true },
  { id: 'sugg2', text: 'Update personal information', enabled: true },
  { id: 'sugg3', text: 'Reset password', enabled: true },
  { id: 'sugg4', text: 'Contact support', enabled: true }
];

export const Default: Story = {
  args: {
    messages: [],
    suggestions: sampleSuggestions,
    size: ChatbotSize.Medium,
    variant: ChatbotVariant.Default,
    isRTL: false,
    disabled: false,
    isBotTyping: false,
    showSendButton: true,
    autoScroll: true,
    enableFileUpload: true,
    showThreads: false,
    boxed: false,
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['image/*', 'text/*', 'application/pdf', 'application/json']
  },
  render: (args) => html`
    <div style="width: 500px; height: 600px; ">
      <nr-chatbot
        .messages=${args.messages}
        .suggestions=${args.suggestions}
        .size=${args.size}
        .variant=${args.variant}
        .isRTL=${args.isRTL}
        .disabled=${args.disabled}
        .isBotTyping=${args.isBotTyping}
        .showSendButton=${args.showSendButton}
        .autoScroll=${args.autoScroll}
        .enableFileUpload=${args.enableFileUpload}
        .showThreads=${args.showThreads}
        .boxed=${args.boxed}
        .maxFiles=${args.maxFiles}
        .maxFileSize=${args.maxFileSize}
        .allowedFileTypes=${args.allowedFileTypes}
  @nr-chatbot-message-sent=${(e: CustomEvent) => console.log('Message sent:', e.detail)}
  @nr-chatbot-suggestion-clicked=${(e: CustomEvent) => console.log('Suggestion clicked:', e.detail)}
  @nr-chatbot-file-uploaded=${(e: CustomEvent) => console.log('File uploaded:', e.detail)}
  @nr-chatbot-file-error=${(e: CustomEvent) => console.log('File error:', e.detail)}
      ></nr-chatbot>
    </div>
  `
};

export const WithMessages: Story = {
  args: {
    ...Default.args,
    messages: sampleMessages,
    chatStarted: true
  },
  render: Default.render
};

export const WithTypingIndicator: Story = {
  args: {
    ...WithMessages.args,
    isBotTyping: true,
    loadingIndicator: ChatbotLoadingType.Dots
  },
  render: Default.render
};

export const Interactive: Story = {
  args: {
    ...Default.args,
    enableFileUpload: true
  },
  render: (args) => {
    let messages: ChatbotMessage[] = [...(args.messages || [])];
    let suggestions: ChatbotSuggestion[] = [...sampleSuggestions];
    let chatStarted = false;

    const handleMessageSent = (e: CustomEvent) => {
      const userMessage = e.detail.message;
      messages = [...messages, userMessage];
      chatStarted = true;
      
      // Simulate bot response
      setTimeout(() => {
        const botMessage: ChatbotMessage = {
          id: `bot_${Date.now()}`,
          sender: ChatbotSender.Bot,
          text: `I received your message: "${userMessage.text}". How else can I help you?`,
          timestamp: new Date().toLocaleTimeString()
        };
        messages = [...messages, botMessage];
        
        // Update the component
        const chatbot = document.querySelector('nr-chatbot');
        if (chatbot) {
          (chatbot as any).messages = messages;
          (chatbot as any).chatStarted = chatStarted;
          (chatbot as any).currentInput = '';
        }
      }, 1000);
    };

    const handleSuggestionClicked = (e: CustomEvent) => {
      const suggestion = e.detail.suggestion;
      suggestions = suggestions.filter(s => s.id !== suggestion.id);
      
      const chatbot = document.querySelector('nr-chatbot');
      if (chatbot) {
        (chatbot as any).suggestions = suggestions;
        (chatbot as any).currentInput = suggestion.text;
      }
    };

    return html`
      <div style="width: 500px; height: 600px;  border-radius: 8px;">
        <nr-chatbot
          .messages=${messages}
          .suggestions=${suggestions}
          .chatStarted=${chatStarted}
          .size=${args.size}
          .variant=${args.variant}
          .enableFileUpload=${args.enableFileUpload}
          .boxed=${args.boxed}
          .maxFiles=${args.maxFiles}
          .maxFileSize=${args.maxFileSize}
          .allowedFileTypes=${args.allowedFileTypes}
          @nr-chatbot-message-sent=${handleMessageSent}
          @nr-chatbot-suggestion-clicked=${handleSuggestionClicked}
          @nr-chatbot-file-uploaded=${(e: CustomEvent) => console.log('File uploaded:', e.detail)}
          @nr-chatbot-file-error=${(e: CustomEvent) => console.log('File error:', e.detail)}
        ></nr-chatbot>
      </div>
    `;
  }
};

export const BoxedLayout: Story = {
  args: {
    ...Default.args,
    boxed: true
  },
  parameters: {
    layout: 'fullscreen'
  },
  render: (args) => html`
    <div style="width: 100vw; height: 100vh;">
      <nr-chatbot
        .messages=${args.messages}
        .suggestions=${args.suggestions}
        .size=${args.size}
        .variant=${args.variant}
        .isRTL=${args.isRTL}
        .disabled=${args.disabled}
        .isBotTyping=${args.isBotTyping}
        .showSendButton=${args.showSendButton}
        .autoScroll=${args.autoScroll}
        .enableFileUpload=${args.enableFileUpload}
        .showThreads=${args.showThreads}
        .boxed=${args.boxed}
        .maxFiles=${args.maxFiles}
        .maxFileSize=${args.maxFileSize}
        .allowedFileTypes=${args.allowedFileTypes}
  @nr-chatbot-message-sent=${(e: CustomEvent) => console.log('Message sent:', e.detail)}
  @nr-chatbot-suggestion-clicked=${(e: CustomEvent) => console.log('Suggestion clicked:', e.detail)}
  @nr-chatbot-file-uploaded=${(e: CustomEvent) => console.log('File uploaded:', e.detail)}
  @nr-chatbot-file-error=${(e: CustomEvent) => console.log('File error:', e.detail)}
      ></nr-chatbot>
    </div>
  `
};

// Sample modules for module selection story
const sampleModules = [
  {
    id: 'nlp',
    name: 'NLP',
    description: 'Advanced text analysis and understanding',
    enabled: true,
    metadata: { category: 'AI', version: '2.0' }
  },
  {
    id: 'vision',
    name: 'Vision',
    description: 'Image and video analysis',
    icon: 'eye',
    enabled: true,
    metadata: { category: 'AI', version: '1.5' }
  },
  {
    id: 'search',
    name: 'Search',
    description: 'Search the web for information',
    icon: 'search',
    enabled: true,
    metadata: { category: 'Tools', version: '1.0' }
  },
  {
    id: 'code',
    name: 'Code',
    description: 'Analyze and generate code',
    icon: 'code',
    enabled: true,
    metadata: { category: 'Development', version: '2.1' }
  },
  {
    id: 'data',
    name: 'Data',
    description: 'Statistical analysis and data processing',
    icon: 'chart-bar',
    enabled: false,
    metadata: { category: 'Analytics', version: '1.0' }
  }
];

export const BoxedWithMessages: Story = {
  args: {
    ...BoxedLayout.args,
    messages: sampleMessages,
    chatStarted: true,
    enableModuleSelection: true,
    modules: sampleModules,
    selectedModules: ['nlp']
  },
  parameters: {
    layout: 'fullscreen'
  },
  render: (args) => {
    const handleModulesSelected = (e: CustomEvent) => {
      console.log('Modules selected:', e.detail);
      console.log('Selected module IDs:', e.detail.metadata.selectedModuleIds);
      console.log('Selected modules:', e.detail.metadata.selectedModules);
    };

    return html`
      <div style="width: 100vw; height: 100vh;">
        <nr-chatbot
          .messages=${args.messages}
          .suggestions=${args.suggestions}
          .size=${args.size}
          .variant=${args.variant}
          .isRTL=${args.isRTL}
          .disabled=${args.disabled}
          .isBotTyping=${args.isBotTyping}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .enableFileUpload=${args.enableFileUpload}
          .showThreads=${args.showThreads}
          .boxed=${args.boxed}
          .maxFiles=${args.maxFiles}
          .maxFileSize=${args.maxFileSize}
          .allowedFileTypes=${args.allowedFileTypes}
          .enableModuleSelection=${args.enableModuleSelection}
          .modules=${args.modules}
          .selectedModules=${args.selectedModules}
          @nr-chatbot-message-sent=${(e: CustomEvent) => console.log('Message sent:', e.detail)}
          @nr-chatbot-suggestion-clicked=${(e: CustomEvent) => console.log('Suggestion clicked:', e.detail)}
          @nr-chatbot-file-uploaded=${(e: CustomEvent) => console.log('File uploaded:', e.detail)}
          @nr-chatbot-file-error=${(e: CustomEvent) => console.log('File error:', e.detail)}
          @nr-chatbot-modules-selected=${handleModulesSelected}
        ></nr-chatbot>
      </div>
    `;
  }
};

export const WithModuleSelection: Story = {
  args: {
    ...Default.args,
    enableModuleSelection: true,
    modules: sampleModules,
    selectedModules: ['nlp', 'search']
  },
  render: (args) => {
    const handleModulesSelected = (e: CustomEvent) => {
      console.log('Modules selected:', e.detail);
      console.log('Selected module IDs:', e.detail.metadata.selectedModuleIds);
      console.log('Selected modules:', e.detail.metadata.selectedModules);
    };

    return html`
      <div style="width: 500px; height: 600px; border-radius: 8px;">
        <nr-chatbot
          .messages=${args.messages}
          .suggestions=${args.suggestions}
          .size=${args.size}
          .variant=${args.variant}
          .enableModuleSelection=${args.enableModuleSelection}
          .modules=${args.modules}
          .selectedModules=${args.selectedModules}
          .enableFileUpload=${args.enableFileUpload}
          @nr-chatbot-message-sent=${(e: CustomEvent) => console.log('Message sent:', e.detail)}
          @nr-chatbot-modules-selected=${handleModulesSelected}
          @nr-chatbot-suggestion-clicked=${(e: CustomEvent) => console.log('Suggestion clicked:', e.detail)}
        ></nr-chatbot>
      </div>
    `;
  }
};

export const WithModuleSelectionAndMessages: Story = {
  args: {
    ...WithModuleSelection.args,
    messages: sampleMessages,
    chatStarted: true
  },
  render: WithModuleSelection.render
};

/**
 * Right Sidebar Copilot Style
 * Chatbot positioned on the right side similar to GitHub Copilot or VSCode Copilot
 */
export const RightSidebarCopilot: Story = {
  args: {
    messages: sampleMessages,
    suggestions: sampleSuggestions,
    size: ChatbotSize.Medium,
    variant: ChatbotVariant.Default,
    showSendButton: true,
    autoScroll: true,
    enableFileUpload: true,
    chatStarted: true,
    enableModuleSelection: true,
    modules: sampleModules,
    selectedModules: ['nlp'],
    isBotTyping: false,
    isQueryRunning: false
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Chatbot positioned as a right sidebar, similar to GitHub Copilot or VSCode Copilot chat interface.'
      }
    }
  },
  render: (args) => {
    return html`
      <style>
        .copilot-layout {
          display: flex;
          height: 100vh;
          background: #f5f5f5;
        }
        
        .copilot-main-content {
          flex: 1;
          background: #ffffff;
          border-right: 1px solid #e0e0e0;
        }
        
        .copilot-sidebar {
          width: 470px;
          background: #ffffff;
        }
      </style>
      
      <div class="copilot-layout">
        <div class="copilot-main-content"></div>
        
        <div class="copilot-sidebar">
          <nr-chatbot
            .messages=${args.messages}
            .suggestions=${args.suggestions}
            .size=${args.size}
            .variant=${args.variant}
            .showSendButton=${args.showSendButton}
            .autoScroll=${args.autoScroll}
            .enableFileUpload=${args.enableFileUpload}
            .chatStarted=${args.chatStarted}
            .enableModuleSelection=${args.enableModuleSelection}
            .modules=${args.modules}
            .selectedModules=${args.selectedModules}
            .isBotTyping=${args.isBotTyping}
            .isQueryRunning=${args.isQueryRunning}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Right Sidebar Copilot - Compact
 * Narrower sidebar for split screen coding
 */
export const RightSidebarCopilotCompact: Story = {
  args: {
    ...RightSidebarCopilot.args,
    messages: [
      {
        id: '1',
        text: 'Hi! I can help you with code. What would you like to know?',
        sender: ChatbotSender.Bot,
        timestamp: new Date().toISOString()
      }
    ]
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Compact version with a narrower sidebar (300px) for better split-screen coding experience.'
      }
    }
  },
  render: (args) => {
    return html`
      <style>
        .copilot-layout-compact {
          display: flex;
          width: 100vw;
          height: 100vh;
          background: #f5f5f5;
        }
        
        .copilot-main-compact {
          flex: 1;
          background: #ffffff;
          border-right: 1px solid #e0e0e0;
        }
        
        .copilot-sidebar-compact {
          width: 300px;
          background: #ffffff;
        }
      </style>
      
      <div class="copilot-layout-compact">
        <div class="copilot-main-compact"></div>
        
        <div class="copilot-sidebar-compact">
          <nr-chatbot
            .messages=${args.messages}
            .suggestions=${args.suggestions}
            .size=${args.size}
            .variant=${args.variant}
            .showSendButton=${args.showSendButton}
            .autoScroll=${args.autoScroll}
            .enableFileUpload=${args.enableFileUpload}
            .chatStarted=${args.chatStarted}
            .enableModuleSelection=${args.enableModuleSelection}
            .modules=${args.modules}
            .selectedModules=${args.selectedModules}
            .isBotTyping=${args.isBotTyping}
            .isQueryRunning=${args.isQueryRunning}
          ></nr-chatbot>
        </div>
      </div>
    `;
  }
};

/**
 * Stop Button Demo
 * Demonstrates the stop button functionality when a query is running
 */
export const StopButtonDemo: Story = {
  args: {
    messages: sampleMessages,
    suggestions: [],
    size: ChatbotSize.Medium,
    variant: ChatbotVariant.Default,
    showSendButton: true,
    autoScroll: true,
    enableFileUpload: true,
    chatStarted: true,
    enableModuleSelection: true,
    modules: sampleModules,
    selectedModules: ['nlp'],
    isBotTyping: true,
    isQueryRunning: true // This shows the stop button instead of send button
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the stop button that appears when a query is running. Toggle the isQueryRunning control to see the button change between Send and Stop.'
      }
    }
  },
  render: (args) => {
    return html`
      <div style="width: 400px; height: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <nr-chatbot
          .messages=${args.messages}
          .suggestions=${args.suggestions}
          .size=${args.size}
          .variant=${args.variant}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .enableFileUpload=${args.enableFileUpload}
          .chatStarted=${args.chatStarted}
          .enableModuleSelection=${args.enableModuleSelection}
          .modules=${args.modules}
          .selectedModules=${args.selectedModules}
          .isBotTyping=${args.isBotTyping}
          .isQueryRunning=${args.isQueryRunning}
        ></nr-chatbot>
      </div>
    `;
  }
};

// Sample threads data
const sampleThreads = [
  {
    id: 'thread_1',
    title: 'Account Help',
    messages: [
      {
        id: 'msg1',
        sender: ChatbotSender.Bot,
        text: 'Hello! How can I help you today?',
        timestamp: '10:00 AM',
        introduction: true
      },
      {
        id: 'msg2',
        sender: ChatbotSender.User,
        text: 'I need help with my account',
        timestamp: '10:01 AM'
      },
      {
        id: 'msg3',
        sender: ChatbotSender.Bot,
        text: 'I\'d be happy to help you with your account. What specific issue are you experiencing?',
        timestamp: '10:01 AM'
      }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'thread_2',
    title: 'Product Information',
    messages: [
      {
        id: 'msg4',
        sender: ChatbotSender.User,
        text: 'Tell me about your products',
        timestamp: '11:30 AM'
      },
      {
        id: 'msg5',
        sender: ChatbotSender.Bot,
        text: 'We offer a wide range of products including software solutions, cloud services, and consulting.',
        timestamp: '11:30 AM'
      }
    ],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'thread_3',
    title: 'Technical Support',
    messages: [
      {
        id: 'msg6',
        sender: ChatbotSender.User,
        text: 'I\'m having technical issues',
        timestamp: 'Yesterday'
      },
      {
        id: 'msg7',
        sender: ChatbotSender.Bot,
        text: 'I\'m sorry to hear that. Can you describe the issue you\'re experiencing?',
        timestamp: 'Yesterday'
      }
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

/**
 * With Thread Sidebar
 * Demonstrates the thread sidebar feature that allows users to manage multiple conversation threads
 */
export const WithThreadSidebar: Story = {
  args: {
    messages: sampleThreads[0].messages,
    suggestions: sampleSuggestions,
    size: ChatbotSize.Medium,
    variant: ChatbotVariant.Default,
    showSendButton: true,
    autoScroll: true,
    enableFileUpload: true,
    chatStarted: true,
    showThreads: true,
    threads: sampleThreads,
    activeThreadId: 'thread_1'
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcases the thread sidebar feature that allows users to switch between multiple conversation threads. Each thread maintains its own message history. Click the menu button in the header to toggle the sidebar visibility.'
      }
    }
  },
  render: (args) => {
    return html`
      <div style="width: 800px; height: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <nr-chatbot
          .messages=${args.messages}
          .suggestions=${args.suggestions}
          .size=${args.size}
          .variant=${args.variant}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .enableFileUpload=${args.enableFileUpload}
          .chatStarted=${args.chatStarted}
          .showThreads=${args.showThreads}
          .threads=${args.threads}
          .activeThreadId=${args.activeThreadId}
          @nr-chatbot-thread-selected=${(e: CustomEvent) => console.log('Thread selected:', e.detail)}
          @nr-chatbot-thread-created=${(e: CustomEvent) => console.log('Thread created:', e.detail)}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Thread Sidebar Interactive
 * Interactive demo of thread management with the ability to create new threads and switch between them
 */
export const ThreadSidebarInteractive: Story = {
  args: {
    messages: [],
    suggestions: sampleSuggestions,
    size: ChatbotSize.Medium,
    variant: ChatbotVariant.Default,
    showSendButton: true,
    autoScroll: true,
    enableFileUpload: true,
    chatStarted: false,
    showThreads: true,
    threads: [],
    activeThreadId: undefined
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo where you can create new threads, switch between them, and see messages isolated per thread. Use the menu button to toggle sidebar visibility.'
      }
    }
  },
  render: (args) => {
    let threads = [...sampleThreads];
    let activeThreadId = 'thread_1';
    let messages = threads.find(t => t.id === activeThreadId)?.messages || [];
    
    const handleThreadSelected = (e: CustomEvent) => {
      activeThreadId = e.detail.threadId;
      const selectedThread = threads.find(t => t.id === activeThreadId);
      messages = selectedThread?.messages || [];
      
      const chatbot = document.querySelector('nr-chatbot');
      if (chatbot) {
        (chatbot as any).messages = messages;
        (chatbot as any).activeThreadId = activeThreadId;
      }
    };
    
    const handleThreadCreated = (e: CustomEvent) => {
      const newThread = e.detail.thread;
      threads = [...threads, newThread];
      activeThreadId = newThread.id;
      messages = [];
      
      const chatbot = document.querySelector('nr-chatbot');
      if (chatbot) {
        (chatbot as any).threads = threads;
        (chatbot as any).messages = messages;
        (chatbot as any).activeThreadId = activeThreadId;
      }
    };
    
    const handleMessageSent = (e: CustomEvent) => {
      const userMessage = e.detail.message;
      messages = [...messages, userMessage];
      
      // Update the thread with new message
      threads = threads.map(t => 
        t.id === activeThreadId 
          ? { ...t, messages: [...messages] }
          : t
      );
      
      const chatbot = document.querySelector('nr-chatbot');
      if (chatbot) {
        (chatbot as any).messages = messages;
        (chatbot as any).threads = threads;
      }
      
      // Simulate bot response
      setTimeout(() => {
        const botMessage: ChatbotMessage = {
          id: `bot_${Date.now()}`,
          sender: ChatbotSender.Bot,
          text: `Response in thread: "${userMessage.text}"`,
          timestamp: new Date().toLocaleTimeString()
        };
        messages = [...messages, botMessage];
        
        threads = threads.map(t => 
          t.id === activeThreadId 
            ? { ...t, messages: [...messages] }
            : t
        );
        
        if (chatbot) {
          (chatbot as any).messages = messages;
          (chatbot as any).threads = threads;
        }
      }, 1000);
    };

    return html`
      <div style="width: 900px; height: 600px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <nr-chatbot
          .messages=${messages}
          .suggestions=${args.suggestions}
          .size=${args.size}
          .variant=${args.variant}
          .showSendButton=${args.showSendButton}
          .autoScroll=${args.autoScroll}
          .enableFileUpload=${args.enableFileUpload}
          .chatStarted=${true}
          .showThreads=${true}
          .enableThreadCreation=${true}
          .threads=${threads}
          .activeThreadId=${activeThreadId}
          @nr-chatbot-thread-selected=${handleThreadSelected}
          @nr-chatbot-thread-created=${handleThreadCreated}
          @nr-chatbot-message-sent=${handleMessageSent}
        ></nr-chatbot>
      </div>
    `;
  }
};
