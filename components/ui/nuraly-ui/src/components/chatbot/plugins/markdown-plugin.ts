/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin } from '../core/types.js';
import { ChatPluginBase } from './chat-plugin.js';
import { renderMarkdown } from '../utils/index.js';

/**
 * Markdown plugin - transforms markdown in messages
 * This is a simple example - in production you'd use a proper markdown library
 */
export class MarkdownPlugin extends ChatPluginBase implements ChatbotPlugin {
  readonly id = 'markdown';
  readonly name = 'Markdown Plugin';
  readonly version = '2.0.0';

  // Support HTML-like blocks so ProviderService can stream and insert when closed
  override htmlTags = [
    { name: 'md', open: '[MD]', close: '[/MD]' }
  ];

  override onInit(): void {
    console.log('[MarkdownPlugin] Initialized');
  }

  // Render completed [MD]...[/MD] blocks to HTML
  override renderHtmlBlock(name: string, content: string): string {
    if (name !== 'md') return '';

    const css = this.getStyles();
    const styleTag = this.getOncePerConversationStyleTag(css);
    return `${styleTag}${renderMarkdown(content)}`;
  }

  // Backward compatibility: transform plain markdown when provider doesn't use [MD] blocks
  override async afterReceive(text: string): Promise<string> {
    // If the text already contains our [MD] block, let ProviderService handle it
    if (text.includes('[MD]') && text.includes('[/MD]')) return text;
    return renderMarkdown(text);
  }

  // Minimal styling for markdown blocks
  private getStyles(): string {
    return `
      .md-code { background: #f6f8fa; padding: 12px; border-radius: 6px; overflow: auto; }
      .md-inline-code { background: rgba(27,31,35,.05); padding: 0 4px; border-radius: 4px; }
      h1, h2, h3 { margin: 0.6em 0 0.4em; font-weight: 600; }
      p { margin: 0.5em 0; }
      ul { margin: 0.5em 0 0.5em 1.2em; }
      a { color: var(--nuraly-color-primary, #0b5fff); text-decoration: underline; }
      @media (prefers-color-scheme: dark) {
        .md-code { background: #0f1115; color: #eaeef2; }
        .md-inline-code { background: rgba(255,255,255,.08); }
      }
    `;
  }
}
