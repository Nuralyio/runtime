import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrPanelElement } from './panel.component.js';

export const NrPanel = createComponent({
  tagName: 'nr-panel',
  elementClass: NrPanelElement,
  react: React,
  events: {
    'panel-mode-change': 'onPanelModeChange',
    'panel-close': 'onPanelClose',
    'panel-minimize': 'onPanelMinimize',
    'panel-maximize': 'onPanelMaximize',
    'panel-drag-start': 'onPanelDragStart',
    'panel-drag-end': 'onPanelDragEnd',
    'panel-resize': 'onPanelResize',
  },
});
