import { css } from "lit";

export default css`
  :host {
    display: contents;
  }

  .grid-col {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    min-height: 1px;
  }

  .empty-message {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: 60px;
    border: 1px dashed #ccc;
    color: #999;
    font-size: 12px;
    position: relative;
    background: rgba(0, 0, 0, 0.02);
  }
`;
