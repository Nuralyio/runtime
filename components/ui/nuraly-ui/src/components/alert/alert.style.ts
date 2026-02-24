/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * Alert component styles for the Hybrid UI Library
 * Using shared CSS variables from /src/shared/themes/
 * 
 * This file contains all the styling for the nr-alert component with
 * clean CSS variable usage without local fallbacks and proper theme switching support.
 */
export const styles = css`
  :host {
    display: block;
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-base);
    line-height: var(--nuraly-line-height-base);
  }

  :host([hidden]) {
    display: none;
  }

  .alert {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: var(--nuraly-alert-gap);
    padding: var(--nuraly-alert-padding);
    border: 1px solid transparent;
    border-radius: var(--nuraly-alert-border-radius);
    transition: var(--nuraly-alert-transition);
  }

  .alert--banner {
    border-radius: 0;
    border-left: none;
    border-right: none;
  }

  /* Alert type variants - Success */
  .alert--success {
    background-color: var(--nuraly-color-success-light, #f6ffed);
    border-color: var(--nuraly-color-success, #52c41a);
    color: var(--nuraly-color-success-dark, #389e0d);
  }

  .alert--success .alert__icon {
    color: var(--nuraly-color-success, #52c41a);
  }

  /* Alert type variants - Info */
  .alert--info {
    background-color: var(--nuraly-color-info-light, #e6f7ff);
    border-color: var(--nuraly-color-info, #1890ff);
    color: var(--nuraly-color-info-dark, #096dd9);
  }

  .alert--info .alert__icon {
    color: var(--nuraly-color-info, #1890ff);
  }

  /* Alert type variants - Warning */
  .alert--warning {
    background-color: var(--nuraly-color-warning-light, #fffbe6);
    border-color: var(--nuraly-color-warning, #faad14);
    color: var(--nuraly-color-warning-dark, #d48806);
  }

  .alert--warning .alert__icon {
    color: var(--nuraly-color-warning, #faad14);
  }

  /* Alert type variants - Error */
  .alert--error {
    background-color: var(--nuraly-color-error-light, #fff2f0);
    border-color: var(--nuraly-color-error, #ff4d4f);
    color: var(--nuraly-color-error-dark, #cf1322);
  }

  .alert--error .alert__icon {
    color: var(--nuraly-color-error, #ff4d4f);
  }

  /* Alert with description */
  .alert--with-description {
    padding: var(--nuraly-alert-padding-with-description);
  }

  .alert--with-description .alert__icon {
    font-size: 1.5rem;
  }

  .alert__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    line-height: 1;
  }

  .alert__content {
    flex: 1;
    min-width: 0;
  }

  .alert__message {
    font-weight: var(--nuraly-font-weight-medium, 500);
    margin: 0;
    line-height: var(--nuraly-line-height-base);
  }

  .alert--with-description .alert__message {
    font-size: var(--nuraly-font-size-lg, 1.125rem);
    margin-bottom: var(--nuraly-spacing-1);
  }

  .alert__description {
    margin: var(--nuraly-spacing-1) 0 0;
    font-size: var(--nuraly-font-size-sm, 0.875rem);
    line-height: var(--nuraly-line-height-relaxed, 1.6);
    opacity: 0.85;
  }

  .alert__close {
    flex-shrink: 0;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: currentColor;
    opacity: 0.6;
    transition: opacity var(--nuraly-transition-fast) ease;
    line-height: 1;
  }

  .alert__close:hover {
    opacity: 1;
  }

  .alert__close:focus {
    outline: none;
    opacity: 1;
  }

  .alert__close:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: var(--nuraly-border-radius-sm, 2px);
  }

  /* Animation for closing */
  @keyframes alertFadeOut {
    from {
      opacity: 1;
      max-height: 200px;
    }
    to {
      opacity: 0;
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  .alert--closing {
    animation: alertFadeOut 0.3s ease forwards;
    overflow: hidden;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .alert {
      padding: var(--nuraly-spacing-2) var(--nuraly-spacing-3);
    }

    .alert--with-description {
      padding: var(--nuraly-spacing-3) var(--nuraly-spacing-4);
    }
  }
`;
