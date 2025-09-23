import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrModalElement } from './modal.component.js';

export const NrModal = createComponent({
  tagName: 'nr-modal',
  elementClass: NrModalElement,
  react: React,
  events: {
    'modal-open': 'onModalOpen',
    'modal-close': 'onModalClose',
    'modal-before-close': 'onModalBeforeClose',
    'modal-after-open': 'onModalAfterOpen',
    'modal-escape': 'onModalEscape',
  },
});
