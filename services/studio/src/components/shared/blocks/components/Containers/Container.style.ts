import { css } from "lit";

export default css`
  .container {
    display: flex;
    min-width: 180px;
    width: 100%;
    min-height: 300px;
    flex-wrap: wrap;
  }
  .drag-over {
    border: 1px dashed #c439ff;
  }

  .drop-zone {
    width: 50px;
    height: 100%;
    display: none;
    border: 2px dashed rgb(110 110 110);
    z-index: -4;
  }
  .drop-zone-end-of-container-vertical {
    margin-top: auto;
  }
  .drop-zone-end-of-container-horizontal {
    margin-left: auto;
  }
  .vertical {
    flex-direction: column;
  }
  .empty-message-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
`;
