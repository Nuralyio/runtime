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

      validFiles.push(chatbotFile);
    }

    // Dispatch errors if any
    if (errors.length > 0) {
      this.host.dispatchEventWithMetadata('chatbot-file-error', {
        error: new Error(errors.join(', ')),
        metadata: { errors }
      });
    }

    // Process valid files
    if (validFiles.length > 0) {
      await this.processFiles(validFiles, fileArray.filter((_, index) => 
        this.validateFile(fileArray[index]).valid
      ));
    }

    return validFiles;
  }

  /**
   * Process uploaded files
   */
  private async processFiles(chatbotFiles: ChatbotFile[], originalFiles: File[]): Promise<void> {
    for (let i = 0; i < chatbotFiles.length; i++) {
      const chatbotFile = chatbotFiles[i];
      const originalFile = originalFiles[i];

      try {
        // Start upload process
        this.uploadProgressMap.set(chatbotFile.id, {
          fileId: chatbotFile.id,
          progress: 0,
          status: 'uploading'
        });

        // Create preview URL for images
        if (chatbotFile.type === ChatbotFileType.Image) {
          chatbotFile.previewUrl = URL.createObjectURL(originalFile);
        }

        // Simulate upload progress (replace with actual upload logic)
        await this.simulateUpload(chatbotFile, originalFile);

        // Add to uploaded files
        this.uploadedFiles.push(chatbotFile);

        // Dispatch success event
        this.host.dispatchEventWithMetadata('chatbot-file-uploaded', {
          file: chatbotFile,
          metadata: { originalFile }
        });

      } catch (error) {
        // Handle upload error
        chatbotFile.error = error instanceof Error ? error.message : 'Upload failed';
        this.uploadProgressMap.set(chatbotFile.id, {
          fileId: chatbotFile.id,
          progress: 0,
          status: 'error',
          error: chatbotFile.error
        });

        this.host.dispatchEventWithMetadata('chatbot-file-error', {
          file: chatbotFile,
          error: error instanceof Error ? error : new Error('Upload failed')
        });
      }
    }
  }

  /**
   * Simulate file upload with progress (replace with actual upload implementation)
   */
  private async simulateUpload(file: ChatbotFile, originalFile: File): Promise<void> {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          file.uploadProgress = 100;
          file.url = URL.createObjectURL(originalFile); // Replace with actual URL
          
          this.uploadProgressMap.set(file.id, {
            fileId: file.id,
            progress: 100,
            status: 'completed'
          });
          
          resolve();
        } else {
          file.uploadProgress = progress;
          this.uploadProgressMap.set(file.id, {
            fileId: file.id,
            progress,
            status: 'uploading'
          });
          
          // Trigger update
          this.host.requestUpdate();
        }
      }, 100);

      // Simulate occasional upload failures
      if (Math.random() < 0.1) { // 10% chance of failure
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Upload failed'));
        }, 500);
      }
    });
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
      
      this.host.dispatchEventWithMetadata('chatbot-file-removed', {
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