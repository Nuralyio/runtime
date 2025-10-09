/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { ReactiveController, ReactiveControllerHost } from 'lit';
import {
    ChatbotFile,
    ChatbotFileType,
    ChatbotEventDetail,
    ChatbotUploadProgress,
    DEFAULT_MAX_FILE_SIZE,
    DEFAULT_MAX_FILES,
    DEFAULT_ALLOWED_FILE_TYPES,
    FILE_TYPE_MAPPINGS
} from '../chatbot.types.js';

/**
 * Interface for chatbot file upload controller host
 */
export interface ChatbotFileUploadControllerHost extends ReactiveControllerHost {
  config: { 
    maxFileSize?: number;
    allowedFileTypes?: string[];
    maxFiles?: number;
    enableFileUpload?: boolean;
  };
  dispatchEventWithMetadata(type: string, detail?: ChatbotEventDetail): void;
}

/**
 * Controller for handling file uploads in chatbot
 */
export class ChatbotFileUploadController implements ReactiveController {
  private host: ChatbotFileUploadControllerHost;
  private uploadedFiles: ChatbotFile[] = [];
  private uploadProgressMap: Map<string, ChatbotUploadProgress> = new Map();

  constructor(host: ChatbotFileUploadControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    // Setup drag and drop listeners if enabled
    if (this.isFileUploadEnabled()) {
      this.setupDragAndDrop();
    }
  }

  hostDisconnected(): void {
    this.uploadedFiles = [];
    this.uploadProgressMap.clear();
  }

  /**
   * Check if file upload is enabled
   */
  isFileUploadEnabled(): boolean {
    return this.host.config.enableFileUpload !== false;
  }

  /**
   * Get maximum file size
   */
  getMaxFileSize(): number {
    return this.host.config.maxFileSize || DEFAULT_MAX_FILE_SIZE;
  }

  /**
   * Get maximum number of files
   */
  getMaxFiles(): number {
    return this.host.config.maxFiles || DEFAULT_MAX_FILES;
  }

  /**
   * Get allowed file types
   */
  getAllowedFileTypes(): string[] {
    return this.host.config.allowedFileTypes || DEFAULT_ALLOWED_FILE_TYPES;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.getMaxFileSize()) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatFileSize(this.getMaxFileSize())} limit`
      };
    }

    // Check file type
    const allowedTypes = this.getAllowedFileTypes();
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowed) {
      return {
        valid: false,
        error: 'File type not supported'
      };
    }

    // Check number of files
    if (this.uploadedFiles.length >= this.getMaxFiles()) {
      return {
        valid: false,
        error: `Maximum ${this.getMaxFiles()} files allowed`
      };
    }

    return { valid: true };
  }

  /**
   * Determine file type from MIME type
   */
  private determineFileType(mimeType: string): ChatbotFileType {
    for (const [pattern, type] of Object.entries(FILE_TYPE_MAPPINGS)) {
      if (mimeType.startsWith(pattern)) {
        return type;
      }
    }
    return ChatbotFileType.Unknown;
  }

  /**
   * Handle file selection
   */
  async handleFileSelection(files: FileList | File[]): Promise<ChatbotFile[]> {
    const fileArray = Array.from(files);
    const validFiles: ChatbotFile[] = [];
    const validOriginalFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const validation = this.validateFile(file);
      
      if (!validation.valid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      const chatbotFile: ChatbotFile = {
        id: this.generateFileId(),
        name: file.name,
        size: file.size,
        type: this.determineFileType(file.type),
        mimeType: file.type,
        uploadProgress: 0
      };

      // Create preview URL for images upfront
      if (chatbotFile.type === ChatbotFileType.Image) {
        try {
          chatbotFile.previewUrl = URL.createObjectURL(file);
        } catch {}
      }

      validFiles.push(chatbotFile);
      validOriginalFiles.push(file);
    }

    // Dispatch errors if any
    if (errors.length > 0) {
      this.host.dispatchEventWithMetadata('nr-chatbot-file-error', {
        error: new Error(errors.join(', ')),
        metadata: { errors }
      });
    }

    // Add all valid files at once so UI updates in a single render
    if (validFiles.length > 0) {
      this.uploadedFiles = [...this.uploadedFiles, ...validFiles];
      this.host.requestUpdate();

      // Emit a single event with all selected files; host (chatbot) can handle actual upload
      this.host.dispatchEventWithMetadata('nr-chatbot-files-selected', {
        files: validFiles,
        metadata: { originalFiles: validOriginalFiles }
      });
    }

    return validFiles;
  }

  /**
   * Remove uploaded file
   */
  removeFile(fileId: string): void {
    const index = this.uploadedFiles.findIndex(f => f.id === fileId);
    if (index !== -1) {
      const file = this.uploadedFiles[index];
      
      // Cleanup preview URL
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
      if (file.url) {
        URL.revokeObjectURL(file.url);
      }
      
      this.uploadedFiles.splice(index, 1);
      this.uploadProgressMap.delete(fileId);
      
      this.host.dispatchEventWithMetadata('nr-chatbot-file-removed', {
        file,
        metadata: { fileId }
      });
      
      this.host.requestUpdate();
    }
  }

  /**
   * Clear all uploaded files
   */
  clearFiles(): void {
    // Cleanup URLs
    this.uploadedFiles.forEach(file => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      if (file.url) URL.revokeObjectURL(file.url);
    });
    
    this.uploadedFiles = [];
    this.uploadProgressMap.clear();
    this.host.requestUpdate();
  }

  /**
   * Get uploaded files
   */
  getUploadedFiles(): ChatbotFile[] {
    return [...this.uploadedFiles];
  }

  /**
  * Add a file by URL (no upload). Emits nr-chatbot-files-selected with the created file.
   */
  /**
   * Add file from URL by fetching and creating File object
   */
  async addUrlFile(url: string): Promise<ChatbotFile | null> {
    if (!url) return null;
    
    try {
      const parsed = new URL(url);
      const nameFromUrl = decodeURIComponent(parsed.pathname.split('/').pop() || 'file');
      
      // Create temporary file entry for loading state
      const tempId = this.generateFileId();
      const mimeGuess = this.guessMimeFromExtension(nameFromUrl);
      const fileType = this.determineFileType(mimeGuess);

      const tempFile: ChatbotFile = {
        id: tempId,
        name: nameFromUrl,
        size: 0,
        type: fileType,
        mimeType: mimeGuess,
        url,
        uploadProgress: 0
      };

      this.uploadedFiles = [...this.uploadedFiles, tempFile];
      this.host.requestUpdate();

      // Fetch the file from URL
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      // Get the blob and create File object
      const blob = await response.blob();
      const contentType = response.headers.get('content-type') || mimeGuess;
      const file = new File([blob], nameFromUrl, { type: contentType });

      // Validate the fetched file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        // Remove temp file
        this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== tempId);
        this.host.requestUpdate();
        
        this.host.dispatchEventWithMetadata('nr-chatbot-file-error', {
          error: new Error(validation.error),
          metadata: { url, fileName: nameFromUrl }
        });
        return null;
      }

      // Create the final chatbot file
      const chatbotFile: ChatbotFile = {
        id: tempId,
        name: file.name,
        size: file.size,
        type: this.determineFileType(file.type),
        mimeType: file.type,
        url,
        uploadProgress: 100
      };

      // Create preview URL for images
      if (chatbotFile.type === ChatbotFileType.Image) {
        try {
          chatbotFile.previewUrl = URL.createObjectURL(file);
        } catch {}
      }

      // Update the temp file with actual data
      this.uploadedFiles = this.uploadedFiles.map(f => 
        f.id === tempId ? chatbotFile : f
      );
      this.host.requestUpdate();

      this.host.dispatchEventWithMetadata('nr-chatbot-file-uploaded', {
        file: chatbotFile,
        metadata: { source: 'url', originalUrl: url, originalFile: file }
      });

      return chatbotFile;
    } catch (error) {
      // Remove any temp file
      this.uploadedFiles = this.uploadedFiles.filter(f => f.url !== url);
      this.host.requestUpdate();
      
      this.host.dispatchEventWithMetadata('nr-chatbot-file-error', {
        error: error instanceof Error ? error : new Error('Failed to load file from URL'),
        metadata: { url }
      });
      return null;
    }
  }

  /**
   * Simple MIME guess from filename extension
   */
  private guessMimeFromExtension(fileName: string): string {
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'png': return 'image/png';
      case 'gif': return 'image/gif';
      case 'webp': return 'image/webp';
      case 'pdf': return 'application/pdf';
      case 'json': return 'application/json';
      case 'js': return 'application/javascript';
      case 'txt': return 'text/plain';
      case 'csv': return 'text/csv';
      case 'html': return 'text/html';
      case 'css': return 'text/css';
      default: return 'application/octet-stream';
    }
  }

  /**
   * Get upload progress for a file
   */
  getUploadProgress(fileId: string): ChatbotUploadProgress | undefined {
    return this.uploadProgressMap.get(fileId);
  }

  /**
   * Setup drag and drop functionality
   */
  private setupDragAndDrop(): void {
    // This would be implemented in the component's render method
    // with drag event handlers
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generate unique file ID
   */
  private generateFileId(): string {
    return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create file input element programmatically
   */
  createFileInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = this.getMaxFiles() > 1;
    input.accept = this.getAllowedFileTypes().join(',');
    
    input.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        this.handleFileSelection(target.files);
      }
    });
    
    return input;
  }

  /**
   * Trigger file selection dialog
   */
  openFileDialog(): void {
    const input = this.createFileInput();
    input.click();
  }
}