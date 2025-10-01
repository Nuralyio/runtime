import { css } from 'lit';

/**
 * Table pagination CSS variable mappings
 * Maps local component variables to theme system variables
 */
export const styleVariables = css`
  :host {
    --nuraly-pagination-background-color: var(--nuraly-table-pagination-background, #f4f4f4);
    --nuraly-pagination-text-color: var(--nuraly-table-pagination-text, #161616);
    --nuraly-pagination-borders: 1px solid var(--nuraly-table-border-color, #e0e0e0);
  }
`;
