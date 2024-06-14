import {css} from 'lit';

export const styleVariables = css`
  :host {
    --hybrid-filter-input-background-color: #ffffff;
    --hybrid-filter-input-text-color: #000000;
    --hybrid-filter-focused-input-border: 1px solid #e0e0e0;
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-filter-input-background-color: #393939;
      --hybrid-filter-focused-input-border: 1px solid #393939;
      --hybrid-filter-input-text-color: #c6c6c6;
    }
  }
`;
