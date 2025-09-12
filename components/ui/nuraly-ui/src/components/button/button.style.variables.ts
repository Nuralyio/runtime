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
     * CARBON DESIGN SYSTEM - BASE STYLES
     * ---------------------------------------- */
    
    /* Base sizing following Carbon's type scale */
    --hybrid-button-local-font-size: 0.875rem; /* 14px - Carbon body-compact-01 */
    --hybrid-button-local-font-weight: 400;
    --hybrid-button-local-line-height: 1.125rem; /* 18px */
    --hybrid-button-local-text-transform: none;
    
    /* Carbon spacing tokens - following exact Carbon structure */
    --hybrid-button-local-padding-y: 0.6875rem; /* 11px for 48px height */
    --hybrid-button-local-padding-x-left: 1rem; /* 16px left padding */
    --hybrid-button-local-padding-x-right: 4rem; /* 64px right padding for buttons without icon */
    --hybrid-button-local-padding-x-with-icon: 1rem; /* 16px both sides for buttons with icon */
    --hybrid-button-local-height: 3rem; /* 48px - Large size */
    --hybrid-button-local-width: auto;
    --hybrid-button-local-min-width: 5rem; /* 80px minimum */
    
    /* Carbon border radius */
    --hybrid-button-local-border-top-left-radius: 0;
    --hybrid-button-local-border-top-right-radius: 0;
    --hybrid-button-local-border-bottom-left-radius: 0;
    --hybrid-button-local-border-bottom-right-radius: 0;
    
    /* Icon sizing */
    --hybrid-button-local-icon-width: 1rem; /* 16px */
    --hybrid-button-local-icon-height: 1rem; /* 16px */
    --hybrid-button-local-icon-margin: 0.5rem; /* 8px spacing between icon and text */

    /* ----------------------------------------
     * PRIMARY BUTTON (Carbon Blue 60)
     * ---------------------------------------- */
    --hybrid-button-local-primary-background-color: #0f62fe; /* Blue 60 */
    --hybrid-button-local-primary-border-color: #0f62fe;
    --hybrid-button-local-primary-text-color: #ffffff; /* White */
    --hybrid-button-local-primary-border-width: 1px;
    --hybrid-button-local-primary-border-style: solid;
    
    /* Primary hover state (Blue 70) */
    --hybrid-button-local-primary-hover-background-color: #0043ce; /* Blue 70 */
    --hybrid-button-local-primary-hover-border-color: #0043ce;
    --hybrid-button-local-primary-hover-text-color: #ffffff;
    
    /* Primary active state (Blue 80) */
    --hybrid-button-local-primary-active-background-color: #002d9c; /* Blue 80 */
    --hybrid-button-local-primary-active-border-color: #002d9c;
    --hybrid-button-local-primary-active-text-color: #ffffff;
    
    /* Primary disabled state */
    --hybrid-button-local-primary-disabled-background-color: #c6c6c6; /* Gray 40 */
    --hybrid-button-local-primary-disabled-border-color: #c6c6c6;
    --hybrid-button-local-primary-disabled-text-color: #ffffff;
    
    /* Primary focus state */
    --hybrid-button-local-primary-focus-outline: 2px solid #0f62fe;
    --hybrid-button-local-primary-focus-outline-offset: 1px;

    /* ----------------------------------------
     * SECONDARY BUTTON (Carbon Gray 100 outline)
     * ---------------------------------------- */
    --hybrid-button-local-secondary-background-color: #393939; /* Gray 100 */
    --hybrid-button-local-secondary-border-color: #393939; /* Gray 100 */
    --hybrid-button-local-secondary-text-color: #ffffff; /* White text on gray background */
    --hybrid-button-local-secondary-border-width: 1px;
    --hybrid-button-local-secondary-border-style: solid;
    
    /* Secondary hover state */
    --hybrid-button-local-secondary-hover-background-color: #4c4c4c; /* Gray 90 */
    --hybrid-button-local-secondary-hover-border-color: #4c4c4c;
    --hybrid-button-local-secondary-hover-text-color: #ffffff;
    
    /* Secondary active state */
    --hybrid-button-local-secondary-active-background-color: #6f6f6f; /* Gray 80 */
    --hybrid-button-local-secondary-active-border-color: #6f6f6f;
    --hybrid-button-local-secondary-active-text-color: #ffffff;
    
    /* Secondary disabled state */
    --hybrid-button-local-secondary-disabled-background-color: #c6c6c6; /* Gray 40 */
    --hybrid-button-local-secondary-disabled-border-color: #c6c6c6;
    --hybrid-button-local-secondary-disabled-text-color: #8d8d8d; /* Gray 50 */
    
    /* Secondary focus state */
    --hybrid-button-local-secondary-focus-outline: 2px solid #0f62fe;
    --hybrid-button-local-secondary-focus-outline-offset: 1px;

    /* ----------------------------------------
     * TERTIARY BUTTON (Carbon Tertiary style with border)
     * ---------------------------------------- */
    --hybrid-button-local-tertiary-background-color: transparent;
    --hybrid-button-local-tertiary-border-color: #0f62fe; /* Blue 60 border */
    --hybrid-button-local-tertiary-text-color: #0f62fe; /* Blue 60 */
    --hybrid-button-local-tertiary-border-width: 1px;
    --hybrid-button-local-tertiary-border-style: solid;
    
    /* Tertiary hover state */
    --hybrid-button-local-tertiary-hover-background-color: #0f62fe; /* Blue 60 background */
    --hybrid-button-local-tertiary-hover-border-color: #0f62fe;
    --hybrid-button-local-tertiary-hover-text-color: #ffffff; /* White text on blue */
    
    /* Tertiary active state */
    --hybrid-button-local-tertiary-active-background-color: #0043ce; /* Blue 70 */
    --hybrid-button-local-tertiary-active-border-color: #0043ce;
    --hybrid-button-local-tertiary-active-text-color: #ffffff;
    
    /* Tertiary disabled state */
    --hybrid-button-local-tertiary-disabled-background-color: transparent;
    --hybrid-button-local-tertiary-disabled-border-color: #c6c6c6; /* Gray 40 */
    --hybrid-button-local-tertiary-disabled-text-color: #c6c6c6;
    
    /* Tertiary focus state */
    --hybrid-button-local-tertiary-focus-outline: 2px solid #0f62fe;
    --hybrid-button-local-tertiary-focus-outline-offset: 1px;

    /* ----------------------------------------
     * DANGER/DESTRUCTIVE BUTTON (Carbon Red 60)
     * ---------------------------------------- */
    --hybrid-button-local-danger-background-color: #da1e28; /* Red 60 */
    --hybrid-button-local-danger-border-color: #da1e28;
    --hybrid-button-local-danger-text-color: #ffffff;
    --hybrid-button-local-danger-border-width: 1px;
    --hybrid-button-local-danger-border-style: solid;
    
    /* Danger hover state (Red 70) */
    --hybrid-button-local-danger-hover-background-color: #ba1b23; /* Red 70 */
    --hybrid-button-local-danger-hover-border-color: #ba1b23;
    --hybrid-button-local-danger-hover-text-color: #ffffff;
    
    /* Danger active state (Red 80) */
    --hybrid-button-local-danger-active-background-color: #a2191f; /* Red 80 */
    --hybrid-button-local-danger-active-border-color: #a2191f;
    --hybrid-button-local-danger-active-text-color: #ffffff;
    
    /* Danger disabled state */
    --hybrid-button-local-danger-disabled-background-color: #c6c6c6; /* Gray 40 */
    --hybrid-button-local-danger-disabled-border-color: #c6c6c6;
    --hybrid-button-local-danger-disabled-text-color: #ffffff;
    
    /* Danger focus state */
    --hybrid-button-local-danger-focus-outline: 2px solid #da1e28;
    --hybrid-button-local-danger-focus-outline-offset: 1px;

    /* ----------------------------------------
     * DANGER TERTIARY BUTTON (Outline destructive)
     * ---------------------------------------- */
    --hybrid-button-local-danger-tertiary-background-color: transparent;
    --hybrid-button-local-danger-tertiary-border-color: #da1e28; /* Red 60 */
    --hybrid-button-local-danger-tertiary-text-color: #da1e28;
    --hybrid-button-local-danger-tertiary-border-width: 1px;
    --hybrid-button-local-danger-tertiary-border-style: solid;
    
    /* Danger tertiary hover state */
    --hybrid-button-local-danger-tertiary-hover-background-color: #da1e28;
    --hybrid-button-local-danger-tertiary-hover-border-color: #da1e28;
    --hybrid-button-local-danger-tertiary-hover-text-color: #ffffff;
    
    /* Danger tertiary active state */
    --hybrid-button-local-danger-tertiary-active-background-color: #ba1b23;
    --hybrid-button-local-danger-tertiary-active-border-color: #ba1b23;
    --hybrid-button-local-danger-tertiary-active-text-color: #ffffff;
    
    /* Danger tertiary disabled state */
    --hybrid-button-local-danger-tertiary-disabled-background-color: transparent;
    --hybrid-button-local-danger-tertiary-disabled-border-color: #c6c6c6;
    --hybrid-button-local-danger-tertiary-disabled-text-color: #c6c6c6;

    /* ----------------------------------------
     * GHOST BUTTON (Carbon Link Primary style)
     * ---------------------------------------- */
    --hybrid-button-local-ghost-background-color: transparent;
    --hybrid-button-local-ghost-border-color: transparent;
    --hybrid-button-local-ghost-text-color: #0f62fe; /* Link primary color */
    --hybrid-button-local-ghost-border-width: 1px;
    --hybrid-button-local-ghost-border-style: solid;
    
    /* Ghost hover state */
    --hybrid-button-local-ghost-hover-background-color: #e5e5e5; /* Background hover */
    --hybrid-button-local-ghost-hover-border-color: #e5e5e5;
    --hybrid-button-local-ghost-hover-text-color: #0043ce; /* Link primary hover */
    
    /* Ghost active state */
    --hybrid-button-local-ghost-active-background-color: #e5e5e5; /* Background hover */
    --hybrid-button-local-ghost-active-border-color: #e5e5e5;
    --hybrid-button-local-ghost-active-text-color: #0043ce;
    
    /* Ghost disabled state */
    --hybrid-button-local-ghost-disabled-background-color: transparent;
    --hybrid-button-local-ghost-disabled-border-color: transparent;
    --hybrid-button-local-ghost-disabled-text-color: #c6c6c6; /* Text disabled */
    
    /* Ghost focus state */
    --hybrid-button-local-ghost-focus-outline: 2px solid #0f62fe;
    --hybrid-button-local-ghost-focus-outline-offset: 1px;

    /* ----------------------------------------
     * SIZE VARIANTS (Carbon Design System)
     * ---------------------------------------- */
    
    /* Small button (32px height) */
    --hybrid-button-local-small-height: 2rem; /* 32px */
    --hybrid-button-local-small-padding-y: 0.4375rem; /* 7px */
    --hybrid-button-local-small-padding-x-left: 1rem; /* 16px left */
    --hybrid-button-local-small-padding-x-right: 4rem; /* 64px right */
    --hybrid-button-local-small-padding-x-with-icon: 1rem; /* 16px both sides with icon */
    --hybrid-button-local-small-font-size: 0.875rem; /* 14px */
    --hybrid-button-local-small-line-height: 1.125rem; /* 18px */
    
    /* Medium button (40px height) */
    --hybrid-button-local-medium-height: 2.5rem; /* 40px */
    --hybrid-button-local-medium-padding-y: 0.5625rem; /* 9px */
    --hybrid-button-local-medium-padding-x-left: 1rem; /* 16px left */
    --hybrid-button-local-medium-padding-x-right: 4rem; /* 64px right */
    --hybrid-button-local-medium-padding-x-with-icon: 1rem; /* 16px both sides with icon */
    --hybrid-button-local-medium-font-size: 0.875rem; /* 14px */
    --hybrid-button-local-medium-line-height: 1.125rem; /* 18px */
    
    /* Large button (48px height) - default */
    --hybrid-button-local-large-height: 3rem; /* 48px */
    --hybrid-button-local-large-padding-y: 0.6875rem; /* 11px */
    --hybrid-button-local-large-padding-x-left: 1rem; /* 16px left */
    --hybrid-button-local-large-padding-x-right: 4rem; /* 64px right */
    --hybrid-button-local-large-padding-x-with-icon: 1rem; /* 16px both sides with icon */
    --hybrid-button-local-large-font-size: 0.875rem; /* 14px */
    --hybrid-button-local-large-line-height: 1.125rem; /* 18px */
    
    /* Extra Large button (64px height) */
    --hybrid-button-local-xl-height: 4rem; /* 64px */
    --hybrid-button-local-xl-padding-y: 0.75rem; /* 12px */
    --hybrid-button-local-xl-padding-x-left: 1rem; /* 16px left */
    --hybrid-button-local-xl-padding-x-right: 4rem; /* 64px right */
    --hybrid-button-local-xl-padding-x-with-icon: 1rem; /* 16px both sides with icon */
    --hybrid-button-local-xl-font-size: 0.875rem; /* 14px */
    --hybrid-button-local-xl-line-height: 1.125rem; /* 18px */

    /* ----------------------------------------
     * DEFAULT FALLBACK VALUES
     * ---------------------------------------- */
    --hybrid-button-local-border-top: var(--hybrid-button-local-secondary-border-width) var(--hybrid-button-local-secondary-border-style) var(--hybrid-button-local-secondary-border-color);
    --hybrid-button-local-border-bottom: var(--hybrid-button-local-secondary-border-width) var(--hybrid-button-local-secondary-border-style) var(--hybrid-button-local-secondary-border-color);
    --hybrid-button-local-border-left: var(--hybrid-button-local-secondary-border-width) var(--hybrid-button-local-secondary-border-style) var(--hybrid-button-local-secondary-border-color);
    --hybrid-button-local-border-right: var(--hybrid-button-local-secondary-border-width) var(--hybrid-button-local-secondary-border-style) var(--hybrid-button-local-secondary-border-color);
    --hybrid-button-local-background-color: var(--hybrid-button-local-secondary-background-color);
    --hybrid-button-local-text-color: var(--hybrid-button-local-secondary-text-color);
    --hybrid-button-local-hover-background-color: var(--hybrid-button-local-secondary-hover-background-color);
    --hybrid-button-local-hover-border-color: var(--hybrid-button-local-secondary-hover-border-color);
    --hybrid-button-local-hover-color: var(--hybrid-button-local-secondary-hover-text-color);
    --hybrid-button-local-active-border-color: var(--hybrid-button-local-secondary-active-border-color);
    --hybrid-button-local-active-color: var(--hybrid-button-local-secondary-active-text-color);
    --hybrid-button-local-disabled-background-color: var(--hybrid-button-local-secondary-disabled-background-color);
    --hybrid-button-local-disabled-text-color: var(--hybrid-button-local-secondary-disabled-text-color);
    --hybrid-button-local-disabled-border-color: var(--hybrid-button-local-secondary-disabled-border-color);
    --hybrid-button-local-margin-y: 0;
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
