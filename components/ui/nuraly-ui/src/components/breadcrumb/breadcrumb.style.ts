/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * Breadcrumb component styles for the Hybrid UI Library
 * Using shared CSS variables from /src/shared/themes/
 * 
 * This file contains all the styling for the nr-breadcrumb component with
 * clean CSS variable usage without local fallbacks and proper theme switching support.
 */
export const styles = css`
  :host {
    display: block;
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-breadcrumb-font-size, 0.875rem);
    line-height: var(--nuraly-breadcrumb-line-height, 1.5);
    color: var(--nuraly-breadcrumb-item-color);
  }

  .breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 0.25rem);
    position: relative;
  }

  .breadcrumb-item:not(:last-child) {
    margin-right: var(--nuraly-breadcrumb-separator-margin, 8px);
  }

  .breadcrumb-link {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 0.25rem);
    color: var(--nuraly-breadcrumb-link-color);
    text-decoration: none;
    transition: color var(--nuraly-transition-fast, 0.15s) ease;
    cursor: pointer;
    padding: var(--nuraly-spacing-1, 0.25rem) 0;
    border-radius: var(--nuraly-border-radius-small, 2px);
  }

  .breadcrumb-link:hover {
    color: var(--nuraly-breadcrumb-link-hover-color);
  }

  .breadcrumb-link:focus {
    outline: var(--nuraly-focus-outline);
    outline-offset: var(--nuraly-focus-outline-offset);
  }

  .breadcrumb-link.disabled {
    color: var(--nuraly-color-text-disabled);
    cursor: not-allowed;
    pointer-events: none;
  }

  .breadcrumb-text {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 0.25rem);
    color: var(--nuraly-breadcrumb-last-item-color);
    padding: var(--nuraly-spacing-1, 0.25rem) 0;
  }

  .breadcrumb-separator {
    display: inline-flex;
    align-items: center;
    color: var(--nuraly-breadcrumb-separator-color);
    margin: 0 var(--nuraly-breadcrumb-separator-margin, 8px);
    user-select: none;
    font-size: var(--nuraly-breadcrumb-icon-font-size, 14px);
  }

  .breadcrumb-icon {
    display: inline-flex;
    align-items: center;
    font-size: var(--nuraly-breadcrumb-icon-font-size, 14px);
  }

  /* Dropdown menu styles */
  .breadcrumb-item-with-menu {
    position: relative;
  }

  .breadcrumb-item-with-menu:hover .breadcrumb-dropdown {
    display: block;
  }

  .breadcrumb-dropdown {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    z-index: var(--nuraly-z-index-dropdown, 1000);
    background-color: var(--nuraly-color-background-elevated);
    border: 1px solid var(--nuraly-color-border);
    border-radius: var(--nuraly-border-radius-medium, 4px);
    box-shadow: var(--nuraly-shadow-dropdown);
    min-width: 160px;
    margin-top: var(--nuraly-spacing-1, 0.25rem);
    padding: var(--nuraly-spacing-1, 0.25rem) 0;
  }

  .breadcrumb-menu-item {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 0.5rem);
    padding: var(--nuraly-spacing-2, 0.5rem) var(--nuraly-spacing-3, 0.75rem);
    color: var(--nuraly-color-text);
    text-decoration: none;
    cursor: pointer;
    transition: background-color var(--nuraly-transition-fast, 0.15s) ease;
  }

  .breadcrumb-menu-item:hover {
    background-color: var(--nuraly-color-background-hover);
  }

  .breadcrumb-menu-item.disabled {
    color: var(--nuraly-color-text-disabled);
    cursor: not-allowed;
    pointer-events: none;
  }

  /* RTL Support */
  :host([dir="rtl"]) .breadcrumb {
    direction: rtl;
  }

  :host([dir="rtl"]) .breadcrumb-item:not(:last-child) {
    margin-right: 0;
    margin-left: var(--nuraly-breadcrumb-separator-margin, 8px);
  }

  :host([dir="rtl"]) .breadcrumb-separator {
    transform: scaleX(-1);
  }
`;
