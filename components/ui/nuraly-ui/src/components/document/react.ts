import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrDocumentElement } from './document.component.js';

export const NrDocument = createComponent({
  tagName: 'nr-document',
  elementClass: NrDocumentElement,
  react: React,
  events: {
    onLoad: 'nr-document-load',
    onError: 'nr-document-error',
    onPreviewOpen: 'nr-document-preview-open',
    onPreviewClose: 'nr-document-preview-close',
  },
});
