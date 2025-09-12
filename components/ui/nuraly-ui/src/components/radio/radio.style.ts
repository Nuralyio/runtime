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
    font-family: var(--hybrid-radio-font-family, var(--hybrid-radio-local-font-family));
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
    margin-right: var(--hybrid-radio-position-right-margin-right, var(--hybrid-radio-local-position-right-margin-right));
    margin-left: var(--hybrid-radio-position-right-margin-left, var(--hybrid-radio-local-position-right-margin-left));
  }

  :host([direction='horizontal']) .radio {
    margin-top: var(--hybrid-radio-direction-horizontal-container-margin-top, var(--hybrid-radio-local-direction-horizontal-container-margin-top));
  }

  input[type='radio'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: var(--hybrid-radio-size, var(--hybrid-radio-local-size));
    height: var(--hybrid-radio-size, var(--hybrid-radio-local-size));
    padding: var(--hybrid-radio-dot-size, var(--hybrid-radio-local-dot-size));
    background-clip: content-box;
    border: 1px solid var(--hybrid-radio-border-color, var(--hybrid-radio-local-border-color));
    border-radius: 50%;
    margin: 0px;
    margin-right: var(--hybrid-radio-margin-right, var(--hybrid-radio-local-margin-right));
    cursor: pointer;
    position: relative;
    transition: all var(--hybrid-radio-transition-duration, var(--hybrid-radio-local-transition-duration));
  }

  /* Hover ring effect using box-shadow - no layout shift */
  .radio:hover input[type='radio']:not(:disabled) {
    border-color: var(--hybrid-radio-hover-border-color, var(--hybrid-radio-local-hover-border-color));
    box-shadow: 0 0 0 var(--hybrid-radio-hover-ring-width, var(--hybrid-radio-local-hover-ring-width)) 
                var(--hybrid-radio-hover-ring-color, var(--hybrid-radio-local-hover-ring-color));
  }

  .error input[type='radio'] {
    border: 1px solid var(--hybrid-radio-error-border-color, var(--hybrid-radio-local-error-border-color));
  }

  input[type='radio']:focus {
    border: 2px solid var(--hybrid-radio-focus-border-color, var(--hybrid-radio-local-focus-border-color));
    padding: var(--hybrid-radio-focus-dot-size, var(--hybrid-radio-local-focus-dot-size));
    outline: none;
    box-shadow: 0 0 0 var(--hybrid-radio-focus-outline-width, var(--hybrid-radio-local-focus-outline-width)) 
                var(--hybrid-radio-focus-outline-color, var(--hybrid-radio-local-focus-outline-color));
  }

  .error input[type='radio']:focus {
    border: 1px solid var(--hybrid-radio-error-border-color, var(--hybrid-radio-local-error-border-color));
    padding: var(--hybrid-radio-dot-size, var(--hybrid-radio-local-dot-size));
  }

  input[type='radio']:checked {
    background-color: var(--hybrid-radio-dot-color, var(--hybrid-radio-local-dot-color));
    border-color: var(--hybrid-radio-checked-border-color, var(--hybrid-radio-local-checked-border-color));
    animation: radioRipple var(--hybrid-radio-ripple-duration, var(--hybrid-radio-local-ripple-duration)) ease-out;
  }

  /* Ripple effect animation */
  @keyframes radioRipple {
    0% {
      box-shadow: 0 0 0 0 var(--hybrid-radio-ripple-color, var(--hybrid-radio-local-ripple-color));
    }
    50% {
      box-shadow: 0 0 0 var(--hybrid-radio-ripple-max-size, var(--hybrid-radio-local-ripple-max-size)) 
                  var(--hybrid-radio-ripple-color, var(--hybrid-radio-local-ripple-color));
    }
    100% {
      box-shadow: 0 0 0 var(--hybrid-radio-ripple-max-size, var(--hybrid-radio-local-ripple-max-size)) 
                  transparent;
    }
  }

  input[type='radio']:disabled,
  .radio-container:has(input[type='radio']:disabled) {
    opacity: var(--hybrid-radio-disabled-opacity, var(--hybrid-radio-local-disabled-opacity));
  }

  .input-container {
    display: flex;
  }

  .radio {
    display: flex;
    align-items: center;
    margin-top: var(--hybrid-radio-container-margin-top, var(--hybrid-radio-local-container-margin-top));
    font-size: var(--hybrid-radio-label-font-size, var(--hybrid-radio-local-label-font-size));
    cursor: pointer;
    flex-grow: 1;
  }

  .message-container {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--hybrid-radio-message-font-size, var(--hybrid-radio-local-message-font-size));
  }

  hy-icon {
    display: flex;
  }

  .error hy-icon {
    --hybrid-icon-color: var(--hybrid-radio-error-icon-color, var(--hybrid-radio-local-error-icon-color));
  }

  .warning hy-icon {
    --hybrid-icon-color: var(--hybrid-radio-warning-icon-color, var(--hybrid-radio-local-warning-icon-color));
  }

  .error .message-container {
    color: var(--hybrid-radio-error-text-color, var(--hybrid-radio-local-error-text-color));
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
    --hybrid-button-border-top-left-radius: var(--hybrid-radio-button-border-radius, var(--hybrid-radio-local-button-border-radius));
    --hybrid-button-border-bottom-left-radius: var(--hybrid-radio-button-border-radius, var(--hybrid-radio-local-button-border-radius));
  }

  .type-button :last-child {
    --hybrid-button-border-top-right-radius: var(--hybrid-radio-button-border-radius, var(--hybrid-radio-local-button-border-radius));
    --hybrid-button-border-bottom-right-radius: var(--hybrid-radio-button-border-radius, var(--hybrid-radio-local-button-border-radius));
  }

  .type-button nr-button:not(:last-child) {
    margin-right: -1px;
  }

  .type-button nr-button {
    position: relative;
    z-index: 1;
  }

  .type-button nr-button[type="default"]:hover {
    --hybrid-button-color: var(--hybrid-radio-hover-border-color, var(--hybrid-radio-local-hover-border-color));
    --hybrid-button-border-color: var(--hybrid-radio-hover-border-color, var(--hybrid-radio-local-hover-border-color));
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
    --hybrid-button-border-color: var(--hybrid-button-disabled-border-color, var(--hybrid-button-local-disabled-border-color));
    --hybrid-button-background-color: var(--hybrid-button-disabled-background-color, var(--hybrid-button-local-disabled-background-color));
    --hybrid-button-color: var(--hybrid-button-disabled-text-color, var(--hybrid-button-local-disabled-text-color));
  }

  /* Disabled primary buttons in groups */
  .type-button nr-button[type="primary"][disabled] {
    --hybrid-button-background-color: var(--hybrid-button-primary-disabled-background-color, var(--hybrid-button-local-primary-disabled-background-color));
    --hybrid-button-border-color: var(--hybrid-button-primary-disabled-border-color, var(--hybrid-button-local-primary-disabled-border-color));
    --hybrid-button-color: var(--hybrid-button-primary-disabled-text-color, var(--hybrid-button-local-primary-disabled-text-color));
  }

  .type-button nr-button[type="primary"][disabled] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-primary-disabled-text-color, var(--hybrid-button-local-primary-disabled-text-color));
    --hybrid-icon-local-color: var(--hybrid-button-primary-disabled-text-color, var(--hybrid-button-local-primary-disabled-text-color));
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
    --hybrid-radio-local-dot-color: #1677ff;
    --hybrid-radio-local-border-color: #434343;
    --hybrid-radio-local-hover-border-color: #1677ff;
    --hybrid-radio-local-hover-enhanced-color: #4096ff;
    --hybrid-radio-local-checked-border-color: #1677ff;
    --hybrid-radio-local-focus-border-color: #1677ff;
    --hybrid-radio-local-focus-outline-color: rgba(22, 119, 255, 0.3);
    --hybrid-radio-local-ripple-color: rgba(22, 119, 255, 0.3);
    --hybrid-radio-local-hover-ring-color: rgba(22, 119, 255, 0.15);
  }

  .radio-container[data-theme="dark"] input[type='radio'] {
    border-color: var(--hybrid-radio-border-color, var(--hybrid-radio-local-border-color));
  }

  .radio-container[data-theme="dark"] input[type='radio']:checked {
    background-color: var(--hybrid-radio-dot-color, var(--hybrid-radio-local-dot-color));
  }

  .radio-container[data-theme="dark"] input[type='radio']:focus {
    border-color: var(--hybrid-radio-focus-border-color, var(--hybrid-radio-local-focus-border-color));
  }
`;
