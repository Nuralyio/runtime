import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { WorkflowCanvasElement } from './workflow-canvas.component.js';
import { WorkflowNodeElement } from './workflow-node.component.js';

// Legacy canvas component
// Note: Canvas component uses 'nodes-canvas' as tag name, not 'hy-canvas'
export const NodeRedCanvas = createComponent({
  tagName: 'nodes-canvas',
  elementClass: class extends HTMLElement {}, // Canvas component needs proper class export
  react: React,
  events: {
    nodeClick: 'node-click',
    connectionChange: 'connection-change',
  },
});

// Workflow canvas component with full workflow editing capabilities
export const WorkflowCanvas = createComponent({
  tagName: 'workflow-canvas',
  elementClass: WorkflowCanvasElement,
  react: React,
  events: {
    onWorkflowChanged: 'workflow-changed',
    onNodeSelected: 'node-selected',
    onNodeConfigured: 'node-configured',
    onViewportChanged: 'viewport-changed',
  },
});

// Individual workflow node component
export const WorkflowNode = createComponent({
  tagName: 'workflow-node',
  elementClass: WorkflowNodeElement,
  react: React,
  events: {
    onNodeMouseDown: 'node-mousedown',
    onNodeDblClick: 'node-dblclick',
    onPortMouseDown: 'port-mousedown',
    onPortMouseUp: 'port-mouseup',
  },
});
