import { css } from "lit";

export const accessRolesStyles = css`
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
  }

  .access-container {
    padding: 8px;
    width: 100%;
    box-sizing: border-box;
  }

  .section {
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 10px;
    font-weight: 600;
    color: var(--nuraly-text-secondary, #888);
    text-transform: uppercase;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
  }

  .access-toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    background: var(--nuraly-bg-secondary, #f5f5f5);
    border-radius: 6px;
    margin-bottom: 8px;
  }

  .access-toggle-row.active {
    background: var(--nuraly-primary-light, #e6f0ff);
    border: 1px solid var(--nuraly-primary, #4a9eff);
  }

  .toggle-content {
    flex: 1;
  }

  .toggle-label {
    font-size: 12px;
    color: var(--nuraly-text-primary, #333);
    font-weight: 500;
  }

  .toggle-description {
    font-size: 10px;
    color: var(--nuraly-text-tertiary, #888);
    margin-top: 2px;
  }

  nr-select.permission-select {
    width: 90px;
    --nuraly-select-height: 26px;
    --nuraly-font-size-select: 10px;
  }

  .preset-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .preset-buttons nr-button {
    --nuraly-button-height: 24px;
    --nuraly-button-font-size: 10px;
    --nuraly-button-padding-horizontal: 8px;
  }

  .roles-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
  }

  .role-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background: var(--nuraly-bg-secondary, #f5f5f5);
    border-radius: 6px;
    border: 1px solid var(--nuraly-border, #e0e0e0);
  }

  .role-info {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .role-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .role-name-badge {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
  }

  .role-name-badge.system {
    color: #6b7280;
    background: #f3f4f6;
  }

  .role-name-badge.custom {
    color: #059669;
    background: #d1fae5;
  }

  .role-type-tag {
    font-size: 9px;
    color: #9ca3af;
    text-transform: uppercase;
  }

  .role-description {
    font-size: 10px;
    color: var(--nuraly-text-tertiary, #888);
    margin-top: 4px;
  }

  .role-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .empty-state {
    text-align: center;
    padding: 16px;
    color: var(--nuraly-text-tertiary, #888);
    font-size: 11px;
    background: var(--nuraly-bg-secondary, #f5f5f5);
    border-radius: 4px;
    margin-bottom: 12px;
  }

  .divider {
    height: 1px;
    background: var(--nuraly-border, #e0e0e0);
    margin: 16px 0;
  }

  .custom-role-input {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }

  .custom-role-input nr-input {
    flex: 1;
    --nuraly-spacing-input-height: 28px;
    --nuraly-font-size-input: 11px;
  }

  nr-checkbox {
    --nuraly-checkbox-size: 16px;
  }

  .info-text {
    font-size: 10px;
    color: var(--nuraly-text-tertiary, #888);
    margin-top: 4px;
    line-height: 1.4;
  }

  .info-box {
    padding: 10px 12px;
    background: #fffbeb;
    border: 1px solid #fcd34d;
    border-radius: 6px;
    margin-bottom: 12px;
  }

  .info-box-title {
    font-size: 11px;
    font-weight: 600;
    color: #92400e;
    margin-bottom: 4px;
  }

  .info-box-text {
    font-size: 10px;
    color: #a16207;
    line-height: 1.4;
  }

  .access-summary {
    padding: 10px 12px;
    background: #f0fdf4;
    border: 1px solid #86efac;
    border-radius: 6px;
    margin-bottom: 12px;
  }

  .access-summary-title {
    font-size: 11px;
    font-weight: 600;
    color: #166534;
    margin-bottom: 4px;
  }

  .access-summary-text {
    font-size: 10px;
    color: #15803d;
    line-height: 1.4;
  }

  .select-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .select-label {
    font-size: 11px;
    color: var(--nuraly-text-secondary, #666);
    min-width: 70px;
  }

  nr-select {
    flex: 1;
    --nuraly-select-height: 28px;
    --nuraly-font-size-select: 11px;
  }
`;
