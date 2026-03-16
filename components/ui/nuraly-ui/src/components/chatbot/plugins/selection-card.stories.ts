/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html } from 'lit';
import { SelectionCardPlugin, type SelectionChoiceData } from './selection-card-plugin.js';
import { ChatbotCoreController } from '../core/chatbot-core.controller.js';
import { MockProvider } from '../providers/mock-provider.js';
import '../chatbot.component.js';
import '.././../skeleton/index.js';
import type { Meta, StoryObj } from '@storybook/web-components';

const meta: Meta = {
  title: 'Components/Chatbot/Plugins/Selection Card',
  component: 'nr-chatbot',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Selection Card Plugin

A plugin that renders clickable option cards inside bot messages. Clicking a card sends its value as a user message (like quick replies in messaging apps).

## Features

- Clickable option cards with label, description, and optional icon
- Keyboard accessible (Tab + Enter/Space)
- Grid layout support (1, 2, or 3 columns)
- Disabled option support
- Dark mode support
- Responsive single-column on mobile
- XSS protection with HTML escaping

## Usage

\`\`\`typescript
import { SelectionCardPlugin } from '@nuraly/chatbot/plugins';

const controller = new ChatbotCoreController({
  plugins: [new SelectionCardPlugin()]
});
\`\`\`

The plugin detects selection data in two formats:

1. **JSON**: \`{ "type": "selection", "options": [...] }\`
2. **Markup**: \`[SELECTION]{ ... }[/SELECTION]\`
        `
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * Interactive chatbot with selection card plugin.
 * Bot responds with selection cards — clicking an option sends it as a reply.
 */
export const InteractiveChatbot: Story = {
  render: () => {
    const selections: SelectionChoiceData[] = [
      {
        type: 'selection',
        title: 'What would you like to do?',
        options: [
          { label: 'Check Order', value: 'check_order', icon: 'package', description: 'View your order status' },
          { label: 'Contact Support', value: 'contact_support', icon: 'headphones', description: 'Talk to an agent' },
          { label: 'Browse Products', value: 'browse_products', icon: 'shopping-cart', description: 'Explore our catalog' }
        ],
        columns: 1
      },
      {
        type: 'selection',
        title: 'Which category interests you?',
        options: [
          { label: 'Electronics', value: 'electronics', icon: 'monitor' },
          { label: 'Clothing', value: 'clothing', icon: 'shirt' },
          { label: 'Home & Garden', value: 'home_garden', icon: 'home' },
          { label: 'Sports', value: 'sports', icon: 'activity' }
        ],
        columns: 2
      },
      {
        type: 'selection',
        title: 'How would you rate your experience?',
        options: [
          { label: 'Excellent', value: 'rating_5' },
          { label: 'Good', value: 'rating_4' },
          { label: 'Average', value: 'rating_3' },
          { label: 'Poor', value: 'rating_2' },
          { label: 'Terrible', value: 'rating_1' }
        ],
        columns: 3
      }
    ];

    const mockProvider = new MockProvider({
      contextualResponses: false,
      useHistory: false,
      delay: 500,
      streaming: true,
      streamingInterval: 10,
      customResponses: [
        `<p>Welcome! How can I help you today?</p>\n\n[SELECTION]${JSON.stringify(selections[0])}[/SELECTION]`,
        `<p>Great choice! Let me show you our categories:</p>\n\n[SELECTION]${JSON.stringify(selections[1])}[/SELECTION]`,
        `<p>Thanks for browsing! Before you go, a quick question:</p>\n\n[SELECTION]${JSON.stringify(selections[2])}[/SELECTION]`,
        `<p>Thank you for your feedback! Is there anything else I can help with?</p>\n\n[SELECTION]${JSON.stringify(selections[0])}[/SELECTION]`
      ]
    });

    mockProvider.connect();

    const controller = new ChatbotCoreController({
      provider: mockProvider,
      plugins: [new SelectionCardPlugin()],
      initialMessages: [
        {
          id: '1',
          sender: 'bot' as any,
          text: 'Hello! I\'m your assistant. Type anything to see selection cards in action.',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'start', text: 'Get started', enabled: true },
            { id: 'help', text: 'Help me choose', enabled: true }
          ]
        }
      ]
    });

    setTimeout(() => {
      const chatbot = document.querySelector('nr-chatbot');
      if (chatbot) {
        (chatbot as any).controller = controller;
      }
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <nr-chatbot
          placeholder="Type a message..."
          size="full"
          variant="default"
          .showSendButton=${true}
          .autoScroll=${true}
        ></nr-chatbot>
      </div>
    `;
  }
};

/**
 * Basic selection card with 3 options, no icons, no descriptions
 */
export const BasicSelectionCard: Story = {
  render: () => {
    const plugin = new SelectionCardPlugin();
    plugin.onInit?.();

    const data: SelectionChoiceData = {
      type: 'selection',
      title: 'What would you like to do?',
      options: [
        { label: 'Check Order', value: 'check_order' },
        { label: 'Contact Support', value: 'contact_support' },
        { label: 'Browse Products', value: 'browse_products' }
      ]
    };

    const cardHtml = (plugin as any).renderSelectionCard(data);

    return html`
      <div style="padding: 40px; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Basic Selection Card</h2>
        <p style="color: #666; margin-bottom: 24px;">Simple options with labels only</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};

/**
 * Selection card with icons on each option
 */
export const WithIcons: Story = {
  render: () => {
    const plugin = new SelectionCardPlugin();
    plugin.onInit?.();

    const data: SelectionChoiceData = {
      type: 'selection',
      title: 'Choose a service',
      options: [
        { label: 'Email Support', value: 'email', icon: 'mail' },
        { label: 'Phone Support', value: 'phone', icon: 'phone' },
        { label: 'Live Chat', value: 'chat', icon: 'message-circle' },
        { label: 'Help Center', value: 'help', icon: 'book-open' }
      ]
    };

    const cardHtml = (plugin as any).renderSelectionCard(data);

    return html`
      <div style="padding: 40px; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">With Icons</h2>
        <p style="color: #666; margin-bottom: 24px;">Options with icon decorations</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};

/**
 * Selection card with subtitle descriptions
 */
export const WithDescriptions: Story = {
  render: () => {
    const plugin = new SelectionCardPlugin();
    plugin.onInit?.();

    const data: SelectionChoiceData = {
      type: 'selection',
      title: 'Select a plan',
      options: [
        { label: 'Free', value: 'free', icon: 'gift', description: 'Basic features, up to 3 projects' },
        { label: 'Pro', value: 'pro', icon: 'zap', description: 'Advanced features, unlimited projects' },
        { label: 'Enterprise', value: 'enterprise', icon: 'building', description: 'Custom solutions, dedicated support' }
      ]
    };

    const cardHtml = (plugin as any).renderSelectionCard(data);

    return html`
      <div style="padding: 40px; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">With Descriptions</h2>
        <p style="color: #666; margin-bottom: 24px;">Options with label + subtitle description</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};

/**
 * Multi-column grid layouts (2 and 3 columns)
 */
export const MultiColumn: Story = {
  render: () => {
    const plugin = new SelectionCardPlugin();
    plugin.onInit?.();

    const twoCols: SelectionChoiceData = {
      type: 'selection',
      title: '2-Column Layout',
      options: [
        { label: 'Option A', value: 'a', icon: 'circle' },
        { label: 'Option B', value: 'b', icon: 'square' },
        { label: 'Option C', value: 'c', icon: 'triangle' },
        { label: 'Option D', value: 'd', icon: 'star' }
      ],
      columns: 2
    };

    const threeCols: SelectionChoiceData = {
      type: 'selection',
      title: '3-Column Layout',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Red', value: 'red' },
        { label: 'Green', value: 'green' },
        { label: 'Blue', value: 'blue' }
      ],
      columns: 3
    };

    const twoColsHtml = (plugin as any).renderSelectionCard(twoCols);
    const threeColsHtml = (plugin as any).renderSelectionCard(threeCols);

    return html`
      <div style="padding: 40px; max-width: 700px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Multi-Column Layouts</h2>
        <p style="color: #666; margin-bottom: 24px;">Grid layouts with 2 and 3 columns</p>
        <div .innerHTML=${twoColsHtml}></div>
        <div style="margin-top: 32px;" .innerHTML=${threeColsHtml}></div>
      </div>
    `;
  }
};

/**
 * Some options are disabled (greyed out, non-clickable)
 */
export const DisabledOptions: Story = {
  render: () => {
    const plugin = new SelectionCardPlugin();
    plugin.onInit?.();

    const data: SelectionChoiceData = {
      type: 'selection',
      title: 'Available actions',
      options: [
        { label: 'View Dashboard', value: 'dashboard', icon: 'layout' },
        { label: 'Edit Settings', value: 'settings', icon: 'settings', disabled: true, description: 'Requires admin access' },
        { label: 'Generate Report', value: 'report', icon: 'file-text' },
        { label: 'Delete Account', value: 'delete', icon: 'trash-2', disabled: true, description: 'Contact support to delete' }
      ]
    };

    const cardHtml = (plugin as any).renderSelectionCard(data);

    return html`
      <div style="padding: 40px; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Disabled Options</h2>
        <p style="color: #666; margin-bottom: 24px;">Some options are disabled and non-interactive</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};

/**
 * Dark mode rendering
 */
export const DarkMode: Story = {
  render: () => {
    const plugin = new SelectionCardPlugin();
    plugin.onInit?.();

    const data: SelectionChoiceData = {
      type: 'selection',
      title: 'Choose your theme',
      options: [
        { label: 'Light Mode', value: 'light', icon: 'sun', description: 'Clean and bright' },
        { label: 'Dark Mode', value: 'dark', icon: 'moon', description: 'Easy on the eyes' },
        { label: 'System Default', value: 'system', icon: 'monitor', description: 'Follow OS preference' }
      ]
    };

    const cardHtml = (plugin as any).renderSelectionCard(data);

    return html`
      <div style="padding: 40px; max-width: 600px; margin: 0 auto; background: #1a1a1a; min-height: 400px; color: white; color-scheme: dark;">
        <h2 style="margin-bottom: 24px; color: white;">Dark Mode</h2>
        <p style="color: #ccc; margin-bottom: 24px;">The card automatically adapts to dark color schemes</p>
        <div .innerHTML=${cardHtml}></div>
      </div>
    `;
  }
};
