import { css } from "lit";

const pageStyle = css`
  :host {
    display: block;
  }
  .page-empty-message-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 200px;
    
  }
  .page-container{
    height: 100%;
    margin-top:15px;
  }
  @media (prefers-color-scheme: dark) {
        .page-container {
        --hybrid-tabs-content-background-color: #313131;
      background: #313131;

        color:#f8fafc;
      }
    }
  .page-empty-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

export default [pageStyle];
