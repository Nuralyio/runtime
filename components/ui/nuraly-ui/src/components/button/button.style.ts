import { css } from 'lit';
import { buttonVariables } from './button.style.variables.js';

/**
 * Button component styles for the Hybrid UI Library
 * Following Carbon Design System specifications
 * 
 * This file contains all the styling for the nr-button component, including:
 * - Carbon Design System compliant button variants
 * - Proper sizing following Carbon's scale
 * - Focus states with Carbon's focus indicators
 * - Hover and active states matching Carbon patterns
 * - Icon positioning and spacing
 * - Accessibility features
 */
const buttonStyles = css`
  /* Container for button content and icon positioning */
  #container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: var(--hybrid-button-local-icon-margin, 0.5rem);
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
    flex-shrink: 0;
  }

  /* 
   * Base button element styles following Carbon Design System
   */
  button {
    /* Reset default browser styles */
    appearance: none;
    border: none;
    margin: 0;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: flex-start; /* Carbon buttons are left-aligned */
    position: relative;
    overflow: hidden;
    
    /* Carbon typography */
    font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: var(--hybrid-button-font-size, var(--hybrid-button-local-font-size));
    font-weight: var(--hybrid-button-font-weight, var(--hybrid-button-local-font-weight));
    line-height: var(--hybrid-button-line-height, var(--hybrid-button-local-line-height));
    text-transform: var(--hybrid-button-text-transform, var(--hybrid-button-local-text-transform));
    
    /* Carbon sizing */
    height: var(--hybrid-button-height, var(--hybrid-button-local-height));
    min-width: var(--hybrid-button-min-width, var(--hybrid-button-local-min-width));
    width: var(--hybrid-button-width, var(--hybrid-button-local-width));
    
    /* Carbon spacing - asymmetric padding by default */
    padding-top: var(--hybrid-button-padding-y, var(--hybrid-button-local-padding-y));
    padding-bottom: var(--hybrid-button-padding-y, var(--hybrid-button-local-padding-y));
    padding-left: var(--hybrid-button-padding-x-left, var(--hybrid-button-local-padding-x-left));
    padding-right: var(--hybrid-button-padding-x-right, var(--hybrid-button-local-padding-x-right));
    
    /* Carbon borders - using CSS properties for better control */
    border: var(--hybrid-button-border-width, 1px) var(--hybrid-button-border-style, solid) var(--hybrid-button-border-color, transparent);
    border-radius: var(--hybrid-button-border-radius, 0);
    
    /* Colors */
    background-color: var(--hybrid-button-background-color, var(--hybrid-button-local-background-color));
    color: var(--hybrid-button-text-color, var(--hybrid-button-local-text-color));
    
    /* Carbon transitions */
    transition: all 70ms cubic-bezier(0.2, 0, 0.38, 0.9);
    
    /* Focus management */
    outline: none;
  }

  /* Buttons with icons get symmetric padding */
  :host([icon]) button,
  :host([iconPosition]) button {
    padding-left: var(--hybrid-button-padding-x-with-icon, var(--hybrid-button-local-padding-x-with-icon));
    padding-right: var(--hybrid-button-padding-x-with-icon, var(--hybrid-button-local-padding-x-with-icon));
    justify-content: center; /* Center content when there's an icon */
  }

  /* Ghost buttons get symmetric padding always */
  :host([type='ghost']) button {
    padding-left: var(--hybrid-button-padding-x-with-icon, var(--hybrid-button-local-padding-x-with-icon));
    padding-right: var(--hybrid-button-padding-x-with-icon, var(--hybrid-button-local-padding-x-with-icon));
  }
  
  /* Icon styling within button - inherits text color and proper sizing */
  button hy-icon {
    --hybrid-icon-color: currentColor;
    --hybrid-icon-width: var(--hybrid-button-icon-width, var(--hybrid-button-local-icon-width));
    --hybrid-icon-height: var(--hybrid-button-icon-height, var(--hybrid-button-local-icon-height));
  }

  /* 
   * Focus state - Carbon Design System focus indicator
   */
  button:focus {
    outline: var(--hybrid-button-focus-outline, 2px solid #0f62fe);
    outline-offset: var(--hybrid-button-focus-outline-offset, 1px);
  }

  /* 
   * Hover state styles
   */
  button:hover:not(:disabled) {
    background-color: var(--hybrid-button-hover-background-color, var(--hybrid-button-local-hover-background-color));
    border-color: var(--hybrid-button-hover-border-color, var(--hybrid-button-local-hover-border-color));
    color: var(--hybrid-button-hover-color, var(--hybrid-button-local-hover-color));
  }

  /* 
   * Active state styles
   */
  button:active:not(:disabled) {
    background-color: var(--hybrid-button-active-background-color, var(--hybrid-button-local-active-background-color));
    border-color: var(--hybrid-button-active-border-color, var(--hybrid-button-local-active-border-color));
    color: var(--hybrid-button-active-color, var(--hybrid-button-local-active-color));
  }

  /* 
   * Disabled state styles
   */
  button:disabled {
    cursor: not-allowed;
    background-color: var(--hybrid-button-disabled-background-color, var(--hybrid-button-local-disabled-background-color));
    color: var(--hybrid-button-disabled-text-color, var(--hybrid-button-local-disabled-text-color));
    border-color: var(--hybrid-button-disabled-border-color, var(--hybrid-button-local-disabled-border-color));
  }

  /* ========================================
   * CARBON DESIGN SYSTEM BUTTON VARIANTS
   * ======================================== */

  /* PRIMARY BUTTON - Carbon Blue */
  :host([type='primary']) button {
    --hybrid-button-background-color: var(--hybrid-button-local-primary-background-color);
    --hybrid-button-border-color: var(--hybrid-button-local-primary-border-color);
    --hybrid-button-text-color: var(--hybrid-button-local-primary-text-color);
    --hybrid-button-border-width: var(--hybrid-button-local-primary-border-width);
    --hybrid-button-border-style: var(--hybrid-button-local-primary-border-style);
    --hybrid-button-hover-background-color: var(--hybrid-button-local-primary-hover-background-color);
    --hybrid-button-hover-border-color: var(--hybrid-button-local-primary-hover-border-color);
    --hybrid-button-hover-color: var(--hybrid-button-local-primary-hover-text-color);
    --hybrid-button-active-background-color: var(--hybrid-button-local-primary-active-background-color);
    --hybrid-button-active-border-color: var(--hybrid-button-local-primary-active-border-color);
    --hybrid-button-active-color: var(--hybrid-button-local-primary-active-text-color);
    --hybrid-button-disabled-background-color: var(--hybrid-button-local-primary-disabled-background-color);
    --hybrid-button-disabled-border-color: var(--hybrid-button-local-primary-disabled-border-color);
    --hybrid-button-disabled-text-color: var(--hybrid-button-local-primary-disabled-text-color);
    --hybrid-button-focus-outline: var(--hybrid-button-local-primary-focus-outline);
    --hybrid-button-focus-outline-offset: var(--hybrid-button-local-primary-focus-outline-offset);
  }

  /* SECONDARY BUTTON - Carbon Outline */
  :host([type='secondary']) button {
    --hybrid-button-background-color: var(--hybrid-button-local-secondary-background-color);
    --hybrid-button-border-color: var(--hybrid-button-local-secondary-border-color);
    --hybrid-button-text-color: var(--hybrid-button-local-secondary-text-color);
    --hybrid-button-border-width: var(--hybrid-button-local-secondary-border-width);
    --hybrid-button-border-style: var(--hybrid-button-local-secondary-border-style);
    --hybrid-button-hover-background-color: var(--hybrid-button-local-secondary-hover-background-color);
    --hybrid-button-hover-border-color: var(--hybrid-button-local-secondary-hover-border-color);
    --hybrid-button-hover-color: var(--hybrid-button-local-secondary-hover-text-color);
    --hybrid-button-active-background-color: var(--hybrid-button-local-secondary-active-background-color);
    --hybrid-button-active-border-color: var(--hybrid-button-local-secondary-active-border-color);
    --hybrid-button-active-color: var(--hybrid-button-local-secondary-active-text-color);
    --hybrid-button-disabled-background-color: var(--hybrid-button-local-secondary-disabled-background-color);
    --hybrid-button-disabled-border-color: var(--hybrid-button-local-secondary-disabled-border-color);
    --hybrid-button-disabled-text-color: var(--hybrid-button-local-secondary-disabled-text-color);
    --hybrid-button-focus-outline: var(--hybrid-button-local-secondary-focus-outline);
    --hybrid-button-focus-outline-offset: var(--hybrid-button-local-secondary-focus-outline-offset);
  }

  /* TERTIARY BUTTON - Carbon Ghost */
  :host([type='tertiary']) button,
  :host([type='ghost']) button {
    --hybrid-button-background-color: var(--hybrid-button-local-tertiary-background-color);
    --hybrid-button-border-color: var(--hybrid-button-local-tertiary-border-color);
    --hybrid-button-text-color: var(--hybrid-button-local-tertiary-text-color);
    --hybrid-button-border-width: var(--hybrid-button-local-tertiary-border-width);
    --hybrid-button-border-style: var(--hybrid-button-local-tertiary-border-style);
    --hybrid-button-hover-background-color: var(--hybrid-button-local-tertiary-hover-background-color);
    --hybrid-button-hover-border-color: var(--hybrid-button-local-tertiary-hover-border-color);
    --hybrid-button-hover-color: var(--hybrid-button-local-tertiary-hover-text-color);
    --hybrid-button-active-background-color: var(--hybrid-button-local-tertiary-active-background-color);
    --hybrid-button-active-border-color: var(--hybrid-button-local-tertiary-active-border-color);
    --hybrid-button-active-color: var(--hybrid-button-local-tertiary-active-text-color);
    --hybrid-button-disabled-background-color: var(--hybrid-button-local-tertiary-disabled-background-color);
    --hybrid-button-disabled-border-color: var(--hybrid-button-local-tertiary-disabled-border-color);
    --hybrid-button-disabled-text-color: var(--hybrid-button-local-tertiary-disabled-text-color);
    --hybrid-button-focus-outline: var(--hybrid-button-local-tertiary-focus-outline);
    --hybrid-button-focus-outline-offset: var(--hybrid-button-local-tertiary-focus-outline-offset);
  }

  /* DANGER BUTTON - Carbon Destructive */
  :host([type='danger']) button {
    --hybrid-button-background-color: var(--hybrid-button-local-danger-background-color);
    --hybrid-button-border-color: var(--hybrid-button-local-danger-border-color);
    --hybrid-button-text-color: var(--hybrid-button-local-danger-text-color);
    --hybrid-button-border-width: var(--hybrid-button-local-danger-border-width);
    --hybrid-button-border-style: var(--hybrid-button-local-danger-border-style);
    --hybrid-button-hover-background-color: var(--hybrid-button-local-danger-hover-background-color);
    --hybrid-button-hover-border-color: var(--hybrid-button-local-danger-hover-border-color);
    --hybrid-button-hover-color: var(--hybrid-button-local-danger-hover-text-color);
    --hybrid-button-active-background-color: var(--hybrid-button-local-danger-active-background-color);
    --hybrid-button-active-border-color: var(--hybrid-button-local-danger-active-border-color);
    --hybrid-button-active-color: var(--hybrid-button-local-danger-active-text-color);
    --hybrid-button-disabled-background-color: var(--hybrid-button-local-danger-disabled-background-color);
    --hybrid-button-disabled-border-color: var(--hybrid-button-local-danger-disabled-border-color);
    --hybrid-button-disabled-text-color: var(--hybrid-button-local-danger-disabled-text-color);
    --hybrid-button-focus-outline: var(--hybrid-button-local-danger-focus-outline);
    --hybrid-button-focus-outline-offset: var(--hybrid-button-local-danger-focus-outline-offset);
  }

  /* DANGER TERTIARY BUTTON - Carbon Destructive Outline */
  :host([type='danger-tertiary']) button {
    --hybrid-button-background-color: var(--hybrid-button-local-danger-tertiary-background-color);
    --hybrid-button-border-color: var(--hybrid-button-local-danger-tertiary-border-color);
    --hybrid-button-text-color: var(--hybrid-button-local-danger-tertiary-text-color);
    --hybrid-button-border-width: var(--hybrid-button-local-danger-tertiary-border-width);
    --hybrid-button-border-style: var(--hybrid-button-local-danger-tertiary-border-style);
    --hybrid-button-hover-background-color: var(--hybrid-button-local-danger-tertiary-hover-background-color);
    --hybrid-button-hover-border-color: var(--hybrid-button-local-danger-tertiary-hover-border-color);
    --hybrid-button-hover-color: var(--hybrid-button-local-danger-tertiary-hover-text-color);
    --hybrid-button-active-background-color: var(--hybrid-button-local-danger-tertiary-active-background-color);
    --hybrid-button-active-border-color: var(--hybrid-button-local-danger-tertiary-active-border-color);
    --hybrid-button-active-color: var(--hybrid-button-local-danger-tertiary-active-text-color);
    --hybrid-button-disabled-background-color: var(--hybrid-button-local-danger-tertiary-disabled-background-color);
    --hybrid-button-disabled-border-color: var(--hybrid-button-local-danger-tertiary-disabled-border-color);
    --hybrid-button-disabled-text-color: var(--hybrid-button-local-danger-tertiary-disabled-text-color);
  }

  /* ========================================
   * CARBON DESIGN SYSTEM BUTTON SIZES
   * ======================================== */

  /* Small button (32px) */
  :host([size='sm']) button,
  :host([size='small']) button {
    --hybrid-button-height: var(--hybrid-button-local-small-height);
    --hybrid-button-padding-y: var(--hybrid-button-local-small-padding-y);
    --hybrid-button-padding-x-left: var(--hybrid-button-local-small-padding-x-left);
    --hybrid-button-padding-x-right: var(--hybrid-button-local-small-padding-x-right);
    --hybrid-button-padding-x-with-icon: var(--hybrid-button-local-small-padding-x-with-icon);
    --hybrid-button-font-size: var(--hybrid-button-local-small-font-size);
    --hybrid-button-line-height: var(--hybrid-button-local-small-line-height);
  }

  /* Medium button (40px) */
  :host([size='md']) button {
    --hybrid-button-height: var(--hybrid-button-local-medium-height);
    --hybrid-button-padding-y: var(--hybrid-button-local-medium-padding-y);
    --hybrid-button-padding-x-left: var(--hybrid-button-local-medium-padding-x-left);
    --hybrid-button-padding-x-right: var(--hybrid-button-local-medium-padding-x-right);
    --hybrid-button-padding-x-with-icon: var(--hybrid-button-local-medium-padding-x-with-icon);
    --hybrid-button-font-size: var(--hybrid-button-local-medium-font-size);
    --hybrid-button-line-height: var(--hybrid-button-local-medium-line-height);
  }

  /* Large button (48px) - Default */
  :host([size='lg']) button,
  :host([size='large']) button,
  :host(:not([size])) button {
    --hybrid-button-height: var(--hybrid-button-local-large-height);
    --hybrid-button-padding-y: var(--hybrid-button-local-large-padding-y);
    --hybrid-button-padding-x-left: var(--hybrid-button-local-large-padding-x-left);
    --hybrid-button-padding-x-right: var(--hybrid-button-local-large-padding-x-right);
    --hybrid-button-padding-x-with-icon: var(--hybrid-button-local-large-padding-x-with-icon);
    --hybrid-button-font-size: var(--hybrid-button-local-large-font-size);
    --hybrid-button-line-height: var(--hybrid-button-local-large-line-height);
  }

  /* Extra Large button (64px) */
  :host([size='xl']) button {
    --hybrid-button-height: var(--hybrid-button-local-xl-height);
    --hybrid-button-padding-y: var(--hybrid-button-local-xl-padding-y);
    --hybrid-button-padding-x-left: var(--hybrid-button-local-xl-padding-x-left);
    --hybrid-button-padding-x-right: var(--hybrid-button-local-xl-padding-x-right);
    --hybrid-button-padding-x-with-icon: var(--hybrid-button-local-xl-padding-x-with-icon);
    --hybrid-button-font-size: var(--hybrid-button-local-xl-font-size);
    --hybrid-button-line-height: var(--hybrid-button-local-xl-line-height);
  }

  /* ========================================
   * FULL WIDTH BUTTON
   * ======================================== */
  :host([block]) button {
    width: 100%;
  }

  /* ========================================
   * LOADING STATE
   * ======================================== */
  :host([loading]) button {
    cursor: wait;
    opacity: 0.6;
  }

  /* ========================================
   * ICON-ONLY BUTTONS
   * ======================================== */
  :host([shape='circle']) button {
    border-radius: 50%;
    --hybrid-button-padding-x: var(--hybrid-button-padding-y);
    aspect-ratio: 1;
  }

  :host([shape='round']) button {
    border-radius: 1.5rem;
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
    --hybrid-icon-local-color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
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
    --hybrid-icon-local-color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
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
   * NEW BUTTON TYPES
   * ======================================== */

  /* TEXT BUTTON VARIANT */
  button[data-type='text'] {
    background-color: var(--hybrid-button-text-background-color, var(--hybrid-button-local-text-background-color, transparent));
    color: var(--hybrid-button-text-text-color, var(--hybrid-button-local-text-text-color, #1890ff));
    border: none;
    box-shadow: none;
  }

  button[data-type='text'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-text-text-color, var(--hybrid-button-local-text-text-color, #1890ff));
  }

  button[data-type='text']:hover:not(:disabled) {
    background-color: var(--hybrid-button-text-hover-background-color, var(--hybrid-button-local-text-hover-background-color, rgba(24, 144, 255, 0.06)));
    color: var(--hybrid-button-text-hover-text-color, var(--hybrid-button-local-text-hover-text-color, #40a9ff));
  }

  button[data-type='text']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-text-hover-text-color, var(--hybrid-button-local-text-hover-text-color, #40a9ff));
  }

  button[data-type='text']:active:not(:disabled) {
    background-color: var(--hybrid-button-text-active-background-color, var(--hybrid-button-local-text-active-background-color, rgba(24, 144, 255, 0.15)));
    color: var(--hybrid-button-text-active-text-color, var(--hybrid-button-local-text-active-text-color, #096dd9));
  }

  button[data-type='text']:disabled {
    background-color: transparent;
    color: var(--hybrid-button-text-disabled-text-color, var(--hybrid-button-local-text-disabled-text-color, rgba(0, 0, 0, 0.25)));
    border: none;
  }

  /* LINK BUTTON VARIANT */
  a[data-type='link'], button[data-type='link'] {
    background-color: transparent;
    color: var(--hybrid-button-link-text-color, var(--hybrid-button-local-link-text-color, #1890ff));
    border: none;
    box-shadow: none;
    text-decoration: underline;
    cursor: pointer;
  }

  a[data-type='link'] hy-icon, button[data-type='link'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-link-text-color, var(--hybrid-button-local-link-text-color, #1890ff));
  }

  a[data-type='link']:hover, button[data-type='link']:hover:not(:disabled) {
    color: var(--hybrid-button-link-hover-text-color, var(--hybrid-button-local-link-hover-text-color, #40a9ff));
  }

  a[data-type='link']:hover hy-icon, button[data-type='link']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-link-hover-text-color, var(--hybrid-button-local-link-hover-text-color, #40a9ff));
  }

  a[data-type='link']:active, button[data-type='link']:active:not(:disabled) {
    color: var(--hybrid-button-link-active-text-color, var(--hybrid-button-local-link-active-text-color, #096dd9));
  }

  button[data-type='link']:disabled {
    color: var(--hybrid-button-link-disabled-text-color, var(--hybrid-button-local-link-disabled-text-color, rgba(0, 0, 0, 0.25)));
    text-decoration: none;
    cursor: not-allowed;
  }

  /* ========================================
   * SHAPE VARIANTS
   * ======================================== */

  /* Circle button shape */
  button[data-shape='circle'], a[data-shape='circle'] {
    border-radius: 50%;
    width: var(--hybrid-button-circle-size, var(--hybrid-button-local-circle-size, 32px));
    height: var(--hybrid-button-circle-size, var(--hybrid-button-local-circle-size, 32px));
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  button[data-shape='circle'][data-size='small'], a[data-shape='circle'][data-size='small'] {
    width: var(--hybrid-button-circle-size-small, var(--hybrid-button-local-circle-size-small, 24px));
    height: var(--hybrid-button-circle-size-small, var(--hybrid-button-local-circle-size-small, 24px));
  }

  button[data-shape='circle'][data-size='large'], a[data-shape='circle'][data-size='large'] {
    width: var(--hybrid-button-circle-size-large, var(--hybrid-button-local-circle-size-large, 40px));
    height: var(--hybrid-button-circle-size-large, var(--hybrid-button-local-circle-size-large, 40px));
  }

  /* Round button shape */
  button[data-shape='round'], a[data-shape='round'] {
    border-radius: var(--hybrid-button-round-border-radius, var(--hybrid-button-local-round-border-radius, 16px));
  }

  /* ========================================
   * BLOCK BUTTON
   * ======================================== */

  button[data-block='true'], a[data-block='true'] {
    width: 100%;
    display: block;
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

    /* Text button dark theme overrides */
    --hybrid-button-local-text-background-color: transparent;
    --hybrid-button-local-text-text-color: #ffffff;
    --hybrid-button-local-text-border-color: transparent;
    --hybrid-button-local-text-hover-background-color: rgba(255, 255, 255, 0.1);
    --hybrid-button-local-text-hover-text-color: #ffffff;
    --hybrid-button-local-text-hover-border-color: transparent;
    --hybrid-button-local-text-active-background-color: rgba(255, 255, 255, 0.15);
    --hybrid-button-local-text-active-text-color: #ffffff;
    --hybrid-button-local-text-active-border-color: transparent;
    --hybrid-button-local-text-disabled-background-color: transparent;
    --hybrid-button-local-text-disabled-text-color: #6f6f6f;
    --hybrid-button-local-text-disabled-border-color: transparent;

    /* Link button dark theme overrides */
    --hybrid-button-local-link-background-color: transparent;
    --hybrid-button-local-link-text-color: #78a9ff;
    --hybrid-button-local-link-border-color: transparent;
    --hybrid-button-local-link-hover-background-color: transparent;
    --hybrid-button-local-link-hover-text-color: #a6c8ff;
    --hybrid-button-local-link-hover-border-color: transparent;
    --hybrid-button-local-link-active-background-color: transparent;
    --hybrid-button-local-link-active-text-color: #a6c8ff;
    --hybrid-button-local-link-active-border-color: transparent;
    --hybrid-button-local-link-disabled-background-color: transparent;
    --hybrid-button-local-link-disabled-text-color: #6f6f6f;
    --hybrid-button-local-link-disabled-border-color: transparent;
  }

  /* ========================================
   * RIPPLE EFFECT STYLES
   * ======================================== */

  /* Ripple effect animation */
  .ripple {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.4);
    transform: scale(0);
    animation: ripple-animation 0.6s linear;
    pointer-events: none;
  }

  /* Darker ripple for light buttons */
  button[data-type='default'] .ripple,
  button[data-type='ghost'] .ripple {
    background-color: rgba(0, 0, 0, 0.1);
  }

  /* Lighter ripple for dark buttons */
  button[data-type='primary'] .ripple,
  button[data-type='danger'] .ripple {
    background-color: rgba(255, 255, 255, 0.3);
  }

  /* Ripple animation keyframes */
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  /* Disable ripple when component is disabled */
  button:disabled .ripple {
    display: none;
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
