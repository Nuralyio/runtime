import { css } from "lit";

const userInfoStyle = css`
  :host {
    background-color: var(--topbar-bg-color, #00334e);
    height: var(--topbar-height, 60px);
  }
  .user-environment-bar {
    display: flex;
  }
  .user-info {
    margin-left: auto;
  }
`;

export default [userInfoStyle];
