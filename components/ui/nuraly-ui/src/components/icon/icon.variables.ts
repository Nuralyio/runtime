import { css } from 'lit';

/**
 * Icon component CSS custom properties (design tokens)
 * 
 * This file contains all the CSS custom properties used by the hy-icon component,
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
    --hybrid-icon-local-color: #000000;
    --hybrid-icon-local-width: 18px;
    --hybrid-icon-local-height: 18px;

    /* ----------------------------------------
     * INTERACTIVE STATES
     * ---------------------------------------- */
    --hybrid-icon-local-transition: opacity 0.2s ease, transform 0.2s ease;
    --hybrid-icon-local-hover-opacity: 0.8;
    --hybrid-icon-local-hover-transform: scale(1.1);
    --hybrid-icon-local-hover-color: #0f62fe;
    --hybrid-icon-local-active-opacity: 0.6;
    --hybrid-icon-local-active-transform: scale(0.95);
    --hybrid-icon-local-active-color: #054ada;
    --hybrid-icon-local-disabled-opacity: 0.4;
    --hybrid-icon-local-disabled-color: #c6c6c6;
    
    /* ----------------------------------------
     * FOCUS STYLES
     * ---------------------------------------- */
    --hybrid-icon-local-focus-outline: 2px solid #0f62fe;
    --hybrid-icon-local-focus-outline-offset: 2px;
    --hybrid-icon-local-focus-background: rgba(15, 98, 254, 0.1);
    --hybrid-icon-local-focus-border-radius: 4px;

    /* ----------------------------------------
     * CURSOR STYLES
     * ---------------------------------------- */
    --hybrid-icon-local-cursor: pointer;
    --hybrid-icon-local-disabled-cursor: not-allowed;
  }

  /* ========================================
   * DARK THEME OVERRIDES
   * ======================================== */
  
  /**
   * Dark theme styles using data-theme attribute on the SVG element
   * These override the light theme defaults when data-theme="dark" is applied
   */
  .svg-icon[data-theme="dark"] {
    --hybrid-icon-local-color: #ffffff;
    --hybrid-icon-local-hover-color: #78a9ff;
    --hybrid-icon-local-active-color: #a6c8ff;
    --hybrid-icon-local-disabled-color: #6f6f6f;
    --hybrid-icon-local-focus-outline: 2px solid #78a9ff;
    --hybrid-icon-local-focus-background: rgba(120, 169, 255, 0.1);
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
      --hybrid-icon-local-transition: none;
      --hybrid-icon-local-hover-transform: none;
      --hybrid-icon-local-active-transform: none;
    }
  }
`;
