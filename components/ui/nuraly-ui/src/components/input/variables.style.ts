import {css} from 'lit';

export const styleVariables = css`
  :host {
    --hybrid-input-background-color: #f4f4f4;
    --hybrid-input-text-color: #000000;
    --hybrid-input-font-family: IBM Plex Sans;
    --hybrid-input-label-color: #525252;
    --hybrid-input-placeholder-color: #a8a8a8;
    --hybrid-input-border-bottom: 1px solid #a8a8a8;
    --hybrid-input-border-top: 3px solid transparent;
    --hybrid-input-border-left: 2px solid transparent;
    --hybrid-input-border-right: 2px solid transparent;
    --hybrid-input-focus-border: 2px solid #0f62fe;
    --hybrid-input-label-font-size: 13px;
    --hybrid-input-helper-text-color: #525252;
    --hybrid-input-helper-text-font-size: 13px;
    --hybrid-input-placeholder-font-size: 13px;
    --hybrid-input-label-padding-bottom: 5px;
    --hybrid-input-helper-text-padding-top: 5px;
    --hybrid-input-disabled-background-color: #f4f4f4;
    --hybrid-input-disabled-placeholder-color: #c6c6c6;
    --hybrid-input-error-helper-text-color: #da1e28;
    --hybrid-input-error-border: 2px solid #da1e28;
    --hybrid-input-warning-helper-text-color: #161616;
    --hybrid-input-disabled-helper-text-color: #c6c6c6;
    --hybrid-input-disabled-label-color: #c6c6c6;
    --hybrid-input-warning-icon-color: #f0c300;
    --hybrid-input-error-icon-color: #da1e28;
    --hybrid-input-password-icon-color: #000000;
    --hybrid-input-disabled-icon-opacity: 0.4;
    --hybrid-input-number-icons-color: #000000;
    --hybrid-input-password-icon-padding-left: 8px;
    --hybrid-input-password-icon-padding-right: 8px;
    --hybrid-input-number-icons-sperator-color: #e0e0e0;
    --hybrid-input-number-icons-sperator-padding-bottom: 4px;
    --hybrid-input-number-icons-sperator-padding-left: 5px;
    --hybrid-input-number-icons-sperator-padding-right: 5px;

    --hybrid-input-number-icons-container-width: 70px;
    --hybrid-input-number-icons-container-padding-left: 5px;
    --hybrid-input-number-icons-container-padding-right: 5px;
    --hybrid-input-number-icons-width: 12px;
    --hybrid-input-number-icons-height: 12px;

    --hybrid-input-number-icons-padding-left: 4px;
    --hybrid-input-number-icons-padding-right: 4px;

    --hybrid-input-large-padding-top: 10px;
    --hybrid-input-large-padding-bottom: 10px;
    --hybrid-input-large-padding-left: 9px;
    --hybrid-input-large-padding-right: 4px;

    --hybrid-input-medium-padding-top: 7px;
    --hybrid-input-medium-padding-bottom: 7px;
    --hybrid-input-medium-padding-left: 9px;
    --hybrid-input-medium-padding-right: 4px;

    --hybrid-input-small-padding-top: 4px;
    --hybrid-input-small-padding-bottom: 4px;
    --hybrid-input-small-padding-left: 9px;
    --hybrid-input-small-padding-right: 4px;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-input-background-color: #393939;
      --hybrid-input-focus-border: 2px solid #ffffff;
      --hybrid-input-text-color: #ffffff;
      --hybrid-input-error-border: 2px solid #fa4d56;
      --hybrid-input-error-helper-text-color: #ffb3b8;
      --hybrid-input-disabled-background-color: #393939;
      --hybrid-input-disabled-placeholder-color: #6f6f6f;
      --hybrid-input-disabled-helper-text-color: #6f6f6f;
      --hybrid-input-disabled-label-color: #6f6f6f;
      --hybrid-input-warning-icon-color: #f0c300;
      --hybrid-input-error-icon-color: #da1e28;
      --hybrid-input-password-icon-color: #ffffff;
      --hybrid-input-number-icons-color: #ffffff;
      --hybrid-input-label-color: #c6c6c6;
      --hybrid-input-helper-text-color: #c6c6c6;
      --hybrid-input-number-icon-sperator-color: #525252;
    }
  }
`;
