import { css } from 'lit';

export const workflowsListStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .list-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  .sections-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: 4px;
  }

  .section {
    display: flex;
    flex-direction: column;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0;
  }

  .table-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--nuraly-color-surface, #ffffff);
    border-radius: 8px;
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
    overflow: hidden;
  }

  .workflow-name {
    font-weight: 500;
    color: var(--nuraly-color-primary, #14144b);
  }

  /* Pin icon styles - follows dashboard color scheme */
  .pin-icon {
    cursor: pointer;
    --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
    transition: color 150ms ease;
  }

  .pin-icon:hover {
    --nuraly-icon-color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  .pin-icon.pinned {
    --nuraly-icon-color: var(--nuraly-color-primary, #14144b);
  }

  /* Unpin icon in cards - follows dashboard color scheme */
  .unpin-icon {
    cursor: pointer;
    --nuraly-icon-color: var(--nuraly-color-primary, #14144b);
    transition: color 150ms ease;
  }

  .unpin-icon:hover {
    --nuraly-icon-color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  /* Pinned cards grid */
  .pinned-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  /* Card styles */
  .pinned-grid nr-card {
    cursor: pointer;
    transition: box-shadow 150ms ease;
    --nuraly-card-padding: 14px;
    --nuraly-card-border-radius: 8px;
  }

  .pinned-grid nr-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  .card-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 12px 0;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--nuraly-color-border-subtle, #f0f0f0);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .meta-item svg {
    width: 12px;
    height: 12px;
  }

  .card-actions {
    display: flex;
    gap: 6px;
    opacity: 0;
    transition: opacity 150ms ease;
  }

  .pinned-grid nr-card:hover .card-actions {
    opacity: 1;
  }

  .workflow-app {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    border-radius: 4px;
    font-size: 11px;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  /* Status badge styles */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .status-badge.active .status-dot {
    background: var(--nuraly-color-success, #22c55e);
  }

  .status-badge.inactive .status-dot {
    background: var(--nuraly-color-warning, #f59e0b);
  }

  .date-text {
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    font-size: 13px;
  }

  .actions-cell {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }

  /* nr-table styling overrides */
  .table-container nr-table {
    --nuraly-table-border-radius: 0;
  }

  .table-container nr-table::part(table) {
    border: none;
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    text-align: center;
    background: var(--nuraly-color-surface, #ffffff);
    border-radius: 8px;
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
  }

  .empty-state-icon {
    width: 56px;
    height: 56px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    margin-bottom: 16px;
  }

  .empty-state-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0 0 6px 0;
  }

  .empty-state-description {
    font-size: 13px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }

  /* Create workflow dropdown form styles */
  .create-workflow-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .dropdown-form-header {
    font-size: 13px;
    font-weight: 600;
    color: var(--nuraly-color-text, #0f0f3c);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    margin-bottom: 4px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
  }

  .form-hint {
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .optional-label {
    font-weight: 400;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .dropdown-form-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid var(--nuraly-color-border, #e8e8f0);
    margin-top: 4px;
  }

  /* Create options menu styles */
  .create-options-menu {
    display: flex;
    flex-direction: column;
    padding: 6px;
    min-width: 200px;
  }

  .create-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .create-option:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
  }

  .create-option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    --nuraly-icon-color: var(--nuraly-color-text-secondary, #5c5c7a);
    --nuraly-icon-size: 18px;
  }

  .create-option-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .create-option-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
  }

  .create-option-description {
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  /* Template modal styles */
  .template-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 150ms ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .template-modal {
    background: var(--nuraly-color-surface, #ffffff);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 680px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    animation: slideUp 200ms ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .template-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
  }

  .template-modal-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0;
  }

  .template-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
    --nuraly-icon-size: 20px;
    transition: all 150ms ease;
  }

  .template-modal-close:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
    --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
  }

  .template-modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .template-card {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border: 2px solid var(--nuraly-color-border, #e8e8f0);
    border-radius: 10px;
    cursor: pointer;
    transition: all 150ms ease;
    background: var(--nuraly-color-surface, #ffffff);
  }

  .template-card:hover {
    border-color: var(--nuraly-color-primary-light, #6366f1);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
  }

  .template-card.selected {
    border-color: var(--nuraly-color-primary, #14144b);
    background: var(--nuraly-color-primary-bg, #f0f0ff);
  }

  .template-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    --nuraly-icon-color: var(--nuraly-color-primary, #14144b);
    --nuraly-icon-size: 22px;
    margin-bottom: 12px;
  }

  .template-card.selected .template-card-icon {
    background: var(--nuraly-color-primary, #14144b);
    --nuraly-icon-color: white;
  }

  .template-card-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0 0 4px 0;
  }

  .template-card-description {
    font-size: 12px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    line-height: 1.4;
    margin: 0;
  }

  .template-card-category {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    margin-top: 12px;
  }

  .template-modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid var(--nuraly-color-border, #e8e8f0);
  }

  /* Back button in dropdown */
  .dropdown-back-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    margin: -4px -4px 8px -4px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    --nuraly-icon-color: var(--nuraly-color-text-secondary, #5c5c7a);
    --nuraly-icon-size: 14px;
    font-size: 12px;
    transition: all 150ms ease;
  }

  .dropdown-back-button:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
    color: var(--nuraly-color-text, #0f0f3c);
    --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
  }
`;

export default [workflowsListStyles];
