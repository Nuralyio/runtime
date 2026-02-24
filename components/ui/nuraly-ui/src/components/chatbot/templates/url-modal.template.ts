/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { msg } from '@lit/localize';


export interface UrlModalTemplateHandlers {
  onClose: () => void;
  onUrlInputChange: (e: Event) => void;
  onUrlInputKeydown: (e: KeyboardEvent) => void;
  onConfirm: () => void;
  onAttachFile: () => void;
}

export interface UrlModalTemplateData {
  isOpen: boolean;
  urlInput: string;
  isLoading?: boolean;
  error?: string;
  selectedFileName?: string;
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
      
      <div >
        <nr-row gutter="8" align="bottom">
          <nr-col span="20" >
            <nr-input
              
              type="url"
              .value=${data.urlInput}
              placeholder="${msg('Enter URL...')}"
              ?disabled=${data.isLoading}
              @nr-input=${handlers.onUrlInputChange}
              @keydown=${handlers.onUrlInputKeydown}
            >
              <nr-label slot="label">${msg('URL')}</nr-label>
            </nr-input>
          </nr-col>
          <nr-col span="4" >
            <nr-button 
              type="default"
              .icon=${['paperclip']}
              size="small"
              ?disabled=${data.isLoading}
              @click=${handlers.onAttachFile}
              title="${msg('Load file from URL')}"
              style="margin-left: 0.5rem;"
            >
            </nr-button>
          </nr-col>
        </nr-row>
        
        ${data.error ? html`
          <nr-alert 
            type="error" 
            closable
            style="margin-top: 1rem;"
          >
            ${data.error}
          </nr-alert>
        ` : nothing}
        
        ${data.selectedFileName ? html`
          <nr-alert 
            type="success" 
            style="margin-top: 1rem;"
          >
            ${msg('Selected file')}: ${data.selectedFileName}
          </nr-alert>
        ` : nothing}
        
        ${data.isLoading ? html`
          <nr-alert 
            type="info" 
            style="margin-top: 1rem;"
          >
            ${msg('Loading file from URL...')}
          </nr-alert>
        ` : nothing}
      </div>
      
      <div slot="footer">
        <nr-button 
          type="default"
          size="small"
          ?disabled=${data.isLoading}
          @click=${handlers.onClose}
        >
          ${msg('Cancel')}
        </nr-button>
        <nr-button 
          type="primary"
          size="small"
          ?disabled=${(!data.urlInput && !data.selectedFileName) || data.isLoading}
          ?loading=${data.isLoading}
          @click=${handlers.onConfirm}
        >
          ${msg('Add')}
        </nr-button>
      </div>
    </nr-modal>
  `;
}
