import { css } from 'lit';

/**
 * Flex component styles
 * Using shared CSS variables from /src/shared/themes/
 */
export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  .nr-flex {
    display: flex;
    box-sizing: border-box;
    
    /* Theme-aware */
    color: var(--nuraly-color-text);
  }

  /* Inline flex */
  .nr-flex[data-inline="true"] {
    display: inline-flex;
  }

  /* Flex direction */
  .nr-flex[data-direction="row"] {
    flex-direction: row;
  }

  .nr-flex[data-direction="row-reverse"] {
    flex-direction: row-reverse;
  }

  .nr-flex[data-direction="column"] {
    flex-direction: column;
  }

  .nr-flex[data-direction="column-reverse"] {
    flex-direction: column-reverse;
  }

  /* Flex wrap */
  .nr-flex[data-wrap="nowrap"] {
    flex-wrap: nowrap;
  }

  .nr-flex[data-wrap="wrap"] {
    flex-wrap: wrap;
  }

  .nr-flex[data-wrap="wrap-reverse"] {
    flex-wrap: wrap-reverse;
  }

  /* Justify content */
  .nr-flex[data-justify="flex-start"] {
    justify-content: flex-start;
  }

  .nr-flex[data-justify="flex-end"] {
    justify-content: flex-end;
  }

  .nr-flex[data-justify="center"] {
    justify-content: center;
  }

  .nr-flex[data-justify="space-between"] {
    justify-content: space-between;
  }

  .nr-flex[data-justify="space-around"] {
    justify-content: space-around;
  }

  .nr-flex[data-justify="space-evenly"] {
    justify-content: space-evenly;
  }

  /* Align items */
  .nr-flex[data-align="flex-start"] {
    align-items: flex-start;
  }

  .nr-flex[data-align="flex-end"] {
    align-items: flex-end;
  }

  .nr-flex[data-align="center"] {
    align-items: center;
  }

  .nr-flex[data-align="baseline"] {
    align-items: baseline;
  }

  .nr-flex[data-align="stretch"] {
    align-items: stretch;
  }
`;
