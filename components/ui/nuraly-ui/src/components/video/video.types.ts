/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

/**
 * Video player controls visibility
 */
export const enum VideoControls {
  /** Show controls */
  Show = 'show',
  /** Hide controls */
  Hide = 'hide',
  /** Show controls on hover */
  Hover = 'hover',
}

/**
 * Video preload strategy
 */
export const enum VideoPreload {
  /** No preloading */
  None = 'none',
  /** Preload metadata only */
  Metadata = 'metadata',
  /** Preload entire video */
  Auto = 'auto',
}

/**
 * Video configuration interface
 */
export interface VideoConfig {
  /** Video source URL */
  src: string;
  
  /** Fallback video URL or image */
  fallback?: string;
  
  /** Video width */
  width?: string | number;
  
  /** Video height */
  height?: string | number;
  
  /** Whether video should autoplay */
  autoplay?: boolean;
  
  /** Whether video should loop */
  loop?: boolean;
  
  /** Whether video is muted */
  muted?: boolean;
  
  /** Show video controls */
  controls?: boolean | VideoControls;
  
  /** Video poster image */
  poster?: string;
  
  /** Preload strategy */
  preload?: VideoPreload;
  
  /** Whether video is previewable (fullscreen) */
  previewable?: boolean;
  
  /** Custom CSS class */
  customClass?: string;
  
  /** Callback when video starts playing */
  onPlay?: () => void;
  
  /** Callback when video is paused */
  onPause?: () => void;
  
  /** Callback when video ends */
  onEnded?: () => void;
  
  /** Callback when video fails to load */
  onError?: (error: Error) => void;
}

/**
 * Video event detail
 */
export interface VideoEventDetail {
  /** Original event */
  originalEvent?: Event;
  
  /** Error message if applicable */
  error?: string;
  
  /** Video source */
  src?: string;
  
  /** Current time in seconds */
  currentTime?: number;
  
  /** Duration in seconds */
  duration?: number;
}
