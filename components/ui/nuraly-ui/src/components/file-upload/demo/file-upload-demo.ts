/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @license
 * Copyright 2023 Google Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */
import { LitElement, css, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import "../file-upload.component";
import { UploadFile } from '../types';

@customElement('hy-file-demo')
export class ElMeenuElement extends LitElement {
  @state() float = 'left';
  @state() uploadProcesses: Map<string, number> = new Map();

  override firstUpdated() {
    // Get reference to the file upload component
    const fileUpload : any = this.shadowRoot?.querySelector('nr-file-upload');
    
    if (fileUpload) {
      // Add event listeners to the component
      fileUpload.addEventListener('file-select', this._handleFileSelect.bind(this));
      fileUpload.addEventListener('file-remove', this._handleFileRemove.bind(this));
      fileUpload.addEventListener('file-exceed', this._handleFileExceed.bind(this));
    }
  }

  private _handleFileSelect(event: CustomEvent) {
    const { files } = event.detail;
    const fileUpload : any= this.shadowRoot?.querySelector('nr-file-upload');
    
    if (!fileUpload) return;
    
    files.forEach((file: UploadFile) => {
      // Update status to 'uploading'
      fileUpload.updateFileStatus(file.uid, 'uploading', 0);
      
      // Simulate upload process with interval
      const intervalId = window.setInterval(() => {
        const currentPercentage = file.percentage || 0;
        const percentage = Math.min(100, currentPercentage + 10);
        
        fileUpload.updateFileStatus(file.uid, 'uploading', percentage);
        
        if (percentage === 100) {
          window.clearInterval(intervalId);
          // Set file as successfully uploaded after a small delay
          setTimeout(() => {
            fileUpload.updateFileStatus(file.uid, 'success');
          }, 300);
          
          // Remove from tracking
          this.uploadProcesses.delete(file.uid);
        }
      }, 500);
      
      // Store the interval ID for potential cancellation
      this.uploadProcesses.set(file.uid, intervalId);
    });
  }

  private _handleFileRemove(event: CustomEvent) {
    const { file } = event.detail;
    console.log(`File removed: ${file.name}`);
    
    // Cancel upload process if it's still running
    if (this.uploadProcesses.has(file.uid)) {
      window.clearInterval(this.uploadProcesses.get(file.uid));
      this.uploadProcesses.delete(file.uid);
    }
  }

  private _handleFileExceed(event: CustomEvent) {
    const { files } = event.detail;
    console.warn(`Upload limit exceeded. Tried to upload ${files.length} additional files.`);
    // Could show a notification or alert here
  }

  protected override render() {
    return html`
      <div class="demo-container">
        <h2>File Upload Demo</h2>
        <nr-file-upload
          accept="image/*"
          multiple
          drag
          limit="5"
          tip="JPG/PNG files up to 500kb">
        </nr-file-upload>
        
        <div class="usage-info">
          <h3>Usage:</h3>
          <ul>
            <li>Drag & drop files here</li>
            <li>Or click to select files</li>
            <li>Files will automatically start uploading</li>
            <li>Use the X button to remove files</li>
            <li>Click on eye icon to preview images</li>
          </ul>
        </div>
      </div>
    `;
  }

  static override styles = [
    css`
      :host {
        width: 800px;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: sans-serif;
      }
      
      .demo-container {
        width: 100%;
        max-width: 700px;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        background-color: #fff;
      }
      
      h2 {
        color: #333;
        margin-top: 0;
      }
      
      .usage-info {
        margin-top: 30px;
        padding: 15px;
        background-color: #f5f5f5;
        border-radius: 6px;
      }
      
      .usage-info h3 {
        margin-top: 0;
        color: #555;
      }
      
      ul {
        padding-left: 20px;
      }
      
      li {
        margin-bottom: 8px;
        color: #666;
      }
    `,
  ];
}
