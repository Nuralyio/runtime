/**
 * @license
 * Copyright 2024 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

/**
 * Shared chatbot panel styles used by both workflow-canvas and whiteboard-canvas.
 * Extracted to avoid duplication across shadow DOM boundaries.
 */
export const chatbotPanelStyles = css`
  /* ========================================
   * CHATBOT PANEL (AI Assistant side panel)
   * ======================================== */

  .chatbot-panel {
    position: absolute;
    top: 0;
    right: 0;
    width: 380px;
    height: 100%;
    z-index: 999;
    display: flex;
    flex-direction: column;
    background: var(--nuraly-color-layer-01, #ffffff);
    border-left: 1px solid var(--nuraly-color-border-subtle, #e0e0e0);
    box-shadow: var(--nuraly-shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.15));
    animation: chatbot-panel-slide-in 0.2s ease-out;
    /* Override canvas touch-action:none so inputs/scrolling work on mobile */
    touch-action: auto;
  }

  @keyframes chatbot-panel-slide-in {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .chatbot-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    border-bottom: 1px solid var(--nuraly-color-border-subtle, #e0e0e0);
    background: var(--nuraly-color-layer-02, #f8f8f8);
    flex-shrink: 0;
  }

  .chatbot-panel-title {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-text-primary, #161616);
  }

  .chatbot-panel-title nr-icon {
    color: var(--nuraly-color-interactive, #3b82f6);
  }

  .chatbot-panel-close {
    background: none;
    border: none;
    color: var(--nuraly-color-text-secondary, #888);
    cursor: pointer;
    padding: var(--nuraly-spacing-1, 4px);
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--nuraly-border-radius-small, 4px);
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
  }

  .chatbot-panel-close:hover {
    color: var(--nuraly-color-text-primary, #161616);
    background: var(--nuraly-color-layer-hover-01, rgba(0, 0, 0, 0.05));
  }

  .chatbot-panel-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .chatbot-panel-content nr-chatbot {
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    --chatbot-border-radius: 0;
    --chatbot-height: 100%;
    --chatbot-min-height: 100%;
    --nuraly-size-chatbot-min-width: 0;
    --nuraly-size-chatbot-container-min-width: 0;
    --nuraly-size-chatbot-input-min-width: 0;
    --nuraly-size-chatbot-actions-min-width: 0;
    --nuraly-spacing-05: 6px;
    --nuraly-spacing-06: 8px;
    --nuraly-border-radius-md: 8px;
    --nuraly-border-width-chatbot-input: 1px;
    --nuraly-color-chatbot-border: transparent;
  }

  .toolbar-btn {
    position: relative;
  }

  .toolbar-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--nuraly-color-support-error, #da1e28);
    color: #fff;
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  /* Light theme for chatbot panel */
  .chatbot-panel[data-theme="light"],
  .chatbot-panel[data-theme="carbon-light"],
  .chatbot-panel[data-theme="default-light"],
  .chatbot-panel[data-theme="default"] {
    background: var(--nuraly-color-layer-01, #ffffff);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
  }

  .chatbot-panel[data-theme="light"] .chatbot-panel-header,
  .chatbot-panel[data-theme="carbon-light"] .chatbot-panel-header,
  .chatbot-panel[data-theme="default-light"] .chatbot-panel-header,
  .chatbot-panel[data-theme="default"] .chatbot-panel-header {
    background: var(--nuraly-color-layer-02, #f4f4f4);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
  }

  .chatbot-panel[data-theme="light"] .chatbot-panel-title,
  .chatbot-panel[data-theme="carbon-light"] .chatbot-panel-title,
  .chatbot-panel[data-theme="default-light"] .chatbot-panel-title,
  .chatbot-panel[data-theme="default"] .chatbot-panel-title {
    color: var(--nuraly-color-text-primary, #161616);
  }

  /* Dark theme for chatbot panel */
  .chatbot-panel[data-theme="dark"],
  .chatbot-panel[data-theme="carbon-dark"],
  .chatbot-panel[data-theme="default-dark"] {
    background: var(--nuraly-color-layer-01, #262626);
    border-color: var(--nuraly-color-border-subtle, #393939);
  }

  .chatbot-panel[data-theme="dark"] .chatbot-panel-header,
  .chatbot-panel[data-theme="carbon-dark"] .chatbot-panel-header,
  .chatbot-panel[data-theme="default-dark"] .chatbot-panel-header {
    background: var(--nuraly-color-layer-02, #333333);
    border-color: var(--nuraly-color-border-subtle, #393939);
  }

  .chatbot-panel[data-theme="dark"] .chatbot-panel-title,
  .chatbot-panel[data-theme="carbon-dark"] .chatbot-panel-title,
  .chatbot-panel[data-theme="default-dark"] .chatbot-panel-title {
    color: var(--nuraly-color-text-primary, #e5e5e5);
  }

  .chatbot-panel[data-theme="dark"] .chatbot-panel-close:hover,
  .chatbot-panel[data-theme="carbon-dark"] .chatbot-panel-close:hover,
  .chatbot-panel[data-theme="default-dark"] .chatbot-panel-close:hover {
    color: var(--nuraly-color-text-primary, #e5e5e5);
    background: var(--nuraly-color-layer-hover-01, rgba(255, 255, 255, 0.1));
  }

  /* Mobile: chatbot panel full-screen */
  @media (max-width: 768px) {
    .chatbot-panel {
      width: 100%;
    }
  }
`;
