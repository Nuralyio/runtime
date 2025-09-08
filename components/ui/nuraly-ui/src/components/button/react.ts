import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrButtonElement } from './button.component.js';
export const NrButton = createComponent({
  tagName: 'nr-button',
  elementClass: NrButtonElement,
  react: React,
  events: {
    click: 'click',
  },
});
