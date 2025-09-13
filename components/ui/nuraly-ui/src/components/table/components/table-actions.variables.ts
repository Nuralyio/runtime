import { css } from 'lit';

export const styleVariables = css`
  :host {
    --nuraly-actions-text-color: #ffffff;
    --nuraly-actions-background-color: #0f62fe;
  }

  @media (prefers-color-scheme: dark) {
    :host {
    }
  }
`;
