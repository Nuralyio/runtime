import { css } from 'lit';

/**
 * Whiteboard Node component styles
 * Miro-style visual elements for the whiteboard canvas
 */
export const whiteboardNodeStyles = css`
  :host {
    display: block;
    position: absolute;
    user-select: none;
    color: var(--nuraly-color-text);

    * {
      transition: all var(--nuraly-transition-fast, 0.15s) ease;
    }
  }

  :host([data-theme]) {
    color: inherit;
  }

  .node-container {
    position: relative;
    cursor: grab;
    font-family: var(--nuraly-font-family);
  }

  .node-container.selected {
    outline: 2px solid var(--nuraly-color-interactive, #3b82f6);
    outline-offset: 4px;
    border-radius: 4px;
  }

  .node-container.dragging {
    cursor: grabbing;
  }

  /* ---- Whiteboard Base ---- */
  .node-container.wb-node {
    min-width: unset;
    min-height: unset;
    padding: 0;
    background: transparent;
    border: none;
    box-shadow: none;
    width: var(--wb-width, 200px);
    height: var(--wb-height, 200px);
    opacity: var(--wb-opacity, 1);
    transform: rotate(var(--wb-rotation, 0deg));
  }

  .node-container.wb-node:hover {
    border: none;
    box-shadow: none;
  }

  .node-container.wb-node.selected {
    border: none;
    outline: 2px solid var(--nuraly-color-interactive, #3b82f6);
    outline-offset: 4px;
    border-radius: 4px;
  }

  .node-container.wb-node.dragging {
    transform: rotate(var(--wb-rotation, 0deg)) scale(1.02);
    filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.2));
  }

  /* ---- Sticky Note ---- */
  .node-container.wb-sticky-note {
    border-radius: 4px;
  }

  .wb-sticky-body {
    width: 100%;
    height: 100%;
    padding: 16px;
    border-radius: 4px;
    box-shadow: 2px 3px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    word-break: break-word;
    white-space: pre-wrap;
    font-size: var(--wb-font-size, 14px);
    line-height: 1.5;
    cursor: grab;
    box-sizing: border-box;
    overflow: hidden;
  }

  .node-container.wb-sticky-note.dragging .wb-sticky-body {
    cursor: grabbing;
    box-shadow: 4px 6px 20px rgba(0, 0, 0, 0.15);
  }

  .node-container.wb-sticky-note.selected .wb-sticky-body {
    box-shadow: 2px 3px 12px rgba(0, 0, 0, 0.08);
  }

  /* ---- Text Block ---- */
  .node-container.wb-text-block {
    background: transparent;
  }

  .wb-text-body {
    width: 100%;
    height: 100%;
    padding: 8px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    word-break: break-word;
    white-space: pre-wrap;
    line-height: 1.5;
    cursor: grab;
    box-sizing: border-box;
  }

  .node-container.wb-text-block.selected {
    outline-offset: 2px;
  }

  /* ---- Shared text ---- */
  .wb-text {
    white-space: pre-wrap;
    word-break: break-word;
    text-align: var(--wb-text-align, left);
    width: 100%;
  }

  .wb-textarea {
    width: 100%;
    height: 100%;
    min-height: 40px;
    padding: 0;
    margin: 0;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    resize: none;
    outline: none;
    overflow: auto;
    text-align: var(--wb-text-align, left);
    line-height: inherit;
  }

  /* ---- Shapes (rectangle, circle, diamond, triangle, star, hexagon) ---- */
  .node-container.wb-shape {
    overflow: visible;
  }

  .wb-shape-body {
    width: 100%;
    height: 100%;
    border-radius: var(--wb-border-radius, 8px);
    border: var(--wb-border-width, 0px) solid var(--wb-border-color, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    box-sizing: border-box;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .node-container.wb-shape.dragging .wb-shape-body {
    cursor: grabbing;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .wb-shape-svg {
    display: block;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }

  .wb-shape-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    font-size: var(--wb-font-size, 14px);
    font-weight: 500;
    pointer-events: none;
    max-width: 80%;
    word-break: break-word;
  }

  /* ---- Line / Arrow ---- */
  .node-container.wb-shape.wb-shape-line {
    height: auto !important;
    min-height: 20px;
    overflow: visible;
  }

  .node-container.wb-shape.wb-shape-line .wb-shape-svg {
    filter: none;
  }

  /* ---- Image ---- */
  .node-container.wb-image {
    overflow: hidden;
    border-radius: 8px;
  }

  .wb-image-body {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    cursor: grab;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: var(--nuraly-color-layer-02, #f4f4f4);
  }

  .wb-image-content {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .wb-image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--nuraly-color-text-secondary, #888);
    font-size: 12px;
  }

  /* ---- Frame ---- */
  .node-container.wb-frame {
    background: rgba(59, 130, 246, 0.04);
    border: 2px dashed rgba(99, 102, 241, 0.3);
    border-radius: 8px;
    overflow: visible;
  }

  .node-container.wb-frame.selected {
    border: 2px dashed var(--nuraly-color-interactive, #3b82f6);
    outline: none;
  }

  .wb-frame-label {
    position: absolute;
    top: -24px;
    left: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--nuraly-color-text-secondary, #888);
    white-space: nowrap;
  }

  .wb-frame-body {
    width: 100%;
    height: 100%;
  }

  /* ---- Voting ---- */
  .wb-voting-body {
    width: 100%;
    height: 100%;
    background: #ffffff;
    border: 2px solid #ef4444;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px;
    cursor: grab;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    box-sizing: border-box;
  }

  .wb-voting-body nr-icon {
    color: #ef4444;
  }

  .wb-voting-text {
    font-size: 14px;
    font-weight: 500;
    color: #1a1a1a;
    text-align: center;
    word-break: break-word;
  }

  /* ---- Mermaid Diagram ---- */
  .node-container.wb-mermaid {
    overflow: visible;
    border-radius: 8px;
  }

  .wb-mermaid-label {
    position: absolute;
    top: -24px;
    left: 0;
    font-size: 12px;
    font-weight: 600;
    color: var(--nuraly-color-text-secondary, #888);
    white-space: nowrap;
  }

  .wb-mermaid-body {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
    cursor: grab;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: var(--nuraly-color-layer-02, #ffffff);
    border: 2px solid #8b5cf6;
    border-color: inherit;
    box-sizing: border-box;
  }

  .wb-mermaid-content {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .wb-mermaid-content svg {
    max-width: 100%;
    max-height: 100%;
  }

  .wb-mermaid-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--nuraly-color-text-secondary, #888);
    font-size: 12px;
  }

  /* ---- Anchor ---- */
  .wb-anchor {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #fffbeb;
    border: 2px dashed #f59e0b;
    border-radius: 24px;
    color: #92400e;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
  }

  .wb-anchor nr-icon {
    color: #f59e0b;
  }

  .wb-anchor-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wb-anchor-input {
    border: none;
    background: transparent;
    font: inherit;
    color: inherit;
    outline: none;
    padding: 0;
    margin: 0;
    width: 100%;
    min-width: 40px;
  }

  /* ---- Whiteboard Ports (hidden, show on hover) ---- */
  .wb-ports-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .node-container.wb-node:hover .wb-ports-container,
  .node-container.wb-node.selected .wb-ports-container {
    opacity: 1;
  }

  /* ---- Whiteboard Resize Handle ---- */
  .wb-resize-handle {
    position: absolute;
    bottom: -5px;
    right: -5px;
    width: 10px;
    height: 10px;
    background: var(--nuraly-color-interactive, #3b82f6);
    border: 2px solid white;
    border-radius: 2px;
    cursor: se-resize;
    z-index: 10;
    transition: transform 0.1s ease;
  }

  .wb-resize-handle:hover {
    transform: scale(1.3);
  }

  /* ---- Ports (reused from workflow-node) ---- */
  .ports-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .port {
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--nuraly-color-border-strong, #4a4a4a);
    border: 1.5px solid var(--nuraly-color-border-interactive, #666);
    cursor: crosshair;
    pointer-events: auto;
    transition: transform var(--nuraly-transition-fast, 0.15s) ease,
                background var(--nuraly-transition-fast, 0.15s) ease,
                border-color var(--nuraly-transition-fast, 0.15s) ease;
    z-index: 10;
  }

  .port:hover {
    transform: scale(1.3);
    background: var(--nuraly-color-border-interactive, #5a5a5a);
  }

  .port.connecting {
    transform: scale(1.4);
    background: var(--nuraly-color-interactive, #3b82f6);
    border-color: var(--nuraly-color-interactive, #3b82f6);
  }

  .port.compatible {
    animation: port-pulse 0.8s infinite;
  }

  @keyframes port-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }

  .port.input {
    left: -4px;
    background: var(--nuraly-color-border-strong, #6b7280);
    border-color: var(--nuraly-color-border-interactive, #525252);
  }

  .port.output {
    right: -4px;
    background: var(--nuraly-color-interactive, #3b82f6);
    border-color: var(--nuraly-color-interactive-emphasis, #2563eb);
  }

  .port-label {
    position: absolute;
    font-size: var(--nuraly-font-size-xxs, 9px);
    color: var(--nuraly-color-text-secondary, #888);
    white-space: nowrap;
    pointer-events: none;
    top: 50%;
    transform: translateY(-50%);
  }

  .port-label.input {
    right: calc(100% + 8px);
  }

  .port-label.output {
    left: calc(100% + 8px);
  }

  /* ---- Remote Collaboration Overlays ---- */
  .remote-overlay-wrapper {
    position: relative;
  }

  .remote-selection-ring {
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 2px dashed var(--remote-selection-color, #3b82f6);
    border-radius: 6px;
    pointer-events: none;
    z-index: 5;
    animation: remote-ring-fade-in 0.2s ease;
  }

  @keyframes remote-ring-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .remote-typing-indicator {
    position: absolute;
    bottom: -24px;
    left: 0;
    font-family: var(--nuraly-font-family);
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    pointer-events: none;
    z-index: 5;
    animation: typing-indicator-pulse 1.5s ease-in-out infinite;
  }

  @keyframes typing-indicator-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .node-container.wb-node.remote-selected {
    outline: 2px dashed var(--remote-selection-color, #3b82f6);
    outline-offset: 4px;
  }
`;

export const styles = whiteboardNodeStyles;
