import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrRowElement } from './row.component.js';
import { NrColElement } from './col.component.js';
export const NrRow = createComponent({
  tagName: 'nr-row',
  elementClass: NrRowElement,
  react: React,
  events: {},
});
export const NrCol = createComponent({
  tagName: 'nr-col',
  elementClass: NrColElement,
  react: React,
  events: {},
});
