/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */

import { css } from 'lit';

export const styles = css`
  :host {
    /* ========================================
     * CSS CUSTOM PROPERTIES - PANEL
     * ======================================== */
    
    /* Colors */
    --nuraly-panel-background: var(--nuraly-color-surface, #ffffff);
    --nuraly-panel-border-color: var(--nuraly-color-border, #e0e0e0);
    --nuraly-panel-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    --nuraly-panel-header-background: var(--nuraly-color-surface-variant, #f5f5f5);
    --nuraly-panel-header-text-color: var(--nuraly-color-text-primary, #1a1a1a);
    --nuraly-panel-header-border-color: var(--nuraly-color-border, #e0e0e0);
    --nuraly-panel-header-border-width: 1px;
    --nuraly-panel-header-border-style: solid;
    
    /* Spacing */
    --nuraly-panel-padding: var(--nuraly-spacing-04, 1rem);
    --nuraly-panel-header-padding: var(--nuraly-spacing-03, 0.75rem) var(--nuraly-spacing-04, 1rem);
    
    /* Border Radius */
    --nuraly-panel-border-radius: var(--nuraly-border-radius-medium, 8px);
    
    /* Typography */
    --nuraly-panel-font-family: var(--nuraly-font-family, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif);
    --nuraly-panel-header-font-size: var(--nuraly-font-size-lg, 1.125rem);
    --nuraly-panel-header-font-weight: var(--nuraly-font-weight-semibold, 400);
    
    /* Transitions */
    --nuraly-panel-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    /* Sizes */
    --nuraly-panel-small-width: 320px;
    --nuraly-panel-medium-width: 480px;
    --nuraly-panel-large-width: 640px;
    --nuraly-panel-small-height: 400px;
    --nuraly-panel-medium-height: 600px;
    --nuraly-panel-large-height: 800px;
    
    /* Z-index */
    --nuraly-panel-z-index: 100;
    --nuraly-panel-window-z-index: 200;
    
    display: block;
    font-family: var(--nuraly-panel-font-family);
  }

  /* ========================================
   * PANEL CONTAINER
   * ======================================== */

  .panel {
    position: relative;
    background: var(--nuraly-panel-background);
    border: 1px solid var(--nuraly-panel-border-color);
    border-radius: var(--nuraly-panel-border-radius);
    box-shadow: var(--nuraly-panel-shadow);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Smooth transitions - only applied when animated attribute is true */
  .panel--animated {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), 
                opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                right 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Disable transitions when dragging for immediate feedback */
  .panel--dragging {
    transition: none !important;
  }

  /* ========================================
   * PANEL MODES
   * ======================================== */

  /* Panel Mode - Docked to edges */
  .panel--mode-panel {
    position: fixed;
    z-index: var(--nuraly-panel-z-index);
  }

  .panel--mode-panel.panel--position-left {
    left: 0;
    top: 0;
    bottom: 0;
    height: 100vh;
    border-radius: 0 var(--nuraly-panel-border-radius) var(--nuraly-panel-border-radius) 0;
  }

  .panel--mode-panel.panel--position-right {
    right: 0;
    top: 0;
    bottom: 0;
    height: 100vh;
    border-radius: var(--nuraly-panel-border-radius) 0 0 var(--nuraly-panel-border-radius);
  }

  .panel--mode-panel.panel--position-top {
    left: 0;
    right: 0;
    top: 0;
    width: 100%;
    border-radius: 0 0 var(--nuraly-panel-border-radius) var(--nuraly-panel-border-radius);
  }

  .panel--mode-panel.panel--position-bottom {
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    border-radius: var(--nuraly-panel-border-radius) var(--nuraly-panel-border-radius) 0 0;
  }

  /* Window Mode - Floating, draggable */
  .panel--mode-window {
    position: fixed;
    z-index: var(--nuraly-panel-window-z-index);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .panel--mode-window.panel--dragging {
    user-select: none;
    transition: none;
  }

  /* Minimized Mode */
  .panel--mode-minimized {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 280px;
    height: 56px;
    z-index: var(--nuraly-panel-window-z-index);
    cursor: pointer;
    top: auto !important;
    left: auto !important;
    transform: none !important;
  }

  .panel--mode-minimized .panel-body,
  .panel--mode-minimized .panel-footer {
    display: none;
  }

  /* Embedded Mode */
  .panel--mode-embedded {
    position: relative;
    width: 100% !important;  /* Override size-specific widths */
    height: 100% !important; /* Override size-specific heights */
  }

  /* Special handling for tabs in embedded panels */
  .panel--mode-embedded nr-tabs {
    height: 100%;
    min-height: 0;
  }

  /* Override all size classes when in embedded mode */
  .panel--mode-embedded.panel--size-small,
  .panel--mode-embedded.panel--size-medium,
  .panel--mode-embedded.panel--size-large {
    width: 100% !important;
    height: auto !important;
  }

  .panel--mode-embedded .resize-handle {
    display: none;
  }

  /* ========================================
   * PANEL SIZES
   * ======================================== */

  .panel--size-small {
    width: var(--nuraly-panel-small-width);
    height: var(--nuraly-panel-small-height);
    
    --nuraly-panel-border-radius: var(--nuraly-border-radius-small, 4px);
  }

  .panel--size-medium {
    width: var(--nuraly-panel-medium-width);
    height: var(--nuraly-panel-medium-height);
    
    --nuraly-panel-action-button-border-radius: var(--nuraly-border-radius-medium, 4px);
  }

  .panel--size-large {
    width: var(--nuraly-panel-large-width);
    height: var(--nuraly-panel-large-height);
    
    --nuraly-panel-action-button-border-radius: var(--nuraly-border-radius-large, 6px);
  }

  /* ========================================
   * PANEL HEADER
   * ======================================== */

  .panel-header {
    padding: var(--nuraly-panel-header-padding);
    background: var(--nuraly-panel-header-background);
    border-bottom: var(--nuraly-panel-header-border-width) var(--nuraly-panel-header-border-style) var(--nuraly-panel-header-border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--nuraly-spacing-03, 0.75rem);
    flex-shrink: 0;
  }

  .panel-header--draggable {
    cursor: move;
    user-select: none;
  }

  .panel-header-content {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-02, 0.5rem);
    flex: 1;
    min-width: 0;
  }

  .panel-header-icon {
    flex-shrink: 0;
    --nuraly-icon-size: 20px;
  }

  .panel-title {
    font-size: var(--nuraly-panel-header-font-size);
    font-weight: var(--nuraly-panel-header-font-weight);
    color: var(--nuraly-panel-header-text-color);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Size-specific header styles */
  .panel--size-small .panel-title {
    font-size: 0.875rem;
  }

  .panel--size-small .panel-header-icon {
    --nuraly-icon-size: 16px;
  }

  .panel--size-small .panel-action-button {
    padding: 0.125rem;
  }

  .panel--size-small {
    --nuraly-label-font-weight: 400;
  }

  .panel--size-medium .panel-title {
    font-size: 1rem;
  }

  .panel--size-medium .panel-header-icon {
    --nuraly-icon-size: 18px;
  }

  .panel--size-large .panel-title {
    font-size: 1.25rem;
  }

  .panel--size-large .panel-header-icon {
    --nuraly-icon-size: 24px;
  }

  .panel--size-large .panel-action-button {
    padding: 0.375rem;
  }

  .panel-actions {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-02, 0.5rem);
  }

  .panel-action-button {
    background: transparent;
    border: none;
    padding: var(--nuraly-spacing-01, 0.25rem);
    cursor: pointer;
    border-radius: var(--nuraly-panel-action-button-border-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    color: var(--nuraly-color-text-secondary, #666);
  }

  .panel-action-button:hover {
    background: var(--nuraly-color-surface-hover, rgba(0, 0, 0, 0.05));
  }

  .panel-action-button:active {
    background: var(--nuraly-color-surface-active, rgba(0, 0, 0, 0.1));
  }

  .panel-action-button nr-icon {
    --nuraly-icon-size: 16px;
  }

  /* ========================================
   * PANEL BODY
   * ======================================== */

  .panel-body {
    padding: var(--nuraly-panel-padding);
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  /* Size-specific body and header padding */
  .panel--size-small .panel-header {
    padding: var(--nuraly-panel-header-padding-small, 0.5rem 0.75rem);
  }

  .panel--size-small .panel-body {
    padding: var(--nuraly-panel-body-padding-small, 0.75rem);
  }

  .panel--size-medium .panel-header {
    padding: var(--nuraly-panel-header-padding-medium, 0.625rem 1rem);
  }

  .panel--size-medium .panel-body {
    padding: var(--nuraly-panel-body-padding-medium, 1rem);
  }

  .panel--size-large .panel-header {
    padding: var(--nuraly-panel-header-padding-large, 0.875rem 1.25rem);
  }

  .panel--size-large .panel-body {
    padding: var(--nuraly-panel-body-padding-large, 1.5rem);
  }

  /* ========================================
   * PANEL FOOTER
   * ======================================== */

  .panel-footer {
    padding: var(--nuraly-panel-footer-padding, var(--nuraly-panel-padding));
    border-top: var(--nuraly-panel-footer-border-width, 1px) var(--nuraly-panel-footer-border-style, solid) var(--nuraly-panel-footer-border-color, var(--nuraly-panel-border-color));
    background: var(--nuraly-panel-footer-background, var(--nuraly-panel-header-background));
    flex-shrink: 0;
  }

  /* ========================================
   * RESIZE HANDLES
   * ======================================== */

  .resize-handle {
    position: absolute;
    background: transparent;
    z-index: 10;
  }

  .resize-handle-n {
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    cursor: ns-resize;
  }

  .resize-handle-s {
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    cursor: ns-resize;
  }

  .resize-handle-e {
    right: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: ew-resize;
  }

  .resize-handle-w {
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    cursor: ew-resize;
  }

  .resize-handle-ne {
    top: 0;
    right: 0;
    width: 8px;
    height: 8px;
    cursor: nesw-resize;
  }

  .resize-handle-nw {
    top: 0;
    left: 0;
    width: 8px;
    height: 8px;
    cursor: nwse-resize;
  }

  .resize-handle-se {
    bottom: 0;
    right: 0;
    width: 8px;
    height: 8px;
    cursor: nwse-resize;
  }

  .resize-handle-sw {
    bottom: 0;
    left: 0;
    width: 8px;
    height: 8px;
    cursor: nesw-resize;
  }

  /* Visual indicator for resize corner */
  .resize-handle-se::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 12px;
    height: 12px;
    background: linear-gradient(
      -45deg,
      transparent 40%,
      var(--nuraly-panel-border-color) 40%,
      var(--nuraly-panel-border-color) 50%,
      transparent 50%,
      transparent 60%,
      var(--nuraly-panel-border-color) 60%,
      var(--nuraly-panel-border-color) 70%,
      transparent 70%
    );
  }

  /* ========================================
   * COLLAPSED STATE
   * ======================================== */

  .panel--collapsed .panel-body,
  .panel--collapsed .panel-footer {
    display: none;
  }

  .panel--collapsed {
    height: auto !important;
  }

  /* ========================================
   * DARK MODE SUPPORT
   * ======================================== */

  :host([data-theme="dark"]) {
    --nuraly-panel-background: var(--nuraly-color-surface-dark, #1a1a1a);
    --nuraly-panel-border-color: var(--nuraly-color-border-dark, #333);
    --nuraly-panel-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    --nuraly-panel-header-background: var(--nuraly-color-surface-variant-dark, #252525);
    --nuraly-panel-header-text-color: var(--nuraly-color-text-primary-dark, #e0e0e0);
    --nuraly-panel-header-border-color: var(--nuraly-color-border-dark, #333);
  }

  /* ========================================
   * ANIMATIONS
   * ======================================== */

  /* Transitions are controlled by the .panel--animated class above */
  /* No additional animation rules needed */
`;
