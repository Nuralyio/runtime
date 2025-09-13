import { css } from 'lit';

export const styleVariables = css`
  :host {
    --nuraly-filter-input-background-color: #ffffff;
    --nuraly-filter-input-text-color: #000000;
    --nuraly-filter-focused-input-border: 1px solid #e0e0e0;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --nuraly-filter-input-background-color: #393939;
      --nuraly-filter-focused-input-border: 1px solid #393939;
      --nuraly-filter-input-text-color: #c6c6c6;
    }
  }
`;
