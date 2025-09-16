import { css } from 'lit';

/**
 * Textarea component styles for the Hybrid UI Library
 * 
 * This file contains al  .textarea-element::placeholder {
    color: var(--nuraly-color-textarea-placeholder, #8c8c8c);
  }

  .textarea-element:hover {
    border-color: var(--nuraly-color-textarea-border-hover, #7c3aed);
    border-bottom-color: var(--nuraly-color-textarea-border-hover, #7c3aed);
  }

  .textarea-element:focus {
    border-color: var(--nuraly-color-textarea-border-focus, #7c3aed);
    border-bottom-color: var(--nuraly-color-textarea-border-focus, #7c3aed);
    box-shadow: 0 0 0 1px var(--nuraly-color-textarea-border-focus, #7c3aed); for the nr-textarea component, including:
 * - Base textarea styles with CSS custom properties for theming
 * - Multiple textarea states (default, warning, error)
 * - Size variations (small, medium, large)
 * - Resize behaviors (none, vertical, horizontal, both)
 * - Icon positioning and styling with comprehensive CSS variable overrides
 * - Focus, disabled, and validation states
 * - Auto-resize functionality
 * - Dark theme support
 * 
 * Icon Color Customization:
 * The textarea component provides multiple levels of CSS variable overrides for icon colors:
 * 
 * Global Level:
 * - --nuraly-color-textarea-icon: Controls all icons in textarea components
 * - --nuraly-size-textarea-icon: Controls size of all icons in textarea components
 * - --nuraly-color-textarea-icon-hover: Hover state for all icons
 * - --nuraly-color-textarea-icon-active: Active state for all icons
 * - --nuraly-color-textarea-icon-disabled: Disabled state for all icons
 * 
 * Specific Icon Types:
 * - --nuraly-color-textarea-warning-icon: Warning state icons
 * - --nuraly-color-textarea-error-icon: Error state icons
 * - --nuraly-color-textarea-clear-icon: Clear functionality icons
 * - --nuraly-color-textarea-validation-icon: Validation status icons
 * 
 * Usage Examples:
 * ```css
 * :root {
 *   --nuraly-color-textarea-icon: #0066cc;
 *   --nuraly-color-textarea-error-icon: #cc0000;
 *   --nuraly-size-textarea-icon: 20px;
 * }
 * 
 * .custom-textarea {
 *   --nuraly-color-textarea-icon: #purple;
 * }
 * ```
 * 
 * The styling system uses CSS custom properties with fallbacks to allow
 * for both global and local customization of textarea appearance.
 */

export const styles = css`
  :host {
    display: block;
    position: relative;
    font-family: var(--nuraly-font-family-textarea, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif);
  }

  .textarea-container {
    display: flex;
    flex-direction: column;
    gap: var(--nuraly-spacing-textarea-gap, 8px);
    width: 100%;
  }

  .textarea-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--nuraly-font-size-textarea, 16px);
    font-weight: 500;
    color: var(--nuraly-color-textarea-label, #262626);
    line-height: var(--nuraly-line-height-textarea, 1.5);
  }

  .required-indicator {
    color: var(--nuraly-color-textarea-error, #ef4444);
    font-weight: 600;
  }

  .textarea-wrapper {
    display: flex;
    align-items: flex-start;
    gap: var(--nuraly-spacing-textarea-gap, 8px);
    position: relative;
  }

  .addon-before,
  .addon-after {
    display: flex;
    align-items: flex-start;
    padding-top: var(--nuraly-padding-textarea, 12px);
  }

  .textarea-input-container {
    position: relative;
    flex: 1;
    display: flex;
    align-items: flex-start;
  }

  .textarea-element {
    width: 100%;
    min-height: 80px;
    padding: var(--nuraly-padding-textarea, 12px);
    border-top: var(--nuraly-border-width-textarea, 1px) solid var(--nuraly-color-textarea-border, #d9d9d9);
    border-left: var(--nuraly-border-width-textarea, 1px) solid var(--nuraly-color-textarea-border, #d9d9d9);
    border-right: var(--nuraly-border-width-textarea, 1px) solid var(--nuraly-color-textarea-border, #d9d9d9);
    border-bottom: var(--nuraly-border-width-textarea, 1px) solid var(--nuraly-color-textarea-border-bottom, var(--nuraly-color-textarea-border, #d9d9d9));
    border-radius: var(--nuraly-border-radius-textarea, 6px);
    background-color: var(--nuraly-color-textarea-background, #ffffff);
    color: var(--nuraly-color-textarea-text, #262626);
    font-family: var(--nuraly-font-family-textarea, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif);
    font-size: var(--nuraly-font-size-textarea, 16px);
    line-height: var(--nuraly-line-height-textarea, 1.5);
    outline: none;
    transition: border-color 0.2s ease-in-out;
    box-sizing: border-box;
  }

  .textarea-element::placeholder {
    color: var(--nuraly-color-textarea-placeholder, #8c8c8c);
  }

  .textarea-element:hover:not(:disabled):not(:focus) {
    border-top-color: var(--nuraly-color-textarea-border-hover, #7c3aed);
    border-left-color: var(--nuraly-color-textarea-border-hover, #7c3aed);
    border-right-color: var(--nuraly-color-textarea-border-hover, #7c3aed);
    border-bottom-color: var(--nuraly-color-textarea-border-hover, #7c3aed);
  }

  .textarea-element:focus {
    border-top-color: var(--nuraly-color-textarea-border-focus, #7c3aed);
    border-left-color: var(--nuraly-color-textarea-border-focus, #7c3aed);
    border-right-color: var(--nuraly-color-textarea-border-focus, #7c3aed);
    border-bottom-color: var(--nuraly-color-textarea-border-focus, #7c3aed);
    box-shadow: 0 0 0 1px var(--nuraly-color-textarea-border-focus, #7c3aed);
  }

  .textarea-element:disabled {
    background-color: var(--nuraly-color-surface-disabled, #f5f5f5);
    color: var(--nuraly-color-text-disabled, #8c8c8c);
    border-color: var(--nuraly-color-border-disabled, #d9d9d9);
    cursor: not-allowed;
    resize: none;
  }

  .textarea-element:disabled {
    background-color: var(--nuraly-color-surface-disabled, #f5f5f5);
    color: var(--nuraly-color-text-disabled, #8c8c8c);
    border-color: var(--nuraly-color-border-disabled, #d9d9d9);
    cursor: not-allowed;
    resize: none;
  }

  .textarea-element:read-only {
    background-color: var(--nuraly-color-surface-readonly, #f9f9f9);
    cursor: default;
  }

  /* Size variants */
  .size-small .textarea-element {
    font-size: var(--nuraly-font-size-textarea-small, 14px);
    padding: calc(var(--nuraly-padding-textarea, 12px) * 0.75);
    min-height: 60px;
  }

  .size-large .textarea-element {
    font-size: var(--nuraly-font-size-textarea-large, 18px);
    padding: calc(var(--nuraly-padding-textarea, 12px) * 1.25);
    min-height: 100px;
  }

  /* Variant styles */
  .variant-outlined .textarea-element {
    border: var(--nuraly-border-width-textarea, 1px) solid var(--nuraly-color-textarea-border, #d9d9d9);
    background-color: var(--nuraly-color-textarea-background, #ffffff);
  }

  .variant-filled .textarea-element {
    border: var(--nuraly-border-width-textarea, 1px) solid transparent;
    background-color: var(--nuraly-color-surface-secondary, #f5f5f5);
  }

  .variant-filled .textarea-element:focus {
    background-color: var(--nuraly-color-textarea-background, #ffffff);
    border-color: var(--nuraly-color-textarea-border-focus, #7c3aed);
  }

  .variant-borderless .textarea-element {
    border: none;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
  }

  .variant-underlined .textarea-element {
    border: none;
    border-bottom: var(--nuraly-border-width-textarea, 1px) solid var(--nuraly-color-textarea-border, #d9d9d9);
    border-radius: 0;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
  }

  .variant-underlined .textarea-element:focus {
    border-bottom-color: var(--nuraly-color-textarea-border-focus, #7c3aed);
    box-shadow: none;
  }

  /* State styles */
  .state-error .textarea-element,
  .validation-error .textarea-element {
    border-color: var(--nuraly-color-textarea-error, #ef4444);
  }

  .state-error .textarea-element:focus,
  .validation-error .textarea-element:focus {
    border-color: var(--nuraly-color-textarea-error, #ef4444);
    box-shadow: 0 0 0 1px var(--nuraly-color-textarea-error, #ef4444);
  }

  .state-warning .textarea-element,
  .validation-warning .textarea-element {
    border-color: var(--nuraly-color-textarea-warning, #f59e0b);
  }

  .state-warning .textarea-element:focus,
  .validation-warning .textarea-element:focus {
    border-color: var(--nuraly-color-textarea-warning, #f59e0b);
    box-shadow: 0 0 0 1px var(--nuraly-color-textarea-warning, #f59e0b);
  }

  /* Icons */
  .validation-icon,
  .clear-button {
    position: absolute;
    top: var(--nuraly-padding-textarea, 12px);
    right: var(--nuraly-padding-textarea, 12px);
    z-index: 1;
  }

  .validation-icon {
    color: var(--nuraly-color-textarea-icon, #8c8c8c);
    pointer-events: none;
  }

  .validation-icon.error {
    color: var(--nuraly-color-textarea-error, #ef4444);
  }

  .validation-icon.warning {
    color: var(--nuraly-color-textarea-warning, #f59e0b);
  }

  .validation-icon.success {
    color: var(--nuraly-color-textarea-success, #10b981);
  }

  .clear-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--nuraly-color-textarea-icon, #8c8c8c);
    padding: 2px;
    border-radius: 4px;
    transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
  }

  .clear-button:hover {
    color: var(--nuraly-color-textarea-icon-hover, #7c3aed);
    background-color: var(--nuraly-color-surface-hover, rgba(0, 0, 0, 0.05));
  }

  .clear-button:active {
    color: var(--nuraly-color-textarea-icon-active, #6d28d9);
  }

  /* Adjust textarea padding when icons are present */
  :host([allow-clear]) .textarea-element,
  :host([has-feedback]) .textarea-element {
    padding-right: calc(var(--nuraly-padding-textarea, 12px) + 16px + 8px);
  }

  /* Footer */
  .textarea-footer {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--nuraly-spacing-textarea-gap, 8px);
    min-height: 20px;
  }

  .helper-text {
    flex: 1;
    font-size: var(--nuraly-font-size-textarea-small, 14px);
    line-height: 1.4;
    color: var(--nuraly-color-textarea-helper-text, #666666);
  }

  .validation-message {
    margin-bottom: 4px;
  }

  .validation-message:last-child {
    margin-bottom: 0;
  }

  .validation-message.error {
    color: var(--nuraly-color-textarea-error, #ef4444);
  }

  .validation-message.warning {
    color: var(--nuraly-color-textarea-warning, #f59e0b);
  }

  .validation-message.success {
    color: var(--nuraly-color-textarea-success, #10b981);
  }

  .character-count {
    font-size: var(--nuraly-font-size-textarea-small, 14px);
    color: var(--nuraly-color-textarea-counter, #666666);
    white-space: nowrap;
    line-height: 1.4;
  }

  .character-count.over-limit {
    color: var(--nuraly-color-textarea-counter-over, #ef4444);
    font-weight: 500;
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .textarea-footer {
      flex-direction: column;
      align-items: stretch;
    }
    
    .character-count {
      text-align: right;
    }
  }

  /* Focus-visible for accessibility */
  .textarea-element:focus-visible {
    outline: 2px solid var(--nuraly-color-textarea-border-focus, #7c3aed);
    outline-offset: 2px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .textarea-element {
      border-width: 2px;
    }
    
    .textarea-element:focus {
      box-shadow: 0 0 0 2px var(--nuraly-color-textarea-border-focus, #7c3aed);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .textarea-element,
    .clear-button {
      transition: none;
    }
  }

  /* ========================================
   * THEME SPECIFIC OVERRIDES
   * ======================================== */

  /* No theme-specific overrides - themes handle styling through CSS variables */
`;