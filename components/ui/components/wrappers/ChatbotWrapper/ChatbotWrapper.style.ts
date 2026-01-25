import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .chatbot-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    border-radius: var(--nuraly-border-radius-chatbot, 12px);
    overflow: hidden;
    background: var(--nuraly-color-chatbot-background, #ffffff);
    box-shadow: var(--nuraly-shadow-chatbot, 0 4px 24px rgba(0, 0, 0, 0.12));
  }

  /* Floating mode */
  :host([floating]) {
    position: fixed;
    z-index: var(--nuraly-z-index-chatbot-floating, 1000);
    width: var(--nuraly-size-chatbot-floating-width, 420px);
    height: var(--nuraly-size-chatbot-floating-height, 600px);
    max-width: 95vw;
    max-height: 80vh;
  }

  /* Position variants */
  :host([floating][position="center-bottom"]) {
    bottom: var(--nuraly-spacing-chatbot-floating-offset, 24px);
    left: 50%;
    transform: translateX(-50%);
  }

  :host([floating][position="bottom-right"]) {
    bottom: var(--nuraly-spacing-chatbot-floating-offset, 24px);
    right: var(--nuraly-spacing-chatbot-floating-offset, 24px);
  }

  :host([floating][position="bottom-left"]) {
    bottom: var(--nuraly-spacing-chatbot-floating-offset, 24px);
    left: var(--nuraly-spacing-chatbot-floating-offset, 24px);
  }

  /* When dragging, use custom position */
  :host([floating].dragged) {
    transform: none;
    transition: none;
  }

  /* Drag handle */
  .drag-handle {
    display: none;
    align-items: center;
    justify-content: center;
    padding: 8px;
    background: var(--nuraly-color-chatbot-drag-handle-bg, #f8fafc);
    border-bottom: 1px solid var(--nuraly-color-chatbot-border, #e2e8f0);
    cursor: grab;
    user-select: none;
    touch-action: none;
    flex-shrink: 0;
  }

  :host([draggable]) .drag-handle {
    display: flex;
  }

  .drag-handle:hover {
    background: var(--nuraly-color-chatbot-drag-handle-bg-hover, #f1f5f9);
  }

  .drag-handle:active,
  :host(.dragging) .drag-handle {
    cursor: grabbing;
    background: var(--nuraly-color-chatbot-drag-handle-bg-active, #e2e8f0);
  }

  .drag-handle__icon {
    color: var(--nuraly-color-chatbot-drag-handle-icon, #94a3b8);
    font-size: 16px;
  }

  .drag-handle__title {
    flex: 1;
    margin-left: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-chatbot-drag-handle-text, #475569);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .drag-handle__actions {
    display: flex;
    gap: 4px;
  }

  .drag-handle__close {
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 4px;
    color: var(--nuraly-color-chatbot-drag-handle-icon, #94a3b8);
    transition: all 0.15s ease;
  }

  .drag-handle__close:hover {
    background: var(--nuraly-color-chatbot-close-hover-bg, #fee2e2);
    color: var(--nuraly-color-chatbot-close-hover-icon, #dc2626);
  }

  /* Chatbot container */
  .chatbot-container {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .chatbot-container nr-chatbot {
    width: 100%;
    height: 100%;
  }

  /* Dragging state overlay */
  :host(.dragging)::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }

  /* Minimized state */
  :host([minimized]) .chatbot-container {
    display: none;
  }

  :host([minimized]) {
    height: auto !important;
  }

  :host([minimized]) .chatbot-wrapper {
    height: auto;
  }

  /* Input-only mode (showMessages=false) */
  :host([input-only]) {
    height: auto !important;
  }

  :host([input-only]) .chatbot-wrapper {
    height: auto;
  }

  :host([input-only]) .chatbot-container {
    flex: none;
    height: auto;
  }

  :host([input-only]) .chatbot-container nr-chatbot {
    height: auto;
  }

  :host([input-only][floating]) {
    height: auto;
    max-height: none;
  }

  /* Override nr-chatbot internal height in input-only mode */
  :host([input-only]) nr-chatbot {
    height: auto !important;
  }

  :host([input-only]) nr-chatbot::part(container),
  :host([input-only]) nr-chatbot::part(main) {
    height: auto !important;
    min-height: unset !important;
  }

  /* Animation for floating appearance */
  :host([floating]:not(.dragged)) {
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  /* Responsive */
  @media (max-width: 480px) {
    :host([floating]) {
      width: 100vw;
      height: 100vh;
      max-width: 100vw;
      max-height: 100vh;
      bottom: 0;
      left: 0;
      right: 0;
      transform: none;
      border-radius: 0;
    }

    :host([floating][position="center-bottom"]),
    :host([floating][position="bottom-right"]),
    :host([floating][position="bottom-left"]) {
      bottom: 0;
      left: 0;
      right: 0;
      transform: none;
    }

    .chatbot-wrapper {
      border-radius: 0;
    }
  }

  /* Dark mode */
  @media (prefers-color-scheme: dark) {
    .chatbot-wrapper {
      background: var(--nuraly-color-chatbot-background-dark, #1e293b);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    }

    .drag-handle {
      background: var(--nuraly-color-chatbot-drag-handle-bg-dark, #334155);
      border-bottom-color: var(--nuraly-color-chatbot-border-dark, #475569);
    }

    .drag-handle:hover {
      background: var(--nuraly-color-chatbot-drag-handle-bg-hover-dark, #3b4a5e);
    }

    .drag-handle__title {
      color: var(--nuraly-color-chatbot-drag-handle-text-dark, #e2e8f0);
    }

    .drag-handle__icon,
    .drag-handle__close {
      color: var(--nuraly-color-chatbot-drag-handle-icon-dark, #94a3b8);
    }
  }
`;
