import { css } from 'lit';

export const styles = css`
  :host {
    /* Layout and sizing */
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
    --nuraly-select-local-dropdown-max-height: auto;
    --nuraly-select-local-dropdown-width: max-content;
    --nuraly-select-local-placeholder-font-size: 14px;
    --nuraly-select-local-option-font-size: 14px;
    
    /* Search input container settings */
    --nuraly-select-local-input-container-max-width: var(--nuraly-select-width);
    
    /* Size tokens - small */
    --nuraly-select-local-small-height: 24px;
    --nuraly-select-local-small-font-size: 12px;
    --nuraly-select-local-small-padding: 2px 8px;
    --nuraly-select-local-small-icon-size: 14px;
    
    /* Size tokens - medium */
    --nuraly-select-local-medium-height: 40px;
    --nuraly-select-local-medium-font-size: 14px;
    --nuraly-select-local-medium-padding: 8px 12px;
    --nuraly-select-local-medium-icon-size: 16px;
    
    /* Size tokens - large */
    --nuraly-select-local-large-height: 48px;
    --nuraly-select-local-large-font-size: 16px;
    --nuraly-select-local-large-padding: 12px 16px;
    --nuraly-select-local-large-icon-size: 20px;
    
    /* Animation and transitions */
    --nuraly-select-local-dropdown-animation-duration: 0.15s;
    --nuraly-select-local-transition-duration: 0.2s;
    
    /* Multi-select specific */
    --nuraly-select-local-tag-border-radius: 4px;
    --nuraly-select-local-tag-padding: 2px 6px;
    --nuraly-select-local-tag-margin: 2px;
    
    /* Icon sizes */
    --nuraly-select-local-icon-size: 16px;
    --nuraly-select-local-arrow-icon-size: 16px;
    
    /* Validation message */
    --nuraly-select-local-message-font-size: 12px;
    --nuraly-select-local-message-margin-top: 4px;
    
    /* Font settings */
    --nuraly-select-local-font-size: 14px;
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
    background-color: var(--nuraly-select-disabled-background, var(--nuraly-color-background-disabled));
    border-color: var(--nuraly-select-disabled-border-color, var(--nuraly-color-border));
    color: var(--nuraly-select-disabled-text-color, var(--nuraly-color-text-disabled));
    cursor: not-allowed;
  }

  /* Size variants */
  :host([size='small']) .wrapper {
    height: var(--nuraly-select-small-height, var(--nuraly-select-local-small-height));
    min-height: var(--nuraly-select-small-height, var(--nuraly-select-local-small-height));
    font-size: var(--nuraly-select-small-font-size, var(--nuraly-select-local-small-font-size));
  }

  :host([size='small']) .select-trigger {
    padding: var(--nuraly-select-small-padding, var(--nuraly-select-local-small-padding));
    padding-right: calc(var(--nuraly-select-small-icon-size, var(--nuraly-select-local-small-icon-size)) + 20px);
  }

  :host([size='small']) .icons-container nr-icon {
    --nuraly-icon-width: var(--nuraly-select-small-icon-size, var(--nuraly-select-local-small-icon-size));
  }

  :host([size='small']) .option {
    padding: var(--nuraly-select-small-padding, var(--nuraly-select-local-small-padding));
    font-size: var(--nuraly-select-small-font-size, var(--nuraly-select-local-small-font-size));
    min-height: var(--nuraly-select-small-height, var(--nuraly-select-local-small-height));
  }

  :host([size='small']) .option-icon,
  :host([size='small']) .option nr-icon {
    --nuraly-icon-width: var(--nuraly-select-small-icon-size, var(--nuraly-select-local-small-icon-size));
  }

  :host([size='medium']) .wrapper {
    min-height: var(--nuraly-select-medium-height, var(--nuraly-select-local-medium-height));
    font-size: var(--nuraly-select-medium-font-size, var(--nuraly-select-local-medium-font-size));
  }

  :host([size='medium']) .select-trigger {
    padding: var(--nuraly-select-medium-padding, var(--nuraly-select-local-medium-padding));
    padding-right: calc(var(--nuraly-select-medium-icon-size, var(--nuraly-select-local-medium-icon-size)) + 20px);
  }

  :host([size='medium']) .icons-container nr-icon {
    --nuraly-icon-width: var(--nuraly-select-medium-icon-size, var(--nuraly-select-local-medium-icon-size));
  }

  :host([size='medium']) .option {
    padding: var(--nuraly-select-medium-padding, var(--nuraly-select-local-medium-padding));
    font-size: var(--nuraly-select-medium-font-size, var(--nuraly-select-local-medium-font-size));
    min-height: var(--nuraly-select-medium-height, var(--nuraly-select-local-medium-height));
  }

  :host([size='medium']) .option-icon,
  :host([size='medium']) .option nr-icon {
    --nuraly-icon-width: var(--nuraly-select-medium-icon-size, var(--nuraly-select-local-medium-icon-size));
  }

  :host([size='large']) .wrapper {
    min-height: var(--nuraly-select-large-height, var(--nuraly-select-local-large-height));
    font-size: var(--nuraly-select-large-font-size, var(--nuraly-select-local-large-font-size));
  }

  :host([size='large']) .select-trigger {
    padding: var(--nuraly-select-large-padding, var(--nuraly-select-local-large-padding));
    padding-right: calc(var(--nuraly-select-large-icon-size, var(--nuraly-select-local-large-icon-size)) + 20px);
  }

  :host([size='large']) .icons-container nr-icon {
    --nuraly-icon-width: var(--nuraly-select-large-icon-size, var(--nuraly-select-local-large-icon-size));
  }

  :host([size='large']) .option {
    padding: var(--nuraly-select-large-padding, var(--nuraly-select-local-large-padding));
    font-size: var(--nuraly-select-large-font-size, var(--nuraly-select-local-large-font-size));
    min-height: var(--nuraly-select-large-height, var(--nuraly-select-local-large-height));
  }

  :host([size='large']) .option-icon,
  :host([size='large']) .option nr-icon {
    --nuraly-icon-width: var(--nuraly-select-large-icon-size, var(--nuraly-select-local-large-icon-size));
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
    gap: 8px;
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
    border: var(--nuraly-select-border-width, var(--nuraly-select-local-border-width)) solid 
            var(--nuraly-select-border-color, var(--nuraly-color-border));
    border-radius: var(--nuraly-select-border-radius, var(--nuraly-select-local-border-radius));
    transition: all var(--nuraly-select-transition-duration, var(--nuraly-select-local-transition-duration)) 
                var(--nuraly-select-transition-timing, ease-in-out);
    cursor: pointer;
    outline: none;
    margin: var(--nuraly-select-wrapper-margin, 0);
    min-height: var(--nuraly-select-min-height, var(--nuraly-select-local-min-height));
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
    box-shadow: 0 0 0 2px var(--nuraly-color-primary-light);
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
    color: var(--nuraly-select-color, var(--nuraly-color-text));
    font-size: inherit;
    line-height: inherit;
    word-break: break-word;
    flex: 1;
    min-height: 0;
    flex-wrap: wrap;
    gap: var(--nuraly-select-tag-margin, var(--nuraly-select-local-tag-margin));
    box-sizing: border-box;
  }

  .select-trigger:empty:before {
    content: attr(data-placeholder);
    color: var(--nuraly-select-placeholder-color, var(--nuraly-color-text-secondary));
    font-size: var(--nuraly-select-placeholder-font-size, var(--nuraly-select-local-placeholder-font-size));
  }

  /* Multi-select tags */
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background-color: var(--nuraly-select-tag-background, var(--nuraly-color-background-active));
    color: var(--nuraly-select-tag-color, var(--nuraly-color-text));
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
    color: var(--nuraly-select-tag-close-color, var(--nuraly-color-text-secondary));
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
    color: var(--nuraly-select-tag-close-hover-color, var(--nuraly-color-text));
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
    --nuraly-icon-color: var(--nuraly-color-select-icon, var(--nuraly-color-text-secondary));
    pointer-events: auto;
    cursor: pointer;
    transition: color var(--nuraly-select-transition-duration, var(--nuraly-select-local-transition-duration));
  }

  .icons-container nr-icon:hover {
    --nuraly-icon-color: var(--nuraly-color-select-icon-hover, var(--nuraly-color-text));
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
    /* Fixed positioning to escape overflow containers */
    position: fixed;
    /* top/left will be set by controller */
    background-color: var(--nuraly-select-dropdown-background, var(--nuraly-color-background-panel));
    border: var(--nuraly-select-dropdown-border-width, var(--nuraly-select-border-width, var(--nuraly-select-local-border-width))) solid
            var(--nuraly-select-dropdown-border-color, var(--nuraly-color-border));
    border-radius: var(--nuraly-select-dropdown-border-radius, var(--nuraly-select-border-radius, var(--nuraly-select-local-border-radius)));
    box-shadow: var(--nuraly-select-dropdown-shadow, 0 6px 16px 0 rgba(0, 0, 0, 0.08));
    z-index: var(--nuraly-select-dropdown-z-index, var(--nuraly-select-local-dropdown-z-index));
    max-height: var(--nuraly-select-dropdown-max-height, var(--nuraly-select-local-dropdown-max-height, auto));
    overflow-y: auto;
    overflow-x: hidden;
    display: none;
    flex-direction: column;
    animation: dropdown-enter var(--nuraly-select-dropdown-animation-duration, var(--nuraly-select-local-dropdown-animation-duration)) ease-out;
    /* Ensure proper containment and exact wrapper width */
    box-sizing: border-box;
    /* Allow overriding width via either of these custom props */
    width: var(
      --nuraly-select-dropdown-width,
      var(--select-dropdown-width, var(--nuraly-select-local-dropdown-width))
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
    animation: dropdown-enter-top var(--nuraly-select-dropdown-animation-duration, var(--nuraly-select-local-dropdown-animation-duration)) ease-out;
  }

  .options.placement-bottom {
    animation: dropdown-enter var(--nuraly-select-dropdown-animation-duration, var(--nuraly-select-local-dropdown-animation-duration)) ease-out;
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
    background-color: var(--nuraly-select-dropdown-background, var(--nuraly-color-background-panel));
    border-bottom: var(--nuraly-select-border-width, var(--nuraly-select-local-border-width)) solid 
                   var(--nuraly-select-dropdown-border-color, var(--nuraly-color-border));
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
    max-width: var(--nuraly-select-input-container-max-width, var(--nuraly-select-local-input-container-max-width));
    --nuraly-input-border-radius: var(--nuraly-select-border-radius, var(--nuraly-select-local-border-radius));
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
    gap: 8px;
    padding: var(--nuraly-select-option-padding, 8px 12px);
    min-height: var(--nuraly-select-option-min-height, auto);
    color: var(--nuraly-select-option-color, var(--nuraly-color-text));
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
    background-color: var(--nuraly-select-option-hover-background, var(--nuraly-color-background-hover));
  }

  .option.selected {
    background-color: var(--nuraly-select-option-selected-background, var(--nuraly-color-primary));
    color: var(--nuraly-select-option-selected-color, #fff);
  }

  .option.focused {
    background-color: var(--nuraly-select-option-hover-background, var(--nuraly-color-background-hover));
    outline: 2px solid var(--nuraly-select-border-focus, var(--nuraly-color-primary));
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
    --nuraly-icon-color: var(--nuraly-select-option-selected-color, #fff);
  }

  .no-options {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--select-no-options-padding, 24px 16px);
    color: var(--select-no-options-color, var(--nuraly-color-text-secondary));
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
    --nuraly-icon-color: var(--select-no-options-icon-color, var(--nuraly-color-border));
    opacity: 0.8;
  }

  .no-options-text {
    font-size: var(--nuraly-select-option-font-size, var(--nuraly-select-local-option-font-size));
    color: var(--select-no-options-color, var(--nuraly-color-text-secondary));
    line-height: 1.4;
  }

  /* Validation message */
  .validation-message {
    display: block;
    margin-top: var(--nuraly-select-message-margin-top, var(--nuraly-select-local-message-margin-top));
    font-size: var(--nuraly-select-message-font-size, var(--nuraly-select-local-message-font-size));
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
    margin-bottom: 4px;
    font-weight: 500;
    color: var(--nuraly-select-color, var(--nuraly-color-text));
  }

  ::slotted([slot='helper-text']) {
    display: block;
    margin-top: var(--nuraly-select-message-margin-top, var(--nuraly-select-local-message-margin-top));
    font-size: var(--nuraly-select-message-font-size, var(--nuraly-select-local-message-font-size));
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
