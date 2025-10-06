import { css } from 'lit';

/**
 * Row component styles for the Grid system
 * Using shared CSS variables from /src/shared/themes/
 */
export const styles = css`
  :host {
    display: block;
    width: 100%;
  }

  .nr-row {
    display: flex;
    flex-flow: row wrap;
    min-width: 0;
    
    /* Theme-aware */
    color: var(--nuraly-color-text);
  }

  /* Wrap control */
  .nr-row[data-wrap="false"] {
    flex-wrap: nowrap;
  }

  /* Horizontal alignment (justify-content) */
  .nr-row[data-justify="start"] {
    justify-content: flex-start;
  }

  .nr-row[data-justify="end"] {
    justify-content: flex-end;
  }

  .nr-row[data-justify="center"] {
    justify-content: center;
  }

  .nr-row[data-justify="space-around"] {
    justify-content: space-around;
  }

  .nr-row[data-justify="space-between"] {
    justify-content: space-between;
  }

  .nr-row[data-justify="space-evenly"] {
    justify-content: space-evenly;
  }

  /* Vertical alignment (align-items) */
  .nr-row[data-align="top"] {
    align-items: flex-start;
  }

  .nr-row[data-align="middle"] {
    align-items: center;
  }

  .nr-row[data-align="bottom"] {
    align-items: flex-end;
  }

  .nr-row[data-align="stretch"] {
    align-items: stretch;
  }
`;
