import {css} from 'lit';
import {styleVariables} from './table-actions.variables.js';

const tableActionsStyle = css`
  .actions-container {
    background-color: var(--hybrid-actions-background-color);
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    color: var(--hybrid-actions-text-color);
  }

  .actions-container button {
    cursor: pointer;
    border: none;
    color: var(--hybrid-actions-text-color);
    background-color: var(--hybrid-actions-background-color);
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
