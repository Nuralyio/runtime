import { css } from 'lit';

export const workflowsListStyles = css`
  :host {
    display: block;
  }

  .list-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 16px;
  }

  .workflows-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: var(--nuraly-color-surface);
    border-radius: 8px;
    border: 1px solid var(--nuraly-color-border);
    overflow: hidden;
  }

  .workflows-table th,
  .workflows-table td {
    padding: 10px 16px;
    text-align: left;
  }

  .workflows-table th {
    font-size: 11px;
    font-weight: 500;
    color: var(--nuraly-color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    background: var(--nuraly-color-background-hover);
    border-bottom: 1px solid var(--nuraly-color-border);
  }

  .workflows-table td {
    font-size: 13px;
    color: var(--nuraly-color-text);
    border-bottom: 1px solid var(--nuraly-color-border-subtle);
  }

  .workflows-table tbody tr {
    cursor: pointer;
    transition: background-color 0.1s;
  }

  .workflows-table tbody tr:hover {
    background: var(--nuraly-color-background-hover);
  }

  .workflows-table tbody tr:last-child td {
    border-bottom: none;
  }

  .workflow-name {
    font-weight: 500;
    color: var(--nuraly-color-primary);
  }

  .workflow-app {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: var(--nuraly-color-background-active);
    border-radius: 4px;
    font-size: 11px;
    color: var(--nuraly-color-text-secondary);
  }

  .actions-cell {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
    opacity: 0;
    transition: opacity 0.1s;
  }

  .workflows-table tbody tr:hover .actions-cell {
    opacity: 1;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 24px;
    text-align: center;
    background: var(--nuraly-color-surface);
    border-radius: 8px;
    border: 1px solid var(--nuraly-color-border);
  }

  .empty-state-icon {
    width: 56px;
    height: 56px;
    color: var(--nuraly-color-text-tertiary);
    margin-bottom: 16px;
  }

  .empty-state-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text);
    margin: 0 0 6px 0;
  }

  .empty-state-description {
    font-size: 13px;
    color: var(--nuraly-color-text-tertiary);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }
`;

export default [workflowsListStyles];
