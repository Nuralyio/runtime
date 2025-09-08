import {css} from 'lit';
import {styleVariables} from './checkbox.style.variables.js';

const checkBoxStyles = css`
  :host {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--hybrid-checkbox-gap);
    font-family: var(--hybrid-checkbox-font-family);
    color: var(--hybrid-checkbox-color);
  }

  :host(:not([checked]):not([indeterminate]):not([disabled])) input {
    background-color: var(--hybrid-checkbox-empty-background-color);
    border: var(--hybrid-checkbox-empty-border);
  }

  :host(:not([disabled])[checked]) input,
  :host(:not([disabled])[indeterminate]) input {
    background-color: var(--hybrid-checkbox-filled-background-color);
  }
  :host([disabled]) {
    color: var(--hybrid-checkbox-disabled-text-color);
  }
  :host([disabled]) input {
    background-color: var(--hybrid-checkbox-disabled-background-color);
    cursor: not-allowed;
  }
  input {
    appearance: none;
    width: var(--hybrid-checkbox-medium-width);
    height: var(--hybrid-checkbox-medium-height);
    cursor: pointer;
    position: relative;
    border-radius: var(--hybrid-checkbox-border-radius);
  }
  input:after {
    color: var(--hybrid-checkbox-symbol-color);
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -51%);
  }
  input:focus {
    border: var(--hybrid-checkbox-focus-border);
    outline: var(--hybrid-checkbox-focus-outline);
  }
  :host([size='large']) input {
    width: var(--hybrid-checkbox-large-width);
    height: var(--hybrid-checkbox-large-height);
  }
  :host([size='small']) input {
    width: var(--hybrid-checkbox-small-width);
    height: var(--hybrid-checkbox-small-height);
  }

  :host([indeterminate][size='medium']) input:after {
    font-size: var(--hybrid-checkbox-medium-indeterminate-size);
  }
  :host([indeterminate][size='large']) input:after {
    font-size: var(--hybrid-checkbox-large-indeterminate-size);
  }

  :host([indeterminate][size='small']) input:after {
    font-size: var(--hybrid-checkbox-small-indeterminate-size);
  }

  :host([checked]) input:after {
    border: solid;
    border-width: 0 2px 2px 0;
    transform: translate(-50%, -51%) rotate(45deg);
    content: '';
  }
  :host([checked][size='small']) input:after {
    width: var(--hybrid-checkbox-small-checked-width);
    height: var(--hybrid-checkbox-small-checked-height);
  }
  :host([checked][size='large']) input:after {
    width: var(--hybrid-checkbox-large-checked-width);
    height: var(--hybrid-checkbox-large-checked-height);
  }
  :host([checked][size='medium']) input:after {
    width: var(--hybrid-checkbox-medium-checked-width);
    height: var(--hybrid-checkbox-medium-checked-height);
  }

  :host([indeterminate]:not([checked])) input:after {
    content: '-';
  }
  :host(:not([checked]):not([indeterminate])) input:after {
    content: '';
  }
`;
export const styles = [checkBoxStyles, styleVariables];
