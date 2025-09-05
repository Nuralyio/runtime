import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {HyCollapse} from './hy-collapse.component.js';

export const HyCollapseComponent = createComponent({
  tagName: 'hy-collapse',
  elementClass: HyCollapse,
  react: React,
  events: {
    toggle: 'toggle',
    change: 'change',
  },
});
