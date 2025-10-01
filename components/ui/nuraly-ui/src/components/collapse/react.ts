import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { HyCollapse } from './collapse.component.js';

export const HyCollapseComponent = createComponent({
  tagName: 'nr-collapse',
  elementClass: HyCollapse,
  react: React,
  events: {
    toggle: 'toggle',
    change: 'change',
  },
});
