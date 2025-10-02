import { css } from 'lit';

export default css`
  :host {
    display: block;
    width: 100%;
    font-family: var(--nuraly-font-family, Arial, sans-serif);
    color: var(--nuraly-color-text);
    background-color: var(--nuraly-color-background);
  }

  /* Filter Container Styles */
  .filter-container {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding: var(--nuraly-spacing-2, 0.5rem) 0;
    position: relative;
    margin-bottom: 5px;
  }

  .filter-container input {
    padding: 5px;
    padding-left: 30px;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--nuraly-table-filter-background, #ffffff);
    color: var(--nuraly-table-filter-text, #000000);
  }

  .filter-container input:focus {
    outline-style: none;
    border: 1px solid var(--nuraly-table-filter-border, #1890ff);
  }

  .filter-container .icon-container {
    height: 25px;
    width: 35px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .filter-container .search-icon {
    position: absolute;
    left: 10px;
    top: 25%;
  }

  /* Actions Bar Styles */
  .actions-container {
    background-color: var(--nuraly-table-action-color, #0f62fe);
    padding: 10px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    color: var(--nuraly-table-background, #ffffff);
  }

  .actions-container button {
    cursor: pointer;
    border: none;
    color: var(--nuraly-table-background, #ffffff);
    background-color: var(--nuraly-table-action-color, #0f62fe);
  }

  .actions-container[data-size='small'] {
    padding: 5px;
  }

  .actions-container[data-size='large'] {
    padding: 15px;
  }

  /* Table Content Wrapper Styles */
  .table-content-wrapper {
    display: block;
    overflow: auto;
  }

  input[type='checkbox'][data-indeterminate='true']::after {
    width: 13px;
    height: 13px;
    background-color: var(--nuraly-table-checkbox-checked, #161616);
    color: var(--nuraly-table-background, #ffffff);
    display: flex;
    justify-content: center;
    align-items: center;
    content: '-';
  }

  /* Table Styles */
  table {
    width: 100%;
    border-spacing: 0px;
    color: var(--nuraly-table-text-color);
  }

  td {
    text-align: center;
    border-bottom: var(--nuraly-table-border-width, 1px) solid var(--nuraly-table-row-border-color, #f0f0f0);
    padding: 10px;
  }

  th {
    cursor: pointer;
    padding: 10px;
  }

  th span {
    display: flex;
    justify-content: center;
    gap: 10px;
  }

  nr-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    --nuraly-icon-color: var(--nuraly-table-text-color);
  }

  tr {
    background-color: var(--nuraly-table-row-background, #ffffff);
  }

  tr:hover {
    background-color: var(--nuraly-table-row-hover-background, #f5f5f5);
  }

  tr:first-child {
    background-color: var(--nuraly-table-header-background, #fafafa);
  }

  tr:has(:not(th) > input:checked) {
    background-color: var(--nuraly-table-row-selected-background, #e6f7ff);
  }

  input,
  .expand-icon {
    cursor: pointer;
    accent-color: var(--nuraly-table-checkbox-checked, #1890ff);
  }

  /* Size Variants for Table Content */
  :host([size='small']) td,
  :host([size='small']) th {
    padding: 5px;
  }

  :host([size='large']) td,
  :host([size='large']) th {
    padding: 15px;
  }

  /* Pagination Styles */
  .pagination-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--nuraly-pagination-background-color);
    color: var(--nuraly-pagination-text-color);
  }

  .pagination-container .left-content {
    display: flex;
    align-items: center;
  }

  .pagination-container .left-content .items-details {
    border-left: var(--nuraly-pagination-borders);
    padding: 10px;
  }

  .pagination-container .left-content .select-details {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px;
  }

  .pagination-container .left-content .select-details label {
    font-size: var(--nuraly-font-size-input, 14px);
    color: var(--nuraly-table-pagination-text, #000000);
    white-space: nowrap;
  }

  .pagination-container .left-content .select-details nr-select {
    min-width: 60px;
    max-width: 80px;
    --select-border-color: var(--nuraly-table-border-color, #d9d9d9);
    --select-background: var(--nuraly-table-pagination-background, #fafafa);
    --select-text-color: var(--nuraly-table-pagination-text, #000000);
  }

  .pagination-container .right-content {
    display: flex;
    align-items: center;
    border-left: var(--nuraly-pagination-borders);
  }

  .pagination-container .right-content .icon-container {
    display: flex;
    align-items: center;
    border-left: var(--nuraly-pagination-borders);
  }

  .pagination-container .right-content .page-details {
    padding: 10px;
  }

  .pagination-container .icon-container .left-arrow,
  .pagination-container .icon-container .right-arrow {
    padding: 10px;
    --nuraly-icon-color: var(--nuraly-pagination-text-color);
  }

  .pagination-container .icon-container .left-arrow {
    border-right: var(--nuraly-pagination-borders);
  }

  .pagination-container nr-icon[data-enabled='false'] {
    cursor: not-allowed;
  }

  .pagination-container nr-icon[data-enabled='true'] {
    cursor: pointer;
  }

  /* Size Variants for Pagination */
  .pagination-container[data-size='small'] .left-content .items-details {
    padding: 5px;
  }

  .pagination-container[data-size='large'] .left-content .items-details {
    padding: 15px;
  }

  .pagination-container[data-size='small'] .left-content .select-details {
    padding: 5px;
    gap: 6px;
  }

  .pagination-container[data-size='large'] .left-content .select-details {
    padding: 15px;
    gap: 10px;
  }

  .pagination-container[data-size='small'] .right-content .page-details {
    padding: 5px;
  }

  .pagination-container[data-size='large'] .right-content .page-details {
    padding: 15px;
  }

  .pagination-container[data-size='small'] .icon-container .left-arrow,
  .pagination-container[data-size='small'] .icon-container .right-arrow {
    padding: 5px;
  }

  .pagination-container[data-size='large'] .icon-container .left-arrow,
  .pagination-container[data-size='large'] .icon-container .right-arrow {
    padding: 15px;
  }
`;
