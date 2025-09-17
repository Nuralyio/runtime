import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    color: var(--nuraly-color-text);
    background-color: var(--nuraly-color-background);
    font-family: var(--nuraly-card-font-family);
  }

  .card {
    background-color: var(--nuraly-card-background-color);
    border-radius: var(--nuraly-card-border-radius);
    border: var(--nuraly-card-border);
    overflow: hidden;
    transition: var(--nuraly-card-transition);
    box-shadow: var(--nuraly-card-shadow);
  }

  .card:hover {
    cursor: var(--nuraly-card-cursor);
    box-shadow: var(--nuraly-card-hover-shadow);
    background-color: var(--nuraly-card-hover-background-color);
    border-color: var(--nuraly-card-hover-border-color);
  }

  .card__header {
    font-weight: var(--nuraly-card-header-font-weight);
    border-bottom: var(--nuraly-card-header-border-bottom);
    padding: var(--nuraly-card-padding);
    background-color: var(--nuraly-card-header-background-color);
    font-size: var(--nuraly-card-font-size);
    color: var(--nuraly-card-header-color);
    line-height: var(--nuraly-card-line-height);
  }

  .card__content {
    padding: var(--nuraly-card-padding);
    color: var(--nuraly-card-content-color);
    font-size: var(--nuraly-card-font-size);
    line-height: var(--nuraly-card-line-height);
  }

  /* Size variants */
  .card--small .card__header,
  .card--small .card__content {
    padding: var(--nuraly-card-small-padding);
    font-size: var(--nuraly-card-small-font-size);
  }

  .card--large .card__header,
  .card--large .card__content {
    padding: var(--nuraly-card-large-padding);
    font-size: var(--nuraly-card-large-font-size);
  }

  /* Focus styles for accessibility */
  .card:focus-within {
    outline: var(--nuraly-card-focus-outline);
    outline-offset: var(--nuraly-card-focus-offset);
  }
`;
