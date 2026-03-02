/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { msg } from '@lit/localize';
import type { ChatbotArtifact } from '../chatbot.types.js';
import { escapeHtml, getLangDisplayName } from '../utils/index.js';

export interface ArtifactPanelTemplateData {
  artifact: ChatbotArtifact | null;
  isOpen: boolean;
  /** Custom content renderer. Return undefined/empty to fall back to default. */
  renderContent?: (artifact: ChatbotArtifact) => TemplateResult | undefined;
}

export interface ArtifactPanelTemplateHandlers {
  onClose: () => void;
  onCopy: (artifact: ChatbotArtifact) => void;
}

/** Minimal markdown to HTML (reuses same transforms as MarkdownPlugin) */
function renderSimpleMarkdown(text: string): string {
  let t = escapeHtml(text);

  // Code blocks
  t = t.replaceAll(/```([\s\S]*?)```/g, '<pre class="md-code"><code>$1</code></pre>');
  // Inline code
  t = t.replaceAll(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
  // Headings (anchored to line start — no backtracking risk)
  t = t.replaceAll(/^###[^\S\n]+(.+)$/gm, '<h3>$1</h3>');
  t = t.replaceAll(/^##[^\S\n]+(.+)$/gm, '<h2>$1</h2>');
  t = t.replaceAll(/^#[^\S\n]+(.+)$/gm, '<h1>$1</h1>');
  // Bold / Italic (negated class prevents backtracking)
  t = t.replaceAll(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replaceAll(/\*([^*]+)\*/g, '<em>$1</em>');
  // Links (negated classes prevent backtracking)
  t = t.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // Paragraphs
  t = t.split(/\n\n+/)
    .map(block => /^(<h\d|<pre|<ul|<ol|<blockquote)/.test(block.trim()) ? block : `<p>${block.replaceAll('\n', '<br/>')}</p>`)
    .join('\n');

  return t;
}

/** Render the content area based on language */
function renderArtifactContent(artifact: ChatbotArtifact): TemplateResult {
  const lang = artifact.language;

  // JSON: pretty-print
  if (lang === 'json') {
    let prettyContent: string;
    try {
      prettyContent = JSON.stringify(JSON.parse(artifact.content), null, 2);
    } catch {
      prettyContent = artifact.content;
    }
    return html`<pre class="artifact-panel__code"><code>${prettyContent}</code></pre>`;
  }

  // Markdown: render as HTML
  if (lang === 'md' || lang === 'markdown') {
    const rendered = renderSimpleMarkdown(artifact.content);
    return html`<div class="artifact-panel__rendered-md" .innerHTML=${rendered}></div>`;
  }

  // HTML: render in a contained div
  if (lang === 'html') {
    return html`<div class="artifact-panel__rendered-html" .innerHTML=${artifact.content}></div>`;
  }

  // Everything else: monospace code with language label
  return html`<pre class="artifact-panel__code"><code>${artifact.content}</code></pre>`;
}

/**
 * Renders the artifact preview panel (right side of chatbot)
 */
export function renderArtifactPanel(
  data: ArtifactPanelTemplateData,
  handlers: ArtifactPanelTemplateHandlers
): TemplateResult | typeof nothing {
  if (!data.isOpen || !data.artifact) return nothing;

  const artifact = data.artifact;
  const langLabel = getLangDisplayName(artifact.language);

  return html`
    <div class="artifact-panel" part="artifact-panel">
      <div class="artifact-panel__header">
        <div class="artifact-panel__header-info">
          <nr-tag size="small" class="artifact-panel__lang-badge">${langLabel}</nr-tag>
          <span class="artifact-panel__title">${artifact.title}</span>
        </div>
        <div class="artifact-panel__actions">
          <nr-button
            type="text"
            size="small"
            .icon=${['copy']}
            @click=${() => handlers.onCopy(artifact)}
            title="${msg('Copy code')}"
            aria-label="${msg('Copy code')}"
          ></nr-button>
          <nr-button
            type="text"
            size="small"
            .icon=${['x']}
            @click=${handlers.onClose}
            title="${msg('Close panel')}"
            aria-label="${msg('Close panel')}"
          ></nr-button>
        </div>
      </div>
      <div class="artifact-panel__content">
        ${data.renderContent?.(artifact) || renderArtifactContent(artifact)}
      </div>
    </div>
  `;
}
