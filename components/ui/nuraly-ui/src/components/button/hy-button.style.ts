import {css} from 'lit';

const buttonStyles = css`
  #container {
    display: flex;
    justify-content: center;
    align-items: center;
    width:100%;
    height:100%;
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
    height: var(--hybrid-button-height,var(--hybrid-button-local-height));
    width: var(--hybrid-button-width,var(--hybrid-button-local-width));
    border-left: var(--hybrid-button-border-left,var(--hybrid-button-local-border-left));
    border-right: var(--hybrid-button-border-right,var(--hybrid-button-local-border-right));
    border-top: var(--hybrid-button-border-top,var(--hybrid-button-local-border-top));
    border-bottom: var(--hybrid-button-border-bottom,var(--hybrid-button-local-border-bottom));
    border-top-left-radius:var(--hybrid-button-border-top-left-radius,var(--hybrid-button-local-border-top-left-radius)) ;
    border-top-right-radius: var(--hybrid-button-border-top-right-radius,var(--hybrid-button-local-border-top-right-radius));
    border-bottom-left-radius: var(--hybrid-button-border-bottom-left-radius,var(--hybrid-button-local-border-bottom-left-radius));
    border-bottom-right-radius: var(--hybrid-button-border-bottom-right-radius,var(--hybrid-button-local-border-bottom-right-radius));
    background-color: var(--hybrid-button-background-color,var(--hybrid-button-local-background-color));
    color: var(--hybrid-button-text-color,var(--hybrid-button-local-text-color));
    font-size: var(--hybrid-button-font-size,var(--hybrid-button-local-font-size));
    font-weight: var(--hybrid-button-font-weight,var(--hybrid-button-local-font-weight));
    text-transform: var(--hybrid-button-text-transform,var(--hybrid-button-local-text-transform));
    padding-top: var(--hybrid-button-padding-y,var(--hybrid-button-local-padding-y));
      margin-top: var(--hybrid-button-margin-y,var(--hybrid-button-local-margin-y));
    padding-bottom: var(--hybrid-button-padding-y,var(--hybrid-button-local-padding-y));
    padding-right: var(--hybrid-button-padding-x,var(--hybrid-button-local-padding-x));
    padding-left: var(--hybrid-button-padding-x,var(--hybrid-button-local-padding-x));
    font-size: var(--hybrid-button-font-size,var(--hybrid-button-local-font-size));
  }
  button hy-icon {
    --hybrid-icon-color: var(--hybrid-button-text-color,var(--hybrid-button-local-text-color));
    --hybrid-icon-width: var(--hybrid-button-icon-width,var(--hybrid-button-local-icon-width));
    --hybrid-icon-height: var(--hybrid-button-icon-height,var(--hybrid-button-local-icon-height));

  }

  button:hover:not(:disabled) {
    cursor: pointer;
    border-color: var(--hybrid-button-hover-border-color,var(--hybrid-button-local-hover-border-color));
    color: var(--hybrid-button-hover-color,var(--hybrid-button-local-hover-color));
  }
  button:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-hover-color,var(--hybrid-button-local-hover-color));
  }

  button:active:not(:disabled) {
    outline: none;
    border-color: var(--hybrid-button-active-border-color,var(--hybrid-button-local-active-border-color));
    color: var(--hybrid-button-active-color,var(--hybrid-button-local-active-color));
  }
  button:active:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-active-color,var(--hybrid-button-local-active-color));
  }

  button:disabled {
    cursor: auto;
    background-color: var(--hybrid-button-disabled-background-color,var(--hybrid-button-local-disabled-background-color));
    color: var(--hybrid-button-disabled-text-color,var(--hybrid-button-local-disabled-text-color));
    border-color: var(--hybrid-button-disabled-border-color,var(--hybrid-button-local-disabled-border-color));
  }

  button[data-size='small'] {
    padding-top: var(--hybrid-small-button-padding-y,var(--hybrid-small-button-local-padding-y));
    padding-bottom: var(--hybrid-small-button-padding-y,var(--hybrid-small-button-local-padding-y));
    padding-right: var(--hybrid-small-button-padding-x,var(--hybrid-small-button-local-padding-x));
    padding-left: var(--hybrid-small-button-padding-x,var(--hybrid-small-button-local-padding-x));
    font-size: var(--hybrid-small-button-font-size,var(--hybrid-small-button-local-font-size));
  }

  button[data-size='large'] {
    padding-top: var(--hybrid-large-button-padding-y,var(--hybrid-large-button-local-padding-y));
    padding-bottom: var(--hybrid-large-button-padding-y,var(--hybrid-large-button-local-padding-y));
    padding-right: var(--hybrid-large-button-padding-x,var(--hybrid-large-button-local-padding-x));
    padding-left: var(--hybrid-large-button-padding-x,var(--hybrid-large-button-local-padding-x));
    font-size: var(--hybrid-large-button-font-size,var(--hybrid-large-button-local-font-size));
  }

  button[data-state='loading'] {
    opacity: 0.5;
  }
  button[data-type='danger'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-danger-text-color,var(--hybrid-button-local-danger-text-color));
  }
  button[data-type='danger'] {
    border-color: var(--hybrid-button-danger-border-color,var(--hybrid-button-local-danger-border-color));
    background-color: var(--hybrid-button-danger-background-color,var(--hybrid-button-local-danger-background-color));
    color: var(--hybrid-button-danger-text-color,var(--hybrid-button-local-danger-text-color));
  }
  button[data-type='danger'].button-dashed {
    border-color: var(--hybrid-button-danger-dashed-border-color,var(--hybrid-button-local-danger-dashed-border-color));
  }
  button[data-type='danger']:disabled {
    border-color: var(--hybrid-button-danger-disabled-border-color,var(--hybrid-button-local-danger-disabled-border-color));
    background-color: var(--hybrid-button-danger-disabled-background-color,var(--hybrid-button-local-danger-disabled-background-color));
    color: var(--hybrid-button-danger-disabled-text-color,var(--hybrid-button-local-danger-disabled-text-color));
  }

  button[data-type='danger']:hover:not(:disabled) {
    background-color: var(--hybrid-button-danger-hover-background-color,var(--hybrid-button-local-danger-hover-background-color));
    border-color: var(--hybrid-button-danger-hover-border-color,var(--hybrid-button-local-danger-hover-border-color));
    color: var(--hybrid-button-danger-text-color,var(--hybrid-button-local-danger-text-color));
  }
  button[data-type='danger']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-danger-text-color,var(--hybrid-button-local-danger-text-color));
  }

  button[data-type='danger']:active:not(:disabled) {
    background-color: var(--hybrid-button-danger-active-background-color,var(--hybrid-button-local-danger-active-background-color));
    border-color: var(--hybrid-button-danger-active-border-color,var(--hybrid-button-local-danger-active-border-color));
    outline: var(--hybrid-button-danger-outline,var(--hybrid-button-local-danger-outline));
    outline-offset: var(--hybrid-button-danger-outline-offset,var(--hybrid-button-local-danger-outline-offset));
  }
  button[data-type='primary'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
  }
  button[data-type='primary'] {
    border-color: var(--hybrid-button-primary-border-color,var(--hybrid-button-local-primary-border-color));
    background-color: var(--hybrid-button-primary-background-color,var(--hybrid-button-local-primary-background-color));
    color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
  }
  button[data-type='primary'].button-dashed {
    border-color: var(--hybrid-button-primary-dashed-border-color,var(--hybrid-button-local-primary-dashed-border-color));
  }

  button[data-type='primary']:disabled {
    border-color: var(--hybrid-button-primary-disabled-border-color,var(--hybrid-button-local-primary-disabled-border-color));
    background-color: var(--hybrid-button-primary-disabled-background-color,var(--hybrid-button-local-primary-disabled-background-color));
    color: var(--hybrid-button-primary-disabled-text-color,var(--hybrid-button-local-primary-disabled-text-color));
  }

  button[data-type='primary']:hover:not(:disabled) {
    background-color: var(--hybrid-button-primary-hover-background-color,var(--hybrid-button-local-primary-hover-background-color));
    border-color: var(--hybrid-button-primary-hover-border-color,var(--hybrid-button-local-primary-hover-border-color));
    color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
  }
  button[data-type='primary']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-primary-text-color,var(--hybrid-button-local-primary-text-color));
  }
  button[data-type='primary']:active:not(:disabled) {
    border-color: var(--hybrid-button-primary-active-border-color,var(--hybrid-button-local-primary-active-border-color));
    background-color: var(--hybrid-button-primary-active-background-color,var(--hybrid-button-local-primary-active-background-color));
    outline: var(--hybrid-button-primary-outline,var(--hybrid-button-local-primary-outline));
    outline-offset: var(--hybrid-button-primary-outline-offset,var(--hybrid-button-local-primary-outline-offset));
  }
  button[data-type='ghost'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-ghost-text-color,var(--hybrid-button-local-ghost-text-color));
  }
  button[data-type='ghost'] {
    background-color: var(--hybrid-button-ghost-background-color,var(--hybrid-button-local-ghost-background-color));
    color: var(--hybrid-button-ghost-text-color,var(--hybrid-button-local-ghost-text-color));
    border-color: var(--hybrid-button-ghost-border-color,var(--hybrid-button-local-ghost-border-color));
  }
  button[data-type='ghost'].button-dashed {
    border-color: var(--hybrid-button-ghost-dashed-border-color,var(--hybrid-button-local-ghost-dashed-border-color));
  }
  button[data-type='ghost']:disabled {
    background-color: var(--hybrid-button-ghost-disabled-background-color,var(--hybrid-button-local-ghost-disabled-background-color));
    color: var(--hybrid-button-ghost-disabled-text-color,var(--hybrid-button-local-ghost-disabled-text-color));
    border-color: var(--hybrid-button-ghost-disabled-border-color,var(--hybrid-button-local-ghost-disabled-border-color));
  }

  button[data-type='ghost']:hover:not(:disabled) {
    background-color: var(--hybrid-button-ghost-hover-background-color,var(--hybrid-button-local-ghost-hover-background-color));
    color: var(--hybrid-button-ghost-hover-text-color,var(--hybrid-button-local-ghost-hover-text-color));
    border-color: var(--hybrid-button-local-ghost-hover-border-color,var(--hybrid-button-local-ghost-hover-border-color));
  }
  button[data-type='ghost']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-ghost-hover-text-color,var(--hybrid-button-local-ghost-hover-text-color));
  }
  button[data-type='ghost']:active:not(:disabled) {
    background-color: var(--hybrid-button-ghost-active-background-color,var(--hybrid-button-local-ghost-active-background-color));
    border-color: var(--hybrid-button-ghost-active-border-color,var(--hybrid-button-local-ghost-active-border-color));
  }
  button[data-type='secondary'] hy-icon {
    --hybrid-icon-color: var(--hybrid-button-secondary-text-color,var(--hybrid-button-local-secondary-text-color));
  }
  button[data-type='secondary'] {
    background-color: var(--hybrid-button-secondary-background-color,var(--hybrid-button-local-secondary-background-color));
    color: var(--hybrid-button-secondary-text-color,var(--hybrid-button-local-secondary-text-color));
    border-color: var(--hybrid-button-secondary-border-color,var(--hybrid-button-local-secondary-border-color));
  }
  button[data-type='secondary'].button-dashed {
    border-color: var(--hybrid-button-secondary-dashed-border-color,var(--hybrid-button-local-secondary-dashed-border-color));
  }
  button[data-type='secondary']:disabled {
    background-color: var(--hybrid-button-secondary-disabled-background-color,var(--hybrid-button-local-secondary-disabled-background-color));
    color: var(--hybrid-button-secondary-disabled-text-color,var(--hybrid-button-local-secondary-disabled-text-color));
    border-color: var(--hybrid-button-secondary-disabled-border-color,var(--hybrid-button-local-secondary-disabled-border-color));
  }
  button[data-type='secondary']:hover:not(:disabled) {
    background-color: var(--hybrid-button-secondary-hover-background-color,var(--hybrid-button-local-secondary-hover-background-color));
    color: var(--hybrid-button-secondary-text-color,var(--hybrid-button-local-secondary-text-color));
    border-color: var(--hybrid-button-secondary-hover-border-color,var(--hybrid-button-local-secondary-hover-border-color));
  }
  button[data-type='secondary']:hover:not(:disabled) hy-icon {
    --hybrid-icon-color: var(--hybrid-button-secondary-text-color,var(--hybrid-button-local-secondary-text-color));
  }

  button[data-type='secondary']:active:not(:disabled) {
    background-color: var(--hybrid-button-secondary-active-background-color,var(--hybrid-button-local-secondary-active-background-color));
    border-color: var(--hybrid-button-secondary-active-border-color,var(--hybrid-button-local-secondary-active-border-color));
    outline: var(--hybrid-button-secondary-outline,var(--hybrid-button-local-secondary-outline));
    outline-offset: var(--hybrid-button-secondary-outline-offset,var(--hybrid-button-local-secondary-outline-offset));
  }
  .button-dashed {
    border-style: dashed;
  }
  :host {
    /* Default Button Style */
    --hybrid-button-local-border-top: 2px solid #d0d0d0;
    --hybrid-button-local-border-bottom: 2px solid #d0d0d0;
    --hybrid-button-local-border-left: 2px solid #d0d0d0;
    --hybrid-button-local-border-right: 2px solid #d0d0d0;
    --hybrid-button-local-border-top-left-radius: 0px;
    --hybrid-button-local-border-top-right-radius: 0px;
    --hybrid-button-local-border-bottom-left-radius: 0px;
    --hybrid-button-local-border-bottom-right-radius: 0px;
    --hybrid-button-local-background-color: #f9f9f9;
    --hybrid-button-local-text-color: #393939;
    --hybrid-button-local-hover-border-color: #1677ff;
    --hybrid-button-local-hover-color: #1677ff;
    --hybrid-button-local-font-size: 0.9rem;
    --hybrid-button-local-font-weight: normal;
    --hybrid-button-local-text-transform: none;
    --hybrid-button-local-active-border-color: #1661b1;
    --hybrid-button-local-active-color: #184d86;
    --hybrid-button-local-disabled-background-color: #c6c6c6;
    --hybrid-button-local-disabled-text-color: #8d8d8d;
    --hybrid-button-local-disabled-border-color: #bbb;
    --hybrid-button-local-height: auto;
    --hybrid-button-local-width: auto;
    --hybrid-button-local-padding-y: 0.5rem;
    --hybrid-button-local-padding-x: 0.6rem;
    --hybrid-button-local-icon-width:18px;
    --hybrid-button-local-icon-height:14px;

    /* Primary Button Style */
    --hybrid-button-local-primary-border-color: #0f62fe;
    --hybrid-button-local-primary-background-color: #0f62fe;
    --hybrid-button-local-primary-text-color: #ffffff;
    --hybrid-button-local-primary-outline: 1px solid white;
    --hybrid-button-local-primary-outline-offset: -3px;
    --hybrid-button-local-primary-hover-background-color: #0353e9;
    --hybrid-button-local-primary-hover-border-color: #0353e9;
    --hybrid-button-local-primary-active-background-color: #0f62fe;
    --hybrid-button-local-primary-active-border-color: #0f62fe;
    --hybrid-button-local-primary-disabled-text-color: #8d8d8d;
    --hybrid-button-local-primary-disabled-background-color: #c6c6c6;
    --hybrid-button-local-primary-disabled-border-color: #c6c6c6;
    --hybrid-button-local-primary-dashed-border-color: #ffffff;

    /* Danger button style */
    --hybrid-button-local-danger-background-color: #da1e28;
    --hybrid-button-local-danger-text-color: #ffffff;
    --hybrid-button-local-danger-border-color: #da1e28;
    --hybrid-button-local-danger-outline: 1px solid white;
    --hybrid-button-local-danger-outline-offset: -3px;
    --hybrid-button-local-danger-hover-background-color: #ba1b23;
    --hybrid-button-local-danger-hover-border-color: #ba1b23;
    --hybrid-button-local-danger-active-background-color: #da1e28;
    --hybrid-button-local-danger-active-border-color: #0f62fe;
    --hybrid-button-local-danger-disabled-background-color: #c6c6c6;
    --hybrid-button-local-danger-disabled-text-color: #8d8d8d;
    --hybrid-button-local-danger-disabled-border-color: #c6c6c6;
    --hybrid-button-local-danger-dashed-border-color: #ffffff;

    /* Ghost button style */
    --hybrid-button-local-ghost-background-color: #ffffff;
    --hybrid-button-local-ghost-text-color: #0f62fe;
    --hybrid-button-local-ghost-border-color: #ffffff;
    --hybrid-button-local-ghost-active-background-color: #ffffff;
    --hybrid-button-local-ghost-active-text-color: #054ada;
    --hybrid-button-local-ghost-active-border-color: #0f62fe;
    --hybrid-button-local-ghost-hover-background-color: #e5e5e5;
    --hybrid-button-local-ghost-hover-border-color: #e5e5e5;
    --hybrid-button-local-ghost-hover-text-color: #054ada;
    --hybrid-button-local-ghost-disabled-background-color: #ffffff;
    --hybrid-button-local-ghost-disabled-text-color: #c6c6c6;
    --hybrid-button-local-ghost-disabled-border-color: #ffffff;
    --hybrid-button-local-ghost-dashed-border-color: #c6c6c6;

    /* Secondary button style */

    --hybrid-button-local-secondary-background-color: #393939;
    --hybrid-button-local-secondary-border-color: #393939;
    --hybrid-button-local-secondary-text-color: #ffffff;
    --hybrid-button-local-secondary-outline: 1px solid white;
    --hybrid-button-local-secondary-outline-offset: -3px;
    --hybrid-button-local-secondary-hover-background-color: #4c4c4c;
    --hybrid-button-local-secondary-hover-border-color: #4c4c4c;
    --hybrid-button-local-secondary-active-background-color: #393939;
    --hybrid-button-local-secondary-active-border-color: #0f62fe;
    --hybrid-button-local-secondary-disabled-background-color: #c6c6c6;
    --hybrid-button-local-secondary-disabled-text-color: #8d8d8d;
    --hybrid-button-local-secondary-disabled-border-color: #c6c6c6;
    --hybrid-button-local-secondary-dashed-border-color: #ffffff;

    /* Sizes */

    --hybrid-large-button-local-padding-y: 0.5rem;
    --hybrid-large-button-local-padding-x: 0.9rem;
    --hybrid-large-button-local-font-size: 1rem;

    --hybrid-small-button-local-padding-y: 0.5rem;
    --hybrid-small-button-local-padding-x: 0.4rem;
    --hybrid-small-button-local-font-size: 0.7rem;
  }

  @media (prefers-color-scheme: dark) {
    :host { 

      --hybrid-button-local-background-color: #000000;
      --hybrid-button-local-text-color: #ffffff;
      --hybrid-button-local-hover-border-color: #6f6f6f;
      --hybrid-button-local-hover-color: #6f6f6f;
      --hybrid-button-local-active-border-color: #c6c6c6;
      --hybrid-button-local-active-color: #c6c6c6;
      --hybrid-button-local-disabled-background-color: #c6c6c6;
  
      /* Primary button style */
      --hybrid-button-local-primary-outline: 1px solid black;
      --hybrid-button-local-primary-outline-offset: -3px;
      --hybrid-button-local-primary-active-border-color: #ffffff;
      --hybrid-button-local-primary-disabled-text-color: #c6c6c6;
      --hybrid-button-local-primary-disabled-background-color: #8d8d8d;
      --hybrid-button-local-primary-disabled-border-color: #8d8d8d;
  
      /* Secondary button style */
      --hybrid-button-local-secondary-background-color: #6f6f6f;
      --hybrid-button-local-secondary-border-color: #6f6f6f;
      --hybrid-button-local-secondary-text-color: #ffffff;
      --hybrid-button-local-secondary-active-border-color: #ffffff;
      --hybrid-button-local-secondary-active-background-color: #6f6f6f;
      --hybrid-button-local-secondary-outline: 1px solid black;
      --hybrid-button-local-secondary-outline-offset: -3px;
      --hybrid-button-local-secondary-hover-background-color: #606060;
      --hybrid-button-local-secondary-hover-border-color: #606060;
      --hybrid-button-local-secondary-disabled-background-color: #6f6f6f;
      --hybrid-button-local-secondary-disabled-text-color: #8d8d8d;
      --hybrid-button-local-secondary-disabled-border-color: #6f6f6f;
      --hybrid-button-local-secondary-dashed-border-color: #ffffff;
  
      /* Ghost button style */
      --hybrid-button-local-ghost-background-color: transparent;
      --hybrid-button-local-ghost-text-color: #78a9ff;
      --hybrid-button-local-ghost-border-color: transparent;
      --hybrid-button-local-ghost-active-background-color: transparent;
      --hybrid-button-local-ghost-active-text-color: #a6c8ff;
      --hybrid-button-local-ghost-active-border-color: #ffffff;
      --hybrid-button-local-ghost-hover-background-color: #4c4c4c;
      --hybrid-button-local-ghost-hover-border-color: #4c4c4c;
      --hybrid-button-local-ghost-hover-text-color: #a6c8ff;
      --hybrid-button-local-ghost-disabled-background-color: transparent;
      --hybrid-button-local-ghost-disabled-text-color: #6f6f6f;
      --hybrid-button-local-ghost-disabled-border-color: transparent;
      --hybrid-button-local-ghost-dashed-border-color: #c6c6c6;
  
      /* Danger button style */
      --hybrid-button-local-danger-outline: 1px solid #000000;
      --hybrid-button-local-danger-outline-offset: -3px;
      --hybrid-button-local-danger-hover-background-color: #ba1b23;
      --hybrid-button-local-danger-hover-border-color: #ba1b23;
      --hybrid-button-local-danger-active-background-color: #da1e28;
      --hybrid-button-local-danger-active-border-color: #ffffff;
      --hybrid-button-local-danger-disabled-background-color: #6f6f6f;
      --hybrid-button-local-danger-disabled-text-color: #8d8d8d;
      --hybrid-button-local-danger-disabled-border-color: #6f6f6f;
      --hybrid-button-local-danger-dashed-border-color: #ffffff;
     
    }
  }
`;

export const styles = [buttonStyles];
