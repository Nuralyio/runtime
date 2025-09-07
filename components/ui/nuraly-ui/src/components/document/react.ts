import { createComponent } from '@lit-labs/react';
import * as React from 'react';

export const HyDocument = createComponent({
  tagName: 'hy-document',
  elementClass: class extends HTMLElement {},
  react: React,
  events: {
    documentChange: 'document-change',
  },
});
