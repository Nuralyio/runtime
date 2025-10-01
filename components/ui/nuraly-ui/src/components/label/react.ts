import { createComponent } from '@lit-labs/react';
import * as React from 'react';

export const HyLabel = createComponent({
  tagName: 'nr-label',
  elementClass: class extends HTMLElement {},
  react: React,
  events: {
    click: 'click',
  },
});
