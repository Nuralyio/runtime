import * as React from 'react';
import { createComponent } from '@lit-labs/react';
import { NrPopconfirmElement } from './popconfirm.component.js';

export const NrPopconfirm = createComponent({
  tagName: 'nr-popconfirm',
  elementClass: NrPopconfirmElement,
  react: React,
  events: {
    onConfirm: 'nr-confirm',
    onCancel: 'nr-cancel',
    onOpenChange: 'nr-open-change',
  },
});
