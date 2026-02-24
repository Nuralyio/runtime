import { createComponent } from '@lit-labs/react';
import * as React from 'react';

export const HySliderInput = createComponent({
  tagName: 'nr-slider-input',
  elementClass: class extends HTMLElement {},
  react: React,
  events: {
    change: 'change',
    input: 'input',
  },
});
