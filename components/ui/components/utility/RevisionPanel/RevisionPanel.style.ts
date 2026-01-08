import { css } from 'lit';

export const revisionPanelStyles = css`
  :host {
    display: block;
    height: 100%;
  }

  .revision-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 8px;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .panel-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #1f2937);
    margin: 0;
  }

  /* nr-tabs customization */
  nr-tabs {
    flex: 1;
    min-height: 0;
    --nr-tabs-header-background: var(--bg-secondary, #f3f4f6);
    --nr-tabs-border-radius: 8px;
    --nuraly-spacing-tabs-content-padding: 0;
  }

  nr-tabs::part(tab-content) {
    padding: 0;
    overflow-y: auto;
  }

  /* Loading Container */
  .loading-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 8px 0;
  }

  /* Empty State */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    color: var(--text-secondary, #6b7280);
    text-align: center;
  }

  .empty-state .empty-icon {
    color: var(--success-color, #10b981);
    opacity: 0.6;
    margin-bottom: 12px;
  }

  .empty-state p {
    margin: 0;
    font-weight: 500;
    color: var(--text-primary, #1f2937);
  }

  .empty-state span {
    font-size: 12px;
    margin-top: 4px;
  }

  /* Changes Timeline Wrapper */
  .changes-timeline-wrapper {
    padding: 8px 8px 8px 12px;
  }

  /* nr-timeline customization */
  nr-timeline {
    --nuraly-timeline-item-padding-bottom: 20px;
    --nuraly-font-size-base: 13px;
  }

  /* Publish Section */
  .publish-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  /* Status Section */
  .status-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    background: var(--bg-secondary, #f9fafb);
    border-radius: 6px;
  }

  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .status-value {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-primary, #1f2937);
  }

  /* nr-tag customization */
  nr-tag {
    --nr-tag-font-size: 10px;
  }

  /* nr-alert customization */
  nr-alert {
    --nr-alert-font-size: 12px;
  }
`;
