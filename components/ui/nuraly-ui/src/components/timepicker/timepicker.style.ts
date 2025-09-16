/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';
import { styleVariables } from './timepicker.style.variables.js';

export const styles = css`
  ${styleVariables}
  :host {
    display: block;
    font-family: var(--nuraly-timepicker-local-font-family);
    font-size: var(--nuraly-timepicker-local-font-size);
    font-weight: var(--nuraly-timepicker-local-font-weight);
  }

  /* Host attribute selectors for configuration */
  :host([disabled]) {
    opacity: var(--nuraly-timepicker-local-disabled-opacity);
    pointer-events: none;
  }

  .time-picker {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  /* Input wrapper hover and focus states matching select component */
  .time-picker__input-wrapper:hover:not(.time-picker--disabled) nr-input {
    --nuraly-input-border-color: var(--nuraly-timepicker-local-border-color-hover);
  }

  .time-picker__input-wrapper:focus-within nr-input,
  .time-picker--open .time-picker__input-wrapper nr-input,
  .time-picker__input-wrapper nr-input:focus {
    --nuraly-input-border-color: var(--nuraly-timepicker-local-focus-color);
    --nuraly-input-box-shadow: 0 0 0 2px var(--nuraly-timepicker-local-focus-color)33;
  }

  /* Disabled state styling */
  .time-picker--disabled .time-picker__input-wrapper nr-input {
    --nuraly-input-background-color: var(--nuraly-timepicker-local-disabled-bg);
    --nuraly-input-border-color: var(--nuraly-timepicker-local-border-color);
    --nuraly-input-text-color: var(--nuraly-timepicker-local-text-color-disabled);
    cursor: not-allowed;
    opacity: 0.6;
  }

  .time-picker__input-wrapper {
    position: relative;
    width: 100%;
  }

  /* Style the nr-input component */
  .time-picker__input-wrapper nr-input {
    width: 100%;
  }

  /* Style the trigger button inside nr-input */
  .time-picker__trigger {
    padding: 4px !important;
    min-width: auto !important;
    width: 24px !important;
    height: 24px !important;
    border-radius: var(--nuraly-timepicker-local-border-radius-sm) !important;
  }

  .time-picker__trigger svg {
    width: 16px;
    height: 16px;
    color: var(--nuraly-timepicker-local-text-color-secondary);
    transition: color 0.2s ease;
  }

  .time-picker__trigger:hover svg {
    color: var(--nuraly-timepicker-local-primary-color);
  }

  .time-picker__trigger:hover {
    color: var(--nuraly-timepicker-local-primary-color);
  }

  .time-picker__trigger:disabled {
    color: var(--nuraly-timepicker-local-text-color-disabled);
    cursor: not-allowed;
  }

  .time-picker__trigger svg {
    width: 14px;
    height: 14px;
  }

    .time-picker__dropdown {
    position: absolute;
    z-index: 1000;
    background-color: var(--nuraly-timepicker-local-background-color);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--nuraly-timepicker-local-border-color);
    border-radius: var(--nuraly-timepicker-local-border-radius);
    box-shadow: var(--nuraly-timepicker-local-box-shadow);
    width: 100%;
    min-width: 180px;
    /* Animation and positioning - simplified to match select */
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    transition: all 0.2s ease-in-out;
    /* Create new stacking context to prevent layering issues */
    isolation: isolate;
    /* Ensure solid background to prevent visual bleed-through */
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    /* Force above other elements */
    transform: translateZ(0);
    animation: dropdown-enter 0.15s ease-out;
    overflow: hidden;
  }

  .time-picker__dropdown.placement-top {
    animation: dropdown-enter-top 0.15s ease-out;
  }

  @keyframes dropdown-enter {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes dropdown-enter-top {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .time-picker__columns {
    display: flex;
    max-height: 216px;
    overflow: hidden;
    border-radius: var(--nuraly-timepicker-local-border-radius);
    background: var(--nuraly-timepicker-local-background-color);
    padding: 4px 0;
  }

  .time-picker__column {
    flex: 1;
    border-right: 1px solid rgba(0, 0, 0, 0.06);
    background: transparent;
    overflow: hidden;
    position: relative;
    min-width: 60px;
  }

  .time-picker__column:last-child {
    border-right: none;
  }

  .time-picker__column-list {
    max-height: 216px;
    overflow-y: scroll;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.06) transparent;
    /* Custom scrollbar styling to match modern design */
    padding: 4px 2px;
    scroll-behavior: smooth;
    /* Force scrollbar to always be visible */
    -webkit-overflow-scrolling: touch;
  }

  .time-picker__column-list::-webkit-scrollbar {
    width: 6px;
    /* Always show scrollbar */
    -webkit-appearance: none;
  }

  .time-picker__column-list::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.04);
    margin: 8px 0;
    border-radius: var(--nuraly-timepicker-local-border-radius-sm);
  }

  .time-picker__column-list::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: var(--nuraly-timepicker-local-border-radius-sm);
    transition: background-color 0.2s ease;
    /* Ensure thumb is always visible */
    min-height: 20px;
  }

  .time-picker__column-list::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }

  .time-picker__column-list {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.04);
    scroll-behavior: smooth;
  }

  .time-picker__column-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px 8px;
    color: var(--nuraly-timepicker-local-text-color);
    font-size: var(--nuraly-timepicker-local-font-size);
    font-weight: var(--nuraly-timepicker-local-font-weight);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    border-radius: var(--nuraly-timepicker-local-border-radius);
    position: relative;
    user-select: none;
    line-height: var(--nuraly-timepicker-local-line-height);
    min-height: 28px;
    margin: 1px 2px;
  }

  .time-picker__column-item:hover {
    background-color: var(--nuraly-timepicker-local-control-item-bg-hover);
    color: var(--nuraly-timepicker-local-primary-color);
  }

  .time-picker__column-item:active {
    background-color: var(--nuraly-timepicker-local-control-item-bg-active);
    color: var(--nuraly-timepicker-local-primary-color);
  }

  .time-picker__column-item--selected {
    background-color: var(--nuraly-timepicker-local-control-item-bg-active);
    color: var(--nuraly-timepicker-local-primary-color);
    font-weight: 600;
    border-radius: var(--nuraly-timepicker-local-border-radius);
  }

  .time-picker__column-item--selected:hover {
    background-color: var(--nuraly-timepicker-local-control-item-bg-active);
    color: var(--nuraly-timepicker-local-primary-color);
  }

  .time-picker__column-item--focused {
    background-color: var(--nuraly-timepicker-local-control-item-bg-hover);
    outline: 2px solid var(--nuraly-timepicker-local-focus-color);
    outline-offset: -2px;
    border-radius: var(--nuraly-timepicker-local-border-radius);
    color: var(--nuraly-timepicker-local-primary-color);
  }

  .time-picker__column-item--disabled {
    opacity: 0.4;
    cursor: not-allowed;
    color: var(--timepicker-text-color-disabled);
  }

  .time-picker__column-item--disabled:hover {
    background-color: transparent;
    color: var(--timepicker-text-color-disabled);
  }

  .time-picker__dropdown--top {
    top: auto;
    bottom: 100%;
    margin-top: 0;
    margin-bottom: 4px;
  }

  .time-picker__clock-container {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: var(--timepicker-background-color);
  }

  .time-picker__digital-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--timepicker-border-color);
  }

  .time-picker__time-input {
    width: 56px;
    height: 32px;
    text-align: center;
    padding: 4px 8px;
    border: 1px solid var(--timepicker-border-color);
    border-radius: var(--timepicker-border-radius);
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: var(--timepicker-text-color);
    background-color: var(--timepicker-background-color);
    transition: all 0.3s;
    outline: none;
  }

  .time-picker__time-input:hover {
    border-color: var(--timepicker-primary-color-hover);
  }

  .time-picker__time-input:focus {
    border-color: var(--timepicker-primary-color);
    box-shadow: 0 0 0 2px var(--timepicker-primary-color-active);
  }

  .time-picker__separator {
    font-weight: 600;
    color: var(--timepicker-text-color);
  }

  .time-picker__period-toggle {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--timepicker-border-color);
    border-radius: var(--timepicker-border-radius);
    overflow: hidden;
    margin-left: 8px;
  }

  .time-picker__period-button {
    background: var(--timepicker-background-color);
    border: none;
    padding: 6px 12px;
    font-size: 12px;
    color: var(--timepicker-text-color);
    cursor: pointer;
    transition: all 0.3s;
    min-width: 44px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .time-picker__period-button:hover {
    background-color: var(--timepicker-item-hover-bg);
    color: var(--timepicker-text-color);
  }

  .time-picker__period-button--active {
    background-color: var(--timepicker-primary-color);
    color: #fff;
  }

  .time-picker__period-button + .time-picker__period-button {
    border-top: 1px solid var(--timepicker-border-color);
  }

  .time-picker__clock {
    width: var(--timepicker-clock-size);
    height: var(--timepicker-clock-size);
    border: 1px solid var(--timepicker-border-color);
    border-radius: 50%;
    background-color: var(--timepicker-background-color);
    position: relative;
    margin: 0 auto;
    user-select: none;
  }

  .time-picker__clock-face {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .time-picker__clock-number {
    position: absolute;
    color: var(--timepicker-text-color);
    font-size: 14px;
    font-weight: 400;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s;
    transform: translate(-50%, -50%);
  }

  .time-picker__clock-number:hover {
    background-color: var(--timepicker-item-hover-bg);
    color: var(--timepicker-text-color);
  }

  .time-picker__clock-number--selected {
    background-color: var(--timepicker-primary-color);
    color: #fff;
  }

  .time-picker__clock-hand {
    position: absolute;
    background-color: var(--timepicker-primary-color);
    transform-origin: bottom center;
    border-radius: 2px 2px 0 0;
  }

  .time-picker__clock-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    background-color: var(--timepicker-primary-color);
    border-radius: 50%;
    z-index: 10;
  }

  .time-picker__mode-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 8px;
  }

  .time-picker__mode-button {
    padding: 6px 16px;
    border: 1px solid var(--timepicker-border-color);
    background: var(--timepicker-background-color);
    color: var(--timepicker-text-color);
    border-radius: var(--timepicker-border-radius);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s;
    outline: none;
  }

  .time-picker__mode-button:hover {
    background-color: var(--timepicker-item-hover-bg);
    border-color: var(--timepicker-primary-color-hover);
  }

  .time-picker__mode-button--active {
    background-color: var(--timepicker-primary-color);
    color: #fff;
    border-color: var(--timepicker-primary-color);
  }

  .time-picker__actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding: 8px 12px;
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    background: var(--timepicker-background-color);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  /* Style nr-button components in actions */
  .time-picker__actions nr-button {
    border-radius: var(--nuraly-timepicker-local-border-radius);
    font-weight: 400;
    font-size: 14px;
    height: 28px;
  }

  

  .time-picker__label {
    display: block;
    margin-bottom: 8px;
    font-weight: 400;
    color: var(--timepicker-text-color);
    font-size: 14px;
  }

  .time-picker__helper-text {
    font-size: 14px;
    margin-top: 4px;
    color: var(--timepicker-text-color-secondary);
  }

  .time-picker__helper-text--error {
    color: var(--timepicker-error-color);
  }

  /* Size variants */
  :host([size="small"]) {
    --timepicker-height: 32px;
    --timepicker-font-size: 12px;
    --timepicker-padding: 4px 8px;
    --timepicker-clock-size: 240px;
  }

  :host([size="large"]) {
    --timepicker-height: 48px;
    --timepicker-font-size: 16px;
    --timepicker-padding: 12px 16px;
    --timepicker-clock-size: 320px;
  }

  /* Variant styles */
  :host([variant="outlined"]) .time-picker__input {
    background-color: transparent;
  }

  :host([variant="filled"]) .time-picker__input {
    border: none;
    background-color: var(--timepicker-border-color)33;
    border-bottom: 2px solid var(--timepicker-border-color);
    border-radius: var(--timepicker-border-radius) var(--timepicker-border-radius) 0 0;
  }

  :host([variant="filled"]) .time-picker__input:focus {
    border-bottom-color: var(--timepicker-focus-color);
    box-shadow: none;
  }

  /* Disabled state */
  :host([disabled]) .time-picker {
    pointer-events: none;
    opacity: 0.6;
  }

  /* Animation classes */
  .time-picker__dropdown {
    opacity: 0;
    transform: translateY(-8px);
    transition: opacity 0.2s, transform 0.2s;
  }

  .time-picker__dropdown--open {
    opacity: 1;
    transform: translateY(0);
  }

  /* Hide scrollbars on time inputs */
  .time-picker__time-input::-webkit-outer-spin-button,
  .time-picker__time-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .time-picker__time-input[type="number"] {
    -moz-appearance: textfield;
  }

  /* Responsive adjustments */
  @media (max-width: 480px) {
    .time-picker__clock {
      --timepicker-clock-size: 240px;
    }
    
    .time-picker__dropdown {
      left: 50%;
      transform: translateX(-50%);
      width: 90vw;
      max-width: 320px;
    }
  }
`;
