import { css } from 'lit';

export const styleVariables = css`
  :host {
    --nuraly-tooltip-background-color: #393939;
    --nuraly-tooltip-text-color: #ffffff;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --nuraly-tooltip-background-color: #f4f4f4;
      --nuraly-tooltip-text-color: #161616;
    }
  }
`;
