/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * Toast component styles for the Hybrid UI Library
 * Using shared CSS variables from /src/shared/themes/
 * 
 * This file contains all the styling for the nr-toast component with
 * clean CSS variable usage without local fallbacks and proper theme switching support.
 */
export const styles = css`
  :host {
    display: block;
    position: fixed;
    z-index: var(--nuraly-z-index-toast, 9999);
    pointer-events: none;
    
    /* Force CSS custom property inheritance to ensure theme switching works properly */
    color: var(--nuraly-color-text);
    font-family: var(--nuraly-font-family);
  }

  /* Container positioning */
  :host([position="top-right"]) {
    top: var(--nuraly-spacing-4, 1rem);
    right: var(--nuraly-spacing-4, 1rem);
  }

  :host([position="top-left"]) {
    top: var(--nuraly-spacing-4, 1rem);
    left: var(--nuraly-spacing-4, 1rem);
  }

  :host([position="top-center"]) {
    top: var(--nuraly-spacing-4, 1rem);
    left: 50%;
    transform: translateX(-50%);
  }

  :host([position="bottom-right"]) {
    bottom: var(--nuraly-spacing-4, 1rem);
    right: var(--nuraly-spacing-4, 1rem);
  }

  :host([position="bottom-left"]) {
    bottom: var(--nuraly-spacing-4, 1rem);
    left: var(--nuraly-spacing-4, 1rem);
  }

  :host([position="bottom-center"]) {
    bottom: var(--nuraly-spacing-4, 1rem);
    left: 50%;
    transform: translateX(-50%);
  }

  .toast-container {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 0.5rem);
    min-width: 300px;
    max-width: 500px;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-3, 0.75rem);
    padding: var(--nuraly-spacing-3, 0.75rem) var(--nuraly-spacing-4, 1rem);
    background-color: var(--nuraly-color-background, #ffffff);
    color: var(--nuraly-color-text, #161616);
    border: 1px solid var(--nuraly-color-border, #e0e0e0);
    border-radius: var(--nuraly-border-radius-medium, 0.25rem);
    box-shadow: var(--nuraly-shadow-medium, 0 4px 6px rgba(0, 0, 0, 0.1));
    pointer-events: auto;
    cursor: default;
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
    position: relative;
    overflow: hidden;
    /* Ensure solid background */
    backdrop-filter: none;
  }

  .toast:hover {
    box-shadow: var(--nuraly-shadow-large, 0 10px 15px rgba(0, 0, 0, 0.15));
  }

  /* Toast type variants */
  .toast--default {
    background-color: var(--nuraly-toast-default-background, var(--nuraly-color-background, #ffffff));
    border-color: var(--nuraly-toast-default-border, var(--nuraly-color-border, #e0e0e0));
    color: var(--nuraly-toast-default-text, var(--nuraly-color-text, #161616));
  }

  .toast--success {
    background-color: var(--nuraly-toast-success-background, #defbe6);
    border-color: var(--nuraly-toast-success-border, #24a148);
    color: var(--nuraly-toast-success-text, #0e6027);
  }

  .toast--error {
    background-color: var(--nuraly-toast-error-background, #fff1f1);
    border-color: var(--nuraly-toast-error-border, #da1e28);
    color: var(--nuraly-toast-error-text, #750e13);
  }

  .toast--warning {
    background-color: var(--nuraly-toast-warning-background, #fcf4d6);
    border-color: var(--nuraly-toast-warning-border, #f1c21b);
    color: var(--nuraly-toast-warning-text, #684e00);
  }

  .toast--info {
    background-color: var(--nuraly-toast-info-background, #edf5ff);
    border-color: var(--nuraly-toast-info-border, #0043ce);
    color: var(--nuraly-toast-info-text, #001d6c);
  }

  /* Toast icon */
  .toast__icon {
    flex-shrink: 0;
    width: 1.25rem;
    height: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast__icon nr-icon {
    width: 100%;
    height: 100%;
    color: inherit;
  }

  /* Toast content */
  .toast__content {
    flex: 1;
    font-size: var(--nuraly-font-size-sm, 0.875rem);
    line-height: 1.5;
    word-break: break-word;
  }

  /* Close button */
  .toast__close {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    border: none;
    background: transparent;
    color: currentColor;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--nuraly-border-radius-small, 0.125rem);
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
    opacity: 0.7;
  }

  .toast__close:hover {
    opacity: 1;
    background-color: var(--nuraly-color-hover, rgba(0, 0, 0, 0.05));
  }

  .toast__close:focus {
    outline: var(--nuraly-focus-outline);
    outline-offset: var(--nuraly-focus-outline-offset);
  }

  .toast__close nr-icon {
    width: 1rem;
    height: 1rem;
    color: inherit;
  }

  /* Animations */
  @keyframes toast-fade-in {
    from {
      opacity: 0;
      transform: translateY(-1rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes toast-fade-out {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-1rem);
    }
  }

  @keyframes toast-slide-in-right {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes toast-slide-out-right {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }

  @keyframes toast-slide-in-left {
    from {
      opacity: 0;
      transform: translateX(-100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes toast-slide-out-left {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-100%);
    }
  }

  @keyframes toast-bounce-in {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes toast-bounce-out {
    0% {
      transform: scale(1);
    }
    25% {
      transform: scale(0.95);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
    100% {
      opacity: 0;
      transform: scale(0.3);
    }
  }

  /* Animation classes */
  .toast--fade-in {
    animation: toast-fade-in var(--nuraly-transition-medium, 0.3s) ease;
  }

  .toast--fade-out {
    animation: toast-fade-out var(--nuraly-transition-medium, 0.3s) ease;
  }

  .toast--slide-in {
    animation: toast-slide-in-right var(--nuraly-transition-medium, 0.3s) ease;
  }

  .toast--slide-out {
    animation: toast-slide-out-right var(--nuraly-transition-medium, 0.3s) ease;
  }

  .toast--bounce-in {
    animation: toast-bounce-in var(--nuraly-transition-medium, 0.3s) ease;
  }

  .toast--bounce-out {
    animation: toast-bounce-out var(--nuraly-transition-medium, 0.3s) ease;
  }

  /* Position-specific slide animations */
  :host([position="top-left"]) .toast--slide-in,
  :host([position="bottom-left"]) .toast--slide-in {
    animation: toast-slide-in-left var(--nuraly-transition-medium, 0.3s) ease;
  }

  :host([position="top-left"]) .toast--slide-out,
  :host([position="bottom-left"]) .toast--slide-out {
    animation: toast-slide-out-left var(--nuraly-transition-medium, 0.3s) ease;
  }

  /* Progress bar for duration indicator */
  .toast__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3px;
    background-color: currentColor;
    opacity: 0.3;
    transition: width linear;
  }
`;
