/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { msg } from '@lit/localize';

// Import required components
import '../../modal/modal.component.js';
import '../../input/input.component.js';
import '../../button/button.component.js';

export interface UrlModalTemplateHandlers {
  onClose: () => void;
  onUrlInputChange: (e: Event) => void;
  onUrlInputKeydown: (e: KeyboardEvent) => void;
  onConfirm: () => void;
}

export interface UrlModalTemplateData {
  isOpen: boolean;
  urlInput: string;
}

/**
 * Renders URL attachment modal
 */
export function renderUrlModal(
  data: UrlModalTemplateData,
  handlers: UrlModalTemplateHandlers
): TemplateResult {
  return html`
    <nr-modal 
      ?open=${data.isOpen}
      @nr-modal-close=${handlers.onClose}
      part="url-modal"
    >
      <div slot="header">${msg('Add URL')}</div>
      
      <nr-input
        slot="default"
        type="url"
        .value=${data.urlInput}
        placeholder="${msg('Enter URL...')}"
        @input=${handlers.onUrlInputChange}
        @keydown=${handlers.onUrlInputKeydown}
      ></nr-input>
      
      <div slot="footer">
        <nr-button 
          type="default"
          size="small"
          @click=${handlers.onClose}
        >
          ${msg('Cancel')}
        </nr-button>
        <nr-button 
          type="primary"
          size="small"
          @click=${handlers.onConfirm}
          ?disabled=${!data.urlInput}
        >
          ${msg('Add')}
        </nr-button>
      </div>
    </nr-modal>
  `;
}
