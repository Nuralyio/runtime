/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, nothing, TemplateResult } from 'lit';

/**
 * Data required for rendering the empty state
 */
export interface EmptyStateTemplateData {
  hasNodes: boolean;
}

/**
 * Render the empty state when no nodes exist
 */
export function renderEmptyStateTemplate(data: EmptyStateTemplateData): TemplateResult | typeof nothing {
  if (data.hasNodes) return nothing;

  return html`
    <div class="empty-state">
      <div class="empty-state-icon">
        <nr-icon name="git-branch" size="xlarge"></nr-icon>
      </div>
      <div class="empty-state-text">No nodes yet</div>
      <div class="empty-state-hint">
        Click the + button or double-click to add nodes
      </div>
    </div>
  `;
}
