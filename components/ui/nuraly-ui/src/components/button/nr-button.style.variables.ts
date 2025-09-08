import { css } from 'lit';

/**
 * Button component CSS custom properties (design tokens)
 * 
 * This file contains all the CSS custom properties used by the nr-button component,
 * organized by functionality and including both light and dark theme variants.
 * 
 * The styling system uses CSS custom properties with fallbacks to allow
 * for both global and local customization of button appearance.
 */
export const buttonVariables = css`
  :host {
    /* ----------------------------------------
     * DEFAULT BUTTON STYLES
     * ---------------------------------------- */
    --hybrid-button-local-border-top: 2px solid #d0d0d0;
    --hybrid-button-local-border-bottom: 2px solid #d0d0d0;
    --hybrid-button-local-border-left: 2px solid #d0d0d0;
    --hybrid-button-local-border-right: 2px solid #d0d0d0;
    --hybrid-button-local-border-top-left-radius: 0px;
    --hybrid-button-local-border-top-right-radius: 0px;
    --hybrid-button-local-border-bottom-left-radius: 0px;
    --hybrid-button-local-border-bottom-right-radius: 0px;
    --hybrid-button-local-background-color: #f9f9f9;
    --hybrid-button-local-text-color: #393939;
    --hybrid-button-local-hover-border-color: #1677ff;
    --hybrid-button-local-hover-color: #1677ff;
    --hybrid-button-local-font-size: 0.9rem;
    --hybrid-button-local-font-weight: normal;
    --hybrid-button-local-text-transform: none;
    --hybrid-button-local-active-border-color: #1661b1;
    --hybrid-button-local-active-color: #184d86;
    --hybrid-button-local-disabled-background-color: #c6c6c6;
    --hybrid-button-local-disabled-text-color: #8d8d8d;
    --hybrid-button-local-disabled-border-color: #bbb;
    --hybrid-button-local-height: auto;
    --hybrid-button-local-width: auto;
    --hybrid-button-local-padding-y: 0.5rem;
    --hybrid-button-local-padding-x: 0.6rem;
    --hybrid-button-local-icon-width: 18px;
    --hybrid-button-local-icon-height: 14px;

    /* ----------------------------------------
     * PRIMARY BUTTON STYLES
     * ---------------------------------------- */
    --hybrid-button-local-primary-border-color: #0f62fe;
    --hybrid-button-local-primary-background-color: #0f62fe;
    --hybrid-button-local-primary-text-color: #ffffff;
    --hybrid-button-local-primary-outline: 1px solid white;
    --hybrid-button-local-primary-outline-offset: -3px;
    --hybrid-button-local-primary-hover-background-color: #0353e9;
    --hybrid-button-local-primary-hover-border-color: #0353e9;
    --hybrid-button-local-primary-active-background-color: #0f62fe;
    --hybrid-button-local-primary-active-border-color: #0f62fe;
    --hybrid-button-local-primary-disabled-text-color: #8d8d8d;
    --hybrid-button-local-primary-disabled-background-color: #c6c6c6;
    --hybrid-button-local-primary-disabled-border-color: #c6c6c6;
    --hybrid-button-local-primary-dashed-border-color: #ffffff;

    /* ----------------------------------------
     * DANGER BUTTON STYLES
     * ---------------------------------------- */
    --hybrid-button-local-danger-background-color: #da1e28;
    --hybrid-button-local-danger-text-color: #ffffff;
    --hybrid-button-local-danger-border-color: #da1e28;
    --hybrid-button-local-danger-outline: 1px solid white;
    --hybrid-button-local-danger-outline-offset: -3px;
    --hybrid-button-local-danger-hover-background-color: #ba1b23;
    --hybrid-button-local-danger-hover-border-color: #ba1b23;
    --hybrid-button-local-danger-active-background-color: #da1e28;
    --hybrid-button-local-danger-active-border-color: #0f62fe;
    --hybrid-button-local-danger-disabled-background-color: #c6c6c6;
    --hybrid-button-local-danger-disabled-text-color: #8d8d8d;
    --hybrid-button-local-danger-disabled-border-color: #c6c6c6;
    --hybrid-button-local-danger-dashed-border-color: #ffffff;

    /* ----------------------------------------
     * GHOST BUTTON STYLES
     * ---------------------------------------- */
    --hybrid-button-local-ghost-background-color: #ffffff;
    --hybrid-button-local-ghost-text-color: #0f62fe;
    --hybrid-button-local-ghost-border-color: #ffffff;
    --hybrid-button-local-ghost-active-background-color: #ffffff;
    --hybrid-button-local-ghost-active-text-color: #054ada;
    --hybrid-button-local-ghost-active-border-color: #0f62fe;
    --hybrid-button-local-ghost-hover-background-color: #e5e5e5;
    --hybrid-button-local-ghost-hover-border-color: #e5e5e5;
    --hybrid-button-local-ghost-hover-text-color: #054ada;
    --hybrid-button-local-ghost-disabled-background-color: #ffffff;
    --hybrid-button-local-ghost-disabled-text-color: #c6c6c6;
    --hybrid-button-local-ghost-disabled-border-color: #ffffff;
    --hybrid-button-local-ghost-dashed-border-color: #c6c6c6;

    /* ----------------------------------------
     * SECONDARY BUTTON STYLES
     * ---------------------------------------- */
    --hybrid-button-local-secondary-background-color: #393939;
    --hybrid-button-local-secondary-border-color: #393939;
    --hybrid-button-local-secondary-text-color: #ffffff;
    --hybrid-button-local-secondary-outline: 1px solid white;
    --hybrid-button-local-secondary-outline-offset: -3px;
    --hybrid-button-local-secondary-hover-background-color: #4c4c4c;
    --hybrid-button-local-secondary-hover-border-color: #4c4c4c;
    --hybrid-button-local-secondary-active-background-color: #393939;
    --hybrid-button-local-secondary-active-border-color: #0f62fe;
    --hybrid-button-local-secondary-disabled-background-color: #c6c6c6;
    --hybrid-button-local-secondary-disabled-text-color: #8d8d8d;
    --hybrid-button-local-secondary-disabled-border-color: #c6c6c6;
    --hybrid-button-local-secondary-dashed-border-color: #ffffff;

    /* ----------------------------------------
     * SIZE VARIANTS
     * ---------------------------------------- */
    /* Large button sizing */
    --hybrid-large-button-local-padding-y: 0.5rem;
    --hybrid-large-button-local-padding-x: 0.9rem;
    --hybrid-large-button-local-font-size: 1rem;

    /* Small button sizing */
    --hybrid-small-button-local-padding-y: 0.5rem;
    --hybrid-small-button-local-padding-x: 0.4rem;
    --hybrid-small-button-local-font-size: 0.7rem;
  }

  /* ========================================
   * DARK THEME OVERRIDES
   * ======================================== */
  
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
