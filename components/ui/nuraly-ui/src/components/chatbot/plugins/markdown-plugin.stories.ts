/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../chatbot.component.js';
import { ChatbotCoreController } from '../core/chatbot-core.controller.js';
import { MockProvider } from '../providers/mock-provider.js';
import { MarkdownPlugin } from './markdown-plugin.js';

const meta: Meta = {
  title: 'Components/Chatbot/Plugins/Markdown',
  component: 'nr-chatbot',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `\n# Markdown Plugin\n\nStreams markdown using [MD] ... [/MD] tags so the card-aware tokenizer can insert HTML in place once the block closes.\n\n- Supports headings, bold, italics, code, links, lists\n- Minimal CSS injected once per conversation\n- Safe defaults (basic HTML escape)\n\nUsage:\n\n\`\`\`ts\nnew ChatbotCoreController({\n  plugins: [new MarkdownPlugin()]\n})\n\`\`\`\n`
      }
    }
  },
  tags: ['autodocs']
};
export default meta;

type Story = StoryObj;

export const InteractiveMarkdown: Story = {
  render: () => {
    const provider = new MockProvider({
      delay: 400,
      streaming: true,
      streamingInterval: 20,
      contextualResponses: true,
      useHistory: false,
      customResponses: [
        `[MD]# Welcome\n\nThis is **streamed** markdown.\n\n- First bullet\n- Second bullet with a [link](https://example.com)\n\nHere is some code:\n\n\`\`\`js\nconsole.log('hello markdown');\n\`\`\`\n[/MD]`,
        `Some plain text will also be formatted: **bold**, *italic*, and \n[MD]## Mixed content\nParagraph above, markdown block below closes to render HTML.[/MD]`
      ]
    });

    provider.connect();

    const controller = new ChatbotCoreController({
      provider,
      plugins: [new MarkdownPlugin()],
      initialMessages: [
        {
          id: 'intro-md',
          sender: 'bot' as any,
          text: 'Hello! This chat understands markdown. Try asking for a demo or paste some markdown.',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'md-demo-1', text: 'Show a markdown demo' },
            { id: 'md-code', text: 'Show code sample' }
          ]
        }
      ]
    });

    setTimeout(() => {
      const el = document.querySelector('nr-chatbot');
      if (el) (el as any).controller = controller;
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <nr-chatbot
          placeholder="Type markdown or click a suggestion..."
          size="full"
          variant="default"
          .showSendButton=${true}
          .autoScroll=${true}
        ></nr-chatbot>
      </div>
    `;
  }
};

export const BasicMarkdownBlock: Story = {
  render: () => {
    const plugin = new MarkdownPlugin();
    plugin.onInit?.();

    const block = `[MD]# Title\n\nSome **bold** text, *italic* text, and \n- item A\n- item B\n\nA link to [Nuraly](https://nuraly.io).\n\n\`inline code\` and:\n\n\`\`\`ts\nconst x: number = 42;\n\`\`\`\n[/MD]`;

    // Simulate provider closing the block and plugin rendering HTML
    const htmlBlock = plugin.renderHtmlBlock?.('md', block.replace('[MD]', '').replace('[/MD]', '')) || '';

    return html`
      <div style="padding: 40px; max-width: 800px; margin: 0 auto; background: #f5f5f5;">
        <h2 style="margin-bottom: 24px;">Basic Markdown Block</h2>
        <div .innerHTML=${htmlBlock}></div>
      </div>
    `;
  }
};

/**
 * Text → Markdown → Text streaming example
 */
export const TextMarkdownThenText: Story = {
  render: () => {
    const provider = new MockProvider({
      delay: 400,
      streaming: true,
      streamingInterval: 20,
      contextualResponses: false,
      useHistory: false,
      customResponses: [
        `Here is some introductory plain text that streams first, setting context and showing natural typing before the markdown section appears.\n\n[MD]### A streamed markdown section\n- First item\n- Second item with a [link](https://example.com)\n\nSome **bold** and *italic* emphasize points.\n\n\`\`\`ts\nconst greet = (name: string) => 'Hello, ' + name;\n\`\`\`\n[/MD]\n\nNow the response continues with trailing plain text after the markdown block has closed, proving that content resumes streaming naturally in the correct order.`
      ]
    });

    provider.connect();

    const controller = new ChatbotCoreController({
      provider,
      plugins: [new MarkdownPlugin()],
      initialMessages: [
        {
          id: 'intro-md-2',
          sender: 'bot' as any,
          text: 'This example shows text → markdown → text in a single streamed message. Click send or type anything to trigger it.',
          timestamp: new Date().toISOString(),
          introduction: true,
          suggestions: [
            { id: 'md-sandwich', text: 'Show text → markdown → text' }
          ]
        }
      ]
    });

    setTimeout(() => {
      const el = document.querySelector('nr-chatbot');
      if (el) (el as any).controller = controller;
    }, 0);

    return html`
      <div style="height: 100vh; display: flex; flex-direction: column;">
        <nr-chatbot
          placeholder="Ask for the sandwich demo..."
          size="full"
          variant="default"
          .showSendButton=${true}
          .autoScroll=${true}
        ></nr-chatbot>
      </div>
    `;
  }
};
