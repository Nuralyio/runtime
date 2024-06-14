import {css} from 'lit';

export const styleVariables = css`
  :host {
    /* Default Button Style */
    --hybrid-button-border: 2px solid #d0d0d0;
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
  :host([theme='dark']) {
    /* Default button style */
    --hybrid-button-background-color: transparent;
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
`;
