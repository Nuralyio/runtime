/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin } from '../core/types.js';
import { ChatPluginBase } from './chat-plugin.js';

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
    const html = this.renderMarkdown(content);
    return `${styleTag}${html}`;
  }

  // Backward compatibility: transform plain markdown when provider doesn't use [MD] blocks
  override async afterReceive(text: string): Promise<string> {
    // If the text already contains our [MD] block, let ProviderService handle it
    if (text.includes('[MD]') && text.includes('[/MD]')) return text;
    return this.renderMarkdown(text);
  }

  // Minimal markdown rendering (keep simple; in production use marked/markdown-it)
  private renderMarkdown(text: string): string {
    let transformed = text;

    // Escape basic HTML to reduce XSS risk (very naive; use a sanitizer in prod)
    transformed = transformed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks ```...```
    transformed = transformed.replace(/```([\s\S]*?)```/g, '<pre class="md-code"><code>$1</code></pre>');

    // Inline code `...`
    transformed = transformed.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');

    // Headings (###, ##, #)
    transformed = transformed.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    transformed = transformed.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    transformed = transformed.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Bold **...**
    transformed = transformed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic *...*
    transformed = transformed.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links [text](url)
    transformed = transformed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Unordered lists
    transformed = transformed.replace(/(?:^|\n)-\s+(.+)(?=\n|$)/g, (_m, item) => `\n<ul><li>${item}</li></ul>`);
    transformed = transformed.replace(/<ul>\s*<li>([\s\S]*?)<\/li>\s*<\/ul>\n<ul>/g, '<ul><li>$1</li>'); // merge adjacent uls

    // Paragraphs: wrap lines that are not block elements
    transformed = transformed
      .split(/\n\n+/)
      .map(block => /^(<h\d|<pre|<ul|<ol|<blockquote)/.test(block.trim()) ? block : `<p>${block.replace(/\n/g, '<br/>')}</p>`)
      .join('\n');

    return transformed;
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
