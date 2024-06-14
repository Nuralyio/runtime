import {css} from 'lit';
import {styleVariables} from './variables.style';

const baseButtonStyle = css`
  #container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  :host([iconPosition='right']) #container {
    flex-direction: row-reverse;
  }

  hy-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2px;
  }

  button {
    height: var(--hybrid-button-height);
    width: var(--hybrid-button-width);
    border: var(--hybrid-button-border);
    background-color: var(--hybrid-button-background-color);
    color: var(--hybrid-button-text-color);
    font-size: var(--hybrid-button-font-size);
    font-weight: var(--hybrid-button-font-weight);
    text-transform: var(--hybrid-button-text-transform);
    padding-top: var(--hybrid-button-padding-y);
    padding-bottom: var(--hybrid-button-padding-y);
    padding-right: var(--hybrid-button-padding-x);
    padding-left: var(--hybrid-button-padding-x);
    font-size: var(--hybrid-button-font-size);
  }
  button hy-icon {
    --hybrid-icon-color: var(--hybrid-button-text-color);
  }

  button:hover:not(:disabled) {
    cursor: pointer;
    border-color: var(--hybrid-button-hover-border-color);
    color: var(--hybrid-button-hover-color);
  }
  button:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-hover-color);
  }

  button:active:not(:disabled) {
    outline: none;
    border-color: var(--hybrid-button-active-border-color);
    color: var(--hybrid-button-active-color);
  }
  button:active:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-active-color);
  }

  button:disabled {
    cursor: auto;
    background-color: var(--hybrid-button-disabled-background-color);
    color: var(--hybrid-button-disabled-text-color);
    border-color: var(--hybrid-button-disabled-border-color);
  }

  button[data-size='small'] {
    padding-top: var(--hybrid-small-button-padding-y);
    padding-bottom: var(--hybrid-small-button-padding-y);
    padding-right: var(--hybrid-small-button-padding-x);
    padding-left: var(--hybrid-small-button-padding-x);
    font-size: var(--hybrid-small-button-font-size);
  }

  button[data-size='large'] {
    padding-top: var(--hybrid-large-button-padding-y);
    padding-bottom: var(--hybrid-large-button-padding-y);
    padding-right: var(--hybrid-large-button-padding-x);
    padding-left: var(--hybrid-large-button-padding-x);
    font-size: var(--hybrid-large-button-font-size);
  }

  button[data-state='loading'] {
    opacity: 0.5;
  }
`;

const dangerButtonStyle = css`
  button[data-type='danger'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-danger-text-color);
  }
  button[data-type='danger'] {
    border-color: var(--hybrid-button-danger-border-color);
    background-color: var(--hybrid-button-danger-background-color);
    color: var(--hybrid-button-danger-text-color);
  }
  button[data-type='danger'].button-dashed {
    border-color: var(--hybrid-button-danger-dashed-border-color);
  }
  button[data-type='danger']:disabled {
    border-color: var(--hybrid-button-danger-disabled-border-color);
    background-color: var(--hybrid-button-danger-disabled-background-color);
    color: var(--hybrid-button-danger-disabled-text-color);
  }

  button[data-type='danger']:hover:not(:disabled) {
    background-color: var(--hybrid-button-danger-hover-background-color);
    border-color: var(--hybrid-button-danger-hover-border-color);
    color: var(--hybrid-button-danger-text-color);
  }
  button[data-type='danger']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-danger-text-color);
  }

  button[data-type='danger']:active:not(:disabled) {
    background-color: var(--hybrid-button-danger-active-background-color);
    border-color: var(--hybrid-button-danger-active-border-color);
    outline: var(--hybrid-button-danger-outline);
    outline-offset: var(--hybrid-button-danger-outline-offset);
  }
`;

const primaryButtonStyle = css`
  button[data-type='primary'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-primary-text-color);
  }
  button[data-type='primary'] {
    border-color: var(--hybrid-button-primary-border-color);
    background-color: var(--hybrid-button-primary-background-color);
    color: var(--hybrid-button-primary-text-color);
  }
  button[data-type='primary'].button-dashed {
    border-color: var(--hybrid-button-primary-dashed-border-color);
  }

  button[data-type='primary']:disabled {
    border-color: var(--hybrid-button-primary-disabled-border-color);
    background-color: var(--hybrid-button-primary-disabled-background-color);
    color: var(--hybrid-button-primary-disabled-text-color);
  }

  button[data-type='primary']:hover:not(:disabled) {
    background-color: var(--hybrid-button-primary-hover-background-color);
    border-color: var(--hybrid-button-primary-hover-border-color);
    color: var(--hybrid-button-primary-text-color);
  }
  button[data-type='primary']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-primary-text-color);
  }
  button[data-type='primary']:active:not(:disabled) {
    border-color: var(--hybrid-button-primary-active-border-color);
    background-color: var(--hybrid-button-primary-active-background-color);
    outline: var(--hybrid-button-primary-outline);
    outline-offset: var(--hybrid-button-primary-outline-offset);
  }
`;

const ghostButtonStyle = css`
  button[data-type='ghost'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-ghost-text-color);
  }
  button[data-type='ghost'] {
    background-color: var(--hybrid-button-ghost-background-color);
    color: var(--hybrid-button-ghost-text-color);
    border-color: var(--hybrid-button-ghost-border-color);
  }
  button[data-type='ghost'].button-dashed {
    border-color: var(--hybrid-button-ghost-dashed-border-color);
  }
  button[data-type='ghost']:disabled {
    background-color: var(--hybrid-button-ghost-disabled-background-color);
    color: var(--hybrid-button-ghost-disabled-text-color);
    border-color: var(--hybrid-button-ghost-disabled-border-color);
  }

  button[data-type='ghost']:hover:not(:disabled) {
    background-color: var(--hybrid-button-ghost-hover-background-color);
    color: var(--hybrid-button-ghost-hover-text-color);
    border-color: var(--hybrid-button-ghost-hover-border-color);
  }
  button[data-type='ghost']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-ghost-hover-text-color);
  }
  button[data-type='ghost']:active:not(:disabled) {
    background-color: var(--hybrid-button-ghost-active-background-color);
    border-color: var(--hybrid-button-ghost-active-border-color);
  }
`;

const secondaryButtonStyle = css`
  button[data-type='secondary'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-secondary-text-color);
  }
  button[data-type='secondary'] {
    background-color: var(--hybrid-button-secondary-background-color);
    color: var(--hybrid-button-secondary-text-color);
    border-color: var(--hybrid-button-secondary-border-color);
  }
  button[data-type='secondary'].button-dashed {
    border-color: var(--hybrid-button-secondary-dashed-border-color);
  }
  button[data-type='secondary']:disabled {
    background-color: var(--hybrid-button-secondary-disabled-background-color);
    color: var(--hybrid-button-secondary-disabled-text-color);
    border-color: var(--hybrid-button-secondary-disabled-border-color);
  }
  button[data-type='secondary']:hover:not(:disabled) {
    background-color: var(--hybrid-button-secondary-hover-background-color);
    color: var(--hybrid-button-secondary-text-color);
    border-color: var(--hybrid-button-secondary-hover-border-color);
  }
  button[data-type='secondary']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-secondary-text-color);
  }

  button[data-type='secondary']:active:not(:disabled) {
    background-color: var(--hybrid-button-secondary-active-background-color);
    border-color: var(--hybrid-button-secondary-active-border-color);
    outline: var(--hybrid-button-secondary-outline);
    outline-offset: var(--hybrid-button-secondary-outline-offset);
  }
`;

const buttonDashedStyle = css`
  .button-dashed {
    border-style: dashed;
  }
`;

export const styles = [
  baseButtonStyle,
  dangerButtonStyle,
  primaryButtonStyle,
  ghostButtonStyle,
  secondaryButtonStyle,
  buttonDashedStyle,
  styleVariables,
];
