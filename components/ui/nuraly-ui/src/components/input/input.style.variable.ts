import { css } from 'lit';

export const styleVariables = css`
  :host {
    --nuraly-input-local-background-color: #f4f4f4;
    --nuraly-input-local-text-color: #000000;
    --nuraly-input-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
    --nuraly-input-local-font-size:13px;
    --nuraly-input-local-label-color: #525252;
    --nuraly-input-local-placeholder-color: #a8a8a8;
    --nuraly-input-local-border-bottom: 2px solid #a8a8a8;
    --nuraly-input-local-border-top: 2px solid transparent;
    --nuraly-input-local-border-left: 2px solid transparent;
    --nuraly-input-local-border-right: 2px solid transparent;
    --nuraly-input-local-disabled-border-bottom: none;
    --nuraly-input-local-disabled-border-top: none;
    --nuraly-input-local-disabled-border-left: none;
    --nuraly-input-local-disabled-border-right: none;
    --nuraly-input-local-focus-border: 2px solid #0f62fe;
    --nuraly-input-local-border-radius: 0px;
    --nuraly-input-local-label-font-size: 13px;
    --nuraly-input-local-helper-text-color: #525252;
    --nuraly-input-local-helper-text-font-size: 13px;
    --nuraly-input-local-placeholder-font-size: 13px;
    --nuraly-input-label-padding-bottom: 5px;
    --nuraly-input-local-helper-text-padding-top: 5px;
    --nuraly-input-local-disabled-background-color: #f4f4f4;
    --nuraly-input-local-disabled-placeholder-color: #c6c6c6;
    --nuraly-input-local-error-helper-text-color: #da1e28;
    --nuraly-input-local-error-border: 2px solid #da1e28;
    --nuraly-input-local-warning-helper-text-color: #161616;
    --nuraly-input-local-disabled-helper-text-color: #c6c6c6;
    --nuraly-input-local-disabled-label-color: #c6c6c6;
    --nuraly-input-local-warning-icon-color: #f0c300;
    --nuraly-input-local-error-icon-color: #da1e28;
    --nuraly-input-local-password-icon-color: #000000;
    --nuraly-input-local-calendar-icon-color: #000000;
    --nuraly-input-local-copy-icon-color: #000000;
    --nuraly-input-local-copy-icon-padding-right:5px;
    --nuraly-input-local-clear-icon-color: #000000;
    --nuraly-input-local-clear-icon-padding-right: 5px;
    --nuraly-input-local-disabled-icon-opacity: 0.4;
    --nuraly-input-local-number-icons-color: #000000;
    --nuraly-input-local-password-icon-padding-left: 8px;
    --nuraly-input-local-password-icon-padding-right: 8px;
    --nuraly-input-local-number-icons-separator-color: #e0e0e0;
    --nuraly-input-local-number-icons-separator-padding-bottom: 4px;
    --nuraly-input-local-number-icons-separator-padding-left: 5px;
    --nuraly-input-local-number-icons-separator-padding-right: 5px;
    --nuraly-input-local-copy-icon-padding-right:5px;

    --nuraly-input-local-number-icons-container-width: 70px;
    --nuraly-input-local-number-icons-container-padding-left: 5px;
    --nuraly-input-local-number-icons-container-padding-right: 5px;
    --nuraly-input-local-number-icons-width: 12px;
    --nuraly-input-local-number-icons-height: 12px;

    --nuraly-input-local-number-icons-padding-left: 4px;
    --nuraly-input-local-number-icons-padding-right: 4px;

    --nuraly-input-local-large-padding-top: 10px;
    --nuraly-input-local-large-padding-bottom: 10px;
    --nuraly-input-local-large-padding-left: 9px;
    --nuraly-input-local-large-padding-right: 4px;

    --nuraly-input-local-medium-padding-top: 7px;
    --nuraly-input-local-medium-padding-bottom: 7px;
    --nuraly-input-local-medium-padding-left: 9px;
    --nuraly-input-local-medium-padding-right: 4px;

    --nuraly-input-local-small-padding-top: 4px;
    --nuraly-input-local-small-padding-bottom: 4px;
    --nuraly-input-local-small-padding-left: 9px;
    --nuraly-input-local-small-padding-right: 4px;

    /* Prefix and Suffix styling variables */
    --nuraly-input-local-prefix-color: #525252;
    --nuraly-input-local-prefix-font-size: 13px;
    --nuraly-input-local-prefix-padding-right: 8px;
    --nuraly-input-local-suffix-color: #525252;
    --nuraly-input-local-suffix-font-size: 13px;
    --nuraly-input-local-suffix-padding-left: 8px;
    --nuraly-input-local-disabled-prefix-suffix-color: #c6c6c6;

    /* Addon Before/After styling variables */
    --nuraly-input-local-addon-background-color: #e8e8e8;
    --nuraly-input-local-addon-color: #525252;
    --nuraly-input-local-addon-padding: 8px 12px;

    /* Character count styling variables */
    --nuraly-input-local-character-count-font-size: 12px;
    --nuraly-input-local-character-count-color: #8c8c8c;
    --nuraly-input-local-character-count-margin-top: 4px;
    --nuraly-input-local-character-count-over-limit-color: #da1e28;

    /* Validation message styling variables */
    --nuraly-input-local-validation-message-font-size: 12px;
    --nuraly-input-local-validation-message-margin-top: 4px;
    --nuraly-input-local-validation-message-padding: 0;
    --nuraly-input-local-validation-message-line-height: 1.4;
    --nuraly-input-local-error-message-color: #da1e28;
    --nuraly-input-local-warning-message-color: #f0c300;
    --nuraly-input-local-error-color: #da1e28;
    --nuraly-input-local-warning-color: #f0c300;
    --nuraly-input-local-disabled-validation-message-opacity: 0.6;
    --nuraly-input-local-disabled-validation-message-color: #c6c6c6;

    /* Input Variant Variables */
    /* Outlined variant - full border */
    --nuraly-input-local-outlined-border: 1px solid #d0d0d0;
    --nuraly-input-local-outlined-border-radius: 6px;
    --nuraly-input-local-outlined-focus-border: 2px solid #0f62fe;
    --nuraly-input-local-outlined-background: #ffffff;

    /* Filled variant - background with subtle border */
    --nuraly-input-local-filled-background: #f4f4f4;
    --nuraly-input-local-filled-border-bottom: 2px solid transparent;
    --nuraly-input-local-filled-focus-border-bottom: 2px solid #0f62fe;
    --nuraly-input-local-filled-border-radius: 6px 6px 0 0;

    /* Borderless variant - no borders */
    --nuraly-input-local-borderless-background: transparent;
    --nuraly-input-local-borderless-focus-outline: 2px solid #0f62fe;
    --nuraly-input-local-borderless-border-radius: 6px;

    /* Underlined variant - bottom border only (current default) */
    --nuraly-input-local-underlined-border-bottom: 2px solid #a8a8a8;
    --nuraly-input-local-underlined-focus-border-bottom: 2px solid #0f62fe;
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
