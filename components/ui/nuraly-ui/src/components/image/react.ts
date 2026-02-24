import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrImageElement } from './image.component.js';

export const NrImage = createComponent({
  tagName: 'nr-image',
  elementClass: NrImageElement,
  react: React,
  events: {
    onLoad: 'nr-image-load',
    onError: 'nr-image-error',
    onPreviewOpen: 'nr-image-preview-open',
    onPreviewClose: 'nr-image-preview-close',
  },
});
