import { css } from 'lit';

export const kvModalStyles = css`
  :host {
    display: block;
  }

  .kv-container {
    padding: 0;
    min-height: 450px;
  }

  .tabs-header {
    display: flex;
    border-bottom: 1px solid var(--border-color, #e5e7eb);
    margin-bottom: 16px;
  }

  .tab-btn {
    padding: 12px 20px;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #6b7280);
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all 0.2s;
  }

  .tab-btn:hover {
    color: var(--text-primary, #1f2937);
  }

  .tab-btn.active {
    color: var(--primary-color, #6366f1);
    border-bottom-color: var(--primary-color, #6366f1);
  }

  .tab-content {
    padding: 0;
  }

  /* Filter Bar */
  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    padding: 12px;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e5e7eb);
    align-items: flex-end;
  }

  .filter-bar .form-group {
    flex: 1;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1f2937);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-title .count {
    background: var(--bg-secondary, #e5e7eb);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 500;
  }

  .namespace-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .namespace-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e5e7eb);
    cursor: pointer;
    transition: all 0.2s;
  }

  .namespace-item:hover {
    border-color: var(--primary-color, #6366f1);
    background: #f5f3ff;
  }

  .namespace-item.selected {
    border-color: var(--primary-color, #6366f1);
    background: #ede9fe;
  }

  .namespace-item.secret {
    border-left: 3px solid #f59e0b;
  }

  .namespace-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .namespace-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: var(--primary-color, #6366f1);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .namespace-icon.secret {
    background: #f59e0b;
  }

  .namespace-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .namespace-name {
    font-weight: 500;
    font-size: 14px;
    color: var(--text-primary, #1f2937);
  }

  .namespace-desc {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
  }

  .namespace-meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .entry-count {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
    background: var(--bg-secondary, #e5e7eb);
    padding: 2px 8px;
    border-radius: 10px;
  }

  .secret-badge {
    font-size: 10px;
    padding: 2px 6px;
    background: #fef3c7;
    color: #92400e;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
  }

  /* Entry Section */
  .entries-section {
    margin-bottom: 24px;
  }

  .namespace-selector {
    margin-bottom: 16px;
  }

  .namespace-selector label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary, #1f2937);
    margin-bottom: 6px;
  }

  .namespace-selector select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;
  }

  .entry-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .entry-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e5e7eb);
  }

  .entry-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }

  .entry-key {
    font-weight: 500;
    font-size: 14px;
    color: var(--text-primary, #1f2937);
    font-family: monospace;
    word-break: break-all;
  }

  .entry-value {
    font-size: 13px;
    color: var(--text-secondary, #6b7280);
    font-family: monospace;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .entry-value.masked {
    letter-spacing: 2px;
  }

  .entry-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
  }

  .type-badge {
    font-size: 10px;
    padding: 2px 6px;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
  }

  .scope-badge {
    font-size: 10px;
    padding: 2px 6px;
    background: #e0e7ff;
    color: #3730a3;
    border-radius: 4px;
    font-weight: 500;
  }

  .secret-icon {
    margin-right: 4px;
    color: #f59e0b;
    vertical-align: middle;
  }

  .entry-item.secret {
    border-left: 3px solid #f59e0b;
  }

  .ttl-badge {
    font-size: 11px;
    color: var(--text-secondary, #6b7280);
  }

  .version-badge {
    font-size: 11px;
    color: var(--text-secondary, #6b7280);
    background: var(--bg-secondary, #e5e7eb);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .entry-actions {
    display: flex;
    gap: 4px;
    margin-left: 12px;
  }

  /* Forms */
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .form-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary, #1f2937);
  }

  .form-description {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
  }

  .form-row {
    display: flex;
    gap: 12px;
  }

  .form-row .form-group {
    flex: 1;
  }

  /* Create Form */
  .create-form {
    margin-top: 16px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px dashed #d1d5db;
  }

  .create-form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .create-form-title {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary, #1f2937);
  }

  .form-actions {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  /* Toggle Switch */
  .toggle-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
  }

  .toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #cbd5e1;
    transition: 0.3s;
    border-radius: 24px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .toggle-switch input:checked + .toggle-slider {
    background-color: #f59e0b;
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(20px);
  }

  .toggle-label {
    font-size: 14px;
    color: var(--text-primary, #1f2937);
  }

  /* Secrets Tab */
  .secrets-section {
    margin-bottom: 24px;
  }

  .secret-entry-selector {
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
  }

  .secret-entry-selector .form-group {
    flex: 1;
    margin-bottom: 0;
  }

  .version-history {
    margin-top: 16px;
  }

  .version-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .version-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e5e7eb);
  }

  .version-item.current {
    border-color: #10b981;
    background: #ecfdf5;
  }

  .version-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .version-number {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary, #1f2937);
  }

  .version-date {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
  }

  .version-reason {
    font-size: 11px;
    color: var(--text-tertiary, #9ca3af);
    text-transform: lowercase;
  }

  .current-badge {
    font-size: 10px;
    padding: 2px 6px;
    background: #10b981;
    color: white;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 600;
  }

  /* Rotate Form */
  .rotate-form {
    margin-top: 16px;
    padding: 16px;
    background: #fef3c7;
    border-radius: 8px;
    border: 1px solid #fcd34d;
  }

  .rotate-warning {
    font-size: 12px;
    color: #92400e;
    margin-bottom: 12px;
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .rotate-warning-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--text-secondary, #6b7280);
  }

  .empty-state-icon {
    margin-bottom: 12px;
    opacity: 0.5;
    color: var(--text-secondary, #6b7280);
  }

  .empty-state-text {
    font-size: 14px;
    margin-bottom: 16px;
  }

  /* Loading State */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: var(--text-secondary, #6b7280);
  }

  .loading::after {
    content: '';
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-color, #e5e7eb);
    border-top-color: var(--primary-color, #6366f1);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-left: 8px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Messages */
  .success-message {
    padding: 12px;
    background: #d1fae5;
    border: 1px solid #6ee7b7;
    border-radius: 8px;
    color: #065f46;
    font-size: 14px;
    margin-bottom: 16px;
  }

  .error-message {
    padding: 12px;
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    color: #991b1b;
    font-size: 14px;
    margin-bottom: 16px;
  }

  /* Action Buttons */
  .action-btn {
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
  }

  .action-btn.edit {
    background: #dbeafe;
    color: #1e40af;
  }

  .action-btn.edit:hover {
    background: #bfdbfe;
  }

  .action-btn.delete {
    background: #fee2e2;
    color: #991b1b;
  }

  .action-btn.delete:hover {
    background: #fecaca;
  }

  .action-btn.rollback {
    background: #ede9fe;
    color: #5b21b6;
  }

  .action-btn.rollback:hover {
    background: #ddd6fe;
  }

  /* Add Button */
  .add-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--primary-color, #6366f1);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .add-btn:hover {
    background: #4f46e5;
  }

  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Cancel Button */
  .cancel-btn {
    padding: 8px 16px;
    background: var(--bg-secondary, #f3f4f6);
    color: var(--text-primary, #1f2937);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .cancel-btn:hover {
    background: #e5e7eb;
  }
`;
