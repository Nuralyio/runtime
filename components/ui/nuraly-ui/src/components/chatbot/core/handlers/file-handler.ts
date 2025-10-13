/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { EventBus } from '../event-bus.js';
import { StateHandler } from './state-handler.js';
import type { ChatbotFile, ChatbotFileType } from '../../chatbot.types.js';

/**
 * FileHandler - Handles file operations
 * Manages file uploads, removal, and file list
 */
export class FileHandler {
  constructor(
    private stateHandler: StateHandler,
    private eventBus: EventBus
  ) {}

  /**
   * Add file to uploaded files
   */
  addFile(file: ChatbotFile): void {
    const state = this.stateHandler.getState();
    this.stateHandler.updateState({
      uploadedFiles: [...state.uploadedFiles, file]
    });
    this.eventBus.emit('file:uploaded', file);
  }

  /**
   * Remove file from uploaded files
   */
  removeFile(fileId: string): void {
    const state = this.stateHandler.getState();
    this.stateHandler.updateState({
      uploadedFiles: state.uploadedFiles.filter(f => f.id !== fileId)
    });
    this.eventBus.emit('file:removed', fileId);
  }

  /**
   * Clear all uploaded files
   */
  clearFiles(): void {
    this.stateHandler.updateState({ uploadedFiles: [] });
  }

  /**
   * Get all uploaded files
   */
  getUploadedFiles(): ChatbotFile[] {
    const state = this.stateHandler.getState();
    return [...state.uploadedFiles];
  }

  /**
   * Get file by ID
   */
  getFileById(fileId: string): ChatbotFile | undefined {
    const state = this.stateHandler.getState();
    return state.uploadedFiles.find(f => f.id === fileId);
  }

  /**
   * Create ChatbotFile from browser File object
   */
  async createChatbotFile(file: File): Promise<ChatbotFile> {
    const chatbotFile: ChatbotFile = {
      id: this.generateId('file'),
      name: file.name,
      size: file.size,
      type: this.determineFileType(file.type),
      mimeType: file.type,
      uploadProgress: 100
    };

    return chatbotFile;
  }

  /**
   * Determine file type from MIME type
   */
  private determineFileType(mimeType: string): ChatbotFileType {
    if (mimeType.startsWith('image/')) return 'image' as ChatbotFileType;
    if (mimeType.startsWith('video/')) return 'video' as ChatbotFileType;
    if (mimeType.startsWith('audio/')) return 'audio' as ChatbotFileType;
    if (mimeType.includes('pdf')) return 'pdf' as ChatbotFileType;
    if (mimeType.includes('text/')) return 'text' as ChatbotFileType;
    return 'document' as ChatbotFileType;
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
