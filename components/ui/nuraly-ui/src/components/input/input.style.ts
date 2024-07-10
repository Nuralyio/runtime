import {css} from 'lit';
import {styleVariables} from './variables.style';

const inputStyle = css`
  :host {
    display: flex;
    flex-direction: column;
    font-family: var(--hybrid-input-font-family);
  }

  :host > #input-container,
  #input-container > input {
    background-color: var(--hybrid-input-background-color);
  }

  :host([disabled]) > #input-container,
  :host([disabled]) > #input-container > input {
    background-color: var(--hybrid-input-disabled-background-color);
    cursor: not-allowed;
  }

  hy-icon {
    display: flex;
    align-items: center;
  }

  ::placeholder {
    color: var(--hybrid-input-placeholder-color);
    font-size: var(--hybrid-input-placeholder-font-size);
    font-family: var(--hybrid-input-font-family);
  }
  #warning-icon {
    --hybrid-icon-color: var(--hybrid-input-warning-icon-color);
  }
  #error-icon {
    --hybrid-icon-color: var(--hybrid-input-error-icon-color);
  }
  #calendar-icon {
    --hybrid-icon-color: var(--hybrid-input-calendar-icon-color);
  }
  #password-icon {
    padding-left: var(--hybrid-input-password-icon-padding-left);
    padding-right: var(--hybrid-input-password-icon-padding-right);
    cursor: pointer;
    --hybrid-icon-color: var(--hybrid-input-password-icon-color);
  }
  #copy-icon {
    padding-right: var(--hybrid-input-copy-icon-padding-right);
    --hybrid-icon-color: var(--hybrid-input-copy-icon-color);
    cursor: pointer;
  }
  #number-icons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: var(--hybrid-input-number-icons-container-width);
    padding-right: var(--hybrid-input-number-icons-container-padding-right);
  }
  #number-icons hy-icon {
    --hybrid-icon-color: var(--hybrid-input-number-icons-color);
    padding-left: var(--hybrid-input-number-icons-padding-left);
    padding-right: var(--hybrid-input-number-icons-padding-right);
    width: var(--hybrid-input-number-icons-width);
    height: var(--hybrid-input-number-icons-height);
  }

  :host([disabled]) #password-icon,
  :host([disabled]) #error-icon,
  :host([disabled]) #warning-icon,
  :host([disabled]) #number-icons,
  :host([disabled]) #calendar-icon,
  :host([disabled]) #copy-icon {
    opacity: var(--hybrid-input-disabled-icon-opacity);
  }

  :host(:not([disabled])[state='error']) > #input-container {
    border: var(--hybrid-input-error-border);
  }

  :host([state='error']) input[type='number'] ~ #number-icons,
  :host([state='warning']) input[type='number'] ~ #number-icons {
    position: static;
    padding-left: var(--hybrid-input-number-icons-container-padding-left);
  }

  :host([state='error']) ::slotted([slot='helper-text']) {
    color: var(--hybrid-input-error-helper-text-color);
  }

  :host([state='warning']) ::slotted([slot='helper-text']) {
    color: var(--hybrid-input-warning-helper-text-color);
  }

  :host(:not([state='error'])) > #input-container:focus-within {
    border: var(--hybrid-input-focus-border);
  }

  :host([disabled]) #password-icon,
  :host([disabled]) #number-icons,
  :host([disabled]) #copy-icon {
    cursor: not-allowed;
  }

  :host([disabled]) ::placeholder {
    color: var(--hybrid-input-disabled-placeholder-color);
  }

  /* Chrome, Safari, Edge, Opera */
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }

  #icons-separator {
    color: var(--hybrid-input-number-icons-sperator-color);
    padding-bottom: var(--hybrid-input-number-icons-sperator-padding-bottom);
    padding-left: var(--hybrid-input-number-icons-sperator-padding-left);
    padding-right: var(--hybrid-input-number-icons-sperator-padding-right);
  }

  #input-container {
    border-bottom: var(--hybrid-input-border-bottom);
    border-top: var(--hybrid-input-border-top);
    border-left: var(--hybrid-input-border-left);
    border-right: var(--hybrid-input-border-right);
    display: flex;
    position: relative;
  }

  :host([disabled]) #input-container {
    border-bottom: none;
  }

  input {
    width: 100%;
    border: none;
    outline: none;
    color: var(--hybrid-input-text-color);
  }

  ::slotted([slot='label']) {
    color: var(--hybrid-input-label-color);
    font-size: var(--hybrid-input-label-font-size);
    padding-bottom: var(--hybrid-input-label-padding-bottom);
  }

  ::slotted([slot='helper-text']) {
    color: var(--hybrid-input-helper-text-color);
    font-size: var(--hybrid-input-helper-text-font-size);
    padding-top: var(--hybrid-input-helper-text-padding-top);
  }

  :host([disabled]) ::slotted([slot='helper-text']) {
    color: var(--hybrid-input-disabled-helper-text-color);
  }

  :host([disabled]) ::slotted([slot='label']) {
    color: var(--hybrid-input-disabled-label-color);
  }
`;

const sizeInputStyle = css`
  div[data-size='large'] {
    padding-top: var(--hybrid-input-large-padding-top);
    padding-bottom: var(--hybrid-input-large-padding-bottom);
    padding-left: var(--hybrid-input-large-padding-left);
    padding-right: var(--hybrid-input-large-padding-right);
  }

  div[data-size='medium'] {
    padding-top: var(--hybrid-input-medium-padding-top);
    padding-bottom: var(--hybrid-input-medium-padding-bottom);
    padding-left: var(--hybrid-input-medium-padding-left);
    padding-right: var(--hybrid-input-medium-padding-right);
  }

  div[data-size='small'] {
    padding-top: var(--hybrid-input-small-padding-top);
    padding-bottom: var(--hybrid-input-small-padding-bottom);
    padding-left: var(--hybrid-input-small-padding-left);
    padding-right: var(--hybrid-input-small-padding-right);
  }
`;
export const styles = [inputStyle, sizeInputStyle, styleVariables];
