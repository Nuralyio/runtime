import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrMenuElement } from './menu.component.js';
export const NrMenu = createComponent({
  tagName: 'nr-menu',
  elementClass: NrMenuElement,
  react: React,
  events: {
    change: 'change',
  },
});
