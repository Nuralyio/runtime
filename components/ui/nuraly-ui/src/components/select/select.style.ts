import { css } from 'lit';

export const styles = css`
  :host {
    /* Layout and sizing */
    --nuraly-select-local-width: 300px;
    --nuraly-select-local-min-height: 40px;
    --nuraly-select-local-padding-top: 8px;
    --nuraly-select-local-padding-bottom: 8px;
    --nuraly-select-local-padding-left: 12px;
    --nuraly-select-local-padding-right: 12px;
    --nuraly-select-local-wrapper-margin: 0;
    --nuraly-select-local-border-radius: 6px;
    --nuraly-select-local-border-width: 1px;
    
    /* Dropdown settings */
    --nuraly-select-local-dropdown-z-index: 9999;
    --nuraly-select-local-dropdown-max-height: 200px;
    --nuraly-select-local-placeholder-font-size: 14px;
    --nuraly-select-local-option-font-size: 14px;
    
    /* Sizes */
    --nuraly-select-local-medium-height: 40px;
    --nuraly-select-local-medium-font-size: 14px;
    --nuraly-select-local-medium-padding: 8px 12px;
    --nuraly-select-local-small-font-size: 12px;
    
    /* Animation and transitions */
    --nuraly-select-local-dropdown-animation-duration: 0.15s;
    
    /* Multi-select specific */
    --nuraly-select-local-tag-border-radius: 4px;
    --nuraly-select-local-tag-padding: 2px 6px;
    --nuraly-select-local-tag-margin: 2px;
    
    /* Validation message */
    --nuraly-select-local-message-font-size: 12px;
    --nuraly-select-local-message-margin-top: 4px;
  }

  :host {
    width: fit-content;
    display: block;
    font-family: var(--nuraly-select-font-family, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif);
    font-size: var(--nuraly-select-font-size, 14px);
    line-height: var(--nuraly-select-line-height, 1.5);
    margin: var(--nuraly-select-margin, var(--nuraly-select-local-wrapper-margin));
  }

  /* Host attribute selectors for configuration */
  :host([disabled]) {
    opacity: var(--nuraly-select-disabled-opacity, 0.5);
    pointer-events: none;
  }

  :host([disabled]) .wrapper {
    background-color: var(--nuraly-select-disabled-background, #f9fafb);
    border-color: var(--nuraly-select-disabled-border-color, #d9d9d9);
    color: var(--nuraly-select-disabled-text-color, #8c8c8c);
    cursor: not-allowed;
  }

  /* Size variants */
  :host([size='small']) .wrapper {
    min-height: var(--nuraly-select-small-height, 32px);
    font-size: var(--nuraly-select-small-font-size, var(--nuraly-select-local-small-font-size));
  }

  :host([size='small']) .select-trigger {
    padding: var(--nuraly-select-small-padding, 4px 8px);
    padding-right: calc(var(--nuraly-select-icon-size, 16px) + 20px);
  }

  :host([size='medium']) .wrapper {
    min-height: var(--nuraly-select-medium-height, var(--nuraly-select-local-medium-height));
    font-size: var(--nuraly-select-medium-font-size, var(--nuraly-select-local-medium-font-size));
  }

  :host([size='medium']) .select-trigger {
    padding: var(--nuraly-select-medium-padding, var(--nuraly-select-local-medium-padding));
    padding-right: calc(var(--nuraly-select-icon-size, 16px) + 20px);
  }

  :host([size='large']) .wrapper {
    min-height: var(--nuraly-select-large-height, 48px);
    font-size: var(--nuraly-select-large-font-size, 16px);
  }

  :host([size='large']) .select-trigger {
    padding: var(--nuraly-select-large-padding, 12px 16px);
    padding-right: calc(var(--nuraly-select-icon-size, 16px) + 20px);
  }

  /* Status variants */
  :host([status='error']) .wrapper {
    border-color: var(--nuraly-select-error-border-color, #ef4444);
  }

  :host([status='warning']) .wrapper {
    border-color: var(--nuraly-select-warning-border-color, #f59e0b);
  }

  :host([status='success']) .wrapper {
    border-color: var(--nuraly-select-success-border-color, #10b981);
  }

  /* Type variants */
  :host([type='inline']) {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  :host([type='inline']) .wrapper {
    flex: 1;
  }

  /* Show dropdown */
  :host([show]) .options {
    display: flex !important;
  }

  /* Main wrapper container */
  .wrapper {
    position: relative;
    width: var(--nuraly-select-width, var(--nuraly-select-local-width));
    background-color: var(--nuraly-select-background-color, #ffffff);
    border: var(--nuraly-select-border-width, var(--nuraly-select-local-border-width)) solid 
            var(--nuraly-select-border-color, #d9d9d9);
    border-radius: var(--nuraly-select-border-radius, var(--nuraly-select-local-border-radius));
    transition: all var(--nuraly-select-transition-duration, 0.2s) 
                var(--nuraly-select-transition-timing, ease-in-out);
    cursor: pointer;
    outline: none;
    margin: var(--nuraly-select-wrapper-margin, 0);
    min-height: var(--nuraly-select-min-height, var(--nuraly-select-local-min-height));
    /* Ensure dropdown can overflow the wrapper */
    overflow: visible;
  }

  .wrapper:hover:not(:disabled) {
    border-color: var(--nuraly-select-border-hover, #7c3aed);
  }

  .wrapper:focus,
  .wrapper:focus-within {
    border-color: var(--nuraly-select-border-focus, #7c3aed);
    box-shadow: 0 0 0 2px var(--nuraly-select-focus-outline, rgba(124, 58, 237, 0.2));
  }

  /* Select container */
  .select {
    display: flex;
    flex-direction: column;
  }

  /* Select trigger (main display area) */
  .select-trigger {
    display: flex;
    align-items: center;
    padding: var(--nuraly-select-padding-top, var(--nuraly-select-local-padding-top)) 
             calc(var(--nuraly-select-icon-size, 16px) + 20px) 
             var(--nuraly-select-padding-bottom, var(--nuraly-select-local-padding-bottom)) 
             var(--nuraly-select-padding-left, var(--nuraly-select-local-padding-left));
    color: var(--nuraly-select-text-color, #262626);
    font-size: inherit;
    line-height: inherit;
    word-break: break-word;
    min-height: inherit;
    flex-wrap: wrap;
    gap: var(--nuraly-select-tag-margin, var(--nuraly-select-local-tag-margin));
  }

  .select-trigger:empty:before {
    content: attr(data-placeholder);
    color: var(--nuraly-select-placeholder-color, #8c8c8c);
    font-size: var(--nuraly-select-placeholder-font-size, var(--nuraly-select-local-placeholder-font-size));
  }

  /* Multi-select tags */
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background-color: var(--nuraly-select-tag-background, var(--nuraly-select-local-tag-background));
    color: var(--nuraly-select-tag-color, var(--nuraly-select-local-tag-color));
    padding: var(--nuraly-select-tag-padding, var(--nuraly-select-local-tag-padding));
    border-radius: var(--nuraly-select-tag-border-radius, var(--nuraly-select-local-tag-border-radius));
    font-size: calc(var(--nuraly-select-font-size, var(--nuraly-select-local-font-size)) - 1px);
    max-width: 100%;
  }

  .tag-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tag-close {
    color: var(--nuraly-select-tag-close-color, var(--nuraly-select-local-tag-close-color));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size));
    height: var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size));
    border-radius: 50%;
    transition: color var(--nuraly-select-transition-duration, var(--nuraly-select-local-transition-duration));
  }

  .tag-close:hover {
    color: var(--nuraly-select-tag-close-hover-color, var(--nuraly-select-local-tag-close-hover-color));
  }

  /* Icons container */
  .icons-container {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 4px;
    pointer-events: none;
  }

  .icons-container nr-icon {
    --nuraly-icon-width: var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size));
    --nuraly-icon-color: var(--nuraly-select-icon-color, var(--nuraly-select-local-icon-color));
    pointer-events: auto;
    cursor: pointer;
    transition: color var(--nuraly-select-transition-duration, var(--nuraly-select-local-transition-duration));
  }

  .icons-container nr-icon:hover {
    --nuraly-icon-color: var(--nuraly-select-icon-hover-color, var(--nuraly-select-local-icon-hover-color));
  }

  .arrow-icon {
    --nuraly-icon-width: var(--nuraly-select-arrow-icon-size, var(--nuraly-select-local-arrow-icon-size));
    transition: transform var(--nuraly-select-transition-duration, var(--nuraly-select-local-transition-duration));
    pointer-events: none !important;
  }

  :host([show]) .arrow-icon {
    transform: rotate(180deg);
  }

  /* Dropdown options */
  .options {
    /* Default positioning - will be overridden by controller when opened */
    position: absolute;
    top: 100%;
    margin-top: 1px;
    left: 0;
    right: 0;
    background-color: var(--nuraly-select-dropdown-background, #ffffff);
    border: var(--nuraly-select-dropdown-border-width, var(--nuraly-select-border-width, 1px)) solid 
            var(--nuraly-select-dropdown-border-color, #d9d9d9);
    border-radius: var(--nuraly-select-dropdown-border-radius, var(--nuraly-select-border-radius, 6px));
    box-shadow: var(--nuraly-select-dropdown-shadow, 0 6px 16px 0 rgba(0, 0, 0, 0.08));
    z-index: var(--nuraly-select-dropdown-z-index, 9999);
    max-height: var(--nuraly-select-dropdown-max-height, 200px);
    overflow-y: auto;
    overflow-x: hidden;
    display: none;
    flex-direction: column;
    animation: dropdown-enter var(--nuraly-select-dropdown-animation-duration, 0.15s) ease-out;
    /* Ensure proper containment and exact wrapper width */
    box-sizing: border-box;
    width: 100%;
    /* Create new stacking context to prevent layering issues */
    isolation: isolate;
    /* Ensure solid background to prevent visual bleed-through */
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    /* Force above other elements */
    transform: translateZ(0);
  }

  .options.placement-top {
    top: auto;
    bottom: 100%;
    margin-bottom: 1px;
    margin-top: 0;
    animation: dropdown-enter-top var(--nuraly-select-dropdown-animation-duration, var(--nuraly-select-local-dropdown-animation-duration)) ease-out;
  }

  @keyframes dropdown-enter {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes dropdown-enter-top {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Search container - sticky at top of dropdown */
  .search-container {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: var(--nuraly-select-dropdown-background, #ffffff);
    border-bottom: var(--nuraly-select-border-width, 1px) solid 
                   var(--nuraly-select-dropdown-border-color, #d9d9d9);
    padding: 8px;
    margin: 0;
    /* Ensure it stays above options during scroll */
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    /* Ensure proper stacking and smooth scrolling */
    will-change: transform;
    transform: translateZ(0);
  }

  /* Search input styling */
  .search-container .search-input {
    width: 100%;
    --nuraly-input-border-radius: var(--nuraly-select-border-radius, var(--nuraly-select-local-border-radius));
    --nuraly-input-background-color: var(--nuraly-select-background-color, var(--nuraly-select-local-background-color));
    --nuraly-input-border-color: var(--nuraly-select-border-color, var(--nuraly-select-local-border-color));
    --nuraly-input-text-color: var(--nuraly-select-text-color, var(--nuraly-select-local-text-color));
    --nuraly-input-placeholder-color: var(--nuraly-select-placeholder-color, var(--nuraly-select-local-placeholder-color));
  }

  /* Search icon in the search input */
  .search-container .search-icon {
    --nuraly-icon-color: var(--nuraly-select-icon-color, var(--nuraly-select-local-icon-color));
  }

  /* Options list container - ensure proper scroll behavior with sticky search */
  .options:has(.search-container) {
    /* Add small padding-top when search is present to ensure proper separation */
    padding-top: 0;
  }

  /* Option items */
  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: var(--nuraly-select-option-padding, 8px 12px);
    min-height: var(--nuraly-select-option-min-height, auto);
    color: var(--nuraly-select-option-text-color, var(--nuraly-select-text-color, #262626));
    font-size: var(--nuraly-select-option-font-size, 14px);
    cursor: pointer;
    transition: background-color var(--nuraly-select-transition-duration, 0.2s);
    position: relative;
  }

  /* First option after search container should have no extra margin */
  .search-container + .option {
    margin-top: 0;
  }

  .option:hover {
    background-color: var(--nuraly-select-option-hover-background, #f5f5f5);
  }

  .option.selected {
    background-color: var(--nuraly-select-option-selected-background, #e0e0e0);
    color: var(--nuraly-select-option-selected-color, #7c3aed);
  }

  .option.focused {
    background-color: var(--nuraly-select-option-hover-background, #f5f5f5);
    outline: 2px solid var(--nuraly-select-border-focus, #7c3aed);
    outline-offset: -2px;
  }

  .option.disabled {
    opacity: var(--nuraly-select-disabled-opacity, var(--nuraly-select-local-disabled-opacity));
    cursor: not-allowed;
  }

  .option-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .option-icon {
    --nuraly-icon-width: var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size));
    --nuraly-icon-color: currentColor;
  }

  .option-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .option-description {
    font-size: calc(var(--nuraly-select-option-font-size, var(--nuraly-select-local-option-font-size)) - 1px);
    opacity: 0.7;
    margin-top: 2px;
  }

  .check-icon {
    --nuraly-icon-width: var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size));
    --nuraly-icon-color: var(--nuraly-select-option-selected-color, var(--nuraly-select-local-option-selected-color));
  }

  .no-options {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--select-no-options-padding, 24px 16px);
    color: var(--select-no-options-color, #8c8c8c);
    font-size: var(--nuraly-select-option-font-size, var(--nuraly-select-local-option-font-size));
    cursor: default;
    user-select: none;
  }

  .no-options-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--select-no-options-gap, 8px);
    text-align: center;
  }

  .no-options-icon {
    --nuraly-icon-width: 24px;
    --nuraly-icon-color: var(--select-no-options-icon-color, #d9d9d9);
    opacity: 0.8;
  }

  .no-options-text {
    font-size: var(--nuraly-select-option-font-size, var(--nuraly-select-local-option-font-size));
    color: var(--select-no-options-color, #8c8c8c);
    line-height: 1.4;
  }

  /* Validation message */
  .validation-message {
    display: block;
    margin-top: var(--nuraly-select-message-margin-top, var(--nuraly-select-local-message-margin-top));
    font-size: var(--nuraly-select-message-font-size, var(--nuraly-select-local-message-font-size));
    color: var(--nuraly-select-error-message-color, var(--nuraly-select-local-error-message-color));
  }

  .validation-message.warning {
    color: var(--nuraly-select-warning-message-color, var(--nuraly-select-local-warning-message-color));
  }

  .validation-message.success {
    color: var(--nuraly-select-success-message-color, var(--nuraly-select-local-success-message-color));
  }

  /* Slotted content styles */
  ::slotted([slot='label']) {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: var(--nuraly-select-text-color, var(--nuraly-select-local-text-color));
  }

  ::slotted([slot='helper-text']) {
    display: block;
    margin-top: var(--nuraly-select-message-margin-top, var(--nuraly-select-local-message-margin-top));
    font-size: var(--nuraly-select-message-font-size, var(--nuraly-select-local-message-font-size));
    color: var(--nuraly-select-placeholder-color, var(--nuraly-select-local-placeholder-color));
  }

  /* Accessibility improvements */
  @media (prefers-reduced-motion: reduce) {
    .options,
    .wrapper,
    .tag-close,
    .arrow-icon,
    .option {
      transition: none;
      animation: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .wrapper {
      border-width: 2px;
    }
    
    .wrapper:focus,
    .wrapper:focus-within {
      outline: 3px solid;
    }
  }
`;
