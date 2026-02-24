import { css } from "lit";

export default css`
  :host {
    display: inline-block;
    box-sizing: border-box;
  }

  :host([block]) {
    display: block;
  }

  .video-container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: var(--nuraly-video-bg, #000);
  }

  video {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: var(--nuraly-video-border-radius, 4px);
  }

  .video--error {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background-color: var(--nuraly-video-error-bg, #f5f5f5);
    color: var(--nuraly-video-error-color, #999);
  }

  .error-message {
    text-align: center;
    padding: 20px;
  }

  .error-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    opacity: 0.5;
  }

  /* Preview/Fullscreen Modal */
  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--nuraly-video-preview-bg, rgba(0, 0, 0, 0.95));
    z-index: var(--nuraly-video-preview-zindex, 1000);
    animation: fadeIn 0.3s ease;
  }

  .preview-modal video {
    max-width: 90%;
    max-height: 90%;
    border-radius: var(--nuraly-video-preview-border-radius, 4px);
  }

  .preview-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 40px;
    height: 40px;
    background: var(--nuraly-video-preview-close-bg, rgba(255, 255, 255, 0.2));
    border: none;
    border-radius: 50%;
    color: var(--nuraly-video-preview-close-color, white);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    outline: none;
  }

  .preview-close:hover {
    background: var(--nuraly-video-preview-close-hover-bg, rgba(255, 255, 255, 0.3));
  }

  .preview-button {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: var(--nuraly-video-fullscreen-btn-bg, rgba(0, 0, 0, 0.5));
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    cursor: pointer;
    color: var(--nuraly-video-fullscreen-btn-color, white);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: background-color 0.3s ease;
    z-index: 10;
  }

  .preview-button:hover {
    background-color: var(--nuraly-video-fullscreen-btn-hover-bg, rgba(0, 0, 0, 0.7));
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;
