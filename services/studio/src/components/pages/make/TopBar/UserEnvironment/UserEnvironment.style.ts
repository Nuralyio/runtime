import { css } from "lit";

const userInfoStyle = css`
  :host {
    height: var(--topbar-height, 50px);
  }
  .user-environment-bar {
    display: flex;
    background-color: var(--topbar-bg-color, #1a1a1a);
  }
  .user-info {
    margin-left: auto;
  }
`;

export default [userInfoStyle];
