import * as React from 'react';
import { createComponent } from '@lit-labs/react';

import { HySelectComponent } from './select.component.js';

export const HySelect = createComponent({
  tagName: 'hy-select',
  elementClass: HySelectComponent,
  react: React,
  events: {
    onChange: 'change',
    onInput: 'input',
    onFocus: 'focus',
    onBlur: 'blur',
  },
});