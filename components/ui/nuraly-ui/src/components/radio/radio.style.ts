import {css} from 'lit';

export const styles = css`
  :host {
    width: fit-content;
    display: block;
    font-family: var(--hybrid-radio-button-font-family);
  }
  :host([direction='horizontal']) {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  :host([position='right']) .radio {
    flex-direction: row-reverse;
    justify-content: flex-end;
  }
  :host([position='right']) span {
    flex-grow: 1;
  }
  :host([position='right'][direction='horizontal']) span {
    flex-grow: 0;
  }

  :host([position='right']) input[type='radio'] {
    margin-right: var(--hybrid-radio-button-position-right-margin-right);
    margin-left: var(--hybrid-radio-button-position-right-margin-left);
  }

  :host([direction='horizontal']) .radio {
    margin-top: var(--hybrid-radio-button-direction-horizontal-container-margin-top);
  }
  input[type='radio'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: var(--hybrid-radio-button-size);
    height: var(--hybrid-radio-button-size);
    padding: var(--hybrid-radio-button-dot-size);
    background-clip: content-box;
    border: var(--hybrid-radio-button-border);
    border-radius: 50%;
    margin: 0px;
    margin-right: var(--hybrid-radio-button-margin-right);
    cursor: pointer;
  }
  .error input[type='radio'] {
    border: var(--hybrid-radio-button-error-border);
  }
  input[type='radio']:focus {
    border: var(--hybrid-radio-button-focus-border);
    padding: var(--hybrid-radio-button-focus-dot-size);
  }
  .error input[type='radio']:focus {
    border: var(--hybrid-radio-button-error-border);
    padding: var(--hybrid-radio-button-dot-size);
  }

  input[type='radio']:checked {
    background-color: var(--hybrid-radio-button-dot-color);
  }
  input[type='radio']:disabled,
  .radio-container:has(input[type='radio']:disabled) {
    opacity: var(--hybrid-radio-button-disabled-opacity);
  }

  .input-container {
    display: flex;
  }

  .radio {
    display: flex;
    align-items: center;
    margin-top: var(--hybrid-radio-button-container-margin-top);
    font-size: var(--hybrid-radio-button-label-font-size);
    cursor: pointer;
    flex-grow: 1;
  }
  .message-container {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--hybrid-radio-button-message-font-size);
  }
  hy-icon {
    display: flex;
  }
  .error hy-icon {
    --hybrid-icon-color: var(--hybrid-radio-button-error-icon-color);
  }

  .warning hy-icon {
    --hybrid-icon-color: var(--hybrid-radio-button-warning-icon-color);
  }
  .error .message-container {
    color: var(--hybrid-radio-button-error-text-color);
  }

  .radio:has(input:disabled) {
    cursor: not-allowed;
  }
  input:disabled {
    cursor: not-allowed;
  }

  .type-button {
    display: inline-flex;
  }
  .type-button :first-child {
    --hybrid-button-border-top-left-radius: var(--hybrid-radio-button-border-top-left-radius);
    --hybrid-button-border-bottom-left-radius: var(--hybrid-radio-button-border-bottom-left-radius);
    --hybrid-button-border-right: none;
  }
  .type-button :last-child {
    --hybrid-button-border-top-right-radius: var(--hybrid-radio-button-border-top-right-radius);
    --hybrid-button-border-bottom-right-radius: var(--hybrid-radio-button-border-bottom-right-radius);
    --hybrid-button-border-left: none;
  }
  .type-button :not(:last-child):not(:first-child) {
    --hybrid-button-border-left: none;
    --hybrid-button-border-right: none;
  }

  :host {
    --hybrid-radio-button-border-top-left-radius: 4px;
    --hybrid-radio-button-border-top-right-radius: 4px;
    --hybrid-radio-button-border-bottom-left-radius: 4px;
    --hybrid-radio-button-border-bottom-right-radius: 4px;
    --hybrid-radio-button-font-family: IBM Plex Sans;
    --hybrid-radio-button-size: 14px;
    --hybrid-radio-button-dot-size: 3px;
    --hybrid-radio-button-dot-color: black;
    --hybrid-radio-button-border: 1px solid black;
    --hybrid-radio-button-error-border: 1px solid #da1e28;
    --hybrid-radio-button-margin-right: 10px;
    --hybrid-radio-button-focus-border: 2px solid #0f62fe;
    --hybrid-radio-button-error-icon-color: #da1e28;
    --hybrid-radio-button-error-text-color: #da1e28;
    --hybrid-radio-button-warning-icon-color: #f0c300;
    --hybrid-radio-button-focus-dot-size: 2px;
    --hybrid-radio-button-container-margin-top: 10px;
    --hybrid-radio-button-position-right-margin-right: 0px;
    --hybrid-radio-button-position-right-margin-left: 10px;
    --hybrid-radio-button-direction-horizontal-container-margin-top: 0px;
    --hybrid-radio-button-disabled-opacity: 0.5;
    --hybrid-radio-button-label-font-size: 15px;
    --hybrid-radio-button-message-font-size: 12px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-radio-button-dot-color: #ffffff;
      --hybrid-radio-button-border: 1px solid #ffffff;
      --hybrid-radio-button-focus-border: 2px solid #ffffff;
    }
  }
`;
