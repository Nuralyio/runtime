import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { HyCheckBox } from './checkbox.component.js';

export const HyCheckbox = createComponent({
  tagName: 'hy-checkbox',
  elementClass: HyCheckBox,
  react: React,
  events: {
    change: 'change',
  },
});
