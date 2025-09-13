import { css } from 'lit';

export const styleVariables = css`
  :host {
    --nuraly-pagination-background-color: #f4f4f4;
    --nuraly-pagination-text-color: #161616;
    --nuraly-pagination-borders: 1px solid #e0e0e0;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --nuraly-pagination-background-color: #393939;
      --nuraly-pagination-text-color: #f4f4f4;
      --nuraly-pagination-borders: 1px solid #8d8d8d;
    }
  }
`;
