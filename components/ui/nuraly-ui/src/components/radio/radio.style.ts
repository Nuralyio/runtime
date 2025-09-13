/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';
import { radioVariables } from './radio.style.variables.js';

export const styles = css`
  ${radioVariables}

  :host {
    width: fit-content;
    display: block;
    font-family: var(--nuraly-radio-font-family, var(--nuraly-radio-local-font-family));
  }

  :host([direction='horizontal']) {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  :host([position='right']) .radio {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }

  :host([position='right']) span {
    flex-grow: 1;
  }

  :host([position='right'][direction='horizontal']) span {
    flex-grow: 0;
  }

  :host([position='right']) input[type='radio'] {
    margin-right: var(--nuraly-radio-position-right-margin-right, var(--nuraly-radio-local-position-right-margin-right));
    margin-left: var(--nuraly-radio-position-right-margin-left, var(--nuraly-radio-local-position-right-margin-left));
  }

  :host([direction='horizontal']) .radio {
    margin-top: var(--nuraly-radio-direction-horizontal-container-margin-top, var(--nuraly-radio-local-direction-horizontal-container-margin-top));
  }

  input[type='radio'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: var(--nuraly-radio-size, var(--nuraly-radio-local-size));
    height: var(--nuraly-radio-size, var(--nuraly-radio-local-size));
    padding: var(--nuraly-radio-dot-size, var(--nuraly-radio-local-dot-size));
    background-clip: content-box;
    border: 1px solid var(--nuraly-radio-border-color, var(--nuraly-radio-local-border-color));
    border-radius: 50%;
    margin: 0px;
    margin-right: var(--nuraly-radio-margin-right, var(--nuraly-radio-local-margin-right));
    cursor: pointer;
    position: relative;
    transition: all var(--nuraly-radio-transition-duration, var(--nuraly-radio-local-transition-duration));
  }

  /* Hover ring effect using box-shadow - no layout shift */
  .radio:hover input[type='radio']:not(:disabled) {
    border-color: var(--nuraly-radio-hover-border-color, var(--nuraly-radio-local-hover-border-color));
    box-shadow: 0 0 0 var(--nuraly-radio-hover-ring-width, var(--nuraly-radio-local-hover-ring-width)) 
                var(--nuraly-radio-hover-ring-color, var(--nuraly-radio-local-hover-ring-color));
  }

  .error input[type='radio'] {
    border: 1px solid var(--nuraly-radio-error-border-color, var(--nuraly-radio-local-error-border-color));
  }

  input[type='radio']:focus {
    border: 2px solid var(--nuraly-radio-focus-border-color, var(--nuraly-radio-local-focus-border-color));
    padding: var(--nuraly-radio-focus-dot-size, var(--nuraly-radio-local-focus-dot-size));
    outline: none;
    box-shadow: 0 0 0 var(--nuraly-radio-focus-outline-width, var(--nuraly-radio-local-focus-outline-width)) 
                var(--nuraly-radio-focus-outline-color, var(--nuraly-radio-local-focus-outline-color));
  }

  .error input[type='radio']:focus {
    border: 1px solid var(--nuraly-radio-error-border-color, var(--nuraly-radio-local-error-border-color));
    padding: var(--nuraly-radio-dot-size, var(--nuraly-radio-local-dot-size));
  }

  input[type='radio']:checked {
    background-color: var(--nuraly-radio-dot-color, var(--nuraly-radio-local-dot-color));
    border-color: var(--nuraly-radio-checked-border-color, var(--nuraly-radio-local-checked-border-color));
    animation: radioRipple var(--nuraly-radio-ripple-duration, var(--nuraly-radio-local-ripple-duration)) ease-out;
  }

  /* Ripple effect animation */
  @keyframes radioRipple {
    0% {
      box-shadow: 0 0 0 0 var(--nuraly-radio-ripple-color, var(--nuraly-radio-local-ripple-color));
    }
    50% {
      box-shadow: 0 0 0 var(--nuraly-radio-ripple-max-size, var(--nuraly-radio-local-ripple-max-size)) 
                  var(--nuraly-radio-ripple-color, var(--nuraly-radio-local-ripple-color));
    }
    100% {
      box-shadow: 0 0 0 var(--nuraly-radio-ripple-max-size, var(--nuraly-radio-local-ripple-max-size)) 
                  transparent;
    }
  }

  input[type='radio']:disabled,
  .radio-container:has(input[type='radio']:disabled) {
    opacity: var(--nuraly-radio-disabled-opacity, var(--nuraly-radio-local-disabled-opacity));
  }

  .input-container {
    display: flex;
  }

  .radio {
    display: flex;
    align-items: center;
    margin-top: var(--nuraly-radio-container-margin-top, var(--nuraly-radio-local-container-margin-top));
    font-size: var(--nuraly-radio-label-font-size, var(--nuraly-radio-local-label-font-size));
    cursor: pointer;
    flex-grow: 1;
  }

  .message-container {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--nuraly-radio-message-font-size, var(--nuraly-radio-local-message-font-size));
  }

  hy-icon {
    display: flex;
  }

  .error hy-icon {
    --nuraly-icon-color: var(--nuraly-radio-error-icon-color, var(--nuraly-radio-local-error-icon-color));
  }

  .warning hy-icon {
    --nuraly-icon-color: var(--nuraly-radio-warning-icon-color, var(--nuraly-radio-local-warning-icon-color));
  }

  .error .message-container {
    color: var(--nuraly-radio-error-text-color, var(--nuraly-radio-local-error-text-color));
  }

  .radio:has(input:disabled) {
    cursor: not-allowed;
  }

  input:disabled {
    cursor: not-allowed;
  }

  .type-button {
    display: inline-flex;
    gap: 0px; /* Always no gap */
  }

  /* Button styling - no layout shifts */
  .type-button :first-child {
    --nuraly-button-border-top-left-radius: var(--nuraly-radio-button-border-radius, var(--nuraly-radio-local-button-border-radius));
    --nuraly-button-border-bottom-left-radius: var(--nuraly-radio-button-border-radius, var(--nuraly-radio-local-button-border-radius));
  }

  .type-button :last-child {
    --nuraly-button-border-top-right-radius: var(--nuraly-radio-button-border-radius, var(--nuraly-radio-local-button-border-radius));
    --nuraly-button-border-bottom-right-radius: var(--nuraly-radio-button-border-radius, var(--nuraly-radio-local-button-border-radius));
  }

  .type-button nr-button:not(:last-child) {
    margin-right: -1px;
  }

  .type-button nr-button {
    position: relative;
    z-index: 1;
  }

  .type-button nr-button[type="default"]:hover {
    --nuraly-button-color: var(--nuraly-radio-hover-border-color, var(--nuraly-radio-local-hover-border-color));
    --nuraly-button-border-color: var(--nuraly-radio-hover-border-color, var(--nuraly-radio-local-hover-border-color));
    z-index: 2;
  }

  /* Selected buttons use primary type and inherit primary button styling */
  .type-button nr-button[type="primary"] {
    z-index: 1;
    position: relative;
  }

  /* Disabled button states in groups */
  .type-button nr-button[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  .type-button nr-button[disabled]:hover {
    z-index: auto;
    --nuraly-button-border-color: var(--nuraly-button-disabled-border-color, var(--nuraly-button-local-disabled-border-color));
    --nuraly-button-background-color: var(--nuraly-button-disabled-background-color, var(--nuraly-button-local-disabled-background-color));
    --nuraly-button-color: var(--nuraly-button-disabled-text-color, var(--nuraly-button-local-disabled-text-color));
  }

  /* Disabled primary buttons in groups */
  .type-button nr-button[type="primary"][disabled] {
    --nuraly-button-background-color: var(--nuraly-button-primary-disabled-background-color, var(--nuraly-button-local-primary-disabled-background-color));
    --nuraly-button-border-color: var(--nuraly-button-primary-disabled-border-color, var(--nuraly-button-local-primary-disabled-border-color));
    --nuraly-button-color: var(--nuraly-button-primary-disabled-text-color, var(--nuraly-button-local-primary-disabled-text-color));
  }

  .type-button nr-button[type="primary"][disabled] hy-icon {
    --nuraly-icon-color: var(--nuraly-button-primary-disabled-text-color, var(--nuraly-button-local-primary-disabled-text-color));
    --nuraly-icon-local-color: var(--nuraly-button-primary-disabled-text-color, var(--nuraly-button-local-primary-disabled-text-color));
  }

  /* Slot-based radio styling */
  .slot-container {
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .slot-container:hover {
    background-color: rgba(22, 119, 255, 0.04);
    border-radius: 6px;
  }

  .slot-container.selected {
    background-color: rgba(22, 119, 255, 0.08);
    border-radius: 6px;
  }

  .slot-radio {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    cursor: pointer;
    padding-left: 8px;
  }

  .slot-radio input[type="radio"] {
    margin: 0;
    flex-shrink: 0;
    align-self: center;
  }

  .slot-content {
    flex: 1;
    width: 100%;
  }

  /* Hide radio input for slot-only content */
  .slot-container.no-radio .radio-input {
    display: none;
  }

  /* Dark theme overrides */
  .radio-container[data-theme="dark"] input[type='radio'] {
    --nuraly-radio-local-dot-color: #1677ff;
    --nuraly-radio-local-border-color: #434343;
    --nuraly-radio-local-hover-border-color: #1677ff;
    --nuraly-radio-local-hover-enhanced-color: #4096ff;
    --nuraly-radio-local-checked-border-color: #1677ff;
    --nuraly-radio-local-focus-border-color: #1677ff;
    --nuraly-radio-local-focus-outline-color: rgba(22, 119, 255, 0.3);
    --nuraly-radio-local-ripple-color: rgba(22, 119, 255, 0.3);
    --nuraly-radio-local-hover-ring-color: rgba(22, 119, 255, 0.15);
  }

  .radio-container[data-theme="dark"] input[type='radio'] {
    border-color: var(--nuraly-radio-border-color, var(--nuraly-radio-local-border-color));
  }

  .radio-container[data-theme="dark"] input[type='radio']:checked {
    background-color: var(--nuraly-radio-dot-color, var(--nuraly-radio-local-dot-color));
  }

  .radio-container[data-theme="dark"] input[type='radio']:focus {
    border-color: var(--nuraly-radio-focus-border-color, var(--nuraly-radio-local-focus-border-color));
  }
`;
