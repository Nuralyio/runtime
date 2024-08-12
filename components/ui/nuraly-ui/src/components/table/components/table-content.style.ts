import {css} from 'lit';
import {styleVariables} from './table-content.variables.js';

const tableContentStyle = css`
  :host {
    display: block;
    overflow: auto;
  }

  input[type='checkbox'][data-indeterminate='true']::after {
    width: 13px;
    height: 13px;
    background-color: var(--hybrid-table-input-color);
    color: var(--hybrid-table-checkbox-some-checked-sign-color);
    display: flex;
    justify-content: center;
    align-items: center;
    content: '-';
  }
  table {
    width: 100%;
    border-spacing: 0px;
    color: var(--hybrid-table-text-color);
  }
  td {
    text-align: center;
    border-bottom: var(--hybrid-table-column-border);
  }
  th {
    cursor: pointer;
  }
  th span {
    display: flex;
    justify-content: center;
    gap: 10px;
  }
  hy-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    --hybrid-icon-color: var(--hybrid-table-text-color);
  }
  tr {
    background-color: var(--hybrid-table-row-background-color);
  }
  tr:hover {
    background-color: var(--hybrid-table-row-hover-background-color);
  }
  tr:first-child {
    background-color: var(--hybrid-table-header-background-color);
  }

  tr:has(:not(th) > input:checked) {
    background-color: var(--hybrid-table-row-checked-background-color);
  }

  td,
  th {
    padding: 10px;
  }
  input,
  .expand-icon {
    cursor: pointer;
    accent-color: var(--hybrid-table-input-color);
  }

  :host([size='small']) td,
  :host([size='small']) th {
    padding: 5px;
  }

  :host([size='large']) td,
  :host([size='large']) th {
    padding: 15px;
  }
`;

export const styles = [tableContentStyle, styleVariables];
