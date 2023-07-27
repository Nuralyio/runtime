import {css} from 'lit';

export const styles = css`
  .buttons-display {
    display: flex;
  }
  hy-button:first-child {
    --hybrid-button-border-right-width: 0;
    --hybrid-button-border-top-right-radius: 0;
    --hybrid-button-border-bottom-right-radius: 0;
  }

  hy-button:last-child {
    --hybrid-button-border-left-width: 0;
    --hybrid-button-border-top-left-radius: 0;
    --hybrid-button-border-bottom-left-radius: 0;
  }

  hy-button:not(:first-child):not(:last-child) {
    --hybrid-button-border-top-left-radius: 0;
    --hybrid-button-border-top-right-radius: 0;
    --hybrid-button-border-bottom-left-radius: 0;
    --hybrid-button-border-bottom-right-radius: 0;
  }
`;
