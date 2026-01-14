import { css } from 'lit';

/**
 * Workflow Node component styles
 * Using shared CSS variables from /src/shared/themes/
 * Supports default and carbon themes
 */
export const workflowNodeStyles = css`
  :host {
    display: block;
    position: absolute;
    user-select: none;

    /* Force CSS custom property inheritance to ensure theme switching works properly */
    color: var(--nuraly-color-text);

    /* Ensure clean state transitions when theme changes */
    * {
      transition: all var(--nuraly-transition-fast, 0.15s) ease;
    }
  }

  /* Force re-evaluation of theme-dependent properties on theme change */
  :host([data-theme]) {
    color: inherit;
  }

  .node-container {
    position: relative;
    min-width: 180px;
    min-height: 60px;
    background: var(--nuraly-color-layer-01, #1e1e1e);
    border: 2px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-medium, 8px);
    box-shadow: var(--nuraly-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.3));
    transition: box-shadow var(--nuraly-transition-fast, 0.15s) ease,
                border-color var(--nuraly-transition-fast, 0.15s) ease,
                transform var(--nuraly-transition-fast, 0.1s) ease;
    cursor: grab;
    font-family: var(--nuraly-font-family);
  }

  .node-container:hover {
    border-color: var(--nuraly-color-border-interactive, #525252);
    box-shadow: var(--nuraly-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.4));
  }

  .node-container.selected {
    border-color: var(--nuraly-color-interactive, #3b82f6);
    box-shadow: var(--nuraly-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.4));
  }

  .node-container.dragging {
    cursor: grabbing;
    transform: scale(1.02);
    box-shadow: var(--nuraly-shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.5));
  }

  /* Status indicators */
  /* Pending status - uncomment to show orange border for pending nodes
  .node-container.status-pending {
    border-color: var(--nuraly-color-support-warning, #f59e0b) !important;
    box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.3), var(--nuraly-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.3));
  }
  */

  .node-container.status-running {
    border-color: var(--nuraly-color-interactive, #3b82f6) !important;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3), var(--nuraly-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.3));
    animation: pulse-running 1.5s infinite;
  }

  .node-container.status-completed {
    border-color: var(--nuraly-color-support-success, #22c55e) !important;
    box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.3), var(--nuraly-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.3));
  }

  .node-container.status-failed {
    border-color: var(--nuraly-color-support-error, #ef4444) !important;
    box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3), var(--nuraly-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.3));
  }

  .node-container.status-waiting {
    border-color: var(--nuraly-color-support-warning, #f59e0b) !important;
    box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.3), var(--nuraly-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.3));
  }

  .node-container.status-paused {
    border-color: #8b5cf6 !important;
    box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.3), var(--nuraly-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.3));
  }

  .node-container.status-cancelled {
    border-color: #6b7280 !important;
    box-shadow: 0 0 0 1px rgba(107, 114, 128, 0.3), var(--nuraly-shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.3));
  }

  @keyframes pulse-running {
    0%, 100% { box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3); }
    50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.1), 0 2px 8px rgba(0, 0, 0, 0.3); }
  }

  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
  }

  /* Header */
  .node-header {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-layer-02, rgba(255, 255, 255, 0.05));
    border-radius: var(--nuraly-border-radius-medium, 8px) var(--nuraly-border-radius-medium, 8px) 0 0;
    border-bottom: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
  }

  .node-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--nuraly-border-radius-small, 4px);
    background: var(--nuraly-color-interactive, #3b82f6);
    color: var(--nuraly-color-text-on-color, white);
    font-size: var(--nuraly-font-size-sm, 12px);
  }

  .node-icon nr-icon {
    color: inherit;
    --icon-size: 14px;
  }

  .node-title {
    flex: 1;
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-text-primary, #e5e5e5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .node-type-badge {
    font-size: var(--nuraly-font-size-xs, 10px);
    padding: var(--nuraly-spacing-05, 2px) var(--nuraly-spacing-1-5, 6px);
    border-radius: var(--nuraly-border-radius-small, 4px);
    background: var(--nuraly-color-interactive, #3b82f6);
    color: var(--nuraly-color-text-on-color, white);
    text-transform: uppercase;
    font-weight: var(--nuraly-font-weight-medium, 500);
  }

  /* Agent badge */
  .node-type-badge.agent {
    background: linear-gradient(135deg, var(--nuraly-color-support-success, #10b981), #059669);
  }

  /* Body */
  .node-body {
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    min-height: 20px;
  }

  .node-description {
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-secondary, #888);
    line-height: 1.4;
  }

  /* Preview button for chatbot nodes */
  .node-preview-btn {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
    margin-top: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-1-5, 6px) var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-layer-02, rgba(255, 255, 255, 0.08));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-small, 4px);
    color: var(--nuraly-color-text-secondary, #888);
    font-size: var(--nuraly-font-size-xs, 11px);
    font-family: var(--nuraly-font-family);
    cursor: pointer;
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
  }

  .node-preview-btn:hover {
    background: var(--nuraly-color-interactive, #3b82f6);
    border-color: var(--nuraly-color-interactive, #3b82f6);
    color: var(--nuraly-color-text-on-color, white);
  }

  .node-preview-btn nr-icon {
    --icon-size: 12px;
  }

  /* Status indicator */
  .node-status {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
    padding: var(--nuraly-spacing-1, 4px) var(--nuraly-spacing-2, 8px);
    font-size: var(--nuraly-font-size-xs, 10px);
    border-top: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
  }

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--nuraly-color-text-secondary, #888);
  }

  .status-dot.idle { background: var(--nuraly-color-text-disabled, #6b7280); }
  .status-dot.pending { background: var(--nuraly-color-support-warning, #f59e0b); }
  .status-dot.running {
    background: var(--nuraly-color-interactive, #3b82f6);
    animation: blink 1s infinite;
  }
  .status-dot.completed { background: var(--nuraly-color-support-success, #22c55e); }
  .status-dot.failed { background: var(--nuraly-color-support-error, #ef4444); }
  .status-dot.paused { background: #8b5cf6; }
  .status-dot.waiting { background: var(--nuraly-color-support-warning, #f59e0b); }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .status-text {
    color: var(--nuraly-color-text-secondary, #888);
    text-transform: capitalize;
  }

  /* Ports */
  .ports-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .port {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--nuraly-color-border-strong, #4a4a4a);
    border: 2px solid var(--nuraly-color-border-interactive, #666);
    cursor: crosshair;
    pointer-events: auto;
    transition: transform var(--nuraly-transition-fast, 0.15s) ease,
                background var(--nuraly-transition-fast, 0.15s) ease,
                border-color var(--nuraly-transition-fast, 0.15s) ease;
    z-index: 10;
  }

  .port:hover {
    transform: scale(1.3);
    background: var(--nuraly-color-border-interactive, #5a5a5a);
  }

  .port.connecting {
    transform: scale(1.4);
    background: var(--nuraly-color-interactive, #3b82f6);
    border-color: var(--nuraly-color-interactive, #3b82f6);
  }

  .port.compatible {
    animation: port-pulse 0.8s infinite;
  }

  @keyframes port-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }

  /* Input ports - left side */
  .port.input {
    left: -5px;
    background: var(--nuraly-color-border-strong, #6b7280);
    border-color: var(--nuraly-color-border-interactive, #525252);
  }

  /* Output ports - right side */
  .port.output {
    right: -5px;
    background: var(--nuraly-color-interactive, #3b82f6);
    border-color: var(--nuraly-color-interactive-emphasis, #2563eb);
  }

  /* Conditional ports */
  .port.conditional-true {
    background: var(--nuraly-color-support-success, #22c55e);
    border-color: var(--nuraly-color-support-success-emphasis, #16a34a);
  }

  .port.conditional-false {
    background: var(--nuraly-color-support-error, #ef4444);
    border-color: var(--nuraly-color-support-error-emphasis, #dc2626);
  }

  .port.conditional-default {
    background: var(--nuraly-color-text-disabled, #6b7280);
    border-color: #4b5563;
  }

  .port.error {
    background: var(--nuraly-color-support-error, #ef4444);
    border-color: var(--nuraly-color-support-error-emphasis, #dc2626);
  }

  /* Port labels */
  .port-label {
    position: absolute;
    font-size: var(--nuraly-font-size-xxs, 9px);
    color: var(--nuraly-color-text-secondary, #888);
    white-space: nowrap;
    pointer-events: none;
  }

  .port-label.input {
    left: calc(12px + 4px);
  }

  .port-label.output {
    right: calc(12px + 4px);
  }

  /* Error display */
  .node-error {
    padding: var(--nuraly-spacing-1, 4px) var(--nuraly-spacing-2, 8px);
    font-size: var(--nuraly-font-size-xs, 10px);
    color: var(--nuraly-color-support-error, #ef4444);
    background: rgba(239, 68, 68, 0.1);
    border-top: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 0 0 var(--nuraly-border-radius-medium, 8px) var(--nuraly-border-radius-medium, 8px);
  }

  /* ========================================
   * CARBON THEME - Sharp corners
   * ======================================== */

  .node-container[data-theme="carbon-light"],
  .node-container[data-theme="carbon-dark"],
  .node-container[data-theme="carbon"] {
    border-radius: 0;

    .node-header {
      border-radius: 0;
    }

    .node-icon {
      border-radius: 0;
    }

    .node-type-badge {
      border-radius: 0;
    }

    .node-error {
      border-radius: 0;
    }
  }

  /* ========================================
   * LIGHT THEME STYLING
   * ======================================== */

  /* Light Theme - target node-container with data-theme */
  .node-container[data-theme="light"],
  .node-container[data-theme="carbon-light"],
  .node-container[data-theme="default-light"],
  .node-container[data-theme="default"] {
    background: var(--nuraly-color-layer-01, #ffffff);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
    box-shadow: var(--nuraly-shadow-sm, 0 1px 4px rgba(0, 0, 0, 0.1));
  }

  .node-container[data-theme="light"]:hover,
  .node-container[data-theme="carbon-light"]:hover,
  .node-container[data-theme="default-light"]:hover,
  .node-container[data-theme="default"]:hover {
    border-color: var(--nuraly-color-border-interactive, #a8a8a8);
    box-shadow: var(--nuraly-shadow-md, 0 2px 8px rgba(0, 0, 0, 0.15));
  }

  .node-container[data-theme="light"].selected,
  .node-container[data-theme="carbon-light"].selected,
  .node-container[data-theme="default-light"].selected,
  .node-container[data-theme="default"].selected {
    border-color: var(--nuraly-color-interactive, #3b82f6);
    box-shadow: var(--nuraly-shadow-md, 0 2px 8px rgba(0, 0, 0, 0.15));
  }


  .node-container[data-theme="light"] .node-header,
  .node-container[data-theme="carbon-light"] .node-header,
  .node-container[data-theme="default-light"] .node-header {
    background: var(--nuraly-color-layer-02, #f4f4f4);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
  }

  .node-container[data-theme="light"] .node-title,
  .node-container[data-theme="carbon-light"] .node-title,
  .node-container[data-theme="default-light"] .node-title {
    color: var(--nuraly-color-text-primary, #161616);
  }

  .node-container[data-theme="light"] .node-description,
  .node-container[data-theme="light"] .node-status,
  .node-container[data-theme="light"] .status-text,
  .node-container[data-theme="carbon-light"] .node-description,
  .node-container[data-theme="carbon-light"] .node-status,
  .node-container[data-theme="carbon-light"] .status-text,
  .node-container[data-theme="default-light"] .node-description,
  .node-container[data-theme="default-light"] .node-status,
  .node-container[data-theme="default-light"] .status-text {
    color: var(--nuraly-color-text-secondary, #525252);
  }

  .node-container[data-theme="light"] .port,
  .node-container[data-theme="carbon-light"] .port,
  .node-container[data-theme="default-light"] .port {
    background: var(--nuraly-color-border-strong, #8d8d8d);
    border-color: var(--nuraly-color-border-interactive, #6f6f6f);
  }

  .node-container[data-theme="light"] .port:hover,
  .node-container[data-theme="carbon-light"] .port:hover,
  .node-container[data-theme="default-light"] .port:hover {
    background: var(--nuraly-color-border-interactive, #6f6f6f);
  }

  /* ========================================
   * DARK THEME STYLING (Default)
   * ======================================== */

  /* Dark Theme - target node-container with data-theme */
  .node-container[data-theme="dark"],
  .node-container[data-theme="carbon-dark"],
  .node-container[data-theme="default-dark"] {
    background: var(--nuraly-color-layer-01, #262626);
    border-color: var(--nuraly-color-border-subtle, #393939);
  }

  .node-container[data-theme="dark"]:hover,
  .node-container[data-theme="carbon-dark"]:hover,
  .node-container[data-theme="default-dark"]:hover {
    box-shadow: var(--nuraly-shadow-md, 0 4px 16px rgba(0, 0, 0, 0.5));
  }

  .node-container[data-theme="dark"] .node-header,
  .node-container[data-theme="carbon-dark"] .node-header,
  .node-container[data-theme="default-dark"] .node-header {
    background: var(--nuraly-color-layer-02, #393939);
    border-color: var(--nuraly-color-border-subtle, #525252);
  }

  .node-container[data-theme="dark"] .node-title,
  .node-container[data-theme="carbon-dark"] .node-title,
  .node-container[data-theme="default-dark"] .node-title {
    color: var(--nuraly-color-text-primary, #f4f4f4);
  }

  .node-container[data-theme="dark"] .node-description,
  .node-container[data-theme="dark"] .status-text,
  .node-container[data-theme="carbon-dark"] .node-description,
  .node-container[data-theme="carbon-dark"] .status-text,
  .node-container[data-theme="default-dark"] .node-description,
  .node-container[data-theme="default-dark"] .status-text {
    color: var(--nuraly-color-text-secondary, #c6c6c6);
  }

  /* ========================================
   * DB TABLE NODE STYLES (ERD-style)
   * ======================================== */

  .node-container.db-table-node {
    min-width: 160px;
    min-height: auto;
    padding: 0;
  }

  .db-table-header {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    border-radius: var(--nuraly-border-radius-medium, 8px) var(--nuraly-border-radius-medium, 8px) 0 0;
    border-bottom: 2px solid rgba(0, 0, 0, 0.2);
  }

  .db-table-name {
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: white;
    text-transform: capitalize;
  }

  .db-table-columns {
    padding: var(--nuraly-spacing-1, 4px) 0;
    background: var(--nuraly-color-layer-01, #1e1e1e);
  }

  .db-table-column {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-1-5, 6px) var(--nuraly-spacing-3, 12px);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-primary, #e5e5e5);
    border-bottom: 1px solid var(--nuraly-color-border-subtle, rgba(255, 255, 255, 0.06));
    transition: background var(--nuraly-transition-fast, 0.15s) ease;
  }

  .db-table-column:last-child {
    border-bottom: none;
  }

  .db-table-column:hover {
    background: var(--nuraly-color-layer-02, rgba(255, 255, 255, 0.05));
  }

  .db-table-column.primary-key {
    background: rgba(245, 158, 11, 0.1);
  }

  .db-table-column.primary-key:hover {
    background: rgba(245, 158, 11, 0.15);
  }

  .column-type-icon {
    color: var(--nuraly-color-text-secondary, #888);
    --icon-size: 12px;
    flex-shrink: 0;
  }

  .column-key-icon {
    color: #f59e0b;
    --icon-size: 12px;
    flex-shrink: 0;
  }

  .column-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .column-required {
    color: var(--nuraly-color-support-error, #ef4444);
    font-weight: var(--nuraly-font-weight-bold, 700);
    font-size: var(--nuraly-font-size-xs, 10px);
  }

  .db-table-empty {
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-disabled, #666);
    font-style: italic;
    text-align: center;
  }

  /* DB Table node - Light theme */
  .node-container.db-table-node[data-theme="light"] .db-table-columns,
  .node-container.db-table-node[data-theme="carbon-light"] .db-table-columns,
  .node-container.db-table-node[data-theme="default-light"] .db-table-columns,
  .node-container.db-table-node[data-theme="default"] .db-table-columns {
    background: var(--nuraly-color-layer-01, #ffffff);
  }

  .node-container.db-table-node[data-theme="light"] .db-table-column,
  .node-container.db-table-node[data-theme="carbon-light"] .db-table-column,
  .node-container.db-table-node[data-theme="default-light"] .db-table-column,
  .node-container.db-table-node[data-theme="default"] .db-table-column {
    color: var(--nuraly-color-text-primary, #161616);
    border-bottom-color: var(--nuraly-color-border-subtle, rgba(0, 0, 0, 0.1));
  }

  .node-container.db-table-node[data-theme="light"] .db-table-column:hover,
  .node-container.db-table-node[data-theme="carbon-light"] .db-table-column:hover,
  .node-container.db-table-node[data-theme="default-light"] .db-table-column:hover,
  .node-container.db-table-node[data-theme="default"] .db-table-column:hover {
    background: var(--nuraly-color-layer-02, #f4f4f4);
  }

  .node-container.db-table-node[data-theme="light"] .column-type-icon,
  .node-container.db-table-node[data-theme="carbon-light"] .column-type-icon,
  .node-container.db-table-node[data-theme="default-light"] .column-type-icon,
  .node-container.db-table-node[data-theme="default"] .column-type-icon {
    color: var(--nuraly-color-text-secondary, #525252);
  }

  /* DB Table node - Carbon theme (sharp corners) */
  .node-container.db-table-node[data-theme="carbon-light"] .db-table-header,
  .node-container.db-table-node[data-theme="carbon-dark"] .db-table-header,
  .node-container.db-table-node[data-theme="carbon"] .db-table-header {
    border-radius: 0;
  }
`;

export const styles = workflowNodeStyles;
