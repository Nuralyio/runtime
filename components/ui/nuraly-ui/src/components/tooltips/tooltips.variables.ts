import {css} from 'lit';

export const styleVariables = css`
  :host {
    --hybrid-tooltip-background-color: #393939;
    --hybrid-tooltip-text-color: #ffffff;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-tooltip-background-color: #f4f4f4;
      --hybrid-tooltip-text-color: #161616;
    }
  }
`;
