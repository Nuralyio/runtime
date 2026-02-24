import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrContainerElement } from './container.component.js';

export const NrContainer = createComponent({
  tagName: 'nr-container',
  elementClass: NrContainerElement,
  react: React,
  events: {},
});
