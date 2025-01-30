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

  .page-container {
    height: calc(100vh - 120px);
    position: relative;
    
  }
  .mobile.page-container {
    padding-top: 45px;
    border: 16px solid #000;
    border-radius: 40px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
  }

  .page-container.viewer {
    margin-top: 0px;
    height: 100vh;
    width: 100%;
  }

  /* Simulated mobile notch */
  .mobile.page-container::before {
    content: "";
    position: absolute;
    top: -12px;
    left: 50%;
    width: 120px;
    height: 30px;
    background: black;
    border-radius: 20px;
    transform: translateX(-50%);
  }

  @media (prefers-color-scheme: dark) {
    .page-container {
      --hybrid-tabs-content-background-color: #313131;
      background: transparent;
      color: #f8fafc;
    }
  }

  .page-empty-message {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  /* Responsive mobile frame adjustments */
  @media screen and (max-width: 768px) {
    .page-container {
      width: 90vw;
      height: 90vh;
      border-width: 10px;
      border-radius: 30px;
    }

    .page-container.viewer {
      max-width: 90vw;
      max-height: 90vh;
    }
  }
`;

export default [pageStyle];