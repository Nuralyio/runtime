import { css } from "lit";

const actionBarsStyle = css`
  :host {
    background-color: var(--topbar-bg-color, white);
    color: #323130;
    height: var(--topbar-height, 40px);
  }
  .action-bar {
    display: flex;
  }
  .app-action-info {
    margin-left: auto;
  }
`;

export default [actionBarsStyle];
