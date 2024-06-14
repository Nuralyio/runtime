import {css} from 'lit';

export const styleVariables = css`
  :host {
    --hybrid-pagination-background-color: #f4f4f4;
    --hybrid-pagination-text-color: #161616;
    --hybrid-pagination-borders: 1px solid #e0e0e0;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-pagination-background-color: #393939;
      --hybrid-pagination-text-color: #f4f4f4;
      --hybrid-pagination-borders: 1px solid #8d8d8d;
    }
  }
`;
