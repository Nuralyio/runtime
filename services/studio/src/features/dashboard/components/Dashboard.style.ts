import { css } from 'lit';

export const dashboardStyles = css`
  :host {
    display: block;
    height: 100vh;
    background: var(--nuraly-color-background);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  /* Main Layout */
  .dashboard-layout {
    display: flex;
    height: 100vh;
  }

  /* Sidebar Styles */
  .dashboard-sider {
    width: 220px;
    min-width: 220px;
    background: var(--nuraly-color-surface);
    border-right: 1px solid var(--nuraly-color-border);
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .sider-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--nuraly-color-border-subtle);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .logo-text {
    font-size: 15px;
    font-weight: 600;
    color: var(--nuraly-color-primary);
    letter-spacing: -0.3px;
  }

  .sider-nav {
    flex: 1;
    padding: 8px;
    overflow-y: auto;
  }

  /* Override menu styles to match studio */
  .sider-nav nr-menu {
    --nuraly-menu-font-size: 13px;
    --nuraly-menu-link-padding: 8px 12px;
    --nuraly-menu-border-radius: 6px;
    --nuraly-menu-link-color: var(--nuraly-color-text-secondary);
    --nuraly-menu-link-background-color: transparent;
    --nuraly-menu-hover-link-background-color: var(--nuraly-color-background-hover);
    --nuraly-menu-hover-link-color: var(--nuraly-color-text);
    --nuraly-menu-selected-link-background-color: var(--nuraly-color-primary-light);
    --nuraly-menu-selected-color: var(--nuraly-color-primary);
    --nuraly-menu-selected-link-border: 4px solid var(--nuraly-color-primary);
    --nuraly-menu-icon-size: 16px;
    --nuraly-menu-link-icon-color: var(--nuraly-color-text-tertiary);
    --nuraly-menu-selected-link-icon-color: var(--nuraly-color-primary);
  }

  .sider-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--nuraly-color-border-subtle);
    margin-top: auto;
  }

  .stats-container {
    display: flex;
    justify-content: space-around;
    gap: 8px;
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--nuraly-color-text);
  }

  .stat-label {
    font-size: 10px;
    color: var(--nuraly-color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* Main Content Area */
  .dashboard-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--nuraly-color-background);
  }

  /* Header Styles */
  .dashboard-header {
    height: 48px;
    min-height: 48px;
    background: var(--nuraly-color-surface);
    border-bottom: 1px solid var(--nuraly-color-border);
    padding: 0 20px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-title h1 {
    font-size: 15px;
    font-weight: 500;
    color: var(--nuraly-color-text);
    margin: 0;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Content Styles */
  .dashboard-content {
    flex: 1;
    padding: 20px;
    background: var(--nuraly-color-background);
    overflow-y: auto;
  }

  /* Loading Styles */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 12px;
  }

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid var(--nuraly-color-border);
    border-top-color: var(--nuraly-color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    font-size: 13px;
    color: var(--nuraly-color-text-tertiary);
  }

  /* Error Styles */
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    gap: 12px;
    padding: 24px;
    text-align: center;
    background: var(--nuraly-color-surface);
    border-radius: 8px;
    border: 1px solid var(--nuraly-color-border);
  }

  .error-icon {
    width: 40px;
    height: 40px;
    color: var(--nuraly-color-danger);
  }

  .error-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text);
    margin: 0;
  }

  .error-message {
    font-size: 13px;
    color: var(--nuraly-color-text-tertiary);
    margin: 0;
    max-width: 360px;
  }
`;

export default [dashboardStyles];
