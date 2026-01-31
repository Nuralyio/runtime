import { css } from 'lit';

export const dashboardStyles = css`
  :host {
    display: block;
    height: 100vh;
    background: var(--nuraly-color-background, #f8fafc);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;

    /* Dashboard-specific CSS variables */
    --nuraly-dashboard-sider-width: 220px;
    --nuraly-dashboard-header-height: 48px;
    --nuraly-dashboard-transition: 150ms ease;
    --nuraly-dashboard-logo-color: var(--nuraly-color-primary, #14144b);
  }

  /* Main Layout */
  .dashboard-layout {
    display: flex;
    height: 100vh;
  }

  /* Sidebar Styles */
  .dashboard-sider {
    width: var(--nuraly-dashboard-sider-width);
    min-width: var(--nuraly-dashboard-sider-width);
    background: var(--nuraly-color-surface, #ffffff);
    border-right: 1px solid var(--nuraly-color-border, #e8e8f0);
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .sider-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
    color: var(--nuraly-dashboard-logo-color);
  }

  .logo-text {
    font-size: 15px;
    font-weight: 600;
    color: var(--nuraly-color-primary, #14144b);
    letter-spacing: -0.3px;
  }

  .sider-nav {
    flex: 1;
    padding: 8px;
    overflow-y: auto;
  }

  /* Override menu styles to match Nuraly brand */
  .sider-nav nr-menu {
    --nuraly-menu-font-size: 13px;
    --nuraly-menu-link-padding: 8px 12px;
    --nuraly-menu-border-radius: 6px;
    --nuraly-menu-link-color: var(--nuraly-color-text-secondary, #5c5c7a);
    --nuraly-menu-link-background-color: transparent;
    --nuraly-menu-hover-link-background-color: var(--nuraly-color-background-hover, #f1f5f9);
    --nuraly-menu-hover-link-color: var(--nuraly-color-text, #0f0f3c);
    --nuraly-menu-selected-link-background-color: var(--nuraly-color-primary-bg, #f0f0f8);
    --nuraly-menu-selected-color: var(--nuraly-color-primary, #14144b);
    --nuraly-menu-selected-link-border: 4px solid var(--nuraly-color-primary, #14144b);
    --nuraly-menu-icon-size: 16px;
    --nuraly-menu-link-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
    --nuraly-menu-selected-link-icon-color: var(--nuraly-color-primary, #14144b);
  }

  .sider-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--nuraly-color-border-subtle, #f1f3f5);
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
    color: var(--nuraly-color-text, #0f0f3c);
  }

  .stat-label {
    font-size: 10px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  /* Main Content Area */
  .dashboard-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--nuraly-color-background, #f8fafc);
  }

  /* Header Styles */
  .dashboard-header {
    height: var(--nuraly-dashboard-header-height);
    min-height: var(--nuraly-dashboard-header-height);
    background: var(--nuraly-color-surface, #ffffff);
    border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    padding: 0 20px;
  }

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--nuraly-dashboard-header-height);
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-title h1 {
    font-size: 15px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
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
    background: var(--nuraly-color-background, #f8fafc);
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
    border: 2px solid var(--nuraly-color-border, #e8e8f0);
    border-top-color: var(--nuraly-color-primary, #14144b);
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
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
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
    background: var(--nuraly-color-surface, #ffffff);
    border-radius: 8px;
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
  }

  .error-icon {
    width: 40px;
    height: 40px;
    color: var(--nuraly-color-danger, #dc2626);
  }

  .error-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0;
  }

  .error-message {
    font-size: 13px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    margin: 0;
    max-width: 360px;
  }
`;

export default [dashboardStyles];
