import {css} from 'lit';

const cardStyles = css`
  .card {
    background-color: var(--hybrid-card-background-color);
    border-radius: 4px;
    border: var(--hybrid-card-border);
  }

  .card-header {
    font-weight: bold;
    border-bottom: var(--hybrid-card-header-border-bottom);
    padding: var(--hybrid-card-padding);
    background-color: var(--hybrid-card-header-background-color);
    font-size: var(--hybrid-card-font-size);
    color: var(--hybrid-card-header-color);
  }

  .card-content {
    padding: var(--hybrid-card-padding);
    color: var(--hybrid-card-content-color);
    font-size: var(--hybrid-card-font-size);
  }

  .card:hover {
    cursor: pointer;
  }

  .small-card > .card-header,
  .small-card > .card-content {
    padding: var(--hybrid-card-small-padding);
    font-size: var(--hybrid-card-small-font-size);
  }

  .large-card > .card-header,
  .large-card > .card-content {
    padding: var(--hybrid-card-large-padding);
    font-size: var(--hybrid-card-large-font-size);
  }

  :host {
    --hybrid-card-border: 1px solid #e8e8e8;
    --hybrid-card-background-color: #ffffff;
    --hybrid-card-header-background-color: #f5f5f5;
    --hybrid-card-header-border-bottom: 1px solid #e8e8e8;
    --hybrid-card-font-size: 15px;
    --hybrid-card-padding: 13px;
    --hybrid-card-header-color: #000000;
    --hybrid-card-content-color: #000000;

    --hybrid-card-small-font-size: 13px;
    --hybrid-card-small-padding: 8px;

    --hybrid-card-large-font-size: 17px;
    --hybrid-card-large-padding: 16px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --hybrid-card-border: 1px solid #404040;
      --hybrid-card-background-color: #383838;
      --hybrid-card-header-background-color: #2e2e2e;
      --hybrid-card-header-border-bottom: 1px solid #404040;
      --hybrid-card-header-color: #ffffff;
      --hybrid-card-content-color: #ffffff;
    }
  }
`;

export const styles = cardStyles;
