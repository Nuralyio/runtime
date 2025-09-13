import { css } from 'lit';

/**
 * Icon component CSS custom properties (design tokens)
 * 
 * This file contains all the CSS custom properties used by the nr-icon component,
 * organized by functionality and including both light and dark theme variants.
 * 
 * The styling system uses CSS custom properties with fallbacks to allow
 * for both global and local customization of icon appearance.
 */
export const styleVariables = css`
  :host {
    /* ----------------------------------------
     * BASIC ICON PROPERTIES
     * ---------------------------------------- */
    --nuraly-icon-local-color: #000000;
    --nuraly-icon-local-width: 18px;
    --nuraly-icon-local-height: 18px;

    /* ----------------------------------------
     * INTERACTIVE STATES
     * ---------------------------------------- */
    --nuraly-icon-local-transition: opacity 0.2s ease, transform 0.2s ease;
    --nuraly-icon-local-hover-opacity: 0.8;
    --nuraly-icon-local-hover-transform: scale(1.1);
    --nuraly-icon-local-hover-color: #0f62fe;
    --nuraly-icon-local-active-opacity: 0.6;
    --nuraly-icon-local-active-transform: scale(0.95);
    --nuraly-icon-local-active-color: #054ada;
    --nuraly-icon-local-disabled-opacity: 0.4;
    --nuraly-icon-local-disabled-color: #c6c6c6;
    
    /* ----------------------------------------
     * FOCUS STYLES
     * ---------------------------------------- */
    --nuraly-icon-local-focus-outline: 2px solid #0f62fe;
    --nuraly-icon-local-focus-outline-offset: 2px;
    --nuraly-icon-local-focus-background: rgba(15, 98, 254, 0.1);
    --nuraly-icon-local-focus-border-radius: 4px;

    /* ----------------------------------------
     * CURSOR STYLES
     * ---------------------------------------- */
    --nuraly-icon-local-cursor: pointer;
    --nuraly-icon-local-disabled-cursor: not-allowed;
  }

  /* ========================================
   * DARK THEME OVERRIDES
   * ======================================== */
  
  /**
   * Dark theme styles using data-theme attribute on the SVG element
   * These override the light theme defaults when data-theme="dark" is applied
   */
  .svg-icon[data-theme="dark"] {
    --nuraly-icon-local-color: #ffffff;
    --nuraly-icon-local-hover-color: #78a9ff;
    --nuraly-icon-local-active-color: #a6c8ff;
    --nuraly-icon-local-disabled-color: #6f6f6f;
    --nuraly-icon-local-focus-outline: 2px solid #78a9ff;
    --nuraly-icon-local-focus-background: rgba(120, 169, 255, 0.1);
  }

  /* ========================================
   * REDUCED MOTION SUPPORT
   * ======================================== */
  
  /**
   * Accessibility: Respect user's motion preferences
   * Disables animations when user prefers reduced motion
   */
  @media (prefers-reduced-motion: reduce) {
    :host {
      --nuraly-icon-local-transition: none;
      --nuraly-icon-local-hover-transform: none;
      --nuraly-icon-local-active-transform: none;
    }
  }
`;
