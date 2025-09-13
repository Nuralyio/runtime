/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * CSS custom properties for datepicker component (light theme defaults)
 * These are the local component defaults that can be overridden globally
 */
export const datepickerVariables = css`
  :host {
    /* Layout and sizing */
    --nuraly-datepicker-local-width: 280px;
    --nuraly-datepicker-local-height: auto;
    --nuraly-datepicker-local-padding: 16px;
    --nuraly-datepicker-local-margin: 0;
    --nuraly-datepicker-local-border-radius: 8px;
    --nuraly-datepicker-local-calendar-width: 320px;
    --nuraly-datepicker-local-calendar-height: auto;
    --nuraly-datepicker-local-day-size: 36px;
    --nuraly-datepicker-local-header-height: 56px;
    
    /* Colors - Light theme defaults */
    --nuraly-datepicker-local-background-color: #ffffff;
    --nuraly-datepicker-local-border-color: #d9d9d9;
    --nuraly-datepicker-local-text-color: #000000;
    --nuraly-datepicker-local-primary-color: #1677ff;
    --nuraly-datepicker-local-hover-color: #f5f5f5;
    --nuraly-datepicker-local-selected-color: #1677ff;
    --nuraly-datepicker-local-selected-text-color: #ffffff;
    --nuraly-datepicker-local-today-color: #1677ff;
    --nuraly-datepicker-local-disabled-color: #f5f5f5;
    --nuraly-datepicker-local-disabled-text-color: #bfbfbf;
    --nuraly-datepicker-local-weekend-color: #ff4d4f;
    --nuraly-datepicker-local-weekday-color: #8c8c8c;
    --nuraly-datepicker-local-range-color: rgba(22, 119, 255, 0.1);
    --nuraly-datepicker-local-shadow-color: rgba(0, 0, 0, 0.1);
    --nuraly-datepicker-local-error-color: #da1e28;
    --nuraly-datepicker-local-warning-color: #f0c300;
    --nuraly-datepicker-local-success-color: #24a148;
    
    /* Header specific colors */
    --nuraly-datepicker-local-header-background: #ffffff;
    --nuraly-datepicker-local-hover-background: rgba(0, 0, 0, 0.04);
    --nuraly-datepicker-local-active-background: rgba(0, 0, 0, 0.06);
    
    /* Input field colors */
    --nuraly-datepicker-local-input-background: #ffffff;
    --nuraly-datepicker-local-input-border-color: #d9d9d9;
    --nuraly-datepicker-local-input-focus-border-color: #1677ff;
    --nuraly-datepicker-local-input-text-color: #000000;
    --nuraly-datepicker-local-input-placeholder-color: #bfbfbf;
    
    /* Typography */
    --nuraly-datepicker-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
    --nuraly-datepicker-local-font-size: 14px;
    --nuraly-datepicker-local-font-weight: 400;
    --nuraly-datepicker-local-header-font-size: 16px;
    --nuraly-datepicker-local-header-font-weight: 600;
    --nuraly-datepicker-local-day-font-size: 14px;
    --nuraly-datepicker-local-input-font-size: 14px;
    --nuraly-datepicker-local-label-font-size: 14px;
    --nuraly-datepicker-local-helper-font-size: 12px;
    --nuraly-datepicker-local-message-font-size: 12px;
    
    /* Spacing */
    --nuraly-datepicker-local-gap: 6px;
    --nuraly-datepicker-local-calendar-padding: 12px;
    --nuraly-datepicker-local-day-padding: 6px;
    --nuraly-datepicker-local-input-padding: 8px 12px;
    
    /* Borders */
    --nuraly-datepicker-local-border-width: 1px;
    --nuraly-datepicker-local-input-border-width: 1px;
    --nuraly-datepicker-local-focus-border-width: 2px;
    
    /* Shadows */
    --nuraly-datepicker-local-box-shadow: 0 6px 16px 0 var(--nuraly-datepicker-local-shadow-color);
    --nuraly-datepicker-local-input-focus-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
    
    /* States */
    --nuraly-datepicker-local-disabled-opacity: 0.5;
    --nuraly-datepicker-local-hover-opacity: 0.8;
    
    /* Animation and transitions */
    --nuraly-datepicker-local-transition-duration: 0.2s;
    --nuraly-datepicker-local-transition-timing: ease-in-out;
    --nuraly-datepicker-local-calendar-animation-duration: 0.15s;
    
    /* Z-index */
    --nuraly-datepicker-local-calendar-z-index: 1000;
    
    /* Icon sizes */
    --nuraly-datepicker-local-icon-size: 16px;
    --nuraly-datepicker-local-arrow-icon-size: 12px;
    
    /* Size variants */
    --nuraly-datepicker-local-small-font-size: 12px;
    --nuraly-datepicker-local-small-padding: 6px 8px;
    --nuraly-datepicker-local-small-height: 32px;
    --nuraly-datepicker-local-small-day-size: 28px;
    
    --nuraly-datepicker-local-medium-font-size: 14px;
    --nuraly-datepicker-local-medium-padding: 8px 12px;
    --nuraly-datepicker-local-medium-height: 36px;
    --nuraly-datepicker-local-medium-day-size: 36px;
    
    --nuraly-datepicker-local-large-font-size: 16px;
    --nuraly-datepicker-local-large-padding: 12px 16px;
    --nuraly-datepicker-local-large-height: 44px;
    --nuraly-datepicker-local-large-day-size: 44px;
  }
`;
