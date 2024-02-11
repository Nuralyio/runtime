import { css } from "lit";

const appActionStyle = css`
  .app-action-wrapper {
    margin: 0 10px 0 10px;
    height: 40px;
    display: flex;
    align-items: center;
  }
  .app-action-icon:hover {
    opacity: 0.9;
    cursor: pointer;
  }

  .app-action-wrapper * {
    margin: 0 5px 0 0;
  }
`;

export default [appActionStyle];
