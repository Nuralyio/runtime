import { css } from "lit";
import { styleVariables } from './label.style.variables.js';

export default css`
  ${styleVariables}

  :host {
    display: inline-block;
    width: fit-content;
  }

  label {
    font-family: var(--nuraly-label-local-font-family);
    font-size: var(--nuraly-label-local-font-size);
    font-weight: var(--nuraly-label-local-font-weight);
    line-height: var(--nuraly-label-local-line-height);
    color: var(--nuraly-label-local-text-color);
    margin: 0;
    margin-bottom: var(--nuraly-label-local-margin-bottom);
    display: block;
    user-select: none;
    cursor: pointer;
    transition: color var(--nuraly-label-local-transition-duration) var(--nuraly-label-local-transition-timing);
  }

  /* Size variants */
  :host([size="small"]) label {
    font-size: var(--nuraly-label-local-small-font-size);
  }

  :host([size="large"]) label {
    font-size: var(--nuraly-label-local-large-font-size);
  }

  /* Variant colors */
  :host([variant="secondary"]) label {
    color: var(--nuraly-label-local-secondary-color);
  }

  :host([variant="error"]) label {
    color: var(--nuraly-label-local-error-color);
  }

  :host([variant="warning"]) label {
    color: var(--nuraly-label-local-warning-color);
  }

  :host([variant="success"]) label {
    color: var(--nuraly-label-local-success-color);
  }

  /* Disabled state */
  :host([disabled]) label {
    color: var(--nuraly-label-local-disabled-color);
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Required asterisk */
  .required-asterisk {
    color: var(--nuraly-label-local-required-color);
    margin-left: var(--nuraly-label-local-required-margin);
    font-weight: normal;
  }

  /* Focus-within for accessibility when label is associated with form elements */
  :host(:focus-within) label:not([disabled]) {
    opacity: 0.8;
  }
`;