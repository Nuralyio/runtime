import { css } from 'lit';

export const styleVariables = css`
  :host {
    /* --hybrid-icon-color: #000000; */
    --hybrid-icon-width: 18px;
    --hybrid-icon-height: 18px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-icon-color: #ffffff;
    }
  }
`;
