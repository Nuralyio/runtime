import { css } from "lit";

export const borderManagerStyles = css`
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
    min-height: 0;
    flex-shrink: 0;
  }

  .border-container {
    padding: 8px;
    width: 100%;
    box-sizing: border-box;
  }

  .section {
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 10px;
    font-weight: 600;
    color: var(--nuraly-text-secondary, #888);
    text-transform: uppercase;
    margin-bottom: 8px;
    letter-spacing: 0.5px;
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
    --nuraly-button-padding-small: 5px;
  }

  .config-panel {
    padding: 10px;
    background: var(--nuraly-bg-secondary, #f5f5f5);
    border-radius: 6px;
    border: 1px solid var(--nuraly-border, #e0e0e0);
    margin-bottom: 8px;
  }

  .config-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .config-title {
    font-size: 11px;
    font-weight: 600;
    color: var(--nuraly-primary, #4a9eff);
    background: var(--nuraly-primary-light, #e6f0ff);
    padding: 3px 8px;
    border-radius: 4px;
  }

  .side-toggles {
    display: flex;
    gap: 4px;
  }

  .side-toggle {
    padding: 2px 6px;
    font-size: 9px;
    cursor: pointer;
    border-radius: 3px;
    border: 1px solid var(--nuraly-border, #e0e0e0);
    background: var(--nuraly-bg, #fff);
    transition: all 0.2s;
  }

  .side-toggle.active {
    background: var(--nuraly-primary, #4a9eff);
    color: white;
    border-color: var(--nuraly-primary, #4a9eff);
  }

  .config-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .config-row:last-child {
    margin-bottom: 0;
  }

  .config-label {
    font-size: 10px;
    color: var(--nuraly-text-tertiary, #888);
    min-width: 45px;
    text-transform: uppercase;
  }

  .config-input {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  nr-input {
    --nuraly-spacing-input-height: 24px;
    --nuraly-font-size-input: 10px;
    --nuraly-font-size-input-placeholder: 10px;
    --nuraly-color-input-background: var(--border-input-bg, white);
    --nuraly-color-input-inner-background: var(--border-input-bg, white);
  }

  nr-input.width-input {
    width: 60px;
    flex: none;
  }

  nr-select {
    --nuraly-select-height: 24px;
    --nuraly-select-font-size: 10px;
    flex: 1;
  }

  nr-color-picker {
    --nuraly-color-picker-size: 24px;
  }

  .radius-section {
    margin-top: 12px;
  }

  .radius-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .radius-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .radius-label {
    font-size: 9px;
    color: var(--nuraly-text-tertiary, #888);
    min-width: 20px;
  }

  .radius-input {
    flex: 1;
  }

  .link-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin-bottom: 8px;
    cursor: pointer;
    font-size: 10px;
    color: var(--nuraly-text-secondary, #666);
  }

  .link-toggle nr-icon {
    font-size: 14px;
  }

  .link-toggle.linked {
    color: var(--nuraly-primary, #4a9eff);
  }

  .divider {
    height: 1px;
    background: var(--nuraly-border, #e0e0e0);
    margin: 12px 0;
  }

  .preview-box {
    width: 60px;
    height: 40px;
    background: var(--nuraly-bg, #fff);
    margin: 8px auto;
  }

  .individual-sides {
    margin-top: 8px;
  }

  .side-config {
    padding: 8px;
    background: var(--nuraly-bg, #fff);
    border-radius: 4px;
    margin-bottom: 6px;
    border: 1px solid var(--nuraly-border, #e0e0e0);
  }

  .side-config-header {
    font-size: 10px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--nuraly-text-secondary, #666);
  }
`;
