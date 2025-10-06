/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Document viewer type
 */
export const enum DocumentType {
  /** PDF document */
  PDF = 'pdf',
  /** Image document */
  Image = 'image',
  /** Other/unknown type */
  Other = 'other',
}

/**
 * Document fit mode
 */
export const enum DocumentFit {
  /** Fit to width */
  Width = 'width',
  /** Fit to height */
  Height = 'height',
  /** Fit to page */
  Page = 'page',
  /** Auto fit */
  Auto = 'auto',
}

/**
 * Document configuration interface
 */
export interface DocumentConfig {
  /** Document source URL */
  src: string;
  
  /** Document type */
  type?: DocumentType;
  
  /** Fallback document URL or image */
  fallback?: string;
  
  /** Document width */
  width?: string | number;
  
  /** Document height */
  height?: string | number;
  
  /** Whether document is previewable (fullscreen) */
  previewable?: boolean;
  
  /** Fit mode for document display */
  fit?: DocumentFit;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Callback when document loads */
  onLoad?: () => void;
  
  /** Callback when document fails to load */
  onError?: (error: Error) => void;
}

/**
 * Document event detail
 */
export interface DocumentEventDetail {
  /** Original event */
  originalEvent?: Event;
  
  /** Error message if applicable */
  error?: string;
  
  /** Document source */
  src?: string;
  
  /** Document type */
  type?: DocumentType;
}
