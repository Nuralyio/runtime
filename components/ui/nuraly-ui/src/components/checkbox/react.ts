import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrCheckboxElement } from './checkbox.component.js';

export const NrCheckbox = createComponent({
  tagName: 'nr-checkbox',
  elementClass: NrCheckboxElement,
  react: React,
  events: {
    'nr-change': 'nr-change',
  },
});
