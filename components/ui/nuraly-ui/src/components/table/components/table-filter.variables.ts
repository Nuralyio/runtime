import { css } from 'lit';

/**
 * Table filter CSS variable mappings
 * Maps local component variables to theme system variables
 */
export const styleVariables = css`
  :host {
    --nuraly-filter-input-background-color: var(--nuraly-table-filter-background, #ffffff);
    --nuraly-filter-input-text-color: var(--nuraly-table-filter-text, #000000);
    --nuraly-filter-focused-input-border: 1px solid var(--nuraly-table-filter-border, #e0e0e0);
  }
`;
