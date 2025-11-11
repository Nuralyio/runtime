/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export default css`
  :host {
    /* Sizing */
    --icon-picker-trigger-width: 100%;
    --icon-picker-trigger-height: auto;
    --icon-picker-dropdown-width: 320px;
    --icon-picker-dropdown-max-height: 380px;
    --icon-picker-grid-gap: 4px;
    --icon-picker-icon-size: 24px;
    --icon-picker-icon-padding: 8px;
    
    /* Colors - Light mode */
    --icon-picker-background: var(--nuraly-background-primary, #ffffff);
    --icon-picker-border: var(--nuraly-border-color, #d0d0d0);
    --icon-picker-text: var(--nuraly-text-primary, #000000);
    --icon-picker-hover-bg: var(--nuraly-background-hover, #f5f5f5);
    --icon-picker-selected-bg: var(--nuraly-primary-light, #e6f7ff);
    --icon-picker-selected-border: var(--nuraly-primary-color, #1890ff);
    --icon-picker-placeholder-color: var(--nuraly-text-secondary, #999999);
    
    display: inline-block;
    width: var(--icon-picker-trigger-width);
    position: relative;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --icon-picker-background: var(--nuraly-background-primary, #1f1f1f);
      --icon-picker-border: var(--nuraly-border-color, #404040);
      --icon-picker-text: var(--nuraly-text-primary, #ffffff);
      --icon-picker-hover-bg: var(--nuraly-background-hover, #2a2a2a);
      --icon-picker-selected-bg: var(--nuraly-primary-dark, #003a8c);
      --icon-picker-selected-border: var(--nuraly-primary-color, #40a9ff);
    }
  }

  /* Trigger container */
  .trigger-container {
    width: 100%;
  }

  .trigger-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 12px;
    cursor: pointer;
  }

  /* Icon preview in trigger */
  .icon-preview {
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .icon-name {
    font-size: 0.875rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--icon-picker-text);
  }

  .placeholder {
    font-size: 0.875rem;
    color: var(--icon-picker-placeholder-color);
  }

  /* Dropdown content */
  .dropdown-content {
    width: var(--icon-picker-dropdown-width);
    max-height: var(--icon-picker-dropdown-max-height);
    background: var(--icon-picker-background);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Search container */
  .search-container {
    padding: 12px;
    background: var(--icon-picker-background);
    border-bottom: 1px solid var(--icon-picker-border);
    flex-shrink: 0;
    z-index: 10;
  }

  /* Icons grid container */
  .icons-grid-container {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 8px;
    background: var(--icon-picker-background);
  }

  /* Icon grid using lit-virtualizer */
  .icons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--icon-picker-grid-gap), 1fr));
    gap: var(--icon-picker-grid-gap);
  }

  /* Individual icon item */
  .icon-item {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--icon-picker-icon-padding);
    cursor: pointer;
    border-radius: 4px;
    border: 2px solid transparent;
    transition: all 0.2s ease;
    min-width: var(--icon-picker-icon-size);
    min-height: var(--icon-picker-icon-size);
  }

  .icon-item:hover {
    background-color: var(--icon-picker-hover-bg);
  }

  .icon-item.selected {
    background-color: var(--icon-picker-selected-bg);
    border-color: var(--icon-picker-selected-border);
  }

  .icon-item:focus {
    outline: 2px solid var(--icon-picker-selected-border);
    outline-offset: 2px;
  }

  .icon-item nr-icon {
    font-size: var(--icon-picker-icon-size);
    color: var(--icon-picker-text);
  }

  /* Empty state */
  .empty-state {
    padding: 40px 20px;
    text-align: center;
    color: var(--icon-picker-placeholder-color);
  }

  .empty-state nr-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .empty-message {
    font-size: 0.875rem;
  }

  /* Loading state */
  .loading-state {
    padding: 40px 20px;
    text-align: center;
    color: var(--icon-picker-placeholder-color);
  }

  /* Disabled state */
  :host([disabled]) {
    opacity: 0.6;
    pointer-events: none;
  }

  /* Size variants */
  :host([size="small"]) {
    --icon-picker-icon-size: 20px;
    --icon-picker-icon-padding: 6px;
    --icon-picker-dropdown-width: 280px;
  }

  :host([size="large"]) {
    --icon-picker-icon-size: 28px;
    --icon-picker-icon-padding: 10px;
    --icon-picker-dropdown-width: 360px;
  }

  /* Accessibility */
  @media (prefers-reduced-motion: reduce) {
    .icon-item {
      transition: none;
    }
  }

  /* Scrollbar styling */
  .icons-grid-container::-webkit-scrollbar {
    width: 8px;
  }

  .icons-grid-container::-webkit-scrollbar-track {
    background: transparent;
  }

  .icons-grid-container::-webkit-scrollbar-thumb {
    background: var(--icon-picker-border);
    border-radius: 4px;
  }

  .icons-grid-container::-webkit-scrollbar-thumb:hover {
    background: var(--icon-picker-text);
    opacity: 0.5;
  }
`;
