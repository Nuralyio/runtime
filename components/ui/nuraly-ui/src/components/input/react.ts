import {createComponent} from '@lit-labs/react';
import * as React from 'react';
import {HyInputElement} from './input.component';
export const HyInput = createComponent({
  tagName: 'hy-input',
  elementClass: HyInputElement,
  react: React,
  events: {
    inputed: 'inputed',
  },
});
