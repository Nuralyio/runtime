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
    position: relative;
    background: var(--page-background-color, white);
    --nuraly-tabs-content-padding: 0;
    --nuraly-tabs-border-radius: 8px;
    --nuraly-tabs-container-box-shadow : 0px 0px 5px 0px #dbdbdbbf ;
    --nuraly-tabs-container-background-local-color: transparent;
    --nuraly-tabs-label-active-background-color: transparent;
    margin: auto;
    
  }
  .page-container.viewer {
    margin-top: 0px;
    height: 100vh;
    width: 100%;
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

  
  }


`;

export default [pageStyle];