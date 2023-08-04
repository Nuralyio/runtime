import { css } from "lit";

const pageStyle = css`
  .page-empty-message-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
  }
  .page-empty-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

export default [pageStyle];
