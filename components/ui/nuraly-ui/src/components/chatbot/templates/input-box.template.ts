/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { html, TemplateResult, nothing } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { msg } from '@lit/localize';
import { ChatbotFile } from '../chatbot.types.js';
import { DropdownItem } from '../../dropdown/dropdown.types.js';
import { SelectOption } from '../../select/select.types.js';


export interface InputBoxTemplateHandlers {
  onInput: (e: Event) => void;
  onKeydown: (e: KeyboardEvent) => void;
  onFocus: (e: FocusEvent) => void;
  onBlur: (e: FocusEvent) => void;
  onSend: () => void;
  onStop: () => void;
  onSendKeydown: (e: KeyboardEvent) => void;
  onFileDropdownClick: (e: CustomEvent) => void;
  onModuleChange: (e: CustomEvent) => void;
  onFileRemove: (fileId: string) => void;
  onFileClick?: (file: ChatbotFile) => void;
}

export interface InputBoxTemplateData {
  placeholder: string;
  disabled: boolean;
  currentInput: string;
  uploadedFiles: ChatbotFile[];
  isQueryRunning: boolean;
  showSendButton: boolean;
  enableFileUpload: boolean;
  fileUploadItems: DropdownItem[];
  enableModuleSelection: boolean;
  moduleOptions: SelectOption[];
  selectedModules: string[];
  moduleSelectionLabel: string;
  renderModuleDisplay: () => TemplateResult;
}

/**
 * Renders context tags for uploaded files with hover preview
 */
function renderContextTags(
  files: ChatbotFile[], 
  onRemove: (id: string) => void,
  onFileClick?: (file: ChatbotFile) => void
): TemplateResult {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'music';
    if (mimeType === 'application/pdf') return 'file-pdf';
    if (mimeType.startsWith('text/')) return 'file-text';
    return 'file';
  };

  const isImage = (mimeType: string) => mimeType.startsWith('image/');

  return html`
    <div class="context-tags-row" part="context-tags">
      ${repeat(files, f => f.id, f => html`
        <nr-dropdown 
          trigger="hover" 
          placement="top"
          size="small"
          class="file-preview-dropdown"
        >
          <nr-tag 
            slot="trigger"
            class="context-tag"
            size="small"
            closable
            @click=${() => onFileClick?.(f)}
            @nr-tag-close=${() => onRemove(f.id)}
            style="cursor: pointer;"
          >${f.name}</nr-tag>
          
          <div slot="content" class="file-preview-content">
            ${isImage(f.mimeType) && (f.url || f.previewUrl) ? html`
              <img 
                src="${f.previewUrl || f.url}" 
                alt="${f.name}"
                class="file-preview-image"
              />
            ` : html`
              <nr-icon 
                .name=${getFileIcon(f.mimeType)}
                size="large"
                class="file-preview-icon"
              ></nr-icon>
            `}
            <div class="file-preview-info">
              <div class="file-preview-name" title="${f.name}">${f.name}</div>
              <div class="file-preview-details">
                <span>${formatFileSize(f.size)}</span>
              </div>
            </div>
          </div>
        </nr-dropdown>
      `)}
    </div>
  `;
}

/**
 * Renders file upload button
 */
function renderFileUploadButton(
  data: InputBoxTemplateData,
  handlers: InputBoxTemplateHandlers
): TemplateResult {
  return html`
    <nr-dropdown 
      .items=${data.fileUploadItems}
      trigger="click"
      placement="top-start"
      size="small"
      ?disabled=${data.disabled}
      @nr-dropdown-item-click=${handlers.onFileDropdownClick}
    >
      <nr-button 
        slot="trigger"
        part="file-button"
        type="default"
        size="small"
        .icon=${["upload"]}
        ?disabled=${data.disabled}
        aria-label="${msg('Attach files')}"
        title="${msg('Attach files')}"
      >
        Attach
      </nr-button>
    </nr-dropdown>
  `;
}

/**
 * Renders module selector
 */
function renderModuleSelector(
  data: InputBoxTemplateData,
  handlers: InputBoxTemplateHandlers
): TemplateResult {
  return html`
    <nr-select
      .options=${data.moduleOptions}
      .value=${data.selectedModules}
      multiple
      placeholder="${data.moduleSelectionLabel}"
      size="small"
      ?disabled=${data.disabled}
      searchable
      search-placeholder="${msg('Search modules...')}"
      use-custom-selected-display
      part="module-select"
      class="module-select"
      @nr-change=${handlers.onModuleChange}
      aria-label="${msg('Select modules')}"
    >
      <span slot="selected-display">
        ${data.renderModuleDisplay()}
      </span>
    </nr-select>
  `;
}

/**
 * Renders send/stop button
 */
function renderSendButton(
  data: InputBoxTemplateData,
  handlers: InputBoxTemplateHandlers
): TemplateResult {
  return html`
    <nr-button 
      class="input-box__send-button" 
      part="send-button"
      type="default"
      size="small"
      .iconRight=${data.isQueryRunning ? 'stop' : 'arrow-up'}
      @click=${data.isQueryRunning ? handlers.onStop : handlers.onSend}
      @keydown=${handlers.onSendKeydown}
      aria-label="${data.isQueryRunning ? msg('Stop query') : msg('Send message')}"
      title="${data.isQueryRunning ? msg('Stop query') : msg('Send message')}"
    >
      ${data.isQueryRunning ? msg('Stop') : msg('Send')}
    </nr-button>
  `;
}

/**
 * Renders action buttons row
 */
function renderActionButtons(
  data: InputBoxTemplateData,
  handlers: InputBoxTemplateHandlers
): TemplateResult {
  return html`
    <div class="action-buttons-row">
      <div class="action-buttons-left">
        ${data.enableFileUpload ? renderFileUploadButton(data, handlers) : nothing}
        ${data.enableModuleSelection && data.moduleOptions.length > 0 
          ? renderModuleSelector(data, handlers) 
          : nothing}
      </div>
      
      <div class="action-buttons-right">
        ${data.showSendButton && (!data.disabled || data.isQueryRunning) && 
          (data.currentInput.trim() || data.uploadedFiles.length > 0 || data.isQueryRunning)
          ? renderSendButton(data, handlers)
          : nothing}
      </div>
    </div>
  `;
}

/**
 * Renders the complete input box
 */
export function renderInputBox(
  data: InputBoxTemplateData,
  handlers: InputBoxTemplateHandlers
): TemplateResult {
  return html`
    <div class="input-box" part="input-box">
      <div class="input-container">
        <!-- Context tags -->
        ${data.uploadedFiles.length > 0 
          ? renderContextTags(data.uploadedFiles, handlers.onFileRemove, handlers.onFileClick) 
          : nothing}

        <!-- Input area -->
        <div class="input-row">
          <div
            class="input-box__input"
            part="input"
            contenteditable="true"
            role="textbox"
            aria-multiline="true"
            aria-label="${msg('Chat input')}"
            data-placeholder="${data.placeholder}"
            @input=${handlers.onInput}
            @keydown=${handlers.onKeydown}
            @focus=${handlers.onFocus}
            @blur=${handlers.onBlur}
          ></div>
        </div>
        
        <!-- Action buttons -->
        ${renderActionButtons(data, handlers)}
      </div>
    </div>
  `;
}
