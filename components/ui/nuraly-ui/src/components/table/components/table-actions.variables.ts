import { css } from 'lit';

/**
 * Table actions CSS variable mappings
 * Maps local component variables to theme system variables
 */
export const styleVariables = css`
  :host {
    --nuraly-actions-text-color: var(--nuraly-table-background, #ffffff);
    --nuraly-actions-background-color: var(--nuraly-table-action-color, #0f62fe);
  }
`;
