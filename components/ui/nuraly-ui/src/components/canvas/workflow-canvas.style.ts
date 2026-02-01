import { css } from 'lit';

/**
 * Workflow Canvas component styles
 * Using shared CSS variables from /src/shared/themes/
 * Supports default and carbon themes
 */
export const workflowCanvasStyles = css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;

    /* Force CSS custom property inheritance to ensure theme switching works properly */
    color: var(--nuraly-color-text);
    background-color: var(--nuraly-color-background);
  }

  /* Force re-evaluation of theme-dependent properties on theme change */
  :host([data-theme]) {
    color: inherit;
    background-color: inherit;
  }

  .canvas-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
    background: var(--nuraly-color-background-inverse, #0f0f0f);
    overflow: hidden;
    font-family: var(--nuraly-font-family);
    /* Prevent browser back/forward navigation on horizontal swipe */
    overscroll-behavior: none;
    touch-action: none;
  }

  /* PAN mode cursor */
  .canvas-wrapper[data-mode="PAN"] {
    cursor: grab;
  }

  .canvas-wrapper[data-mode="PAN"]:active {
    cursor: grabbing;
  }

  /* Grid background */
  .canvas-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image:
      linear-gradient(var(--nuraly-color-border-subtle, rgba(255, 255, 255, 0.05)) 1px, transparent 1px),
      linear-gradient(90deg, var(--nuraly-color-border-subtle, rgba(255, 255, 255, 0.05)) 1px, transparent 1px);
    background-size: var(--nuraly-spacing-5, 20px) var(--nuraly-spacing-5, 20px);
    z-index: 0;
    pointer-events: none;
  }

  /* Viewport container for pan/zoom */
  .canvas-viewport {
    position: absolute;
    top: 0;
    left: 0;
    transform-origin: 0 0;
    will-change: transform;
    z-index: 1;
  }

  /* SVG layer for edges */
  .edges-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 10000px;
    height: 10000px;
    pointer-events: none;
    overflow: visible;
    z-index: 1;
  }

  /* Edge styles */
  .edge-path {
    fill: none;
    stroke: var(--nuraly-color-border-strong, #4a4a4a);
    stroke-width: 2;
    transition: stroke var(--nuraly-transition-fast, 0.15s) ease;
    pointer-events: stroke;
    cursor: pointer;
  }

  .edge-path:hover {
    stroke: var(--nuraly-color-border-interactive, #6a6a6a);
    stroke-width: 3;
  }

  .edge-path.selected {
    stroke: var(--nuraly-color-interactive, #3b82f6);
    stroke-width: 3;
  }

  .edge-path.animated {
    stroke-dasharray: 8;
    animation: edge-flow 1s linear infinite;
  }

  @keyframes edge-flow {
    from { stroke-dashoffset: 16; }
    to { stroke-dashoffset: 0; }
  }

  .edge-arrow {
    fill: var(--nuraly-color-border-strong, #4a4a4a);
    transition: fill var(--nuraly-transition-fast, 0.15s) ease;
  }

  .edge-path:hover + .edge-arrow,
  .edge-path.selected + .edge-arrow {
    fill: var(--nuraly-color-interactive, #3b82f6);
  }

  .edge-label {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 10px);
    fill: var(--nuraly-color-text-secondary, #888);
    pointer-events: none;
  }

  /* Temporary connection line */
  .connection-line {
    fill: none;
    stroke: var(--nuraly-color-interactive, #3b82f6);
    stroke-width: 2;
    stroke-dasharray: 5;
    pointer-events: none;
  }

  /* Nodes layer */
  .nodes-layer {
    position: relative;
    z-index: 2;
  }

  /* Selection box */
  .selection-box {
    position: absolute;
    border: 1px dashed var(--nuraly-color-interactive, #3b82f6);
    background: rgba(59, 130, 246, 0.1);
    pointer-events: none;
  }

  /* Minimap */
  .minimap {
    position: absolute;
    bottom: var(--nuraly-spacing-4, 16px);
    right: var(--nuraly-spacing-4, 16px);
    width: 200px;
    height: 150px;
    background: var(--nuraly-color-layer-01, rgba(0, 0, 0, 0.8));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-medium, 8px);
    overflow: hidden;
  }

  .minimap-viewport {
    position: absolute;
    border: 2px solid var(--nuraly-color-interactive, #3b82f6);
    background: rgba(59, 130, 246, 0.1);
    cursor: move;
  }

  .minimap-node {
    position: absolute;
    background: var(--nuraly-color-border-strong, #4a4a4a);
    border-radius: 2px;
  }

  /* Toolbar */
  .canvas-toolbar {
    position: absolute;
    top: var(--nuraly-spacing-4, 16px);
    left: var(--nuraly-spacing-4, 16px);
    display: flex;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-layer-02, rgba(0, 0, 0, 0.8));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-medium, 8px);
    z-index: 100;
  }

  .toolbar-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--nuraly-size-sm, 32px);
    height: var(--nuraly-size-sm, 32px);
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--nuraly-border-radius-small, 4px);
    color: var(--nuraly-color-text-secondary, #888);
    cursor: pointer;
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
  }

  .toolbar-btn:hover {
    background: var(--nuraly-color-layer-hover-02, rgba(255, 255, 255, 0.1));
    color: var(--nuraly-color-text-primary, #e5e5e5);
  }

  .toolbar-btn.active {
    background: var(--nuraly-color-interactive, #3b82f6);
    color: var(--nuraly-color-text-on-color, #fff);
  }

  .toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toolbar-btn nr-icon {
    color: inherit;
  }

  .toolbar-divider {
    width: 1px;
    background: var(--nuraly-color-border-subtle, #3a3a3a);
    margin: 0 var(--nuraly-spacing-1, 4px);
  }

  /* Zoom controls */
  .zoom-controls {
    position: absolute;
    bottom: var(--nuraly-spacing-4, 16px);
    left: var(--nuraly-spacing-4, 16px);
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-layer-02, rgba(0, 0, 0, 0.8));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-medium, 8px);
  }

  .zoom-value {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    color: var(--nuraly-color-text-secondary, #888);
    min-width: 48px;
    text-align: center;
  }

  /* Node palette */
  .node-palette {
    position: absolute;
    top: 64px;
    left: var(--nuraly-spacing-4, 16px);
    width: 220px;
    max-height: calc(100% - 180px);
    background: var(--nuraly-color-layer-01, rgba(0, 0, 0, 0.9));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-medium, 8px);
    overflow: hidden;
    z-index: 90;
    display: flex;
    flex-direction: column;
  }

  .palette-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-spacing-3, 12px);
    border-bottom: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
  }

  .palette-title {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-text-primary, #e5e5e5);
    text-transform: uppercase;
  }

  .palette-close {
    background: none;
    border: none;
    color: var(--nuraly-color-text-secondary, #888);
    cursor: pointer;
    padding: var(--nuraly-spacing-1, 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--nuraly-border-radius-small, 4px);
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
  }

  .palette-close:hover {
    color: var(--nuraly-color-text-primary, #e5e5e5);
    background: var(--nuraly-color-layer-hover-01, rgba(255, 255, 255, 0.1));
  }

  .palette-search {
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    border-bottom: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
  }

  .palette-search nr-input {
    width: 100%;
  }

  .palette-search nr-icon {
    color: var(--nuraly-color-text-placeholder, #666);
  }

  .palette-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-6, 24px);
    color: var(--nuraly-color-text-placeholder, #666);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
  }

  .palette-empty nr-icon {
    color: inherit;
    opacity: 0.7;
  }

  .palette-content {
    flex: 1;
    overflow-y: auto;
    overscroll-behavior: contain;
    min-height: 0;
  }

  .palette-category {
    border-bottom: 1px solid var(--nuraly-color-border-subtle, #2a2a2a);
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2-5, 10px) var(--nuraly-spacing-3, 12px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-text-secondary, #888);
    text-transform: uppercase;
    cursor: pointer;
    transition: background var(--nuraly-transition-fast, 0.15s) ease;
  }

  .category-header:hover {
    background: var(--nuraly-color-layer-hover-01, rgba(255, 255, 255, 0.05));
  }

  .category-header nr-icon {
    color: inherit;
  }

  .category-items {
    padding: var(--nuraly-spacing-2, 8px);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .palette-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-layer-02, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--nuraly-color-border-subtle, #2a2a2a);
    border-radius: var(--nuraly-border-radius-small, 6px);
    cursor: grab;
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
  }

  .palette-item:hover {
    background: var(--nuraly-color-layer-hover-02, rgba(255, 255, 255, 0.08));
    border-color: var(--nuraly-color-border-strong, #4a4a4a);
  }

  .palette-item:active {
    cursor: grabbing;
  }

  .palette-item-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--nuraly-border-radius-small, 4px);
    color: var(--nuraly-color-text-on-color, white);
  }

  .palette-item-icon nr-icon {
    color: inherit;
  }

  .palette-item-name {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 10px);
    color: var(--nuraly-color-text-secondary, #aaa);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  /* Context menu */
  .context-menu {
    position: fixed;
    min-width: 160px;
    background: var(--nuraly-color-layer-01, rgba(0, 0, 0, 0.95));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-medium, 8px);
    padding: var(--nuraly-spacing-1, 4px) 0;
    z-index: 1000;
    box-shadow: var(--nuraly-shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.5));
  }

  .context-menu-item {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    color: var(--nuraly-color-text-primary, #e5e5e5);
    cursor: pointer;
    transition: background var(--nuraly-transition-fast, 0.15s) ease;
  }

  .context-menu-item:hover {
    background: var(--nuraly-color-layer-hover-01, rgba(255, 255, 255, 0.1));
  }

  .context-menu-item.danger {
    color: var(--nuraly-color-support-error, #ef4444);
  }

  .context-menu-item nr-icon {
    color: inherit;
  }

  .context-menu-shortcut {
    margin-left: auto;
    font-size: 11px;
    color: var(--nuraly-color-text-secondary, #a0a0a0);
    opacity: 0.7;
  }

  .context-menu-divider {
    height: 1px;
    background: var(--nuraly-color-border-subtle, #3a3a3a);
    margin: var(--nuraly-spacing-1, 4px) 0;
  }

  /* Configuration panel */
  .config-panel {
    position: absolute;
    width: 320px;
    max-height: 500px;
    background: var(--nuraly-color-layer-01, rgba(0, 0, 0, 0.95));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-medium, 8px);
    overflow: hidden;
    z-index: 200;
    display: flex;
    flex-direction: column;
    box-shadow: var(--nuraly-shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.4));
  }

  .config-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-spacing-3, 12px);
    border-bottom: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    background: var(--nuraly-color-layer-02, rgba(255, 255, 255, 0.03));
  }

  .config-panel-title {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-text-primary, #e5e5e5);
  }

  .config-panel-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: var(--nuraly-border-radius-small, 4px);
    color: var(--nuraly-color-text-on-color, white);
    margin-right: var(--nuraly-spacing-2, 8px);
  }

  .config-panel-icon nr-icon {
    color: inherit;
  }

  .config-panel-close {
    background: none;
    border: none;
    color: var(--nuraly-color-text-secondary, #888);
    cursor: pointer;
    padding: var(--nuraly-spacing-1, 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--nuraly-border-radius-small, 4px);
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
  }

  .config-panel-close:hover {
    color: var(--nuraly-color-text-primary, #e5e5e5);
    background: var(--nuraly-color-layer-hover-01, rgba(255, 255, 255, 0.1));
  }

  .config-panel-content {
    flex: 1;
    overflow-y: auto;
    padding: var(--nuraly-spacing-3, 12px);
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-3, 12px);
    overscroll-behavior: contain;
  }

  .config-field {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-1, 4px);
  }

  .config-field label {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: var(--nuraly-font-weight-medium, 500);
    color: var(--nuraly-color-text-secondary, #888);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .config-field nr-input {
    width: 100%;
  }

  .config-section {
    padding-top: var(--nuraly-spacing-2, 8px);
    border-top: 1px solid var(--nuraly-color-border-subtle, #2a2a2a);
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-3, 12px);
  }

  .config-section:first-child {
    padding-top: 0;
    border-top: none;
  }

  .config-section-header {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-1, 4px);
  }

  .config-section-title {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 10px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-text-placeholder, #666);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .config-section-desc {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-helper, #888);
  }

  .config-section-divider {
    height: 1px;
    background: var(--nuraly-color-border-subtle, #2a2a2a);
    margin: var(--nuraly-spacing-2, 8px) 0;
  }

  .field-hint {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 10px);
    color: var(--nuraly-color-text-helper, #666);
    margin-top: var(--nuraly-spacing-1, 4px);
  }

  /* File upload styles */
  .file-upload-container {
    position: relative;
  }

  .file-upload-input {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
    overflow: hidden;
  }

  .file-upload-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-3, 12px);
    border: 2px dashed var(--nuraly-color-border, #333);
    border-radius: var(--nuraly-border-radius-md, 8px);
    background: var(--nuraly-color-surface-hover, rgba(255, 255, 255, 0.02));
    color: var(--nuraly-color-text-secondary, #888);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .file-upload-label:hover {
    border-color: var(--nuraly-color-primary, #3b82f6);
    background: var(--nuraly-color-primary-subtle, rgba(59, 130, 246, 0.1));
    color: var(--nuraly-color-primary, #3b82f6);
  }

  .test-file-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-surface-raised, var(--nuraly-color-surface, #f5f5f5));
    border: 1px solid var(--nuraly-color-border, #e0e0e0);
    border-radius: var(--nuraly-border-radius-md, 8px);
  }

  .test-file-details {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    overflow: hidden;
  }

  .test-file-details nr-icon {
    color: var(--nuraly-color-text-secondary, #666);
    flex-shrink: 0;
  }

  .test-file-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .test-file-name {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    font-weight: var(--nuraly-font-weight-medium, 500);
    color: var(--nuraly-color-text, #333);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .test-file-size {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 10px);
    color: var(--nuraly-color-text-secondary, #666);
  }

  .test-file-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: var(--nuraly-border-radius-sm, 4px);
    background: transparent;
    color: var(--nuraly-color-text-secondary, #666);
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .test-file-remove:hover {
    background: var(--nuraly-color-error-subtle, rgba(239, 68, 68, 0.1));
    color: var(--nuraly-color-error, #ef4444);
  }

  .test-workflow-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--nuraly-spacing-2, 8px);
    margin-top: var(--nuraly-spacing-2, 8px);
    width: 100%;
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-primary, #3b82f6);
    border: none;
    border-radius: var(--nuraly-border-radius-md, 6px);
    color: var(--nuraly-color-text-on-color, #fff);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    font-weight: var(--nuraly-font-weight-medium, 500);
    cursor: pointer;
    transition: background var(--nuraly-transition-fast, 0.15s) ease;
  }

  .test-workflow-btn:hover {
    background: var(--nuraly-color-primary-hover, #2563eb);
  }

  .test-workflow-btn:active {
    background: var(--nuraly-color-primary-active, #1d4ed8);
  }

  .test-workflow-btn nr-icon {
    flex-shrink: 0;
  }

  /* Variables section styles */
  .variables-section {
    margin-top: var(--nuraly-spacing-3, 12px);
  }

  .variables-section .config-section-title {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
  }

  .variables-list {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
    max-height: 200px;
    overflow-y: auto;
  }

  .variables-group {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-1, 4px);
  }

  .variables-group-header {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 10px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-interactive, #0f62fe);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .variable-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-1, 4px) var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-background-hover, rgba(255, 255, 255, 0.05));
    border-radius: var(--nuraly-border-radius-sm, 4px);
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .variable-item:hover {
    background: var(--nuraly-color-layer-02, rgba(255, 255, 255, 0.1));
  }

  .variable-path {
    font-family: var(--nuraly-font-family-mono, 'SF Mono', monospace);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text, #fff);
    word-break: break-all;
  }

  .variable-type {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 10px);
    color: var(--nuraly-color-text-helper, #888);
    padding: 2px 6px;
    background: var(--nuraly-color-layer-01, rgba(0, 0, 0, 0.2));
    border-radius: var(--nuraly-border-radius-xs, 3px);
    flex-shrink: 0;
  }

  .variable-item.dynamic {
    border-left: 2px solid var(--nuraly-color-interactive, #0f62fe);
  }

  .variable-dynamic-badge {
    font-family: var(--nuraly-font-family);
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--nuraly-color-interactive, #0f62fe);
    padding: 1px 4px;
    background: rgba(15, 98, 254, 0.15);
    border-radius: var(--nuraly-border-radius-xs, 3px);
    flex-shrink: 0;
  }

  .variables-loading {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    color: var(--nuraly-color-text-helper, #888);
    font-style: italic;
    padding: var(--nuraly-spacing-2, 8px);
    text-align: center;
  }

  /* Execution data section styles */
  .execution-section {
    border-top: 1px solid var(--nuraly-color-border-subtle, #393939);
    margin-top: var(--nuraly-spacing-3, 12px);
    padding-top: var(--nuraly-spacing-3, 12px);
  }

  .execution-status {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .execution-error {
    display: flex;
    align-items: flex-start;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    color: #ef4444;
    margin-bottom: var(--nuraly-spacing-2, 8px);
  }

  .execution-error nr-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .execution-data-block {
    margin-bottom: var(--nuraly-spacing-2, 8px);
  }

  .execution-data-label {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: 500;
    color: var(--nuraly-color-text-helper, #888);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--nuraly-spacing-1, 4px);
  }

  .execution-data-content {
    font-family: var(--nuraly-font-family-mono, 'SF Mono', monospace);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text, #fff);
    background: var(--nuraly-color-layer-01, rgba(0, 0, 0, 0.2));
    border: 1px solid var(--nuraly-color-border-subtle, #393939);
    border-radius: var(--nuraly-border-radius-sm, 4px);
    padding: var(--nuraly-spacing-2, 8px);
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    max-height: 150px;
    overflow-y: auto;
  }

  .execution-duration {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-helper, #888);
    margin-top: var(--nuraly-spacing-2, 8px);
  }

  .retry-node-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--nuraly-spacing-1, 4px);
    width: 100%;
    padding: var(--nuraly-spacing-2, 8px);
    margin-top: var(--nuraly-spacing-2, 8px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    font-weight: 500;
    color: var(--nuraly-color-text-on-color, #fff);
    background: var(--nuraly-color-interactive, #0f62fe);
    border: none;
    border-radius: var(--nuraly-border-radius-sm, 4px);
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .retry-node-btn:hover {
    background: var(--nuraly-color-interactive-hover, #0353e9);
  }

  .config-info-box {
    display: flex;
    align-items: flex-start;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-background-hover, rgba(255, 255, 255, 0.05));
    border-radius: var(--nuraly-border-radius-sm, 4px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    color: var(--nuraly-color-text-secondary, #aaa);
    line-height: 1.4;
  }

  .config-info-box nr-icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--nuraly-color-text-helper, #888);
  }

  .config-info-box strong {
    color: var(--nuraly-color-text, #fff);
  }

  .field-description {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-helper, #888);
    margin-top: var(--nuraly-spacing-1, 4px);
  }

  /* Webhook URL styles */
  .webhook-url-container {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-layer-01, #f4f4f4);
    border: 1px solid var(--nuraly-color-border-subtle, #e0e0e0);
    border-radius: var(--nuraly-radius-md, 6px);
  }

  .webhook-url {
    flex: 1;
    font-family: var(--nuraly-font-family-mono, monospace);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-primary, #161616);
    word-break: break-all;
    user-select: all;
  }

  .copy-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--nuraly-spacing-1, 4px);
    background: transparent;
    border: none;
    border-radius: var(--nuraly-radius-sm, 4px);
    cursor: pointer;
    color: var(--nuraly-color-text-secondary, #525252);
    transition: background 0.15s ease, color 0.15s ease;
  }

  .copy-btn:hover {
    background: var(--nuraly-color-layer-02, #e0e0e0);
    color: var(--nuraly-color-text-primary, #161616);
  }

  /* Variable node styles */
  .config-columns-list {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .config-column-item {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .variable-fields {
    display: flex;
    flex-direction: row;
    gap: var(--nuraly-spacing-2, 8px);
    flex: 1;
    align-items: center;
  }

  .variable-type-select {
    flex: 0 0 70px;
    padding: var(--nuraly-spacing-2, 8px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    background: var(--nuraly-color-field-01, #262626);
    border: 1px solid var(--nuraly-color-border-subtle, #393939);
    border-radius: var(--nuraly-radius-sm, 4px);
    color: var(--nuraly-color-text-primary, #f4f4f4);
    cursor: pointer;
  }

  .variable-type-select:focus {
    outline: none;
    border-color: var(--nuraly-color-focus, #0f62fe);
  }

  .variable-name-input {
    flex: 1;
    min-width: 60px;
  }

  .variable-value-input {
    flex: 2;
    min-width: 80px;
  }

  .remove-column-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--nuraly-spacing-1, 4px);
    background: transparent;
    border: none;
    border-radius: var(--nuraly-radius-sm, 4px);
    cursor: pointer;
    color: var(--nuraly-color-text-secondary, #888);
    transition: background 0.15s ease, color 0.15s ease;
  }

  .remove-column-btn:hover {
    background: var(--nuraly-color-support-error-subtle, rgba(218, 30, 40, 0.1));
    color: var(--nuraly-color-support-error, #da1e28);
  }

  .add-column-btn {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px);
    background: transparent;
    border: 1px dashed var(--nuraly-color-border-subtle, #393939);
    border-radius: var(--nuraly-radius-sm, 4px);
    cursor: pointer;
    color: var(--nuraly-color-text-secondary, #888);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }

  .add-column-btn:hover {
    background: var(--nuraly-color-layer-hover-01, #353535);
    border-color: var(--nuraly-color-border-strong, #6f6f6f);
    color: var(--nuraly-color-text-primary, #f4f4f4);
  }

  /* HTTP Method checkboxes */
  .method-checkboxes {
    display: flex;
    flex-wrap: wrap;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .method-checkbox {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
    padding: var(--nuraly-spacing-1, 4px) var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-layer-01, #f4f4f4);
    border: 1px solid var(--nuraly-color-border-subtle, #e0e0e0);
    border-radius: var(--nuraly-radius-sm, 4px);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .method-checkbox:hover {
    background: var(--nuraly-color-layer-02, #e0e0e0);
  }

  .method-checkbox:has(input:checked) {
    background: var(--nuraly-color-interactive, #0f62fe);
    border-color: var(--nuraly-color-interactive, #0f62fe);
  }

  .method-checkbox:has(input:checked) .method-label {
    color: white;
  }

  .method-checkbox input {
    display: none;
  }

  .method-label {
    font-family: var(--nuraly-font-family-mono, monospace);
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: var(--nuraly-font-weight-medium, 500);
    color: var(--nuraly-color-text-primary, #161616);
  }

  /* File upload checkbox group */
  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    font-size: var(--nuraly-font-size-sm, 12px);
    color: var(--nuraly-color-text-primary, #161616);
    cursor: pointer;
  }

  .checkbox-item:hover {
    color: var(--nuraly-color-interactive, #0f62fe);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    font-size: var(--nuraly-font-size-sm, 12px);
    font-weight: var(--nuraly-font-weight-medium, 500);
    color: var(--nuraly-color-text-primary, #161616);
    cursor: pointer;
  }

  /* Debug node styles */
  .debug-placeholder {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-layer-02, #f4f4f4);
    border: 1px solid var(--nuraly-color-border-subtle, #e0e0e0);
    border-radius: var(--nuraly-radius-md, 6px);
    color: var(--nuraly-color-text-secondary, #525252);
    font-size: var(--nuraly-font-size-sm, 12px);
  }

  .debug-section {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .debug-section-title {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-text-secondary, #525252);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .debug-output {
    margin: 0;
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-layer-01, #f4f4f4);
    border: 1px solid var(--nuraly-color-border-subtle, #e0e0e0);
    border-radius: var(--nuraly-radius-sm, 4px);
    font-family: var(--nuraly-font-family-mono, monospace);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text, #161616);
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 150px;
    overflow-y: auto;
  }

  /* Code editor (Function node) */
  .code-editor {
    width: 100%;
    min-height: 150px;
    padding: var(--nuraly-spacing-3, 12px);
    font-family: var(--nuraly-font-family-mono, monospace);
    font-size: var(--nuraly-font-size-sm, 12px);
    line-height: 1.5;
    background: var(--nuraly-color-field-01, #262626);
    border: 1px solid var(--nuraly-color-border-subtle, #393939);
    border-radius: var(--nuraly-radius-sm, 4px);
    color: var(--nuraly-color-text-primary, #f4f4f4);
    resize: vertical;
    tab-size: 2;
  }

  .code-editor:focus {
    outline: none;
    border-color: var(--nuraly-color-focus, #0f62fe);
  }

  .code-editor::placeholder {
    color: var(--nuraly-color-text-placeholder, #6f6f6f);
  }

  /* Tool parameter styles */
  .tool-param-item {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px);
    background: var(--nuraly-color-layer-01, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--nuraly-color-border-subtle, #393939);
    border-radius: var(--nuraly-radius-sm, 4px);
  }

  .tool-param-fields {
    display: flex;
    flex-direction: row;
    gap: var(--nuraly-spacing-2, 8px);
    align-items: center;
    flex: 1;
  }

  .tool-param-name {
    flex: 1;
    min-width: 80px;
  }

  .tool-param-type {
    flex: 0 0 80px;
    padding: var(--nuraly-spacing-2, 8px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    background: var(--nuraly-color-field-01, #262626);
    border: 1px solid var(--nuraly-color-border-subtle, #393939);
    border-radius: var(--nuraly-radius-sm, 4px);
    color: var(--nuraly-color-text-primary, #f4f4f4);
    cursor: pointer;
  }

  .tool-param-type:focus {
    outline: none;
    border-color: var(--nuraly-color-focus, #0f62fe);
  }

  .tool-param-required {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-1, 4px);
    font-size: var(--nuraly-font-size-xs, 11px);
    color: var(--nuraly-color-text-secondary, #a8a8a8);
    cursor: pointer;
    white-space: nowrap;
  }

  .tool-param-required input {
    accent-color: var(--nuraly-color-interactive, #0f62fe);
  }

  .tool-param-desc {
    flex: 1;
  }

  /* Empty state */
  .empty-state {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: var(--nuraly-color-text-placeholder, #666);
  }

  .empty-state-icon {
    font-size: 48px;
    margin-bottom: var(--nuraly-spacing-4, 16px);
    opacity: 0.5;
  }

  .empty-state-icon nr-icon {
    color: inherit;
  }

  .empty-state-text {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-md, 14px);
    margin-bottom: var(--nuraly-spacing-2, 8px);
  }

  .empty-state-hint {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 12px);
    opacity: 0.7;
  }

  /* ========================================
   * CARBON THEME - Sharp corners
   * ======================================== */

  .canvas-wrapper[data-theme="carbon-light"],
  .canvas-wrapper[data-theme="carbon-dark"],
  .canvas-wrapper[data-theme="carbon"] {
    .canvas-toolbar,
    .zoom-controls,
    .node-palette,
    .context-menu,
    .config-panel {
      border-radius: 0;
    }

    .palette-item,
    .palette-close,
    .toolbar-btn,
    .config-panel-close,
    .config-panel-icon {
      border-radius: 0;
    }
  }

  /* ========================================
   * LIGHT THEME STYLING
   * ======================================== */

  /* Light Theme - target canvas-wrapper with data-theme */
  .canvas-wrapper[data-theme="light"],
  .canvas-wrapper[data-theme="carbon-light"],
  .canvas-wrapper[data-theme="default-light"] {
    background: var(--nuraly-color-layer-01, #f4f4f4);

    .canvas-grid {
      background-image:
        linear-gradient(var(--nuraly-color-border-subtle, rgba(0, 0, 0, 0.1)) 1px, transparent 1px),
        linear-gradient(90deg, var(--nuraly-color-border-subtle, rgba(0, 0, 0, 0.1)) 1px, transparent 1px);
    }

    .edge-path {
      stroke: var(--nuraly-color-border-strong, #8d8d8d);
    }

    .edge-path:hover {
      stroke: var(--nuraly-color-border-interactive, #6f6f6f);
    }

    .edge-arrow {
      fill: var(--nuraly-color-border-strong, #8d8d8d);
    }
  }

  .canvas-wrapper[data-theme="light"] .edge-path,
  .canvas-wrapper[data-theme="carbon-light"] .edge-path,
  .canvas-wrapper[data-theme="default-light"] .edge-path,
  .canvas-wrapper[data-theme="default"] .edge-path {
    stroke: var(--nuraly-color-border-strong, #8d8d8d);
  }

  .canvas-wrapper[data-theme="light"] .edge-path:hover,
  .canvas-wrapper[data-theme="carbon-light"] .edge-path:hover,
  .canvas-wrapper[data-theme="default-light"] .edge-path:hover,
  .canvas-wrapper[data-theme="default"] .edge-path:hover {
    stroke: var(--nuraly-color-border-interactive, #6f6f6f);
  }

  .canvas-wrapper[data-theme="light"] .edge-arrow,
  .canvas-wrapper[data-theme="carbon-light"] .edge-arrow,
  .canvas-wrapper[data-theme="default-light"] .edge-arrow,
  .canvas-wrapper[data-theme="default"] .edge-arrow {
    fill: var(--nuraly-color-border-strong, #8d8d8d);
  }

  .canvas-wrapper[data-theme="light"] .canvas-toolbar,
  .canvas-wrapper[data-theme="light"] .zoom-controls,
  .canvas-wrapper[data-theme="light"] .node-palette,
  .canvas-wrapper[data-theme="light"] .context-menu,
  .canvas-wrapper[data-theme="light"] .config-panel,
  .canvas-wrapper[data-theme="carbon-light"] .canvas-toolbar,
  .canvas-wrapper[data-theme="carbon-light"] .zoom-controls,
  .canvas-wrapper[data-theme="carbon-light"] .node-palette,
  .canvas-wrapper[data-theme="carbon-light"] .context-menu,
  .canvas-wrapper[data-theme="carbon-light"] .config-panel,
  .canvas-wrapper[data-theme="default-light"] .canvas-toolbar,
  .canvas-wrapper[data-theme="default-light"] .zoom-controls,
  .canvas-wrapper[data-theme="default-light"] .node-palette,
  .canvas-wrapper[data-theme="default-light"] .context-menu,
  .canvas-wrapper[data-theme="default-light"] .config-panel,
  .canvas-wrapper[data-theme="default"] .canvas-toolbar,
  .canvas-wrapper[data-theme="default"] .zoom-controls,
  .canvas-wrapper[data-theme="default"] .node-palette,
  .canvas-wrapper[data-theme="default"] .context-menu,
  .canvas-wrapper[data-theme="default"] .config-panel {
    background: var(--nuraly-color-layer-01, #ffffff);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
  }

  .canvas-wrapper[data-theme="light"] .toolbar-btn:hover,
  .canvas-wrapper[data-theme="carbon-light"] .toolbar-btn:hover,
  .canvas-wrapper[data-theme="default-light"] .toolbar-btn:hover {
    background: var(--nuraly-color-layer-hover-01, rgba(0, 0, 0, 0.05));
    color: var(--nuraly-color-text-primary, #161616);
  }

  .canvas-wrapper[data-theme="light"] .palette-item,
  .canvas-wrapper[data-theme="carbon-light"] .palette-item,
  .canvas-wrapper[data-theme="default-light"] .palette-item {
    background: var(--nuraly-color-layer-02, #e0e0e0);
    border-color: var(--nuraly-color-border-subtle, #c6c6c6);
  }

  .canvas-wrapper[data-theme="light"] .palette-item:hover,
  .canvas-wrapper[data-theme="carbon-light"] .palette-item:hover,
  .canvas-wrapper[data-theme="default-light"] .palette-item:hover {
    background: var(--nuraly-color-layer-hover-02, #d0d0d0);
  }

  .canvas-wrapper[data-theme="light"] .palette-title,
  .canvas-wrapper[data-theme="light"] .category-header,
  .canvas-wrapper[data-theme="light"] .context-menu-item,
  .canvas-wrapper[data-theme="carbon-light"] .palette-title,
  .canvas-wrapper[data-theme="carbon-light"] .category-header,
  .canvas-wrapper[data-theme="carbon-light"] .context-menu-item,
  .canvas-wrapper[data-theme="default-light"] .palette-title,
  .canvas-wrapper[data-theme="default-light"] .category-header,
  .canvas-wrapper[data-theme="default-light"] .context-menu-item {
    color: var(--nuraly-color-text-primary, #161616);
  }

  .canvas-wrapper[data-theme="light"] .toolbar-btn,
  .canvas-wrapper[data-theme="light"] .zoom-value,
  .canvas-wrapper[data-theme="light"] .palette-item-name,
  .canvas-wrapper[data-theme="carbon-light"] .toolbar-btn,
  .canvas-wrapper[data-theme="carbon-light"] .zoom-value,
  .canvas-wrapper[data-theme="carbon-light"] .palette-item-name,
  .canvas-wrapper[data-theme="default-light"] .toolbar-btn,
  .canvas-wrapper[data-theme="default-light"] .zoom-value,
  .canvas-wrapper[data-theme="default-light"] .palette-item-name {
    color: var(--nuraly-color-text-secondary, #525252);
  }

  .canvas-wrapper[data-theme="light"] .empty-state,
  .canvas-wrapper[data-theme="light"] .empty-state-text,
  .canvas-wrapper[data-theme="light"] .empty-state-hint,
  .canvas-wrapper[data-theme="carbon-light"] .empty-state,
  .canvas-wrapper[data-theme="carbon-light"] .empty-state-text,
  .canvas-wrapper[data-theme="carbon-light"] .empty-state-hint,
  .canvas-wrapper[data-theme="default-light"] .empty-state,
  .canvas-wrapper[data-theme="default-light"] .empty-state-text,
  .canvas-wrapper[data-theme="default-light"] .empty-state-hint {
    color: var(--nuraly-color-text-placeholder, #6f6f6f);
  }

  /* ========================================
   * DARK THEME STYLING (Default)
   * ======================================== */

  /* Dark Theme - target canvas-wrapper with data-theme */
  .canvas-wrapper[data-theme="dark"],
  .canvas-wrapper[data-theme="carbon-dark"],
  .canvas-wrapper[data-theme="default-dark"] {
    background: var(--nuraly-color-background, #161616);

    .canvas-grid {
      background-image:
        linear-gradient(var(--nuraly-color-border-subtle, rgba(255, 255, 255, 0.05)) 1px, transparent 1px),
        linear-gradient(90deg, var(--nuraly-color-border-subtle, rgba(255, 255, 255, 0.05)) 1px, transparent 1px);
    }
  }

  .canvas-wrapper[data-theme="dark"] .canvas-toolbar,
  .canvas-wrapper[data-theme="dark"] .zoom-controls,
  .canvas-wrapper[data-theme="dark"] .node-palette,
  .canvas-wrapper[data-theme="dark"] .context-menu,
  .canvas-wrapper[data-theme="dark"] .config-panel,
  .canvas-wrapper[data-theme="carbon-dark"] .canvas-toolbar,
  .canvas-wrapper[data-theme="carbon-dark"] .zoom-controls,
  .canvas-wrapper[data-theme="carbon-dark"] .node-palette,
  .canvas-wrapper[data-theme="carbon-dark"] .context-menu,
  .canvas-wrapper[data-theme="carbon-dark"] .config-panel,
  .canvas-wrapper[data-theme="default-dark"] .canvas-toolbar,
  .canvas-wrapper[data-theme="default-dark"] .zoom-controls,
  .canvas-wrapper[data-theme="default-dark"] .node-palette,
  .canvas-wrapper[data-theme="default-dark"] .context-menu,
  .canvas-wrapper[data-theme="default-dark"] .config-panel {
    background: var(--nuraly-color-layer-01, #262626);
    border-color: var(--nuraly-color-border-subtle, #393939);
  }

  .canvas-wrapper[data-theme="dark"] .toolbar-btn,
  .canvas-wrapper[data-theme="carbon-dark"] .toolbar-btn,
  .canvas-wrapper[data-theme="default-dark"] .toolbar-btn {
    color: var(--nuraly-color-text-secondary, #c6c6c6);
  }

  .canvas-wrapper[data-theme="dark"] .toolbar-btn:hover,
  .canvas-wrapper[data-theme="carbon-dark"] .toolbar-btn:hover,
  .canvas-wrapper[data-theme="default-dark"] .toolbar-btn:hover {
    background: var(--nuraly-color-layer-hover-01, #353535);
    color: var(--nuraly-color-text-primary, #f4f4f4);
  }

  .canvas-wrapper[data-theme="dark"] .palette-item,
  .canvas-wrapper[data-theme="carbon-dark"] .palette-item,
  .canvas-wrapper[data-theme="default-dark"] .palette-item {
    background: var(--nuraly-color-layer-02, #393939);
    border-color: var(--nuraly-color-border-subtle, #525252);
  }

  .canvas-wrapper[data-theme="dark"] .palette-item:hover,
  .canvas-wrapper[data-theme="carbon-dark"] .palette-item:hover,
  .canvas-wrapper[data-theme="default-dark"] .palette-item:hover {
    background: var(--nuraly-color-layer-hover-02, #4c4c4c);
  }

  /* ========================================
   * CHATBOT PREVIEW PANEL
   * ======================================== */

  .chatbot-preview-panel {
    position: absolute;
    width: 340px;
    height: 420px;
    background: var(--nuraly-color-layer-01, #ffffff);
    border: 1px solid var(--nuraly-color-border-subtle, #e0e0e0);
    border-radius: var(--nuraly-border-radius-medium, 8px);
    overflow: hidden;
    z-index: 200;
    display: flex;
    flex-direction: column;
    box-shadow: var(--nuraly-shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.15));
  }

  .chatbot-preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    border-bottom: 1px solid var(--nuraly-color-border-subtle, #e0e0e0);
    background: var(--nuraly-color-layer-02, #f8f8f8);
    flex-shrink: 0;
  }

  .chatbot-preview-title {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-text-primary, #161616);
  }

  .chatbot-preview-title nr-icon {
    color: var(--nuraly-color-interactive, #3b82f6);
  }

  .chatbot-preview-close {
    background: none;
    border: none;
    color: var(--nuraly-color-text-secondary, #888);
    cursor: pointer;
    padding: var(--nuraly-spacing-1, 4px);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--nuraly-border-radius-small, 4px);
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
  }

  .chatbot-preview-close:hover {
    color: var(--nuraly-color-text-primary, #161616);
    background: var(--nuraly-color-layer-hover-01, rgba(0, 0, 0, 0.05));
  }

  .chatbot-preview-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .chatbot-preview-content nr-chatbot {
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0;
    --chatbot-border-radius: 0;
    --chatbot-height: 100%;
    --chatbot-min-height: 100%;
    --nuraly-size-chatbot-min-width: 0;
    --nuraly-size-chatbot-container-min-width: 0;
    --nuraly-size-chatbot-input-min-width: 0;
    --nuraly-size-chatbot-actions-min-width: 0;
    --nuraly-spacing-05: 6px;
    --nuraly-spacing-06: 8px;
    --nuraly-border-radius-md: 8px;
    --nuraly-border-width-chatbot-input: 1px;
    --nuraly-color-chatbot-border: transparent;
  }

  /* Chat preview status indicator */
  .chat-preview-status {
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: var(--nuraly-font-weight-medium, 500);
    padding: 2px 8px;
    border-radius: var(--nuraly-border-radius-small, 4px);
    margin-left: auto;
  }

  .chat-preview-status.connected {
    color: var(--nuraly-color-support-success, #42be65);
    background: rgba(66, 190, 101, 0.15);
  }

  .chat-preview-status.disconnected {
    color: var(--nuraly-color-text-secondary, #888);
    background: rgba(136, 136, 136, 0.15);
  }

  /* Chat preview loading state */
  .chat-preview-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: var(--nuraly-spacing-3, 12px);
    color: var(--nuraly-color-text-secondary, #888);
    font-size: var(--nuraly-font-size-sm, 13px);
  }

  .chat-preview-loading nr-icon {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Light theme for chatbot preview */
  .canvas-wrapper[data-theme="light"] .chatbot-preview-panel,
  .canvas-wrapper[data-theme="carbon-light"] .chatbot-preview-panel,
  .canvas-wrapper[data-theme="default-light"] .chatbot-preview-panel,
  .canvas-wrapper[data-theme="default"] .chatbot-preview-panel {
    background: var(--nuraly-color-layer-01, #ffffff);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
  }

  .canvas-wrapper[data-theme="light"] .chatbot-preview-header,
  .canvas-wrapper[data-theme="carbon-light"] .chatbot-preview-header,
  .canvas-wrapper[data-theme="default-light"] .chatbot-preview-header,
  .canvas-wrapper[data-theme="default"] .chatbot-preview-header {
    background: var(--nuraly-color-layer-02, #f4f4f4);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
  }

  .canvas-wrapper[data-theme="light"] .chatbot-preview-title,
  .canvas-wrapper[data-theme="carbon-light"] .chatbot-preview-title,
  .canvas-wrapper[data-theme="default-light"] .chatbot-preview-title,
  .canvas-wrapper[data-theme="default"] .chatbot-preview-title {
    color: var(--nuraly-color-text-primary, #161616);
  }

  /* Dark theme for chatbot preview */
  .canvas-wrapper[data-theme="dark"] .chatbot-preview-panel,
  .canvas-wrapper[data-theme="carbon-dark"] .chatbot-preview-panel,
  .canvas-wrapper[data-theme="default-dark"] .chatbot-preview-panel {
    background: var(--nuraly-color-layer-01, #262626);
    border-color: var(--nuraly-color-border-subtle, #393939);
  }

  .canvas-wrapper[data-theme="dark"] .chatbot-preview-header,
  .canvas-wrapper[data-theme="carbon-dark"] .chatbot-preview-header,
  .canvas-wrapper[data-theme="default-dark"] .chatbot-preview-header {
    background: var(--nuraly-color-layer-02, #333333);
    border-color: var(--nuraly-color-border-subtle, #393939);
  }

  .canvas-wrapper[data-theme="dark"] .chatbot-preview-title,
  .canvas-wrapper[data-theme="carbon-dark"] .chatbot-preview-title,
  .canvas-wrapper[data-theme="default-dark"] .chatbot-preview-title {
    color: var(--nuraly-color-text-primary, #e5e5e5);
  }

  .canvas-wrapper[data-theme="dark"] .chatbot-preview-close:hover,
  .canvas-wrapper[data-theme="carbon-dark"] .chatbot-preview-close:hover,
  .canvas-wrapper[data-theme="default-dark"] .chatbot-preview-close:hover {
    color: var(--nuraly-color-text-primary, #e5e5e5);
    background: var(--nuraly-color-layer-hover-01, rgba(255, 255, 255, 0.1));
  }

  /* ========================================
   * HTTP PREVIEW PANEL
   * ======================================== */

  .http-preview-panel {
    height: auto;
    max-height: 480px;
  }

  .http-preview-content {
    padding: var(--nuraly-spacing-3, 12px);
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-3, 12px);
    overflow-y: auto;
  }

  .http-preview-url {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-layer-02, rgba(255, 255, 255, 0.03));
    border-radius: var(--nuraly-border-radius-small, 4px);
    font-family: var(--nuraly-font-family-mono, monospace);
    font-size: var(--nuraly-font-size-sm, 13px);
  }

  .http-method {
    color: var(--nuraly-color-support-success, #42be65);
    font-weight: var(--nuraly-font-weight-semibold, 600);
  }

  .http-path {
    color: var(--nuraly-color-text-secondary, #888);
  }

  .http-preview-section {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-2, 8px);
  }

  .http-preview-section label {
    font-size: var(--nuraly-font-size-xs, 11px);
    font-weight: var(--nuraly-font-weight-medium, 500);
    color: var(--nuraly-color-text-secondary, #888);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .http-request-body {
    min-height: 120px;
    padding: var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-layer-02, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-small, 4px);
    color: var(--nuraly-color-text-primary, #e5e5e5);
    font-family: var(--nuraly-font-family-mono, monospace);
    font-size: var(--nuraly-font-size-sm, 13px);
    resize: vertical;
    outline: none;
    transition: border-color var(--nuraly-transition-fast, 0.15s) ease;
  }

  .http-request-body:focus {
    border-color: var(--nuraly-color-interactive, #3b82f6);
  }

  .http-request-body:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .http-preview-actions {
    display: flex;
    justify-content: flex-end;
  }

  .http-send-btn {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-2, 8px) var(--nuraly-spacing-4, 16px);
    background: var(--nuraly-color-interactive, #3b82f6);
    color: white;
    border: none;
    border-radius: var(--nuraly-border-radius-small, 4px);
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: var(--nuraly-font-weight-medium, 500);
    cursor: pointer;
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
  }

  .http-send-btn:hover:not(:disabled) {
    background: var(--nuraly-color-interactive-hover, #2563eb);
  }

  .http-send-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .http-send-btn nr-icon {
    animation: none;
  }

  .http-send-btn:disabled nr-icon {
    animation: spin 1s linear infinite;
  }

  .http-preview-error {
    display: flex;
    align-items: flex-start;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-3, 12px);
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: var(--nuraly-border-radius-small, 4px);
    color: var(--nuraly-color-support-error, #fa4d56);
    font-size: var(--nuraly-font-size-sm, 13px);
  }

  .http-preview-error nr-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .http-response-body {
    margin: 0;
    padding: var(--nuraly-spacing-3, 12px);
    background: var(--nuraly-color-layer-02, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-small, 4px);
    color: var(--nuraly-color-text-primary, #e5e5e5);
    font-family: var(--nuraly-font-family-mono, monospace);
    font-size: var(--nuraly-font-size-sm, 13px);
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 200px;
    overflow-y: auto;
  }

  /* Light theme for HTTP preview */
  .canvas-wrapper[data-theme="light"] .http-request-body,
  .canvas-wrapper[data-theme="carbon-light"] .http-request-body,
  .canvas-wrapper[data-theme="default-light"] .http-request-body,
  .canvas-wrapper[data-theme="default"] .http-request-body {
    background: var(--nuraly-color-layer-02, #f4f4f4);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
    color: var(--nuraly-color-text-primary, #161616);
  }

  .canvas-wrapper[data-theme="light"] .http-response-body,
  .canvas-wrapper[data-theme="carbon-light"] .http-response-body,
  .canvas-wrapper[data-theme="default-light"] .http-response-body,
  .canvas-wrapper[data-theme="default"] .http-response-body {
    background: var(--nuraly-color-layer-02, #f4f4f4);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
    color: var(--nuraly-color-text-primary, #161616);
  }

  .canvas-wrapper[data-theme="light"] .http-preview-url,
  .canvas-wrapper[data-theme="carbon-light"] .http-preview-url,
  .canvas-wrapper[data-theme="default-light"] .http-preview-url,
  .canvas-wrapper[data-theme="default"] .http-preview-url {
    background: var(--nuraly-color-layer-02, #f4f4f4);
  }

  /* Disabled overlay styles */
  .disabled-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 200;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    transition: background var(--nuraly-transition-fast, 0.15s) ease;
  }

  .disabled-overlay.hovering {
    background: rgba(0, 0, 0, 0.4);
  }

  .disabled-overlay-message {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-2, 8px);
    padding: var(--nuraly-spacing-3, 12px) var(--nuraly-spacing-4, 16px);
    background: var(--nuraly-color-layer-02, rgba(0, 0, 0, 0.9));
    border: 1px solid var(--nuraly-color-border-subtle, #3a3a3a);
    border-radius: var(--nuraly-border-radius-medium, 8px);
    color: var(--nuraly-color-text-primary, #e5e5e5);
    font-size: var(--nuraly-font-size-sm, 13px);
    font-weight: 500;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity var(--nuraly-transition-fast, 0.15s) ease,
                transform var(--nuraly-transition-fast, 0.15s) ease;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .disabled-overlay.hovering .disabled-overlay-message {
    opacity: 1;
    transform: translateY(0);
  }

  .disabled-overlay-message nr-icon {
    color: var(--nuraly-color-interactive, #3b82f6);
  }

  /* Light theme for disabled overlay */
  .canvas-wrapper[data-theme="light"] .disabled-overlay.hovering,
  .canvas-wrapper[data-theme="carbon-light"] .disabled-overlay.hovering,
  .canvas-wrapper[data-theme="default-light"] .disabled-overlay.hovering,
  .canvas-wrapper[data-theme="default"] .disabled-overlay.hovering {
    background: rgba(255, 255, 255, 0.5);
  }

  .canvas-wrapper[data-theme="light"] .disabled-overlay-message,
  .canvas-wrapper[data-theme="carbon-light"] .disabled-overlay-message,
  .canvas-wrapper[data-theme="default-light"] .disabled-overlay-message,
  .canvas-wrapper[data-theme="default"] .disabled-overlay-message {
    background: var(--nuraly-color-layer-02, #ffffff);
    border-color: var(--nuraly-color-border-subtle, #e0e0e0);
    color: var(--nuraly-color-text-primary, #161616);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const styles = workflowCanvasStyles;
