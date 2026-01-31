import { css } from 'lit';
export const styles = css`
:host {
  display: block;
  font-family: var(--nuraly-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
}
.upload {
  width: 100%;
}
.upload-dragger {
  background-color: var(--nuraly-color-surface, #f8f9fa);
  border: 1px dashed var(--nuraly-color-border, #d9d9d9);
  border-radius: var(--nuraly-border-radius-md, 6px);
  box-sizing: border-box;
  width: 100%;
  height: 180px;
  text-align: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color var(--nuraly-transition-normal, 0.3s);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.upload-dragger:hover {
  border-color: var(--nuraly-color-primary, #409eff);
}
.upload-dragger.is-dragover {
  background-color: var(--nuraly-color-background-hover, rgba(64, 158, 255, 0.06));
  border-color: var(--nuraly-color-primary, #409eff);
}
.upload-icon {
  font-size: 28px;
  color: var(--nuraly-color-text-tertiary, #c0c4cc);
  margin-bottom: 8px;
}
.upload-text {
  color: var(--nuraly-color-text-secondary, #606266);
  font-size: var(--nuraly-font-size-02, 14px);
  text-align: center;
  padding: 0 12px;
}
.upload-tip {
  font-size: var(--nuraly-font-size-01, 12px);
  color: var(--nuraly-color-text-tertiary, #909399);
  margin-top: 7px;
  padding: 0 12px;
}
.upload-button {
  padding: 8px 16px;
  background-color: var(--nuraly-color-primary, #409eff);
  color: var(--nuraly-color-text-on-color, white);
  border: none;
  border-radius: var(--nuraly-border-radius-sm, 4px);
  cursor: pointer;
  font-size: var(--nuraly-font-size-02, 14px);
  transition: background-color var(--nuraly-transition-normal, 0.3s);
}
.upload-button:hover {
  background-color: var(--nuraly-color-primary-hover, #66b1ff);
}
.file-list {
  margin-top: 10px;
  width: 100%;
}
.file-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  transition: all var(--nuraly-transition-normal, 0.3s);
  padding: 8px;
  border-radius: var(--nuraly-border-radius-sm, 4px);
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
  flex-wrap: nowrap;
  overflow: hidden;
  max-width: 100%;
}
.file-item:hover {
  background-color: var(--nuraly-color-surface-hover, #f8f9fa);
}
.file-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--nuraly-color-text-secondary, #606266);
  min-width: 0;
  max-width: 100%;
  word-break: break-all;
  width: 0;
}
.file-size {
  color: var(--nuraly-color-text-tertiary, #909399);
  font-size: var(--nuraly-font-size-01, 12px);
  flex-shrink: 0;
  margin-left: 8px;
  white-space: nowrap;
}
.file-status {
  display: flex;
  align-items: center;
  flex-shrink: 0;
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
  color: var(--nuraly-color-text-tertiary, #909399);
}
.file-actions button:hover {
  color: var(--nuraly-color-primary, #409eff);
}

/* Dark theme support - using data-theme attribute */
/* Support both :host-context (ancestor) and :host (direct) patterns */

/* Upload dragger - dark theme */
:host-context([data-theme*="dark"]) .upload-dragger,
:host([data-theme*="dark"]) .upload-dragger {
  background-color: var(--nuraly-color-layer-01, #262626);
  border-color: var(--nuraly-color-border-subtle, #525252);
}
:host-context([data-theme*="dark"]) .upload-dragger:hover,
:host([data-theme*="dark"]) .upload-dragger:hover {
  border-color: var(--nuraly-color-button-primary, #78a9ff);
}
:host-context([data-theme*="dark"]) .upload-dragger.is-dragover,
:host([data-theme*="dark"]) .upload-dragger.is-dragover {
  background-color: rgba(120, 169, 255, 0.1);
  border-color: var(--nuraly-color-button-primary, #78a9ff);
}

/* Upload icon - dark theme */
:host-context([data-theme*="dark"]) .upload-icon,
:host([data-theme*="dark"]) .upload-icon {
  color: var(--nuraly-color-text-secondary, #8d8d8d);
}

/* Upload text - dark theme */
:host-context([data-theme*="dark"]) .upload-text,
:host([data-theme*="dark"]) .upload-text {
  color: var(--nuraly-color-text-primary, #f4f4f4);
}

/* Upload tip - dark theme */
:host-context([data-theme*="dark"]) .upload-tip,
:host([data-theme*="dark"]) .upload-tip {
  color: var(--nuraly-color-text-secondary, #8d8d8d);
}

/* File item - dark theme */
:host-context([data-theme*="dark"]) .file-item,
:host([data-theme*="dark"]) .file-item {
  background-color: var(--nuraly-color-layer-01, #262626);
  border-radius: var(--nuraly-border-radius-sm, 4px);
}
:host-context([data-theme*="dark"]) .file-item:hover,
:host([data-theme*="dark"]) .file-item:hover {
  background-color: var(--nuraly-color-layer-hover-01, #393939);
}

/* File name - dark theme */
:host-context([data-theme*="dark"]) .file-name,
:host([data-theme*="dark"]) .file-name {
  color: var(--nuraly-color-text-primary, #f4f4f4);
}

/* File size - dark theme */
:host-context([data-theme*="dark"]) .file-size,
:host([data-theme*="dark"]) .file-size {
  color: var(--nuraly-color-text-secondary, #8d8d8d);
}

/* File actions - dark theme */
:host-context([data-theme*="dark"]) .file-actions button,
:host([data-theme*="dark"]) .file-actions button {
  color: var(--nuraly-color-text-secondary, #8d8d8d);
}
:host-context([data-theme*="dark"]) .file-actions button:hover,
:host([data-theme*="dark"]) .file-actions button:hover {
  color: var(--nuraly-color-button-primary, #78a9ff);
}

/* File item SVG icons - dark theme */
:host-context([data-theme*="dark"]) .file-item > svg,
:host([data-theme*="dark"]) .file-item > svg {
  color: var(--nuraly-color-text-secondary, #8d8d8d);
}

/* Progress bar - dark theme */
:host-context([data-theme*="dark"]) .progress-bar,
:host([data-theme*="dark"]) .progress-bar {
  background-color: var(--nuraly-color-border-subtle, #525252);
}

/* Preview modal - dark theme */
:host-context([data-theme*="dark"]) .preview-modal,
:host([data-theme*="dark"]) .preview-modal {
  background-color: rgba(0, 0, 0, 0.85);
}

/* Progress bar styles - fixed to ensure full width */
.progress-bar {
  height: 2px;
  width: 100%;
  background-color: var(--nuraly-color-border, #e6e6e6);
  margin-top: 4px;
  position: relative;
  border-radius: 2px;
  overflow: hidden;
}
.progress-inner {
  height: 100%;
  background-color: var(--nuraly-color-primary, #409eff);
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
  font-size: var(--nuraly-font-size-01, 12px);
  color: var(--nuraly-color-primary, #409eff);
}

.hidden {
  display: none;
}
.success {
  color: var(--nuraly-color-success, #67c23a);
}
.error {
  color: var(--nuraly-color-danger, #f56c6c);
}
.icon-delete {
  color: var(--nuraly-color-danger, #f56c6c);
}
.file-preview {
  width: 100%;
  margin-top: 4px;
}
.image-preview {
  display: block;
  max-width: 100%;
  max-height: 200px;
  border-radius: var(--nuraly-border-radius-sm, 4px);
  object-fit: contain;
  cursor: zoom-in;
}
.preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--nuraly-color-background-overlay, rgba(0, 0, 0, 0.7));
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--nuraly-z-modal, 1000);
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
  color: var(--nuraly-color-text-inverse, white);
  font-size: 30px;
  background: none;
  border: none;
  cursor: pointer;
}
.preview-icon {
  padding: 4px;
  color: var(--nuraly-color-primary, #409eff);
  cursor: zoom-in;
}

/* File item container with progress bar */
.file-container {
  width: 100%;
  position: relative;
  overflow: hidden; /* Prevent child overflow */
}

/* Responsive styles */
@media (max-width: 600px) {
  .upload-dragger {
    height: 140px;
    padding: var(--nuraly-spacing-04, 12px);
  }
  .upload-icon {
    font-size: 24px;
  }
  .upload-text,
  .upload-tip {
    font-size: var(--nuraly-font-size-01, 13px);
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
    padding: var(--nuraly-spacing-03, 8px);
    width: 100%;
    box-sizing: border-box;
    overflow: hidden; /* Hide content that overflows */
  }
  .file-item > svg:first-child {
    grid-area: icon;
    align-self: start;
  }
  .file-name {
    grid-area: filename;
    margin: 0;
    padding: 2px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 0; /* Force shrinking to minimum width */
    max-width: 100%; /* Ensure it doesn't exceed its container */
    word-break: break-all; /* Break extremely long words if necessary */
    flex: 1; /* Take available space */
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
    font-size: var(--nuraly-font-size-03, 16px);
  }
}
`;