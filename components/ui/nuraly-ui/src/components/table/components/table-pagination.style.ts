import { css } from 'lit';
import { styleVariables } from './table-pagination.variables.js';

const tablePaginationStyle = css`
  .pagination-container {
    display: flex;
    justify-content: space-between;
    background-color: var(--nuraly-pagination-background-color);
    color: var(--nuraly-pagination-text-color);
  }

  .left-content {
    display: flex;
    justify-content: space-between;
  }
  .left-content .items-details {
    border-left: var(--nuraly-pagination-borders);
    padding: 10px;
  }
  .right-arrow,
  .left-arrow {
    --nuraly-icon-color: var(--nuraly-pagination-text-color);
  }

  :host([size='small']) .left-content .items-details {
    padding: 5px;
  }

  :host([size='large']) .left-content .items-details {
    padding: 15px;
  }

  .left-content .select-details {
    padding: 10px;
  }

  :host([size='small']) .left-content .select-details {
    padding: 5px;
  }

  :host([size='large']) .left-content .select-details {
    padding: 15px;
  }

  .right-content {
    display: flex;
    justify-content: space-between;
    border-left: var(--nuraly-pagination-borders);
  }
  .right-content .icon-container {
    display: flex;
    justify-content: space-between;
    border-left: var(--nuraly-pagination-borders);
  }

  .right-content .page-details {
    padding: 10px;
  }

  :host([size='small']) .right-content .page-details {
    padding: 5px;
  }

  :host([size='large']) .right-content .page-details {
    padding: 15px;
  }

  .icon-container .left-arrow,
  .icon-container .right-arrow {
    padding: 10px;
  }

  :host([size='small']) .icon-container .left-arrow,
  :host([size='small']) .icon-container .right-arrow {
    padding: 5px;
  }

  :host([size='large']) .icon-container .left-arrow,
  :host([size='large']) .icon-container .right-arrow {
    padding: 15px;
  }

  .icon-container .left-arrow {
    border-right: var(--nuraly-pagination-borders);
  }

  select {
    border: none;
    background-color: var(--nuraly-pagination-background-color);
    cursor: pointer;
    color: var(--nuraly-pagination-text-color);
  }

  hy-icon[data-enabled='false'] {
    cursor: not-allowed;
  }

  hy-icon[data-enabled='true'] {
    cursor: pointer;
  }
`;

export const styles = [tablePaginationStyle, styleVariables];
