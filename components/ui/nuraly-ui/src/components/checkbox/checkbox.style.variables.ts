import { css } from 'lit';

export const styleVariables = css`
  :host {
    /* Light theme defaults (local component properties) */
    --nuraly-checkbox-local-filled-background-color: #161616;
    --nuraly-checkbox-local-color: #000000;
    --nuraly-checkbox-local-empty-background-color: #ffffff;
    --nuraly-checkbox-local-disabled-background-color: #c6c6c6;
    --nuraly-checkbox-local-disabled-text-color: #c6c6c6;
    --nuraly-checkbox-local-empty-border: 1px solid #161616;
    --nuraly-checkbox-local-symbol-color: #ffffff;
    --nuraly-checkbox-local-focus-border: 2px solid #ffffff;
    --nuraly-checkbox-local-focus-outline: 2px solid #0f62fe;
    --nuraly-checkbox-local-font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, SFProLocalRange;
    --nuraly-checkbox-local-border-radius: 1px;
    --nuraly-checkbox-local-gap: 5px;

    /* Size variables */
    --nuraly-checkbox-local-medium-width: 20px;
    --nuraly-checkbox-local-medium-height: 20px;
    --nuraly-checkbox-local-small-width: 15px;
    --nuraly-checkbox-local-small-height: 15px;
    --nuraly-checkbox-local-large-width: 25px;
    --nuraly-checkbox-local-large-height: 25px;

    --nuraly-checkbox-local-small-indeterminate-size: 10px;
    --nuraly-checkbox-local-large-indeterminate-size: 18px;
    --nuraly-checkbox-local-medium-indeterminate-size: 13px;

    --nuraly-checkbox-local-small-checked-width: 2px;
    --nuraly-checkbox-local-small-checked-height: 7px;
    --nuraly-checkbox-local-medium-checked-width: 3px;
    --nuraly-checkbox-local-medium-checked-height: 9px;
    --nuraly-checkbox-local-large-checked-width: 4px;
    --nuraly-checkbox-local-large-checked-height: 10px;
  }
`;
