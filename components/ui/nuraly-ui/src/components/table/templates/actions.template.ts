import { html, TemplateResult } from 'lit';
import { Sizes } from '../table.types.js';

export interface ActionsTemplateData {
  selectedItems: number;
  size: Sizes;
  onCancelSelection: () => void;
}

/**
 * Renders the actions bar template for selected items
 * @param data - Actions data and event handlers
 * @returns Template for actions bar
 */
export function renderActionsTemplate(data: ActionsTemplateData): TemplateResult {
  return html`
    <div class="actions-container" data-size="${data.size}">
      <span>${data.selectedItems} selected</span>
      <button @click=${data.onCancelSelection}>Cancel</button>
    </div>
  `;
}
