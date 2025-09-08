import {css} from 'lit';
import {styleVariables} from './icon.variables.js';

/**
 * Icon component styles with theme support and interactive states
 * 
 * Uses CSS custom properties for theming with fallbacks for backwards compatibility.
 * Supports both light and dark themes via data-theme attribute.
 */
const iconStyles = css`
  :host {
    display: inline-block;
    line-height: 0;
  }

  .svg-icon {
    /* Basic properties */
    fill: var(--hybrid-icon-local-color, var(--hybrid-icon-color, #000000));
    width: var(--hybrid-icon-local-width, var(--hybrid-icon-width, 18px));
    height: var(--hybrid-icon-local-height, var(--hybrid-icon-height, 18px));
    transition: var(--hybrid-icon-local-transition, opacity 0.2s ease, transform 0.2s ease);
    
    /* Cursor handling */
    cursor: default;
  }

  /* ========================================
   * CLICKABLE STATES
   * ======================================== */
  
  .svg-icon.clickable {
    cursor: var(--hybrid-icon-local-cursor, pointer);
  }

  .svg-icon.clickable:hover {
    opacity: var(--hybrid-icon-local-hover-opacity, 0.8);
    transform: var(--hybrid-icon-local-hover-transform, scale(1.1));
    fill: var(--hybrid-icon-local-hover-color, var(--hybrid-icon-local-color, #0f62fe));
  }

  .svg-icon.clickable:active {
    opacity: var(--hybrid-icon-local-active-opacity, 0.6);
    transform: var(--hybrid-icon-local-active-transform, scale(0.95));
    fill: var(--hybrid-icon-local-active-color, var(--hybrid-icon-local-color, #054ada));
  }

  .svg-icon.clickable:focus {
    outline: var(--hybrid-icon-local-focus-outline, 2px solid #0f62fe);
    outline-offset: var(--hybrid-icon-local-focus-outline-offset, 2px);
    background: var(--hybrid-icon-local-focus-background, rgba(15, 98, 254, 0.1));
    border-radius: var(--hybrid-icon-local-focus-border-radius, 4px);
  }

  /* ========================================
   * DISABLED STATE
   * ======================================== */
  
  .svg-icon.disabled {
    opacity: var(--hybrid-icon-local-disabled-opacity, 0.4);
    fill: var(--hybrid-icon-local-disabled-color, #c6c6c6);
    cursor: var(--hybrid-icon-local-disabled-cursor, not-allowed);
  }

  .svg-icon.clickable.disabled:hover,
  .svg-icon.clickable.disabled:active {
    opacity: var(--hybrid-icon-local-disabled-opacity, 0.4);
    fill: var(--hybrid-icon-local-disabled-color, #c6c6c6);
    transform: none;
  }

  .svg-icon.clickable.disabled:focus {
    outline: none;
    background: none;
  }
`;
export const styles = [iconStyles, styleVariables];
