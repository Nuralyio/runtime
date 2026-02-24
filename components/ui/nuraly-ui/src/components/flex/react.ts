import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrFlexElement } from './flex.component.js';
export const NrFlex = createComponent({
  tagName: 'nr-flex',
  elementClass: NrFlexElement,
  react: React,
  events: {},
});
