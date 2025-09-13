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
    --nuraly-radio-local-size: 14px;
    --nuraly-radio-local-dot-size: 3px;
    --nuraly-radio-local-focus-dot-size: 2px;
    --nuraly-radio-local-margin-right: 10px;
    --nuraly-radio-local-container-margin-top: 10px;
    --nuraly-radio-local-direction-horizontal-container-margin-top: 0px;
    --nuraly-radio-local-position-right-margin-right: 0px;
    --nuraly-radio-local-position-right-margin-left: 10px;

    /* Colors - Light theme */
    --nuraly-radio-local-dot-color: #1677ff;
    --nuraly-radio-local-border-color: #d9d9d9;
    --nuraly-radio-local-hover-border-color: #1677ff;
    --nuraly-radio-local-hover-enhanced-color: #4096ff;
    --nuraly-radio-local-checked-border-color: #1677ff;
    --nuraly-radio-local-focus-border-color: #1677ff;
    --nuraly-radio-local-error-border-color: #da1e28;
    --nuraly-radio-local-error-icon-color: #da1e28;
    --nuraly-radio-local-error-text-color: #da1e28;
    --nuraly-radio-local-warning-icon-color: #f0c300;

    /* Typography */
    --nuraly-radio-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
    --nuraly-radio-local-label-font-size: 15px;
    --nuraly-radio-local-message-font-size: 12px;

    /* States */
    --nuraly-radio-local-disabled-opacity: 0.5;

    /* Animation and transitions */
    --nuraly-radio-local-transition-duration: 0.2s;
    --nuraly-radio-local-ripple-duration: 0.2s;
    --nuraly-radio-local-ripple-color: rgba(22, 119, 255, 0.2);
    --nuraly-radio-local-ripple-max-size: 8px;

    /* Focus outline */
    --nuraly-radio-local-focus-outline-width: 2px;
    --nuraly-radio-local-focus-outline-color: rgba(22, 119, 255, 0.2);

    /* Hover ring */
    --nuraly-radio-local-hover-ring-width: 4px;
    --nuraly-radio-local-hover-ring-color: rgba(22, 119, 255, 0.1);

    /* Button type borders */
    --nuraly-radio-local-button-border-radius: 4px;
  }
`;
