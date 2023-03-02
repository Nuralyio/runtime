import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {HyButtonElement} from './hy-button.component';
export const ElButton = createComponent({
  tagName: 'hy-button',
  elementClass: HyButtonElement,
  react: React,
  events: {
    click: 'click',
  },
});
