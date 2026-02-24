import { css } from 'lit';
import { styleVariables } from './icon.variables.js';

/**
 * Icon component styles for the Hybrid UI Library
 * 
 * This file contains all the styling for the nr-icon component, including:
 * - Base icon styles with CSS custom properties for theming
 * - Multiple icon states (default, hover, active, disabled, focus)
 * - Size variations (small, medium, large, custom)
 * - Interactive states for clickable icons
 * - Theme compatibility (light, dark, carbon, default design systems)
 * - Accessibility features and reduced motion support
 * 
 * The styling system uses CSS custom properties with fallbacks to allow
 * for both global and local customization of icon appearance.
 */

const iconStyle = css`
  /* 
   * Host element base styles
   * Container for the icon component with flexible positioning
   */
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    vertical-align: baseline;
    position: relative;
    font-family: var(--nuraly-font-family-icon, 'IBM Plex Sans', ui-sans-serif, system-ui);
    /* Ensure currentColor has a sensible default for Lucide stroke inheritance */
    color: var(--nuraly-color-icon, var(--nuraly-color-icon-fallback, #161616));
  }

  /* Icon container that holds the dynamically created SVG */
  .icon-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  /* 
   * Base SVG icon styles - targets the SVG element created by Lucide's createElement
   * Uses stroke-based rendering for Lucide icons
   */
  .svg-icon {
    stroke: currentColor;
    fill: none;
    width: var(--nuraly-icon-size, var(--nuraly-icon-size-fallback, 18px));
    height: var(--nuraly-icon-size, var(--nuraly-icon-size-fallback, 18px));
    min-width: var(--nuraly-icon-min-size, var(--nuraly-icon-min-size-fallback, 16px));
    min-height: var(--nuraly-icon-min-size, var(--nuraly-icon-min-size-fallback, 16px));
    
    /* Transition and display properties */
    transition: var(--nuraly-icon-transition, var(--nuraly-icon-transition-fallback, opacity 0.2s ease, transform 0.2s ease, stroke 0.2s ease));
    display: block;
    flex-shrink: 0;
    
    /* Cursor handling */
    cursor: var(--nuraly-cursor-default, default);
  }

  /* Ensure all SVG primitives inherit stroke and have no fill */
  .svg-icon path,
  .svg-icon line,
  .svg-icon polyline,
  .svg-icon polygon,
  .svg-icon circle,
  .svg-icon rect,
  .svg-icon ellipse {
    stroke: currentColor;
    fill: none;
  }

  /* ========================================
   * CLICKABLE STATES
   * ======================================== */
  
  .svg-icon.clickable {
    cursor: var(--nuraly-cursor-interactive, pointer);
  }

  .svg-icon.clickable:hover {
    opacity: var(--nuraly-icon-hover-opacity, var(--nuraly-icon-hover-opacity-fallback, 0.8));
    transform: var(--nuraly-icon-hover-transform, var(--nuraly-icon-hover-transform-fallback, scale(1.05)));
    stroke: var(--nuraly-color-icon-hover, var(--nuraly-color-icon-hover-fallback, #0f62fe));
    color: var(--nuraly-color-icon-hover, var(--nuraly-color-icon-hover-fallback, #0f62fe));
  }

  .svg-icon.clickable:active {
    opacity: var(--nuraly-icon-active-opacity, var(--nuraly-icon-active-opacity-fallback, 0.6));
    transform: var(--nuraly-icon-active-transform, var(--nuraly-icon-active-transform-fallback, scale(0.95)));
    stroke: var(--nuraly-color-icon-active, var(--nuraly-color-icon-active-fallback, #054ada));
    color: var(--nuraly-color-icon-active, var(--nuraly-color-icon-active-fallback, #054ada));
  }

  .svg-icon.clickable:focus {
    outline: var(--nuraly-icon-focus-outline, var(--nuraly-icon-focus-outline-fallback, 2px solid #0f62fe));
    outline-offset: var(--nuraly-icon-focus-outline-offset, var(--nuraly-icon-focus-outline-offset-fallback, 2px));
    background: var(--nuraly-icon-focus-background, var(--nuraly-icon-focus-background-fallback, rgba(15, 98, 254, 0.1)));
    border-radius: var(--nuraly-icon-focus-border-radius, var(--nuraly-icon-focus-border-radius-fallback, 4px));
    box-shadow: var(--nuraly-icon-focus-shadow, var(--nuraly-icon-focus-shadow-fallback, none));
  }

  /* ========================================
   * DISABLED STATE
   * ======================================== */
  
  .svg-icon.disabled {
    opacity: var(--nuraly-icon-disabled-opacity, var(--nuraly-icon-disabled-opacity-fallback, 0.25));
    stroke: var(--nuraly-color-icon-disabled, var(--nuraly-color-icon-disabled-fallback, #c6c6c6));
    color: var(--nuraly-color-icon-disabled, var(--nuraly-color-icon-disabled-fallback, #c6c6c6));
    cursor: var(--nuraly-cursor-disabled, not-allowed);
  }

  .svg-icon.clickable.disabled:hover,
  .svg-icon.clickable.disabled:active {
    opacity: var(--nuraly-icon-disabled-opacity, var(--nuraly-icon-disabled-opacity-fallback, 0.25));
    stroke: var(--nuraly-color-icon-disabled, var(--nuraly-color-icon-disabled-fallback, #c6c6c6));
    color: var(--nuraly-color-icon-disabled, var(--nuraly-color-icon-disabled-fallback, #c6c6c6));
    transform: none;
  }

  .svg-icon.clickable.disabled:focus {
    outline: none;
    background: none;
    box-shadow: none;
  }

  /* ========================================
   * ACCESSIBILITY FEATURES
   * ======================================== */

  /* Screen reader only text for better accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .svg-icon {
      stroke: CanvasText;
      color: CanvasText;
    }
    
    .svg-icon.disabled {
      opacity: 0.5;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .svg-icon {
      transition: none;
    }
    
    .svg-icon.clickable:hover,
    .svg-icon.clickable:active {
      transform: none;
    }
  }
`;

/**
 * Size variation styles for the icon component
 * Defines size variations for different icon use cases
 */
const sizeIconStyle = css`
  /* ========================================
   * SIZE VARIATIONS
   * ======================================== */

  /* Small icon size */
  :host([size='small']) .svg-icon {
    width: var(--nuraly-icon-size-small, var(--nuraly-icon-size-small-fallback, 16px));
    height: var(--nuraly-icon-size-small, var(--nuraly-icon-size-small-fallback, 16px));
  }

  /* Medium icon size (default) */
  :host([size='medium']) .svg-icon {
    width: var(--nuraly-icon-size-medium, var(--nuraly-icon-size-medium-fallback, 20px));
    height: var(--nuraly-icon-size-medium, var(--nuraly-icon-size-medium-fallback, 20px));
  }

  /* Large icon size */
  :host([size='large']) .svg-icon {
    width: var(--nuraly-icon-size-large, var(--nuraly-icon-size-large-fallback, 24px));
    height: var(--nuraly-icon-size-large, var(--nuraly-icon-size-large-fallback, 24px));
  }

  /* Extra large icon size */
  :host([size='xlarge']) .svg-icon {
    width: var(--nuraly-icon-size-xlarge, var(--nuraly-icon-size-xlarge-fallback, 32px));
    height: var(--nuraly-icon-size-xlarge, var(--nuraly-icon-size-xlarge-fallback, 32px));
  }

  /* 2X large icon size */
  :host([size='xxlarge']) .svg-icon {
    width: var(--nuraly-icon-size-xxlarge, var(--nuraly-icon-size-xxlarge-fallback, 40px));
    height: var(--nuraly-icon-size-xxlarge, var(--nuraly-icon-size-xxlarge-fallback, 40px));
  }
`;

export const styles = [iconStyle, sizeIconStyle, styleVariables];
