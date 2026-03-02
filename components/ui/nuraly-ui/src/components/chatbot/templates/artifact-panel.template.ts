/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { msg } from '@lit/localize';
import type { ChatbotArtifact } from '../chatbot.types.js';

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

/** Map language identifier to display name */
function getLangDisplayName(lang: string): string {
  const map: Record<string, string> = {
    javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python',
    java: 'Java', go: 'Go', rust: 'Rust', c: 'C', cpp: 'C++',
    csharp: 'C#', ruby: 'Ruby', php: 'PHP', swift: 'Swift',
    kotlin: 'Kotlin', html: 'HTML', css: 'CSS', scss: 'SCSS',
    sql: 'SQL', graphql: 'GraphQL', json: 'JSON', yaml: 'YAML',
    xml: 'XML', toml: 'TOML', markdown: 'Markdown', md: 'Markdown',
    bash: 'Bash', shell: 'Shell', sh: 'Shell', zsh: 'Zsh',
    dockerfile: 'Dockerfile', makefile: 'Makefile', text: 'Text'
  };
  return map[lang] || lang.charAt(0).toUpperCase() + lang.slice(1);
}

/** Escape HTML entities */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Minimal markdown to HTML (reuses same transforms as MarkdownPlugin) */
function renderSimpleMarkdown(text: string): string {
  let t = escapeHtml(text);

  // Code blocks
  t = t.replace(/```([\s\S]*?)```/g, '<pre class="md-code"><code>$1</code></pre>');
  // Inline code
  t = t.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>');
  // Headings
  t = t.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  t = t.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  t = t.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  // Bold / Italic
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Links
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // Paragraphs
  t = t.split(/\n\n+/)
    .map(block => /^(<h\d|<pre|<ul|<ol|<blockquote)/.test(block.trim()) ? block : `<p>${block.replace(/\n/g, '<br/>')}</p>`)
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
        ${(data.renderContent && data.renderContent(artifact)) || renderArtifactContent(artifact)}
      </div>
    </div>
  `;
}
