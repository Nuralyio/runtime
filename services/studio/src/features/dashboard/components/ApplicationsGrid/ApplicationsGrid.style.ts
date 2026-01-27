import { css } from 'lit';

export const applicationsGridStyles = css`
  :host {
    display: block;
  }

  .grid-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    gap: 12px;
  }

  .search-filter-row {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 1;
  }

  .search-input {
    width: 240px;
    min-width: 180px;
    --nuraly-input-height: 32px;
    --nuraly-input-font-size: 13px;
  }

  .status-filter {
    width: 140px;
    min-width: 120px;
    --nuraly-select-height: 32px;
    --nuraly-select-font-size: 13px;
  }

  .applications-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
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
    margin: 0 0 20px 0;
    max-width: 280px;
    line-height: 1.5;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .grid-header {
      flex-direction: column;
      align-items: stretch;
    }

    .search-filter-row {
      flex-direction: column;
    }

    .search-input,
    .status-filter {
      width: 100%;
    }
  }
`;

export default [applicationsGridStyles];
