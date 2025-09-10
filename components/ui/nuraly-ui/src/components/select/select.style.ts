import { css } from 'lit';
import { selectVariables } from './select.style.variables.js';

export const styles = css`
  ${selectVariables}

  :host {
    width: fit-content;
    display: block;
    font-family: var(--hybrid-select-font-family, var(--hybrid-select-local-font-family));
    font-size: var(--hybrid-select-font-size, var(--hybrid-select-local-font-size));
    line-height: var(--hybrid-select-line-height, var(--hybrid-select-local-line-height));
    margin: var(--hybrid-select-margin, var(--hybrid-select-local-wrapper-margin));
  }

  /* Host attribute selectors for configuration */
  :host([disabled]) {
    opacity: var(--hybrid-select-disabled-opacity, var(--hybrid-select-local-disabled-opacity));
    pointer-events: none;
  }

  :host([disabled]) .wrapper {
    background-color: var(--hybrid-select-disabled-background, var(--hybrid-select-local-disabled-background));
    border-color: var(--hybrid-select-disabled-border-color, var(--hybrid-select-local-disabled-border-color));
    color: var(--hybrid-select-disabled-text-color, var(--hybrid-select-local-disabled-text-color));
    cursor: not-allowed;
  }

  /* Theme-specific styles */
  :host([theme='dark']) {
    --hybrid-select-local-background-color: #262626;
    --hybrid-select-local-border-color: #424242;
    --hybrid-select-local-text-color: #ffffff;
    --hybrid-select-local-placeholder-color: #8c8c8c;
    --hybrid-select-local-dropdown-background: #262626;
    --hybrid-select-local-dropdown-border-color: #424242;
    --hybrid-select-local-option-hover-background: #393939;
    --hybrid-select-local-option-selected-background: #1e3a5f;
    --hybrid-select-local-hover-border-color: #4096ff;
    --hybrid-select-local-focus-border-color: #4096ff;
  }

  /* Size variants */
  :host([size='small']) .wrapper {
    min-height: var(--hybrid-select-small-height, var(--hybrid-select-local-small-height));
    font-size: var(--hybrid-select-small-font-size, var(--hybrid-select-local-small-font-size));
  }

  :host([size='small']) .select-trigger {
    padding: var(--hybrid-select-small-padding, var(--hybrid-select-local-small-padding));
    padding-right: calc(var(--hybrid-select-icon-size, var(--hybrid-select-local-icon-size)) + 20px);
  }

  :host([size='medium']) .wrapper {
    min-height: var(--hybrid-select-medium-height, var(--hybrid-select-local-medium-height));
    font-size: var(--hybrid-select-medium-font-size, var(--hybrid-select-local-medium-font-size));
  }

  :host([size='medium']) .select-trigger {
    padding: var(--hybrid-select-medium-padding, var(--hybrid-select-local-medium-padding));
    padding-right: calc(var(--hybrid-select-icon-size, var(--hybrid-select-local-icon-size)) + 20px);
  }

  :host([size='large']) .wrapper {
    min-height: var(--hybrid-select-large-height, var(--hybrid-select-local-large-height));
    font-size: var(--hybrid-select-large-font-size, var(--hybrid-select-local-large-font-size));
  }

  :host([size='large']) .select-trigger {
    padding: var(--hybrid-select-large-padding, var(--hybrid-select-local-large-padding));
    padding-right: calc(var(--hybrid-select-icon-size, var(--hybrid-select-local-icon-size)) + 20px);
  }

  /* Status variants */
  :host([status='error']) .wrapper {
    border-color: var(--hybrid-select-error-border-color, var(--hybrid-select-local-error-border-color));
  }

  :host([status='warning']) .wrapper {
    border-color: var(--hybrid-select-warning-border-color, var(--hybrid-select-local-warning-border-color));
  }

  :host([status='success']) .wrapper {
    border-color: var(--hybrid-select-success-border-color, var(--hybrid-select-local-success-border-color));
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
    width: var(--hybrid-select-width, var(--hybrid-select-local-width));
    background-color: var(--hybrid-select-background-color, var(--hybrid-select-local-background-color));
    border: var(--hybrid-select-border-width, var(--hybrid-select-local-border-width)) solid 
            var(--hybrid-select-border-color, var(--hybrid-select-local-border-color));
    border-radius: var(--hybrid-select-border-radius, var(--hybrid-select-local-border-radius));
    transition: all var(--hybrid-select-transition-duration, var(--hybrid-select-local-transition-duration)) 
                var(--hybrid-select-transition-timing, var(--hybrid-select-local-transition-timing));
    cursor: pointer;
    outline: none;
    margin: var(--hybrid-select-wrapper-margin, 0);
    min-height: var(--hybrid-select-min-height, var(--hybrid-select-local-min-height));
    /* Ensure dropdown can overflow the wrapper */
    overflow: visible;
  }

  .wrapper:hover:not(:disabled) {
    border-color: var(--hybrid-select-hover-border-color, var(--hybrid-select-local-hover-border-color));
  }

  .wrapper:focus,
  .wrapper:focus-within {
    border-color: var(--hybrid-select-focus-border-color, var(--hybrid-select-local-focus-border-color));
    box-shadow: 0 0 0 2px var(--hybrid-select-focus-border-color, var(--hybrid-select-local-focus-border-color))33;
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
    padding: var(--hybrid-select-padding-top, var(--hybrid-select-local-padding-top)) 
             calc(var(--hybrid-select-icon-size, var(--hybrid-select-local-icon-size)) + 20px) 
             var(--hybrid-select-padding-bottom, var(--hybrid-select-local-padding-bottom)) 
             var(--hybrid-select-padding-left, var(--hybrid-select-local-padding-left));
    color: var(--hybrid-select-text-color, var(--hybrid-select-local-text-color));
    font-size: inherit;
    line-height: inherit;
    word-break: break-word;
    min-height: inherit;
    flex-wrap: wrap;
    gap: var(--hybrid-select-tag-margin, var(--hybrid-select-local-tag-margin));
  }

  .select-trigger:empty:before {
    content: attr(data-placeholder);
    color: var(--hybrid-select-placeholder-color, var(--hybrid-select-local-placeholder-color));
    font-size: var(--hybrid-select-placeholder-font-size, var(--hybrid-select-local-placeholder-font-size));
  }

  /* Multi-select tags */
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background-color: var(--hybrid-select-tag-background, var(--hybrid-select-local-tag-background));
    color: var(--hybrid-select-tag-color, var(--hybrid-select-local-tag-color));
    padding: var(--hybrid-select-tag-padding, var(--hybrid-select-local-tag-padding));
    border-radius: var(--hybrid-select-tag-border-radius, var(--hybrid-select-local-tag-border-radius));
    font-size: calc(var(--hybrid-select-font-size, var(--hybrid-select-local-font-size)) - 1px);
    max-width: 100%;
  }

  .tag-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tag-close {
    color: var(--hybrid-select-tag-close-color, var(--hybrid-select-local-tag-close-color));
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--hybrid-select-icon-size, var(--hybrid-select-local-icon-size));
    height: var(--hybrid-select-icon-size, var(--hybrid-select-local-icon-size));
    border-radius: 50%;
    transition: color var(--hybrid-select-transition-duration, var(--hybrid-select-local-transition-duration));
  }

  .tag-close:hover {
    color: var(--hybrid-select-tag-close-hover-color, var(--hybrid-select-local-tag-close-hover-color));
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
    --hybrid-icon-width: var(--hybrid-select-icon-size, var(--hybrid-select-local-icon-size));
    --hybrid-icon-color: var(--hybrid-select-icon-color, var(--hybrid-select-local-icon-color));
    pointer-events: auto;
    cursor: pointer;
    transition: color var(--hybrid-select-transition-duration, var(--hybrid-select-local-transition-duration));
  }

  .icons-container hy-icon:hover {
    --hybrid-icon-color: var(--hybrid-select-icon-hover-color, var(--hybrid-select-local-icon-hover-color));
  }

  .arrow-icon {
    --hybrid-icon-width: var(--hybrid-select-arrow-icon-size, var(--hybrid-select-local-arrow-icon-size));
    transition: transform var(--hybrid-select-transition-duration, var(--hybrid-select-local-transition-duration));
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
    background-color: var(--hybrid-select-dropdown-background, var(--hybrid-select-local-dropdown-background));
    border: var(--hybrid-select-border-width, var(--hybrid-select-local-border-width)) solid 
            var(--hybrid-select-dropdown-border-color, var(--hybrid-select-local-dropdown-border-color));
    border-radius: var(--hybrid-select-border-radius, var(--hybrid-select-local-border-radius));
    box-shadow: var(--hybrid-select-dropdown-shadow, var(--hybrid-select-local-dropdown-shadow));
    z-index: var(--hybrid-select-dropdown-z-index, var(--hybrid-select-local-dropdown-z-index));
    max-height: 200px;
    overflow-y: auto;
    overflow-x: hidden;
    display: none;
    flex-direction: column;
    animation: dropdown-enter var(--hybrid-select-dropdown-animation-duration, var(--hybrid-select-local-dropdown-animation-duration)) ease-out;
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
    animation: dropdown-enter-top var(--hybrid-select-dropdown-animation-duration, var(--hybrid-select-local-dropdown-animation-duration)) ease-out;
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

  /* Option items */
  .option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    color: var(--hybrid-select-text-color, var(--hybrid-select-local-text-color));
    font-size: var(--hybrid-select-option-font-size, var(--hybrid-select-local-option-font-size));
    cursor: pointer;
    transition: background-color var(--hybrid-select-transition-duration, var(--hybrid-select-local-transition-duration));
    position: relative;
  }

  .option:hover {
    background-color: var(--hybrid-select-option-hover-background, var(--hybrid-select-local-option-hover-background));
  }

  .option.selected {
    background-color: var(--hybrid-select-option-selected-background, var(--hybrid-select-local-option-selected-background));
    color: var(--hybrid-select-option-selected-color, var(--hybrid-select-local-option-selected-color));
  }

  .option.focused {
    background-color: var(--hybrid-select-option-hover-background, var(--hybrid-select-local-option-hover-background));
    outline: 2px solid var(--hybrid-select-focus-border-color, var(--hybrid-select-local-focus-border-color));
    outline-offset: -2px;
  }

  .option.disabled {
    opacity: var(--hybrid-select-disabled-opacity, var(--hybrid-select-local-disabled-opacity));
    cursor: not-allowed;
  }

  .option-content {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .option-icon {
    --hybrid-icon-width: var(--hybrid-select-icon-size, var(--hybrid-select-local-icon-size));
    --hybrid-icon-color: currentColor;
  }

  .option-text {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .option-description {
    font-size: calc(var(--hybrid-select-option-font-size, var(--hybrid-select-local-option-font-size)) - 1px);
    opacity: 0.7;
    margin-top: 2px;
  }

  .check-icon {
    --hybrid-icon-width: var(--hybrid-select-icon-size, var(--hybrid-select-local-icon-size));
    --hybrid-icon-color: var(--hybrid-select-option-selected-color, var(--hybrid-select-local-option-selected-color));
  }

  /* No options message - styled like Ant Design */
  .no-options {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--select-no-options-padding, 24px 16px);
    color: var(--select-no-options-color, #8c8c8c);
    font-size: var(--hybrid-select-option-font-size, var(--hybrid-select-local-option-font-size));
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
    --hybrid-icon-width: 24px;
    --hybrid-icon-color: var(--select-no-options-icon-color, #d9d9d9);
    opacity: 0.8;
  }

  .no-options-text {
    font-size: var(--hybrid-select-option-font-size, var(--hybrid-select-local-option-font-size));
    color: var(--select-no-options-color, #8c8c8c);
    line-height: 1.4;
  }

  /* Dark theme adjustments for no-options */
  :host([theme='dark']) .no-options {
    color: var(--select-no-options-color, #595959);
  }

  :host([theme='dark']) .no-options-icon {
    --hybrid-icon-color: var(--select-no-options-icon-color, #434343);
  }

  :host([theme='dark']) .no-options-text {
    color: var(--select-no-options-color, #595959);
  }

  /* Validation message */
  .validation-message {
    display: block;
    margin-top: var(--hybrid-select-message-margin-top, var(--hybrid-select-local-message-margin-top));
    font-size: var(--hybrid-select-message-font-size, var(--hybrid-select-local-message-font-size));
    color: var(--hybrid-select-error-message-color, var(--hybrid-select-local-error-message-color));
  }

  .validation-message.warning {
    color: var(--hybrid-select-warning-message-color, var(--hybrid-select-local-warning-message-color));
  }

  .validation-message.success {
    color: var(--hybrid-select-success-message-color, var(--hybrid-select-local-success-message-color));
  }

  /* Slotted content styles */
  ::slotted([slot='label']) {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: var(--hybrid-select-text-color, var(--hybrid-select-local-text-color));
  }

  ::slotted([slot='helper-text']) {
    display: block;
    margin-top: var(--hybrid-select-message-margin-top, var(--hybrid-select-local-message-margin-top));
    font-size: var(--hybrid-select-message-font-size, var(--hybrid-select-local-message-font-size));
    color: var(--hybrid-select-placeholder-color, var(--hybrid-select-local-placeholder-color));
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
