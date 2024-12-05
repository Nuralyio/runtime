import {css} from 'lit';

const selectStyle = css`
  :host {
    font-family: var(--hybrid-select-font-family,var(--hybrid-select-local-font-family));
  }
  .wrapper {
    border-radius: var(--hybrid-select-border-radius,var(--hybrid-select-local-border-radius));
    position: relative;
    width: var(--hybrid-select-width,var(--hybrid-select-local-width));
    border-bottom: var(--hybrid-select-border-bottom,var(--hybrid-select-local-border-bottom));
    border-top: var(--hybrid-select-border-top,var(--hybrid-select-local-border-top));
    border-left: var(--hybrid-select-border-left,var(--hybrid-select-local-border-left));
    border-right: var(--hybrid-select-border-right,var(--hybrid-select-local-border-right));
    word-break:break-word;
  }

  .select {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    font-size: var(--hybrid-select-medium-font-size,var(--hybrid-select-local-medium-font-size));
  }

  .select-trigger {
    border-radius: var(--hybrid-select-border-radius,var(--hybrid-select-local-border-radius));
    position: relative;
    background-color: var(--hybrid-select-background-color,var(--hybrid-select-local-background-color));
    color: var(--hybrid-select-trigger-text-color,var(--hybrid-select-local-trigger-text-color));
    min-height: var(--hybrid-select-medium-height,var(--hybrid-select-local-medium-height));
    display: flex;
    padding-left: var(--hybrid-select-padding-left,var(--hybrid-select-local-padding-left));
    padding-right: calc(var(--hybrid-select-icon-width,var(--hybrid-select-local-icon-width)) * 2 + var(--hybrid-select-icons-padding,var(--hybrid-select-local-icons-padding)) * 2 + 1px);
    align-items: center;
    font-size: var(--hybrid-select-medium-font-size,var(--hybrid-select-local-medium-font-size));
    flex-wrap: wrap;
  }
  #unselect-one {
    --hybrid-icon-width: var(--hybrid-select-icon-unselect-one-width,var(--hybrid-select-local-icon-unselect-one-width));
  }
  #unselect-multiple,
  #unselect-one {
    --hybrid-icon-color: var(--hybrid-select-trigger-text-color,var(--hybrid-select-local-trigger-text-color));
  }
  .label {
    display: flex;
  }

  .wrapper:focus {
    border-radius: var(--hybrid-select-border-radius,var(--hybrid-select-local-border-radius));
    border: var(--hybrid-select-focus-border,var(--hybrid-select-local-focus-border));
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
    left: 5%;
    --hybrid-icon-color: var(--hybrid-select-trigger-text-color,var(--hybrid-select-local-trigger-text-color));
  }
  #warning-icon {
    --hybrid-icon-color: var(--hybrid-select-warning-icon-color,var(--hybrid-select-local-warning-icon-color));
  }
  #error-icon {
    --hybrid-icon-color: var(--hybrid-select-error-icon-color,var(--hybrid-select-local-error-icon-color));
  }

  :host([disabled]) hy-icon {
    opacity: var(--hybrid-select-disabled-opacity,var(--hybrid-select-local-disabled-opacity));
    cursor: not-allowed;
  }

  .options {
    position: absolute;
    left: 0%;
    right: 0%;
    background-color: var(--hybrid-select-options-background-color,var(--hybrid-select-local-options-background-color));
    border-radius: var(--hybrid-select-border-radius,var(--hybrid-select-local-border-radius));
    display: none;
    flex-direction: column;
    box-shadow: var(--hybrid-select-box-shadow,var(--hybrid-select-local-box-shadow));
    z-index: 1;
    max-height: var(--hybrid-select-max-height,var(--hybrid-select-local-max-height));
    overflow: auto;
  }

  .option {
    padding: var(--hybrid-select-option-medium-padding,var(--hybrid-select-local-option-medium-padding));
    padding-left: var(--hybrid-select-option-padding-left,var(--hybrid-select-local-option-padding-left));
    cursor: pointer;
    position: relative;
    color: var(--hybrid-select-option-text-color,var(--hybrid-select-local-option-text-color));
  }
  .option:hover {
      border-radius: var(--hybrid-select-border-option-radius,var(--hybrid-select-hover-local-border-option-radius));
    background-color: var(--hybrid-select-option-hover,var(--hybrid-select-local-option-hover));
  }
  .option-text {
    padding-left: var(--hybrid-select-option-padding-left,var(--hybrid-select-local-option-padding-left));
  }
  hy-icon {
    display: flex;
    padding: var(--hybrid-select-icons-padding,var(--hybrid-select-local-icons-padding,));
    --hybrid-icon-width: var(--hybrid-select-icon-width,var(--hybrid-select-local-icon-width));
  }
  :host([size='small']) .select-trigger {
    min-height: var(--hybrid-select-small-height,var(--hybrid-select-local-small-height));
    font-size: var(--hybrid-select-small-font-size,var(--hybrid-select-local-small-font-size));
  }
  :host([size='large']) .select-trigger {
    min-height: var(--hybrid-select-large-height,var(--hybrid-select-local-large-height));
    font-size: var(--hybrid-select-large-font-size,var(--hybrid-select-local-large-font-size));
  }

  :host([size='small']) .option {
    padding: var(--hybrid-select-option-small-padding,var(--hybrid-select-local-option-small-padding,));
    font-size: var(--hybrid-select-small-font-size,var(--hybrid-select-local-small-font-size));
  }
  :host([size='large']) .option {
    padding: var(--hybrid-select-option-large-padding,var(--hybrid-select-local-option-large-padding,));
    font-size: var(--hybrid-select-large-font-size,var(--hybrid-select-local-large-font-size));
  }
  :host([status='error']) .wrapper {
    border: var(--hybrid-select-error-border,var(--hybrid-select-local-error-border));
  }
  :host([status='error']) ::slotted([slot='helper-text']) {
    color: var(--hybrid-select-error-helper-text,var(--hybrid-select-local-error-helper-text));
  }

  :host(:not([disabled])) .select-trigger:hover {
    background-color: var(--hybrid-select-hover-background-color,var(--hybrid-select-local-hover-background-color));
  }

  :host([disabled]) .wrapper {
    border: none;
    opacity: var(--hybrid-select-disabled-opacity,var(--hybrid-select-local-disabled-opacity));
    cursor: not-allowed;
  }
  :host([disabled]) ::slotted([slot='helper-text']),
  :host([disabled]) ::slotted([slot='label']) {
    opacity: var(--hybrid-select-disabled-opacity,var(--hybrid-select-local-disabled-opacity));
  }
  :host([show]) .options {
    display: flex;
  }
  :host([type='inline']) {
    display: flex;
    gap: var(--hybrid-select-inline-gap,var(--hybrid-select-local-inline-gap));
  }
  :host([type='inline']) ::slotted([slot='helper-text']),
  :host([type='inline']) ::slotted([slot='label']) {
    display: flex;
    align-items: center;
  }

  ::slotted([slot='helper-text']) {
    color: var(--hybrid-select-helper-text-color,var(--hybrid-select-local-helper-text-color));
    font-size:var(--hybrid-select-helper-text-font-size,var(--hybrid-select-local-helper-text-font-size))
  }

  ::slotted([slot='label']) {
    color: var(--hybrid-select-label-text-color,var(--hybrid-select-local-label-text-color));
    font-size:var(--hybrid-select-label-font-size,var(--hybrid-select-local-label-font-size))

  }
  :host {
    --hybrid-select-local-width: 100%;
    --hybrid-select-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
    --hybrid-select-local-background-color: #f4f4f4;
    --hybrid-select-local-hover-background-color: #e0e0e0;
    --hybrid-select-local-border-bottom: 1px solid #cccccc;
    --hybrid-select-local-border-top: 3px solid transparent;
    --hybrid-select-local-border-left: 2px solid transparent;
    --hybrid-select-local-border-right: 2px solid transparent;
    --hybrid-select-local-trigger-text-color: #161616;
    --hybrid-select-local-option-text-color: #161616;
    --hybrid-select-local-padding-left: 5px;
    --hybrid-select-local-option-padding-left: 3px;
    --hybrid-select-local-focus-border: 2px solid #0f62fe;
    --hybrid-select-local-options-background-color: #f4f4f4;
    --hybrid-select-local-border-radius: 2px;
      --hybrid-select-hover-local-border-radius: 0px;
    --hybrid-select-local-box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    --hybrid-select-local-max-height: 250px;
    --hybrid-select-local-option-medium-padding: 10px;
    --hybrid-select-local-option-large-padding: 12px;
    --hybrid-select-local-option-small-padding: 8px;
    --hybrid-select-local-option-padding-left: 17px;
    --hybrid-select-local-option-hover: #e0e0e0;
    --hybrid-select-local-icons-padding: 3px;
    --hybrid-select-local-icon-width: 14px;
    --hybrid-select-local-icon-unselect-one-width: 12px;
    --hybrid-select-local-small-height: 25px;
    --hybrid-select-local-medium-height: 35px;
    --hybrid-select-local-large-height: 45px;
    --hybrid-select-local-small-font-size: 12px;
    --hybrid-select-local-medium-font-size: 14px;
    --hybrid-select-local-large-font-size: 16px;
    --hybrid-select-local-error-border: 2px solid #da1e28;
    --hybrid-select-local-error-icon-color: #da1e28;
    --hybrid-select-local-warning-icon-color: #f0c300;
    --hybrid-select-local-error-helper-text: #da1e28;
    --hybrid-select-local-disabled-opacity: 0.5;
    --hybrid-select-local-inline-gap: 5px;
    --hybrid-select-local-helper-text-color: #a8a8a8;
    --hybrid-select-local-label-text-color: #a8a8a8;
    --hybrid-select-local-helper-text-font-size:13px;
    --hybrid-select-local-label-font-size:13px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-select-local-focus-border: 2px solid #ffffff;
      --hybrid-select-local-background-color: #393939;
      --hybrid-select-local-hover-background-color: #4c4c4c;
      --hybrid-select-local-options-background-color: #393939;
      --hybrid-select-local-option-hover: #4c4c4c;
      --hybrid-select-local-helper-text-color: #c6c6c6;
      --hybrid-select-local-label-text-color: #c6c6c6;
      --hybrid-select-local-border-bottom: 1px solid #6f6f6f;
      --hybrid-select-local-trigger-text-color: #f4f4f4;
      --hybrid-select-local-option-text-color: #f4f4f4;
    }
  }
`;
export const styles = selectStyle;
