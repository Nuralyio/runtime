import { css } from 'lit';
import { buttonVariables } from './nr-button.style.variables.js';

/**
 * Button component styles for the Hybrid UI Library
 * 
 * This file contains all the styling for the nr-button component, including:
 * - Base button styles with CSS custom properties for theming
 * - Multiple button variants (primary, secondary, ghost, danger)
 * - Size variations (small, large)
 * - State styles (hover, active, disabled, loading)
 * - Dark theme support
 * - Icon positioning and styling
 * - Responsive design considerations
 * 
 * The styling system uses CSS custom properties with fallbacks to allow
 * for both global and local customization of button appearance.
 */
const buttonStyles = css`
  /* Container for button content and icon positioning */
  #container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  /* Icon positioned to the right of text when iconPosition='right' */
  :host([iconPosition='right']) #container {
    flex-direction: row-reverse;
  }

  /* Icon styling within button */
  hy-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2px;
  }

  /* 
   * Base button element styles
   * Uses CSS custom properties with fallbacks for comprehensive theming support
   * Properties follow the pattern: --hybrid-button-{property}, --hybrid-button-local-{property}
   */

  /* 
   * Base button element styles
   * Uses CSS custom properties with fallbacks for comprehensive theming support
   * Properties follow the pattern: --hybrid-button-{property}, --hybrid-button-local-{property}
   */
  button {
    /* Dimensions */
    height: var(--hybrid-button-height,var(--hybrid-button-local-height));
    width: var(--hybrid-button-width,var(--hybrid-button-local-width));
    
    /* Border properties - individual sides for granular control */
    border-left: var(--hybrid-button-border-left,var(--hybrid-button-local-border-left));
    border-right: var(--hybrid-button-border-right,var(--hybrid-button-local-border-right));
    border-top: var(--hybrid-button-border-top,var(--hybrid-button-local-border-top));
    border-bottom: var(--hybrid-button-border-bottom,var(--hybrid-button-local-border-bottom));
    
    /* Border radius - individual corners for design flexibility */
    border-top-left-radius:var(--hybrid-button-border-top-left-radius,var(--hybrid-button-local-border-top-left-radius)) ;
    border-top-right-radius: var(--hybrid-button-border-top-right-radius,var(--hybrid-button-local-border-top-right-radius));
    border-bottom-left-radius: var(--hybrid-button-border-bottom-left-radius,var(--hybrid-button-local-border-bottom-left-radius));
    border-bottom-right-radius: var(--hybrid-button-border-bottom-right-radius,var(--hybrid-button-local-border-bottom-right-radius));
    
    /* Colors */
    background-color: var(--hybrid-button-background-color,var(--hybrid-button-local-background-color));
    color: var(--hybrid-button-text-color,var(--hybrid-button-local-text-color));
    
    /* Typography */
    font-size: var(--hybrid-button-font-size,var(--hybrid-button-local-font-size));
    font-weight: var(--hybrid-button-font-weight,var(--hybrid-button-local-font-weight));
    text-transform: var(--hybrid-button-text-transform,var(--hybrid-button-local-text-transform));
    
    /* Spacing */
    padding-top: var(--hybrid-button-padding-y,var(--hybrid-button-local-padding-y));
    margin-top: var(--hybrid-button-margin-y,var(--hybrid-button-local-margin-y));
    padding-bottom: var(--hybrid-button-padding-y,var(--hybrid-button-local-padding-y));
    padding-right: var(--hybrid-button-padding-x,var(--hybrid-button-local-padding-x));
    padding-left: var(--hybrid-button-padding-x,var(--hybrid-button-local-padding-x));
    font-size: var(--hybrid-button-font-size,var(--hybrid-button-local-font-size));
  }
  
  /* Icon styling within button - inherits text color and size */
  button hy-icon {
    --hybrid-icon-color: var(--hybrid-button-text-color,var(--hybrid-button-local-text-color));
    --hybrid-icon-width: var(--hybrid-button-icon-width,var(--hybrid-button-local-icon-width));
    --hybrid-icon-height: var(--hybrid-button-icon-height,var(--hybrid-button-local-icon-height));
  }

  /* 
   * Hover state styles
   * Applied when button is hovered but not disabled
   */

  /* 
   * Hover state styles
   * Applied when button is hovered but not disabled
   */
  button:hover:not(:disabled) {
    cursor: pointer;
    border-color: var(--hybrid-button-hover-border-color,var(--hybrid-button-local-hover-border-color));
    background-color: var(--hybrid-button-hover-background-color,var(--hybrid-button-local-hover-background-color));
    color: var(--hybrid-button-hover-color,var(--hybrid-button-local-hover-color));
  }
  
  /* Icon color on hover */
  button:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-hover-color,var(--hybrid-button-local-hover-color));
  }

  /* 
   * Active state styles
   * Applied when button is being clicked/pressed but not disabled
   */
  button:active:not(:disabled) {
    outline: none;
    border-color: var(--hybrid-button-active-border-color,var(--hybrid-button-local-active-border-color));
    color: var(--hybrid-button-active-color,var(--hybrid-button-local-active-color));
  }
  
  /* Icon color on active state */
  button:active:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-active-color,var(--hybrid-button-local-active-color));
  }

  /* 
   * Disabled state styles
   * Applied when button is disabled - removes interactivity and applies muted colors
   */

  /* 
   * Disabled state styles
   * Applied when button is disabled - removes interactivity and applies muted colors
   */
  button:disabled {
    cursor: auto;
    background-color: var(--hybrid-button-disabled-background-color,var(--hybrid-button-local-disabled-background-color));
    color: var(--hybrid-button-disabled-text-color,var(--hybrid-button-local-disabled-text-color));
    border-color: var(--hybrid-button-disabled-border-color,var(--hybrid-button-local-disabled-border-color));
  }

  /* ========================================
   * SIZE VARIATIONS
   * ======================================== */

  /* Small button size variant */

  /* Small button size variant */
  button[data-size='small'] {
    padding-top: var(--hybrid-small-button-padding-y,var(--hybrid-small-button-local-padding-y));
    padding-bottom: var(--hybrid-small-button-padding-y,var(--hybrid-small-button-local-padding-y));
    padding-right: var(--hybrid-small-button-padding-x,var(--hybrid-small-button-local-padding-x));
    padding-left: var(--hybrid-small-button-padding-x,var(--hybrid-small-button-local-padding-x));
    font-size: var(--hybrid-small-button-font-size,var(--hybrid-small-button-local-font-size));
  }

  /* Large button size variant */
  button[data-size='large'] {
    padding-top: var(--hybrid-large-button-padding-y,var(--hybrid-large-button-local-padding-y));
    padding-bottom: var(--hybrid-large-button-padding-y,var(--hybrid-large-button-local-padding-y));
    padding-right: var(--hybrid-large-button-padding-x,var(--hybrid-large-button-local-padding-x));
    padding-left: var(--hybrid-large-button-padding-x,var(--hybrid-large-button-local-padding-x));
    font-size: var(--hybrid-large-button-font-size,var(--hybrid-large-button-local-font-size));
  }

  /* ========================================
   * BUTTON STATES
   * ======================================== */

  /* Loading state - reduces opacity to indicate processing */
  button[data-state='loading'] {
    opacity: 0.5;
  }

  /* ========================================
   * BUTTON TYPE VARIANTS
   * ======================================== */

  /* DANGER BUTTON VARIANT */
  /* DANGER BUTTON VARIANT */
  
  /* Danger button base styles and icon */
  button[data-type='danger'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-danger-text-color,var(--hybrid-button-local-danger-text-color));
  }
  button[data-type='danger'] {
    border-color: var(--hybrid-button-danger-border-color,var(--hybrid-button-local-danger-border-color));
    background-color: var(--hybrid-button-danger-background-color,var(--hybrid-button-local-danger-background-color));
    color: var(--hybrid-button-danger-text-color,var(--hybrid-button-local-danger-text-color));
  }
  
  /* Danger button with dashed border variant */
  button[data-type='danger'].button-dashed {
    border-color: var(--hybrid-button-danger-dashed-border-color,var(--hybrid-button-local-danger-dashed-border-color));
  }
  
  /* Danger button disabled state */
  button[data-type='danger']:disabled {
    border-color: var(--hybrid-button-danger-disabled-border-color,var(--hybrid-button-local-danger-disabled-border-color));
    background-color: var(--hybrid-button-danger-disabled-background-color,var(--hybrid-button-local-danger-disabled-background-color));
    color: var(--hybrid-button-danger-disabled-text-color,var(--hybrid-button-local-danger-disabled-text-color));
  }

  /* Danger button hover state */
  button[data-type='danger']:hover:not(:disabled) {
    background-color: var(--hybrid-button-danger-hover-background-color,var(--hybrid-button-local-danger-hover-background-color));
    border-color: var(--hybrid-button-danger-hover-border-color,var(--hybrid-button-local-danger-hover-border-color));
    color: var(--hybrid-button-danger-text-color,var(--hybrid-button-local-danger-text-color));
  }
  button[data-type='danger']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-danger-text-color,var(--hybrid-button-local-danger-text-color));
  }

  /* Danger button active state */
  button[data-type='danger']:active:not(:disabled) {
    background-color: var(--hybrid-button-danger-active-background-color,var(--hybrid-button-local-danger-active-background-color));
    border-color: var(--hybrid-button-danger-active-border-color,var(--hybrid-button-local-danger-active-border-color));
    outline: var(--hybrid-button-danger-outline,var(--hybrid-button-local-danger-outline));
    outline-offset: var(--hybrid-button-danger-outline-offset,var(--hybrid-button-local-danger-outline-offset));
  }

  /* PRIMARY BUTTON VARIANT */
  /* PRIMARY BUTTON VARIANT */
  
  /* Primary button base styles and icon */
  button[data-type='primary'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
  }
  button[data-type='primary'] {
    border-color: var(--hybrid-button-primary-border-color,var(--hybrid-button-local-primary-border-color));
    background-color: var(--hybrid-button-primary-background-color,var(--hybrid-button-local-primary-background-color));
    color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
  }
  
  /* Primary button with dashed border variant */
  button[data-type='primary'].button-dashed {
    border-color: var(--hybrid-button-primary-dashed-border-color,var(--hybrid-button-local-primary-dashed-border-color));
  }

  /* Primary button disabled state */
  button[data-type='primary']:disabled {
    border-color: var(--hybrid-button-primary-disabled-border-color,var(--hybrid-button-local-primary-disabled-border-color));
    background-color: var(--hybrid-button-primary-disabled-background-color,var(--hybrid-button-local-primary-disabled-background-color));
    color: var(--hybrid-button-primary-disabled-text-color,var(--hybrid-button-local-primary-disabled-text-color));
  }

  /* Primary button hover state */
  button[data-type='primary']:hover:not(:disabled) {
    background-color: var(--hybrid-button-primary-hover-background-color,var(--hybrid-button-local-primary-hover-background-color));
    border-color: var(--hybrid-button-primary-hover-border-color,var(--hybrid-button-local-primary-hover-border-color));
    color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
  }
  button[data-type='primary']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
  }
  
  /* Primary button active state */
  button[data-type='primary']:active:not(:disabled) {
    border-color: var(--hybrid-button-primary-active-border-color,var(--hybrid-button-local-primary-active-border-color));
    background-color: var(--hybrid-button-primary-active-background-color,var(--hybrid-button-local-primary-active-background-color));
    outline: var(--hybrid-button-primary-outline,var(--hybrid-button-local-primary-outline));
    outline-offset: var(--hybrid-button-primary-outline-offset,var(--hybrid-button-local-primary-outline-offset));
  }

  /* GHOST BUTTON VARIANT */
  /* GHOST BUTTON VARIANT */
  
  /* Ghost button base styles and icon */
  button[data-type='ghost'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-ghost-text-color,var(--hybrid-button-local-ghost-text-color));
  }
  button[data-type='ghost'] {
    background-color: var(--hybrid-button-ghost-background-color,var(--hybrid-button-local-ghost-background-color));
    color: var(--hybrid-button-ghost-text-color,var(--hybrid-button-local-ghost-text-color));
    border-color: var(--hybrid-button-ghost-border-color,var(--hybrid-button-local-ghost-border-color));
  }
  
  /* Ghost button with dashed border variant */
  button[data-type='ghost'].button-dashed {
    border-color: var(--hybrid-button-ghost-dashed-border-color,var(--hybrid-button-local-ghost-dashed-border-color));
  }
  
  /* Ghost button disabled state */
  button[data-type='ghost']:disabled {
    background-color: var(--hybrid-button-ghost-disabled-background-color,var(--hybrid-button-local-ghost-disabled-background-color));
    color: var(--hybrid-button-ghost-disabled-text-color,var(--hybrid-button-local-ghost-disabled-text-color));
    border-color: var(--hybrid-button-ghost-disabled-border-color,var(--hybrid-button-local-ghost-disabled-border-color));
  }

  /* Ghost button hover state */
  button[data-type='ghost']:hover:not(:disabled) {
    background-color: var(--hybrid-button-ghost-hover-background-color,var(--hybrid-button-local-ghost-hover-background-color));
    color: var(--hybrid-button-ghost-hover-text-color,var(--hybrid-button-local-ghost-hover-text-color));
    border-color: var(--hybrid-button-local-ghost-hover-border-color,var(--hybrid-button-local-ghost-hover-border-color));
  }
  button[data-type='ghost']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-ghost-hover-text-color,var(--hybrid-button-local-ghost-hover-text-color));
  }
  
  /* Ghost button active state */
  button[data-type='ghost']:active:not(:disabled) {
    background-color: var(--hybrid-button-ghost-active-background-color,var(--hybrid-button-local-ghost-active-background-color));
    border-color: var(--hybrid-button-ghost-active-border-color,var(--hybrid-button-local-ghost-active-border-color));
  }

  /* SECONDARY BUTTON VARIANT */
  /* SECONDARY BUTTON VARIANT */
  
  /* Secondary button base styles and icon */
  button[data-type='secondary'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-secondary-text-color,var(--hybrid-button-local-secondary-text-color));
  }
  button[data-type='secondary'] {
    background-color: var(--hybrid-button-secondary-background-color,var(--hybrid-button-local-secondary-background-color));
    color: var(--hybrid-button-secondary-text-color,var(--hybrid-button-local-secondary-text-color));
    border-color: var(--hybrid-button-secondary-border-color,var(--hybrid-button-local-secondary-border-color));
  }
  
  /* Secondary button with dashed border variant */
  button[data-type='secondary'].button-dashed {
    border-color: var(--hybrid-button-secondary-dashed-border-color,var(--hybrid-button-local-secondary-dashed-border-color));
  }
  
  /* Secondary button disabled state */
  button[data-type='secondary']:disabled {
    background-color: var(--hybrid-button-secondary-disabled-background-color,var(--hybrid-button-local-secondary-disabled-background-color));
    color: var(--hybrid-button-secondary-disabled-text-color,var(--hybrid-button-local-secondary-disabled-text-color));
    border-color: var(--hybrid-button-secondary-disabled-border-color,var(--hybrid-button-local-secondary-disabled-border-color));
  }
  
  /* Secondary button hover state */
  button[data-type='secondary']:hover:not(:disabled) {
    background-color: var(--hybrid-button-secondary-hover-background-color,var(--hybrid-button-local-secondary-hover-background-color));
    color: var(--hybrid-button-secondary-text-color,var(--hybrid-button-local-secondary-text-color));
    border-color: var(--hybrid-button-secondary-hover-border-color,var(--hybrid-button-local-secondary-hover-border-color));
  }
  button[data-type='secondary']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-secondary-text-color,var(--hybrid-button-local-secondary-text-color));
  }

  /* Secondary button active state */
  button[data-type='secondary']:active:not(:disabled) {
    background-color: var(--hybrid-button-secondary-active-background-color,var(--hybrid-button-local-secondary-active-background-color));
    border-color: var(--hybrid-button-secondary-active-border-color,var(--hybrid-button-local-secondary-active-border-color));
    outline: var(--hybrid-button-secondary-outline,var(--hybrid-button-local-secondary-outline));
    outline-offset: var(--hybrid-button-secondary-outline-offset,var(--hybrid-button-local-secondary-outline-offset));
  }

  /* ========================================
   * UTILITY CLASSES
   * ======================================== */

  /* Dashed border style modifier */
  .button-dashed {
    border-style: dashed;
  }

  /* ========================================
   * VARIANT STYLES
   * ======================================== */

  /* Primary button variant */

  /* ========================================
   * DARK THEME OVERRIDES
   * ======================================== */
  
  /**
   * Dark theme styles using data-theme attribute on button element
   * These override the light theme defaults when data-theme="dark" is applied
   */
  /**
   * Dark theme styles using data-theme attribute on button element
   * These override the light theme defaults when data-theme="dark" is applied
   */
  button[data-theme="dark"] {
    /* Default button dark theme overrides */
    --hybrid-button-local-background-color: #000000;
    --hybrid-button-local-text-color: #ffffff;
    --hybrid-button-local-hover-border-color: #6f6f6f;
    --hybrid-button-local-hover-color: #6f6f6f;
    --hybrid-button-local-active-border-color: #c6c6c6;
    --hybrid-button-local-active-color: #c6c6c6;
    --hybrid-button-local-disabled-background-color: #c6c6c6;

    /* Primary button dark theme overrides */
    --hybrid-button-local-primary-outline: 1px solid black;
    --hybrid-button-local-primary-outline-offset: -3px;
    --hybrid-button-local-primary-active-border-color: #ffffff;
    --hybrid-button-local-primary-disabled-text-color: #c6c6c6;
    --hybrid-button-local-primary-disabled-background-color: #8d8d8d;
    --hybrid-button-local-primary-disabled-border-color: #8d8d8d;

    /* Secondary button dark theme overrides */
    --hybrid-button-local-secondary-background-color: #6f6f6f;
    --hybrid-button-local-secondary-border-color: #6f6f6f;
    --hybrid-button-local-secondary-text-color: #ffffff;
    --hybrid-button-local-secondary-active-border-color: #ffffff;
    --hybrid-button-local-secondary-active-background-color: #6f6f6f;
    --hybrid-button-local-secondary-outline: 1px solid black;
    --hybrid-button-local-secondary-outline-offset: -3px;
    --hybrid-button-local-secondary-hover-background-color: #606060;
    --hybrid-button-local-secondary-hover-border-color: #606060;
    --hybrid-button-local-secondary-disabled-background-color: #6f6f6f;
    --hybrid-button-local-secondary-disabled-text-color: #8d8d8d;
    --hybrid-button-local-secondary-disabled-border-color: #6f6f6f;
    --hybrid-button-local-secondary-dashed-border-color: #ffffff;

    /* Ghost button dark theme overrides */
    --hybrid-button-local-ghost-background-color: transparent;
    --hybrid-button-local-ghost-text-color: #78a9ff;
    --hybrid-button-local-ghost-border-color: transparent;
    --hybrid-button-local-ghost-active-background-color: transparent;
    --hybrid-button-local-ghost-active-text-color: #a6c8ff;
    --hybrid-button-local-ghost-active-border-color: #ffffff;
    --hybrid-button-local-ghost-hover-background-color: #4c4c4c;
    --hybrid-button-local-ghost-hover-border-color: #4c4c4c;
    --hybrid-button-local-ghost-hover-text-color: #a6c8ff;
    --hybrid-button-local-ghost-disabled-background-color: transparent;
    --hybrid-button-local-ghost-disabled-text-color: #6f6f6f;
    --hybrid-button-local-ghost-disabled-border-color: transparent;
    --hybrid-button-local-ghost-dashed-border-color: #c6c6c6;

    /* Danger button dark theme overrides */
    --hybrid-button-local-danger-outline: 1px solid #000000;
    --hybrid-button-local-danger-outline-offset: -3px;
    --hybrid-button-local-danger-hover-background-color: #ba1b23;
    --hybrid-button-local-danger-hover-border-color: #ba1b23;
    --hybrid-button-local-danger-active-background-color: #da1e28;
    --hybrid-button-local-danger-active-border-color: #ffffff;
    --hybrid-button-local-danger-disabled-background-color: #6f6f6f;
    --hybrid-button-local-danger-disabled-text-color: #8d8d8d;
    --hybrid-button-local-danger-disabled-border-color: #6f6f6f;
    --hybrid-button-local-danger-dashed-border-color: #ffffff;
  }
`;

/**
 * Exported styles for the nr-button component
 * 
 * @description
 * This export provides the complete styling system for the button component,
 * including all variants, states, sizes, theme support, and CSS custom properties.
 * 
 * @usage
 * Import and use in the component's styles property:
 * ```typescript
 * import { styles } from './nr-button.style.ts';
 * 
 * @Component({
 *   styles: styles
 * })
 * ```
 */
export const styles = [buttonStyles, buttonVariables];
