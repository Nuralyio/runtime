/**
 * @license
 * Copyright 2023 Nuraly, Laabidi Aymen
 * SPDX-License-Identifier: MIT
 */
import { createComponent } from '@lit-labs/react';
import * as React from 'react';
import { NrToastElement } from './toast.component.js';
export const NrToast = createComponent({
  tagName: 'nr-toast',
  elementClass: NrToastElement,
  react: React,
  events: {
    'nr-toast-show': 'nr-toast-show',
    'nr-toast-close': 'nr-toast-close',
    'nr-toast-click': 'nr-toast-click',
  },
});

