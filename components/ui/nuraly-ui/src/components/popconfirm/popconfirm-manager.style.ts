import { css } from 'lit';

export const popconfirmManagerStyles = css`
  :host {
    display: block;
  }

  .popconfirm-manager {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: var(--nuraly-z-index-popconfirm, 10000);
  }

  .popconfirm-manager__item {
    position: fixed;
    pointer-events: auto;
    background: var(--nuraly-color-dropdown-background, #ffffff);
    border: 1px solid var(--nuraly-color-dropdown-border, #e0e0e0);
    border-radius: var(--nuraly-border-radius-lg, 8px);
    box-shadow: var(--nuraly-shadow-lg, 0 4px 16px rgba(0, 0, 0, 0.15));
    min-width: 240px;
    max-width: 320px;
    animation: popconfirm-manager-fade-in 0.15s ease-out;
  }

  @keyframes popconfirm-manager-fade-in {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-4px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .popconfirm-manager__content {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .popconfirm-manager__message {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }

  .popconfirm-manager__icon {
    flex-shrink: 0;
    font-size: 16px;
    line-height: 1.5;
    margin-top: 2px;
  }

  .popconfirm-manager__icon--warning {
    color: var(--nuraly-color-warning, #faad14);
  }

  .popconfirm-manager__icon--question {
    color: var(--nuraly-color-info, #1890ff);
  }

  .popconfirm-manager__icon--info {
    color: var(--nuraly-color-info, #1890ff);
  }

  .popconfirm-manager__icon--error {
    color: var(--nuraly-color-error, #ff4d4f);
  }

  .popconfirm-manager__icon--success {
    color: var(--nuraly-color-success, #52c41a);
  }

  .popconfirm-manager__icon--custom {
    color: inherit;
  }

  .popconfirm-manager__text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .popconfirm-manager__title {
    color: var(--nuraly-color-text, #262626);
    font-size: var(--nuraly-font-size-base, 14px);
    font-weight: 600;
    line-height: 1.5;
    margin: 0;
  }

  .popconfirm-manager__description {
    color: var(--nuraly-color-text-secondary, #666666);
    font-size: var(--nuraly-font-size-sm, 12px);
    line-height: 1.5;
    margin: 0;
  }

  .popconfirm-manager__buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    align-items: center;
  }

  /* Arrow pointer towards cursor */
  .popconfirm-manager__item::before {
    content: '';
    position: absolute;
    left: 16px;
    top: -6px;
    width: 12px;
    height: 12px;
    background: var(--nuraly-color-dropdown-background, #ffffff);
    border: 1px solid var(--nuraly-color-dropdown-border, #e0e0e0);
    border-right: none;
    border-bottom: none;
    transform: rotate(45deg);
  }

  /* RTL Support */
  :host([dir='rtl']) .popconfirm-manager__message {
    direction: rtl;
  }

  :host([dir='rtl']) .popconfirm-manager__buttons {
    flex-direction: row-reverse;
  }
`;
