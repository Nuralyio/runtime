/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const styles = css`
  :host {
    /* ========================================
     * CSS CUSTOM PROPERTIES - RADIO GROUP
     * ======================================== */
    
    /* Group Layout */
    --nuraly-radio-group-gap: 12px;
    --nuraly-radio-group-horizontal-gap: 16px;

    /* Colors - Error/Warning states */
    --nuraly-radio-group-error-icon-color: var(--nuraly-color-radio-error-icon, #ef4444);
    --nuraly-radio-group-error-text-color: var(--nuraly-color-radio-error-text, #ef4444);
    --nuraly-radio-group-warning-icon-color: var(--nuraly-color-radio-warning-icon, #f59e0b);
    --nuraly-radio-group-warning-text-color: var(--nuraly-color-radio-warning-text, #f59e0b);

    /* Typography */
    --nuraly-radio-group-font-family: var(--nuraly-font-family-radio, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif);
    --nuraly-radio-group-message-font-size: var(--nuraly-font-size-radio-message, 12px);

    /* Button type styling */
    --nuraly-radio-group-button-border-radius: 4px;
    --nuraly-radio-group-button-hover-color: var(--nuraly-color-radio-border-hover, #7c3aed);

    /* Slot container styling */
    --nuraly-radio-group-slot-hover-bg: rgba(124, 58, 237, 0.04);
    --nuraly-radio-group-slot-selected-bg: rgba(124, 58, 237, 0.08);
    --nuraly-radio-group-slot-border-radius: 6px;

    /* ========================================
     * COMPONENT STYLES
     * ======================================== */
    
    width: fit-content;
    display: block;
    font-family: var(--nuraly-radio-group-font-family);
  }

  /* ========================================
   * RADIO GROUP LAYOUT
   * ======================================== */

  .radio-group {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-radio-group-gap);
  }

  .radio-group.horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--nuraly-radio-group-horizontal-gap);
  }

  .radio-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  /* ========================================
   * MESSAGE CONTAINERS (Error/Warning)
   * ======================================== */

  .radio-wrapper .message-container {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--nuraly-radio-group-message-font-size);
    padding-left: 28px; /* Align with radio label */
  }

  nr-icon {
    display: flex;
  }

  .radio-wrapper.error nr-icon {
    --nuraly-icon-color: var(--nuraly-radio-group-error-icon-color);
  }

  .radio-wrapper.warning nr-icon {
    --nuraly-icon-color: var(--nuraly-radio-group-warning-icon-color);
  }

  .radio-wrapper.error .message-container {
    color: var(--nuraly-radio-group-error-text-color);
  }

  .radio-wrapper.warning .message-container {
    color: var(--nuraly-radio-group-warning-text-color);
  }

  /* ========================================
   * BUTTON TYPE STYLING
   * ======================================== */

  .type-button {
    display: inline-flex;
    gap: 0px;
  }

  /* Button border radius for first and last child */
  .type-button :first-child {
    --nuraly-button-border-top-left-radius: var(--nuraly-radio-group-button-border-radius);
    --nuraly-button-border-bottom-left-radius: var(--nuraly-radio-group-button-border-radius);
  }

  .type-button :last-child {
    --nuraly-button-border-top-right-radius: var(--nuraly-radio-group-button-border-radius);
    --nuraly-button-border-bottom-right-radius: var(--nuraly-radio-group-button-border-radius);
  }

  .type-button nr-button:not(:last-child) {
    margin-right: -1px;
  }

  .type-button nr-button {
    position: relative;
    z-index: 1;
  }

  .type-button nr-button[type="default"]:hover {
    --nuraly-button-color: var(--nuraly-radio-group-button-hover-color);
    --nuraly-button-border-color: var(--nuraly-radio-group-button-hover-color);
    z-index: 2;
  }

  .type-button nr-button[type="primary"] {
    z-index: 1;
    position: relative;
  }

  /* Disabled button states */
  .type-button nr-button[disabled] {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }

  .type-button nr-button[disabled]:hover {
    z-index: auto;
    --nuraly-button-border-color: var(--nuraly-button-disabled-border-color, var(--nuraly-button-local-disabled-border-color));
    --nuraly-button-background-color: var(--nuraly-button-disabled-background-color, var(--nuraly-button-local-disabled-background-color));
    --nuraly-button-color: var(--nuraly-button-disabled-text-color, var(--nuraly-button-local-disabled-text-color));
  }

  .type-button nr-button[type="primary"][disabled] {
    --nuraly-button-background-color: var(--nuraly-button-primary-disabled-background-color, var(--nuraly-button-local-primary-disabled-background-color));
    --nuraly-button-border-color: var(--nuraly-button-primary-disabled-border-color, var(--nuraly-button-local-primary-disabled-border-color));
    --nuraly-button-color: var(--nuraly-button-primary-disabled-text-color, var(--nuraly-button-local-primary-disabled-text-color));
  }

  .type-button nr-button[type="primary"][disabled] nr-icon {
    --nuraly-icon-color: var(--nuraly-button-primary-disabled-text-color, var(--nuraly-button-local-primary-disabled-text-color));
    --nuraly-icon-local-color: var(--nuraly-button-primary-disabled-text-color, var(--nuraly-button-local-primary-disabled-text-color));
  }

  /* ========================================
   * AUTO WIDTH STYLING
   * ======================================== */

  :host([auto-width]) .type-button nr-button {
    --nr-button-min-width: auto;
    min-width: auto;
    width: auto;
  }

  /* Icon-only buttons with auto-width should have minimal padding */
  :host([auto-width]) .type-button nr-button.icon-only {
    --nr-button-min-width: auto;
    padding: 0.375rem; /* Even more minimal padding for icon-only */
    min-width: auto;
    width: auto;
  }

  /* For small size icon-only buttons, use even less padding */
  :host([auto-width]) .type-button nr-button.icon-only[size="small"] {
    padding: 0.25rem;
  }

  /* For large size icon-only buttons, use slightly more padding */
  :host([auto-width]) .type-button nr-button.icon-only[size="large"] {
    padding: 0.5rem;
  }

  /* ========================================
   * SLOT-BASED RADIO STYLING
   * ======================================== */

  .slot-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 8px;
    border-radius: var(--nuraly-radio-group-slot-border-radius);
  }

  .slot-wrapper:hover {
    background-color: var(--nuraly-radio-group-slot-hover-bg);
  }

  .slot-wrapper nr-radio {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .slot-wrapper .slot-content {
    flex: 1;
    min-width: 0;
  }

  .slot-container.selected .slot-wrapper {
    background-color: var(--nuraly-radio-group-slot-selected-bg);
  }
`;
