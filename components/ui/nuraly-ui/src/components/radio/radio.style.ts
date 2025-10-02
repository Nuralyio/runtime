/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
    position: relative;
    font-family: var(--nuraly-font-family-radio, var(--nuraly-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif));
  }

  :host([disabled]) {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .radio-wrapper {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-radio-gap, 8px);
  }

  .radio-input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    width: 0;
    height: 0;
  }

  .radio-circle {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--nuraly-border-radius-radio, 50%);
    border: var(--nuraly-border-width-radio, 2px) solid var(--nuraly-color-radio-border, #d9d9d9);
    background: var(--nuraly-color-radio-background, #ffffff);
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  /* Size variants */
  :host([size="small"]) .radio-circle {
    width: var(--nuraly-size-radio-small, 16px);
    height: var(--nuraly-size-radio-small, 16px);
  }

  :host([size="medium"]) .radio-circle,
  :host(:not([size])) .radio-circle {
    width: var(--nuraly-size-radio-medium, 20px);
    height: var(--nuraly-size-radio-medium, 20px);
  }

  :host([size="large"]) .radio-circle {
    width: var(--nuraly-size-radio-large, 24px);
    height: var(--nuraly-size-radio-large, 24px);
  }

  .radio-circle::after {
    content: '';
    display: block;
    border-radius: var(--nuraly-border-radius-radio-dot, 50%);
    background: var(--nuraly-color-radio-dot, #1677ff);
    transform: scale(0);
    transition: transform 0.2s ease;
  }

  :host([size="small"]) .radio-circle::after {
    width: 8px;
    height: 8px;
  }

  :host([size="medium"]) .radio-circle::after,
  :host(:not([size])) .radio-circle::after {
    width: 10px;
    height: 10px;
  }

  :host([size="large"]) .radio-circle::after {
    width: 12px;
    height: 12px;
  }

  /* Checked state */
  :host([checked]) .radio-circle {
    border-color: var(--nuraly-color-radio-checked-border, #1677ff);
  }

  :host([checked]) .radio-circle::after {
    transform: scale(1);
  }

  /* Focus state */
  .radio-input:focus-visible + .radio-circle {
    outline: 2px solid var(--nuraly-color-radio-border-focus, #1677ff);
    outline-offset: 2px;
  }

  /* Hover state */
  :host(:not([disabled]):hover) .radio-circle {
    border-color: var(--nuraly-color-radio-border-hover, #1677ff);
  }

  /* Disabled state */
  :host([disabled]) .radio-circle {
    background: var(--nuraly-color-radio-disabled-background, #f5f5f5);
    border-color: var(--nuraly-color-radio-disabled-border, #d9d9d9);
  }

  :host([disabled][checked]) .radio-circle::after {
    background: var(--nuraly-color-radio-disabled-dot, #bfbfbf);
  }

  /* Label - using nr-label component */
  .radio-label {
    display: inline-block;
    line-height: 1.5;
  }

  nr-label.radio-label {
    --nuraly-label-color: var(--nuraly-color-radio-label, #262626);
    --nuraly-label-font-size: var(--nuraly-font-size-radio-label, 14px);
  }

  :host([disabled]) nr-label.radio-label {
    --nuraly-label-color: var(--nuraly-color-radio-disabled-text, #bfbfbf);
  }
`;
