/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Message sender types
 */
export enum ChatbotSender {
  User = 'user',
  Bot = 'bot',
  System = 'system'
}

/**
 * Chatbot loading indicator types
 */
export enum ChatbotLoadingType {
  Dots = 'dots',
  Spinner = 'spinner',
  Wave = 'wave',
  Typing = 'typing'
}

/**
 * Chatbot size variants
 */
export enum ChatbotSize {
  Small = 'small',
  Medium = 'medium',
  Large = 'large',
  Full = 'full'
}

/**
 * Chatbot visual themes
 */
export enum ChatbotVariant {
  Default = 'default',
  Minimal = 'minimal',
  Rounded = 'rounded',
  ChatGPT = 'chatgpt'
}

/**
 * Chatbot message state
 */
export enum ChatbotMessageState {
  Default = 'default',
  Error = 'error',
  Success = 'success',
  Loading = 'loading',
  Pending = 'pending'
}

/**
 * File upload types
 */
export enum ChatbotFileType {
  Image = 'image',
  Document = 'document',
  Audio = 'audio',
  Video = 'video',
  Archive = 'archive',
  Code = 'code',
  Unknown = 'unknown'
}

/**
 * Action button types
 */
export enum ChatbotActionType {
  Upload = 'upload',
  Clear = 'clear',
  Export = 'export',
  Settings = 'settings',
  Microphone = 'microphone',
  Camera = 'camera',
  Attach = 'attach'
}

/**
 * Interface for file attachments
 */
export interface ChatbotFile {
  id: string;
  name: string;
  size: number;
  type: ChatbotFileType;
  mimeType: string;
  url?: string;
  previewUrl?: string;
  uploadProgress?: number;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for chatbot messages
 */
export interface ChatbotMessage {
  id: string;
  sender: ChatbotSender;
  text: string;
  timestamp: string;
  error?: boolean;
  introduction?: boolean;
  state?: ChatbotMessageState;
  files?: ChatbotFile[];
  metadata?: Record<string, any>;
  parentId?: string; // For threaded conversations
  reactions?: string[]; // Emoji reactions
}

/**
 * Interface for chatbot suggestions
 */
export interface ChatbotSuggestion {
  id: string;
  text: string;
  category?: string;
  enabled?: boolean;
  icon?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for action buttons
 */
export interface ChatbotAction {
  id: string;
  type: ChatbotActionType;
  label: string;
  icon: string;
  enabled?: boolean;
  tooltip?: string;
  handler: () => void;
  metadata?: Record<string, any>;
}

/**
 * Interface for chatbot configuration
 */
export interface ChatbotConfig {
  apiEndpoint?: string;
  suggestionCategories?: string[];
  maxMessages?: number;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  maxFiles?: number;
  enableSuggestions?: boolean;
  enableRetry?: boolean;
  enableClear?: boolean;
  enableFileUpload?: boolean;
  enableVoiceInput?: boolean;
  enableCamera?: boolean;
  autoScroll?: boolean;
  typingIndicatorDelay?: number;
  showTimestamps?: boolean;
  showMessageStatus?: boolean;
  enableMarkdown?: boolean;
  enableCodeHighlighting?: boolean;
  enableEmojis?: boolean;
  placeholder?: string;
  theme?: 'carbon-light' | 'carbon-dark' | 'default-light' | 'default-dark';
}

/**
 * Interface for chatbot validation rules
 */
export interface ChatbotValidationRule {
  id: string;
  validator: (message: string, files?: ChatbotFile[]) => boolean | Promise<boolean>;
  errorMessage: string;
  warningMessage?: string;
}

/**
 * Interface for chatbot events
 */
export interface ChatbotEventDetail {
  message?: ChatbotMessage;
  suggestion?: ChatbotSuggestion;
  file?: ChatbotFile;
  files?: ChatbotFile[];
  action?: ChatbotAction;
  error?: Error;
  metadata?: Record<string, any>;
}

/**
 * Interface for file upload progress
 */
export interface ChatbotUploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

/**
 * Interface for conversation thread
 */
export interface ChatbotThread {
  id: string;
  title: string;
  messages: ChatbotMessage[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

/**
 * Constants
 */
export const EMPTY_STRING = '';
export const DEFAULT_TYPING_DELAY = 1000;
export const DEFAULT_MAX_MESSAGES = 100;
export const DEFAULT_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_MAX_FILES = 5;

/**
 * Default allowed file types
 */
export const DEFAULT_ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

/**
 * File type mappings
 */
export const FILE_TYPE_MAPPINGS: Record<string, ChatbotFileType> = {
  'image/': ChatbotFileType.Image,
  'audio/': ChatbotFileType.Audio,
  'video/': ChatbotFileType.Video,
  'application/pdf': ChatbotFileType.Document,
  'application/msword': ChatbotFileType.Document,
  'application/vnd.openxmlformats-officedocument': ChatbotFileType.Document,
  'text/': ChatbotFileType.Document,
  'application/zip': ChatbotFileType.Archive,
  'application/x-rar': ChatbotFileType.Archive,
  'application/javascript': ChatbotFileType.Code,
  'text/html': ChatbotFileType.Code,
  'text/css': ChatbotFileType.Code
};