import { css } from "lit";

const screenActionStyle = css`
  .screen-action-wrapper {
    margin: 0 10px 0 10px;
    height: 40px;
    display: flex;
    align-items: center;
  }
  .screen-action-icon:hover {
    opacity: 0.9;
    cursor: pointer;
  }

  .screen-action-wrapper * {
    margin: 0 5px 0 0;
  }
`;

export default [screenActionStyle];
