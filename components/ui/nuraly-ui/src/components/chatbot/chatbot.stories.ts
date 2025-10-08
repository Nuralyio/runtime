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
        @chatbot-message-sent=${(e: CustomEvent) => console.log('Message sent:', e.detail)}
        @chatbot-suggestion-clicked=${(e: CustomEvent) => console.log('Suggestion clicked:', e.detail)}
        @chatbot-file-uploaded=${(e: CustomEvent) => console.log('File uploaded:', e.detail)}
        @chatbot-file-error=${(e: CustomEvent) => console.log('File error:', e.detail)}
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
          @chatbot-message-sent=${handleMessageSent}
          @chatbot-suggestion-clicked=${handleSuggestionClicked}
          @chatbot-file-uploaded=${(e: CustomEvent) => console.log('File uploaded:', e.detail)}
          @chatbot-file-error=${(e: CustomEvent) => console.log('File error:', e.detail)}
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
        @chatbot-message-sent=${(e: CustomEvent) => console.log('Message sent:', e.detail)}
        @chatbot-suggestion-clicked=${(e: CustomEvent) => console.log('Suggestion clicked:', e.detail)}
        @chatbot-file-uploaded=${(e: CustomEvent) => console.log('File uploaded:', e.detail)}
        @chatbot-file-error=${(e: CustomEvent) => console.log('File error:', e.detail)}
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
    icon: 'chat',
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
          @chatbot-message-sent=${(e: CustomEvent) => console.log('Message sent:', e.detail)}
          @chatbot-suggestion-clicked=${(e: CustomEvent) => console.log('Suggestion clicked:', e.detail)}
          @chatbot-file-uploaded=${(e: CustomEvent) => console.log('File uploaded:', e.detail)}
          @chatbot-file-error=${(e: CustomEvent) => console.log('File error:', e.detail)}
          @chatbot-modules-selected=${handleModulesSelected}
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
          @chatbot-message-sent=${(e: CustomEvent) => console.log('Message sent:', e.detail)}
          @chatbot-modules-selected=${handleModulesSelected}
          @chatbot-suggestion-clicked=${(e: CustomEvent) => console.log('Suggestion clicked:', e.detail)}
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