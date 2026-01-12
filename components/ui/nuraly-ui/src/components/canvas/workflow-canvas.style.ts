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

  .palette-content {
    overflow-y: auto;
    max-height: calc(100% - 48px);
    overscroll-behavior: contain;
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

  .context-menu-divider {
    height: 1px;
    background: var(--nuraly-color-border-subtle, #3a3a3a);
    margin: var(--nuraly-spacing-1, 4px) 0;
  }

  /* Configuration panel */
  .config-panel {
    position: absolute;
    width: 280px;
    max-height: 400px;
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
  }

  .config-section-title {
    font-family: var(--nuraly-font-family);
    font-size: var(--nuraly-font-size-xs, 10px);
    font-weight: var(--nuraly-font-weight-semibold, 600);
    color: var(--nuraly-color-text-placeholder, #666);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: var(--nuraly-spacing-2, 8px);
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
  .canvas-wrapper[data-theme="default-light"] .config-panel {
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
`;

export const styles = workflowCanvasStyles;
