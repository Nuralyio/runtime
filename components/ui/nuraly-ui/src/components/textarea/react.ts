import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrTextareaElement } from './textarea.component.js';

export const NrTextarea = createComponent({
  tagName: 'nr-textarea',
  elementClass: NrTextareaElement,
  react: React,
  events: {
    nrTextareaChange: 'nr-textarea-change',
    nrFocus: 'nr-focus',
    nrBlur: 'nr-blur',
    nrClear: 'nr-clear',
    nrResize: 'nr-resize'
  },
});