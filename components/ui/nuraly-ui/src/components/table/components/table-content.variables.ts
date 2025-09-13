import { css } from 'lit';

export const styleVariables = css`
  :host {
    --nuraly-table-text-color: #161616;
    --nuraly-table-input-color: #161616;
    --nuraly-table-column-border: 1px solid #e0e0e0;
    --nuraly-table-row-background-color: #f4f4f4;
    --nuraly-table-row-checked-background-color: #e5e5e5;
    --nuraly-table-row-hover-background-color: #d3d3d3;
    --nuraly-table-header-background-color: #e0e0e0;
    --nuraly-table-checkbox-some-checked-background-color: #161616;
    --nuraly-table-checkbox-some-checked-sign-color: #ffffff;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --nuraly-table-text-color: #f4f4f4;
      --nuraly-table-input-color: #ffffff;
      --nuraly-table-column-border: 1px solid #8d8d8d;
      --nuraly-table-row-background-color: #393939;
      --nuraly-table-header-background-color: #525252;
      --nuraly-table-row-hover-background-color: #525252;
      --nuraly-table-row-checked-background-color: #6f6f6f;
      --nuraly-table-checkbox-some-checked-background-color: #ffffff;
      --nuraly-table-checkbox-some-checked-sign-color: #161616;
    }
  }
`;
