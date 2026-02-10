import { css } from 'lit';

export const workflowsListStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .list-header {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  .sections-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding-right: 4px;
  }

  .section {
    display: flex;
    flex-direction: column;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0;
  }

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

  .workflow-name {
    font-weight: 500;
    color: var(--nuraly-color-primary, #14144b);
  }

  /* Pin icon styles */
  .pin-icon {
    cursor: pointer;
    --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
    transition: color 150ms ease;
  }

  .pin-icon:hover {
    --nuraly-icon-color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  .pin-icon.pinned {
    --nuraly-icon-color: var(--nuraly-color-primary, #14144b);
  }

  .unpin-icon {
    cursor: pointer;
    --nuraly-icon-color: var(--nuraly-color-primary, #14144b);
    transition: color 150ms ease;
  }

  .unpin-icon:hover {
    --nuraly-icon-color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  /* Pinned cards grid */
  .pinned-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    align-items: stretch;
  }

  /* Card styles */
  .pinned-grid nr-card {
    cursor: pointer;
    transition: box-shadow 150ms ease;
    --nuraly-card-padding: 14px;
    --nuraly-card-border-radius: 8px;
    height: 100%;
    box-sizing: border-box;
  }

  .pinned-grid nr-card:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  .card-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 12px 0;
  }

  .card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 12px;
    border-top: 1px solid var(--nuraly-color-border-subtle, #f0f0f0);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .meta-item svg {
    width: 12px;
    height: 12px;
  }

  .card-actions {
    display: flex;
    gap: 6px;
    opacity: 0;
    transition: opacity 150ms ease;
  }

  .pinned-grid nr-card:hover .card-actions {
    opacity: 1;
  }

  .workflow-app {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    border-radius: 4px;
    font-size: 11px;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  /* Status badge styles */
  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .status-badge.active .status-dot {
    background: var(--nuraly-color-success, #22c55e);
  }

  .status-badge.inactive .status-dot {
    background: var(--nuraly-color-warning, #f59e0b);
  }

  .date-text {
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    font-size: 13px;
  }

  .actions-cell {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }

  /* Workflow name cell with template badge */
  .workflow-name-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  /* nr-table styling overrides */
  .table-container nr-table {
    --nuraly-table-border-radius: 0;
  }

  .table-container nr-table::part(table) {
    border: none;
  }

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

  .empty-state-icon {
    width: 56px;
    height: 56px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    margin-bottom: 16px;
  }

  .empty-state-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0 0 6px 0;
  }

  .empty-state-description {
    font-size: 13px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    margin: 0;
    max-width: 280px;
    line-height: 1.5;
  }

  /* Create workflow dropdown form styles */
  .create-workflow-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .dropdown-form-header {
    font-size: 13px;
    font-weight: 600;
    color: var(--nuraly-color-text, #0f0f3c);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
    margin-bottom: 4px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
  }

  .form-hint {
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .optional-label {
    font-weight: 400;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .dropdown-form-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid var(--nuraly-color-border, #e8e8f0);
    margin-top: 4px;
  }

  /* Create options menu styles */
  .create-options-menu {
    display: flex;
    flex-direction: column;
    padding: 6px;
    min-width: 200px;
  }

  .create-option {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .create-option:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
  }

  .create-option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    --nuraly-icon-color: var(--nuraly-color-text-secondary, #5c5c7a);
    --nuraly-icon-size: 18px;
  }

  .create-option-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .create-option-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
  }

  .create-option-description {
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  /* Template modal styles */
  .template-modal-overlay {
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

  .template-modal {
    background: var(--nuraly-color-surface, #ffffff);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 680px;
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

  .template-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--nuraly-color-border, #e8e8f0);
  }

  .template-modal-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0;
  }

  .template-modal-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    --nuraly-icon-color: var(--nuraly-color-text-tertiary, #8c8ca8);
    --nuraly-icon-size: 20px;
    transition: all 150ms ease;
  }

  .template-modal-close:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
    --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
  }

  .template-modal-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .template-card {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border: 2px solid var(--nuraly-color-border, #e8e8f0);
    border-radius: 10px;
    cursor: pointer;
    transition: all 150ms ease;
    background: var(--nuraly-color-surface, #ffffff);
  }

  .template-card:hover {
    border-color: var(--nuraly-color-primary-light, #6366f1);
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
  }

  .template-card.selected {
    border-color: var(--nuraly-color-primary, #14144b);
    background: var(--nuraly-color-primary-bg, #f0f0ff);
  }

  .template-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    --nuraly-icon-color: var(--nuraly-color-primary, #14144b);
    --nuraly-icon-size: 22px;
    margin-bottom: 12px;
  }

  .template-card.selected .template-card-icon {
    background: var(--nuraly-color-primary, #14144b);
    --nuraly-icon-color: white;
  }

  .template-card-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
    margin: 0 0 4px 0;
  }

  .template-card-description {
    font-size: 12px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    line-height: 1.4;
    margin: 0;
  }

  .template-card-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }

  .template-card-category {
    font-size: 10px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .template-card-nodes {
    font-size: 10px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .template-section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    margin: 0 0 10px 0;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .template-section-title:not(:first-child) {
    margin-top: 20px;
  }

  .template-card-icon.user-template {
    background: var(--nuraly-color-primary, #14144b);
    --nuraly-icon-color: white;
  }

  .template-app-select {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .template-modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid var(--nuraly-color-border, #e8e8f0);
  }

  /* Back button in dropdown */
  .dropdown-back-button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    margin: -4px -4px 8px -4px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    --nuraly-icon-color: var(--nuraly-color-text-secondary, #5c5c7a);
    --nuraly-icon-size: 14px;
    font-size: 12px;
    transition: all 150ms ease;
  }

  .dropdown-back-button:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
    color: var(--nuraly-color-text, #0f0f3c);
    --nuraly-icon-color: var(--nuraly-color-text, #0f0f3c);
  }

  /* Draggable workflow name cursor hint */
  .workflow-name[draggable="true"] {
    cursor: grab;
  }

  .workflow-name[draggable="true"]:active {
    cursor: grabbing;
  }

  /* ─── Breadcrumb bar ────────────────────────────────────────── */

  .breadcrumb-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }

  .breadcrumb-segment {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: all 150ms ease;
  }

  .breadcrumb-segment:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
    color: var(--nuraly-color-text, #0f0f3c);
  }

  .breadcrumb-segment.active {
    color: var(--nuraly-color-text, #0f0f3c);
    font-weight: 600;
    cursor: default;
  }

  .breadcrumb-segment.root.drag-over {
    background: var(--nuraly-color-primary-bg, #f0f0ff);
    outline: 2px dashed var(--nuraly-color-primary, #14144b);
  }

  .breadcrumb-segment svg {
    flex-shrink: 0;
    stroke: currentColor;
  }

  .breadcrumb-separator {
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    font-size: 12px;
    user-select: none;
  }

  /* ─── New Folder button ─────────────────────────────────────── */

  .new-folder-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px dashed var(--nuraly-color-border, #e8e8f0);
    border-radius: 6px;
    background: var(--nuraly-color-surface, #ffffff);
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    font-size: 12px;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: all 150ms ease;
  }

  .new-folder-btn:hover {
    color: var(--nuraly-color-primary, #14144b);
    border-color: var(--nuraly-color-primary, #14144b);
    background: var(--nuraly-color-primary-bg, #f0f0ff);
  }

  .new-folder-btn svg {
    stroke: currentColor;
  }

  /* ─── Loading state ─────────────────────────────────────────── */

  .loading-folder {
    text-align: center;
    padding: 12px;
    font-size: 13px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  /* ─── Folder container ───────────────────────────────────── */

  .folder-container {
    padding: 16px;
    background: var(--nuraly-color-background, #fafafa);
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
    border-radius: 10px;
  }

  .folder-container.collapsed {
    padding: 10px 16px;
  }

  .folder-container-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .folder-container:not(.collapsed) .folder-container-header {
    margin-bottom: 12px;
  }

  .folder-toggle-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
    border: none;
    background: transparent;
    color: var(--nuraly-color-text-secondary, #5c5c7a);
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    transition: color 150ms ease;
    flex-shrink: 0;
  }

  .folder-toggle-btn:hover {
    color: var(--nuraly-color-text, #0f0f3c);
  }

  .folder-toggle-btn svg {
    stroke: currentColor;
    transition: transform 150ms ease;
  }

  /* ─── Folder icon & count (shared) ────────────────────────── */

  .folder-icon {
    flex-shrink: 0;
    stroke: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .folder-item-count {
    font-size: 11px;
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    padding: 1px 6px;
    background: var(--nuraly-color-background-active, #e8e8f0);
    border-radius: 10px;
  }

  /* ─── Folder drop target ────────────────────────────────────── */

  .folder-drop-target {
    background: var(--nuraly-color-primary-bg, #f0f0ff) !important;
    outline: 2px dashed var(--nuraly-color-primary, #14144b);
    outline-offset: -2px;
  }

  /* ─── Folder cards (cards view) ─────────────────────────────── */

  .folder-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 16px;
    background: var(--nuraly-color-surface, #ffffff);
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
    border-radius: 8px;
    cursor: pointer;
    transition: all 150ms ease;
    text-align: center;
    box-sizing: border-box;
  }

  .folder-card:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
    border-color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .folder-card.folder-drop-target {
    background: var(--nuraly-color-primary-bg, #f0f0ff);
    border-color: var(--nuraly-color-primary, #14144b);
    border-style: dashed;
  }

  .folder-card.new-folder {
    border-style: dashed;
    border-color: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .folder-card-icon {
    stroke: var(--nuraly-color-text-tertiary, #8c8ca8);
  }

  .folder-card:hover .folder-card-icon {
    stroke: var(--nuraly-color-primary, #14144b);
  }

  .folder-card-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--nuraly-color-text, #0f0f3c);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  /* ─── New folder input ──────────────────────────────────────── */

  .new-folder-input-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
  }

  .new-folder-input,
  .rename-folder-input {
    padding: 5px 10px;
    border: 1px solid var(--nuraly-color-primary, #14144b);
    border-radius: 6px;
    background: var(--nuraly-color-surface, #ffffff);
    color: var(--nuraly-color-text, #0f0f3c);
    font-size: 12px;
    font-family: inherit;
    font-weight: 500;
    outline: none;
    width: 160px;
    box-shadow: 0 0 0 2px rgba(20, 20, 75, 0.1);
  }

  .new-folder-input::placeholder {
    color: var(--nuraly-color-text-tertiary, #8c8ca8);
    font-weight: 400;
  }

  /* ─── Context menu ──────────────────────────────────────────── */

  .context-menu {
    position: fixed;
    z-index: 1000;
    background: var(--nuraly-color-surface, #ffffff);
    border: 1px solid var(--nuraly-color-border, #e8e8f0);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    padding: 4px;
    min-width: 140px;
    animation: fadeIn 100ms ease;
  }

  .context-menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--nuraly-color-text, #0f0f3c);
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: background-color 100ms ease;
  }

  .context-menu-item:hover {
    background: var(--nuraly-color-background-hover, #f5f5f7);
  }

  .context-menu-item.danger {
    color: var(--nuraly-color-danger, #dc2626);
  }

  .context-menu-item.danger:hover {
    background: #fef2f2;
  }

  .context-menu-item svg {
    flex-shrink: 0;
  }

  .context-menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* Responsive: mobile */
  @media (max-width: 768px) {
    .pinned-grid {
      grid-template-columns: 1fr;
    }

    .table-container {
      overflow-x: auto;
    }

    .card-actions {
      opacity: 1;
    }

    .template-modal {
      width: 95%;
      max-height: 90vh;
    }

    .template-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
`;

export default [workflowsListStyles];
