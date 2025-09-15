import { css } from 'lit';

const checkBoxStyles = css`
  /* ========================================
   * CHECKBOX CSS VARIABLES - FALLBACK VALUES
   * ========================================
   * These fallback values ensure the component works even without theme files
   * They follow Ant Design v5 specifications
   */
  :host {
    /* Base checkbox appearance */
    --nuraly-checkbox-background: var(--nuraly-color-checkbox-background, #ffffff);
    --nuraly-checkbox-text-color: var(--nuraly-color-checkbox-text, rgba(0, 0, 0, 0.88));
    --nuraly-checkbox-label-color: var(--nuraly-color-checkbox-label, rgba(0, 0, 0, 0.88));

    /* Checkbox borders and outline */
    --nuraly-checkbox-border: var(--nuraly-border-width-checkbox, 1px) solid var(--nuraly-color-checkbox-border, #d9d9d9);
    --nuraly-checkbox-border-radius: var(--nuraly-border-radius-checkbox, 2px);
    --nuraly-checkbox-border-focus: var(--nuraly-border-width-checkbox, 1px) solid var(--nuraly-color-checkbox-border-focus, #1890ff);
    --nuraly-checkbox-border-hover: var(--nuraly-border-width-checkbox, 1px) solid var(--nuraly-color-checkbox-border-hover, #40a9ff);

    /* Checked/active states */
    --nuraly-checkbox-checked-background: var(--nuraly-color-checkbox-checked-background, #1890ff);
    --nuraly-checkbox-checked-border: var(--nuraly-color-checkbox-checked-border, #1890ff);
    --nuraly-checkbox-checkmark-color: var(--nuraly-color-checkbox-checkmark, #ffffff);
    --nuraly-checkbox-indeterminate-background: var(--nuraly-color-checkbox-indeterminate-background, #1890ff);
    --nuraly-checkbox-indeterminate-mark-color: var(--nuraly-color-checkbox-indeterminate-mark, #ffffff);

    /* Disabled states */
    --nuraly-checkbox-disabled-background: var(--nuraly-color-checkbox-disabled-background, #f5f5f5);
    --nuraly-checkbox-disabled-border: var(--nuraly-color-checkbox-disabled-border, #d9d9d9);
    --nuraly-checkbox-disabled-text-color: var(--nuraly-color-checkbox-disabled-text, rgba(0, 0, 0, 0.25));
    --nuraly-checkbox-disabled-checkmark-color: var(--nuraly-color-checkbox-disabled-checkmark, rgba(0, 0, 0, 0.25));

    /* Focus states */
    --nuraly-checkbox-focus-outline: var(--nuraly-size-checkbox-focus-outline, 2px) solid var(--nuraly-color-checkbox-focus-outline, rgba(24, 144, 255, 0.2));

    /* Typography */
    --nuraly-checkbox-font-family: var(--nuraly-font-family-checkbox, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif);
    --nuraly-checkbox-font-size: var(--nuraly-font-size-checkbox, 14px);
    --nuraly-checkbox-font-weight: var(--nuraly-font-weight-checkbox, 400);
    --nuraly-checkbox-line-height: var(--nuraly-line-height-checkbox, 1.5715);

    /* Sizing */
    --nuraly-checkbox-size-small: var(--nuraly-size-checkbox-small, 14px);
    --nuraly-checkbox-size-medium: var(--nuraly-size-checkbox-medium, 16px);
    --nuraly-checkbox-size-large: var(--nuraly-size-checkbox-large, 18px);

    /* Spacing */
    --nuraly-checkbox-gap: var(--nuraly-spacing-checkbox-gap, 8px);
    --nuraly-checkbox-padding: var(--nuraly-spacing-checkbox-padding, 4px);

    /* Animation */
    --nuraly-checkbox-transition: var(--nuraly-transition-checkbox, all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1));

    /* ========================================
     * LEGACY COMPATIBILITY VARIABLES
     * ========================================
     * Keep old variable names for backward compatibility
     * These will be deprecated in future versions
     */

    /* Legacy local variables for backward compatibility */
    --nuraly-checkbox-local-filled-background-color: var(--nuraly-checkbox-checked-background);
    --nuraly-checkbox-local-color: var(--nuraly-checkbox-text-color);
    --nuraly-checkbox-local-empty-background-color: var(--nuraly-checkbox-background);
    --nuraly-checkbox-local-disabled-background-color: var(--nuraly-checkbox-disabled-background);
    --nuraly-checkbox-local-disabled-text-color: var(--nuraly-checkbox-disabled-text-color);
    --nuraly-checkbox-local-empty-border: var(--nuraly-checkbox-border);
    --nuraly-checkbox-local-symbol-color: var(--nuraly-checkbox-checkmark-color);
    --nuraly-checkbox-local-focus-border: var(--nuraly-checkbox-border-focus);
    --nuraly-checkbox-local-focus-outline: var(--nuraly-checkbox-focus-outline);
    --nuraly-checkbox-local-font-family: var(--nuraly-checkbox-font-family);
    --nuraly-checkbox-local-border-radius: var(--nuraly-checkbox-border-radius);
    --nuraly-checkbox-local-gap: var(--nuraly-checkbox-gap);

    /* Legacy size variables */
    --nuraly-checkbox-local-medium-width: var(--nuraly-checkbox-size-medium);
    --nuraly-checkbox-local-medium-height: var(--nuraly-checkbox-size-medium);
    --nuraly-checkbox-local-small-width: var(--nuraly-checkbox-size-small);
    --nuraly-checkbox-local-small-height: var(--nuraly-checkbox-size-small);
    --nuraly-checkbox-local-large-width: var(--nuraly-checkbox-size-large);
    --nuraly-checkbox-local-large-height: var(--nuraly-checkbox-size-large);

    /* Legacy checkmark sizing */
    --nuraly-checkbox-local-small-indeterminate-size: calc(var(--nuraly-checkbox-size-small) * 0.7);
    --nuraly-checkbox-local-large-indeterminate-size: calc(var(--nuraly-checkbox-size-large) * 0.7);
    --nuraly-checkbox-local-medium-indeterminate-size: calc(var(--nuraly-checkbox-size-medium) * 0.7);

    --nuraly-checkbox-local-small-checked-width: calc(var(--nuraly-checkbox-size-small) * 0.14);
    --nuraly-checkbox-local-small-checked-height: calc(var(--nuraly-checkbox-size-small) * 0.5);
    --nuraly-checkbox-local-medium-checked-width: calc(var(--nuraly-checkbox-size-medium) * 0.19);
    --nuraly-checkbox-local-medium-checked-height: calc(var(--nuraly-checkbox-size-medium) * 0.56);
    --nuraly-checkbox-local-large-checked-width: calc(var(--nuraly-checkbox-size-large) * 0.22);
    --nuraly-checkbox-local-large-checked-height: calc(var(--nuraly-checkbox-size-large) * 0.56);
  }

  /* ========================================
   * CHECKBOX COMPONENT STYLES
   * ========================================
   * Modern checkbox component with theme-aware styling
   * Uses CSS custom properties for consistent theming
   */

  :host {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--nuraly-checkbox-gap);
    font-family: var(--nuraly-checkbox-font-family);
    font-size: var(--nuraly-checkbox-font-size);
    font-weight: var(--nuraly-checkbox-font-weight);
    line-height: var(--nuraly-checkbox-line-height);
    color: var(--nuraly-checkbox-text-color);
    cursor: pointer;
    transition: var(--nuraly-checkbox-transition);
  }

  /* ========================================
   * CHECKBOX INPUT ELEMENT STYLES
   * ======================================== */

  input {
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    cursor: pointer;
    position: relative;
    border-radius: var(--nuraly-checkbox-border-radius);
    background-color: var(--nuraly-checkbox-background);
    border: var(--nuraly-checkbox-border);
    transition: var(--nuraly-checkbox-transition);
    margin: 0;
    outline: none;
  }

  /* ========================================
   * SIZE VARIATIONS
   * ======================================== */

  /* Medium size (default) */
  input {
    width: var(--nuraly-checkbox-size-medium);
    height: var(--nuraly-checkbox-size-medium);
  }

  :host([size='small']) input {
    width: var(--nuraly-checkbox-size-small);
    height: var(--nuraly-checkbox-size-small);
  }

  :host([size='large']) input {
    width: var(--nuraly-checkbox-size-large);
    height: var(--nuraly-checkbox-size-large);
  }

  /* ========================================
   * CHECKBOX STATE STYLES
   * ======================================== */

  /* Empty/unchecked state */
  :host(:not([checked]):not([indeterminate]):not([disabled])) input {
    background-color: var(--nuraly-checkbox-background);
    border: var(--nuraly-checkbox-border);
  }

  /* Checked and indeterminate states */
  :host(:not([disabled])[checked]) input,
  :host(:not([disabled])[indeterminate]) input {
    background-color: var(--nuraly-checkbox-checked-background);
    border: 1px solid var(--nuraly-checkbox-checked-border);
  }

  /* Hover states for interactive elements */
  :host(:not([disabled]):hover) input {
    border: var(--nuraly-checkbox-border-hover);
  }

  :host(:not([disabled]):hover[checked]) input,
  :host(:not([disabled]):hover[indeterminate]) input {
    background-color: var(--nuraly-checkbox-checked-background);
    border: 1px solid var(--nuraly-checkbox-border-hover);
    filter: brightness(1.1);
  }

  /* Focus states */
  input:focus,
  input:focus-visible {
    border: var(--nuraly-checkbox-border-focus);
    outline: var(--nuraly-checkbox-focus-outline);
    outline-offset: 2px;
  }

  /* ========================================
   * DISABLED STATE
   * ======================================== */

  :host([disabled]) {
    color: var(--nuraly-checkbox-disabled-text-color);
    cursor: not-allowed;
  }

  :host([disabled]) input {
    background-color: var(--nuraly-checkbox-disabled-background);
    border: 1px solid var(--nuraly-checkbox-disabled-border);
    cursor: not-allowed;
  }

  /* ========================================
   * CHECKMARK AND INDETERMINATE SYMBOLS
   * ======================================== */

  /* Base symbol styling */
  input:after {
    color: var(--nuraly-checkbox-checkmark-color);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -51%);
    transition: var(--nuraly-checkbox-transition);
  }

  /* Checked state checkmark */
  :host([checked]) input:after {
    border: solid var(--nuraly-checkbox-checkmark-color);
    border-width: 0 2px 2px 0;
    transform: translate(-50%, -51%) rotate(45deg);
    content: '';
    width: var(--nuraly-checkbox-local-medium-checked-width); /* Default to medium size */
    height: var(--nuraly-checkbox-local-medium-checked-height); /* Default to medium size */
  }

  /* Checkmark sizing per size variant */
  :host([checked][size='small']) input:after {
    width: var(--nuraly-checkbox-local-small-checked-width);
    height: var(--nuraly-checkbox-local-small-checked-height);
  }

  :host([checked][size='medium']) input:after {
    width: var(--nuraly-checkbox-local-medium-checked-width);
    height: var(--nuraly-checkbox-local-medium-checked-height);
  }

  :host([checked][size='large']) input:after {
    width: var(--nuraly-checkbox-local-large-checked-width);
    height: var(--nuraly-checkbox-local-large-checked-height);
  }

  /* Indeterminate state symbol */
  :host([indeterminate]:not([checked])) input:after {
    content: '-';
    color: var(--nuraly-checkbox-indeterminate-mark-color);
    font-weight: bold;
    transform: translate(-50%, -51%);
  }

  /* Indeterminate symbol sizing per size variant */
  :host([indeterminate][size='small']) input:after {
    font-size: var(--nuraly-checkbox-local-small-indeterminate-size);
  }

  :host([indeterminate][size='medium']) input:after {
    font-size: var(--nuraly-checkbox-local-medium-indeterminate-size);
  }

  :host([indeterminate][size='large']) input:after {
    font-size: var(--nuraly-checkbox-local-large-indeterminate-size);
  }

  /* Empty state - no symbol */
  :host(:not([checked]):not([indeterminate])) input:after {
    content: '';
  }

  /* ========================================
   * DISABLED STATE SYMBOLS
   * ======================================== */

  :host([disabled]) input:after {
    color: var(--nuraly-checkbox-disabled-checkmark-color);
    border-color: var(--nuraly-checkbox-disabled-checkmark-color);
  }

  /* ========================================
   * LABEL TEXT STYLING
   * ======================================== */

  .checkbox-label {
    flex: 1;
    cursor: pointer;
    user-select: none;
    transition: var(--nuraly-checkbox-transition);
  }

  :host([disabled]) .checkbox-label {
    cursor: not-allowed;
  }

  /* ========================================
   * ACCESSIBILITY IMPROVEMENTS
   * ======================================== */

  @media (prefers-reduced-motion: reduce) {
    :host,
    input,
    input:after,
    .checkbox-label {
      transition: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    input {
      border-width: 2px;
    }
    
    :host([checked]) input:after,
    :host([indeterminate]) input:after {
      font-weight: 900;
    }
  }
`;

export const styles = checkBoxStyles;
