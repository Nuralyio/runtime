import { css } from 'lit';
import { styleVariables } from './table-actions.variables.js';

const tableActionsStyle = css`
  .actions-container {
    background-color: var(--nuraly-actions-background-color);
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    color: var(--nuraly-actions-text-color);
  }

  .actions-container button {
    cursor: pointer;
    border: none;
    color: var(--nuraly-actions-text-color);
    background-color: var(--nuraly-actions-background-color);
  }

  .actions-container {
    padding: 10px;
  }
  :host([size='small']) .actions-container {
    padding: 5px;
  }
  :host([size='large']) .actions-container {
    padding: 15px;
  }
`;

export const styles = [tableActionsStyle, styleVariables];
