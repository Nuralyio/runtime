import { css } from 'lit';

export const whiteboardsListStyles = css`
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
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
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

  .whiteboard-name {
    font-weight: 500;
    color: var(--nuraly-color-primary, #14144b);
  }

  /* Pin icon styles */
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

  .whiteboard-app {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    border-radius: 4px;
    font-size: 11px;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  .elements-count {
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
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

  /* Create whiteboard dropdown form styles */
  .create-whiteboard-form {
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

  /* Responsive: mobile */
  @media (max-width: 768px) {
    .pinned-grid {
      grid-template-columns: 1fr;
    }

    .table-container {
      overflow-x: auto;
    }

    .card-actions {
      opacity: 1;
    }
  }
`;

export default [whiteboardsListStyles];
