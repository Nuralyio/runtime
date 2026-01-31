import { css } from 'lit';

export const kvEntriesListStyles = css`
  :host {
    display: block;
  }

  .list-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 16px;
  }

  .kv-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: var(--nuraly-color-surface, #ffffff);
    border-radius: 8px;
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
    overflow: hidden;
  }

  .kv-table th,
  .kv-table td {
    padding: 10px 16px;
    text-align: left;
  }

  .kv-table th {
    font-size: 11px;
    font-weight: 500;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: var(--nuraly-color-background-hover, #f1f5f9);
    border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
  }

  .kv-table td {
    font-size: 13px;
    color: var(--nuraly-color-text, #0f0f3c);
    border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
  }

  .kv-table tbody tr {
    transition: background-color var(--nuraly-transition, 150ms ease);
  }

  .kv-table tbody tr:hover {
    background: var(--nuraly-color-background-hover, #f1f5f9);
  }

  .kv-table tbody tr:last-child td {
    border-bottom: none;
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
    opacity: 0;
    transition: opacity 0.1s;
  }

  .kv-table tbody tr:hover .actions-cell {
    opacity: 1;
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
`;

export default [kvEntriesListStyles];
