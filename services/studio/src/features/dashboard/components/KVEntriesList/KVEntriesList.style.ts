import { css } from 'lit';

export const kvEntriesListStyles = css`
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
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  /* Table container */
  .table-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    background: var(--nuraly-color-surface, #ffffff);
    border-radius: 8px;
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* nr-table styling overrides */
  .table-container nr-table {
    --nuraly-table-border-radius: 0;
    --nuraly-table-cell-padding: 14px 16px;
    --nuraly-table-header-padding: 12px 16px;
  }

  .table-container nr-table::part(table) {
    border: none;
  }

  /* Date text in table */
  .date-text {
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    font-size: 13px;
  }

  /* Global scope text */
  .scope-global {
    color: var(--nuraly-color-text-tertiary, #9ca3af);
    font-size: 13px;
  }

  .key-path {
    font-family: var(--nuraly-font-mono, 'SF Mono', 'Consolas', 'Monaco', monospace);
    font-size: 12px;
    color: var(--nuraly-color-primary, #14144b);
    background: var(--nuraly-color-background-active, #e8e8f0);
    padding: 3px 8px;
    border-radius: 4px;
  }

  .app-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    border-radius: 4px;
    font-size: 11px;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  .type-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .type-badge.string {
    background: var(--nuraly-color-info-light, #cffafe);
    color: var(--nuraly-color-info, #0891b2);
  }

  .type-badge.json {
    background: var(--nuraly-color-warning-light, #fef9c3);
    color: var(--nuraly-color-warning, #ca8a04);
  }

  .type-badge.number {
    background: var(--nuraly-color-success-light, #dcfce7);
    color: var(--nuraly-color-success, #16a34a);
  }

  .type-badge.boolean {
    background: var(--nuraly-color-danger-light, #fee2e2);
    color: var(--nuraly-color-danger, #dc2626);
  }

  .type-badge.binary {
    background: var(--nuraly-color-purple-light, #f9f0ff);
    color: var(--nuraly-color-purple, #722ed1);
  }

  .scope-badge {
    display: inline-block;
    padding: 2px 8px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    border-radius: 4px;
    font-size: 11px;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  .actions-cell {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }

  .empty-state {
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

  /* Responsive: mobile */
  @media (max-width: 768px) {
    .table-container {
      overflow-x: auto;
    }
  }
`;

export default [kvEntriesListStyles];
