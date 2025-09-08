import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { ModalComponent } from './modal.component.js';
export const NrInput = createComponent({
  tagName: 'hy-modal',
  elementClass: ModalComponent,
  react: React,
  events: {
    //valueChange: 'valueChange',
  },
});
