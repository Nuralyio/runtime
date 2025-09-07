import { createComponent } from '@lit-labs/react';
import * as React from 'react';

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
