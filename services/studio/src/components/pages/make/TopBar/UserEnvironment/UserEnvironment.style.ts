import { css } from "lit";

const userInfoStyle = css`
  :host {
    height: var(--topbar-height, 60px);
  }
  .user-environment-bar {
    display: flex;
    background-color: var(--topbar-bg-color, #00334e);
  }
  .user-info {
    margin-left: auto;
  }
`;

export default [userInfoStyle];
