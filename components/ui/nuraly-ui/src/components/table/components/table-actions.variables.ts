import {css} from 'lit';

export const styleVariables = css`
  :host {
    --hybrid-actions-text-color: #ffffff;
    --hybrid-actions-background-color: #0f62fe;
  }

  @media (prefers-color-scheme: dark) {
    :host {
    }
  }
`;
