import {css} from 'lit';

export const styleVariables = css`
  :host {
    --hybrid-table-text-color: #161616;
    --hybrid-table-input-color: #161616;
    --hybrid-table-column-border: 1px solid #e0e0e0;
    --hybrid-table-row-background-color: #f4f4f4;
    --hybrid-table-row-checked-background-color: #e5e5e5;
    --hybrid-table-row-hover-background-color: #d3d3d3;
    --hybrid-table-header-background-color: #e0e0e0;
    --hybrid-table-checkbox-some-checked-background-color: #161616;
    --hybrid-table-checkbox-some-checked-sign-color: #ffffff;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-table-text-color: #f4f4f4;
      --hybrid-table-input-color: #ffffff;
      --hybrid-table-column-border: 1px solid #8d8d8d;
      --hybrid-table-row-background-color: #393939;
      --hybrid-table-header-background-color: #525252;
      --hybrid-table-row-hover-background-color: #525252;
      --hybrid-table-row-checked-background-color: #6f6f6f;
      --hybrid-table-checkbox-some-checked-background-color: #ffffff;
      --hybrid-table-checkbox-some-checked-sign-color: #161616;
    }
  }
`;
