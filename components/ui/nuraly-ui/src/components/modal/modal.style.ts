import { css } from 'lit';

/**
 * Modal component styles for the Hybrid UI Library
 * Using shared CSS variables from /src/shared/themes/
 * 
 * This file contains all the styling for the nr-modal component with
 * clean CSS variable usage and proper theme switching support.
 */
export const styles = css`
  :host {
    display: contents;
    font-family: var(--nuraly-font-family);
    
    /* Force CSS custom property inheritance to ensure theme switching works properly */
    color: var(--nuraly-color-text);
    background-color: var(--nuraly-color-background);
    
    /* Ensure theme variables are properly inherited */
    --modal-border-radius: var(--nuraly-border-radius-modal, 8px);
    
    /* Ensure clean state transitions when theme changes */
    * {
      transition: all var(--nuraly-transition-fast, 0.15s) ease;
    }
  }

  /* Force re-evaluation of theme-dependent properties on theme change */
  :host([data-theme]) {
    color: inherit;
    background-color: inherit;
  }

  /* Modal backdrop */
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--nuraly-color-modal-backdrop, rgba(0, 0, 0, 0.45));
    z-index: var(--nuraly-z-modal-backdrop, 1000);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--nuraly-spacing-modal-padding, var(--nuraly-spacing-05, 1rem));
    backdrop-filter: var(--nuraly-modal-backdrop-filter, none);
    
    &.modal-backdrop--hidden {
      display: none;
    }
    
    &.modal-backdrop--position-top {
      align-items: flex-start;
      padding-top: var(--nuraly-spacing-modal-top, var(--nuraly-spacing-07, 2rem));
    }
    
    &.modal-backdrop--position-bottom {
      align-items: flex-end;
      padding-bottom: var(--nuraly-spacing-modal-bottom, var(--nuraly-spacing-07, 2rem));
    }
  }

  /* Nested modals support */
  .modal-backdrop {
    /* Ensure each modal backdrop has its own stacking context */
    z-index: var(--nuraly-z-modal-backdrop, 1000);
  }

  /* Nested modal backdrop styling */
  .modal-backdrop + .modal-backdrop {
    /* Subsequent modals get slightly darker backdrop */
    background-color: var(--nuraly-color-modal-backdrop-nested, rgba(0, 0, 0, 0.6));
  }

  /* Nested modal animation delay to avoid conflicts */
  .modal-backdrop:not(:first-of-type) {
    animation-delay: 0.1s;
  }

  /* Modal container */
  .modal {
    position: relative;
    background-color: var(--nuraly-color-modal-background, var(--nuraly-color-background, #ffffff));
    border-radius: var(--modal-border-radius);
    box-shadow: var(--nuraly-shadow-modal, 
      0 6px 16px 0 rgba(0, 0, 0, 0.08), 
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    );
    border: var(--nuraly-border-modal, 1px solid var(--nuraly-color-border, #e0e0e0));
    max-height: calc(100vh - var(--nuraly-spacing-modal-margin, var(--nuraly-spacing-07, 2rem)) * 2);
    max-width: calc(100vw - var(--nuraly-spacing-modal-margin, var(--nuraly-spacing-07, 2rem)) * 2);
    display: flex;
    flex-direction: column;
    outline: none;
    
    &:focus {
      outline: var(--nuraly-focus-outline, 2px solid var(--nuraly-color-primary, #0f62fe));
      outline-offset: var(--nuraly-focus-outline-offset, 1px);
    }
  }


  /* Modal sizes */
  .modal--size-small {
    width: var(--nuraly-modal-width-small, 400px);
    min-height: var(--nuraly-modal-min-height-small, 200px);
  }

  .modal--size-medium {
    width: var(--nuraly-modal-width-medium, 600px);
    min-height: var(--nuraly-modal-min-height-medium, 300px);
  }

  .modal--size-large {
    width: var(--nuraly-modal-width-large, 800px);
    min-height: var(--nuraly-modal-min-height-large, 400px);
  }

  .modal--size-xl {
    width: var(--nuraly-modal-width-xl, 1000px);
    min-height: var(--nuraly-modal-min-height-xl, 500px);
  }

  .modal--fullscreen {
    width: 100vw;
    height: 100vh;
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }

  /* Modal header */
  .modal-header {
    padding: var(--nuraly-spacing-modal-header, var(--nuraly-spacing-05, 1rem) var(--nuraly-spacing-06, 1.5rem));
    border-bottom: var(--nuraly-border-modal-header, 1px solid var(--nuraly-color-border, #e0e0e0));
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--nuraly-modal-header-height);
    flex-shrink: 0;
    
    &.modal-header--draggable {
      cursor: move;
      user-select: none;
    }
  }

  .modal-header-content {
    display: flex;
    align-items: center;
    gap: var(--nuraly-spacing-03, 0.5rem);
    flex: 1;
    min-width: 0;
  }

  .modal-header-icon {
    flex-shrink: 0;
    width: var(--nuraly-modal-header-icon-size, 20px);
    height: var(--nuraly-modal-header-icon-size, 20px);
    color: var(--nuraly-color-modal-header-icon, var(--nuraly-color-text-secondary, #525252));
  }

  .modal-title {
    font-size: var(--nuraly-font-size-modal-title, var(--nuraly-font-size-04, 1.125rem));
    font-weight: var(--nuraly-font-weight-modal-title, var(--nuraly-font-weight-medium, 500));
    color: var(--nuraly-color-modal-title, var(--nuraly-color-text, #161616));
    margin: 0;
    line-height: var(--nuraly-line-height-02, 1.375);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .modal-close-button {
    flex-shrink: 0;
    width: var(--nuraly-modal-close-size, 32px);
    height: var(--nuraly-modal-close-size, 32px);
    border: none;
    background: transparent;
    border-radius: var(--nuraly-border-radius-sm, 4px);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--nuraly-color-modal-close-icon, var(--nuraly-color-text-secondary, #525252));
    transition: all var(--nuraly-transition-fast, 0.15s) ease;
    
    &:hover {
      background-color: var(--nuraly-color-modal-close-hover, var(--nuraly-color-background-hover, #f4f4f4));
      color: var(--nuraly-color-modal-close-icon-hover, var(--nuraly-color-text, #161616));
    }
    
    &:focus {
      outline: var(--nuraly-focus-outline, 2px solid var(--nuraly-color-primary, #0f62fe));
      outline-offset: var(--nuraly-focus-outline-offset, 1px);
    }
    
    &:active {
      background-color: var(--nuraly-color-modal-close-active, var(--nuraly-color-background-active, #c6c6c6));
    }
  }

  .modal-close-icon {
    width: var(--nuraly-modal-close-icon-size, 16px);
    height: var(--nuraly-modal-close-icon-size, 16px);
  }

  /* Carbon theme specific - sharp corners for close button */
  :host([data-theme="carbon"]) .modal-close-button,
  :host([data-theme="carbon-light"]) .modal-close-button,
  :host([data-theme="carbon-dark"]) .modal-close-button {
    border-radius: 0;
  }

  /* Modal body */
  .modal-body {
    flex: 1;
    padding: var(--nuraly-spacing-modal-body, var(--nuraly-spacing-05, 1rem) var(--nuraly-spacing-06, 1.5rem));
    overflow-y: auto;
    color: var(--nuraly-color-modal-body-text, var(--nuraly-color-text, #161616));
    line-height: var(--nuraly-line-height-03, 1.5);
  }

  /* Modal footer */
  .modal-footer {
    padding: var(--nuraly-spacing-modal-footer, var(--nuraly-spacing-03, 0.5rem) var(--nuraly-spacing-05, 1rem));
    border-top: var(--nuraly-border-modal-footer, 1px solid var(--nuraly-color-border, #e0e0e0));
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--nuraly-spacing-03, 0.5rem);
    min-height: var(--nuraly-modal-footer-height, 48px);
    flex-shrink: 0;
  }

  /* Animation keyframes */
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes modalZoomIn {
    from {
      opacity: 0;
      transform: scale(0.7);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes modalSlideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes modalSlideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes backdropFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Animation classes */
  .modal-backdrop--animation-fade {
    animation: backdropFadeIn var(--nuraly-transition-modal, 0.3s) ease;
  }

  .modal--animation-fade {
    animation: modalFadeIn var(--nuraly-transition-modal, 0.3s) ease;
  }

  .modal--animation-zoom {
    animation: modalZoomIn var(--nuraly-transition-modal, 0.3s) ease;
  }

  .modal--animation-slide-up {
    animation: modalSlideUp var(--nuraly-transition-modal, 0.3s) ease;
  }

  .modal--animation-slide-down {
    animation: modalSlideDown var(--nuraly-transition-modal, 0.3s) ease;
  }

  /* Dragging state */
  .modal--dragging {
    user-select: none;
    cursor: move;
  }

  /* Resizing handles (when resizable) */
  .modal--resizable {
    resize: both;
    overflow: auto;
  }

  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: se-resize;
    background: linear-gradient(
      -45deg,
      transparent 40%,
      var(--nuraly-color-border, #e0e0e0) 40%,
      var(--nuraly-color-border, #e0e0e0) 60%,
      transparent 60%
    );
  }

  /* Responsive behavior */
  @media (max-width: 768px) {
    .modal-backdrop {
      padding: var(--nuraly-spacing-02, 0.25rem);
    }
    
    .modal--size-small,
    .modal--size-medium,
    .modal--size-large,
    .modal--size-xl {
      width: 100%;
      max-width: none;
    }
    
    .modal-header,
    .modal-body,
    .modal-footer {
      padding-left: var(--nuraly-spacing-04, 0.75rem);
      padding-right: var(--nuraly-spacing-04, 0.75rem);
    }
  }

  /* Dark theme support through CSS custom properties */
  @media (prefers-color-scheme: dark) {
    :host(:not([data-theme])) {
      --nuraly-color-modal-backdrop: rgba(0, 0, 0, 0.6);
    }
  }
`;