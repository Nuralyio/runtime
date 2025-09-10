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
    --hybrid-datepicker-local-width: 280px;
    --hybrid-datepicker-local-height: auto;
    --hybrid-datepicker-local-padding: 16px;
    --hybrid-datepicker-local-margin: 0;
    --hybrid-datepicker-local-border-radius: 8px;
    --hybrid-datepicker-local-calendar-width: 320px;
    --hybrid-datepicker-local-calendar-height: auto;
    --hybrid-datepicker-local-day-size: 36px;
    --hybrid-datepicker-local-header-height: 56px;
    
    /* Colors - Light theme defaults */
    --hybrid-datepicker-local-background-color: #ffffff;
    --hybrid-datepicker-local-border-color: #d9d9d9;
    --hybrid-datepicker-local-text-color: #000000;
    --hybrid-datepicker-local-primary-color: #1677ff;
    --hybrid-datepicker-local-hover-color: #f5f5f5;
    --hybrid-datepicker-local-selected-color: #1677ff;
    --hybrid-datepicker-local-selected-text-color: #ffffff;
    --hybrid-datepicker-local-today-color: #1677ff;
    --hybrid-datepicker-local-disabled-color: #f5f5f5;
    --hybrid-datepicker-local-disabled-text-color: #bfbfbf;
    --hybrid-datepicker-local-weekend-color: #ff4d4f;
    --hybrid-datepicker-local-weekday-color: #8c8c8c;
    --hybrid-datepicker-local-range-color: rgba(22, 119, 255, 0.1);
    --hybrid-datepicker-local-shadow-color: rgba(0, 0, 0, 0.1);
    --hybrid-datepicker-local-error-color: #da1e28;
    --hybrid-datepicker-local-warning-color: #f0c300;
    --hybrid-datepicker-local-success-color: #24a148;
    
    /* Header specific colors */
    --hybrid-datepicker-local-header-background: #ffffff;
    --hybrid-datepicker-local-hover-background: rgba(0, 0, 0, 0.04);
    --hybrid-datepicker-local-active-background: rgba(0, 0, 0, 0.06);
    
    /* Input field colors */
    --hybrid-datepicker-local-input-background: #ffffff;
    --hybrid-datepicker-local-input-border-color: #d9d9d9;
    --hybrid-datepicker-local-input-focus-border-color: #1677ff;
    --hybrid-datepicker-local-input-text-color: #000000;
    --hybrid-datepicker-local-input-placeholder-color: #bfbfbf;
    
    /* Typography */
    --hybrid-datepicker-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif;
    --hybrid-datepicker-local-font-size: 14px;
    --hybrid-datepicker-local-font-weight: 400;
    --hybrid-datepicker-local-header-font-size: 16px;
    --hybrid-datepicker-local-header-font-weight: 600;
    --hybrid-datepicker-local-day-font-size: 14px;
    --hybrid-datepicker-local-input-font-size: 14px;
    --hybrid-datepicker-local-label-font-size: 14px;
    --hybrid-datepicker-local-helper-font-size: 12px;
    --hybrid-datepicker-local-message-font-size: 12px;
    
    /* Spacing */
    --hybrid-datepicker-local-gap: 6px;
    --hybrid-datepicker-local-calendar-padding: 12px;
    --hybrid-datepicker-local-day-padding: 6px;
    --hybrid-datepicker-local-input-padding: 8px 12px;
    
    /* Borders */
    --hybrid-datepicker-local-border-width: 1px;
    --hybrid-datepicker-local-input-border-width: 1px;
    --hybrid-datepicker-local-focus-border-width: 2px;
    
    /* Shadows */
    --hybrid-datepicker-local-box-shadow: 0 6px 16px 0 var(--hybrid-datepicker-local-shadow-color);
    --hybrid-datepicker-local-input-focus-shadow: 0 0 0 2px rgba(22, 119, 255, 0.2);
    
    /* States */
    --hybrid-datepicker-local-disabled-opacity: 0.5;
    --hybrid-datepicker-local-hover-opacity: 0.8;
    
    /* Animation and transitions */
    --hybrid-datepicker-local-transition-duration: 0.2s;
    --hybrid-datepicker-local-transition-timing: ease-in-out;
    --hybrid-datepicker-local-calendar-animation-duration: 0.15s;
    
    /* Z-index */
    --hybrid-datepicker-local-calendar-z-index: 1000;
    
    /* Icon sizes */
    --hybrid-datepicker-local-icon-size: 16px;
    --hybrid-datepicker-local-arrow-icon-size: 12px;
    
    /* Size variants */
    --hybrid-datepicker-local-small-font-size: 12px;
    --hybrid-datepicker-local-small-padding: 6px 8px;
    --hybrid-datepicker-local-small-height: 32px;
    --hybrid-datepicker-local-small-day-size: 28px;
    
    --hybrid-datepicker-local-medium-font-size: 14px;
    --hybrid-datepicker-local-medium-padding: 8px 12px;
    --hybrid-datepicker-local-medium-height: 36px;
    --hybrid-datepicker-local-medium-day-size: 36px;
    
    --hybrid-datepicker-local-large-font-size: 16px;
    --hybrid-datepicker-local-large-padding: 12px 16px;
    --hybrid-datepicker-local-large-height: 44px;
    --hybrid-datepicker-local-large-day-size: 44px;
  }
`;
