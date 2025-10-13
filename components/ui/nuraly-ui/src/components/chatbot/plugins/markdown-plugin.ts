/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import type { ChatbotPlugin } from '../core/types.js';

/**
 * Markdown plugin - transforms markdown in messages
 * This is a simple example - in production you'd use a proper markdown library
 */
export class MarkdownPlugin implements ChatbotPlugin {
  readonly id = 'markdown';
  readonly name = 'Markdown Plugin';
  readonly version = '1.0.0';

  onInit(): void {
    console.log('[MarkdownPlugin] Initialized');
  }

  async afterReceive(text: string): Promise<string> {
    // Simple markdown-like transformations
    // In production, use a library like marked.js or markdown-it
    
    let transformed = text;

    // Code blocks
    transformed = transformed.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    transformed = transformed.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    transformed = transformed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    transformed = transformed.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Links
    transformed = transformed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    return transformed;
  }
}
