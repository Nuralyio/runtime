import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }

  .upload {
    width: 100%;
  }

  .upload-dragger {
    background-color: #f8f9fa;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    box-sizing: border-box;
    width: 100%;
    height: 180px;
    text-align: center;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color .3s;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .upload-dragger:hover {
    border-color: #409eff;
  }

  .upload-dragger.is-dragover {
    background-color: rgba(64, 158, 255, .06);
    border-color: #409eff;
  }

  .upload-icon {
    font-size: 28px;
    color: #c0c4cc;
    margin-bottom: 8px;
  }

  .upload-text {
    color: #606266;
    font-size: 14px;
    text-align: center;
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 7px;
  }

  .upload-button {
    padding: 8px 16px;
    background-color: #409eff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
  }

  .upload-button:hover {
    background-color: #66b1ff;
  }

  .file-list {
    margin-top: 10px;
  }

  .file-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    transition: all .3s;
    padding: 8px;
    border-radius: 4px;
  }

  .file-item:hover {
    background-color: #f8f9fa;
  }

  .file-name {
    margin-left: 6px;
    flex: 1;
    color: #606266;
  }

  .file-size {
    color: #909399;
    font-size: 12px;
    margin-right: 10px;
  }

  .file-status {
    display: flex;
    align-items: center;
  }

  .file-actions {
    margin-left: 10px;
    display: flex;
    gap: 4px;
  }

  .file-actions button {
    background: none;
    border: none;
    padding: 4px;
    cursor: pointer;
    color: #909399;
  }

  .file-actions button:hover {
    color: #409eff;
  }

  .progress-bar {
    height: 2px;
    width: 100%;
    background-color: #e6e6e6;
    margin-top: 4px;
  }

  .progress-inner {
    height: 100%;
    background-color: #409eff;
    transition: width .3s;
  }

  .hidden {
    display: none;
  }

  .success {
    color: #67c23a;
  }

  .error {
    color: #f56c6c;
  }

  .icon-delete {
    color: #f56c6c;
  }

  .file-preview {
    width: 100%;
    margin-top: 4px;
  }

  .image-preview {
    display: block;
    max-width: 100%;
    max-height: 200px;
    border-radius: 4px;
    object-fit: contain;
    cursor: zoom-in;
  }

  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .preview-modal img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  }

  .preview-close {
    position: absolute;
    top: 20px;
    right: 20px;
    color: white;
    font-size: 30px;
    background: none;
    border: none;
    cursor: pointer;
  }

  .preview-icon {
    padding: 4px;
    color: #409eff;
    cursor: zoom-in;
  }
`;