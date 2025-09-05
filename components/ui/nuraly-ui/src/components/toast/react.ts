import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {LitToast} from './toast.component.js';

export const HyToast = createComponent({
  tagName: 'hy-toast',
  elementClass: LitToast,
  react: React,
  events: {
    close: 'close',
  },
});
