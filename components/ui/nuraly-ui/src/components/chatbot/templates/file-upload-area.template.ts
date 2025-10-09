/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult } from 'lit';
import { msg } from '@lit/localize';

export interface FileUploadAreaTemplateHandlers {
  onDrop: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDragLeave: () => void;
}

export interface FileUploadAreaTemplateData {
  isDragging: boolean;
}

/**
 * Renders file upload drag-and-drop area
 */
export function renderFileUploadArea(
  data: FileUploadAreaTemplateData,
  handlers: FileUploadAreaTemplateHandlers
): TemplateResult {
  return html`
    <div 
      class="file-upload-area ${data.isDragging ? 'file-upload-area--dragging' : ''}"
      part="file-upload-area"
      @drop=${handlers.onDrop}
      @dragover=${handlers.onDragOver}
      @dragleave=${handlers.onDragLeave}
    >
      <div class="file-upload-area__content">
        <div class="file-upload-area__icon">📁</div>
        <div class="file-upload-area__text">
          ${msg('Drop files here to upload')}
        </div>
      </div>
    </div>
  `;
}
