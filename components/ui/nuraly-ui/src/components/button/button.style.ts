import { css } from 'lit';

/**
 * Button component styles for the Hybrid UI Library
 * Using shared CSS variables from /src/shared/themes/
 * 
 * This file contains all the styling for the hy-button component with
 * clean CSS variable usage without local fallbacks and proper theme switching support.
 */
export const buttonStyles = css`
  :host {
    display: inline-block;
    vertical-align: middle;
    
    /* Force CSS custom property inheritance to ensure theme switching works properly */
    color: var(--nuraly-color-text);
    background-color: var(--nuraly-color-background);
    border-color: var(--nuraly-color-border);
    
    /* Ensure clean state transitions when theme changes */
    * {
      transition: all var(--nuraly-transition-fast, 0.15s) ease;
    }
  }

  /* Force re-evaluation of theme-dependent properties on theme change */
  :host([data-theme]) {
    color: inherit;
    background-color: inherit;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-family: var(--nuraly-font-family);
    font-size: 0.875rem;
    font-weight: var(--nuraly-font-weight-regular);
    line-height: 1.125rem;
    letter-spacing: 0.16px;
    min-width: 5rem;
    height: 3rem;
    padding: var(--nuraly-spacing-2) var(--nuraly-spacing-4);
    border: 1px solid transparent;
    border-radius: var(--nuraly-border-radius-button, var(--nuraly-border-radius-medium, 0));
    background-color: var(--nuraly-color-background);
    color: var(--nuraly-color-text);
    text-decoration: none;
    cursor: pointer;
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    /* Reset any inherited styles that might interfere with theme switching */
    box-shadow: none;
    text-shadow: none;
    
    &:focus {
      outline: var(--nuraly-focus-outline);
      outline-offset: var(--nuraly-focus-outline-offset);
    }

    &:disabled {
      cursor: not-allowed;
      /* Remove generic opacity - use specific disabled colors instead */
    }

    /* Icon styling */
    nr-icon {
      flex-shrink: 0;
      width: var(--nuraly-button-icon-size, 1rem);
      height: var(--nuraly-button-icon-size, 1rem);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      /* Better text alignment */
      vertical-align: middle;
      line-height: 1;
      /* Ensure icon inherits text color */
      color: inherit;
      /* Override any size attribute with CSS variable */
      font-size: var(--nuraly-button-icon-size, 1rem) !important;
    }

    /* Icon spacing - use gap for cleaner spacing */
    gap: 0.5rem;
    
    /* Ensure proper alignment of content */
    #container, [part="container"] {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: inherit;
    }
  }

  /* Primary Button - Carbon Design System compliant */
  :host([type="primary"]) button {
    background-color: var(--nuraly-color-button-primary);
    border-color: var(--nuraly-color-button-primary);
    color: var(--nuraly-color-button-primary-text, var(--nuraly-color-text-on-color));

    &:hover:not(:disabled) {
      background-color: var(--nuraly-color-button-primary-hover);
      border-color: var(--nuraly-color-button-primary-hover);
      color: var(--nuraly-color-button-primary-text-hover, var(--nuraly-color-text-on-color));
    }

    &:active:not(:disabled) {
      background-color: var(--nuraly-color-button-primary-active);
      border-color: var(--nuraly-color-button-primary-active);
      color: var(--nuraly-color-button-primary-text-active, var(--nuraly-color-text-on-color));
    }

    &:focus:not(:disabled) {
      outline: 2px solid var(--nuraly-color-button-focus-outline, var(--nuraly-focus-color));
      outline-offset: 2px;
      box-shadow: var(--nuraly-shadow-button-focus, 0 0 0 2px var(--nuraly-color-button-focus-ring));
    }

    &:disabled {
      background-color: var(--nuraly-color-button-disabled);
      border-color: var(--nuraly-color-button-disabled-border, var(--nuraly-color-button-disabled));
      color: var(--nuraly-color-button-disabled-text);
      cursor: not-allowed;
      opacity: 1; /* Reset opacity for proper disabled state */
    }
  }

  /* Secondary Button - Carbon Design System compliant */
  :host([type="secondary"]) button {
    background-color: var(--nuraly-color-button-secondary);
    border-color: var(--nuraly-color-button-secondary);
    color: var(--nuraly-color-button-secondary-text, var(--nuraly-color-text-on-color));

    &:hover:not(:disabled) {
      background-color: var(--nuraly-color-button-secondary-hover);
      border-color: var(--nuraly-color-button-secondary-hover);
      color: var(--nuraly-color-button-secondary-text-hover, var(--nuraly-color-text-on-color));
    }

    &:active:not(:disabled) {
      background-color: var(--nuraly-color-button-secondary-active);
      border-color: var(--nuraly-color-button-secondary-active);
      color: var(--nuraly-color-button-secondary-text-active, var(--nuraly-color-text-on-color));
    }

    &:focus:not(:disabled) {
      outline: 2px solid var(--nuraly-color-button-focus-outline, var(--nuraly-focus-color));
      outline-offset: 2px;
      box-shadow: var(--nuraly-shadow-button-focus, 0 0 0 2px var(--nuraly-color-button-focus-ring));
    }

    &:disabled {
      background-color: var(--nuraly-color-button-disabled);
      border-color: var(--nuraly-color-button-disabled-border, var(--nuraly-color-button-disabled));
      color: var(--nuraly-color-button-disabled-text);
      cursor: not-allowed;
      opacity: 1; /* Reset opacity for proper disabled state */
    }
  }

  /* Default Button - Clean white/light style with defined border */
  :host([type="default"]) button {
    background-color: var(--nuraly-color-background, #ffffff);
    border-color: var(--nuraly-color-border, #d0d0d0);
    color: var(--nuraly-color-text, #161616);

    &:hover:not(:disabled) {
      background-color: var(--nuraly-color-background-hover, #f4f4f4);
      border-color: var(--nuraly-color-border-hover, #a8a8a8);
      color: var(--nuraly-color-text, #161616);
    }

    &:active:not(:disabled) {
      background-color: var(--nuraly-color-background-active, #e0e0e0);
      border-color: var(--nuraly-color-border-active, #8d8d8d);
      color: var(--nuraly-color-text, #161616);
    }

    &:focus:not(:disabled) {
      outline: 2px solid var(--nuraly-color-button-focus-outline, var(--nuraly-focus-color));
      outline-offset: 2px;
      box-shadow: var(--nuraly-shadow-button-focus, 0 0 0 2px var(--nuraly-color-button-focus-ring));
    }

    &:disabled {
      background-color: var(--nuraly-color-button-disabled, #f4f4f4);
      border-color: var(--nuraly-color-button-disabled-border, #c6c6c6);
      color: var(--nuraly-color-button-disabled-text, #c6c6c6);
      cursor: not-allowed;
      opacity: 1; /* Reset opacity for proper disabled state */
    }
  }

  /* Tertiary/Ghost Button - Carbon Design System compliant */
  :host([type="tertiary"]), :host([type="ghost"]) button {
    background-color: var(--nuraly-color-button-outline, transparent);
    border-color: var(--nuraly-color-button-outline-border, var(--nuraly-color-border));
    color: var(--nuraly-color-button-outline-text, var(--nuraly-color-button-tertiary, var(--nuraly-color-button-primary)));

    &:hover:not(:disabled) {
      background-color: var(--nuraly-color-button-outline-hover, var(--nuraly-color-background-hover));
      border-color: var(--nuraly-color-button-outline-border-hover, var(--nuraly-color-button-tertiary-hover, var(--nuraly-color-button-primary)));
      color: var(--nuraly-color-button-outline-text-hover, var(--nuraly-color-button-tertiary-hover, var(--nuraly-color-button-primary-hover)));
    }

    &:active:not(:disabled) {
      background-color: var(--nuraly-color-button-outline-active, var(--nuraly-color-background-active));
      border-color: var(--nuraly-color-button-outline-border-active, var(--nuraly-color-button-tertiary-active, var(--nuraly-color-button-primary-active)));
      color: var(--nuraly-color-button-outline-text-active, var(--nuraly-color-button-tertiary-active, var(--nuraly-color-button-primary-active)));
    }

    &:focus:not(:disabled) {
      outline: 2px solid var(--nuraly-color-button-focus-outline, var(--nuraly-focus-color));
      outline-offset: 2px;
      box-shadow: var(--nuraly-shadow-button-focus, 0 0 0 2px var(--nuraly-color-button-focus-ring));
    }

    &:disabled {
      background-color: transparent;
      border-color: var(--nuraly-color-button-disabled-border, var(--nuraly-color-button-disabled));
      color: var(--nuraly-color-button-disabled-text);
      cursor: not-allowed;
      opacity: 1; /* Reset opacity for proper disabled state */
    }
  }

  /* Danger Button - Carbon Design System compliant */
  :host([type="danger"]) button {
    background-color: var(--nuraly-color-button-danger);
    border-color: var(--nuraly-color-button-danger);
    color: var(--nuraly-color-button-danger-text, var(--nuraly-color-text-on-color));

    &:hover:not(:disabled) {
      background-color: var(--nuraly-color-button-danger-hover);
      border-color: var(--nuraly-color-button-danger-hover);
      color: var(--nuraly-color-button-danger-text-hover, var(--nuraly-color-text-on-color));
    }

    &:active:not(:disabled) {
      background-color: var(--nuraly-color-button-danger-active);
      border-color: var(--nuraly-color-button-danger-active);
      color: var(--nuraly-color-button-danger-text-active, var(--nuraly-color-text-on-color));
    }

    &:focus:not(:disabled) {
      outline: 2px solid var(--nuraly-color-button-focus-outline, var(--nuraly-focus-color));
      outline-offset: 2px;
      box-shadow: var(--nuraly-shadow-button-focus, 0 0 0 2px var(--nuraly-color-button-focus-ring));
    }

    &:disabled {
      background-color: var(--nuraly-color-button-disabled);
      border-color: var(--nuraly-color-button-disabled-border, var(--nuraly-color-button-disabled));
      color: var(--nuraly-color-button-disabled-text);
      cursor: not-allowed;
      opacity: 1; /* Reset opacity for proper disabled state */
    }
  }

  /* Default size when no size attribute is provided (medium) */
  :host(:not([size])) button {
    height: var(--nuraly-size-md);
    padding: var(--nuraly-spacing-2) var(--nuraly-spacing-4);
  }

  /* Size variants */
  :host([size="small"]) button {
    height: var(--nuraly-size-sm);
    padding: var(--nuraly-spacing-01) var(--nuraly-spacing-03);
    font-size: 0.75rem;
    min-width: 4rem;
  }

  :host([size="medium"]) button {
    height: var(--nuraly-size-md);
    padding: var(--nuraly-spacing-2) var(--nuraly-spacing-4);
  }

  :host([size="large"]) button {
    height: var(--nuraly-size-lg);
    padding: var(--nuraly-spacing-05) var(--nuraly-spacing-06);
    font-size: 1rem;
    min-width: 6rem;
  }

  /* Full width */
  :host([full-width]) {
    width: 100%;
  }

  :host([full-width]) button {
    width: 100%;
  }

  /* Loading state */
  :host([loading]) button {
    cursor: not-allowed;
    opacity: 0.7;
  }

  /* Shape variants */
  :host([shape="round"]) button {
    border-radius: 50%;
    min-width: auto;
    width: var(--nuraly-size-md);
    aspect-ratio: 1;
    padding: 0;
  }

  :host([shape="round"][size="small"]) button {
    width: var(--nuraly-size-sm);
  }

  :host([shape="round"][size="medium"]) button {
    width: var(--nuraly-size-md);
  }

  :host([shape="round"][size="large"]) button {
    width: var(--nuraly-size-lg);
  }

  /* Enhanced Ripple Effect Animation - Theme-aware */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
    z-index: 1;
  }

  @keyframes ripple-animation {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    70% {
      transform: scale(3);
      opacity: 0.5;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Ripple effect for different button types - Carbon Design System compliant */
  :host([type="primary"]) .ripple {
    background: rgba(255, 255, 255, 0.4);
  }

  :host([type="secondary"]) .ripple {
    background: rgba(255, 255, 255, 0.3);
  }

  :host([type="default"]) .ripple {
    background: var(--nuraly-color-text, #161616);
    opacity: 0.1;
  }

  :host([type="ghost"]) .ripple,
  :host([type="tertiary"]) .ripple {
    background: var(--nuraly-color-button-tertiary, #0f62fe);
    opacity: 0.2;
  }

  :host([type="danger"]) .ripple {
    background: rgba(255, 255, 255, 0.4);
  }

  /* Theme-specific ripple adjustments for dark theme */
  [data-theme="carbon-dark"] :host([type="default"]) .ripple {
    background: var(--nuraly-color-text, #f4f4f4);
    opacity: 0.1;
  }

  [data-theme="carbon-dark"] :host([type="ghost"]) .ripple,
  [data-theme="carbon-dark"] :host([type="tertiary"]) .ripple {
    background: var(--nuraly-color-button-tertiary, #78a9ff);
    opacity: 0.2;
  }

  [data-theme="carbon-dark"] :host([type="primary"]) .ripple {
    background: rgba(22, 22, 22, 0.4); /* Dark ripple for light buttons */
  }

  [data-theme="carbon-dark"] :host([type="secondary"]) .ripple {
    background: rgba(22, 22, 22, 0.3); /* Dark ripple for light buttons */
  }

  [data-theme="carbon-dark"] :host([type="danger"]) .ripple {
    background: rgba(22, 22, 22, 0.4); /* Dark ripple for light buttons */
  }

  /* ========================================
   * CARBON THEME SPECIFIC STYLING
   * Enhanced padding and icon centering for Carbon Design System
   * ======================================== */
  
  /* Carbon theme button styling - apply to all carbon themes */
  :host([data-theme*="carbon"]) button,
  [data-theme*="carbon"] :host button {
    /* Better baseline alignment for icon and text */
    align-items: center;
    
    /* Enhanced icon alignment and spacing for Carbon */
    nr-icon {
      width: var(--nuraly-button-icon-size, 1rem);
      height: var(--nuraly-button-icon-size, 1rem);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      /* Perfect vertical alignment with text baseline */
      vertical-align: middle;
      line-height: 1;
    }
    
    /* Icon spacing for Carbon theme - improved approach */
    gap: var(--nuraly-button-icon-spacing, var(--nuraly-spacing-03, 0.5rem));
  }
  
  /* Specific Carbon theme selectors for better targeting */
  [data-theme="carbon-light"] nr-button button,
  [data-theme="carbon-dark"] nr-button button,
  [data-theme="carbon"] nr-button button {
    /* Better baseline alignment for icon and text */
    align-items: center;
    
    /* Enhanced icon alignment and spacing for Carbon */
    nr-icon {
      width: var(--nuraly-button-icon-size, 1rem);
      height: var(--nuraly-button-icon-size, 1rem);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      /* Perfect vertical alignment with text baseline */
      vertical-align: middle;
      line-height: 1;
      /* Slight adjustment for perfect optical centering */
      margin-top: -1px;
    }
    
    /* Target the SVG inside nr-icon for better alignment */
    nr-icon svg {
      display: block;
      margin: 0 auto;
    }
    
    /* Icon spacing for Carbon theme */
    gap: var(--nuraly-button-icon-spacing, var(--nuraly-spacing-03, 0.5rem));
    
    /* Ensure text is also properly centered */
    span#container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      line-height: 1;
    }
    
    /* Ensure slot content aligns properly */
    slot#slot {
      display: inline-block;
      line-height: inherit;
    }
  }
`;

export const styles = buttonStyles;
