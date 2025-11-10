/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * Collapse component styles using theme variables
 * Follows NuralyUI architecture with clean CSS variable usage
 */
export const styles = css`
  :host {
    display: block;
    width: 100%;
    
    /* Force CSS custom property inheritance to ensure theme switching works properly */
    color: var(--nuraly-color-text);
    background-color: var(--nuraly-color-background);
  }

  /* Force re-evaluation of theme-dependent properties on theme change */
  :host([data-theme]) {
    color: inherit;
    background-color: inherit;
  }

  .collapse-container {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-collapse-gap);
    border: var(--nuraly-color-collapse-border);
    border-radius: var(--nuraly-border-radius-collapse);
    background-color: var(--nuraly-color-collapse-bordered-background);
    overflow: visible;
  }

  .collapse-section {
    position: relative;
    border-bottom: 1px solid var(--nuraly-color-collapse-border);
    transition: var(--nuraly-transition-collapse);
  }

  .collapse-section:last-child {
    border-bottom: none;
  }

  .collapse-section--disabled {
    opacity: var(--nuraly-opacity-collapse-disabled);
    pointer-events: none;
  }

  .collapse-section--non-collapsible .collapse-header {
    cursor: default;
  }

  .collapse-section--animating .collapse-content {
    overflow: hidden;
  }

  /* Header Styles */
  .collapse-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-spacing-collapse-padding);
    background-color: var(--nuraly-color-collapse-header-background);
    color: var(--nuraly-color-collapse-header-text);
    font-weight: var(--nuraly-font-collapse-header-weight);
    font-size: var(--nuraly-font-collapse-header-size);
    line-height: var(--nuraly-font-collapse-header-line-height);
    border: none;
    cursor: pointer;
    user-select: none;
    transition: var(--nuraly-collapse-transition-duration) var(--nuraly-collapse-transition-easing);
    border-radius: var(--nuraly-border-radius-collapse-header);
  }

  .collapse-header--clickable:hover {
    background-color: var(--nuraly-color-collapse-header-background-hover);
  }

  .collapse-header--clickable:active {
    background-color: var(--nuraly-color-collapse-header-background-active);
  }

  .collapse-header--expanded {
    background-color: var(--nuraly-color-collapse-header-background-expanded);
  }

  .collapse-header--disabled {
    color: var(--nuraly-color-collapse-header-text-disabled);
    cursor: not-allowed;
  }

  .collapse-header:focus-visible {
    outline: 2px solid var(--nuraly-color-collapse-focus-outline);
    outline-offset: 2px;
    box-shadow: var(--nuraly-shadow-collapse-focus);
  }

  .collapse-header-text {
    flex: 1;
    text-align: left;
  }

  .collapse-header-right {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-collapse-header-right-gap, 0.5rem);
    margin-left: var(--nuraly-spacing-collapse-header-right-margin, 0.75rem);
    color: var(--nuraly-color-collapse-header-right-text, inherit);
  }

  .collapse-header-right > * {
    flex-shrink: 0;
  }

  /* Icon Styles */
  .collapse-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--nuraly-collapse-icon-size);
    height: var(--nuraly-collapse-icon-size);
    color: var(--nuraly-color-collapse-icon);
    transition: var(--nuraly-collapse-icon-transition);
    transform-origin: center;
  }

  .collapse-header--disabled .collapse-icon {
    color: var(--nuraly-color-collapse-icon-disabled);
  }

  /* Content Styles */
  .collapse-content {
    background-color: var(--nuraly-color-collapse-content-background);
    border-radius: var(--nuraly-border-radius-collapse-content);
    transition: var(--nuraly-collapse-transition-duration) var(--nuraly-collapse-transition-easing);
  }

  .collapse-content-inner {
    padding: var(--nuraly-spacing-collapse-content-padding);
    color: var(--nuraly-color-collapse-content-text);
    font-weight: var(--nuraly-font-collapse-content-weight);
    font-size: var(--nuraly-font-collapse-content-size);
    line-height: var(--nuraly-font-collapse-content-line-height);
  }

  /* Size Variants */
  :host([size="small"]) .collapse-header {
    padding: var(--nuraly-spacing-collapse-small-padding);
  }

  :host([size="small"]) .collapse-content-inner {
    padding: var(--nuraly-spacing-collapse-small-content-padding);
  }

  :host([size="medium"]) .collapse-header {
    padding: var(--nuraly-spacing-collapse-medium-padding);
  }

  :host([size="medium"]) .collapse-content-inner {
    padding: var(--nuraly-spacing-collapse-medium-content-padding);
  }

  :host([size="large"]) .collapse-header {
    padding: var(--nuraly-spacing-collapse-large-padding);
  }

  :host([size="large"]) .collapse-content-inner {
    padding: var(--nuraly-spacing-collapse-large-content-padding);
  }

  /* Variant Styles */
  :host([variant="default"]) .collapse-container {
    background-color: var(--nuraly-color-collapse-content-background);
    border: 1px solid var(--nuraly-color-collapse-border);
  }

  :host([variant="bordered"]) .collapse-container {
    background-color: var(--nuraly-color-collapse-bordered-background);
    border: 2px solid var(--nuraly-color-collapse-bordered-border);
  }

  :host([variant="ghost"]) .collapse-container {
    background-color: var(--nuraly-color-collapse-ghost-background);
    border: 1px solid var(--nuraly-color-collapse-ghost-border);
  }

  :host([variant="ghost"]) .collapse-header:hover {
    background-color: var(--nuraly-color-collapse-ghost-hover);
  }

  /* Accordion Mode */
  :host([accordion]) .collapse-section {
    border-bottom: 1px solid var(--nuraly-color-collapse-border);
  }

  /* Shadow Variants */
  :host(:not([variant="ghost"])) .collapse-container {
    box-shadow: var(--nuraly-shadow-collapse);
  }

  :host(:not([variant="ghost"])) .collapse-container:hover {
    box-shadow: var(--nuraly-shadow-collapse-hover);
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .collapse-header,
    .collapse-icon,
    .collapse-content,
    .collapse-section {
      transition: none;
    }
    
    .collapse-icon--expanded {
      transform: none;
    }
  }

  /* High Contrast Mode */
  @media (prefers-contrast: high) {
    .collapse-header {
      border: 2px solid var(--nuraly-color-collapse-border-focus);
    }
    
    .collapse-header:focus-visible {
      outline: 3px solid var(--nuraly-color-collapse-focus-outline);
    }
  }
`;

// Export the styles for the collapse component
