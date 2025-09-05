import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {HyCardComponent} from './card.component.js';

export const HyCard = createComponent({
  tagName: 'hy-card',
  elementClass: HyCardComponent,
  react: React,
  events: {
    click: 'click',
  },
});
