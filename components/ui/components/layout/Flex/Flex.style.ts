import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
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
