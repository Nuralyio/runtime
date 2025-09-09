/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * CSS custom properties for radio button component (light theme defaults)
 * These are the local component defaults that can be overridden globally
 */
export const radioVariables = css`
  :host {
    /* Layout and sizing */
    --hybrid-radio-local-size: 14px;
    --hybrid-radio-local-dot-size: 3px;
    --hybrid-radio-local-focus-dot-size: 2px;
    --hybrid-radio-local-margin-right: 10px;
    --hybrid-radio-local-container-margin-top: 10px;
    --hybrid-radio-local-direction-horizontal-container-margin-top: 0px;
    --hybrid-radio-local-position-right-margin-right: 0px;
    --hybrid-radio-local-position-right-margin-left: 10px;

    /* Colors - Light theme */
    --hybrid-radio-local-dot-color: #1677ff;
    --hybrid-radio-local-border-color: #d9d9d9;
    --hybrid-radio-local-hover-border-color: #1677ff;
    --hybrid-radio-local-hover-enhanced-color: #4096ff;
    --hybrid-radio-local-checked-border-color: #1677ff;
    --hybrid-radio-local-focus-border-color: #1677ff;
    --hybrid-radio-local-error-border-color: #da1e28;
    --hybrid-radio-local-error-icon-color: #da1e28;
    --hybrid-radio-local-error-text-color: #da1e28;
    --hybrid-radio-local-warning-icon-color: #f0c300;

    /* Typography */
    --hybrid-radio-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
    --hybrid-radio-local-label-font-size: 15px;
    --hybrid-radio-local-message-font-size: 12px;

    /* States */
    --hybrid-radio-local-disabled-opacity: 0.5;

    /* Animation and transitions */
    --hybrid-radio-local-transition-duration: 0.2s;
    --hybrid-radio-local-ripple-duration: 0.2s;
    --hybrid-radio-local-ripple-color: rgba(22, 119, 255, 0.2);
    --hybrid-radio-local-ripple-max-size: 8px;

    /* Focus outline */
    --hybrid-radio-local-focus-outline-width: 2px;
    --hybrid-radio-local-focus-outline-color: rgba(22, 119, 255, 0.2);

    /* Hover ring */
    --hybrid-radio-local-hover-ring-width: 4px;
    --hybrid-radio-local-hover-ring-color: rgba(22, 119, 255, 0.1);

    /* Button type borders */
    --hybrid-radio-local-button-border-radius: 4px;
  }
`;
