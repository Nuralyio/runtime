/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { msg } from '@lit/localize';
import type { ChatbotArtifact } from '../chatbot.types.js';
import { getLangDisplayName, renderMarkdown } from '../utils/index.js';

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

/** Render the content area based on language */
function renderArtifactContent(artifact: ChatbotArtifact): TemplateResult {
  switch (artifact.language) {
    case 'json': {
      let prettyContent: string;
      try {
        prettyContent = JSON.stringify(JSON.parse(artifact.content), null, 2);
      } catch {
        prettyContent = artifact.content;
      }
      return html`<pre class="artifact-panel__code"><code>${prettyContent}</code></pre>`;
    }
    case 'md':
    case 'markdown':
      return html`<div class="artifact-panel__rendered-md">${unsafeHTML(renderMarkdown(artifact.content))}</div>`;
    case 'html':
      return html`<div class="artifact-panel__rendered-html">${unsafeHTML(artifact.content)}</div>`;
    default:
      return html`<pre class="artifact-panel__code"><code>${artifact.content}</code></pre>`;
  }
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
      <div class="artifact-panel__resize-handle" part="artifact-panel-resize-handle">
        <div class="artifact-panel__resize-bar"></div>
      </div>
      <div class="artifact-panel__body">
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
    </div>
  `;
}
