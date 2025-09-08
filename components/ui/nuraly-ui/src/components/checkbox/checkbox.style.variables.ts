import {css} from 'lit';

export const styleVariables = css`
  :host {
    /* Light theme defaults (local component properties) */
    --hybrid-checkbox-local-filled-background-color: #161616;
    --hybrid-checkbox-local-color: #000000;
    --hybrid-checkbox-local-empty-background-color: #ffffff;
    --hybrid-checkbox-local-disabled-background-color: #c6c6c6;
    --hybrid-checkbox-local-disabled-text-color: #c6c6c6;
    --hybrid-checkbox-local-empty-border: 1px solid #161616;
    --hybrid-checkbox-local-symbol-color: #ffffff;
    --hybrid-checkbox-local-focus-border: 2px solid #ffffff;
    --hybrid-checkbox-local-focus-outline: 2px solid #0f62fe;
    --hybrid-checkbox-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
    --hybrid-checkbox-local-border-radius: 1px;
    --hybrid-checkbox-local-gap: 5px;

    /* Size variables */
    --hybrid-checkbox-local-medium-width: 20px;
    --hybrid-checkbox-local-medium-height: 20px;
    --hybrid-checkbox-local-small-width: 15px;
    --hybrid-checkbox-local-small-height: 15px;
    --hybrid-checkbox-local-large-width: 25px;
    --hybrid-checkbox-local-large-height: 25px;

    --hybrid-checkbox-local-small-indeterminate-size: 10px;
    --hybrid-checkbox-local-large-indeterminate-size: 18px;
    --hybrid-checkbox-local-medium-indeterminate-size: 13px;

    --hybrid-checkbox-local-small-checked-width: 2px;
    --hybrid-checkbox-local-small-checked-height: 7px;
    --hybrid-checkbox-local-medium-checked-width: 3px;
    --hybrid-checkbox-local-medium-checked-height: 9px;
    --hybrid-checkbox-local-large-checked-width: 4px;
    --hybrid-checkbox-local-large-checked-height: 10px;
  }
`;
