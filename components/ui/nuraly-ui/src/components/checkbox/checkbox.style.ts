import {css} from 'lit';
import {styleVariables} from './checkbox.style.variables.js';

const checkBoxStyles = css`
  :host {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--hybrid-checkbox-gap, var(--hybrid-checkbox-local-gap));
    font-family: var(--hybrid-checkbox-font-family, var(--hybrid-checkbox-local-font-family));
    color: var(--hybrid-checkbox-color, var(--hybrid-checkbox-local-color));
  }

  :host(:not([checked]):not([indeterminate]):not([disabled])) input {
    background-color: var(--hybrid-checkbox-empty-background-color, var(--hybrid-checkbox-local-empty-background-color));
    border: var(--hybrid-checkbox-empty-border, var(--hybrid-checkbox-local-empty-border));
  }

  :host(:not([disabled])[checked]) input,
  :host(:not([disabled])[indeterminate]) input {
    background-color: var(--hybrid-checkbox-filled-background-color, var(--hybrid-checkbox-local-filled-background-color));
  }
  :host([disabled]) {
    color: var(--hybrid-checkbox-disabled-text-color, var(--hybrid-checkbox-local-disabled-text-color));
  }
  :host([disabled]) input {
    background-color: var(--hybrid-checkbox-disabled-background-color, var(--hybrid-checkbox-local-disabled-background-color));
    cursor: not-allowed;
  }
  input {
    appearance: none;
    width: var(--hybrid-checkbox-medium-width, var(--hybrid-checkbox-local-medium-width));
    height: var(--hybrid-checkbox-medium-height, var(--hybrid-checkbox-local-medium-height));
    cursor: pointer;
    position: relative;
    border-radius: var(--hybrid-checkbox-border-radius, var(--hybrid-checkbox-local-border-radius));
  }
  input:after {
    color: var(--hybrid-checkbox-symbol-color, var(--hybrid-checkbox-local-symbol-color));
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -51%);
  }
  input:focus {
    border: var(--hybrid-checkbox-focus-border, var(--hybrid-checkbox-local-focus-border));
    outline: var(--hybrid-checkbox-focus-outline, var(--hybrid-checkbox-local-focus-outline));
  }
  :host([size='large']) input {
    width: var(--hybrid-checkbox-large-width, var(--hybrid-checkbox-local-large-width));
    height: var(--hybrid-checkbox-large-height, var(--hybrid-checkbox-local-large-height));
  }
  :host([size='small']) input {
    width: var(--hybrid-checkbox-small-width, var(--hybrid-checkbox-local-small-width));
    height: var(--hybrid-checkbox-small-height, var(--hybrid-checkbox-local-small-height));
  }

  :host([indeterminate][size='medium']) input:after {
    font-size: var(--hybrid-checkbox-medium-indeterminate-size, var(--hybrid-checkbox-local-medium-indeterminate-size));
  }
  :host([indeterminate][size='large']) input:after {
    font-size: var(--hybrid-checkbox-large-indeterminate-size, var(--hybrid-checkbox-local-large-indeterminate-size));
  }

  :host([indeterminate][size='small']) input:after {
    font-size: var(--hybrid-checkbox-small-indeterminate-size, var(--hybrid-checkbox-local-small-indeterminate-size));
  }

  :host([checked]) input:after {
    border: solid;
    border-width: 0 2px 2px 0;
    transform: translate(-50%, -51%) rotate(45deg);
    content: '';
  }
  :host([checked][size='small']) input:after {
    width: var(--hybrid-checkbox-small-checked-width, var(--hybrid-checkbox-local-small-checked-width));
    height: var(--hybrid-checkbox-small-checked-height, var(--hybrid-checkbox-local-small-checked-height));
  }
  :host([checked][size='large']) input:after {
    width: var(--hybrid-checkbox-large-checked-width, var(--hybrid-checkbox-local-large-checked-width));
    height: var(--hybrid-checkbox-large-checked-height, var(--hybrid-checkbox-local-large-checked-height));
  }
  :host([checked][size='medium']) input:after {
    width: var(--hybrid-checkbox-medium-checked-width, var(--hybrid-checkbox-local-medium-checked-width));
    height: var(--hybrid-checkbox-medium-checked-height, var(--hybrid-checkbox-local-medium-checked-height));
  }

  :host([indeterminate]:not([checked])) input:after {
    content: '-';
  }
  :host(:not([checked]):not([indeterminate])) input:after {
    content: '';
  }

  /* ========================================
   * DARK THEME OVERRIDES
   * ========================================
   * Dark theme styles using data-theme attribute on input element
   * These override the light theme defaults when data-theme="dark" is applied
   */
  input[data-theme="dark"] {
    --hybrid-checkbox-local-empty-border: 1px solid #ffffff;
    --hybrid-checkbox-local-empty-background-color: #161616;
    --hybrid-checkbox-local-filled-background-color: #ffffff;
    --hybrid-checkbox-local-symbol-color: #161616;
    --hybrid-checkbox-local-focus-outline: 2px solid #ffffff;
    --hybrid-checkbox-local-focus-border: 2px solid #161616;
    --hybrid-checkbox-local-disabled-background-color: #6f6f6f;
    --hybrid-checkbox-local-disabled-text-color: #6f6f6f;
  }

  :host([data-theme="dark"]) {
    --hybrid-checkbox-local-color: #ffffff;
  }
`;
export const styles = [checkBoxStyles, styleVariables];
