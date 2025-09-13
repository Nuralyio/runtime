import { css } from 'lit';

const cardStyles = css`
  .card {
    background-color: var(--nuraly-card-background-color);
    border-radius: 4px;
    border: var(--nuraly-card-border);
  }

  .card-header {
    font-weight: bold;
    border-bottom: var(--nuraly-card-header-border-bottom);
    padding: var(--nuraly-card-padding);
    background-color: var(--nuraly-card-header-background-color);
    font-size: var(--nuraly-card-font-size);
    color: var(--nuraly-card-header-color);
  }

  .card-content {
    padding: var(--nuraly-card-padding);
    color: var(--nuraly-card-content-color);
    font-size: var(--nuraly-card-font-size);
  }

  .card:hover {
    cursor: pointer;
  }

  .small-card > .card-header,
  .small-card > .card-content {
    padding: var(--nuraly-card-small-padding);
    font-size: var(--nuraly-card-small-font-size);
  }

  .large-card > .card-header,
  .large-card > .card-content {
    padding: var(--nuraly-card-large-padding);
    font-size: var(--nuraly-card-large-font-size);
  }

  :host {
    --nuraly-card-border: 1px solid #e8e8e8;
    --nuraly-card-background-color: #ffffff;
    --nuraly-card-header-background-color: #f5f5f5;
    --nuraly-card-header-border-bottom: 1px solid #e8e8e8;
    --nuraly-card-font-size: 15px;
    --nuraly-card-padding: 13px;
    --nuraly-card-header-color: #000000;
    --nuraly-card-content-color: #000000;

    --nuraly-card-small-font-size: 13px;
    --nuraly-card-small-padding: 8px;

    --nuraly-card-large-font-size: 17px;
    --nuraly-card-large-padding: 16px;
  }
  @media (prefers-color-scheme: dark) {
    :host {
      --nuraly-card-border: 1px solid #404040;
      --nuraly-card-background-color: #383838;
      --nuraly-card-header-background-color: #2e2e2e;
      --nuraly-card-header-border-bottom: 1px solid #404040;
      --nuraly-card-header-color: #ffffff;
      --nuraly-card-content-color: #ffffff;
    }
  }
`;

export const styles = cardStyles;
