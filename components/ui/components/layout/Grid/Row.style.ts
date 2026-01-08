import { css } from "lit";

export default css`
  :host {
    display: contents;
  }

  .grid-row {
    display: flex;
    flex-flow: row wrap;
    min-width: 0;
    width: 100%;
  }

  .grid-row.no-wrap {
    flex-wrap: nowrap;
  }

  /* Alignment */
  .grid-row.align-top {
    align-items: flex-start;
  }

  .grid-row.align-middle {
    align-items: center;
  }

  .grid-row.align-bottom {
    align-items: flex-end;
  }

  .grid-row.align-stretch {
    align-items: stretch;
  }

  /* Justify */
  .grid-row.justify-start {
    justify-content: flex-start;
  }

  .grid-row.justify-end {
    justify-content: flex-end;
  }

  .grid-row.justify-center {
    justify-content: center;
  }

  .grid-row.justify-space-around {
    justify-content: space-around;
  }

  .grid-row.justify-space-between {
    justify-content: space-between;
  }

  .grid-row.justify-space-evenly {
    justify-content: space-evenly;
  }

  .empty-message {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 100px;
    border: 2px dashed #ccc;
    color: #999;
    font-size: 14px;
    position: relative;
  }
`;
