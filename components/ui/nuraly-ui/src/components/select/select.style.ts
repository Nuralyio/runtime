import {css} from 'lit';

const selectStyle = css`
  :host {
    font-family: var(--hybrid-select-font-family);
  }
  .wrapper {
    position: relative;
    width: var(--hybrid-select-width);
    border-bottom: var(--hybrid-select-border-bottom);
    border-top: var(--hybrid-select-border-top);
  }

  .select {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    font-size: var(--hybrid-select-medium-font-size);
  }

  .select-trigger {
    position: relative;
    background-color: var(--hybrid-select-background-color);
    color: var(--hybrid-select-trigger-text-color);
    min-height: var(--hybrid-select-medium-height);
    display: flex;
    padding-left: var(--hybrid-select-padding-left);
    padding-right: calc(var(--hybrid-select-icon-width) * 2 + var(--hybrid-select-icons-padding) * 2 + 1px);
    align-items: center;
    font-size: var(--hybrid-select-medium-font-size);
    flex-wrap: wrap;
  }
  #unselect-one {
    --hybrid-icon-width: var(--hybrid-select-icon-unselect-one-width);
  }
  #unselect-multiple,
  #unselect-one {
    --hybrid-icon-color: var(--hybrid-select-trigger-text-color);
  }
  .label {
    display: flex;
  }

  .wrapper:focus {
    border: var(--hybrid-select-focus-border);
  }
  .icons-container {
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translate(-100%, -50%);
    display: flex;
  }

  #check-icon {
    position: absolute;
    top: 50%;
    transform: translate(0%, -50%);
    left: 0%;
    --hybrid-icon-color: var(--hybrid-select-trigger-text-color);
  }
  #warning-icon {
    --hybrid-icon-color: var(--hybrid-select-warning-icon-color);
  }
  #error-icon {
    --hybrid-icon-color: var(--hybrid-select-error-icon-color);
  }

  :host([disabled]) hy-icon {
    opacity: var(--hybrid-select-disabled-opacity);
    cursor: not-allowed;
  }

  .options {
    position: absolute;
    left: 0%;
    right: 0%;
    background-color: var(--hybrid-select-options-background-color);
    border-radius: var(--hybrid-select-border-radius);
    display: none;
    flex-direction: column;
    box-shadow: var(--hybrid-select-box-shadow);
    z-index: 1;
    max-height: var(--hybrid-select-max-height);
    overflow: auto;
  }

  .option {
    padding: var(--hybrid-select-option-medium-padding);
    padding-left: var(--hybrid-select-option-padding-left);
    cursor: pointer;
    position: relative;
    color: var(--hybrid-select-option-text-color);
  }
  .option:hover {
    background-color: var(--hybrid-select-option-hover);
  }
  .option-text {
    padding-left: var(--hybrid-select-option-padding-left);
  }
  hy-icon {
    display: flex;
    padding: var(--hybrid-select-icons-padding);
    --hybrid-icon-width: var(--hybrid-select-icon-width);
  }
  :host([size='small']) .select-trigger {
    min-height: var(--hybrid-select-small-height);
    font-size: var(--hybrid-select-small-font-size);
  }
  :host([size='large']) .select-trigger {
    min-height: var(--hybrid-select-large-height);
    font-size: var(--hybrid-select-large-font-size);
  }

  :host([size='small']) .option {
    padding: var(--hybrid-select-option-small-padding);
    font-size: var(--hybrid-select-small-font-size);
  }
  :host([size='large']) .option {
    padding: var(--hybrid-select-option-large-padding);
    font-size: var(--hybrid-select-large-font-size);
  }
  :host([status='error']) .wrapper {
    border: var(--hybrid-select-error-border);
  }
  :host([status='error']) ::slotted([slot='helper-text']) {
    color: var(--hybrid-select-error-helper-text);
  }

  :host(:not([disabled])) .select-trigger:hover {
    background-color: var(--hybrid-select-hover-background-color);
  }

  :host([disabled]) .wrapper {
    border: none;
    opacity: var(--hybrid-select-disabled-opacity);
    cursor: not-allowed;
  }
  :host([disabled]) ::slotted([slot='helper-text']),
  :host([disabled]) ::slotted([slot='label']) {
    opacity: var(--hybrid-select-disabled-opacity);
  }
  :host([show]) .options {
    display: flex;
  }
  :host([type='inline']) {
    display: flex;
    gap: var(--hybrid-select-inline-gap);
  }
  :host([type='inline']) ::slotted([slot='helper-text']),
  :host([type='inline']) ::slotted([slot='label']) {
    display: flex;
    align-items: center;
  }

  ::slotted([slot='helper-text']) {
    color: var(--hybrid-select-helper-text-color);
  }

  ::slotted([slot='label']) {
    color: var(--hybrid-select-label-text-color);
  }
  :host {
    --hybrid-select-width: 50%;
    --hybrid-select-font-family: IBM Plex Sans;
    --hybrid-select-background-color: #f4f4f4;
    --hybrid-select-hover-background-color: #e0e0e0;
    --hybrid-select-border-bottom: 1px solid #cccccc;
    --hybrid-select-border-top: 3px solid transparent;
    --hybrid-select-trigger-text-color: #161616;
    --hybrid-select-option-text-color: #161616;
    --hybrid-select-padding-left: 5px;
    --hybrid-select-option-padding-left: 3px;
    --hybrid-select-focus-border: 2px solid #0f62fe;
    --hybrid-select-options-background-color: #f4f4f4;
    --hybrid-select-border-radius: 2px;
    --hybrid-select-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    --hybrid-select-max-height: 250px;
    --hybrid-select-option-medium-padding: 10px;
    --hybrid-select-option-large-padding: 12px;
    --hybrid-select-option-small-padding: 8px;
    --hybrid-select-option-padding-left: 17px;
    --hybrid-select-option-hover: #e0e0e0;
    --hybrid-select-icons-padding: 3px;
    --hybrid-select-icon-width: 14px;
    --hybrid-select-icon-unselect-one-width: 12px;
    --hybrid-select-small-height: 25px;
    --hybrid-select-medium-height: 35px;
    --hybrid-select-large-height: 45px;
    --hybrid-select-small-font-size: 12px;
    --hybrid-select-medium-font-size: 14px;
    --hybrid-select-large-font-size: 16px;
    --hybrid-select-error-border: 2px solid #da1e28;
    --hybrid-select-error-icon-color: #da1e28;
    --hybrid-select-warning-icon-color: #f0c300;
    --hybrid-select-error-helper-text: #da1e28;
    --hybrid-select-disabled-opacity: 0.5;
    --hybrid-select-inline-gap: 5px;
    --hybrid-select-helper-text-color: #a8a8a8;
    --hybrid-select-label-text-color: #a8a8a8;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-select-focus-border: 2px solid #ffffff;
      --hybrid-select-background-color: #393939;
      --hybrid-select-hover-background-color: #4c4c4c;
      --hybrid-select-options-background-color: #393939;
      --hybrid-select-option-hover: #4c4c4c;
      --hybrid-select-helper-text-color: #c6c6c6;
      --hybrid-select-label-text-color: #c6c6c6;
      --hybrid-select-border-bottom: 1px solid #6f6f6f;
      --hybrid-select-trigger-text-color: #f4f4f4;
      --hybrid-select-option-text-color: #f4f4f4;
    }
  }
`;
export const styles = selectStyle;
