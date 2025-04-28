import { css } from 'lit';

export default css`
  :host {
    display: block;
  }
  
  .pdf-container {
    display: flex;
    flex-direction: column;
    border: 1px solid #ccc;
    border-radius: 4px;
    overflow: hidden;
    background-color: #f5f5f5;
    position: relative;
  }
  
  .toolbar {
    display: flex;
    align-items: center;
    padding: 8px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ddd;
    gap: 8px;
  }
  
  .toolbar button {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .toolbar button:hover {
    background-color: #e6e6e6;
  }
  
  .toolbar button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .toolbar span {
    margin: 0 4px;
    font-size: 14px;
  }
  
  .canvas-container {
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background-color: #e0e0e0;
    padding: 16px;
    min-height: 200px;
  }
  
  canvas {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    background-color: white;
  }
  
  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .preview-content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 90%;
    height: 90%;
    background-color: #f5f5f5;
    border-radius: 8px;
    overflow: hidden;
  }
  
  .preview-toolbar {
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: #f0f0f0;
    border-bottom: 1px solid #ddd;
    gap: 12px;
  }
  
  .preview-toolbar button {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .preview-toolbar span {
    margin: 0 6px;
    font-size: 16px;
  }
  
  .preview-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: transparent;
    border: none;
    font-size: 24px;
    cursor: pointer;
    z-index: 1010;
    color: #333;
  }
  
  .preview-close:hover {
    color: #000;
  }
  
  .preview-modal canvas {
    max-width: 100%;
    max-height: calc(100% - 60px); /* Account for toolbar height */
    object-fit: contain;
    margin: auto;
    display: block;
    flex: 1;
  }
`;