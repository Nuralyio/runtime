import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrInputElement } from './input.component.js';
export const NrInput = createComponent({
  tagName: 'nr-input',
  elementClass: NrInputElement,
  react: React,
  events: {
    nrInput: 'nr-input',
    nrFocus: 'nr-focus',
    nrEnter: 'nr-enter',
    nrCopySuccess: 'nr-copy-success',
    nrCopyError: 'nr-copy-error'
  },
});
