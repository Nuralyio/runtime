import { css } from 'lit';

export const shareModalStyles = css`
  :host {
    display: block;
  }

  .share-container {
    padding: 0;
    min-height: 400px;
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

  /* Members Tab */
  .members-section {
    margin-bottom: 24px;
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

  .member-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .member-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e5e7eb);
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .member-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--primary-color, #6366f1);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 14px;
  }

  .member-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .member-name {
    font-weight: 500;
    font-size: 14px;
    color: var(--text-primary, #1f2937);
  }

  .member-email {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
  }

  .member-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .role-badge {
    padding: 4px 10px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }

  .role-badge.owner {
    background: #fef3c7;
    color: #92400e;
  }

  .role-badge.admin {
    background: #dbeafe;
    color: #1e40af;
  }

  .role-badge.editor {
    background: #d1fae5;
    color: #065f46;
  }

  .role-badge.viewer {
    background: #e5e7eb;
    color: #374151;
  }

  .role-badge.custom {
    background: #ede9fe;
    color: #5b21b6;
  }

  /* Pending Invites */
  .pending-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background: #fffbeb;
    border-radius: 8px;
    border: 1px solid #fcd34d;
  }

  .pending-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #fbbf24;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pending-expires {
    font-size: 11px;
    color: #92400e;
  }

  /* Invite Tab */
  .invite-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary, #1f2937);
  }

  .form-description {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
    margin-top: 4px;
  }

  .success-message {
    padding: 12px;
    background: #d1fae5;
    border: 1px solid #6ee7b7;
    border-radius: 8px;
    color: #065f46;
    font-size: 14px;
  }

  .error-message {
    padding: 12px;
    background: #fee2e2;
    border: 1px solid #fca5a5;
    border-radius: 8px;
    color: #991b1b;
    font-size: 14px;
  }

  /* Roles Tab */
  .roles-section {
    margin-bottom: 24px;
  }

  .role-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .role-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 12px;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e5e7eb);
  }

  .role-item.system {
    background: #f3f4f6;
  }

  .role-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .role-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .role-name {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary, #1f2937);
  }

  .role-hierarchy {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
    background: var(--bg-secondary, #e5e7eb);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .role-description {
    font-size: 12px;
    color: var(--text-secondary, #6b7280);
  }

  .role-permissions {
    font-size: 11px;
    color: var(--text-tertiary, #9ca3af);
    font-family: monospace;
    margin-top: 4px;
  }

  .role-actions {
    display: flex;
    gap: 4px;
  }

  .system-tag {
    font-size: 10px;
    padding: 2px 6px;
    background: #e5e7eb;
    color: #6b7280;
    border-radius: 4px;
    text-transform: uppercase;
  }

  /* Create Role Form */
  .create-role-form {
    margin-top: 16px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px dashed #d1d5db;
  }

  .permissions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: 8px;
  }

  .permission-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 32px;
    color: var(--text-secondary, #6b7280);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
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

  /* Settings Tab */
  .settings-section {
    margin-bottom: 24px;
  }

  .setting-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 16px;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e5e7eb);
    gap: 16px;
  }

  .setting-info {
    flex: 1;
  }

  .setting-label {
    font-weight: 600;
    font-size: 14px;
    color: var(--text-primary, #1f2937);
    margin-bottom: 4px;
  }

  .setting-description {
    font-size: 13px;
    color: var(--text-secondary, #6b7280);
    line-height: 1.5;
  }

  .setting-control {
    flex-shrink: 0;
  }

  /* Toggle Switch */
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 26px;
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
    border-radius: 26px;
  }

  .toggle-slider:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .toggle-switch input:checked + .toggle-slider {
    background-color: var(--primary-color, #6366f1);
  }

  .toggle-switch input:checked + .toggle-slider:before {
    transform: translateX(22px);
  }

  .toggle-switch input:disabled + .toggle-slider {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
