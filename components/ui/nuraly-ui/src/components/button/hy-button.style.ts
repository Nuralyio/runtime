import {css} from 'lit';

const buttonStyles = css`
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
    border-left: var(--hybrid-button-border-left);
    border-right: var(--hybrid-button-border-right);
    border-top: var(--hybrid-button-border-top);
    border-bottom: var(--hybrid-button-border-bottom);
    border-top-left-radius: var(--hybrid-button-border-top-left-radius);
    border-top-right-radius: var(--hybrid-button-border-top-right-radius);
    border-bottom-left-radius: var(--hybrid-button-border-bottom-left-radius);
    border-bottom-right-radius: var(--hybrid-button-border-bottom-right-radius);
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
  .button-dashed {
    border-style: dashed;
  }
  :host {
    /* Default Button Style */
    --hybrid-button-border-top: 2px solid #d0d0d0;
    --hybrid-button-border-bottom: 2px solid #d0d0d0;
    --hybrid-button-border-left: 2px solid #d0d0d0;
    --hybrid-button-border-right: 2px solid #d0d0d0;
    --hybrid-button-border-top-left-radius: 0px;
    --hybrid-button-border-top-right-radius: 0px;
    --hybrid-button-border-bottom-left-radius: 0px;
    --hybrid-button-border-bottom-right-radius: 0px;
    --hybrid-button-background-color: #f9f9f9;
    --hybrid-button-text-color: #393939;
    --hybrid-button-hover-border-color: #1677ff;
    --hybrid-button-hover-color: #1677ff;
    --hybrid-button-font-size: 0.9rem;
    --hybrid-button-font-weight: normal;
    --hybrid-button-text-transform: none;
    --hybrid-button-active-border-color: #1661b1;
    --hybrid-button-active-color: #184d86;
    --hybrid-button-disabled-background-color: #c6c6c6;
    --hybrid-button-disabled-text-color: #8d8d8d;
    --hybrid-button-disabled-border-color: #bbb;
    --hybrid-button-height: auto;
    --hybrid-button-width: auto;
    --hybrid-button-padding-y: 0.5rem;
    --hybrid-button-padding-x: 0.6rem;

    /* Primary Button Style */
    --hybrid-button-primary-border-color: #0f62fe;
    --hybrid-button-primary-background-color: #0f62fe;
    --hybrid-button-primary-text-color: #ffffff;
    --hybrid-button-primary-outline: 1px solid white;
    --hybrid-button-primary-outline-offset: -3px;
    --hybrid-button-primary-hover-background-color: #0353e9;
    --hybrid-button-primary-hover-border-color: #0353e9;
    --hybrid-button-primary-active-background-color: #0f62fe;
    --hybrid-button-primary-active-border-color: #0f62fe;
    --hybrid-button-primary-disabled-text-color: #8d8d8d;
    --hybrid-button-primary-disabled-background-color: #c6c6c6;
    --hybrid-button-primary-disabled-border-color: #c6c6c6;
    --hybrid-button-primary-dashed-border-color: #ffffff;

    /* Danger button style */
    --hybrid-button-danger-background-color: #da1e28;
    --hybrid-button-danger-text-color: #ffffff;
    --hybrid-button-danger-border-color: #da1e28;
    --hybrid-button-danger-outline: 1px solid white;
    --hybrid-button-danger-outline-offset: -3px;
    --hybrid-button-danger-hover-background-color: #ba1b23;
    --hybrid-button-danger-hover-border-color: #ba1b23;
    --hybrid-button-danger-active-background-color: #da1e28;
    --hybrid-button-danger-active-border-color: #0f62fe;
    --hybrid-button-danger-disabled-background-color: #c6c6c6;
    --hybrid-button-danger-disabled-text-color: #8d8d8d;
    --hybrid-button-danger-disabled-border-color: #c6c6c6;
    --hybrid-button-danger-dashed-border-color: #ffffff;

    /* Ghost button style */
    --hybrid-button-ghost-background-color: #ffffff;
    --hybrid-button-ghost-text-color: #0f62fe;
    --hybrid-button-ghost-border-color: #ffffff;
    --hybrid-button-ghost-active-background-color: #ffffff;
    --hybrid-button-ghost-active-text-color: #054ada;
    --hybrid-button-ghost-active-border-color: #0f62fe;
    --hybrid-button-ghost-hover-background-color: #e5e5e5;
    --hybrid-button-ghost-hover-border-color: #e5e5e5;
    --hybrid-button-ghost-hover-text-color: #054ada;
    --hybrid-button-ghost-disabled-background-color: #ffffff;
    --hybrid-button-ghost-disabled-text-color: #c6c6c6;
    --hybrid-button-ghost-disabled-border-color: #ffffff;
    --hybrid-button-ghost-dashed-border-color: #c6c6c6;

    /* Secondary button style */

    --hybrid-button-secondary-background-color: #393939;
    --hybrid-button-secondary-border-color: #393939;
    --hybrid-button-secondary-text-color: #ffffff;
    --hybrid-button-secondary-outline: 1px solid white;
    --hybrid-button-secondary-outline-offset: -3px;
    --hybrid-button-secondary-hover-background-color: #4c4c4c;
    --hybrid-button-secondary-hover-border-color: #4c4c4c;
    --hybrid-button-secondary-active-background-color: #393939;
    --hybrid-button-secondary-active-border-color: #0f62fe;
    --hybrid-button-secondary-disabled-background-color: #c6c6c6;
    --hybrid-button-secondary-disabled-text-color: #8d8d8d;
    --hybrid-button-secondary-disabled-border-color: #c6c6c6;
    --hybrid-button-secondary-dashed-border-color: #ffffff;

    /* Sizes */

    --hybrid-large-button-padding-y: 0.5rem;
    --hybrid-large-button-padding-x: 0.9rem;
    --hybrid-large-button-font-size: 1rem;

    --hybrid-small-button-padding-y: 0.5rem;
    --hybrid-small-button-padding-x: 0.4rem;
    --hybrid-small-button-font-size: 0.7rem;
  }

  @media (prefers-color-scheme: dark) {
    :host { 

      --hybrid-button-background-color: #000000;
      --hybrid-button-text-color: #ffffff;
      --hybrid-button-hover-border-color: #6f6f6f;
      --hybrid-button-hover-color: #6f6f6f;
      --hybrid-button-active-border-color: #c6c6c6;
      --hybrid-button-active-color: #c6c6c6;
      --hybrid-button-disabled-background-color: #c6c6c6;
  
      /* Primary button style */
      --hybrid-button-primary-outline: 1px solid black;
      --hybrid-button-primary-outline-offset: -3px;
      --hybrid-button-primary-active-border-color: #ffffff;
      --hybrid-button-primary-disabled-text-color: #c6c6c6;
      --hybrid-button-primary-disabled-background-color: #8d8d8d;
      --hybrid-button-primary-disabled-border-color: #8d8d8d;
  
      /* Secondary button style */
      --hybrid-button-secondary-background-color: #6f6f6f;
      --hybrid-button-secondary-border-color: #6f6f6f;
      --hybrid-button-secondary-text-color: #ffffff;
      --hybrid-button-secondary-active-border-color: #ffffff;
      --hybrid-button-secondary-active-background-color: #6f6f6f;
      --hybrid-button-secondary-outline: 1px solid black;
      --hybrid-button-secondary-outline-offset: -3px;
      --hybrid-button-secondary-hover-background-color: #606060;
      --hybrid-button-secondary-hover-border-color: #606060;
      --hybrid-button-secondary-disabled-background-color: #6f6f6f;
      --hybrid-button-secondary-disabled-text-color: #8d8d8d;
      --hybrid-button-secondary-disabled-border-color: #6f6f6f;
      --hybrid-button-secondary-dashed-border-color: #ffffff;
  
      /* Ghost button style */
      --hybrid-button-ghost-background-color: transparent;
      --hybrid-button-ghost-text-color: #78a9ff;
      --hybrid-button-ghost-border-color: transparent;
      --hybrid-button-ghost-active-background-color: transparent;
      --hybrid-button-ghost-active-text-color: #a6c8ff;
      --hybrid-button-ghost-active-border-color: #ffffff;
      --hybrid-button-ghost-hover-background-color: #4c4c4c;
      --hybrid-button-ghost-hover-border-color: #4c4c4c;
      --hybrid-button-ghost-hover-text-color: #a6c8ff;
      --hybrid-button-ghost-disabled-background-color: transparent;
      --hybrid-button-ghost-disabled-text-color: #6f6f6f;
      --hybrid-button-ghost-disabled-border-color: transparent;
      --hybrid-button-ghost-dashed-border-color: #c6c6c6;
  
      /* Danger button style */
      --hybrid-button-danger-outline: 1px solid #000000;
      --hybrid-button-danger-outline-offset: -3px;
      --hybrid-button-danger-hover-background-color: #ba1b23;
      --hybrid-button-danger-hover-border-color: #ba1b23;
      --hybrid-button-danger-active-background-color: #da1e28;
      --hybrid-button-danger-active-border-color: #ffffff;
      --hybrid-button-danger-disabled-background-color: #6f6f6f;
      --hybrid-button-danger-disabled-text-color: #8d8d8d;
      --hybrid-button-danger-disabled-border-color: #6f6f6f;
      --hybrid-button-danger-dashed-border-color: #ffffff;
     
    }
  }
`;

export const styles = [buttonStyles];
