/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const dataNodeFieldStyles = css`
  :host {
    display: block;
    font-family: var(--nuraly-font-family, system-ui, -apple-system, sans-serif);
  }

  /* Common field styles */
  .field-container {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .field-label {
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: 500;
    color: var(--nuraly-color-text-secondary, #64748b);
  }

  .field-description {
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-muted, #94a3b8);
    margin-top: var(--nuraly-spacing-1, 4px);
  }

  .field-error {
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-error, #ef4444);
    margin-top: var(--nuraly-spacing-1, 4px);
  }

  /* Expression input styles */
  .expression-input {
    position: relative;
    font-family: var(--nuraly-font-family-mono, 'JetBrains Mono', monospace);
  }

  .expression-input input,
  .expression-input textarea {
    width: 100%;
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-md, 6px);
    background: var(--nuraly-color-bg-input, #ffffff);
    color: var(--nuraly-color-text-primary, #1e293b);
    font-size: var(--nuraly-font-size-sm, 13px);
    font-family: inherit;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
    box-sizing: border-box;
  }

  .expression-input input:focus,
  .expression-input textarea:focus {
    outline: none;
    border-color: var(--nuraly-color-primary, #6366f1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  .expression-input .expression-highlight {
    color: var(--nuraly-color-primary, #6366f1);
    font-weight: 500;
  }

  /* Filter builder styles */
  .filter-builder {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-3, 12px);
  }

  .filter-group {
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-md, 6px);
    padding: var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-bg-subtle, #f8fafc);
  }

  .filter-group-header {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    margin-bottom: var(--nuraly-spacing-3, 12px);
  }

  .filter-group-logic {
    display: inline-flex;
    gap: var(--nuraly-spacing-1, 4px);
    background: var(--nuraly-color-bg-elevated, #ffffff);
    padding: var(--nuraly-spacing-1, 4px);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
  }

  .filter-group-logic button {
    padding: var(--nuraly-spacing-1, 4px) var(--nuraly-spacing-2, 8px);
    border: none;
    background: transparent;
    border-radius: var(--nuraly-border-radius-xs, 3px);
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: 600;
    cursor: pointer;
    color: var(--nuraly-color-text-secondary, #64748b);
    transition: background 0.15s ease, color 0.15s ease;
  }

  .filter-group-logic button:hover {
    background: var(--nuraly-color-bg-hover, #f1f5f9);
  }

  .filter-group-logic button.active {
    background: var(--nuraly-color-primary, #6366f1);
    color: white;
  }

  .filter-conditions {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .filter-condition {
    display: grid;
    grid-template-columns: 1fr auto 1fr auto;
    gap: var(--nuraly-spacing-2, 8px);
    align-items: center;
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-bg-elevated, #ffffff);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    border: 1px solid var(--nuraly-color-border-light, #f1f5f9);
  }

  .filter-condition select,
  .filter-condition input {
    width: 100%;
    padding: var(--nuraly-spacing-2, 8px);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    background: var(--nuraly-color-bg-input, #ffffff);
    font-size: var(--nuraly-font-size-sm, 13px);
    color: var(--nuraly-color-text-primary, #1e293b);
  }

  .filter-condition select:focus,
  .filter-condition input:focus {
    outline: none;
    border-color: var(--nuraly-color-primary, #6366f1);
  }

  .filter-remove-btn {
    padding: var(--nuraly-spacing-1, 4px);
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--nuraly-color-text-muted, #94a3b8);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    transition: color 0.15s ease, background 0.15s ease;
  }

  .filter-remove-btn:hover {
    color: var(--nuraly-color-error, #ef4444);
    background: rgba(239, 68, 68, 0.1);
  }

  .filter-actions {
    display: flex;
    gap: var(--nuraly-spacing-2, 8px);
    margin-top: var(--nuraly-spacing-2, 8px);
  }

  .filter-add-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
    padding: var(--nuraly-spacing-1, 4px) var(--nuraly-spacing-2, 8px);
    background: transparent;
    border: 1px dashed var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    cursor: pointer;
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-secondary, #64748b);
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .filter-add-btn:hover {
    border-color: var(--nuraly-color-primary, #6366f1);
    color: var(--nuraly-color-primary, #6366f1);
  }

  /* Field mapper styles */
  .field-mapper {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .field-mapper-header {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-bg-subtle, #f8fafc);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: 600;
    color: var(--nuraly-color-text-secondary, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .field-mapper-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: var(--nuraly-spacing-2, 8px);
    align-items: center;
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-bg-elevated, #ffffff);
    border: 1px solid var(--nuraly-color-border-light, #f1f5f9);
    border-radius: var(--nuraly-border-radius-sm, 4px);
  }

  .field-mapper-row select,
  .field-mapper-row input {
    width: 100%;
    padding: var(--nuraly-spacing-2, 8px);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    background: var(--nuraly-color-bg-input, #ffffff);
    font-size: var(--nuraly-font-size-sm, 13px);
    color: var(--nuraly-color-text-primary, #1e293b);
    font-family: var(--nuraly-font-family-mono, 'JetBrains Mono', monospace);
  }

  .field-mapper-row select:focus,
  .field-mapper-row input:focus {
    outline: none;
    border-color: var(--nuraly-color-primary, #6366f1);
  }

  /* Sort builder styles */
  .sort-builder {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .sort-item {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--nuraly-spacing-2, 8px);
    align-items: center;
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-bg-elevated, #ffffff);
    border: 1px solid var(--nuraly-color-border-light, #f1f5f9);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    cursor: grab;
  }

  .sort-item:active {
    cursor: grabbing;
  }

  .sort-item.dragging {
    opacity: 0.5;
  }

  .sort-item select {
    width: 100%;
    padding: var(--nuraly-spacing-2, 8px);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    background: var(--nuraly-color-bg-input, #ffffff);
    font-size: var(--nuraly-font-size-sm, 13px);
    color: var(--nuraly-color-text-primary, #1e293b);
  }

  .sort-direction-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    background: var(--nuraly-color-bg-elevated, #ffffff);
    cursor: pointer;
    color: var(--nuraly-color-text-secondary, #64748b);
    transition: border-color 0.15s ease, color 0.15s ease;
  }

  .sort-direction-btn:hover {
    border-color: var(--nuraly-color-primary, #6366f1);
    color: var(--nuraly-color-primary, #6366f1);
  }

  .sort-direction-btn.asc {
    color: var(--nuraly-color-primary, #6366f1);
    border-color: var(--nuraly-color-primary, #6366f1);
    background: rgba(99, 102, 241, 0.1);
  }

  /* Select with icons */
  .icon-select {
    position: relative;
  }

  .icon-select-option {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px);
  }

  .icon-select-option nr-icon {
    color: var(--nuraly-color-text-muted, #94a3b8);
  }

  .icon-select-option .option-label {
    flex: 1;
  }

  .icon-select-option .option-description {
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-muted, #94a3b8);
  }

  /* Multi-select tokens */
  .multi-select-tokens {
    display: flex;
    flex-wrap: wrap;
    gap: var(--nuraly-spacing-1, 4px);
    padding: var(--nuraly-spacing-2, 8px);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-md, 6px);
    background: var(--nuraly-color-bg-input, #ffffff);
    min-height: 38px;
  }

  .multi-select-token {
    display: inline-flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
    padding: var(--nuraly-spacing-1, 4px) var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-bg-subtle, #f8fafc);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-primary, #1e293b);
  }

  .multi-select-token button {
    display: flex;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--nuraly-color-text-muted, #94a3b8);
  }

  .multi-select-token button:hover {
    color: var(--nuraly-color-error, #ef4444);
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--nuraly-spacing-6, 24px);
    text-align: center;
    color: var(--nuraly-color-text-muted, #94a3b8);
    border: 1px dashed var(--nuraly-color-border, #e2e8f0);
    border-radius: var(--nuraly-border-radius-md, 6px);
  }

  .empty-state nr-icon {
    margin-bottom: var(--nuraly-spacing-2, 8px);
    opacity: 0.5;
  }

  .empty-state-text {
    font-size: var(--nuraly-font-size-sm, 13px);
  }

  /* Variable name input */
  .variable-name-input {
    display: flex;
    align-items: center;
    gap: 0;
  }

  .variable-name-prefix {
    display: flex;
    align-items: center;
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-bg-subtle, #f8fafc);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-right: none;
    border-radius: var(--nuraly-border-radius-md, 6px) 0 0 var(--nuraly-border-radius-md, 6px);
    font-size: var(--nuraly-font-size-sm, 13px);
    color: var(--nuraly-color-text-muted, #94a3b8);
    font-family: var(--nuraly-font-family-mono, 'JetBrains Mono', monospace);
  }

  .variable-name-input input {
    flex: 1;
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    border: 1px solid var(--nuraly-color-border, #e2e8f0);
    border-radius: 0 var(--nuraly-border-radius-md, 6px) var(--nuraly-border-radius-md, 6px) 0;
    background: var(--nuraly-color-bg-input, #ffffff);
    font-size: var(--nuraly-font-size-sm, 13px);
    font-family: var(--nuraly-font-family-mono, 'JetBrains Mono', monospace);
    color: var(--nuraly-color-text-primary, #1e293b);
  }

  .variable-name-input input:focus {
    outline: none;
    border-color: var(--nuraly-color-primary, #6366f1);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  /* Dark theme overrides */
  :host([data-theme="dark"]) .filter-group,
  :host([data-theme="dark"]) .field-mapper-header {
    background: var(--nuraly-color-bg-subtle-dark, #1e293b);
  }

  :host([data-theme="dark"]) .filter-condition,
  :host([data-theme="dark"]) .field-mapper-row,
  :host([data-theme="dark"]) .sort-item {
    background: var(--nuraly-color-bg-elevated-dark, #0f172a);
    border-color: var(--nuraly-color-border-dark, #334155);
  }

  :host([data-theme="dark"]) input,
  :host([data-theme="dark"]) select,
  :host([data-theme="dark"]) textarea {
    background: var(--nuraly-color-bg-input-dark, #1e293b);
    border-color: var(--nuraly-color-border-dark, #334155);
    color: var(--nuraly-color-text-primary-dark, #f8fafc);
  }
`;
