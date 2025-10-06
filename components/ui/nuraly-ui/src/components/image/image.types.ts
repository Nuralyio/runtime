/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Image fit modes
 */
export const enum ImageFit {
  /** Default behavior, no scaling */
  None = 'none',
  /** The content is sized to fill the element's box */
  Fill = 'fill',
  /** The content is sized to maintain its aspect ratio while fitting within the element's box */
  Contain = 'contain',
  /** The content is sized to maintain its aspect ratio while filling the element's entire box */
  Cover = 'cover',
  /** The content is sized as if none or contain were specified */
  ScaleDown = 'scale-down',
}

/**
 * Image placeholder type
 */
export const enum ImagePlaceholder {
  /** Default placeholder icon */
  Default = 'default',
  /** Custom placeholder */
  Custom = 'custom',
}

/**
 * Image configuration interface
 */
export interface ImageConfig {
  /** Image source URL */
  src: string;
  
  /** Fallback image URL when loading fails */
  fallback?: string;
  
  /** Image width */
  width?: string | number;
  
  /** Image height */
  height?: string | number;
  
  /** Alternative text for the image */
  alt?: string;
  
  /** Whether the image is previewable (clickable to show fullscreen) */
  previewable?: boolean;
  
  /** Object-fit CSS property value */
  fit?: ImageFit;
  
  /** Whether to show a placeholder while loading */
  placeholder?: boolean | string;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Callback when image loads successfully */
  onLoad?: () => void;
  
  /** Callback when image fails to load */
  onError?: (error: Error) => void;
}

/**
 * Image event detail
 */
export interface ImageEventDetail {
  /** Original event */
  originalEvent?: Event;
  
  /** Error message if applicable */
  error?: string;
  
  /** Image source */
  src?: string;
}
