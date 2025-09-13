import { css } from 'lit';
import { styleVariables } from './icon.variables.js';

/**
 * Icon component styles with theme support and interactive states
 * 
 * Uses CSS custom properties for theming with fallbacks for backwards compatibility.
 * Supports both light and dark themes via data-theme attribute.
 */
const iconStyles = css`
  :host {
    display: inline-flex;
    align-items: center;
    line-height: 1;
    vertical-align: baseline;
  }

  .svg-icon {
    /* Basic properties */
    fill: var(--nuraly-icon-local-color, var(--nuraly-icon-color, #000000));
    width: var(--nuraly-icon-local-width, var(--nuraly-icon-width, 18px));
    height: var(--nuraly-icon-local-height, var(--nuraly-icon-height, 18px));
    transition: var(--nuraly-icon-local-transition, opacity 0.2s ease, transform 0.2s ease);
    display: block;
    
    /* Cursor handling */
    cursor: default;
  }

  /* ========================================
   * CLICKABLE STATES
   * ======================================== */
  
  .svg-icon.clickable {
    cursor: var(--nuraly-icon-local-cursor, pointer);
  }

  .svg-icon.clickable:hover {
    opacity: var(--nuraly-icon-local-hover-opacity, 0.8);
    transform: var(--nuraly-icon-local-hover-transform, scale(1.1));
    fill: var(--nuraly-icon-local-hover-color, var(--nuraly-icon-local-color, #0f62fe));
  }

  .svg-icon.clickable:active {
    opacity: var(--nuraly-icon-local-active-opacity, 0.6);
    transform: var(--nuraly-icon-local-active-transform, scale(0.95));
    fill: var(--nuraly-icon-local-active-color, var(--nuraly-icon-local-color, #054ada));
  }

  .svg-icon.clickable:focus {
    outline: var(--nuraly-icon-local-focus-outline, 2px solid #0f62fe);
    outline-offset: var(--nuraly-icon-local-focus-outline-offset, 2px);
    background: var(--nuraly-icon-local-focus-background, rgba(15, 98, 254, 0.1));
    border-radius: var(--nuraly-icon-local-focus-border-radius, 4px);
  }

  /* ========================================
   * DISABLED STATE
   * ======================================== */
  
  .svg-icon.disabled {
    opacity: var(--nuraly-icon-local-disabled-opacity, 0.4);
    fill: var(--nuraly-icon-local-disabled-color, #c6c6c6);
    cursor: var(--nuraly-icon-local-disabled-cursor, not-allowed);
  }

  .svg-icon.clickable.disabled:hover,
  .svg-icon.clickable.disabled:active {
    opacity: var(--nuraly-icon-local-disabled-opacity, 0.4);
    fill: var(--nuraly-icon-local-disabled-color, #c6c6c6);
    transform: none;
  }

  .svg-icon.clickable.disabled:focus {
    outline: none;
    background: none;
  }
`;
export const styles = [iconStyles, styleVariables];
