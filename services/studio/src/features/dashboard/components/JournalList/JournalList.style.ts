import { css } from 'lit';

export const journalListStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  /* Stats bar */
  .stats-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: var(--nuraly-color-surface, #ffffff);
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
    border-radius: 8px;
    min-width: 140px;
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .stat-icon.total {
    background: var(--nuraly-color-primary-bg, #f0f0f8);
    color: var(--nuraly-color-primary, #14144b);
  }

  .stat-icon.errors {
    background: #fef2f2;
    color: var(--nuraly-color-danger, #dc2626);
  }

  .stat-icon.warnings {
    background: #fefce8;
    color: var(--nuraly-color-warning, #ca8a04);
  }

  .stat-icon svg {
    width: 16px;
    height: 16px;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--nuraly-color-text, #0f0f3c);
    line-height: 1;
  }

  .stat-label {
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  /* Toolbar */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .toolbar-filters {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    flex-wrap: wrap;
  }

  .toolbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .filter-select {
    min-width: 120px;
  }

  .search-input {
    min-width: 200px;
    flex: 1;
    max-width: 300px;
  }

  .streaming-indicator {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: #f0fdf4;
    color: var(--nuraly-color-success, #16a34a);
    border-radius: 12px;
    font-size: 11px;
    font-weight: 500;
  }

  .streaming-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--nuraly-color-success, #16a34a);
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Table area */
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

  .table-container nr-table {
    --nuraly-table-border-radius: 0;
  }

  /* Level badge styles */
  .level-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--nuraly-font-mono, 'SF Mono', 'Fira Code', monospace);
    letter-spacing: 0.02em;
  }

  .level-badge.INFO {
    background: #eff6ff;
    color: #2563eb;
  }

  .level-badge.WARN {
    background: #fefce8;
    color: #ca8a04;
  }

  .level-badge.ERROR {
    background: #fef2f2;
    color: #dc2626;
  }

  .level-badge.DEBUG {
    background: #f3f4f6;
    color: #6b7280;
  }

  /* Service tag */
  .service-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: var(--nuraly-color-primary-bg, #f0f0f8);
    color: var(--nuraly-color-primary, #14144b);
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
  }

  /* Type tag */
  .type-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 7px;
    background: var(--nuraly-color-background-hover, #f1f5f9);
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    border-radius: 4px;
    font-size: 11px;
  }

  /* Timestamp */
  .timestamp {
    font-size: 12px;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    font-family: var(--nuraly-font-mono, 'SF Mono', 'Fira Code', monospace);
    white-space: nowrap;
  }

  /* Message text */
  .message-text {
    font-size: 12px;
    color: var(--nuraly-color-text, #0f0f3c);
    max-width: 400px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Pagination bar */
  .pagination-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px;
    border-top: 1px solid var(--nuraly-color-border, #e8e8f0);
    background: var(--nuraly-color-surface, #ffffff);
    flex-shrink: 0;
  }

  .pagination-info {
    font-size: 12px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .pagination-buttons {
    display: flex;
    gap: 6px;
  }

  /* Loading state */
  .loading-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    font-size: 13px;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--nuraly-color-border, #e8e8f0);
    border-top-color: var(--nuraly-color-primary, #14144b);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: 8px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Error state */
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    text-align: center;
    background: var(--nuraly-color-surface, #ffffff);
    border-radius: 8px;
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
  }

  .error-text {
    font-size: 13px;
    color: var(--nuraly-color-danger, #dc2626);
    margin-bottom: 12px;
  }

  /* Empty state */
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

  .empty-icon {
    width: 48px;
    height: 48px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    margin-bottom: 16px;
  }

  .empty-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0 0 4px 0;
  }

  .empty-text {
    font-size: 13px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }

  /* Detail modal */
  .detail-overlay {
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

  .detail-modal {
    background: var(--nuraly-color-surface, #ffffff);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 700px;
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

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
  }

  .detail-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .detail-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0;
  }

  .detail-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    transition: all 150ms ease;
  }

  .detail-close:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
    color: var(--nuraly-color-text, #0f0f3c);
  }

  .detail-close svg {
    width: 18px;
    height: 18px;
  }

  .detail-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }

  .detail-section {
    margin-bottom: 16px;
  }

  .detail-section:last-child {
    margin-bottom: 0;
  }

  .detail-section-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    margin: 0 0 8px 0;
  }

  .detail-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .detail-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .detail-field.full-width {
    grid-column: 1 / -1;
  }

  .detail-field-label {
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .detail-field-value {
    font-size: 13px;
    color: var(--nuraly-color-text, #0f0f3c);
    word-break: break-all;
  }

  /* JSON data viewer */
  .json-viewer {
    background: #1e1e2e;
    color: #cdd6f4;
    border-radius: 6px;
    padding: 12px 16px;
    font-family: var(--nuraly-font-mono, 'SF Mono', 'Fira Code', monospace);
    font-size: 12px;
    line-height: 1.6;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 300px;
    overflow-y: auto;
  }

  .json-key {
    color: #89b4fa;
  }

  .json-string {
    color: #a6e3a1;
  }

  .json-number {
    color: #fab387;
  }

  .json-boolean {
    color: #cba6f7;
  }

  .json-null {
    color: #6c7086;
  }

  /* Active filter tags */
  .active-filters {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: var(--nuraly-color-primary-bg, #f0f0f8);
    color: var(--nuraly-color-primary, #14144b);
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    transition: background 150ms ease;
  }

  .filter-tag:hover {
    background: #e0e0f0;
  }

  .filter-tag svg {
    width: 10px;
    height: 10px;
  }
`;

export default [journalListStyles];
