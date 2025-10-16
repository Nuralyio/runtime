/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { ChatbotFile } from '../chatbot.types.js';

export interface FilePreviewModalTemplateData {
  isOpen: boolean;
  file: ChatbotFile | null;
}

export interface FilePreviewModalTemplateHandlers {
  onClose: () => void;
}

/**
 * Format file size to human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Renders file preview modal
 */
export function renderFilePreviewModal(
  data: FilePreviewModalTemplateData,
  handlers: FilePreviewModalTemplateHandlers
): TemplateResult | typeof nothing {
  if (!data.isOpen || !data.file) {
    return nothing;
  }

  const file = data.file;
  const isImage = file.mimeType.startsWith('image/');
  const isPDF = file.mimeType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  return html`
    <nr-modal
      .open=${data.isOpen}
      size="large"
      title="${file.name}"
      @modal-close=${handlers.onClose}
    >
      <div style="width: 100%; height: 75vh; display: flex; flex-direction: column; align-items: stretch; justify-content: stretch;">
        ${isImage && (file.url || file.previewUrl) ? html`
          <img 
            src="${file.url || file.previewUrl}" 
            alt="${file.name}"
            style="max-width: 100%; max-height: 100%; object-fit: contain; align-self: center;"
          />
        ` : isPDF && file.url ? html`
          <div style="width: 100%; height: 100%; position: relative;">
            <nr-document
              .src="${file.url}"
              .type="${'pdf'}"
              .width="${'100%'}"
              .height="${'100%'}"
              .block="${true}"
              style="width: 100%; height: 100%; display: block;"
            ></nr-document>
          </div>
        ` : html`
          <div style="text-align: center; padding: 2rem; align-self: center;">
            <nr-icon name="file" size="xlarge" style="margin-bottom: 1rem;"></nr-icon>
            <p style="font-size: 1.1rem; font-weight: 500; margin-bottom: 0.5rem;">${file.name}</p>
            <p style="color: var(--nuraly-color-chatbot-timestamp); margin-bottom: 1.5rem;">
              ${formatFileSize(file.size)}
            </p>
            ${file.url ? html`
              <nr-button
                type="primary"
                @click=${() => window.open(file.url, '_blank')}
              >
                Open File
              </nr-button>
            ` : nothing}
          </div>
        `}
      </div>
    </nr-modal>
  `;
}
