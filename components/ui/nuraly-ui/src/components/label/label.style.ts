import { css } from "lit";
import { styleVariables } from './label.style.variables.js';

export default css`
  ${styleVariables}

  :host {
    display: inline-block;
    width: fit-content;
  }

  label {
    font-family: var(--nuraly-label-font-family);
    font-size: var(--nuraly-label-font-size);
    font-weight: var(--nuraly-label-font-weight);
    line-height: var(--nuraly-label-line-height);
    color: var(--nuraly-label-text-color);
    margin: 0;
    margin-bottom: var(--nuraly-label-margin-bottom);
    display: block;
    user-select: none;
    cursor: pointer;
    transition: color var(--nuraly-label-transition-duration) var(--nuraly-label-transition-timing);
  }

  /* Size variants */
  :host([size="small"]) label {
    font-size: var(--nuraly-label-small-font-size);
  }

  :host([size="large"]) label {
    font-size: var(--nuraly-label-large-font-size);
  }

  /* Variant colors */
  :host([variant="secondary"]) label {
    color: var(--nuraly-label-secondary-color);
  }

  :host([variant="error"]) label {
    color: var(--nuraly-label-error-color);
  }

  :host([variant="warning"]) label {
    color: var(--nuraly-label-warning-color);
  }

  :host([variant="success"]) label {
    color: var(--nuraly-label-success-color);
  }

  /* Disabled state */
  :host([disabled]) label {
    color: var(--nuraly-label-disabled-color);
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Required asterisk */
  .required-asterisk {
    color: var(--nuraly-label-required-color);
    margin-left: var(--nuraly-label-required-margin);
    font-weight: normal;
  }

  /* Focus-within for accessibility when label is associated with form elements */
  :host(:focus-within) label:not([disabled]) {
    opacity: 0.8;
  }
`;