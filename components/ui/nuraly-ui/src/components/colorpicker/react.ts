import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { ColorPicker } from './color-picker.component.js';

export const HyColorPicker = createComponent({
  tagName: 'hy-color-picker',
  elementClass: ColorPicker,
  react: React,
  events: {
    colorChange: 'color-change',
    change: 'change',
  },
});
