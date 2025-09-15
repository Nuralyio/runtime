import { css } from 'lit';

/**
 * Icon component CSS custom properties (design tokens)
 * 
 * This file contains all the CSS custom properties used by the nr-icon component,
 * organized by functionality and including comprehensive theme support for multiple design systems.
 * 
 * The styling system uses CSS custom properties with fallbacks to allow
 * for both global and local customization of icon appearance across different themes:
 * - Light theme (default)
 * - Dark theme
 * - Carbon Design System (light/dark)
 * - Default Design System (light/dark)
 * 
 * Design tokens follow the pattern: --nuraly-[component]-[property]-[variant]
 */
export const styleVariables = css`
  :host {
    /* ========================================
     * BASE ICON PROPERTIES
     * ======================================== */
    
    /* Size properties with fallbacks */
    --nuraly-icon-size-fallback: 18px;
    --nuraly-icon-size-small-fallback: 16px;
    --nuraly-icon-size-medium-fallback: 20px;
    --nuraly-icon-size-large-fallback: 24px;
    --nuraly-icon-size-xlarge-fallback: 32px;
    --nuraly-icon-size-xxlarge-fallback: 40px;
    --nuraly-icon-min-size-fallback: 12px;
    
    /* Color properties with theme-aware fallbacks */
    --nuraly-color-icon-fallback: #161616;
    
    /* ========================================
     * INTERACTIVE STATE PROPERTIES
     * ======================================== */
    
    /* Transition properties */
    --nuraly-icon-transition-fallback: opacity 0.2s ease, transform 0.2s ease, fill 0.2s ease;
    
    /* Hover state properties */
    --nuraly-icon-hover-opacity-fallback: 0.8;
    --nuraly-icon-hover-transform-fallback: scale(1.05);
    --nuraly-color-icon-hover-fallback: #0f62fe;
    
    /* Active state properties */
    --nuraly-icon-active-opacity-fallback: 0.6;
    --nuraly-icon-active-transform-fallback: scale(0.95);
    --nuraly-color-icon-active-fallback: #054ada;
    
    /* Disabled state properties */
    --nuraly-icon-disabled-opacity-fallback: 0.25;
    --nuraly-color-icon-disabled-fallback: #c6c6c6;
    
    /* ========================================
     * FOCUS STATE PROPERTIES
     * ======================================== */
    
    --nuraly-icon-focus-outline-fallback: 2px solid #0f62fe;
    --nuraly-icon-focus-outline-offset-fallback: 2px;
    --nuraly-icon-focus-background-fallback: rgba(15, 98, 254, 0.1);
    --nuraly-icon-focus-border-radius-fallback: 4px;
    --nuraly-icon-focus-shadow-fallback: none;
    
    /* ========================================
     * CURSOR PROPERTIES
     * ======================================== */
    
    --nuraly-cursor-default: default;
    --nuraly-cursor-interactive: pointer;
    --nuraly-cursor-disabled: not-allowed;
  }

  /* ========================================
   * SIZE-SPECIFIC DESIGN TOKENS
   * ======================================== */
  
  /**
   * Size-specific customizations that can be overridden in themes
   * These provide defaults that themes can customize for different design systems
   */
  
  :host([size="small"]) {
    --nuraly-icon-size: var(--nuraly-icon-size-small, var(--nuraly-icon-size-small-fallback));
  }
  
  :host([size="medium"]) {
    --nuraly-icon-size: var(--nuraly-icon-size-medium, var(--nuraly-icon-size-medium-fallback));
  }
  
  :host([size="large"]) {
    --nuraly-icon-size: var(--nuraly-icon-size-large, var(--nuraly-icon-size-large-fallback));
  }
  
  :host([size="xlarge"]) {
    --nuraly-icon-size: var(--nuraly-icon-size-xlarge, var(--nuraly-icon-size-xlarge-fallback));
  }
  
  :host([size="xxlarge"]) {
    --nuraly-icon-size: var(--nuraly-icon-size-xxlarge, var(--nuraly-icon-size-xxlarge-fallback));
  }

  /* ========================================
   * ACCESSIBILITY DESIGN TOKENS
   * ======================================== */
  
  /**
   * Accessibility features that respect user preferences
   * These ensure the component works well for all users
   */
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :host {
      --nuraly-color-icon: CanvasText;
      --nuraly-color-icon-hover: CanvasText;
      --nuraly-color-icon-active: CanvasText;
      --nuraly-icon-focus-outline: 3px solid CanvasText;
      --nuraly-icon-focus-background: Canvas;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    :host {
      --nuraly-icon-transition: none;
      --nuraly-icon-hover-transform: none;
      --nuraly-icon-active-transform: none;
    }
`;
