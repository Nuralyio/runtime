import { css } from 'lit';
import { styleVariables } from './checkbox.style.variables.js';

const checkBoxStyles = css`
  :host {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--nuraly-checkbox-gap, var(--nuraly-checkbox-local-gap));
    font-family: var(--nuraly-checkbox-font-family, var(--nuraly-checkbox-local-font-family));
    color: var(--nuraly-checkbox-color, var(--nuraly-checkbox-local-color));
  }

  :host(:not([checked]):not([indeterminate]):not([disabled])) input {
    background-color: var(--nuraly-checkbox-empty-background-color, var(--nuraly-checkbox-local-empty-background-color));
    border: var(--nuraly-checkbox-empty-border, var(--nuraly-checkbox-local-empty-border));
  }

  :host(:not([disabled])[checked]) input,
  :host(:not([disabled])[indeterminate]) input {
    background-color: var(--nuraly-checkbox-filled-background-color, var(--nuraly-checkbox-local-filled-background-color));
  }
  :host([disabled]) {
    color: var(--nuraly-checkbox-disabled-text-color, var(--nuraly-checkbox-local-disabled-text-color));
  }
  :host([disabled]) input {
    background-color: var(--nuraly-checkbox-disabled-background-color, var(--nuraly-checkbox-local-disabled-background-color));
    cursor: not-allowed;
  }
  input {
    appearance: none;
    width: var(--nuraly-checkbox-medium-width, var(--nuraly-checkbox-local-medium-width));
    height: var(--nuraly-checkbox-medium-height, var(--nuraly-checkbox-local-medium-height));
    cursor: pointer;
    position: relative;
    border-radius: var(--nuraly-checkbox-border-radius, var(--nuraly-checkbox-local-border-radius));
  }
  input:after {
    color: var(--nuraly-checkbox-symbol-color, var(--nuraly-checkbox-local-symbol-color));
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -51%);
  }
  input:focus {
    border: var(--nuraly-checkbox-focus-border, var(--nuraly-checkbox-local-focus-border));
    outline: var(--nuraly-checkbox-focus-outline, var(--nuraly-checkbox-local-focus-outline));
  }
  :host([size='large']) input {
    width: var(--nuraly-checkbox-large-width, var(--nuraly-checkbox-local-large-width));
    height: var(--nuraly-checkbox-large-height, var(--nuraly-checkbox-local-large-height));
  }
  :host([size='small']) input {
    width: var(--nuraly-checkbox-small-width, var(--nuraly-checkbox-local-small-width));
    height: var(--nuraly-checkbox-small-height, var(--nuraly-checkbox-local-small-height));
  }

  :host([indeterminate][size='medium']) input:after {
    font-size: var(--nuraly-checkbox-medium-indeterminate-size, var(--nuraly-checkbox-local-medium-indeterminate-size));
  }
  :host([indeterminate][size='large']) input:after {
    font-size: var(--nuraly-checkbox-large-indeterminate-size, var(--nuraly-checkbox-local-large-indeterminate-size));
  }

  :host([indeterminate][size='small']) input:after {
    font-size: var(--nuraly-checkbox-small-indeterminate-size, var(--nuraly-checkbox-local-small-indeterminate-size));
  }

  :host([checked]) input:after {
    border: solid;
    border-width: 0 2px 2px 0;
    transform: translate(-50%, -51%) rotate(45deg);
    content: '';
  }
  :host([checked][size='small']) input:after {
    width: var(--nuraly-checkbox-small-checked-width, var(--nuraly-checkbox-local-small-checked-width));
    height: var(--nuraly-checkbox-small-checked-height, var(--nuraly-checkbox-local-small-checked-height));
  }
  :host([checked][size='large']) input:after {
    width: var(--nuraly-checkbox-large-checked-width, var(--nuraly-checkbox-local-large-checked-width));
    height: var(--nuraly-checkbox-large-checked-height, var(--nuraly-checkbox-local-large-checked-height));
  }
  :host([checked][size='medium']) input:after {
    width: var(--nuraly-checkbox-medium-checked-width, var(--nuraly-checkbox-local-medium-checked-width));
    height: var(--nuraly-checkbox-medium-checked-height, var(--nuraly-checkbox-local-medium-checked-height));
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
    --nuraly-checkbox-local-empty-border: 1px solid #ffffff;
    --nuraly-checkbox-local-empty-background-color: #161616;
    --nuraly-checkbox-local-filled-background-color: #ffffff;
    --nuraly-checkbox-local-symbol-color: #161616;
    --nuraly-checkbox-local-focus-outline: 2px solid #ffffff;
    --nuraly-checkbox-local-focus-border: 2px solid #161616;
    --nuraly-checkbox-local-disabled-background-color: #6f6f6f;
    --nuraly-checkbox-local-disabled-text-color: #6f6f6f;
  }

  :host([data-theme="dark"]) {
    --nuraly-checkbox-local-color: #ffffff;
  }
`;
export const styles = [checkBoxStyles, styleVariables];
