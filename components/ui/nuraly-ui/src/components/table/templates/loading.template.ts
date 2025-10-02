/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { TableHost } from '../interfaces/index.js';

/**
 * Renders skeleton loading rows for the table
 * @param host - The table host component
 * @param rowCount - Number of skeleton rows to show (default: 5)
 * @returns Template with skeleton rows
 */
export function renderLoadingTemplate(host: TableHost, rowCount = 5): TemplateResult {
  const hasSelection = !!host.selectionMode;

  return html`
    ${Array.from({ length: rowCount }, () => html`
      <tr class="skeleton-row">
        ${hasSelection ? html`
          <td class="skeleton-cell selection-skeleton">
            <div class="skeleton-checkbox"></div>
          </td>
        ` : ''}
        ${host.headers.map(() => html`
          <td class="skeleton-cell">
            <div class="skeleton-content"></div>
          </td>
        `)}
      </tr>
    `)}
  `;
}

/**
 * Renders a centered spinner loading indicator
 * @param host - The table host component
 * @returns Template with centered spinner
 */
export function renderSpinnerLoadingTemplate(host: TableHost): TemplateResult {
  const hasSelection = !!host.selectionMode;
  const columnCount = host.headers.length + (hasSelection ? 1 : 0);

  return html`
    <tr class="loading-row">
      <td colspan="${columnCount}" class="loading-cell">
        <div class="loading-spinner-container">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading data...</p>
        </div>
      </td>
    </tr>
  `;
}
