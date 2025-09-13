import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { HyIconElement } from './icon.component.js';
export const HyIcon = createComponent({
  tagName: 'nr-icon',
  elementClass: HyIconElement,
  react: React,
});
