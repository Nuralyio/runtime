import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {HyButtonElement} from './hy-button.component.js';
export const HyButton = createComponent({
  tagName: 'hy-button',
  elementClass: HyButtonElement,
  react: React,
  events: {
    click: 'click',
  },
});
