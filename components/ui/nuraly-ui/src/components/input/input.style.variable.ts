import { css } from 'lit';

export const styleVariables = css`
  :host {
    /* ========================================
     * INPUT THEME-AWARE VARIABLES
     * Uses CSS custom properties from theme files
     * ======================================== */

    /* Base input styling - uses theme variables with fallbacks */
    --nuraly-input-local-background-color: var(--nuraly-color-input-background, #f4f4f4);
    --nuraly-input-local-text-color: var(--nuraly-color-input-text, #161616);
    --nuraly-input-local-font-family: var(--nuraly-font-family-input, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif);
    --nuraly-input-local-font-size: var(--nuraly-font-size-input, 14px);
    --nuraly-input-local-label-color: var(--nuraly-color-input-label, #393939);
    --nuraly-input-local-placeholder-color: var(--nuraly-color-input-placeholder, #a8a8a8);
    
    /* Input borders - theme-aware */
    --nuraly-input-local-border-bottom: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-border-bottom, #8d8d8d);
    --nuraly-input-local-border-top: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-border, transparent);
    --nuraly-input-local-border-left: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-border, transparent);
    --nuraly-input-local-border-right: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-border, transparent);
    --nuraly-input-local-border-radius: var(--nuraly-border-radius-input, 0px);
    
    /* Focus border */
    --nuraly-input-local-focus-border: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-border-focus, #0f62fe);
    
    /* Disabled states - theme-aware */
    --nuraly-input-local-disabled-border-bottom: none;
    --nuraly-input-local-disabled-border-top: none;
    --nuraly-input-local-disabled-border-left: none;
    --nuraly-input-local-disabled-border-right: none;
    --nuraly-input-local-disabled-background-color: var(--nuraly-color-input-disabled-background, #f4f4f4);
    --nuraly-input-local-disabled-placeholder-color: var(--nuraly-color-input-disabled-placeholder, #c6c6c6);
    --nuraly-input-local-disabled-helper-text-color: var(--nuraly-color-input-disabled-helper-text, #c6c6c6);
    --nuraly-input-local-disabled-label-color: var(--nuraly-color-input-disabled-label, #c6c6c6);
    
    /* Typography - theme-aware */
    --nuraly-input-local-label-font-size: var(--nuraly-font-size-input-label, 14px);
    --nuraly-input-local-helper-text-color: var(--nuraly-color-input-helper-text, #6f6f6f);
    --nuraly-input-local-helper-text-font-size: var(--nuraly-font-size-input-helper, 14px);
    --nuraly-input-local-placeholder-font-size: var(--nuraly-font-size-input-placeholder, 14px);
    
    /* Spacing - theme-aware */
    --nuraly-input-label-padding-bottom: var(--nuraly-spacing-input-label-bottom, 8px);
    --nuraly-input-local-helper-text-padding-top: var(--nuraly-spacing-input-helper-top, 8px);
    
    /* Error states - theme-aware */
    --nuraly-input-local-error-helper-text-color: var(--nuraly-color-input-error-text, #da1e28);
    --nuraly-input-local-error-border: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-error-border, #da1e28);
    
    /* Warning states - theme-aware */
    --nuraly-input-local-warning-helper-text-color: var(--nuraly-color-input-warning-text, #161616);
    
    /* Icons - theme-aware */
    --nuraly-input-local-warning-icon-color: var(--nuraly-color-input-warning-icon, #f1c21b);
    --nuraly-input-local-error-icon-color: var(--nuraly-color-input-error-icon, #da1e28);
    --nuraly-input-local-password-icon-color: var(--nuraly-color-input-password-icon, #161616);
    --nuraly-input-local-calendar-icon-color: var(--nuraly-color-input-calendar-icon, #161616);
    --nuraly-input-local-copy-icon-color: var(--nuraly-color-input-copy-icon, #161616);
    --nuraly-input-local-clear-icon-color: var(--nuraly-color-input-clear-icon, #161616);
    --nuraly-input-local-number-icons-color: var(--nuraly-color-input-number-icons, #161616);
    --nuraly-input-local-disabled-icon-opacity: 0.4;
    
    /* Icon spacing and sizing - theme-aware */
    --nuraly-input-local-password-icon-padding-left: var(--nuraly-spacing-input-icon, 8px);
    --nuraly-input-local-password-icon-padding-right: var(--nuraly-spacing-input-icon, 8px);
    --nuraly-input-local-copy-icon-padding-right: var(--nuraly-spacing-input-icon, 8px);
    --nuraly-input-local-clear-icon-padding-right: var(--nuraly-spacing-input-icon, 8px);
    
    /* Number icons styling */
    --nuraly-input-local-number-icons-separator-color: #e0e0e0;
    --nuraly-input-local-number-icons-separator-padding-bottom: 4px;
    --nuraly-input-local-number-icons-separator-padding-left: 5px;
    --nuraly-input-local-number-icons-separator-padding-right: 5px;
    --nuraly-input-local-number-icons-container-width: 70px;
    --nuraly-input-local-number-icons-container-padding-left: 5px;
    --nuraly-input-local-number-icons-container-padding-right: 5px;
    --nuraly-input-local-number-icons-width: var(--nuraly-size-input-icon, 12px);
    --nuraly-input-local-number-icons-height: var(--nuraly-size-input-icon, 12px);
    --nuraly-input-local-number-icons-padding-left: 4px;
    --nuraly-input-local-number-icons-padding-right: 4px;

    /* Size variants - theme-aware */
    --nuraly-input-local-large-padding-top: var(--nuraly-spacing-input-large-vertical, 10px);
    --nuraly-input-local-large-padding-bottom: var(--nuraly-spacing-input-large-vertical, 10px);
    --nuraly-input-local-large-padding-left: var(--nuraly-spacing-input-large-horizontal, 16px);
    --nuraly-input-local-large-padding-right: 4px;

    --nuraly-input-local-medium-padding-top: var(--nuraly-spacing-input-medium-vertical, 7px);
    --nuraly-input-local-medium-padding-bottom: var(--nuraly-spacing-input-medium-vertical, 7px);
    --nuraly-input-local-medium-padding-left: var(--nuraly-spacing-input-medium-horizontal, 16px);
    --nuraly-input-local-medium-padding-right: 4px;

    --nuraly-input-local-small-padding-top: var(--nuraly-spacing-input-small-vertical, 4px);
    --nuraly-input-local-small-padding-bottom: var(--nuraly-spacing-input-small-vertical, 4px);
    --nuraly-input-local-small-padding-left: var(--nuraly-spacing-input-small-horizontal, 12px);
    --nuraly-input-local-small-padding-right: 4px;

    /* Prefix and Suffix styling - theme-aware */
    --nuraly-input-local-prefix-color: var(--nuraly-color-input-prefix-text, #6f6f6f);
    --nuraly-input-local-prefix-font-size: var(--nuraly-font-size-input, 14px);
    --nuraly-input-local-prefix-padding-right: 8px;
    --nuraly-input-local-suffix-color: var(--nuraly-color-input-suffix-text, #6f6f6f);
    --nuraly-input-local-suffix-font-size: var(--nuraly-font-size-input, 14px);
    --nuraly-input-local-suffix-padding-left: 8px;
    --nuraly-input-local-disabled-prefix-suffix-color: var(--nuraly-color-input-disabled-text, #c6c6c6);

    /* Addon Before/After styling - theme-aware */
    --nuraly-input-local-addon-background-color: var(--nuraly-color-input-addon-background, #e8e8e8);
    --nuraly-input-local-addon-color: var(--nuraly-color-input-addon-text, #393939);
    --nuraly-input-local-addon-padding: 8px 12px;

    /* Character count styling */
    --nuraly-input-local-character-count-font-size: 12px;
    --nuraly-input-local-character-count-color: var(--nuraly-color-input-helper-text, #8c8c8c);
    --nuraly-input-local-character-count-margin-top: 4px;
    --nuraly-input-local-character-count-over-limit-color: var(--nuraly-color-input-error-text, #da1e28);

    /* Validation message styling */
    --nuraly-input-local-validation-message-font-size: var(--nuraly-font-size-input-helper, 12px);
    --nuraly-input-local-validation-message-margin-top: 4px;
    --nuraly-input-local-validation-message-padding: 0;
    --nuraly-input-local-validation-message-line-height: 1.4;
    --nuraly-input-local-error-message-color: var(--nuraly-color-input-error-text, #da1e28);
    --nuraly-input-local-warning-message-color: var(--nuraly-color-input-warning-text, #f1c21b);
    --nuraly-input-local-error-color: var(--nuraly-color-input-error-text, #da1e28);
    --nuraly-input-local-warning-color: var(--nuraly-color-input-warning-text, #f1c21b);
    --nuraly-input-local-disabled-validation-message-opacity: 0.6;
    --nuraly-input-local-disabled-validation-message-color: var(--nuraly-color-input-disabled-helper-text, #c6c6c6);

    /* Input Variant Variables - theme-aware */
    /* Outlined variant - full border */
    --nuraly-input-local-outlined-border: var(--nuraly-border-width-input, 1px) solid var(--nuraly-color-input-outlined-border, #d9d9d9);
    --nuraly-input-local-outlined-border-radius: var(--nuraly-border-radius-input-outlined, 6px);
    --nuraly-input-local-outlined-focus-border: var(--nuraly-border-width-input, 1px) solid var(--nuraly-color-input-border-focus, #1890ff);
    --nuraly-input-local-outlined-background: var(--nuraly-color-input-outlined-background, #ffffff);

    /* Filled variant - background with subtle border */
    --nuraly-input-local-filled-background: var(--nuraly-color-input-filled-background, #fafafa);
    --nuraly-input-local-filled-border-bottom: var(--nuraly-border-width-input, 1px) solid var(--nuraly-color-input-filled-border-bottom, #d9d9d9);
    --nuraly-input-local-filled-focus-border-bottom: var(--nuraly-border-width-input, 1px) solid var(--nuraly-color-input-border-focus, #1890ff);
    --nuraly-input-local-filled-border-radius: var(--nuraly-border-radius-input-filled, 6px);

    /* Borderless variant - no borders */
    --nuraly-input-local-borderless-background: transparent;
    --nuraly-input-local-borderless-focus-outline: 2px solid var(--nuraly-color-input-border-focus, #1890ff);
    --nuraly-input-local-borderless-border-radius: var(--nuraly-border-radius-input, 6px);

    /* Underlined variant - bottom border only (Carbon style) */
    --nuraly-input-local-underlined-border-bottom: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-border-bottom, #8d8d8d);
    --nuraly-input-local-underlined-focus-border-bottom: var(--nuraly-border-width-input, 2px) solid var(--nuraly-color-input-border-focus, #0f62fe);
  }

  /* 
   * These override the light theme defaults when data-theme="dark" is applied
   * This provides explicit theme control via JavaScript or HTML attributes
   */
  .input-wrapper[data-theme="dark"] {
    --nuraly-input-local-background-color: #393939;
    --nuraly-input-local-focus-border: 2px solid #ffffff;
    --nuraly-input-local-text-color: #ffffff;
    --nuraly-input-local-error-border: 2px solid #fa4d56;
    --nuraly-input-local-error-helper-text-color: #ffb3b8;
    --nuraly-input-local-disabled-background-color: #393939;
    --nuraly-input-local-disabled-placeholder-color: #6f6f6f;
    --nuraly-input-local-disabled-helper-text-color: #6f6f6f;
    --nuraly-input-local-disabled-label-color: #6f6f6f;
    --nuraly-input-local-warning-icon-color: #f0c300;
    --nuraly-input-local-error-icon-color: #da1e28;
    --nuraly-input-local-password-icon-color: #ffffff;
    --nuraly-input-local-number-icons-color: #ffffff;
    --nuraly-input-local-label-color: #c6c6c6;
    --nuraly-input-local-helper-text-color: #c6c6c6;
    --nuraly-input-local-number-icons-separator-color: #525252;
    --nuraly-input-local-calendar-icon-color: #ffffff;
    --nuraly-input-local-copy-icon-color: #ffffff;
    --nuraly-input-local-clear-icon-color: #ffffff;
    
    /* Dark theme prefix and suffix colors */
    --nuraly-input-local-prefix-color: #c6c6c6;
    --nuraly-input-local-suffix-color: #c6c6c6;
    --nuraly-input-local-disabled-prefix-suffix-color: #6f6f6f;

    /* Dark theme addon colors */
    --nuraly-input-local-addon-background-color: #525252;
    --nuraly-input-local-addon-color: #c6c6c6;

    /* Dark theme character count colors */
    --nuraly-input-local-character-count-color: #8c8c8c;
    --nuraly-input-local-character-count-over-limit-color: #fa4d56;

    /* Dark theme validation message colors */
    --nuraly-input-local-error-message-color: #ffb3b8;
    --nuraly-input-local-warning-message-color: #f0c300;
    --nuraly-input-local-error-color: #fa4d56;
    --nuraly-input-local-warning-color: #f0c300;
    --nuraly-input-local-disabled-validation-message-color: #6f6f6f;

    /* Dark theme input variant variables */
    /* Outlined variant - dark theme */
    --nuraly-input-local-outlined-border: 1px solid #525252;
    --nuraly-input-local-outlined-focus-border: 2px solid #ffffff;
    --nuraly-input-local-outlined-background: #393939;

    /* Filled variant - dark theme */
    --nuraly-input-local-filled-background: #525252;
    --nuraly-input-local-filled-focus-border-bottom: 2px solid #ffffff;

    /* Borderless variant - dark theme */
    --nuraly-input-local-borderless-background: transparent;
    --nuraly-input-local-borderless-focus-outline: 2px solid #ffffff;

    /* Underlined variant - dark theme */
    --nuraly-input-local-underlined-focus-border-bottom: 2px solid #ffffff;
  }
`;
