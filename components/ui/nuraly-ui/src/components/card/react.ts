import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrCardElement } from './card.component.js';

export const NrCard = createComponent({
  tagName: 'nr-card',
  elementClass: NrCardElement,
  react: React,
  events: {
    click: 'click',
  },
});
