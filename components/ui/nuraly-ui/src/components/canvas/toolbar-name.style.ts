/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * Shared toolbar name editing styles used by both workflow-canvas and whiteboard-canvas.
 * Extracted to a shared module to avoid CSS duplication across shadow DOM boundaries.
 */
export const toolbarNameStyles = css`
  /* Toolbar name — read-only button */
  .toolbar-name-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    height: var(--nuraly-size-sm, 32px);
    padding: 0 10px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--nuraly-border-radius-small, 4px);
    color: var(--nuraly-color-text-primary, #e5e5e5);
    cursor: pointer;
    transition: background var(--nuraly-transition-fast, 0.15s) ease;
    max-width: 200px;
    min-width: 0;
  }

  .toolbar-name-btn:hover {
    background: var(--nuraly-color-layer-hover-02, rgba(255, 255, 255, 0.1));
  }

  .toolbar-name-btn:disabled {
    cursor: default;
    opacity: 0.7;
  }

  .toolbar-name-btn:disabled .toolbar-name-edit-icon {
    display: none;
  }

  .toolbar-name-text {
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .toolbar-name-edit-icon {
    flex-shrink: 0;
    opacity: 0;
    transition: opacity var(--nuraly-transition-fast, 0.15s) ease;
    --nuraly-icon-size: 12px;
    color: var(--nuraly-color-text-secondary, #888);
  }

  .toolbar-name-btn:hover .toolbar-name-edit-icon {
    opacity: 1;
  }

  /* Toolbar name — editing state */
  .toolbar-name-container {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .toolbar-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--nuraly-color-text-primary, #e5e5e5);
    outline: none;
    padding: 4px 8px;
    border-radius: var(--nuraly-border-radius-small, 4px);
    min-width: 60px;
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
  }

  .toolbar-name.editing {
    background: var(--nuraly-color-layer-hover-02, rgba(255, 255, 255, 0.15));
    box-shadow: 0 0 0 2px var(--nuraly-color-interactive, #3b82f6);
  }

  .toolbar-name-action {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    min-height: 44px;
    min-width: 44px;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: var(--nuraly-border-radius-small, 4px);
    cursor: pointer;
    transition: background var(--nuraly-transition-fast, 0.15s) ease;
  }

  .toolbar-name-action.save {
    color: var(--nuraly-color-success, #22c55e);
  }

  .toolbar-name-action.save:hover {
    background: rgba(34, 197, 94, 0.15);
  }

  .toolbar-name-action.cancel {
    color: var(--nuraly-color-text-secondary, #888);
  }

  .toolbar-name-action.cancel:hover {
    background: var(--nuraly-color-layer-hover-02, rgba(255, 255, 255, 0.1));
  }

  /* Mobile: always show edit icon, larger touch targets */
  @media (max-width: 768px) {
    .toolbar-name-btn {
      max-width: 120px;
      padding: 0 8px;
      min-height: 44px;
    }

    .toolbar-name-edit-icon {
      opacity: 1;
    }

    .toolbar-name {
      max-width: 120px;
    }
  }
`;
