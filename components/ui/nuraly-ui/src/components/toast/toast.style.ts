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
    z-index: var(--nuraly-z-index-toast);
    pointer-events: none;
    
    /* Force CSS custom property inheritance to ensure theme switching works properly */
    color: var(--nuraly-color-text);
    font-family: var(--nuraly-font-family);
  }

  /* Container positioning */
  :host([position="top-right"]) {
    top: var(--nuraly-spacing-4);
    right: var(--nuraly-spacing-4);
  }

  :host([position="top-left"]) {
    top: var(--nuraly-spacing-4);
    left: var(--nuraly-spacing-4);
  }

  :host([position="top-center"]) {
    top: var(--nuraly-spacing-4);
    left: 50%;
    transform: translateX(-50%);
  }

  :host([position="bottom-right"]) {
    bottom: var(--nuraly-spacing-4);
    right: var(--nuraly-spacing-4);
  }

  :host([position="bottom-left"]) {
    bottom: var(--nuraly-spacing-4);
    left: var(--nuraly-spacing-4);
  }

  :host([position="bottom-center"]) {
    bottom: var(--nuraly-spacing-4);
    left: 50%;
    transform: translateX(-50%);
  }

  .toast-container {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-toast-stack-gap);
    min-width: var(--nuraly-toast-min-width);
    max-width: var(--nuraly-toast-max-width);
  }

  .toast {
    display: flex;
    align-items: start;
    gap: var(--nuraly-toast-gap);
    padding: var(--nuraly-toast-padding-vertical) var(--nuraly-toast-padding-horizontal);
    background-color: var(--nuraly-color-background);
    color: var(--nuraly-color-text);
    border: 1px solid var(--nuraly-color-border);
    border-radius: var(--nuraly-border-radius-toast);
    box-shadow: var(--nuraly-shadow-toast);
    pointer-events: auto;
    cursor: default;
    transition: all var(--nuraly-transition-fast) ease;
    position: relative;
    overflow: hidden;
  }

  .toast:hover {
    box-shadow: var(--nuraly-shadow-toast-hover);
  }

  /* Toast type variants */
  .toast--default {
    background-color: var(--nuraly-toast-default-background);
    border-color: var(--nuraly-toast-default-border);
    color: var(--nuraly-toast-default-text);
  }

  .toast--success {
    background-color: var(--nuraly-toast-success-background);
    border-color: var(--nuraly-toast-success-border);
    color: var(--nuraly-toast-success-text);
  }

  .toast--error {
    background-color: var(--nuraly-toast-error-background);
    border-color: var(--nuraly-toast-error-border);
    color: var(--nuraly-toast-error-text);
  }

  .toast--warning {
    background-color: var(--nuraly-toast-warning-background);
    border-color: var(--nuraly-toast-warning-border);
    color: var(--nuraly-toast-warning-text);
  }

  .toast--info {
    background-color: var(--nuraly-toast-info-background);
    border-color: var(--nuraly-toast-info-border);
    color: var(--nuraly-toast-info-text);
  }

  /* Toast icon */
  .toast__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.125rem; /* Slight adjustment for better visual alignment */
  }

  .toast__icon nr-icon {
    color: inherit;
  }

  /* Toast content */
  .toast__content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2);
    min-width: 0;
  }

  .toast__text {
    font-size: var(--nuraly-font-size-sm);
    line-height: 1.5;
    word-break: break-word;
  }

  /* Toast button */
  .toast__button {
    display: flex;
    align-items: center;
    margin-top: var(--nuraly-spacing-1);
  }

  .toast__button nr-button {
    flex-shrink: 0;
  }

  /* Close button */
  .toast__close {
    flex-shrink: 0;
    min-width: var(--nuraly-toast-close-size);
    min-height: var(--nuraly-toast-close-size);
    padding: 0;
    border: none;
    background: transparent;
    color: currentColor;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--nuraly-border-radius-small);
    transition: all var(--nuraly-transition-fast) ease;
    opacity: var(--nuraly-toast-close-opacity);
  }

  .toast__close:hover {
    opacity: var(--nuraly-toast-close-opacity-hover);
    background-color: var(--nuraly-toast-close-hover-background);
  }

  .toast__close:focus {
    outline: var(--nuraly-focus-outline);
    outline-offset: var(--nuraly-focus-outline-offset);
  }

  .toast__close nr-icon {
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
    animation: toast-fade-in var(--nuraly-transition-toast) ease;
  }

  .toast--fade-out {
    animation: toast-fade-out var(--nuraly-transition-toast) ease;
  }

  .toast--slide-in {
    animation: toast-slide-in-right var(--nuraly-transition-toast) ease;
  }

  .toast--slide-out {
    animation: toast-slide-out-right var(--nuraly-transition-toast) ease;
  }

  .toast--bounce-in {
    animation: toast-bounce-in var(--nuraly-transition-toast) ease;
  }

  .toast--bounce-out {
    animation: toast-bounce-out var(--nuraly-transition-toast) ease;
  }

  /* Position-specific slide animations */
  :host([position="top-left"]) .toast--slide-in,
  :host([position="bottom-left"]) .toast--slide-in {
    animation: toast-slide-in-left var(--nuraly-transition-toast) ease;
  }

  :host([position="top-left"]) .toast--slide-out,
  :host([position="bottom-left"]) .toast--slide-out {
    animation: toast-slide-out-left var(--nuraly-transition-toast) ease;
  }

  /* Progress bar for duration indicator */
  .toast__progress {
    position: absolute;
    bottom: 0;
    left: 0;
    height: var(--nuraly-toast-progress-height);
    background-color: currentColor;
    opacity: var(--nuraly-toast-progress-opacity);
    transition: width linear;
  }
`;
