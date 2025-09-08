import {css} from 'lit';

export const styleVariables = css`
  :host {
    /* Light theme defaults */
    --hybrid-checkbox-filled-background-color: #161616;
    --hybrid-checkbox-color: #000000;
    --hybrid-checkbox-empty-background-color: #ffffff;
    --hybrid-checkbox-disabled-background-color: #c6c6c6;
    --hybrid-checkbox-disabled-text-color: #c6c6c6;
    --hybrid-checkbox-empty-border: 1px solid #161616;
    --hybrid-checkbox-symbol-color: #ffffff;
    --hybrid-checkbox-focus-border: 2px solid #ffffff;
    --hybrid-checkbox-focus-outline: 2px solid #0f62fe;
    --hybrid-checkbox-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
    --hybrid-checkbox-border-radius: 1px;
    --hybrid-checkbox-gap: 5px;

    /* Size variables */
    --hybrid-checkbox-medium-width: 20px;
    --hybrid-checkbox-medium-height: 20px;
    --hybrid-checkbox-small-width: 15px;
    --hybrid-checkbox-small-height: 15px;
    --hybrid-checkbox-large-width: 25px;
    --hybrid-checkbox-large-height: 25px;

    --hybrid-checkbox-small-indeterminate-size: 10px;
    --hybrid-checkbox-large-indeterminate-size: 18px;
    --hybrid-checkbox-medium-indeterminate-size: 13px;

    --hybrid-checkbox-small-checked-width: 2px;
    --hybrid-checkbox-small-checked-height: 7px;
    --hybrid-checkbox-medium-checked-width: 3px;
    --hybrid-checkbox-medium-checked-height: 9px;
    --hybrid-checkbox-large-checked-width: 4px;
    --hybrid-checkbox-large-checked-height: 10px;
  }

  /* Dark theme overrides using data-theme attribute */
  input[data-theme="dark"] {
    --hybrid-checkbox-empty-border: 1px solid #ffffff;
    --hybrid-checkbox-empty-background-color: #161616;
    --hybrid-checkbox-filled-background-color: #ffffff;
    --hybrid-checkbox-symbol-color: #161616;
    --hybrid-checkbox-focus-outline: 2px solid #ffffff;
    --hybrid-checkbox-focus-border: 2px solid #161616;
    --hybrid-checkbox-disabled-background-color: #6f6f6f;
    --hybrid-checkbox-disabled-text-color: #6f6f6f;
  }

  :host([data-theme="dark"]) {
    --hybrid-checkbox-color: #ffffff;
  }
`;
