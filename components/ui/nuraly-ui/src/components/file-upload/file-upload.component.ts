import { LitElement, html, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { UploadFile } from './types.js';
import { styles } from './styles.js';
import { fileUtils } from './utils.js';

@customElement('nr-file-upload')
export class FileUpload extends LitElement {
  static override styles = styles;

  @property({ type: String }) accept: string = '';
  @property({ type: Boolean }) multiple: boolean = false;
  @property({ type: Boolean }) drag: boolean = true;
  @property({ type: String }) tip: string = '';
  @property({ type: Number }) limit: number = 0;
  @property({ type: Boolean }) preview: boolean = true;
  @property({ type: Boolean }) generatePreviewOnUpload: boolean = false;

  @state() fileList: UploadFile[] = [];
  @state() isDragOver: boolean = false;
  @state() showDragArea: boolean = false;
  @state() inputElement: HTMLInputElement | null = null;
  @state() dragCounter: number = 0;
  @state() previewImage: string | null = null;

  override connectedCallback() {
    super.connectedCallback();
    if (this.drag) {
      document.addEventListener('dragenter', this._onDocumentDragEnter);
      document.addEventListener('dragleave', this._onDocumentDragLeave);
      document.addEventListener('drop', this._onDocumentDrop);
      document.addEventListener('dragover', this._onDocumentDragOver);
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this.drag) {
      document.removeEventListener('dragenter', this._onDocumentDragEnter);
      document.removeEventListener('dragleave', this._onDocumentDragLeave);
      document.removeEventListener('drop', this._onDocumentDrop);
      document.removeEventListener('dragover', this._onDocumentDragOver);
    }
  }

  override firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.inputElement = this.shadowRoot?.querySelector('input[type="file"]') || null;
  }

  private _onDocumentDragEnter = (e: DragEvent) => {
    e.preventDefault();
    this.dragCounter++;
    
    if (this.dragCounter === 1) {
      this.showDragArea = true;
    }
  };

  private _onDocumentDragLeave = (e: DragEvent) => {
    e.preventDefault();
    this.dragCounter--;
    
    if (this.dragCounter === 0) {
      this.showDragArea = false;
      this.isDragOver = false;
    }
  };

  private _onDocumentDrop = (e: DragEvent) => {
    if (e.target !== this && !this.contains(e.target as Node)) {
      e.preventDefault();
      this.dragCounter = 0;
      this.showDragArea = false;
      this.isDragOver = false;
    }
  };

  private _onDocumentDragOver = (e: DragEvent) => {
    e.preventDefault();
    
    // Determine if the drag is over our component
    const path = e.composedPath();
    const isOverComponent = path.includes(this);
    
    if (isOverComponent) {
      this.isDragOver = true;
    } else {
      this.isDragOver = false;
    }
  };

  private _onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    this.dragCounter = 0;
    this.isDragOver = false;
    this.showDragArea = false;

    if (e.dataTransfer?.files) {
      this.dispatchEvent(
        new CustomEvent(`files-changed`, {
          detail: e.dataTransfer.files,
          bubbles: true,
          composed: true
        })
      );
      
      this.dispatchEvent(
        new CustomEvent(`file-drop`, {
          detail: { files: e.dataTransfer.files },
          bubbles: true,
          composed: true
        })
      );
      
      this._handleFiles(e.dataTransfer.files);
    }
  };

  private _onClick = () => {
    this.inputElement?.click();
  };

  private _onChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      this.dispatchEvent(
        new CustomEvent(`files-changed`, {
          detail: target.files,
          bubbles: true,
          composed: true
        }
      ));
      
      this._handleFiles(target.files);
      target.value = ''; 
    }
  };

  private async _handleFiles(files: FileList) {
    // Early check for multiple mode
    if (this.multiple && this.limit > 0 && this.fileList.length + files.length > this.limit) {
      this._dispatchEvent('exceed', { files });
      return;
    }
    
    // If not multiple, keep only the last file
    if (!this.multiple && files.length > 0) {
      // Get the last file from the FileList
      const lastFile = files[files.length - 1];
      
      // If preview modal is showing a preview from a file that's being replaced, close it
      if (this.previewImage && this.fileList.some(file => file.url === this.previewImage)) {
        this.previewImage = null;
      }
      
      // If there are existing files, dispatch remove events for each one
      const oldFiles = [...this.fileList];
      for (const file of oldFiles) {
        this._dispatchEvent('remove', { file });
      }
      
      // Clear the file list
      this.fileList = [];
      
      // Process only the last file
      const isImage = fileUtils.isImageFile(lastFile);
      const fileObj: UploadFile = {
        name: lastFile.name,
        size: fileUtils.formatFileSize(lastFile.size),
        raw: lastFile,
        status: 'ready',
        percentage: 0,
        uid: Date.now() + Math.random().toString(36).substring(2),
        isImage
      };

      if (this.preview && this.generatePreviewOnUpload && isImage) {
        fileObj.url = await fileUtils.createFilePreview(lastFile);
      }

      this.fileList = [fileObj];
      
      this.requestUpdate();

      // Emit file-selected event with the new file
      this._dispatchEvent('select', { files: [fileObj], fileList: this.fileList });
      
      return;
    }

    // For multiple mode, process all files
    const newFiles: UploadFile[] = [];

    for (const file of Array.from(files)) {
      const isImage = fileUtils.isImageFile(file);
      const fileObj: UploadFile = {
        name: file.name,
        size: fileUtils.formatFileSize(file.size),
        raw: file,
        status: 'ready',
        percentage: 0,
        uid: Date.now() + Math.random().toString(36).substring(2),
        isImage
      };

      if (this.preview && this.generatePreviewOnUpload && isImage) {
        fileObj.url = await fileUtils.createFilePreview(file);
      }

      this.fileList = [...this.fileList, fileObj];
      newFiles.push(fileObj);
    }

    this.requestUpdate();

    // Emit file-selected event with the new files
    this._dispatchEvent('select', { files: newFiles, fileList: this.fileList });
  }

  public updateFileStatus(uid: string, status: 'ready' | 'uploading' | 'success' | 'error', percentage?: number) {
    const file = this.fileList.find(f => f.uid === uid);
    
    if (file) {
      file.status = status;
      if (percentage !== undefined) {
        file.percentage = percentage;
      }
      this._updateFile(file);
    }
  }

  private _updateFile(updatedFile: UploadFile) {
    this.fileList = this.fileList.map(file =>
      file.uid === updatedFile.uid ? updatedFile : file
    );
    this.requestUpdate();
  }

  private _removeFile(uid: string) {
    const file = this.fileList.find(file => file.uid === uid);
    this.fileList = this.fileList.filter(file => file.uid !== uid);
    if (file) {
      this._dispatchEvent('remove', { file });
    }
    this.requestUpdate();
  }

  private _dispatchEvent(name: string, data: any) {
    this.dispatchEvent(new CustomEvent(`file-${name}`, {
      detail: data,
      bubbles: true,
      composed: true
    }));
  }

  private _showPreview(url: string) {
    this.previewImage = url;
  }

  private _closePreview() {
    this.previewImage = null;
  }

  override render() {
    return html`
      <div class="upload" @drop=${this._onDrop} @dragover=${(e: DragEvent) => e.preventDefault()}>
        <input 
          type="file" 
          class="hidden" 
          accept=${this.accept}
          ?multiple=${this.multiple}
          @change=${this._onChange}
        />

        ${this.showDragArea ? html`
          <div 
            class="upload-dragger ${this.isDragOver ? 'is-dragover' : ''}" 
            @click=${this._onClick}
          >
            <div class="upload-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div class="upload-text">Drop file here or click to upload</div>
            ${this.tip ? html`<div class="upload-tip">${this.tip}</div>` : ''}
          </div>
        ` : html`
        <nr-button  @click=${this._onClick}>Upload File</nr-button>
          ${this.tip ? html`<div class="upload-tip">${this.tip}</div>` : ''}
        `}

        <div class="file-list">
          ${this.fileList.map(file => html`
            <div class="file-item">
              ${file.isImage ? html`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              ` : html`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              `}
              <div class="file-name">${file.name}</div>
              <div class="file-size">${file.size}</div>
              <div class="file-status">
                ${file.status === 'success' ? html`
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#67c23a" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ` : file.status === 'error' ? html`
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f56c6c" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                ` : file.status === 'uploading' ? html`${file.percentage}%` : ''}
              </div>
              <div class="file-actions">
                ${file.isImage && file.url ? html`
                  <button class="preview-icon" @click=${() => this._showPreview(file.url!)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                ` : ''}
                <button @click=${() => this._removeFile(file.uid)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              ${file.status === 'uploading' ? html`
                <div class="progress-bar">
                  <div class="progress-inner" style="width: ${file.percentage}%"></div>
                </div>
              ` : ''}
            </div>
            ${this.preview && file.isImage && file.url ? html`
              <div class="file-preview">
                <img 
                  class="image-preview" 
                  src="${file.url}" 
                  alt="${file.name}" 
                  @click=${() => this._showPreview(file.url!)}
                />
              </div>
            ` : ''}
          `)}
        </div>

        ${this.previewImage ? html`
          <div class="preview-modal" @click=${this._closePreview}>
            <button class="preview-close">×</button>
            <img src="${this.previewImage}" alt="Preview" />
          </div>
        ` : ''}
      </div>
    `;
  }
}