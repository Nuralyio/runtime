import { css } from "lit";

const pageStyle = css`
  :host {
    display: block;
    margin-top: 20px;
  }

  .page-empty-message-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    min-height: 300px;
    gap: 16px;
    padding: 40px;
    padding-top: 120px;
    box-sizing: border-box;
  }

  .empty-state-icon {
    width: 80px;
    height: 80px;
    border: 2px dashed #d0d0d0;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
    transition: all 0.3s ease;
  }

  .empty-state-icon svg {
    width: 32px;
    height: 32px;
    color: #9ca3af;
    transition: all 0.3s ease;
  }

  .page-empty-message-container:hover .empty-state-icon {
    border-color: #a0a0a0;
    background: linear-gradient(135deg, #f5f5f5 0%, #efefef 100%);
    transform: scale(1.02);
  }

  .page-empty-message-container:hover .empty-state-icon svg {
    color: #6b7280;
  }

  .page-container {
    position: relative;
    margin-top : 40px;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    text-align: center;
  }

  .empty-state-title {
    font-size: 16px;
    font-weight: 500;
    color: #374151;
    margin: 0;
  }

  .empty-state-subtitle {
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
    max-width: 240px;
    line-height: 1.5;
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