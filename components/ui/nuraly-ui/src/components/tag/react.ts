import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrTagElement } from './tag.component.js';

export const NrTag = createComponent({
  tagName: 'nr-tag',
  elementClass: NrTagElement,
  react: React,
  events: {
    'nr-tag-close': 'nr-tag-close',
    'nr-tag-checked-change': 'nr-tag-checked-change',
  },
});
