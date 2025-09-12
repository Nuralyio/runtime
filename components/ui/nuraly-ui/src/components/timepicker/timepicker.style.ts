/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const styles = css`
  :host {
    --timepicker-font-family: var(--hybrid-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);
    --timepicker-font-size: var(--hybrid-font-size-medium, 14px);
    --timepicker-line-height: var(--hybrid-line-height-medium, 1.5715);
    
    /* Color system matching select component exactly */
    --timepicker-background-color: var(--hybrid-background-color, #ffffff);
    --timepicker-text-color: var(--hybrid-text-color, #262626);
    --timepicker-text-color-secondary: var(--hybrid-text-color-secondary, #8c8c8c);
    --timepicker-text-color-disabled: var(--hybrid-text-color-disabled, #8c8c8c);
    --timepicker-border-color: var(--hybrid-border-color, #d9d9d9);
    --timepicker-border-color-hover: var(--hybrid-border-color-hover, #1677ff);
    --timepicker-focus-color: var(--hybrid-focus-color, #1677ff);
    --timepicker-error-color: var(--hybrid-error-color, #ff4d4f);
    --timepicker-warning-color: var(--hybrid-warning-color, #faad14);
    --timepicker-success-color: var(--hybrid-success-color, #52c41a);
    --timepicker-disabled-bg: var(--hybrid-disabled-bg, #f5f5f5);
    
    /* Select component matching colors */
    --timepicker-primary-color: #1677ff;
    --timepicker-primary-color-hover: #1677ff;
    --timepicker-primary-color-active: #1677ff;
    --timepicker-control-item-bg-hover: #f5f5f5;
    --timepicker-control-item-bg-active: #e6f7ff;
    
    --timepicker-border-radius: var(--hybrid-border-radius, 6px);
    --timepicker-padding: var(--hybrid-padding-medium, 4px 11px);
    --timepicker-height: var(--hybrid-input-height, 32px);
    --timepicker-font-weight: 400;
    
    --timepicker-clock-size: 224px;
    --timepicker-clock-background: var(--hybrid-background-color, #ffffff);
    --timepicker-clock-border: var(--hybrid-border-color, #f0f0f0);
    --timepicker-clock-face-color: var(--hybrid-text-color-muted, rgba(0, 0, 0, 0.65));
    --timepicker-clock-hand-color: var(--timepicker-primary-color);
    --timepicker-clock-number-color: var(--hybrid-text-color, rgba(0, 0, 0, 0.88));
    
    /* Shadows */
    --timepicker-box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
    --timepicker-box-shadow-secondary: 0 2px 8px rgba(0, 0, 0, 0.15);
    
    display: block;
    font-family: var(--timepicker-font-family);
    font-size: var(--timepicker-font-size);
    line-height: var(--timepicker-line-height);
    font-weight: var(--timepicker-font-weight);
  }

  /* Light theme styles using data-theme attribute */
  .time-picker[data-theme="light"] {
    /* Override colors for light theme */
    --timepicker-background-color: #ffffff;
    --timepicker-text-color: #262626;
    --timepicker-text-color-secondary: #8c8c8c;
    --timepicker-border-color: #d9d9d9;
    --timepicker-border-color-hover: #1677ff;
    --timepicker-focus-color: #1677ff;
    --timepicker-primary-color: #1677ff;
    --timepicker-control-item-bg-hover: #f5f5f5;
    --timepicker-control-item-bg-active: #e6f7ff;
  }

  /* Dark theme styles using data-theme attribute */
  .time-picker[data-theme="dark"] {
    /* Override colors for dark theme */
    --timepicker-background-color: #262626;
    --timepicker-text-color: #ffffff;
    --timepicker-text-color-secondary: #8c8c8c;
    --timepicker-border-color: #424242;
    --timepicker-border-color-hover: #4096ff;
    --timepicker-focus-color: #4096ff;
    --timepicker-primary-color: #4096ff;
    --timepicker-control-item-bg-hover: #393939;
    --timepicker-control-item-bg-active: #1e3a5f;
  }

  .time-picker {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  /* Input wrapper hover and focus states matching select component */
  .time-picker__input-wrapper:hover:not(.time-picker--disabled) nr-input {
    --hybrid-input-border-color: var(--timepicker-border-color-hover);
  }

  .time-picker__input-wrapper:focus-within nr-input,
  .time-picker--open .time-picker__input-wrapper nr-input,
  .time-picker__input-wrapper nr-input:focus {
    --hybrid-input-border-color: var(--timepicker-focus-color);
    --hybrid-input-box-shadow: 0 0 0 2px var(--timepicker-focus-color)33;
  }

  /* Disabled state styling */
  .time-picker--disabled .time-picker__input-wrapper nr-input {
    --hybrid-input-background-color: var(--timepicker-disabled-bg);
    --hybrid-input-border-color: var(--timepicker-border-color);
    --hybrid-input-text-color: var(--timepicker-text-color-disabled);
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
    border-radius: 4px !important;
  }

  .time-picker__trigger svg {
    width: 16px;
    height: 16px;
    color: var(--timepicker-text-color-secondary);
    transition: color 0.2s ease;
  }

  .time-picker__trigger:hover svg {
    color: var(--timepicker-primary-color);
  }

  .time-picker__trigger:hover {
    color: var(--timepicker-primary-color);
  }

  .time-picker__trigger:disabled {
    color: var(--timepicker-text-color-disabled);
    cursor: not-allowed;
  }

  .time-picker__trigger svg {
    width: 14px;
    height: 14px;
  }

    .time-picker__dropdown {
    position: absolute;
    z-index: 1000;
    background-color: var(--timepicker-background-color);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--timepicker-border-color);
    border-radius: 8px;
    box-shadow: 
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05);
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
    border-radius: 8px;
    background: var(--timepicker-background-color);
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
    border-radius: 3px;
  }

  .time-picker__column-list::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
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
    color: var(--timepicker-text-color);
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    border-radius: 4px;
    position: relative;
    user-select: none;
    line-height: 1.5715;
    min-height: 28px;
    margin: 1px 2px;
  }

  .time-picker__column-item:hover {
    background-color: var(--timepicker-control-item-bg-hover);
    color: var(--timepicker-primary-color);
  }

  .time-picker__column-item:active {
    background-color: var(--timepicker-control-item-bg-active);
    color: var(--timepicker-primary-color);
  }

  .time-picker__column-item--selected {
    background-color: #e6f7ff;
    color: #1677ff;
    font-weight: 600;
    border-radius: 4px;
  }

  .time-picker__column-item--selected:hover {
    background-color: #bae7ff;
    color: #1677ff;
  }

  .time-picker__column-item--focused {
    background-color: var(--timepicker-control-item-bg-hover);
    outline: 2px solid var(--timepicker-focus-color);
    outline-offset: -2px;
    border-radius: 4px;
    color: var(--timepicker-primary-color);
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
    border-radius: 6px;
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

  /* Dark theme */
  :host([data-theme="dark"]) {
    --timepicker-background-color: var(--hybrid-dark-background-color, #1f2937);
    --timepicker-text-color: var(--hybrid-dark-text-color, #f9fafb);
    --timepicker-border-color: var(--hybrid-dark-border-color, #374151);
    --timepicker-clock-background: var(--hybrid-dark-background-color, #1f2937);
    --timepicker-clock-border: var(--hybrid-dark-border-color, #4b5563);
    --timepicker-clock-face-color: var(--hybrid-dark-text-color-muted, #9ca3af);
    --timepicker-clock-number-color: var(--hybrid-dark-text-color, #f9fafb);
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
