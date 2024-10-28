import { css } from "lit";

const topbarWrapperStyle = css`
  :host {
    width: 100%;
    height: auto;
  }
  .topbar-wrapper {
    width: 100%;
    height: 100%;
  }
  @media (prefers-color-scheme: dark) {
    micro-app{
      --hybrid-button-ghost-text-color:white;
    }
  }
`;

export default [topbarWrapperStyle];
