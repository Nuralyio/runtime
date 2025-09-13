import { css } from 'lit';
import { selectVariables } from './select.style.variables.js';

export const styles = css`
  ${selectVariables}

  :host {
    width: fit-content;
    display: block;
    font-family: var(--nuraly-select-font-family, var(--nuraly-select-local-font-family));
    font-size: var(--nuraly-select-font-size, var(--nuraly-select-local-font-size));
    line-height: var(--nuraly-select-line-height, var(--nuraly-select-local-line-height));
    margin: var(--nuraly-select-margin, var(--nuraly-select-local-wrapper-margin));
  }

  /* Host attribute selectors for configuration */
  :host([disabled]) {
    opacity: var(--nuraly-select-disabled-opacity, var(--nuraly-select-local-disabled-opacity));
    pointer-events: none;
  }

  :host([disabled]) .wrapper {
    background-color: var(--nuraly-select-disabled-background, var(--nuraly-select-local-disabled-background));
    border-color: var(--nuraly-select-disabled-border-color, var(--nuraly-select-local-disabled-border-color));
    color: var(--nuraly-select-disabled-text-color, var(--nuraly-select-local-disabled-text-color));
    cursor: not-allowed;
  }

  /* 
   * Light theme styles using data-theme attribute on wrapper element
   * These are explicit light theme overrides when data-theme="light" is applied
   */
  .wrapper[data-theme="light"] {
    /* Select wrapper light theme overrides */
    --nuraly-select-local-background-color: #ffffff;
    --nuraly-select-local-border-color: #d9d9d9;
    --nuraly-select-local-text-color: #262626;
    --nuraly-select-local-placeholder-color: #8c8c8c;
    --nuraly-select-local-hover-border-color: #1677ff;
    --nuraly-select-local-focus-border-color: #1677ff;
    
    /* Dropdown light theme overrides */
    --nuraly-select-local-dropdown-background: #ffffff;
    --nuraly-select-local-dropdown-border-color: #d9d9d9;
    --nuraly-select-local-option-hover-background: #f5f5f5;
    --nuraly-select-local-option-selected-background: #e6f7ff;
    --nuraly-select-local-option-selected-color: #1677ff;
    
    /* Tag styles for multi-select light theme */
    --nuraly-select-local-tag-background: #f0f0f0;
    --nuraly-select-local-tag-color: #262626;
    --nuraly-select-local-tag-close-color: #8c8c8c;
    --nuraly-select-local-tag-close-hover-color: #da1e28;
    
    /* Icon colors for light theme */
    --nuraly-select-local-icon-color: #8c8c8c;
    --nuraly-select-local-icon-hover-color: #1677ff;
  }

  /* 
   * Dark theme styles using data-theme attribute on wrapper element
   * These override the light theme defaults when data-theme="dark" is applied
   */
  .wrapper[data-theme="dark"] {
    /* Select wrapper dark theme overrides */
    --nuraly-select-local-background-color: #262626;
    --nuraly-select-local-border-color: #424242;
    --nuraly-select-local-text-color: #ffffff;
    --nuraly-select-local-placeholder-color: #8c8c8c;
    --nuraly-select-local-hover-border-color: #4096ff;
    --nuraly-select-local-focus-border-color: #4096ff;
    
    /* Dropdown dark theme overrides */
    --nuraly-select-local-dropdown-background: #262626;
    --nuraly-select-local-dropdown-border-color: #424242;
    --nuraly-select-local-option-hover-background: #393939;
    --nuraly-select-local-option-selected-background: #1e3a5f;
    --nuraly-select-local-option-selected-color: #4096ff;
    
    /* Tag styles for multi-select dark theme */
    --nuraly-select-local-tag-background: #393939;
    --nuraly-select-local-tag-color: #ffffff;
    --nuraly-select-local-tag-close-color: #8c8c8c;
    --nuraly-select-local-tag-close-hover-color: #ff4d4f;
    
    /* Icon colors for dark theme */
    --nuraly-select-local-icon-color: #8c8c8c;
    --nuraly-select-local-icon-hover-color: #4096ff;
  }

  /* Size variants */
  :host([size='small']) .wrapper {
    min-height: var(--nuraly-select-small-height, var(--nuraly-select-local-small-height));
    font-size: var(--nuraly-select-small-font-size, var(--nuraly-select-local-small-font-size));
  }

  :host([size='small']) .select-trigger {
    padding: var(--nuraly-select-small-padding, var(--nuraly-select-local-small-padding));
    padding-right: calc(var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size)) + 20px);
  }

  :host([size='medium']) .wrapper {
    min-height: var(--nuraly-select-medium-height, var(--nuraly-select-local-medium-height));
    font-size: var(--nuraly-select-medium-font-size, var(--nuraly-select-local-medium-font-size));
  }

  :host([size='medium']) .select-trigger {
    padding: var(--nuraly-select-medium-padding, var(--nuraly-select-local-medium-padding));
    padding-right: calc(var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size)) + 20px);
  }

  :host([size='large']) .wrapper {
    min-height: var(--nuraly-select-large-height, var(--nuraly-select-local-large-height));
    font-size: var(--nuraly-select-large-font-size, var(--nuraly-select-local-large-font-size));
  }

  :host([size='large']) .select-trigger {
    padding: var(--nuraly-select-large-padding, var(--nuraly-select-local-large-padding));
    padding-right: calc(var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size)) + 20px);
  }

  /* Status variants */
  :host([status='error']) .wrapper {
    border-color: var(--nuraly-select-error-border-color, var(--nuraly-select-local-error-border-color));
  }

  :host([status='warning']) .wrapper {
    border-color: var(--nuraly-select-warning-border-color, var(--nuraly-select-local-warning-border-color));
  }

  :host([status='success']) .wrapper {
    border-color: var(--nuraly-select-success-border-color, var(--nuraly-select-local-success-border-color));
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
    background-color: var(--nuraly-select-background-color, var(--nuraly-select-local-background-color));
    border: var(--nuraly-select-border-width, var(--nuraly-select-local-border-width)) solid 
            var(--nuraly-select-border-color, var(--nuraly-select-local-border-color));
    border-radius: var(--nuraly-select-border-radius, var(--nuraly-select-local-border-radius));
    transition: all var(--nuraly-select-transition-duration, var(--nuraly-select-local-transition-duration)) 
                var(--nuraly-select-transition-timing, var(--nuraly-select-local-transition-timing));
    cursor: pointer;
    outline: none;
    margin: var(--nuraly-select-wrapper-margin, 0);
    min-height: var(--nuraly-select-min-height, var(--nuraly-select-local-min-height));
    /* Ensure dropdown can overflow the wrapper */
    overflow: visible;
  }

  .wrapper:hover:not(:disabled) {
    border-color: var(--nuraly-select-hover-border-color, var(--nuraly-select-local-hover-border-color));
  }

  .wrapper:focus,
  .wrapper:focus-within {
    border-color: var(--nuraly-select-focus-border-color, var(--nuraly-select-local-focus-border-color));
    box-shadow: 0 0 0 2px var(--nuraly-select-focus-border-color, var(--nuraly-select-local-focus-border-color))33;
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
             calc(var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size)) + 20px) 
             var(--nuraly-select-padding-bottom, var(--nuraly-select-local-padding-bottom)) 
             var(--nuraly-select-padding-left, var(--nuraly-select-local-padding-left));
    color: var(--nuraly-select-text-color, var(--nuraly-select-local-text-color));
    font-size: inherit;
    line-height: inherit;
    word-break: break-word;
    min-height: inherit;
    flex-wrap: wrap;
    gap: var(--nuraly-select-tag-margin, var(--nuraly-select-local-tag-margin));
  }

  .select-trigger:empty:before {
    content: attr(data-placeholder);
    color: var(--nuraly-select-placeholder-color, var(--nuraly-select-local-placeholder-color));
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

  .icons-container hy-icon {
    --nuraly-icon-width: var(--nuraly-select-icon-size, var(--nuraly-select-local-icon-size));
    --nuraly-icon-color: var(--nuraly-select-icon-color, var(--nuraly-select-local-icon-color));
    pointer-events: auto;
    cursor: pointer;
    transition: color var(--nuraly-select-transition-duration, var(--nuraly-select-local-transition-duration));
  }

  .icons-container hy-icon:hover {
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
    background-color: var(--nuraly-select-dropdown-background, var(--nuraly-select-local-dropdown-background));
    border: var(--nuraly-select-border-width, var(--nuraly-select-local-border-width)) solid 
            var(--nuraly-select-dropdown-border-color, var(--nuraly-select-local-dropdown-border-color));
    border-radius: var(--nuraly-select-border-radius, var(--nuraly-select-local-border-radius));
    box-shadow: var(--nuraly-select-dropdown-shadow, var(--nuraly-select-local-dropdown-shadow));
    z-index: var(--nuraly-select-dropdown-z-index, var(--nuraly-select-local-dropdown-z-index));
    max-height: var(--nuraly-select-dropdown-max-height, var(--nuraly-select-local-dropdown-max-height));
    overflow-y: auto;
    overflow-x: hidden;
    display: none;
    flex-direction: column;
    animation: dropdown-enter var(--nuraly-select-dropdown-animation-duration, var(--nuraly-select-local-dropdown-animation-duration)) ease-out;
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
    background-color: var(--nuraly-select-dropdown-background, var(--nuraly-select-local-dropdown-background));
    border-bottom: var(--nuraly-select-border-width, var(--nuraly-select-local-border-width)) solid 
                   var(--nuraly-select-dropdown-border-color, var(--nuraly-select-local-dropdown-border-color));
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

  /* Dark theme overrides for search container */
  .wrapper[data-theme="dark"] .search-container {
    background-color: var(--nuraly-select-local-dropdown-background);
    border-bottom-color: var(--nuraly-select-local-dropdown-border-color);
  }

  .wrapper[data-theme="dark"] .search-container .search-input {
    --nuraly-input-background-color: var(--nuraly-select-local-background-color);
    --nuraly-input-border-color: var(--nuraly-select-local-border-color);
    --nuraly-input-text-color: var(--nuraly-select-local-text-color);
    --nuraly-input-placeholder-color: var(--nuraly-select-local-placeholder-color);
  }

  .wrapper[data-theme="dark"] .search-container .search-icon {
    --nuraly-icon-color: var(--nuraly-select-local-icon-color);
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
    padding: 8px 12px;
    color: var(--nuraly-select-text-color, var(--nuraly-select-local-text-color));
    font-size: var(--nuraly-select-option-font-size, var(--nuraly-select-local-option-font-size));
    cursor: pointer;
    transition: background-color var(--nuraly-select-transition-duration, var(--nuraly-select-local-transition-duration));
    position: relative;
  }

  /* First option after search container should have no extra margin */
  .search-container + .option {
    margin-top: 0;
  }

  .option:hover {
    background-color: var(--nuraly-select-option-hover-background, var(--nuraly-select-local-option-hover-background));
  }

  .option.selected {
    background-color: var(--nuraly-select-option-selected-background, var(--nuraly-select-local-option-selected-background));
    color: var(--nuraly-select-option-selected-color, var(--nuraly-select-local-option-selected-color));
  }

  .option.focused {
    background-color: var(--nuraly-select-option-hover-background, var(--nuraly-select-local-option-hover-background));
    outline: 2px solid var(--nuraly-select-focus-border-color, var(--nuraly-select-local-focus-border-color));
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

  /* Dark theme adjustments for no-options */
  :host([theme='dark']) .no-options {
    color: var(--select-no-options-color, #595959);
  }

  :host([theme='dark']) .no-options-icon {
    --nuraly-icon-color: var(--select-no-options-icon-color, #434343);
  }

  :host([theme='dark']) .no-options-text {
    color: var(--select-no-options-color, #595959);
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
