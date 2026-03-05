import { css } from 'lit';

export const styles = css`
  :host {
    width: fit-content;
    display: block;
    font-family: var(--nuraly-select-font-family, var(--nuraly-font-family));
    font-size: var(--nuraly-select-font-size, var(--nuraly-font-size-sm));
    line-height: var(--nuraly-select-line-height, var(--nuraly-line-height-normal));
    margin: var(--nuraly-select-margin, 0);
  }

  /* Host attribute selectors for configuration */
  :host([disabled]) {
    opacity: var(--nuraly-select-disabled-opacity, 0.5);
    pointer-events: none;
  }

  :host([disabled]) .wrapper {
    background-color: var(--nuraly-select-disabled-background, var(--nuraly-color-background-disabled));
    border-color: var(--nuraly-select-disabled-border-color, var(--nuraly-color-border));
    color: var(--nuraly-select-disabled-text-color, var(--nuraly-color-text-disabled));
    cursor: not-allowed;
  }

  /* Size variants */
  :host([size='small']) .wrapper {
    height: var(--nuraly-select-small-height, var(--nuraly-size-sm));
    min-height: var(--nuraly-select-small-height, var(--nuraly-size-sm));
    font-size: var(--nuraly-select-small-font-size, var(--nuraly-font-size-xs));
  }

  :host([size='small']) .select-trigger {
    padding: var(--nuraly-select-small-padding, var(--nuraly-spacing-1) var(--nuraly-spacing-2));
    padding-right: calc(var(--nuraly-select-small-icon-size, var(--nuraly-font-size-sm)) + var(--nuraly-spacing-5));
  }

  :host([size='small']) .icons-container nr-icon {
    --nuraly-icon-width: var(--nuraly-select-small-icon-size, var(--nuraly-font-size-sm));
  }

  :host([size='small']) .option {
    padding: var(--nuraly-select-small-padding, var(--nuraly-spacing-1) var(--nuraly-spacing-2));
    font-size: var(--nuraly-select-small-font-size, var(--nuraly-font-size-xs));
    min-height: var(--nuraly-select-small-height, var(--nuraly-size-sm));
  }

  :host([size='small']) .option-icon,
  :host([size='small']) .option nr-icon {
    --nuraly-icon-width: var(--nuraly-select-small-icon-size, var(--nuraly-font-size-sm));
  }

  :host([size='medium']) .wrapper {
    min-height: var(--nuraly-select-medium-height, var(--nuraly-size-lg));
    font-size: var(--nuraly-select-medium-font-size, var(--nuraly-font-size-sm));
  }

  :host([size='medium']) .select-trigger {
    padding: var(--nuraly-select-medium-padding, var(--nuraly-spacing-2) var(--nuraly-spacing-3));
    padding-right: calc(var(--nuraly-select-medium-icon-size, var(--nuraly-font-size-base)) + var(--nuraly-spacing-5));
  }

  :host([size='medium']) .icons-container nr-icon {
    --nuraly-icon-width: var(--nuraly-select-medium-icon-size, var(--nuraly-font-size-base));
  }

  :host([size='medium']) .option {
    padding: var(--nuraly-select-medium-padding, var(--nuraly-spacing-2) var(--nuraly-spacing-3));
    font-size: var(--nuraly-select-medium-font-size, var(--nuraly-font-size-sm));
    min-height: var(--nuraly-select-medium-height, var(--nuraly-size-lg));
  }

  :host([size='medium']) .option-icon,
  :host([size='medium']) .option nr-icon {
    --nuraly-icon-width: var(--nuraly-select-medium-icon-size, var(--nuraly-font-size-base));
  }

  :host([size='large']) .wrapper {
    min-height: var(--nuraly-select-large-height, var(--nuraly-size-xl));
    font-size: var(--nuraly-select-large-font-size, var(--nuraly-font-size-lg));
  }

  :host([size='large']) .select-trigger {
    padding: var(--nuraly-select-large-padding, var(--nuraly-spacing-3) var(--nuraly-spacing-4));
    padding-right: calc(var(--nuraly-select-large-icon-size, var(--nuraly-font-size-xl)) + var(--nuraly-spacing-5));
  }

  :host([size='large']) .icons-container nr-icon {
    --nuraly-icon-width: var(--nuraly-select-large-icon-size, var(--nuraly-font-size-xl));
  }

  :host([size='large']) .option {
    padding: var(--nuraly-select-large-padding, var(--nuraly-spacing-3) var(--nuraly-spacing-4));
    font-size: var(--nuraly-select-large-font-size, var(--nuraly-font-size-lg));
    min-height: var(--nuraly-select-large-height, var(--nuraly-size-xl));
  }

  :host([size='large']) .option-icon,
  :host([size='large']) .option nr-icon {
    --nuraly-icon-width: var(--nuraly-select-large-icon-size, var(--nuraly-font-size-xl));
  }

  /* Status variants */
  :host([status='error']) .wrapper {
    border-color: var(--nuraly-select-error-border-color, var(--nuraly-color-danger));
  }

  :host([status='warning']) .wrapper {
    border-color: var(--nuraly-select-warning-border-color, var(--nuraly-color-warning));
  }

  :host([status='success']) .wrapper {
    border-color: var(--nuraly-select-success-border-color, var(--nuraly-color-success));
  }

  /* Type variants */
  :host([type='inline']) {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2);
  }

  :host([type='inline']) .wrapper {
    flex: 1;
  }

  /* Block (full width) */
  :host([block]) {
    width: 100%;
  }

  :host([block]) .wrapper {
    width: 100%;
  }

  /* Show dropdown */
  :host([show]) .options {
    display: flex !important;
  }

  /* Main wrapper container */
  .wrapper {
    position: relative;
    width: var(--nuraly-select-width, fit-content);
    background-color: var(--nuraly-select-background, var(--nuraly-color-background-panel));
    border: var(--nuraly-select-border-width, var(--nuraly-border-width-1)) solid
            var(--nuraly-select-border-color, var(--nuraly-color-border));
    border-radius: var(--nuraly-select-border-radius, var(--nuraly-border-radius-md));
    transition: all var(--nuraly-select-transition-duration, var(--nuraly-transition-fast))
                var(--nuraly-select-transition-timing, ease-in-out);
    cursor: pointer;
    outline: none;
    margin: var(--nuraly-select-wrapper-margin, 0);
    min-height: var(--nuraly-select-min-height, var(--nuraly-size-lg));
    box-sizing: border-box;
    display: flex;
    align-items: center;
    /* Ensure dropdown can overflow the wrapper */
    overflow: visible;
  }

  .wrapper:hover:not(:disabled) {
    border-color: var(--nuraly-select-border-hover, var(--nuraly-color-primary));
  }

  .wrapper:focus,
  .wrapper:focus-within {
    border-color: var(--nuraly-select-border-focus, var(--nuraly-color-primary));
    box-shadow: var(--nuraly-focus-ring);
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
    padding: var(--nuraly-select-padding-top, var(--nuraly-spacing-2))
             calc(var(--nuraly-select-icon-size, var(--nuraly-font-size-base)) + var(--nuraly-spacing-5))
             var(--nuraly-select-padding-bottom, var(--nuraly-spacing-2))
             var(--nuraly-select-padding-left, var(--nuraly-spacing-3));
    color: var(--nuraly-select-color, var(--nuraly-color-text));
    font-size: inherit;
    line-height: inherit;
    word-break: break-word;
    flex: 1;
    min-height: 0;
    flex-wrap: wrap;
    gap: var(--nuraly-select-tag-margin, var(--nuraly-spacing-1));
    box-sizing: border-box;
  }

  .select-trigger:empty:before {
    content: attr(data-placeholder);
    color: var(--nuraly-select-placeholder-color, var(--nuraly-color-text-secondary));
    font-size: var(--nuraly-select-placeholder-font-size, var(--nuraly-font-size-sm));
  }

  /* Multi-select tags */
  .tag {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-spacing-1);
    background-color: var(--nuraly-select-tag-background, var(--nuraly-color-background-active));
    color: var(--nuraly-select-tag-color, var(--nuraly-color-text));
    padding: var(--nuraly-select-tag-padding, var(--nuraly-spacing-1) var(--nuraly-spacing-2));
    border-radius: var(--nuraly-select-tag-border-radius, var(--nuraly-border-radius-xs));
    font-size: calc(var(--nuraly-select-font-size, var(--nuraly-font-size-sm)) - 1px);
    max-width: 100%;
  }

  .tag-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tag-close {
    color: var(--nuraly-select-tag-close-color, var(--nuraly-color-text-secondary));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--nuraly-select-icon-size, var(--nuraly-font-size-base));
    height: var(--nuraly-select-icon-size, var(--nuraly-font-size-base));
    border-radius: var(--nuraly-border-radius-full);
    transition: color var(--nuraly-select-transition-duration, var(--nuraly-transition-fast));
  }

  .tag-close:hover {
    color: var(--nuraly-select-tag-close-hover-color, var(--nuraly-color-text));
  }

  /* Icons container */
  .icons-container {
    position: absolute;
    top: 50%;
    right: var(--nuraly-spacing-3);
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-1);
    pointer-events: none;
  }

  .icons-container nr-icon {
    --nuraly-icon-width: var(--nuraly-select-icon-size, var(--nuraly-font-size-base));
    --nuraly-icon-color: var(--nuraly-color-select-icon, var(--nuraly-color-text-secondary));
    pointer-events: auto;
    cursor: pointer;
    transition: color var(--nuraly-select-transition-duration, var(--nuraly-transition-fast));
  }

  .icons-container nr-icon:hover {
    --nuraly-icon-color: var(--nuraly-color-select-icon-hover, var(--nuraly-color-text));
  }

  .arrow-icon {
    --nuraly-icon-width: var(--nuraly-select-arrow-icon-size, var(--nuraly-font-size-base));
    transition: transform var(--nuraly-select-transition-duration, var(--nuraly-transition-fast));
    pointer-events: none !important;
  }

  :host([show]) .arrow-icon {
    transform: rotate(180deg);
  }

  /* Dropdown options */
  .options {
    /* Fixed positioning to escape overflow containers */
    position: fixed;
    /* top/left will be set by controller */
    background-color: var(--nuraly-select-dropdown-background, var(--nuraly-color-background-panel));
    border: var(--nuraly-select-dropdown-border-width, var(--nuraly-select-border-width, var(--nuraly-border-width-1))) solid
            var(--nuraly-select-dropdown-border-color, var(--nuraly-color-border));
    border-radius: var(--nuraly-select-dropdown-border-radius, var(--nuraly-select-border-radius, var(--nuraly-border-radius-md)));
    box-shadow: var(--nuraly-select-dropdown-shadow, var(--nuraly-shadow-lg));
    z-index: var(--nuraly-select-dropdown-z-index, var(--nuraly-z-dropdown));
    max-height: var(--nuraly-select-dropdown-max-height, auto);
    overflow-y: auto;
    overflow-x: hidden;
    display: none;
    flex-direction: column;
    animation: dropdown-enter var(--nuraly-select-dropdown-animation-duration, var(--nuraly-transition-fast)) ease-out;
    /* Ensure proper containment and exact wrapper width */
    box-sizing: border-box;
    /* Allow overriding width via either of these custom props */
    width: var(
      --nuraly-select-dropdown-width,
      var(--select-dropdown-width, max-content)
    );
    /* Create new stacking context to prevent layering issues */
    isolation: isolate;
    /* Ensure solid background to prevent visual bleed-through */
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    /* Prevent pointer events when hidden */
    pointer-events: none;
  }

  :host([show]) .options {
    pointer-events: auto;
  }

  .options.placement-top {
    animation: dropdown-enter-top var(--nuraly-select-dropdown-animation-duration, var(--nuraly-transition-fast)) ease-out;
  }

  .options.placement-bottom {
    animation: dropdown-enter var(--nuraly-select-dropdown-animation-duration, var(--nuraly-transition-fast)) ease-out;
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
    z-index: var(--nuraly-z-sticky);
    background-color: var(--nuraly-select-dropdown-background, var(--nuraly-color-background-panel));
    border-bottom: var(--nuraly-select-border-width, var(--nuraly-border-width-1)) solid
                   var(--nuraly-select-dropdown-border-color, var(--nuraly-color-border));
    padding: var(--nuraly-spacing-2);
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
    max-width: var(--nuraly-select-input-container-max-width, var(--nuraly-select-width));
    --nuraly-input-border-radius: var(--nuraly-select-border-radius, var(--nuraly-border-radius-md));
    --nuraly-input-background-color: var(--nuraly-select-background, var(--nuraly-color-background-panel));
    --nuraly-input-border-color: var(--nuraly-select-border-color, var(--nuraly-color-border));
    --nuraly-input-text-color: var(--nuraly-select-color, var(--nuraly-color-text));
    --nuraly-input-placeholder-color: var(--nuraly-select-placeholder-color, var(--nuraly-color-text-secondary));
  }

  /* Search icon in the search input */
  .search-container .search-icon {
    --nuraly-icon-color: var(--nuraly-color-select-icon, var(--nuraly-color-text-secondary));
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
    gap: var(--nuraly-spacing-2);
    padding: var(--nuraly-select-option-padding, var(--nuraly-spacing-2) var(--nuraly-spacing-3));
    min-height: var(--nuraly-select-option-min-height, auto);
    color: var(--nuraly-select-option-color, var(--nuraly-color-text));
    font-size: var(--nuraly-select-option-font-size, var(--nuraly-font-size-sm));
    cursor: pointer;
    transition: background-color var(--nuraly-select-transition-duration, var(--nuraly-transition-fast));
    position: relative;
  }

  /* First option after search container should have no extra margin */
  .search-container + .option {
    margin-top: 0;
  }

  .option:hover {
    background-color: var(--nuraly-select-option-hover-background, var(--nuraly-color-background-hover));
  }

  .option.selected {
    background-color: var(--nuraly-select-option-selected-background, var(--nuraly-color-primary));
    color: var(--nuraly-select-option-selected-color, var(--nuraly-color-text-on-color));
  }

  .option.focused {
    background-color: var(--nuraly-select-option-hover-background, var(--nuraly-color-background-hover));
    outline: 2px solid var(--nuraly-select-border-focus, var(--nuraly-color-primary));
    outline-offset: -2px;
  }

  .option.disabled {
    opacity: var(--nuraly-select-disabled-opacity, 0.5);
    cursor: not-allowed;
  }

  .option-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2);
  }

  .option-icon {
    --nuraly-icon-width: var(--nuraly-select-icon-size, var(--nuraly-font-size-base));
    --nuraly-icon-color: currentColor;
  }

  .option-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .option-description {
    font-size: calc(var(--nuraly-select-option-font-size, var(--nuraly-font-size-sm)) - 1px);
    opacity: 0.7;
    margin-top: var(--nuraly-spacing-1);
  }

  .check-icon {
    --nuraly-icon-width: var(--nuraly-select-icon-size, var(--nuraly-font-size-base));
    --nuraly-icon-color: var(--nuraly-select-option-selected-color, var(--nuraly-color-text-on-color));
  }

  .no-options {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--select-no-options-padding, var(--nuraly-spacing-6) var(--nuraly-spacing-4));
    color: var(--select-no-options-color, var(--nuraly-color-text-secondary));
    font-size: var(--nuraly-select-option-font-size, var(--nuraly-font-size-sm));
    cursor: default;
    user-select: none;
  }

  .no-options-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--select-no-options-gap, var(--nuraly-spacing-2));
    text-align: center;
  }

  .no-options-icon {
    --nuraly-icon-width: var(--nuraly-spacing-6);
    --nuraly-icon-color: var(--select-no-options-icon-color, var(--nuraly-color-border));
    opacity: 0.8;
  }

  .no-options-text {
    font-size: var(--nuraly-select-option-font-size, var(--nuraly-font-size-sm));
    color: var(--select-no-options-color, var(--nuraly-color-text-secondary));
    line-height: 1.4;
  }

  /* Validation message */
  .validation-message {
    display: block;
    margin-top: var(--nuraly-select-message-margin-top, var(--nuraly-spacing-1));
    font-size: var(--nuraly-select-message-font-size, var(--nuraly-font-size-xs));
    color: var(--nuraly-select-error-message-color, var(--nuraly-color-danger));
  }

  .validation-message.warning {
    color: var(--nuraly-select-warning-message-color, var(--nuraly-color-warning));
  }

  .validation-message.success {
    color: var(--nuraly-select-success-message-color, var(--nuraly-color-success));
  }

  /* Slotted content styles */
  ::slotted([slot='label']) {
    display: block;
    margin-bottom: var(--nuraly-spacing-1);
    font-weight: 500;
    color: var(--nuraly-select-color, var(--nuraly-color-text));
  }

  ::slotted([slot='helper-text']) {
    display: block;
    margin-top: var(--nuraly-select-message-margin-top, var(--nuraly-spacing-1));
    font-size: var(--nuraly-select-message-font-size, var(--nuraly-font-size-xs));
    color: var(--nuraly-select-placeholder-color, var(--nuraly-color-text-secondary));
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
