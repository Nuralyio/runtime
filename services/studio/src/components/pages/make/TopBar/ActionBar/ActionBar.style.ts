import { css } from "lit";

const actionBarsStyle = css`
  :host {
    color: #323130;
    height: var(--topbar-height, 40px);
    width: 100%;
  }
  .action-bar {
    display: flex;
  }
  .app-action-info {
    margin-left: auto;
  }
`;

export default [actionBarsStyle];
