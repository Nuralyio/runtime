import { css } from "lit";

export default css`
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .workflow-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .workflow-wrapper workflow-canvas {
    width: 100%;
    height: 100%;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
  }

  .workflow-wrapper.placeholder,
  .workflow-wrapper.loading,
  .workflow-wrapper.error {
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #64748b;
  }

  .placeholder-icon {
    font-size: 24px;
  }

  .placeholder-text {
    font-size: 13px;
    font-weight: 500;
  }

  .canvas-loading,
  .canvas-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #64748b;
    font-size: 13px;
  }

  .loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .canvas-error {
    color: #dc2626;
  }

  /* Dark mode styles */
  @media (prefers-color-scheme: dark) {
    .workflow-wrapper.placeholder {
      background: #1e293b;
    }

    .placeholder-content {
      color: #94a3b8;
    }

    .canvas-loading {
      color: #94a3b8;
    }

    .loading-spinner {
      border-color: #334155;
      border-top-color: #3b82f6;
    }

    .canvas-error {
      color: #fca5a5;
    }
  }
`;
