import {createComponent} from '@lit-labs/react';
import * as React from 'react';

export const HyImage = createComponent({
  tagName: 'hy-image',
  elementClass: class extends HTMLElement {},
  react: React,
  events: {
    load: 'load',
    error: 'error',
  },
});
