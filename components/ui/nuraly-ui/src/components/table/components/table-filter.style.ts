import {css} from 'lit';
import {styleVariables} from './table-filter.variables';
const tableActionsStyle = css`
  :host([showInput]) {
    width: 100%;
  }

  .filter-container {
    position: relative;
    margin-bottom: 5px;
  }
  .filter-container input {
    padding: 5px;
    padding-left: 30px;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--hybrid-filter-input-background-color);
    color: var(--hybrid-filter-input-text-color);
  }
  input:focus {
    outline-style: none;
    border: var(--hybrid-filter-focused-input-border);
  }
  .icon-container {
    height: 25px;
    width: 35px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .search-icon {
    position: absolute;
    left: 10px;
    top: 25%;
  }
`;

export const styles = [tableActionsStyle, styleVariables];
