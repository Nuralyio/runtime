import { css } from 'lit';

/**
 * Table content CSS variable mappings
 * Maps local component variables to theme system variables
 */
export const styleVariables = css`
  :host {
    /* Map component variables to theme system variables */
    --nuraly-table-text-color: var(--nuraly-table-text-color, #161616);
    --nuraly-table-input-color: var(--nuraly-table-checkbox-checked, #161616);
    --nuraly-table-column-border: var(--nuraly-table-border-width, 1px) var(--nuraly-table-border-style, solid) var(--nuraly-table-row-border-color, #e0e0e0);
    --nuraly-table-row-background-color: var(--nuraly-table-row-background, #f4f4f4);
    --nuraly-table-row-checked-background-color: var(--nuraly-table-row-selected-background, #e5e5e5);
    --nuraly-table-row-hover-background-color: var(--nuraly-table-row-hover-background, #d3d3d3);
    --nuraly-table-header-background-color: var(--nuraly-table-header-background, #e0e0e0);
    --nuraly-table-checkbox-some-checked-background-color: var(--nuraly-table-text-color, #161616);
    --nuraly-table-checkbox-some-checked-sign-color: var(--nuraly-table-background, #ffffff);
  }
`;
