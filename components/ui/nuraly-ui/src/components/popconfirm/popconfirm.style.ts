import { css } from 'lit';

export const styles = css`
  :host {
    display: inline-block;
  }

  .popconfirm-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
    min-width: 200px;
    max-width: 400px;
  }

  .popconfirm-message {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .popconfirm-icon {
    flex-shrink: 0;
    font-size: 16px;
    line-height: 1.5;
    margin-top: 2px;
  }

  .popconfirm-icon--warning {
    color: var(--nuraly-color-warning);
  }

  .popconfirm-icon--question {
    color: var(--nuraly-color-info);
  }

  .popconfirm-icon--info {
    color: var(--nuraly-color-info);
  }

  .popconfirm-icon--error {
    color: var(--nuraly-color-error);
  }

  .popconfirm-icon--success {
    color: var(--nuraly-color-success);
  }

  .popconfirm-icon--custom {
    color: var(--nuraly-popconfirm-icon-color, var(--nuraly-color-text));
  }

  .popconfirm-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .popconfirm-title {
    color: var(--nuraly-color-text);
    font-size: var(--nuraly-font-size-base);
    font-weight: 600;
    line-height: 1.5;
    margin: 0;
  }

  .popconfirm-description {
    color: var(--nuraly-color-text-secondary);
    font-size: var(--nuraly-font-size-sm);
    line-height: 1.5;
    margin: 0;
  }

  .popconfirm-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    align-items: center;
  }

  .popconfirm-button {
    padding: 4px 15px;
    font-size: var(--nuraly-font-size-sm);
    border-radius: var(--nuraly-border-radius);
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 400;
    line-height: 1.5;
    white-space: nowrap;
    user-select: none;
  }

  .popconfirm-button:focus-visible {
    outline: 2px solid var(--nuraly-color-primary);
    outline-offset: 2px;
  }

  .popconfirm-button--cancel {
    background: var(--nuraly-button-default-background);
    color: var(--nuraly-button-default-text-color);
    border-color: var(--nuraly-button-default-border-color);
  }

  .popconfirm-button--cancel:hover:not(:disabled) {
    background: var(--nuraly-button-default-hover-background);
    color: var(--nuraly-button-default-hover-text-color);
    border-color: var(--nuraly-button-default-hover-border-color);
  }

  .popconfirm-button--ok-primary {
    background: var(--nuraly-button-primary-background);
    color: var(--nuraly-button-primary-text-color);
    border-color: var(--nuraly-button-primary-border-color);
  }

  .popconfirm-button--ok-primary:hover:not(:disabled) {
    background: var(--nuraly-button-primary-hover-background);
    color: var(--nuraly-button-primary-hover-text-color);
    border-color: var(--nuraly-button-primary-hover-border-color);
  }

  .popconfirm-button--ok-danger {
    background: var(--nuraly-button-danger-background);
    color: var(--nuraly-button-danger-text-color);
    border-color: var(--nuraly-button-danger-border-color);
  }

  .popconfirm-button--ok-danger:hover:not(:disabled) {
    background: var(--nuraly-button-danger-hover-background);
    color: var(--nuraly-button-danger-hover-text-color);
    border-color: var(--nuraly-button-danger-hover-border-color);
  }

  .popconfirm-button--ok-secondary {
    background: var(--nuraly-button-secondary-background);
    color: var(--nuraly-button-secondary-text-color);
    border-color: var(--nuraly-button-secondary-border-color);
  }

  .popconfirm-button--ok-secondary:hover:not(:disabled) {
    background: var(--nuraly-button-secondary-hover-background);
    color: var(--nuraly-button-secondary-hover-text-color);
    border-color: var(--nuraly-button-secondary-hover-border-color);
  }

  .popconfirm-button--ok-default {
    background: var(--nuraly-button-default-background);
    color: var(--nuraly-button-default-text-color);
    border-color: var(--nuraly-button-default-border-color);
  }

  .popconfirm-button--ok-default:hover:not(:disabled) {
    background: var(--nuraly-button-default-hover-background);
    color: var(--nuraly-button-default-hover-text-color);
    border-color: var(--nuraly-button-default-hover-border-color);
  }

  .popconfirm-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .popconfirm-button--loading {
    position: relative;
    pointer-events: none;
  }

  .popconfirm-button--loading::before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 14px;
    height: 14px;
    margin-left: -7px;
    margin-top: -7px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: popconfirm-spin 0.6s linear infinite;
  }

  .popconfirm-button--loading > * {
    visibility: hidden;
  }

  @keyframes popconfirm-spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  /* RTL Support */
  :host([dir='rtl']) .popconfirm-message {
    direction: rtl;
  }

  :host([dir='rtl']) .popconfirm-buttons {
    flex-direction: row-reverse;
  }
`;
