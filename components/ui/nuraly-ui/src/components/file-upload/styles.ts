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
  transition: border-color 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.upload-dragger:hover {
  border-color: #409eff;
}
.upload-dragger.is-dragover {
  background-color: rgba(64, 158, 255, 0.06);
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
  padding: 0 12px;
}
.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 7px;
  padding: 0 12px;
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
  width: 100%;
}
.file-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  transition: all 0.3s;
  padding: 8px;
  border-radius: 4px;
  gap: 10px; /* Add consistent spacing between items */
}
.file-item:hover {
  background-color: #f8f9fa;
}
.file-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  min-width: 0;
}
.file-size {
  color: #909399;
  font-size: 12px;
  flex-shrink: 0; /* Prevent shrinking */
}
.file-status {
  display: flex;
  align-items: center;
  flex-shrink: 0; /* Prevent shrinking */
}
.file-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0; /* Prevent shrinking */
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

/* Progress bar styles - fixed to ensure full width */
.progress-bar {
  height: 2px;
  width: 100%;
  background-color: #e6e6e6;
  margin-top: 4px;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
}
.progress-inner {
  height: 100%;
  background-color: #409eff;
  position: absolute;
  left: 0;
  top: 0;
  transition: width 0.3s ease;
}

/* Progress percentage indicator */
.progress-percentage {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 12px;
  color: #409eff;
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

/* File item container with progress bar */
.file-container {
  width: 100%;
  position: relative;
}

/* Responsive styles */
@media (max-width: 600px) {
  .upload-dragger {
    height: 140px;
    padding: 12px;
  }
  .upload-icon {
    font-size: 24px;
  }
  .upload-text,
  .upload-tip {
    font-size: 13px;
  }
  .file-item {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-areas: 
      "icon filename"
      "size status"
      "progress progress"
      "actions actions";
    gap: 4px 8px;
    align-items: center;
  }
  .file-item > svg:first-child {
    grid-area: icon;
    align-self: start;
  }
  .file-name {
    grid-area: filename;
    margin: 0;
    padding: 2px 0;
  }
  .file-size {
    grid-area: size;
    margin: 0;
  }
  .file-status {
    grid-area: status;
    justify-self: end;
  }
  .progress-bar {
    grid-area: progress;
    width: 100%;
  }
  .file-actions {
    grid-area: actions;
    margin: 4px 0 0 0;
    justify-content: flex-end;
    width: 100%;
  }
  .upload-button {
    width: 100%;
    font-size: 16px;
  }
}
`;