import {createComponent} from '@lit-labs/react';
import * as React from 'react';

export const HyLabel = createComponent({
  tagName: 'hy-label',
  elementClass: class extends HTMLElement {},
  react: React,
  events: {
    click: 'click',
  },
});
