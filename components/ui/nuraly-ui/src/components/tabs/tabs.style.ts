import { css } from 'lit';

/**
 * Tabs component styles for the Hybrid UI Library
 * Using shared CSS variables from /src/shared/themes/
 * 
 * This file contains all the styling for the nr-tabs component with
 * clean CSS variable usage without local fallbacks and proper theme switching support.
 */
export const styles = css`
  :host {
    display: block;
    height: 100%;
    
    /* Force CSS custom property inheritance to ensure theme switching works properly */
    color: var(--nuraly-color-text);
    background-color: var(--nuraly-color-background);
    
    /* Minimal transitions for better performance */
    
  }

  /* When tabs are inside a panel, adjust sizing */
  :host-context(nr-panel) {
    height: 100%;
    min-height: 0;
  }

  /* Ensure tabs container fills available space when in panel */
  nr-panel .tabs-container,
  :host-context(nr-panel) .tabs-container {
    height: 100%;
    min-height: 0;
    flex: 1;
  }

  /* Force re-evaluation of theme-dependent properties on theme change */
  :host([data-theme]) {
    color: inherit;
    background-color: inherit;
  }

  .tabs-container {
    display: flex;
    height: 100%;
    background-color: var(--nuraly-color-background);
    border-radius: var(--nuraly-border-radius-tabs, var(--nuraly-border-radius-medium, 0));
    box-shadow: var(--nuraly-shadow-tabs);
  }

  .tab-labels {
    display: flex;
    background-color: var(--nuraly-color-tabs-header-background);
    border: var(--nuraly-border-tabs-header);
  }

  /* Tab label base styles */
  .tab-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--nuraly-tabs-gap, var(--nuraly-spacing-2));
    position: relative;
    cursor: pointer;
    padding: var(--nuraly-spacing-tabs-padding, var(--nuraly-spacing-3) var(--nuraly-spacing-4));
    border-bottom: var(--nuraly-border-width-tabs-bottom) var(--nuraly-border-style-tabs) transparent;
    background-color: var(--nuraly-color-tabs-label-background);
    color: var(--nuraly-color-tabs-label-text);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-body);
    font-weight: var(--nuraly-font-weight-regular);
    user-select: none;
    white-space: nowrap;
  }

  .tab-label:hover {
    color: var(--nuraly-color-tabs-label-text-hover);
    background-color: var(--nuraly-color-tabs-label-background-hover);
    border-color: var(--nuraly-color-tabs-label-border-hover);
  }

  .tab-label:focus {
    outline: var(--nuraly-focus-outline);
    outline-offset: var(--nuraly-focus-outline-offset);
  }

  .tab-label.active {
    color: var(--nuraly-color-tabs-label-text-active);
    background-color: var(--nuraly-color-tabs-label-background-active);
    border-color: var(--nuraly-color-tabs-label-border-active);
    font-weight: var(--nuraly-font-tabs-weight-active);
  }

  /* Positioning-specific border radius for horizontal tabs */
  .tab-label.first-tab {
    border-radius: var(--nuraly-border-radius-tabs-first);
  }

  .tab-label.middle-tab {
    border-radius: var(--nuraly-border-radius-tabs-middle);
  }

  .tab-label.last-tab {
    border-radius: var(--nuraly-border-radius-tabs-last);
  }

  .tab-label.single-tab {
    border-radius: var(--nuraly-border-radius-tabs-single);
  }

  .tab-label.disabled {
    cursor: not-allowed;
    color: var(--nuraly-color-text-disabled);
    background-color: var(--nuraly-color-background-disabled);
  }
  
  .tab-label.disabled:hover {
    color: var(--nuraly-color-text-disabled);
    background-color: var(--nuraly-color-background-disabled);
    border-color: transparent;
  }

  /* Tab icon styling */
  .tab-icon {
    flex-shrink: 0;
    width: var(--nuraly-tabs-icon-size, 1rem);
    height: var(--nuraly-tabs-icon-size, 1rem);
    color: inherit;
  }

  /* Tab text styling */
  .tab-text {
    flex: 1;
    color: inherit;
    text-align: var(--nuraly-tabs-text-align, center);
  }
  
  .tab-text[contenteditable="true"] {
    cursor: text;
    outline: none;
  }
  
  .tab-text[contenteditable="true"]:focus {
    background-color: var(--nuraly-color-tabs-edit-background);
    border-radius: var(--nuraly-border-radius-small);
    padding: var(--nuraly-spacing-1);
  }

  /* Close/delete icon styling */
  .close-icon {
    flex-shrink: 0;
    width: var(--nuraly-tabs-close-icon-size, 0.875rem);
    height: var(--nuraly-tabs-close-icon-size, 0.875rem);
    color: var(--nuraly-color-tabs-close-icon);
    cursor: pointer;
    padding: var(--nuraly-spacing-1);
    border-radius: var(--nuraly-border-radius-small);
  }

  .close-icon:hover {
    color: var(--nuraly-color-tabs-close-icon-hover);
    background-color: var(--nuraly-color-tabs-close-icon-background-hover);
  }

  .close-icon:active {
    color: var(--nuraly-color-tabs-close-icon-active);
    background-color: var(--nuraly-color-tabs-close-icon-background-active);
  }

  /* Add tab button styling */
  .add-tab-label {
    min-width: auto;
    width: var(--nuraly-tabs-add-button-size, 2.5rem);
    color: var(--nuraly-color-tabs-add-icon);
  }
  
  .add-tab-label:hover {
    color: var(--nuraly-color-tabs-add-icon-hover);
    background-color: var(--nuraly-color-tabs-add-background-hover);
  }

  .add-tab-icon {
    width: var(--nuraly-tabs-add-icon-size, 1rem);
    height: var(--nuraly-tabs-add-icon-size, 1rem);
    color: inherit;
  }

  /* Tab content area */
  .tab-content {
    flex: 1;
    padding: var(--nuraly-spacing-tabs-content-padding, var(--nuraly-spacing-4));
    background-color: var(--nuraly-color-tabs-content-background);
    border-top: var(--nuraly-border-width-tabs-content-top) var(--nuraly-border-style-tabs-content) var(--nuraly-border-color-tabs-content);
    border-right: var(--nuraly-border-width-tabs-content-right) var(--nuraly-border-style-tabs-content) var(--nuraly-border-color-tabs-content);
    border-bottom: var(--nuraly-border-width-tabs-content-bottom) var(--nuraly-border-style-tabs-content) var(--nuraly-border-color-tabs-content);
    border-left: var(--nuraly-border-width-tabs-content-left) var(--nuraly-border-style-tabs-content) var(--nuraly-border-color-tabs-content);
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 100vh;
  }

  /* Orientation specific styles */
  .vertical-align {
    flex-direction: row;
    
    .tab-labels {
      flex-direction: column;
      min-width: var(--nuraly-tabs-vertical-width, 12rem);
    }
    
    .tab-content {
      border-top: none;
      border-left: var(--nuraly-border-width-thin, 1px) solid var(--nuraly-color-border);
    }
    
    .tab-label {
      border-bottom: var(--nuraly-border-tabs-label);
      border-right: var(--nuraly-border-width-tabs-right) var(--nuraly-border-style-tabs) transparent;
    }
  }

  .vertical-align .tab-label:hover,
  .vertical-align .tab-label.active {
    border-right-color: var(--nuraly-color-tabs-label-border-active);
  }

  .vertical-align.right-align {
    flex-direction: row-reverse;
  }
  
  .vertical-align.right-align .tab-content {
    border-left: none;
    border-right: var(--nuraly-border-width-thin, 1px) solid var(--nuraly-color-border);
  }
  
  .vertical-align.right-align .tab-label {
    border-right: var(--nuraly-border-tabs-label);
    border-left: var(--nuraly-border-width-tabs-left) var(--nuraly-border-style-tabs) transparent;
  }
  
  .vertical-align.right-align .tab-label:hover,
  .vertical-align.right-align .tab-label.active {
    border-left-color: var(--nuraly-color-tabs-label-border-active);
    border-right-color: transparent;
  }

  /* Alignment specific styles */
  .right-align > .tab-labels {
    flex-direction: row-reverse;
    align-self: flex-end;
  }

  .center-align > .tab-labels {
    align-self: center;
  }

  /* Stretch alignment - tabs fill full width with equal sizes */
  .stretch-align > .tab-labels {
    width: 100%;
  }

  .stretch-align .tab-label {
    flex: 1;
    min-width: 0; /* Allow flex items to shrink below their content size */
  }

  /* Ensure add-tab button doesn't stretch when using stretch alignment */
  .stretch-align .add-tab-label {
    flex: 0 0 auto;
    width: var(--nuraly-tabs-add-button-size, 2.5rem);
  }

  .horizontal-align {
    flex-direction: column;
  }

  /* Size variations */
  .tabs-container[data-size="small"] {
    .tab-label {
      padding: var(--nuraly-spacing-tabs-padding-small);
      font-size: var(--nuraly-font-size-small);
      gap: var(--nuraly-tabs-gap-small, var(--nuraly-spacing-1));
    }
    
    .tab-text {
      font-size: var(--nuraly-font-size-small);
      text-align: var(--nuraly-tabs-text-align, center);
    }
    
    .tab-icon {
      width: calc(var(--nuraly-tabs-icon-size, 1rem) * 0.875);
      height: calc(var(--nuraly-tabs-icon-size, 1rem) * 0.875);
    }
    
    .close-icon {
      width: calc(var(--nuraly-tabs-close-icon-size, 0.875rem) * 0.875);
      height: calc(var(--nuraly-tabs-close-icon-size, 0.875rem) * 0.875);
    }
    
    .tab-content {
      padding: var(--nuraly-spacing-tabs-content-padding-small, var(--nuraly-spacing-3));
    }
  }

  .tabs-container[data-size="large"] {
    .tab-label {
      padding: var(--nuraly-spacing-4) var(--nuraly-spacing-6);
      font-size: var(--nuraly-font-size-large);
      gap: var(--nuraly-tabs-gap-large, var(--nuraly-spacing-3));
    }
    
    .tab-text {
      font-size: var(--nuraly-font-size-large);
      text-align: var(--nuraly-tabs-text-align, center);
    }
    
    .tab-icon {
      width: calc(var(--nuraly-tabs-icon-size, 1rem) * 1.25);
      height: calc(var(--nuraly-tabs-icon-size, 1rem) * 1.25);
    }
    
    .close-icon {
      width: calc(var(--nuraly-tabs-close-icon-size, 0.875rem) * 1.25);
      height: calc(var(--nuraly-tabs-close-icon-size, 0.875rem) * 1.25);
    }
    
    .tab-content {
      padding: var(--nuraly-spacing-tabs-content-padding-large, var(--nuraly-spacing-6));
    }
  }

  /* Type variations */
  
  /* Default variant - uses standard theme variables */
  .tabs-container[data-type="default"] .tab-labels {
    gap: var(--nuraly-tabs-labels-gap, var(--nuraly-spacing-2));
  }
  
  .tabs-container[data-type="default"] .tab-label {
    /* Use theme variables for proper visibility */
    background-color: var(--nuraly-color-tabs-label-background);
    border-top: var(--nuraly-border-width-tabs-top) var(--nuraly-border-style-tabs) var(--nuraly-border-color-tabs);
    border-right: var(--nuraly-border-width-tabs-right) var(--nuraly-border-style-tabs) var(--nuraly-border-color-tabs);
    border-bottom: var(--nuraly-border-width-tabs-bottom) var(--nuraly-border-style-tabs) var(--nuraly-border-color-tabs);
    border-left: var(--nuraly-border-width-tabs-left) var(--nuraly-border-style-tabs) var(--nuraly-border-color-tabs);
    color: var(--nuraly-color-tabs-label-text);
    border-radius: var(--nuraly-border-radius-tabs-first);
  }
  
  .tabs-container[data-type="default"] .tab-label:hover {
    background-color: var(--nuraly-color-tabs-label-background-hover);
    color: var(--nuraly-color-tabs-label-text-hover);
    border-top-width: var(--nuraly-border-width-tabs-top-hover);
    border-right-width: var(--nuraly-border-width-tabs-right-hover);
    border-bottom-width: var(--nuraly-border-width-tabs-bottom-hover);
    border-left-width: var(--nuraly-border-width-tabs-left-hover);
  }
  
  .tabs-container[data-type="default"] .tab-label.active {
    background-color: var(--nuraly-color-tabs-label-background-active);
    color: var(--nuraly-color-tabs-label-text-active);
    border-top-width: var(--nuraly-border-width-tabs-top-active);
    border-right-width: var(--nuraly-border-width-tabs-right-active);
    border-bottom-width: var(--nuraly-border-width-tabs-bottom-active);
    border-left-width: var(--nuraly-border-width-tabs-left-active);
    border-color: var(--nuraly-color-tabs-label-border-active);
    font-weight: var(--nuraly-font-tabs-weight-active);
  }
  
 
  
  /* Line variant - underline on active tab */
  .tabs-container[data-type="line"] .tab-labels {
    gap: var(--nuraly-tabs-gap, 1rem);
    border-bottom: var(--nuraly-tabs-indicator-height, 1px) solid var(--nuraly-tabs-border-color, var(--nuraly-color-border, #e0e0e0));
  }
  
  .tabs-container[data-type="line"] .tab-label {
    padding: var(--nuraly-tabs-padding, 0.5rem 0);
    border: none;
    border-bottom: var(--nuraly-tabs-indicator-height, 2px) solid transparent;
    border-radius: 0;
    background-color: transparent;
    font-weight: var(--nuraly-tabs-font-weight, 400);
    font-size: var(--nuraly-tabs-font-size, 1rem);
    margin-bottom: calc(-1 * var(--nuraly-tabs-indicator-height, 1px));
  }
  
  .tabs-container[data-type="line"] .tab-label:hover {
    background-color: transparent;
    border-bottom-color: var(--nuraly-tabs-item-hover-color, var(--nuraly-tabs-active-indicator-color, currentColor));
  }
  
  .tabs-container[data-type="line"] .tab-label.active {
    background-color: transparent;
    border-bottom-color: var(--nuraly-tabs-active-indicator-color, var(--nuraly-tabs-active-border-color, currentColor));
    font-weight: var(--nuraly-tabs-active-font-weight, 700);
    color: var(--nuraly-tabs-active-color, inherit);
  }
  
  .tabs-container[data-type="line"] .tab-content {
    border-top: none;
  }
  
  .tabs-container[data-type="card"] .tab-label {
    border: var(--nuraly-border-width-thin, 1px) solid var(--nuraly-color-border);
    border-radius: var(--nuraly-border-radius-medium);
    margin: 0 var(--nuraly-spacing-1);
  }
  
  .tabs-container[data-type="card"] .tab-label.active {
    background-color: var(--nuraly-color-primary);
    color: var(--nuraly-color-primary-text);
    border-color: var(--nuraly-color-primary);
  }

  .tabs-container[data-type="bordered"] {
    border: var(--nuraly-border-width-thin, 1px) solid var(--nuraly-color-border);
    border-radius: var(--nuraly-border-radius-medium);
  }

  /* Drag and drop states */
  .tab-label.dragging-start {
    opacity: 0.7;
    border: var(--nuraly-border-width-thin, 1px) dashed var(--nuraly-color-border-strong);
    background-color: var(--nuraly-color-background-hover);
  }

  .tab-label.dragging {
    border: var(--nuraly-border-width-thin, 1px) dashed var(--nuraly-color-primary);
    background-color: var(--nuraly-color-primary-background);
    opacity: 0.8;
  }

  /* Minimal animation support for better performance */
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(var(--nuraly-spacing-2));
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }

  /* Focus management for keyboard navigation */
  .tab-label[tabindex="0"] {
    position: relative;
  }

  .tab-label:focus-visible {
    z-index: 1;
  }
`;