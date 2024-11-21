import {css} from 'lit';

export const styleVariables = css`
  :host {
    --hybrid-input-local-background-color: #f4f4f4;
    --hybrid-input-local-text-color: #000000;
    --hybrid-input-local-font-family: IBM Plex Sans;
    --hybrid-input-local-font-size:13px;
    --hybrid-input-local-label-color: #525252;
    --hybrid-input-local-placeholder-color: #a8a8a8;
    --hybrid-input-local-border-bottom: 1px solid #a8a8a8;
    --hybrid-input-local-border-top: 3px solid transparent;
    --hybrid-input-local-border-left: 2px solid transparent;
    --hybrid-input-local-border-right: 2px solid transparent;
    --hybrid-input-local-disabled-border-bottom: none;
    --hybrid-input-local-disabled-border-top: none;
    --hybrid-input-local-disabled-border-left: none;
    --hybrid-input-local-disabled-border-right: none;
    --hybrid-input-local-focus-border: 2px solid #0f62fe;
    --hybrid-input-local-border-radius: 0px;
    --hybrid-input-local-label-font-size: 13px;
    --hybrid-input-local-helper-text-color: #525252;
    --hybrid-input-local-helper-text-font-size: 13px;
    --hybrid-input-local-placeholder-font-size: 13px;
    --hybrid-input-label-padding-bottom: 5px;
    --hybrid-input-local-helper-text-padding-top: 5px;
    --hybrid-input-local-disabled-background-color: #f4f4f4;
    --hybrid-input-local-disabled-placeholder-color: #c6c6c6;
    --hybrid-input-local-error-helper-text-color: #da1e28;
    --hybrid-input-local-error-border: 2px solid #da1e28;
    --hybrid-input-local-warning-helper-text-color: #161616;
    --hybrid-input-local-disabled-helper-text-color: #c6c6c6;
    --hybrid-input-local-disabled-label-color: #c6c6c6;
    --hybrid-input-local-warning-icon-color: #f0c300;
    --hybrid-input-local-error-icon-color: #da1e28;
    --hybrid-input-local-password-icon-color: #000000;
    --hybrid-input-local-calendar-icon-color: #000000;
    --hybrid-input-local-copy-icon-color: #000000;
    --hybrid-input-local-disabled-icon-opacity: 0.4;
    --hybrid-input-local-number-icons-color: #000000;
    --hybrid-input-local-password-icon-padding-left: 8px;
    --hybrid-input-local-password-icon-padding-right: 8px;
    --hybrid-input-local-number-icons-sperator-color: #e0e0e0;
    --hybrid-input-local-number-icons-sperator-padding-bottom: 4px;
    --hybrid-input-local-number-icons-sperator-padding-left: 5px;
    --hybrid-input-local-number-icons-sperator-padding-right: 5px;
    --hybrid-input-local-copy-icon-padding-right:5px;

    --hybrid-input-local-number-icons-container-width: 70px;
    --hybrid-input-local-number-icons-container-padding-left: 5px;
    --hybrid-input-local-number-icons-container-padding-right: 5px;
    --hybrid-input-local-number-icons-width: 12px;
    --hybrid-input-local-number-icons-height: 12px;

    --hybrid-input-local-number-icons-padding-left: 4px;
    --hybrid-input-local-number-icons-padding-right: 4px;

    --hybrid-input-local-large-padding-top: 10px;
    --hybrid-input-local-large-padding-bottom: 10px;
    --hybrid-input-local-large-padding-left: 9px;
    --hybrid-input-local-large-padding-right: 4px;

    --hybrid-input-local-medium-padding-top: 7px;
    --hybrid-input-local-medium-padding-bottom: 7px;
    --hybrid-input-local-medium-padding-left: 9px;
    --hybrid-input-local-medium-padding-right: 4px;

    --hybrid-input-local-small-padding-top: 4px;
    --hybrid-input-local-small-padding-bottom: 4px;
    --hybrid-input-local-small-padding-left: 9px;
    --hybrid-input-local-small-padding-right: 4px;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-input-local-background-color: #393939;
      --hybrid-input-local-focus-border: 2px solid #ffffff;
      --hybrid-input-local-text-color: #ffffff;
      --hybrid-input-local-error-border: 2px solid #fa4d56;
      --hybrid-input-local-error-helper-text-color: #ffb3b8;
      --hybrid-input-local-disabled-background-color: #393939;
      --hybrid-input-local-disabled-placeholder-color: #6f6f6f;
      --hybrid-input-local-disabled-helper-text-color: #6f6f6f;
      --hybrid-input-local-disabled-label-color: #6f6f6f;
      --hybrid-input-local-warning-icon-color: #f0c300;
      --hybrid-input-local-error-icon-color: #da1e28;
      --hybrid-input-local-password-icon-color: #ffffff;
      --hybrid-input-local-number-icons-color: #ffffff;
      --hybrid-input-local-label-color: #c6c6c6;
      --hybrid-input-local-helper-text-color: #c6c6c6;
      --hybrid-input-local-number-icon-sperator-color: #525252;
      --hybrid-input-local-calendar-icon-color: #ffffff;
      --hybrid-input-local-copy-icon-color: #ffffff;
    }
  }
`;
